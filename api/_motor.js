/* ============================================================
   MOTOR DE RESTRICCIONES

   El orden importa y es deliberado:

     1. el código descarta lo que puede hacer daño,
     2. la IA elige DENTRO de lo que quedó,
     3. el código verifica que lo elegido estaba permitido.

   Nunca al revés. Si el modelo decidiera solo, un error suyo se
   convierte en una sentadilla profunda sobre una cadera operada.
   Una regla escrita acá se lee, se discute y se corrige; un
   prompt no. Y de paso la app funciona igual sin clave de IA.

   Esto REDUCE riesgo, no da un alta médica. Todo plan con una
   restricción marcada sale con `revisar: true`.
   ============================================================ */

import CATALOGO from './_catalogo.js'
import { NUCLEO, FILTROS, POR_ID } from './_nucleo.js'

/* ---------- lo que la persona declara ---------- */

export const RESTRICCIONES = [
  { k: 'ninguna', t: 'Nada, estoy bien', d: 'Sin lesiones ni operaciones', sola: true },
  { k: 'cadera', t: 'Cadera', d: 'Operada, prótesis o dolor', revisar: true,
    nota: 'Nada que cierre la cadera a fondo, y sin impacto.' },
  { k: 'rodilla', t: 'Rodilla', d: 'Menisco, ligamentos o dolor', revisar: true,
    nota: 'Sin impacto y sin llegar al final del recorrido.' },
  { k: 'hombro', t: 'Hombro', d: 'Manguito, luxación o dolor', revisar: true,
    nota: 'Nada por encima del hombro.' },
  { k: 'espalda', t: 'Espalda baja', d: 'Hernia, lumbalgia o dolor', revisar: true,
    nota: 'Sin cargar la columna.' },
  { k: 'muneca', t: 'Muñecas', d: 'Túnel carpiano o dolor al apoyar',
    nota: 'Sin apoyar el peso del cuerpo en las manos.' },
  { k: 'embarazo', t: 'Embarazo o posparto', d: 'Cualquier trimestre', revisar: true, obligaRevision: true,
    nota: 'Esto no lo cierra la app: lo arma Anto con tu matrona.' },
  { k: 'tension', t: 'Tensión alta', d: 'Con o sin medicación', revisar: true,
    nota: 'Sin aguantar apretando y sin cargas sobre la cabeza.' },
  { k: 'impacto', t: 'No puedo saltar', d: 'Suelo pélvico, peso o articulaciones',
    nota: 'Todo sin fase de vuelo.' },
  { k: 'suelo', t: 'Me cuesta el suelo', d: 'Bajar y levantarme cuesta',
    nota: 'Todo de pie, sentada o en banco.' },
]

/* ---------- el día de entreno ---------- */

export const PLANTILLAS = [
  { k: 'piernas', t: 'Piernas y glúteos', zonas: ['piernas', 'gluteos'],
    huecos: [
      { m: 'quadriceps', mec: 'Compuesto', papel: 'El grande del día' },
      { m: 'glutes', papel: 'Glúteo' },
      { m: 'hamstrings', papel: 'Parte de atrás' },
      { m: 'calves', papel: 'Gemelos' },
      { m: 'abdominals', papel: 'Core para cerrar' },
    ] },
  { k: 'torso', t: 'Espalda, pecho y brazos', zonas: ['espalda', 'pecho', 'brazos', 'hombros'],
    huecos: [
      { m: 'lats', mec: 'Compuesto', papel: 'El grande del día' },
      { m: 'chest', mec: 'Compuesto', papel: 'Empuje' },
      { m: 'shoulders', papel: 'Hombro' },
      { m: 'biceps', papel: 'Bíceps' },
      { m: 'triceps', papel: 'Tríceps' },
    ] },
  { k: 'completo', t: 'Cuerpo completo', zonas: ['piernas', 'espalda', 'pecho', 'core'],
    huecos: [
      { m: 'quadriceps', mec: 'Compuesto', papel: 'Piernas' },
      { m: 'middle back', mec: 'Compuesto', papel: 'Espalda' },
      { m: 'chest', papel: 'Pecho' },
      { m: 'glutes', papel: 'Glúteo' },
      { m: 'abdominals', papel: 'Core' },
    ] },
]

const SUPLENTES = {
  quadriceps: ['glutes', 'hamstrings'],
  glutes: ['hamstrings', 'quadriceps'],
  hamstrings: ['glutes', 'quadriceps'],
  calves: ['quadriceps', 'glutes'],
  abdominals: ['glutes', 'middle back'],
  lats: ['middle back'],
  'middle back': ['lats', 'shoulders'],
  chest: ['triceps', 'shoulders'],
  shoulders: ['middle back', 'chest'],
  biceps: ['lats', 'middle back'],
  triceps: ['chest', 'shoulders'],
}

