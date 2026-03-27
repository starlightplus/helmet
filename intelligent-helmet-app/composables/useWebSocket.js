import { ref, onUnmounted } from 'vue'

export function useWebSocket(url) {
  const isConnected = ref(false)
  const sensorData = ref(null)
  const error = ref(null)
  let socketTask = null
  let reconnectTimer = null

  const connect = () => {
    socketTask = uni.connectSocket({
      url: url,
      success: () => {
        console.log('WebSocket 连接成功')
      },
      fail: (err) => {
        console.error('WebSocket 连接失败:', err)
        error.value = err
        scheduleReconnect()
      }
    })

    socketTask.onOpen(() => {
      isConnected.value = true
      error.value = null
      console.log('WebSocket 已打开')
    })

    socketTask.onMessage((res) => {
      try {
        const data = JSON.parse(res.data)
        sensorData.value = data
      } catch (e) {
        console.error('解析数据失败:', e)
      }
    })

    socketTask.onError((err) => {
      console.error('WebSocket 错误:', err)
      error.value = err
      isConnected.value = false
    })

    socketTask.onClose(() => {
      console.log('WebSocket 已关闭')
      isConnected.value = false
      scheduleReconnect()
    })
  }

  const scheduleReconnect = () => {
    if (reconnectTimer) return
    reconnectTimer = setTimeout(() => {
      console.log('尝试重新连接...')
      reconnectTimer = null
      connect()
    }, 3000)
  }

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (socketTask) {
      socketTask.close()
      socketTask = null
    }
    isConnected.value = false
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    sensorData,
    error,
    connect,
    disconnect
  }
}
