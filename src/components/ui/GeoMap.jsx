import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Tile manbalari — API key talab qilmaydi
const TILE_STREET = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
}
const TILE_SAT = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution: "Tiles &copy; Esri",
  maxZoom: 19,
}

// Markaz uchun ko'k pin (Leaflet default marker rasm muammosini chetlab o'tamiz)
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:26px;height:36px;">
    <svg width="26" height="36" viewBox="0 0 26 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z" fill="#0090FF"/>
      <circle cx="13" cy="13" r="5" fill="#fff"/>
    </svg>
  </div>`,
  iconSize: [26, 36],
  iconAnchor: [13, 36],
})

/**
 * Haqiqiy interaktiv xarita: markaz nuqta + radius doirasi.
 *
 * @param {number} lat   - markaz kenglik
 * @param {number} lng   - markaz uzunlik
 * @param {number} radius- metr (doira radiusi)
 * @param {function} [onPick] - (lat, lng) — xaritaga bosilganda chaqiriladi (tahrirlash rejimi)
 */
export const GeoMap = ({ lat, lng, radius = 100, onPick, className = "" }) => {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const tileRef = useRef(null)
  const circleRef = useRef(null)
  const markerRef = useRef(null)
  const lastCenterRef = useRef(null)
  const onPickRef = useRef(onPick)

  const [satellite, setSatellite] = useState(true)

  // onPick'ning eng so'nggi nusxasini ref'da saqlaymiz (render paytida emas)
  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

  const validLat = Number(lat)
  const validLng = Number(lng)
  const hasCoord = Number.isFinite(validLat) && Number.isFinite(validLng)

  // ── Xaritani bir marta yaratish ──
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const center = hasCoord ? [validLat, validLng] : [41.3111, 69.2797] // default: Toshkent
    const map = L.map(containerRef.current, {
      center,
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
    })
    mapRef.current = map

    const cfg = satellite ? TILE_SAT : TILE_STREET
    tileRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map)

    map.on("click", (e) => {
      if (onPickRef.current) onPickRef.current(e.latlng.lat, e.latlng.lng)
    })

    // Konteyner o'lchami kech aniqlansa (modal/grid) — qayta hisoblash
    setTimeout(() => map.invalidateSize(), 0)

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Tile turini almashtirish ──
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (tileRef.current) map.removeLayer(tileRef.current)
    const cfg = satellite ? TILE_SAT : TILE_STREET
    tileRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map)
  }, [satellite])

  // ── Markaz / radius o'zgarganda doira va markerni yangilash ──
  useEffect(() => {
    const map = mapRef.current
    if (!map || !hasCoord) return
    const center = [validLat, validLng]

    if (circleRef.current) {
      circleRef.current.setLatLng(center).setRadius(radius)
    } else {
      circleRef.current = L.circle(center, {
        radius,
        color: "#0090FF",
        weight: 2,
        fillColor: "#0090FF",
        fillOpacity: 0.15,
      }).addTo(map)
    }

    if (markerRef.current) {
      markerRef.current.setLatLng(center)
    } else {
      markerRef.current = L.marker(center, { icon: pinIcon }).addTo(map)
    }

    // Faqat markaz o'zgarganda zoom/markazni moslash (radius surilganda emas)
    const key = `${validLat},${validLng}`
    if (lastCenterRef.current !== key) {
      lastCenterRef.current = key
      map.fitBounds(circleRef.current.getBounds(), { padding: [24, 24], maxZoom: 17 })
    }
  }, [validLat, validLng, radius, hasCoord])

  return (
    <div className={`relative w-full h-[300px] rounded-2xl overflow-hidden border border-[#E5E7EB] dark:border-[#2E2E2E] ${className}`}>
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {!hasCoord && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-[#F5F5F5]/80 dark:bg-[#1F1F1F]/80 text-sm text-[#737373] pointer-events-none">
          —
        </div>
      )}

      {/* Koordinata pill */}
      {hasCoord && (
        <div className="absolute top-3 left-3 z-[500] flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#262626] border border-[#E5E7EB] dark:border-[#2E2E2E] px-2.5 py-1.5 text-[13px] font-medium text-[#0A0A0A] dark:text-white shadow-sm">
          {validLat.toFixed(4)}, {validLng.toFixed(4)}
        </div>
      )}

      {/* Satellite / ko'cha almashtirish */}
      <button
        type="button"
        onClick={() => setSatellite((s) => !s)}
        className="absolute top-3 right-3 z-[500] rounded-lg bg-white dark:bg-[#262626] border border-[#E5E7EB] dark:border-[#2E2E2E] px-2.5 py-1.5 text-[13px] font-medium text-[#0A0A0A] dark:text-white shadow-sm hover:bg-[#F5F5F5] dark:hover:bg-[#2E2E2E] transition-colors cursor-pointer"
      >
        {satellite ? "Sun'iy yo'ldosh" : "Ko'cha"}
      </button>
    </div>
  )
}

export default GeoMap
