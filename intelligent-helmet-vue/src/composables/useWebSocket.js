import { ref } from 'vue'

export function useWebSocket() {
  const isConnected = ref(false)
  const connectionStatus = ref('未连接')
  const deviceCount = ref(0)
  const lastUpdateTime = ref(null)

  let ws = null
  let reconnectTimer = null
  let heartbeatTimer = null
  let urlUnderUse = ''
  const HEARTBEAT_INTERVAL = 30000 // 30s

  // user-provided callback
  let onSensorData = null

  function setOnSensorData(cb) {
    onSensorData = cb
  }

  function connect(url) {
    if (ws) disconnect()
    urlUnderUse = url
    tryOpen()
  }

  function tryOpen() {
    if (!urlUnderUse) return
    connectionStatus.value = '连接中...'
    ws = new WebSocket(urlUnderUse)

    ws.onopen = () => {
      isConnected.value = true
      connectionStatus.value = '已连接 WebSocket'
      lastUpdateTime.value = new Date()
      // start heartbeat
      if (heartbeatTimer) clearInterval(heartbeatTimer)
      heartbeatTimer = setInterval(() => {
        try {
          ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }))
        } catch (e) { /* ignore */ }
      }, HEARTBEAT_INTERVAL)
      // cancel reconnect
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    ws.onmessage = (evt) => {
      lastUpdateTime.value = new Date()
      try {
        const data = JSON.parse(evt.data)
        // assumed message types: {type:'sensor', payload: {...}} or plain sensor obj
        if (data) {
          if (data.type === 'sensor' && data.payload) {
            handleSensorPayload(data.payload)
          } else if (data.type === 'pong') {
            // ignore
          } else {
            // try treat as sensor data directly
            handleSensorPayload(data)
          }
        }
      } catch (e) {
        console.warn('无法解析WS消息', e)
      }
    }

    ws.onclose = () => {
      isConnected.value = false
      connectionStatus.value = '已断开'
      // clear heartbeat
      if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null }
      // try reconnect
      reconnectTimer = setTimeout(() => {
        tryOpen()
      }, 2000)
    }

    ws.onerror = (err) => {
      console.error('WS 错误', err)
      connectionStatus.value = '错误'
      // close socket to trigger reconnect
      try { ws.close() } catch (e) {}
    }
  }

  function disconnect() {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null }
    if (ws) {
      try { ws.close() } catch (e) {}
      ws = null
    }
    isConnected.value = false
    connectionStatus.value = '已断开'
  }

  function sendMessage(obj) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false
    try {
      ws.send(JSON.stringify(obj))
      return true
    } catch (e) {
      console.error('WS 发送失败', e)
      return false
    }
  }

  // internal handler for sensor payload
  function handleSensorPayload(payload) {
    // payload expected: deviceId, temperature, humidity, longitude, latitude, receiveTime, fallFlag/slowFlag/turnLeftFlag/turnRightFlag
    if (!payload) return
    // optionally update deviceCount by inspecting unique devices - left to parent to maintain if needed
    if (onSensorData) {
      try { onSensorData(payload) } catch (e) { console.error(e) }
    }
  }

  return {
    isConnected,
    connectionStatus,
    deviceCount,
    lastUpdateTime,
    connect,
    disconnect,
    sendMessage,
    setOnSensorData
  }
}