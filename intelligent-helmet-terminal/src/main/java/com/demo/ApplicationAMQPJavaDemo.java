package com.demo;

import com.demo.model.SensorData;
import com.demo.service.SensorDataService;
import com.demo.websocket.SensorDataWebSocketHandler;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.qpid.jms.JmsConnection;
import org.apache.qpid.jms.JmsConnectionFactory;
import org.apache.qpid.jms.JmsConnectionListener;
import org.apache.qpid.jms.message.JmsInboundMessageDispatch;
import org.apache.qpid.jms.transports.TransportOptions;
import org.apache.qpid.jms.transports.TransportSupport;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

import javax.jms.*;
import javax.naming.Context;
import javax.naming.InitialContext;
import java.net.URI;
import java.util.Hashtable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@SpringBootApplication
public class ApplicationAMQPJavaDemo {
    private final static ExecutorService executorService = new ThreadPoolExecutor(
            Runtime.getRuntime().availableProcessors(), Runtime.getRuntime().availableProcessors() * 2,
            60, TimeUnit.SECONDS, new LinkedBlockingQueue<>(5000));

    private static ApplicationContext applicationContext;
    private static SensorDataService sensorDataService;
    private static SensorDataWebSocketHandler webSocketHandler;

    // AMQP 连接状态管理
    private static Connection amqpConnection = null;
    private static Session amqpSession = null;
    private static MessageConsumer amqpConsumer = null;
    private static final AtomicBoolean isReconnecting = new AtomicBoolean(false);
    private static final int MAX_RECONNECT_DELAY = 30000; // 最大重连间隔30秒

    public static void main(String[] args) throws Exception {
        applicationContext = SpringApplication.run(ApplicationAMQPJavaDemo.class, args);
        sensorDataService = applicationContext.getBean(SensorDataService.class);
        webSocketHandler = applicationContext.getBean(SensorDataWebSocketHandler.class);

        System.out.println("Spring Boot 应用已启动，开始连接AMQP...");

        connectToAMQP();
    }

    private static void connectToAMQP() {
        try {
            // 每次连接都用新的时间戳，防止华为云token过期
            String accessKey = "6xQi6Cwu";
            long timeStamp = System.currentTimeMillis();
            String userName = "accessKey=" + accessKey + "|timestamp=" + timeStamp;
            String password = "koyK4wNbUcwuxrBOL9VB3yiTSxEdz6Wj";
            String baseUrl = "2141638e20.st1.iotda-app.cn-south-1.myhuaweicloud.com";
            // idleTimeout 从 8000 提升到 120000（2分钟），防止短暂无数据就断连
            String connectionUrl = "amqps://" + baseUrl + ":5671?amqp.vhost=default&amqp.idleTimeout=120000&amqp.saslMechanisms=PLAIN";

            Hashtable<String, String> hashtable = new Hashtable<>();
            hashtable.put("connectionfactory.HwConnectionURL", connectionUrl);
            String queueName = "DefaultQueue";
            hashtable.put("queue.HwQueueName", queueName);
            hashtable.put(Context.INITIAL_CONTEXT_FACTORY, "org.apache.qpid.jms.jndi.JmsInitialContextFactory");

            Context context = new InitialContext(hashtable);
            JmsConnectionFactory cf = (JmsConnectionFactory) context.lookup("HwConnectionURL");
            Destination queue = (Destination) context.lookup("HwQueueName");

            TransportOptions to = new TransportOptions();
            to.setTrustAll(true);
            cf.setSslContext(TransportSupport.createJdkSslContext(to));

            // 先清理旧连接
            closeAmqpResources();

            Connection connection = cf.createConnection(userName, password);
            ((JmsConnection) connection).addConnectionListener(myJmsConnectionListener);

            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            connection.start();

            MessageConsumer consumer = session.createConsumer(queue);
            consumer.setMessageListener(messageListener);

            // 保存引用
            amqpConnection = connection;
            amqpSession = session;
            amqpConsumer = consumer;

            System.out.println("========================================");
            System.out.println("AMQP 连接成功! timestamp=" + timeStamp);
            System.out.println("idleTimeout=120000ms, 等待设备数据...");
            System.out.println("========================================");

            // 通知前端 WebSocket 客户端
            if (webSocketHandler != null) {
                webSocketHandler.broadcastStatus("AMQP已连接，等待设备数据");
            }

        } catch (Exception e) {
            System.err.println("AMQP 连接失败: " + e.getMessage());
            e.printStackTrace();
            // 连接失败也要尝试重连
            scheduleReconnect(5000);
        }
    }

