// Real-time bildirishnomalar uchun WebSocket (singleton, auto-reconnect).
// Auth header WS'da yo'q — bir martalik ticket (≈60s) URL'ga qo'shiladi.
class NotificationSocket {
  constructor() {
    this.socket = null
    this.url = ""
    this.messageCallback = null
    this.manuallyClosed = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.connectionId = 0 // eskirgan ulanish callbacklarini e'tiborsiz qoldirish uchun
    this.reconnectTimer = null
    // Reconnect paytida yangi ticket bilan URL olish uchun (ixtiyoriy)
    this.urlProvider = null
  }

  // urlProvider — har (re)connectda yangi URL qaytaruvchi async funksiya (ticket yangilash uchun)
  connect(url, onMessage = null, urlProvider = null) {
    if (!url) {
      console.error("❌ WebSocket URL ko'rsatilmadi!")
      return
    }
    this.url = url
    if (onMessage) this.messageCallback = onMessage
    if (urlProvider) this.urlProvider = urlProvider
    this.manuallyClosed = false

    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN) return // allaqachon ulangan
      if (this.socket.readyState === WebSocket.CONNECTING) return // ulanish jarayonida
    }
    this._initialize()
  }

  _initialize() {
    const activeConnectionId = ++this.connectionId
    console.log(`[WS] 🔌 Ulanishga urinish #${activeConnectionId}:`, this.url)
    try {
      this.socket = new WebSocket(this.url)
    } catch (error) {
      console.error("[WS] ❌ WebSocket yaratishda xato:", error)
      this._reconnect()
      return
    }

    this.socket.onopen = () => {
      if (activeConnectionId !== this.connectionId) return
      console.log(`[WS] ✅ ULANDI (#${activeConnectionId}) — endi xabar kutilyapti...`)
      this.reconnectAttempts = 0
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    }

    this.socket.onmessage = (event) => {
      if (activeConnectionId !== this.connectionId) return
      console.log("[WS] 📩 XABAR KELDI (raw):", event.data)
      let data = event.data
      try {
        data = JSON.parse(event.data)
        console.log("[WS] 📩 XABAR (parsed):", data)
      } catch {
        console.log("[WS] ⚠️ Xabar JSON emas, o'z holicha qoldi")
      }
      if (this.messageCallback) this.messageCallback(data)
    }

    this.socket.onerror = (event) => {
      if (activeConnectionId !== this.connectionId) return
      console.error("[WS] ❌ XATO yuz berdi:", event)
    }

    this.socket.onclose = (event) => {
      if (activeConnectionId !== this.connectionId) return
      // code: 1000=normal, 1006=abnormal (proxy/tarmoq), 1011=server xatosi, 4xxx=app-level
      console.warn(
        `[WS] 🔴 YOPILDI (#${activeConnectionId}) | code=${event.code} | reason="${event.reason || "(bo'sh)"}" | wasClean=${event.wasClean}`
      )
      this.socket = null
      if (!this.manuallyClosed) this._reconnect()
    }
  }

  // Exponential backoff: 1s, 2s, 4s, 8s ... (max 10s)
  _reconnect() {
    if (this.manuallyClosed) {
      console.log("[WS] ⏹️ Reconnect yo'q — qo'lda yopilgan")
      return
    }
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `[WS] 💀 ${this.maxReconnectAttempts} urinish tugadi — BOSHQA ULANMAYDI (sahifani yangilang)`
      )
      return
    }
    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000)
    console.log(`[WS] 🔁 ${delay}ms dan keyin qayta urinish (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(async () => {
      // Ticket eskirgan bo'lishi mumkin — mavjud bo'lsa yangi URL olamiz
      if (this.urlProvider) {
        try {
          const fresh = await this.urlProvider()
          if (fresh) this.url = fresh
        } catch (e) {
          console.error("Ticket yangilashda xato:", e)
        }
      }
      this._initialize()
    }, delay)
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(typeof message === "string" ? message : JSON.stringify(message))
      return true
    }
    return false
  }

  disconnect() {
    console.log("[WS] ⏹️ disconnect() chaqirildi (qo'lda yopish)")
    this.manuallyClosed = true
    this.reconnectAttempts = 0
    this.connectionId++ // eskirgan callbacklarni o'chirish
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  get status() {
    if (!this.socket) return "CLOSED"
    return ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][this.socket.readyState]
  }
}

const notificationSocket = new NotificationSocket()
export default notificationSocket // SINGLETON
