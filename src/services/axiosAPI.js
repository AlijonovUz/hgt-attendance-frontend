import axios from "axios"

export const axiosAPI = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  paramsSerializer: {
    encode: (param) => param,
  },
})

// ── Har so'rovga access tokenni qo'shish ──
axiosAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("access")
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── 401 da refresh qilib, navbatdagi so'rovlarni qayta yuborish ──
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
  failedQueue = []
}

const doLogout = () => {
  localStorage.removeItem("access")
  localStorage.removeItem("refresh")
  localStorage.removeItem("registered_fcm_token") // keyingi login'da qurilma qayta ro'yxatdan o'tsin
  if (window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

axiosAPI.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem("refresh")
    if (!refreshToken) {
      doLogout()
      return Promise.reject(error)
    }

    // Boshqa so'rov allaqachon refresh qilayotgan bo'lsa — navbatga qo'yamiz
    if (isRefreshing) {
      return new Promise((resolve, reject) => failedQueue.push({ resolve, reject })).then((t) => {
        originalRequest.headers.Authorization = `Bearer ${t}`
        return axiosAPI(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true
    try {
      const baseURL = (import.meta.env.VITE_BASE_URL ?? "").replace(/\/$/, "")
      // Backend refresh endpointi {access, refresh} kutadi, javob {data:{access, refresh}}
      const res = await axios.post(`${baseURL}/users/auth/refresh/`, {
        access: localStorage.getItem("access"),
        refresh: refreshToken,
      })
      const data = res.data?.data ?? res.data
      const newAccess = data?.access
      const newRefresh = data?.refresh
      if (!newAccess) throw new Error("Refresh javobida access yo'q")

      localStorage.setItem("access", newAccess)
      if (newRefresh) localStorage.setItem("refresh", newRefresh)

      originalRequest.headers.Authorization = `Bearer ${newAccess}`
      processQueue(null, newAccess)
      return axiosAPI(originalRequest)
    } catch (e) {
      processQueue(e, null)
      doLogout()
      return Promise.reject(e)
    } finally {
      isRefreshing = false
    }
  }
)