    /**
     * 关闭旧的 AMQP 资源
     */
    private static void closeAmqpResources() {
        try {
            if (amqpConsumer != null) { amqpConsumer.close(); amqpConsumer = null; }
        } catch (Exception e) { /* 忽略关闭异常 */ }
        try {
            if (amqpSession != null) { amqpSession.close(); amqpSession = null; }
        } catch (Exception e) { /* 忽略关闭异常 */ }
        try {
            if (amqpConnection != null) { amqpConnection.close(); amqpConnection = null; }
        } catch (Exception e) { /* 忽略关闭异常 */ }
    }

    /**
     * 延迟重连（防止短时间疯狂重试）
     */
    private static void scheduleReconnect(int delayMs) {
        if (!isReconnecting.compareAndSet(false, true)) {
            System.out.println("已有重连任务在执行中，跳过");
            return;
        }

        int actualDelay = Math.min(delayMs, MAX_RECONNECT_DELAY);
        System.out.println("将在 " + actualDelay + "ms 后尝试重新连接 AMQP...");

        executorService.submit(() -> {
            try {
                Thread.sleep(actualDelay);
                System.out.println("========== 开始 AMQP 重连 ==========");
                connectToAMQP();
            } catch (Exception e) {
                System.err.println("重连过程出错: " + e.getMessage());
                // 递增延迟再试
                scheduleReconnect(Math.min(actualDelay * 2, MAX_RECONNECT_DELAY));
            } finally {
                isReconnecting.set(false);
            }
        });
    }

