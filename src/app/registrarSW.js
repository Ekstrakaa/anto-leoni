/* Registra el trabajador de servicio. Sólo en producción: en
   desarrollo se quedaría con los módulos viejos en la caché y
   volvería loco a cualquiera que toque el código. */
export function registrarSW() {
  if (!('serviceWorker' in navigator)) return
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/app/' }).catch(() => {})
  })
}
