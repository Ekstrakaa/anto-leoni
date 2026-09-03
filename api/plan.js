/* ============================================================
   /api/plan — el entreno y la comida de hoy, en una sola llamada.

   La clienta nunca recibe el catálogo: sólo los cinco ejercicios
   que le tocan. Los 873 viven acá, en el servidor.

   Orden, y es el que importa:
     1. el código descarta lo peligroso  (api/_motor.js)
     2. la IA elige DENTRO de lo que quedó
     3. el código verifica cada id que volvió

   Si la IA devuelve un id que no estaba permitido, se tira la
   respuesta entera y vale la elección determinista. Sin clave de
   IA funciona igual, sólo que sin los textos.

   COSTE. Una llamada por clienta y por día, y el plan se guarda
   en el teléfono hasta la medianoche. El prompt se mantiene
   corto a propósito: la lista de ejercicios va como
   `id|nombre|músculo`, sin descripciones, y se corta en 30.
   ============================================================ */

import { candidatos, elegir, plantillaDe, paraLaApp } from './_motor.js'
import { pedirJSON, proveedor } from './_ia.js'

export const config = { runtime: 'nodejs' }

const SISTEMA = `Sos Anto Leoni, entrenadora y especialista en nutrición en Tenerife. Elegís el día de una clienta que te paga.

Te paso una LISTA CERRADA de ejercicios ya filtrados como seguros para ella.

REGLAS QUE NO SE ROMPEN
- Sólo ids de esa lista. Ni uno inventado, ni uno repetido.
- No das kilos ni cargas: eso lo calcula la app.
- No das calorías, macros ni gramos. Cantidades por referencia visual
  ("del tamaño de tu palma", "un plato hondo").
- No prometés resultados ni plazos. No diagnosticás.
- Nada de celebrar restricción ni déficit: hay riesgo de TCA.

CÓMO ESCRIBÍS
Español de España, tuteando, frases cortas. Nada de animadora de gimnasio.

Devolvés SOLO este JSON:
{"intro":"una frase sobre el día","ej":[{"id":"<de la lista>","s":<series>,"r":"<repes>","p":"por qué, una frase"}],"com":{"desayuno":"","almuerzo":"","merienda":"","cena":""},"nota":"una frase sobre la comida de hoy"}`

/* Prompt corto a propósito: cada línea de la lista es lo mínimo
   que la IA necesita para elegir bien. */
function armarPedido({ perfil, plantilla, pool, reglas, lugar, series }) {
  const notas = reglas.notas.map((n) => `${n.t}: ${n.nota}`).join(' · ')
  const lista = pool.map((e) => `${e.id}|${e.n}|${e.mus[0]}`).join('\n')
  const huecos = plantilla.huecos.map((h, i) => `${i + 1}.${h.papel}`).join(' ')

  return `${perfil.edad || '?'} años. Objetivo: ${perfil.meta || 'sin definir'}. Entrena en ${lugar}.
${notas ? `Restricciones: ${notas}` : 'Sin restricciones.'}
Come ${perfil.veces || '3'} veces al día. Le cuesta dejar: ${(perfil.cuesta || []).join(', ') || 'nada'}.

Hoy: ${plantilla.t}. Huecos: ${huecos}. Series por ejercicio: ${series}.

LISTA (id|nombre|músculo):
${lista}

Elegí uno por hueco, en orden, y armá las cuatro comidas del día.`
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
        mensaje: 'Con lo que nos contaste no se puede armar un entreno sin riesgo. Esto lo arma Anto con vos.',
        revisar: true,
      })
    }

    /* 1 · la elección segura, que siempre existe */
    const base = elegir({ pasan, plantilla, lugar })
    let elegidos = base.elegidos
    let intro = null
    let comidas = null
    let nota = null
    let porques = {}
    let uso = null
    let generado = false

    /* 2 · la IA afina, si hay clave */
    if (proveedor() && pasan.length > 5) {
      try {
        const permitidos = new Set(pasan.map((e) => e.id))
        const pool = pasan.slice(0, 30)
        const series = etapa <= 2 ? 3 : 4

        const { json: prop, uso: gasto } = await pedirJSON({
          sistema: SISTEMA,
          usuario: armarPedido({ perfil, plantilla, pool, reglas, lugar, series }),
          maxTokens: 700,
          temperatura: 0.7,
        })
        uso = gasto

        /* 3 · verificación: ni un id fuera de la lista */
        const ids = (prop?.ej || []).map((x) => x.id)
        const valido =
          ids.length >= 3 &&
          ids.every((id) => permitidos.has(id)) &&
          new Set(ids).size === ids.length

        if (valido) {
          const porId = Object.fromEntries(pasan.map((e) => [e.id, e]))
          elegidos = prop.ej.map((x, i) => ({
            ...porId[x.id],
            papel: plantilla.huecos[i]?.papel || 'Extra',
          }))
          porques = Object.fromEntries(prop.ej.map((x) => [x.id, x.p]))
          intro = prop.intro || null
          comidas = prop.com || null
          nota = prop.nota || null
          generado = true
        } else {
          console.warn('[plan] la IA devolvió ids fuera de la lista, se usa la elección determinista')
        }
      } catch (e) {
        console.warn('[plan] sin IA:', String(e).slice(0, 120))
      }
    }

    if (uso) console.log('[plan] coste', JSON.stringify(uso))

    return res.status(200).json({
      dia: { k: plantilla.k, t: plantilla.t },
      intro,
      comidas,
      nota,
      generado,
      revisar: reglas.revisar,
      obligaRevision: reglas.obligaRevision,
      notas: reglas.notas,
      descartados,
      deCuantos: pasan.length,
      faltaron: base.faltaron,
      uso,
      ejercicios: elegidos.map((e) => ({ ...paraLaApp(e, etapa), porque: porques[e.id] || null })),
    })
  } catch (e) {
    return res.status(500).json({ error: 'fallo', detalle: String(e).slice(0, 200) })
  }
}
