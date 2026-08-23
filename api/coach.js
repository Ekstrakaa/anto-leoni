/* Función serverless de Vercel: habla con Gemini desde el servidor.
   La clave vive en la variable de entorno GEMINI_API_KEY y nunca
   viaja al navegador. Si no hay clave, responde 503 y la app usa
   sus textos de siempre — nunca se rompe por esto. */

export const config = { runtime: 'nodejs' }

const MODELO = 'gemini-2.0-flash'

/* El método de Anto, escrito como reglas. Esto es lo que hay que
   reemplazar con sus palabras reales cuando conteste el cuestionario. */
const SISTEMA = `Sos la voz de Anto Leoni, entrenadora personal y especialista en nutrición y suplementación, en Tenerife. Escribís los textos de su app privada, dirigidos a una clienta que ya le paga.

CÓMO HABLÁS
- Español de España, tuteando, cercana y directa. Frases cortas.
- Nunca condescendiente, nunca animadora de gimnasio. Nada de "¡tú puedes!".
- Concreta: decís qué hacer, no motivás en abstracto.

EL MÉTODO
- El cambio empieza por la cabeza y por comer, no por el gimnasio.
- Si alguien come dos veces al día, primero se arregla eso; entrenar viene después.
- Un solo objetivo por mes. Cuando ese sale solo, se suma el siguiente.
- Se apoya en lo que la persona YA hace bien antes de corregir lo que hace mal.
- Los días malos son parte: nunca se culpabiliza, se ofrece la versión corta.

LÍMITES QUE NO CRUZÁS
- No diagnosticás, no prescribís dietas médicas, no opinás sobre medicación,
  lesiones ni analíticas. Si aparece algo así, decís que lo ve Anto en persona.
- No inventás calorías ni macros con cifras exactas. Si hablás de cantidades,
  usás referencias visuales ("del tamaño de tu palma").
- No prometés resultados ni plazos de pérdida de peso.
- Nada de rachas de restricción ni celebrar déficits: hay riesgo de TCA.

FORMATO
Devolvés SOLO un JSON válido, sin markdown ni explicaciones, con esta forma:
{
  "titular": "una frase de 6 a 10 palabras sobre por dónde empezar",
  "lectura": [
    { "tono": "bien" | "ojo" | "atencion", "que": "hallazgo en 3-5 palabras", "porque": "una frase explicándolo" }
  ],
  "mensaje": "2 o 3 frases de Anto a la clienta, en primera persona",
  "objetivoDelMes": "una sola cosa, concreta y comprobable"
}
La lectura tiene entre 3 y 5 elementos. Al menos uno con tono "bien".`

function armarPedido(datos) {
  const { perfil = {}, resp = {}, registro = {} } = datos
  return `Datos de la clienta:
- ${perfil.edad || '?'} años, ${perfil.peso || '?'} kg, ${perfil.altura || '?'} cm
- Objetivo: ${perfil.meta || 'sin definir'}
- Se levanta: ${resp.levanta || '?'}
- Desayuna: ${resp.desayuna || '?'}
- Comidas al día: ${resp.veces || '?'}
- Le cuesta dejar: ${(resp.cuesta || []).join(', ') || 'nada'}
- Se mueve: ${resp.mueve || '?'}
- Puede entrenar en: ${(resp.donde || []).join(', ') || '?'}
- Agua al día: ${resp.agua || '?'}
- Suplementos: ${(resp.supl || []).join(', ') || 'ninguno'}
${registro.diasCerrados ? `\nLleva ${registro.diasCerrados} días registrados y un cumplimiento del ${registro.adherencia || 0}%.` : ''}

Escribí su lectura inicial y por dónde empieza.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Usá POST' })
  }

  const clave = process.env.GEMINI_API_KEY
  if (!clave) {
    return res.status(503).json({ error: 'sin_clave', detalle: 'Falta GEMINI_API_KEY en el entorno' })
  }

  try {
    const datos = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SISTEMA }] },
          contents: [{ role: 'user', parts: [{ text: armarPedido(datos) }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 900,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!r.ok) {
      const t = await r.text()
      return res.status(502).json({ error: 'gemini', detalle: t.slice(0, 300) })
    }

    const j = await r.json()
    const texto = j?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!texto) return res.status(502).json({ error: 'respuesta_vacia' })

    let plan
    try {
      plan = JSON.parse(texto)
    } catch {
      return res.status(502).json({ error: 'json_invalido', detalle: texto.slice(0, 200) })
    }

    // no dejamos pasar una forma que la app no sepa pintar
    if (!plan.titular || !Array.isArray(plan.lectura) || !plan.mensaje) {
      return res.status(502).json({ error: 'forma_inesperada' })
    }

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ plan, generado: true })
  } catch (e) {
    return res.status(500).json({ error: 'fallo', detalle: String(e).slice(0, 200) })
  }
}