    private static void processMessage(Message message) {
        try {
            String body = message.getBody(String.class);
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(body);

            String event = rootNode.path("event").asText();
            String eventTime = rootNode.path("event_time").asText();
            String requestId = rootNode.path("request_id").asText();

            JsonNode notifyData = rootNode.path("notify_data");
            JsonNode header = notifyData.path("header");
            String appId = header.path("app_id").asText();
            String deviceId = header.path("device_id").asText();

            SensorData sensorData = null;
            if (sensorDataService != null) {
                sensorData = sensorDataService.getLatestSensorData(deviceId);
            }

            if (sensorData == null) {
                sensorData = new SensorData(deviceId, appId);
            } else {
                sensorData.setReceiveTime(java.time.LocalDateTime.now());
            }

            JsonNode services = notifyData.path("body").path("services");

            boolean hasEnvironmentData = false;
            boolean hasFlagData = false;
            boolean hasGpsData = false;

            for (JsonNode service : services) {
                String serviceId = service.path("service_id").asText();
                JsonNode properties = service.path("properties");

                if ("Date".equals(serviceId)) {
                    if (properties.has("temp")) {
                        sensorData.setTemperature(properties.path("temp").asDouble());
                        sensorData.setHumidity(properties.path("humid").asDouble());
                        hasEnvironmentData = true;

                        System.out.println("收到环境数据: 温度=" + sensorData.getTemperature() + "°C, 湿度=" + sensorData.getHumidity() + "%");
                    }

                    if (properties.has("longitude") && properties.has("latitude")) {
                        sensorData.setLongitude(properties.path("longitude").asDouble());
                        sensorData.setLatitude(properties.path("latitude").asDouble());
                        hasGpsData = true;

                        System.out.println("收到GPS数据: 经度=" + sensorData.getLongitude() + "°, 纬度=" + sensorData.getLatitude() + "°");
                    }
                }

                else if ("Flag".equals(serviceId)) {
                    if (properties.has("fall")) {
                        sensorData.setFallFlag(properties.path("fall").asBoolean());
                        hasFlagData = true;
                        System.out.println("收到状态标志: 跌倒=" + sensorData.getFallFlag());
                    }
                    if (properties.has("slow")) {
                        sensorData.setSlowFlag(properties.path("slow").asBoolean());
                    }

                    // 接收姿态数据
                    if (properties.has("roll")) {
                        sensorData.setRoll(properties.path("roll").asDouble());
                        System.out.println("收到Roll: " + sensorData.getRoll() + "°");
                    }

                    if (properties.has("pitch")) {
                        sensorData.setPitch(properties.path("pitch").asDouble());
                        System.out.println("收到Pitch: " + sensorData.getPitch() + "°");
                    }

                    if (properties.has("avm")) {
                        sensorData.setAvm(properties.path("avm").asDouble());
                        System.out.println("收到AVM: " + sensorData.getAvm() + "°/s");
                    }

                    if (properties.has("gvm")) {
                        sensorData.setGvm(properties.path("gvm").asDouble());
                        System.out.println("收到GVM: " + sensorData.getGvm() + "°");
                    }
                }

                else if ("GPS".equals(serviceId) || "Location".equals(serviceId) || "Position".equals(serviceId)) {
                    if (properties.has("longitude") && properties.has("latitude")) {
                        sensorData.setLongitude(properties.path("longitude").asDouble());
                        sensorData.setLatitude(properties.path("latitude").asDouble());
                        hasGpsData = true;
                    }
                    else if (properties.has("lon") && properties.has("lat")) {
                        sensorData.setLongitude(properties.path("lon").asDouble());
                        sensorData.setLatitude(properties.path("lat").asDouble());
                        hasGpsData = true;
                    }
                }

                System.out.println("收到服务: " + serviceId + ", 属性: " + properties.toString());
            }

            if (sensorDataService != null) {
                sensorDataService.saveSensorData(sensorData);
            } else {
                System.err.println("SensorDataService未初始化！");
            }

        } catch (Exception e) {
            System.out.println("处理消息时出错: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static MessageListener messageListener = message -> {
        try {
            executorService.submit(() -> processMessage(message));
        } catch (Exception e) {
            System.out.println("Error submitting task for message: " + e.getMessage());
            e.printStackTrace();
        }
    };

    private static JmsConnectionListener myJmsConnectionListener = new JmsConnectionListener() {
        @Override
        public void onConnectionEstablished(URI remoteURI) {
            System.out.println("[AMQP] 连接已建立: " + remoteURI);
        }

        @Override
        public void onConnectionFailure(Throwable error) {
            System.err.println("[AMQP] 连接失败: " + error.getMessage());
            // 通知前端
            if (webSocketHandler != null) {
                webSocketHandler.broadcastStatus("AMQP连接失败，正在重连...");
            }
            scheduleReconnect(5000);
        }

        @Override
        public void onConnectionInterrupted(URI remoteURI) {
            System.err.println("[AMQP] 连接中断: " + remoteURI);
            // 通知前端
            if (webSocketHandler != null) {
                webSocketHandler.broadcastStatus("AMQP连接中断，正在重连...");
            }
            // 核心修复：连接中断后自动重连
            scheduleReconnect(3000);
        }

        @Override
        public void onConnectionRestored(URI remoteURI) {
            System.out.println("[AMQP] 连接已恢复: " + remoteURI);
            if (webSocketHandler != null) {
                webSocketHandler.broadcastStatus("AMQP连接已恢复");
            }
        }

        @Override
        public void onInboundMessage(JmsInboundMessageDispatch envelope) {
        }

        @Override
        public void onSessionClosed(Session session, Throwable cause) {
            System.out.println("[AMQP] Session关闭: " + cause);
        }

        @Override
        public void onConsumerClosed(MessageConsumer consumer, Throwable cause) {
            System.out.println("[AMQP] Consumer关闭: " + cause);
        }

        @Override
        public void onProducerClosed(MessageProducer producer, Throwable cause) {
            System.out.println("[AMQP] Producer关闭: " + cause);
        }
    };
}
