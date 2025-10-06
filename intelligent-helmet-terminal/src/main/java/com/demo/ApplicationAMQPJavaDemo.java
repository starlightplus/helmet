package com.demo;

import com.demo.model.SensorData;
import com.demo.service.SensorDataService;
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

@SpringBootApplication
public class ApplicationAMQPJavaDemo {
    // Async thread pool, the parameters can be adjusted as per your business requirements.
    private final static ExecutorService executorService = new ThreadPoolExecutor(
            Runtime.getRuntime().availableProcessors(), Runtime.getRuntime().availableProcessors() * 2,
            60, TimeUnit.SECONDS, new LinkedBlockingQueue<>(5000));
    
    // Spring application context for accessing services
    private static ApplicationContext applicationContext;
    private static SensorDataService sensorDataService;

    public static void main(String[] args) throws Exception {
        // 启动Spring Boot应用
        applicationContext = SpringApplication.run(ApplicationAMQPJavaDemo.class, args);
        sensorDataService = applicationContext.getBean(SensorDataService.class);
        
        System.out.println("Spring Boot 应用已启动，开始连接AMQP...");
        
        // 启动AMQP连接
        connectToAMQP();
    }
    
    private static void connectToAMQP() throws Exception {
        // Connection credentials setup
        String accessKey = "6xQi6Cwu";
        long timeStamp = System.currentTimeMillis();
        String userName = "accessKey=" + accessKey + "|timestamp=" + timeStamp;
        String password = "koyK4wNbUcwuxrBOL9VB3yiTSxEdz6Wj";
        String baseUrl = "2141638e20.st1.iotda-app.cn-south-1.myhuaweicloud.com";
        String connectionUrl = "amqps://" + baseUrl + ":5671?amqp.vhost=default&amqp.idleTimeout=8000&amqp.saslMechanisms=PLAIN";

        Hashtable<String, String> hashtable = new Hashtable<>();
        hashtable.put("connectionfactory.HwConnectionURL", connectionUrl);
        String queueName = "DefaultQueue";
        hashtable.put("queue.HwQueueName", queueName);
        hashtable.put(Context.INITIAL_CONTEXT_FACTORY, "org.apache.qpid.jms.jndi.JmsInitialContextFactory");

        // Initializing context for connection
        Context context = new InitialContext(hashtable);
        JmsConnectionFactory cf = (JmsConnectionFactory) context.lookup("HwConnectionURL");
        Destination queue = (Destination) context.lookup("HwQueueName");

        // Trust the server
        TransportOptions to = new TransportOptions();
        to.setTrustAll(true);
        cf.setSslContext(TransportSupport.createJdkSslContext(to));

        // Create connection
        Connection connection = cf.createConnection(userName, password);
        ((JmsConnection) connection).addConnectionListener(myJmsConnectionListener);

        // Create Session
        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
        connection.start();

        // Create Receiver Link
        MessageConsumer consumer = session.createConsumer(queue);

        // Processing message in two ways: either by pulling or using listeners
        receiveMessage(consumer);
    }

