/* ============================================================
   Convierte el material de Free Exercise DB (dominio público,
   The Unlicense) en NUESTRO catálogo: nombres en español de
   España, vocabulario de gimnasio y sólo los campos que la app
   usa de verdad.

   No copiamos el repositorio. Tomamos las fotos y los datos duros
   (músculo, equipo, nivel) y reescribimos todo lo demás.

   Se vuelve a correr con:
     node herramientas/armar-ejercicios.mjs          (genera)
     node herramientas/armar-ejercicios.mjs --sucios (qué falta pulir)
   ============================================================ */

import { writeFileSync } from 'fs'
import {
  MUSCULO, ZONA, EQUIPO, NIVEL, TIPO, FUERZA, MECANICA,
  FRASES, MOVIMIENTOS, SIMPLES, COMPLEMENTO, MATIZ, SOBRAN, A_MANO,
} from './vocabulario.mjs'

const ORIGEN = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'

const MOV_ORDEN = [...MOVIMIENTOS].sort((a, b) => b[0].length - a[0].length)
const sinTilde = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

/* Palabras sueltas que quedaron sin traducir en este nombre. */
const sobras = []

function traducir(nombre, equipment) {
  if (A_MANO[nombre]) return { es: A_MANO[nombre], limpio: true }

  /* "Brachialis-SMR" y compañía son masaje con rodillo, no ejercicios. */
  const smr = nombre.match(/^(.+?)[\s-]*SMR$/i)
  if (smr) {
    const zona = traducir(smr[1].trim(), 'foam roll')
    const t = zona.es.replace(/^Ejercicio\s*/, '').replace(/\s*con foam roller$/, '').trim()
    return { es: 'Masaje con rodillo ' + (t.startsWith('de ') ? t : 'de ' + t.toLowerCase()), limpio: zona.limpio }
  }

  let texto = ' ' + nombre.toLowerCase().replace(/[()]/g, ' ').replace(/\//g, ' ').replace(/\s+/g, ' ') + ' '

  // 1ª pasada: frases enteras -> «español»
  for (const [re, es] of FRASES) texto = texto.replace(re, es)

  // 2ª pasada: el movimiento
  let cabeza = null
  for (const [en, es] of MOV_ORDEN) {
    const re = new RegExp('\\b' + en.replace(/[-]/g, '[- ]') + '(e?s)?\\b')
    if (re.test(texto)) { cabeza = es; texto = texto.replace(re, ' '); break }
  }

  // 3ª pasada: lo que sobra
  const matices = []
  const complementos = []
  const raros = []

  for (const bruto of texto.split(/\s+/)) {
    if (!bruto) continue
    if (bruto.startsWith('«')) { matices.push(bruto.slice(1, -1).replace(/_/g, ' ')); continue }
    const t = bruto.replace(/[^a-z0-9'-]/g, '')
    if (!t || t === '-' || /^\d+$/.test(t)) continue
    const uno = SIMPLES[t] ? t : SIMPLES[t.replace(/es$/, '')] ? t.replace(/es$/, '')
      : SIMPLES[t.replace(/s$/, '')] ? t.replace(/s$/, '') : null
    if (!cabeza && uno) { cabeza = SIMPLES[uno]; continue }
    if (MATIZ[t] !== undefined) { if (MATIZ[t]) matices.push(MATIZ[t]); continue }
    if (COMPLEMENTO[t]) { complementos.push(COMPLEMENTO[t]); continue }
    if (SOBRAN.has(t)) continue
    if (uno) { matices.push(SIMPLES[uno].toLowerCase()); continue }
    raros.push(t)
    sobras.push(t)
  }

  if (!cabeza) return { es: nombre, limpio: false, crudo: true }
  if (raros.length) return { es: nombre, limpio: false, crudo: true }

  /* El equipo sólo se añade si el nombre no lo dice ya:
     "Cruce en polea" no puede terminar en "Cruce en polea en polea". */
  const eq = EQUIPO[equipment]
  const dicho = (cabeza + ' ' + matices.join(' ')).toLowerCase()
  const enMaquina = /multipower|en máquina/.test(dicho)
  const con = eq && eq.con && !enMaquina && !dicho.includes(eq.con) ? eq.con : ''

  const es = [cabeza, complementos[0] || '', matices.join(' '), con]
    .filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()

  return { es: es.charAt(0).toUpperCase() + es.slice(1), limpio: true }
}

/* ---------- armado ---------- */

const res = await fetch(ORIGEN)
const crudo = await res.json()

const catalogo = crudo
  .filter((e) => e.images && e.images.length >= 1)
  .map((e) => {
    const prim = e.primaryMuscles || []
    const eq = EQUIPO[e.equipment] || EQUIPO.other
    const t = traducir(e.name, e.equipment)
    const util = ['beginner', 'intermediate'].includes(e.level) &&
      ['strength', 'stretching'].includes(e.category) &&
      !['other', 'foam roll'].includes(e.equipment)
    return {
      id: e.id,
      n: t.es,
      en: e.name,
      ...(t.crudo ? { crudo: 1 } : {}),
      m: prim[0] || 'abdominals',
      mus: prim.map((x) => MUSCULO[x]).filter(Boolean),
      sec: (e.secondaryMuscles || []).map((x) => MUSCULO[x]).filter(Boolean),
      z: ZONA[prim[0]] || 'core',
      eq: eq.es,
      casa: eq.casa ? 1 : 0,
      niv: NIVEL[e.level] || 'Media',
      tipo: TIPO[e.category] || 'Fuerza',
      f: FUERZA[e.force] || '',
      mec: MECANICA[e.mechanic] || '',
      im: e.images.length,
      ...(util ? { util: 1 } : {}),
    }
  })
  /* Primero los que Anto puede programar, después los que están en
     español, y recién al final los que quedaron con el nombre inglés. */
  .sort((a, b) =>
    (b.util || 0) - (a.util || 0) ||
    (a.crudo || 0) - (b.crudo || 0) ||
    a.n.localeCompare(b.n, 'es')
  )

const salida = JSON.stringify(catalogo)
writeFileSync(new URL('../public/ejercicios.json', import.meta.url), salida)

const limpios = catalogo.filter((e) => !e.crudo).length
console.log('catálogo:', catalogo.length, 'ejercicios ·', (Buffer.byteLength(salida) / 1024).toFixed(0), 'KB')
console.log('en español:', limpios, '(' + Math.round((limpios / catalogo.length) * 100) + '%) · sin traducir:', catalogo.length - limpios)
const porZona = {}
catalogo.forEach((e) => (porZona[e.z] = (porZona[e.z] || 0) + 1))
console.log('por zona:', Object.entries(porZona).map(([a, b]) => a + ' ' + b).join(' · '))
console.log('para casa:', catalogo.filter((e) => e.casa).length, '· recomendables:', catalogo.filter((e) => e.util).length)

if (process.argv.includes('--sucios')) {
  const cuenta = {}
  sobras.forEach((t) => (cuenta[t] = (cuenta[t] || 0) + 1))
  console.log('\nPALABRAS QUE FALTAN EN EL VOCABULARIO:')
  console.log(Object.entries(cuenta).sort((a, b) => b[1] - a[1]).slice(0, 80)
    .map(([a, b]) => a + ':' + b).join('  '))
}

if (process.argv.includes('--ver')) {
  console.log('\n--- muestra ---')
  catalogo.filter((e) => !e.crudo).forEach((e, i) => {
    if (i % 15 === 0) console.log('  ' + e.n.padEnd(48) + '| ' + e.en)
  })
}
