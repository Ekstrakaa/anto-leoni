import { useEffect, useState } from 'react'

/* ============================================================
   Pide a /api/plan el entreno de hoy.

   El catálogo entero vive en el servidor: acá sólo llegan los
   cinco ejercicios que le tocan, ya filtrados por sus
   restricciones. La app nunca descarga los 873.

   Se guarda el plan del día para no volver a pedirlo cada vez
   que se entra a la pantalla — la IA cuesta, y el plan de hoy
   es el mismo a las 8 que a las 20.
   ============================================================ */

const CLAVE = 'feelmove_plan'
const hoyISO = () => new Date().toISOString().slice(0, 10)

function guardado(firma) {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) || 'null')
    if (g && g.dia === hoyISO() && g.firma === firma) return g.plan
  } catch {}
  return null
}

function guardar(firma, plan) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ dia: hoyISO(), firma, plan }))
  } catch {}
}

export function usarPlan({ perfil, restricciones, lugar, nivel, etapa, recuperacion, forzar }) {
  const firma = JSON.stringify([restricciones, lugar, nivel, etapa, forzar])
  const [plan, setPlan] = useState(() => guardado(firma))
  const [estado, setEstado] = useState(() => (guardado(firma) ? 'listo' : 'pidiendo'))

  useEffect(() => {
    const yaEsta = guardado(firma)
    if (yaEsta) { setPlan(yaEsta); setEstado('listo'); return }

    let vivo = true
    setEstado('pidiendo')

    fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfil, restricciones, lugar, nivel, etapa, recuperacion, forzar }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => {
        if (!vivo) return
        if (j.error) { setEstado('vacio'); setPlan(j); return }
        setPlan(j)
        setEstado('listo')
        guardar(firma, j)
      })
      .catch(() => vivo && setEstado('falla'))

    return () => { vivo = false }
  }, [firma])

  /* Cuando la persona pide otro ejercicio, se tira el guardado
     para que el próximo pedido vuelva a pasar por el motor. */
  const rehacer = () => {
    try { localStorage.removeItem(CLAVE) } catch {}
    setPlan(null)
    setEstado('pidiendo')
  }

  return { plan, estado, rehacer }
}
