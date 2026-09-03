/* ============================================================
   /api/plan — devuelve el entreno de hoy.

   La clienta nunca recibe el catálogo: sólo los cinco que le
   tocan. El catálogo entero vive acá, en el servidor.

   Orden: filtro duro (código) → elección (IA, si hay clave) →
   verificación (código). Si la IA devuelve un id que no estaba
   permitido, se descarta la respuesta entera y vale la elección
   determinista. Sin clave, funciona igual.
   ============================================================ */

import { candidatos, elegir, plantillaDe, paraLaApp, RESTRICCIONES } from './_motor.js'

export const config = { runtime: 'nodejs' }

const MODELO = 'gemini-2.0-flash'

const SISTEMA = `Sos Anto Leoni, entrenadora personal en Tenerife, eligiendo el entreno de hoy para una clienta que te paga.

Te doy una lista CERRADA de ejercicios ya filtrados como seguros para ella. Tu trabajo es elegir los mejores de esa lista y explicar por qué, en su idioma.

REGLAS QUE NO SE ROMPEN
- Sólo podés usar ids que estén en la lista que te paso. Ni uno más.
- Un id por hueco, sin repetir.
- No inventás cargas, kilos, calorías ni plazos.
- No diagnosticás ni opinás sobre lesiones. Si algo se sale de lo tuyo, decís que lo mira Anto en persona.

CÓMO ESCRIBÍS
- Español de España, tuteando, frases cortas y concretas.
- Nada de animadora de gimnasio. Nada de "¡tú puedes!".
- El porqué de cada ejercicio en una frase, dirigido a ella.

Devolvés SOLO JSON válido:
{
  "intro": "una frase sobre de qué va el día de hoy",
  "elegidos": [{ "id": "<id de la lista>", "porque": "una frase" }]
}`

function pedido({ perfil, restricciones, plantilla, pool, reglas }) {
  const notas = reglas.notas.map((n) => `- ${n.t}: ${n.nota}`).join('\n')
  const lista = pool
    .map((e) => `${e.id} · ${e.n} · ${e.mus.join('/')} · ${e.eq} · ${e.mec}`)
    .join('\n')

  return `Clienta: ${perfil.edad || '?'} años, objetivo ${perfil.meta || 'sin definir'}.
Entrena en: ${perfil.lugar === 'casa' ? 'casa' : 'gimnasio'}.
${notas ? `Restricciones declaradas:\n${notas}\n` : 'Sin restricciones declaradas.\n'}
Hoy toca: ${plantilla.t}. Huecos a llenar, en este orden:
${plantilla.huecos.map((h, i) => `${i + 1}. ${h.papel}`).join('\n')}

LISTA CERRADA de ejercicios permitidos (elegí sólo de acá):
${lista}

Elegí uno por hueco y escribí el porqué de cada uno.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Usá POST' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const {
      perfil = {},
      restricciones = ['ninguna'],
      lugar = 'gimnasio',
      nivel = 'Inicio',
      etapa = 2,
      recuperacion = {},
      forzar = null,
    } = body

    const plantilla = plantillaDe(recuperacion, forzar)
    const { pasan, reglas, descartados } = candidatos({ restricciones, lugar, nivel })

    if (!pasan.length) {
      return res.status(200).json({
        error: 'sin_opciones',
        mensaje: 'Con lo que nos contaste no podemos armar un entreno sin riesgo. Esto lo arma Anto con vos.',
        revisar: true,
      })
    }

    /* 1 · la elección segura, siempre */
    const base = elegir({ pasan, plantilla, lugar })

    /* 2 · la IA afina, si hay clave */
    let intro = null
    let porques = {}
    let generado = false
    let elegidos = base.elegidos

    const clave = process.env.GEMINI_API_KEY
    if (clave && pasan.length > 5) {
      try {
        const permitidos = new Set(pasan.map((e) => e.id))
        const pool = pasan.slice(0, 40)

        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SISTEMA }] },
              contents: [{ role: 'user', parts: [{ text: pedido({ perfil: { ...perfil, lugar }, restricciones, plantilla, pool, reglas }) }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 900, responseMimeType: 'application/json' },
            }),
          }
        )

        if (r.ok) {
          const j = await r.json()
          const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text
          const prop = txt ? JSON.parse(txt) : null

          /* 3 · verificación: ni un id fuera de la lista */
          const ids = (prop?.elegidos || []).map((x) => x.id)
          const limpios = ids.length >= 3 &&
            ids.every((id) => permitidos.has(id)) &&
            new Set(ids).size === ids.length

          if (limpios) {
            const porId = Object.fromEntries(pasan.map((e) => [e.id, e]))
            elegidos = prop.elegidos.map((x, i) => ({
              ...porId[x.id],
              papel: plantilla.huecos[i]?.papel || 'Extra',
            }))
            porques = Object.fromEntries(prop.elegidos.map((x) => [x.id, x.porque]))
            intro = prop.intro || null
            generado = true
          }
        }
      } catch {
        /* si algo falla, queda la elección determinista */
      }
    }

    return res.status(200).json({
      dia: { k: plantilla.k, t: plantilla.t },
      intro,
      generado,
      revisar: reglas.revisar,
      obligaRevision: reglas.obligaRevision,
      notas: reglas.notas,
      descartados,
      deCuantos: pasan.length,
      faltaron: base.faltaron,
      ejercicios: elegidos.map((e) => ({ ...paraLaApp(e, etapa), porque: porques[e.id] || null })),
    })
  } catch (e) {
    return res.status(500).json({ error: 'fallo', detalle: String(e).slice(0, 200) })
  }
}

/* la app necesita la lista de restricciones para el formulario */
export const RESTRICCIONES_PUBLICAS = RESTRICCIONES
