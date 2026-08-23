import { useEffect, useState } from 'react'
import { baja } from './datos.js'

/* Pide el análisis a la IA. Si no hay clave configurada o algo falla,
   devuelve el texto escrito a mano: la app nunca se queda sin contenido
   ni muestra un error a la clienta. */

function respaldo({ perfil = {}, resp = {} }) {
  const desayuna = resp.desayuna || 'Casi nunca'
  const agua = resp.agua || 'Menos de 1 L'
  const mueve = resp.mueve || 'Nada'
  const meta = perfil.meta || 'Bajar grasa'

  return {
    titular: 'Empezamos por el desayuno, no por el gimnasio',
    lectura: [
      { tono: 'atencion', que: `${desayuna} desayunás`, porque: 'Ahí está el hueco. Llegás al almuerzo con muchas horas encima.' },
      { tono: 'ojo', que: `Tomás ${baja(agua)}`, porque: 'Poco para lo que vamos a empezar a hacer. Subimos a 2 L.' },
      { tono: 'ojo', que: `Te movés ${baja(mueve)}`, porque: 'Empezamos por tres días. Con eso alcanza para que el cuerpo cambie.' },
      { tono: 'bien', que: `Objetivo: ${baja(meta)}`, porque: 'Se puede. Pero primero ordenamos las comidas.' },
    ],
    mensaje:
      'No vamos a empezar por el gimnasio a lo loco. Este mes el objetivo es uno: que desayunes y cumplas tres días. Cuando eso salga solo, subimos.',
    objetivoDelMes: 'Desayunar todos los días',
  }
}

export function usarCoach(datos, activo = true) {
  const [plan, setPlan] = useState(() => respaldo(datos))
  const [estado, setEstado] = useState('respaldo') // respaldo | pidiendo | generado

  useEffect(() => {
    if (!activo) return
    let vivo = true
    setEstado('pidiendo')

    fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => {
        if (!vivo || !j?.plan) return
        setPlan(j.plan)
        setEstado('generado')
      })
      .catch(() => {
        if (vivo) setEstado('respaldo')
      })

    return () => {
      vivo = false
    }
  }, [activo, JSON.stringify(datos.resp), datos.perfil?.meta])

  return { plan, estado }
}