    private static void receiveMessage(MessageConsumer consumer) {
        try {
            // Recommended method: actively pulling messages.
            consumer.setMessageListener(messageListener);
        } catch (Exception e) {
            System.out.println("Error receiving message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void processMessage(Message message) {
        try {
            String body = message.getBody(String.class);
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(body);

            String event = rootNode.path("event").asText();
            String eventTime = rootNode.path("event_time").asText();
            String requestId = rootNode.path("request_id").asText();

            // Process the notify_data part
            JsonNode notifyData = rootNode.path("notify_data");
            JsonNode header = notifyData.path("header");
            String appId = header.path("app_id").asText();
            String deviceId = header.path("device_id").asText();

            // 获取设备的最新数据，如果不存在则创建新的
            SensorData sensorData = null;
            if (sensorDataService != null) {
                sensorData = sensorDataService.getLatestSensorData(deviceId);
            }
            
            // 如果没有历史数据，创建新的数据对象
            if (sensorData == null) {
                sensorData = new SensorData(deviceId, appId);
            } else {
                // 更新接收时间
                sensorData.setReceiveTime(java.time.LocalDateTime.now());
            }

            JsonNode services = notifyData.path("body").path("services");
            
            // 标记是否收到了新的环境数据或标志数据
            boolean hasEnvironmentData = false;
            boolean hasFlagData = false;
            boolean hasGpsData = false;

            // Process each service
            for (JsonNode service : services) {
                String serviceId = service.path("service_id").asText();
                JsonNode properties = service.path("properties");

                // Process Date service - 环境数据和GPS数据
                if ("Date".equals(serviceId)) {
                    if (properties.has("temp")) {
                        sensorData.setTemperature(properties.path("temp").asDouble());
                        sensorData.setHumidity(properties.path("humid").asDouble());
                        hasEnvironmentData = true;
                        
                        System.out.println("收到环境数据:");
                        System.out.println("温度: " + sensorData.getTemperature() + "°C, 湿度: " + sensorData.getHumidity() + "%");
                    }
                    
                    // 解析GPS坐标数据（从 Date 服务中）
                    if (properties.has("longitude") && properties.has("latitude")) {
                        sensorData.setLongitude(properties.path("longitude").asDouble());
                        sensorData.setLatitude(properties.path("latitude").asDouble());
                        hasGpsData = true;
                        
                        System.out.println("收到GPS数据（来自Date服务）:");
                        System.out.println("经度: " + sensorData.getLongitude() + "°, 纬度: " + sensorData.getLatitude() + "°");
                    }
                }

                // Process Flag service - 状态标志
                else if ("Flag".equals(serviceId)) {
                    if (properties.has("fall")) {
                        sensorData.setFallFlag(properties.path("fall").asBoolean());
                        sensorData.setSlowFlag(properties.path("slow").asBoolean());
                        sensorData.setTurnLeftFlag(properties.path("turn_left").asBoolean());
                        sensorData.setTurnRightFlag(properties.path("turn_right").asBoolean());
                        hasFlagData = true;
                        
                        System.out.println("收到状态标志:");
                        System.out.println("跌倒: " + sensorData.getFallFlag());
                        System.out.println("缓慢: " + sensorData.getSlowFlag());
                        System.out.println("左转: " + sensorData.getTurnLeftFlag());
                        System.out.println("右转: " + sensorData.getTurnRightFlag());
                    }
                }
                
                // Process GPS/Location service - GPS定位数据
                else if ("GPS".equals(serviceId) || "Location".equals(serviceId) || "Position".equals(serviceId)) {
                    // 尝试多种可能的GPS字段名称
                    if (properties.has("longitude") && properties.has("latitude")) {
                        sensorData.setLongitude(properties.path("longitude").asDouble());
                        sensorData.setLatitude(properties.path("latitude").asDouble());
                        hasGpsData = true;
                        
                        System.out.println("收到GPS数据:");
                        System.out.println("经度: " + sensorData.getLongitude() + "°, 纬度: " + sensorData.getLatitude() + "°");
                    }
                    // 尝试其他可能的字段名
                    else if (properties.has("lon") && properties.has("lat")) {
                        sensorData.setLongitude(properties.path("lon").asDouble());
                        sensorData.setLatitude(properties.path("lat").asDouble());
                        hasGpsData = true;
                        
                        System.out.println("收到GPS数据:");
                        System.out.println("经度: " + sensorData.getLongitude() + "°, 纬度: " + sensorData.getLatitude() + "°");
                    }
                }
                
                // 打印所有收到的服务信息，帮助调试
                System.out.println("收到服务: " + serviceId + ", 属性: " + properties.toString());
            }
            
            // 保存数据到服务中
            if (sensorDataService != null) {
                sensorDataService.saveSensorData(sensorData);
                
                if (hasEnvironmentData && hasFlagData && hasGpsData) {
                    System.out.println("完整数据已保存 - 包含环境数据、标志数据和GPS数据");
                } else if (hasEnvironmentData && hasFlagData) {
                    System.out.println("环境和标志数据已保存 - 缺少GPS数据");
                } else if (hasEnvironmentData) {
                    System.out.println("环境数据已更新并保存");
                } else if (hasFlagData) {
                    System.out.println("标志数据已更新并保存 - 环境数据保持不变");
                } else if (hasGpsData) {
                    System.out.println("GPS数据已更新并保存");
                }
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
            // Asynchronously process the received message to avoid blocking
            executorService.submit(() -> processMessage(message));
        } catch (Exception e) {
            System.out.println("Error submitting task for message: " + e.getMessage());
            e.printStackTrace();
        }
    };

    private static JmsConnectionListener myJmsConnectionListener = new JmsConnectionListener() {
        @Override
        public void onConnectionEstablished(URI remoteURI) {
            System.out.println("Connection established: " + remoteURI);
        }

        @Override
        public void onConnectionFailure(Throwable error) {
            System.out.println("Connection failure: " + error.getMessage());
        }

        @Override
        public void onConnectionInterrupted(URI remoteURI) {
            System.out.println("Connection interrupted: " + remoteURI);
        }

        @Override
        public void onConnectionRestored(URI remoteURI) {
            System.out.println("Connection restored: " + remoteURI);
        }

        @Override
        public void onInboundMessage(JmsInboundMessageDispatch envelope) {
            System.out.println("Inbound message: " + envelope);
        }

        @Override
        public void onSessionClosed(Session session, Throwable cause) {
            System.out.println("Session closed: " + session + ", cause: " + cause);
        }

        @Override
        public void onConsumerClosed(MessageConsumer consumer, Throwable cause) {
            System.out.println("Consumer closed: " + consumer + ", cause: " + cause);
        }

        @Override
        public void onProducerClosed(MessageProducer producer, Throwable cause) {
            System.out.println("Producer closed: " + producer + ", cause: " + cause);
        }
    };
}
