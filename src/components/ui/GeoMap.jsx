import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "proj4leaflet"

// Yandex xaritasi EPSG:3395 (ellipsoidal Mercator) proyeksiyasidan foydalanadi —
// Leaflet'ning standart EPSG:3857'idan farq qiladi. To'g'ri joylashuv uchun
// maxsus CRS yaratamiz, aks holda kenglik bo'yicha siljish bo'ladi.
const YANDEX_CRS = new L.Proj.CRS(
  "EPSG:3395",
  "+proj=merc +a=6378137 +b=6356752.314245179 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs",
  {
    origin: [-20037508.342789244, 20037508.342789244],
    resolutions: (() => {
      const res = []
      for (let z = 0; z < 24; z++) res[z] = 156543.033928041 / Math.pow(2, z)
      return res
    })(),
    bounds: L.bounds(
      [-20037508.342789244, -20037508.342789244],
      [20037508.342789244, 20037508.342789244]
    ),
  }
)

// Yandex tile manbalari — API key talab qilmaydi
const TILE_STREET = {
  url: "https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU",
  attribution: "&copy; <a href='https://yandex.uz/maps'>Yandex</a>",
  maxZoom: 19,
}
const TILE_SAT = {
  url: "https://core-sat.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}&lang=ru_RU",
  attribution: "&copy; <a href='https://yandex.uz/maps'>Yandex</a>",
  maxZoom: 19,
}
// Sun'iy yo'ldosh ustiga qo'yiladigan shaffof yorliqlar qatlami (joy nomlari, ko'chalar)
const TILE_LABELS = {
  url: "https://core-renderer-tiles.maps.yandex.net/tiles?l=skl&x={x}&y={y}&z={z}&scale=1&lang=ru_RU",
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

// Yandex/Web-Mercator tile sxemasidagi metr/piksel nisbati (resolutions jadvali bilan bir xil formula)
const metersPerPixel = (lat, zoom) =>
  (156543.03392804097 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom)

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
  const labelsRef = useRef(null)
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
  // Bo'sh string Number("") === 0 bo'lib ketadi — uni koordinatasiz deb hisoblaymiz,
  // aks holda xarita (0,0) — okean o'rtasiga uchib ketadi.
  const hasCoord =
    lat !== "" && lat != null &&
    lng !== "" && lng != null &&
    Number.isFinite(validLat) && Number.isFinite(validLng)

  // ── Xaritani bir marta yaratish ──
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Koordinata bo'lmasa — butun O'zbekiston ko'rinadi
    const center = hasCoord ? [validLat, validLng] : [41.377491, 64.585262]
    const map = L.map(containerRef.current, {
      crs: YANDEX_CRS,
      center,
      zoom: hasCoord ? 15 : 6,
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

  // ── Tile turini almashtirish + sun'iy yo'ldoshda nom yorliqlarini ko'rsatish ──
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Asosiy qatlam
    if (tileRef.current) map.removeLayer(tileRef.current)
    const cfg = satellite ? TILE_SAT : TILE_STREET
    tileRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map)

    // Yorliqlar qatlami: ko'cha rejimida nomlar allaqachon bor,
    // sun'iy yo'ldosh rejimida esa ularni alohida shaffof qatlam bilan qo'shamiz.
    if (labelsRef.current) {
      map.removeLayer(labelsRef.current)
      labelsRef.current = null
    }
    if (satellite) {
      labelsRef.current = L.tileLayer(TILE_LABELS.url, {
        maxZoom: TILE_LABELS.maxZoom,
      }).addTo(map)
    }
  }, [satellite])

  // ── Markaz / radius o'zgarganda doira va markerni yangilash ──
  // Doira radiusini joriy zoom + kenglikka mos pikselga aylantirib chizadi (tile masshtabiga aniq mos keladi)
  const updateCircleRadius = (center) => {
    const map = mapRef.current
    if (!map || !circleRef.current) return
    const zoom = map.getZoom()
    const mpp = metersPerPixel(center[0], zoom)
    const pixelRadius = radius / mpp
    circleRef.current.setRadius(pixelRadius)
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map || !hasCoord) return
    const center = [validLat, validLng]

    if (circleRef.current) {
      circleRef.current.setLatLng(center)
      updateCircleRadius(center)
    } else {
      // L.circle o'rniga L.circleMarker — radius doim piksel sifatida beriladi
      circleRef.current = L.circleMarker(center, {
        radius: 0, // pastda darhol to'g'ri qiymat bilan yangilanadi
        color: "#0090FF",
        weight: 2,
        fillColor: "#0090FF",
        fillOpacity: 0.15,
      }).addTo(map)
      updateCircleRadius(center)
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
      // circleMarker'ning getBounds() yo'q, shuning uchun markazga moslab zoom qilamiz
      map.setView(center, map.getZoom() < 15 ? 16 : map.getZoom())
      setTimeout(() => updateCircleRadius(center), 0)
    }
  }, [validLat, validLng, radius, hasCoord])

  // Zoom o'zgarganda doira piksel-radiusini qayta hisoblash (aks holda noto'g'ri kattalashib/kichraytirib qoladi)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handler = () => {
      if (hasCoord) updateCircleRadius([validLat, validLng])
    }
    map.on("zoomend", handler)
    return () => map.off("zoomend", handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#262626] border border-[#E5E7EB] dark:border-[#2E2E2E] px-2.5 py-1.5 text-[13px] font-medium text-[#0A0A0A] dark:text-white shadow-sm">
          {validLat.toFixed(4)}, {validLng.toFixed(4)}
        </div>
      )}

      {/* Satellite / ko'cha almashtirish */}
      <button
        type="button"
        onClick={() => setSatellite((s) => !s)}
        className="absolute top-3 right-3 z-10 rounded-lg bg-white dark:bg-[#262626] border border-[#E5E7EB] dark:border-[#2E2E2E] px-2.5 py-1.5 text-[13px] font-medium text-[#0A0A0A] dark:text-white shadow-sm hover:bg-[#F5F5F5] dark:hover:bg-[#2E2E2E] transition-colors cursor-pointer"
      >
        {satellite ? "Sun'iy yo'ldosh" : "Ko'cha"}
      </button>
    </div>
  )
}

export default GeoMap
