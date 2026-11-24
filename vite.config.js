import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/* En Vercel, todo lo que está en api/ se sirve solo. En desarrollo
   Vite no lo hace, así que las funciones no existían y no se podían
   probar sin desplegar. Este plugin las monta igual que en producción. */
function funcionesLocales() {
  return {
    name: 'funciones-locales',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        const nombre = req.url.split('?')[0].replace('/api/', '')
        try {
          const mod = await server.ssrLoadModule(resolve(__dirname, 'api', nombre + '.js'))
          const cuerpo = await new Promise((ok) => {
            let d = ''
            req.on('data', (c) => (d += c))
            req.on('end', () => ok(d))
          })
          req.body = cuerpo ? JSON.parse(cuerpo) : {}
          res.status = (c) => { res.statusCode = c; return res }
          res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)) }
          res.setHeader('Cache-Control', 'no-store')
          await mod.default(req, res)
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'local', detalle: String(e) }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), funcionesLocales()],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app/index.html'),
        evaluacion: resolve(__dirname, 'evaluacion/index.html'),
      },
    },
  },
})