const MATERIAL = {
  gimnasio: ['Barra', 'Mancuernas', 'Polea', 'Máquina', 'Tu cuerpo', 'Kettlebell', 'Barra Z', 'Bandas', 'Fitball'],
  casa: ['Tu cuerpo', 'Mancuernas', 'Bandas', 'Kettlebell', 'Fitball', 'Balón medicinal'],
}

const NIVEL_ORDEN = { Inicio: 1, Media: 2, Avanzada: 3 }

/* El núcleo cruzado con el catálogo: etiquetas + fotos + músculo. */
const FICHAS = NUCLEO.map((x) => {
  const c = CATALOGO.find((e) => e.id === x.id)
  return c ? { ...c, ...x } : null
}).filter(Boolean)

export const reglasDe = (claves = []) => {
  const activas = RESTRICCIONES.filter((r) => claves.includes(r.k) && r.k !== 'ninguna')
  return {
    activas,
    revisar: activas.some((r) => r.revisar),
    obligaRevision: activas.some((r) => r.obligaRevision),
    notas: activas.map((r) => ({ t: r.t, nota: r.nota })),
  }
}

/* ---------- el filtro duro ----------
   Cada restricción es una función sobre las etiquetas del núcleo,
   no una búsqueda de palabras en el nombre. */
export function candidatos({ restricciones = [], lugar = 'gimnasio', nivel = 'Inicio' }) {
  const reglas = reglasDe(restricciones)
  const material = MATERIAL[lugar] || MATERIAL.gimnasio
  const techo = NIVEL_ORDEN[nivel] || 1
  const pruebas = reglas.activas.map((r) => FILTROS[r.k]).filter(Boolean)

  const pasan = FICHAS.filter((e) => {
    if (!material.includes(e.eq)) return false
    if ((NIVEL_ORDEN[e.niv] || 3) > techo) return false
    return pruebas.every((f) => f(e))
  })

  const descartados = FICHAS.length - pasan.length
  return { pasan, reglas, descartados }
}

/* ---------- qué toca hoy ----------
   Sale del mapa de recuperación: se entrena lo que está
   descansado, no lo que dice el calendario. */
export function plantillaDe(recuperacion = {}, forzar = null) {
  if (forzar) return PLANTILLAS.find((p) => p.k === forzar) || PLANTILLAS[0]
  const ahora = Date.now()
  const fatiga = (z) => {
    const t = recuperacion[z]
    if (!t) return 0
    return Math.max(0, 1 - (ahora - t) / (72 * 3600000))
  }
  const media = (p) => p.zonas.reduce((s, z) => s + fatiga(z), 0) / p.zonas.length
  return [...PLANTILLAS].sort((a, b) => media(a) - media(b))[0]
}

/* ---------- la selección determinista ---------- */

function puntaje(e, hueco, lugar) {
  let p = 0
  if (hueco.mec && e.mec === hueco.mec) p += 5
  if (e.mec === 'Compuesto') p += 2
  if (lugar === 'casa' && e.casa) p += 3
  if (e.niv === 'Inicio') p += 2
  if (e.eq === 'Tu cuerpo' && lugar === 'casa') p += 2
  return p
}

export function elegir({ pasan, plantilla, lugar = 'gimnasio', evitar = [] }) {
  const usados = new Set(evitar)
  const elegidos = []
  const faltaron = []

  for (const hueco of plantilla.huecos) {
    let puesto = null
    for (const m of [hueco.m, ...(SUPLENTES[hueco.m] || [])]) {
      const ops = pasan
        .filter((e) => e.m === m && !usados.has(e.id))
        .sort((a, b) => puntaje(b, hueco, lugar) - puntaje(a, hueco, lugar))
      if (ops.length) { puesto = ops[0]; break }
    }
    if (!puesto) { faltaron.push(hueco.papel); continue }
    usados.add(puesto.id)
    elegidos.push({ ...puesto, papel: hueco.papel })
  }

  return { elegidos, faltaron }
}

/* Series, repeticiones y descanso según la etapa. */
export function dosis(etapa = 2, e) {
  return {
    series: etapa <= 2 ? 3 : 4,
    descanso: etapa <= 2 ? 60 : etapa === 3 ? 75 : 90,
    repes: e.m === 'abdominals' ? '15' : e.mec === 'Compuesto' ? '10' : '12',
  }
}

/* Lo que se le manda al navegador: sólo los cinco, y sin las
   etiquetas internas ni el nombre en inglés. */
export const paraLaApp = (e, etapa) => {
  const d = dosis(etapa, e)
  return {
    id: e.id, n: e.n, papel: e.papel, m: e.m, mus: e.mus, sec: e.sec,
    eq: e.eq, niv: e.niv, mec: e.mec, im: e.im, z: e.z,
    series: d.series, repes: d.repes, descanso: d.descanso,
  }
}

export { POR_ID, FICHAS }
