import { ref } from 'vue'

const QWEATHER_KEY = '7231cf3694aa461d8419040344eacb8f'
const WEATHER_API = '/qweather/v7'
const GEO_API = '/qweather/geo/v2'

// 天气刷新间隔 30 分钟
const REFRESH_INTERVAL = 30 * 60 * 1000
// 请求失败后的冷却时间 60 秒
const ERROR_COOLDOWN = 60 * 1000

export function useWeather() {
  const city = ref('')
  const current = ref(null)      // 实况天气
  const hourly = ref([])         // 逐小时预报（24h）
  const forecast = ref([])       // 未来3天预报
  const warning = ref([])        // 天气预警
  const indices = ref([])        // 生活指数
  const minutely = ref('')       // 分钟降水摘要
  const loading = ref(false)
  const error = ref('')
  const lastRefresh = ref(null)

  let refreshTimer = null
  let cachedLocation = ''
  let lastErrorTime = 0

  async function fetchApi(url) {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`天气API请求失败(HTTP ${res.status})`)
    }
    const text = await res.text()
    if (!text) {
      throw new Error('天气API返回空响应')
    }
    const data = JSON.parse(text)
    if (data.code !== '200') {
      throw new Error(`和风天气API错误(${data.code})`)
    }
    return data
  }

  async function updateByLocation(lng, lat) {
    if (!lng || !lat) return

    const locStr = `${lng},${lat}`

    // 相同位置且未超时，不重复请求
    if (cachedLocation === locStr && lastRefresh.value) {
      const elapsed = Date.now() - lastRefresh.value.getTime()
      if (elapsed < REFRESH_INTERVAL) return
    }

    // 上次失败后冷却期内不重试
    if (lastErrorTime && Date.now() - lastErrorTime < ERROR_COOLDOWN) return

    try {
      loading.value = true
      error.value = ''

      const location = `${lng},${lat}`

      // 1) GeoAPI 查询城市名（失败不阻断天气请求）
      try {
        const geoData = await fetchApi(
          `${GEO_API}/city/lookup?location=${location}&key=${QWEATHER_KEY}`
        )
        if (geoData.location && geoData.location.length) {
          city.value = geoData.location[0].name
        }
      } catch (geoErr) {
        console.warn('[Weather] 城市查询失败，继续加载天气数据:', geoErr.message)
      }

      // 2) 并行请求所有天气数据
      const [nowData, hourlyData, dailyData, warningData, indicesData, minutelyData] =
        await Promise.all([
          fetchApi(`${WEATHER_API}/weather/now?location=${location}&key=${QWEATHER_KEY}`),
          fetchApi(`${WEATHER_API}/weather/24h?location=${location}&key=${QWEATHER_KEY}`),
          fetchApi(`${WEATHER_API}/weather/3d?location=${location}&key=${QWEATHER_KEY}`),
          fetchApi(`${WEATHER_API}/warning/now?location=${location}&key=${QWEATHER_KEY}`)
            .catch(() => ({ warning: [] })),
          fetchApi(`${WEATHER_API}/indices/1d?location=${location}&key=${QWEATHER_KEY}&type=1,3,5,8`)
            .catch(() => ({ daily: [] })),
          fetchApi(`${WEATHER_API}/minutely/5m?location=${location}&key=${QWEATHER_KEY}`)
            .catch(() => ({ summary: '' }))
        ])

      // 实况天气
      if (nowData.now) {
        current.value = nowData.now
      }

      // 逐小时预报
      hourly.value = hourlyData.hourly || []

      // 3天预报
      forecast.value = dailyData.daily || []

      // 天气预警
      warning.value = warningData.warning || []

      // 生活指数
      indices.value = indicesData.daily || []

      // 分钟降水摘要
      minutely.value = minutelyData.summary || ''

      cachedLocation = locStr
      lastRefresh.value = new Date()
      lastErrorTime = 0
    } catch (e) {
      console.error('[Weather]', e)
      error.value = e.message || '天气获取失败'
      lastErrorTime = Date.now()
    } finally {
      loading.value = false
    }
  }

  function startAutoRefresh(getLngLat) {
    stopAutoRefresh()
    refreshTimer = setInterval(() => {
      const { lng, lat } = getLngLat()
      if (lng && lat) updateByLocation(lng, lat)
    }, REFRESH_INTERVAL)
  }

  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  return {
    city, current, hourly, forecast, warning, indices, minutely,
    loading, error, lastRefresh,
    updateByLocation, startAutoRefresh, stopAutoRefresh
  }
}
