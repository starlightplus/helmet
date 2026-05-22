import axios from 'axios'

const request = axios.create({
  baseURL: '',
  timeout: 10000
})

// 请求拦截器：自动带上 token
request.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：只有 token 真正无效（后端明确返回 401 且带 invalid_token 标记）才跳登录页
request.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const msg = err.response?.data
      // 只有 token 过期/无效才跳，业务性 401（如未绑定设备）不跳
      if (typeof msg === 'string' && (msg.includes('token') || msg.includes('Token') || msg.includes('expired'))) {
        sessionStorage.removeItem('token')
        window.location.href = '/auth'
      }
    }
    return Promise.reject(err)
  }
)

export default request
