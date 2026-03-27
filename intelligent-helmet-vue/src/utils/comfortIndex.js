/**
 * THI (Temperature-Humidity Index) comfort calculation
 * Formula: T - 0.55 * (1 - RH/100) * (T - 14.5)
 */

export function calculateTHI(temperature, humidity) {
  if (temperature == null || humidity == null) return null
  const t = Number(temperature)
  const rh = Number(humidity)
  if (isNaN(t) || isNaN(rh)) return null
  return t - 0.55 * (1 - rh / 100) * (t - 14.5)
}

export function getComfortLevel(thi) {
  if (thi == null) return { label: '--', color: '#8892A0' }
  if (thi < 15) return { label: '寒冷', color: '#3B82F6' }
  if (thi < 20) return { label: '凉爽', color: '#06B6D4' }
  if (thi < 26) return { label: '舒适', color: '#00C49A' }
  if (thi < 30) return { label: '偏热', color: '#FF6B35' }
  return { label: '闷热', color: '#FF4757' }
}
