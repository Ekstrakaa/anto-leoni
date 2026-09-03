/* ============================================================
   /api/dictado — convierte lo que dijo la persona en datos.

   "Hoy almorcé pollo con arroz y levanté 50 kilos en pecho"
   se vuelve comidas, agua, movimiento y series, listo para que
   la app lo pinte sin que ella toque un solo campo.

   Lo que NO hace: transcribir el audio. Eso lo hace el propio
   teléfono con el dictado del navegador, que es gratis. Acá
   llega texto, no sonido. Es la diferencia entre pagar por
   minuto de audio y pagar por un puñado de palabras.

   Y no inventa: lo que no se dijo vuelve vacío. Si dice "comí
   algo ligero", la comida es "algo ligero" — no se completa con
   un plato que nadie mencionó.
   ============================================================ */

import { pedirJSON, proveedor } from './_ia.js'

export const config = { runtime: 'nodejs' }

const SISTEMA = `Extraés datos de lo que una clienta cuenta en voz alta sobre su día. Español de España.

QUÉ DEVOLVÉS
Sólo JSON válido, sin markdown:
{
  "comidas": [{ "cual": "desayuno|media manana|almuerzo|merienda|cena", "que": "lo que comió, con sus palabras" }],
  "agua": { "cantidad": <número>, "unidad": "vaso|botella|litro" } | null,
  "movimiento": { "que": "Gimnasio|Caminata|Clase|En casa|No me movi", "minutos": <número> } | null,
  "series": [{ "ejercicio": "como lo nombró ella", "kilos": <número>, "repeticiones": <número> }],
  "peso": <número en kg> | null,
  "nota": "algo que convenga que lea Anto, o null"
}

REGLAS QUE NO SE ROMPEN
- Lo que no dijo, va vacío o null. NO completás huecos.
- No corregís lo que comió ni opinás. No calculás calorías ni macros.
- Las comidas van con sus palabras, no reescritas en lenguaje de dieta.
- Si menciona dolor, lesión, mareo o algo médico, va en "nota" tal cual
  lo dijo, para que lo lea Anto. No lo interpretás.
- Si no entendés algo, lo dejás fuera. Preferís devolver de menos.
- "un par" son 2. "unos cuantos" no es un número: no lo conviertas.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Usá POST' })

  if (!proveedor()) return res.status(503).json({ error: 'sin_clave' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const texto = (body.texto || '').trim()
    if (!texto) return res.status(400).json({ error: 'sin_texto' })
    if (texto.length > 1200) return res.status(400).json({ error: 'demasiado_largo' })

    const { json: d, uso } = await pedirJSON({
      sistema: SISTEMA,
      usuario: `Dijo: "${texto}"`,
      maxTokens: 600,
      temperatura: 0.2,
    })

    console.log('[dictado] coste', JSON.stringify(uso))

    /* Nada de números imposibles: si viene algo raro, se descarta
       en vez de escribirlo en el registro de la clienta. */
    const num = (v, min, max) => {
      const n = Number(v)
      return Number.isFinite(n) && n >= min && n <= max ? n : null
    }

    return res.status(200).json({
      texto,
      uso,
      datos: {
        comidas: (d.comidas || []).filter((c) => c?.que).slice(0, 5),
        agua: d.agua && num(d.agua.cantidad, 1, 20) ? { cantidad: num(d.agua.cantidad, 1, 20), unidad: d.agua.unidad || 'vaso' } : null,
        movimiento: d.movimiento?.que ? { que: d.movimiento.que, minutos: num(d.movimiento.minutos, 0, 600) ?? 0 } : null,
        series: (d.series || []).filter((s) => s?.ejercicio).map((s) => ({
          ejercicio: s.ejercicio,
          kilos: num(s.kilos, 0, 400),
          repeticiones: num(s.repeticiones, 1, 100),
        })).slice(0, 12),
        peso: num(d.peso, 30, 250),
        nota: d.nota || null,
      },
    })
  } catch (e) {
    return res.status(500).json({ error: 'fallo', detalle: String(e).slice(0, 200) })
  }
}
