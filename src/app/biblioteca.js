/* ============================================================
   La biblioteca de ejercicios.

   El catálogo (873 ejercicios) no viaja con la app: se pide la
   primera vez que alguien abre la biblioteca y se queda en memoria.
   Así la app sigue arrancando igual de rápido.

   Las fotos vienen de Free Exercise DB por jsDelivr, que es CDN
   de verdad. Son dominio público (The Unlicense).
   ============================================================ */

const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'

export const fotoDe = (id, n = 0) => `${CDN}${encodeURIComponent(id)}/${n}.jpg`

export const ZONAS = [
  { k: 'piernas', t: 'Piernas', ic: 'Footprints' },
  { k: 'gluteos', t: 'Glúteos', ic: 'PersonStanding' },
  { k: 'core', t: 'Abdomen', ic: 'CircleDot' },
  { k: 'espalda', t: 'Espalda', ic: 'MoveVertical' },
  { k: 'pecho', t: 'Pecho', ic: 'Shield' },
  { k: 'hombros', t: 'Hombros', ic: 'MoveHorizontal' },
  { k: 'brazos', t: 'Brazos', ic: 'Dumbbell' },
  { k: 'cuello', t: 'Cuello', ic: 'Minus' },
]

export const LUGARES = [
  { k: 'todo', t: 'Todo' },
  { k: 'casa', t: 'En casa' },
  { k: 'gim', t: 'Gimnasio' },
]

export const NIVELES_F = [
  { k: 'todo', t: 'Cualquiera' },
  { k: 'Inicio', t: 'Inicio' },
  { k: 'Media', t: 'Media' },
  { k: 'Avanzada', t: 'Avanzada' },
]

let cache = null
let pidiendo = null

export function cargarCatalogo() {
  if (cache) return Promise.resolve(cache)
  if (pidiendo) return pidiendo
  pidiendo = fetch('/ejercicios.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((j) => {
      cache = j.map((e) => ({ ...e, busca: quitarTildes((e.n + ' ' + e.en + ' ' + e.mus.join(' ')).toLowerCase()) }))
      return cache
    })
    .finally(() => { pidiendo = null })
  return pidiendo
}

const quitarTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

/* Filtra el catálogo. Nada de esto pega en la red: ya está en memoria. */
export function filtrar(lista, { texto = '', zona = null, lugar = 'todo', nivel = 'todo' } = {}) {
  const q = quitarTildes(texto.trim().toLowerCase())
  return lista.filter((e) => {
    if (zona && e.z !== zona) return false
    if (lugar === 'casa' && !e.casa) return false
    if (lugar === 'gim' && e.casa && e.eq === 'Tu cuerpo') return false
    if (nivel !== 'todo' && e.niv !== nivel) return false
    if (q && !e.busca.includes(q)) return false
    return true
  })
}

/* Alternativas para cambiar un ejercicio.

   No alcanza con que compartan músculo: un estiramiento de cuádriceps
   no reemplaza a una sentadilla. Tienen que ser del mismo tipo de
   trabajo, y a igualdad de todo se prefiere la misma mecánica
   (compuesto con compuesto) y el mismo material. */
export function alternativasDe(lista, ejercicio, { casa = false, cuantas = 6 } = {}) {
  const musculo = ejercicio.musculo || ejercicio.m
  const tipo = ejercicio.tipo || 'Fuerza'

  const puntos = (e) => (e.mec === ejercicio.mec ? 2 : 0) + (e.eq === ejercicio.eq ? 1 : 0)

  return lista
    .filter((e) => e.m === musculo && e.id !== ejercicio.id && !e.crudo && e.util)
    .filter((e) => e.tipo === tipo)
    .filter((e) => (casa ? e.casa : true))
    .sort((a, b) => puntos(b) - puntos(a))
    .slice(0, cuantas)
}
