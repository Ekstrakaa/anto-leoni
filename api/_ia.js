/* ============================================================
   La IA, con un solo enchufe.

   Por defecto habla con OpenAI (gpt-4o-mini, que es el barato) y
   si no hay clave de OpenAI cae a Gemini. Si no hay ninguna, se
   avisa y la app sigue funcionando con su elección determinista.

   Los dos devuelven JSON obligatorio: OpenAI con
   response_format json_object, Gemini con responseMimeType.

   Devuelve también el gasto de la llamada, para poder mirarlo en
   los registros de Vercel y saber qué cuesta cada cosa de verdad
   en vez de estimarlo.
   ============================================================ */

const MODELO_OPENAI = 'gpt-4o-mini'
const MODELO_GEMINI = 'gemini-2.0-flash'

/* Precio por millón de tokens, para calcular el coste de cada
   llamada. Si cambian las tarifas, se cambia acá. */
const TARIFA = {
  'gpt-4o-mini': { entrada: 0.15, salida: 0.60 },
  'gemini-2.0-flash': { entrada: 0.10, salida: 0.40 },
}

export function proveedor() {
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  return null
}

const coste = (modelo, entrada, salida) => {
  const t = TARIFA[modelo]
  if (!t) return null
  return Number((((entrada * t.entrada) + (salida * t.salida)) / 1e6).toFixed(6))
}

/* Pide un JSON. Devuelve { json, uso } o lanza. */
export async function pedirJSON({ sistema, usuario, maxTokens = 700, temperatura = 0.6 }) {
  const cual = proveedor()
  if (!cual) throw new Error('sin_clave')

  if (cual === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODELO_OPENAI,
        response_format: { type: 'json_object' },
        temperature: temperatura,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: sistema },
          { role: 'user', content: usuario },
        ],
      }),
    })

    if (!r.ok) throw new Error('openai_' + r.status)
    const j = await r.json()
    const texto = j?.choices?.[0]?.message?.content
    if (!texto) throw new Error('respuesta_vacia')

    const entrada = j.usage?.prompt_tokens ?? 0
    const salida = j.usage?.completion_tokens ?? 0
    return {
      json: JSON.parse(texto),
      uso: { modelo: MODELO_OPENAI, entrada, salida, dolares: coste(MODELO_OPENAI, entrada, salida) },
    }
  }

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistema }] },
        contents: [{ role: 'user', parts: [{ text: usuario }] }],
        generationConfig: {
          temperature: temperatura,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
        },
      }),
    }
  )

  if (!r.ok) throw new Error('gemini_' + r.status)
  const j = await r.json()
  const texto = j?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!texto) throw new Error('respuesta_vacia')

  const entrada = j.usageMetadata?.promptTokenCount ?? 0
  const salida = j.usageMetadata?.candidatesTokenCount ?? 0
  return {
    json: JSON.parse(texto),
    uso: { modelo: MODELO_GEMINI, entrada, salida, dolares: coste(MODELO_GEMINI, entrada, salida) },
  }
}
