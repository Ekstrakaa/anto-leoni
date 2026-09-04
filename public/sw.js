/* ============================================================
   Trabajador de servicio — para que la app abra sin conexión.

   Estrategia: RED PRIMERO, con la caché de respaldo.

   Es a propósito. Con caché primero una versión vieja se queda
   pegada en el teléfono y la clienta ve la app de la semana
   pasada sin manera de enterarse. Así, si hay señal siempre ve
   lo último, y si no hay, ve lo último que sí llegó a tener.

   Lo que NUNCA se guarda: /api/. El plan del día y el dictado
   tienen que salir del servidor o no salir.
   ============================================================ */

const CACHE = 'feelmove-v1'

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(['/app/', '/app.webmanifest', '/icono/icono-192.png']).catch(() => {})
    )
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  if (e.request.method !== 'GET') return
  if (url.pathname.startsWith('/api/')) return          // el plan sale del servidor o no sale
  if (url.origin !== location.origin && !url.hostname.includes('jsdelivr')) return

  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r && r.ok) {
          const copia = r.clone()
          caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {})
        }
        return r
      })
      .catch(() =>
        caches.match(e.request).then((g) => g || caches.match('/app/'))
      )
  )
})
