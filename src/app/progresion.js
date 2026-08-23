/* ============================================================
   La cadena: por dónde se empieza, qué hay que cumplir para subir,
   y cómo aumentan las cargas y los tiempos semana a semana.

   Todo lo de acá son reglas, no adornos: la app calcula el nivel y
   la carga con lo que la persona registró de verdad. Los umbrales
   los define Anto — se cambian en este archivo y nada más.
   ============================================================ */

export const ETAPAS = [
  {
    n: 1,
    t: 'Te conozco',
    lema: 'Una semana mirando, sin cambiar nada',
    d: 'Registrás lo que ya hacés. No tocamos nada todavía.',
    dias: 3,
    series: 3,
    descanso: 60,
    foco: 'Que aparezcas todos los días en la app.',
    reto: 'Registrar 5 de 7 días',
    subeCon: { diasRegistrados: 5, semanas: 1 },
  },
  {
    n: 2,
    t: 'Arranque',
    lema: 'Tres días y el desayuno',
    d: 'Cargas de entrada, movimientos base. Lo importante es aparecer.',
    dias: 3,
    series: 3,
    descanso: 60,
    foco: 'Aprender la técnica sin peso de más.',
    reto: 'Desayunar 6 de 7 días',
    subeCon: { adherencia: 75, semanas: 2 },
  },
  {
    n: 3,
    t: 'Constancia',
    lema: 'Cuatro días y empezamos a subir',
    d: 'Sumamos un día y empiezan a subir las cargas cada semana.',
    dias: 4,
    series: 4,
    descanso: 75,
    foco: 'Progresar de a poco, sin saltarse pasos.',
    reto: 'Cuatro semanas seguidas sin faltar',
    subeCon: { adherencia: 80, semanas: 4 },
  },
  {
    n: 4,
    t: 'Autonomía',
    lema: 'Ya sabés lo que hacés',
    d: 'Elegís vos el día y la carga. Anto supervisa y corrige.',
    dias: 5,
    series: 4,
    descanso: 90,
    foco: 'Sostenerlo sin que nadie te lo recuerde.',
    reto: 'Un mes eligiendo sola',
    subeCon: null,
  },
]

/* Cuánto sube el peso cuando toca subir. Las piernas aguantan más
   salto que los hombros: por eso no es un porcentaje único.
   Son saltos chicos a propósito: en principiantes la progresión
   real es lenta, y pasarse es como se lesiona la gente. */
const SALTO = {
  quadriceps: 2.5, hamstrings: 2.5, glutes: 2.5, calves: 2.5,
  chest: 2, 'middle back': 2, lats: 2, 'lower back': 2,
  shoulders: 1, biceps: 1, triceps: 1,
  abdominals: 0, // en abdomen se suben repeticiones, no kilos
}

/* Techo de la subida automática: +40% sobre el peso inicial.
   A partir de ahí no sigue sola — lo ajusta Anto mirando la técnica. */
const TECHO = 1.4

/* Adherencia de la semana: qué parte de lo pactado se cumplió.
   Cuenta los días registrados y las series hechas, mitad y mitad. */
export function adherencia({ diasCerrados = 0, seriesHechas = 0, seriesPactadas = 0 }) {
  const porDias = Math.min(1, diasCerrados / 7)
  const porSeries = seriesPactadas ? Math.min(1, seriesHechas / seriesPactadas) : 0
  return Math.round((porDias * 0.5 + porSeries * 0.5) * 100)
}

/* En qué etapa está, con lo que hizo de verdad. */
export function etapaDe({ semanas = 1, adherenciaMedia = 0, diasCerrados = 0 }) {
  if (semanas < 1 || diasCerrados < 5) return ETAPAS[0]
  if (semanas < 3 || adherenciaMedia < 75) return ETAPAS[1]
  if (semanas < 7 || adherenciaMedia < 80) return ETAPAS[2]
  return ETAPAS[3]
}

/* Qué peso toca esta semana para un ejercicio, según cuántas semanas
   lleva cumpliendo. Devuelve el número y por qué. */
export function cargaDe(ejercicio, semanasCumplidas) {
  const base = parseFloat(String(ejercicio.peso).replace(',', '.'))
  if (Number.isNaN(base)) {
    // peso corporal: suben las repeticiones
    const extra = Math.min(6, semanasCumplidas * 2)
    return {
      texto: ejercicio.peso,
      repes: extra ? `${ejercicio.repes} + ${extra}` : ejercicio.repes,
      motivo: extra ? `Subiste ${extra} repes por ${semanasCumplidas} semanas cumpliendo` : 'Semana de entrada',
    }
  }
  const salto = SALTO[ejercicio.musculo] ?? 2
  const tope = Math.round(base * TECHO * 2) / 2
  const sinTope = base + salto * semanasCumplidas
  const kilos = Math.min(sinTope, tope)
  const enTecho = sinTope >= tope && semanasCumplidas > 0

  return {
    texto: `${kilos} kg`,
    repes: ejercicio.repes,
    enTecho,
    motivo: enTecho
      ? 'Hasta acá sube sola. De este peso en adelante lo ajusta Anto con vos.'
      : semanasCumplidas
        ? `+${Math.round((kilos - base) * 2) / 2} kg desde que arrancaste`
        : 'Peso de entrada: primero la técnica',
  }
}

/* Qué le falta exactamente para pasar de etapa. En una frase. */
export function faltaParaSubir(etapa, { semanas = 1, adherenciaMedia = 0, diasCerrados = 0 }) {
  if (!etapa.subeCon) return 'Estás en la última etapa. Ahora se trata de sostenerlo.'
  const { diasRegistrados, adherencia: adhMin, semanas: semMin } = etapa.subeCon

  if (diasRegistrados && diasCerrados < diasRegistrados) {
    return `Te faltan ${diasRegistrados - diasCerrados} días registrados para pasar a ${ETAPAS[etapa.n].t}.`
  }
  if (adhMin && adherenciaMedia < adhMin) {
    return `Necesitás llegar al ${adhMin}% de cumplimiento. Vas por ${adherenciaMedia}%.`
  }
  if (semMin && semanas < semMin) {
    const f = semMin - semanas
    return `Te falta${f === 1 ? '' : 'n'} ${f} semana${f === 1 ? '' : 's'} sosteniendo esto y pasás a ${ETAPAS[etapa.n].t}.`
  }
  return `Ya cumpliste todo: en el próximo lunes pasás a ${ETAPAS[etapa.n].t}.`
}

/* El desafío de la semana: uno solo, concreto y comprobable. */
export const RETOS = [
  { k: 'desayuno', t: 'Desayunar todos los días', d: 'Aunque sea una fruta y un café.', meta: 7 },
  { k: 'agua', t: 'Llegar a 2 litros', d: 'Cinco días de siete ya es un montón.', meta: 5 },
  { k: 'pasos', t: 'Caminar 30 minutos', d: 'Los días que no entrenás.', meta: 4 },
  { k: 'sueno', t: 'Acostarte antes de las 12', d: 'El descanso es parte del plan.', meta: 5 },
  { k: 'cocinar', t: 'Cocinar en casa', d: 'Cinco cenas hechas por vos.', meta: 5 },
]

export const retoDeLaSemana = (semana) => RETOS[(semana - 1) % RETOS.length]
