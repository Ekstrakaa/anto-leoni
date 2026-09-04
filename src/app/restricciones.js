/* Las etiquetas del formulario. El filtro de verdad vive en el
   servidor (api/_motor.js): acá sólo están los textos, para que
   nadie pueda tocar las reglas de seguridad desde el navegador. */

/* Las mismas notas que aplica el motor en api/_motor.js. Acá están
   para poder escribirlas en la hoja imprimible: si sólo viven en el
   servidor, el papel sale con el título y sin la regla. */
export const RESTRICCIONES = [
  { k: 'ninguna', t: 'Nada, estoy bien', d: 'Sin lesiones ni operaciones', sola: true },
  { k: 'cadera', t: 'Cadera', d: 'Operada, prótesis o dolor',
    nota: 'Nada que cierre la cadera a fondo, y sin impacto.' },
  { k: 'rodilla', t: 'Rodilla', d: 'Menisco, ligamentos o dolor',
    nota: 'Sin impacto y sin llegar al final del recorrido.' },
  { k: 'hombro', t: 'Hombro', d: 'Manguito, luxación o dolor',
    nota: 'Nada por encima del hombro.' },
  { k: 'espalda', t: 'Espalda baja', d: 'Hernia, lumbalgia o dolor',
    nota: 'Sin cargar la columna.' },
  { k: 'muneca', t: 'Muñecas', d: 'Túnel carpiano o dolor al apoyar',
    nota: 'Sin apoyar el peso del cuerpo en las manos.' },
  { k: 'embarazo', t: 'Embarazo o posparto', d: 'Cualquier trimestre',
    nota: 'Esto no lo cierra la app: lo arma Anto con tu matrona.' },
  { k: 'tension', t: 'Tensión alta', d: 'Con o sin medicación',
    nota: 'Sin aguantar apretando y sin cargas sobre la cabeza.' },
  { k: 'impacto', t: 'No puedo saltar', d: 'Suelo pélvico, peso o articulaciones',
    nota: 'Todo sin fase de vuelo.' },
  { k: 'suelo', t: 'Me cuesta el suelo', d: 'Bajar y levantarme cuesta',
    nota: 'Todo de pie, sentada o en banco.' },
]

/* Las zonas del mapa de recuperación, en el orden en que se leen. */
export const ZONAS_CUERPO = [
  { k: 'piernas', t: 'Piernas' },
  { k: 'gluteos', t: 'Glúteos' },
  { k: 'espalda', t: 'Espalda' },
  { k: 'pecho', t: 'Pecho' },
  { k: 'hombros', t: 'Hombros' },
  { k: 'brazos', t: 'Brazos' },
  { k: 'core', t: 'Abdomen' },
]

/* Cuánto tarda un músculo en volver a estar fresco. */
export const HORAS_RECUPERACION = 72

export function frescura(marca, ahora = Date.now()) {
  if (!marca) return 1
  const horas = (ahora - marca) / 3600000
  return Math.min(1, Math.max(0, horas / HORAS_RECUPERACION))
}

/* La forma de la semana. Los ejercicios concretos no están acá:
   los elige el motor cada día. Esto espeja PLANTILLAS del servidor. */
export const DIAS_DE_LA_SEMANA = [
  { k: 'piernas', t: 'Día de piernas', que: 'Piernas y glúteos', zonas: 'Cuádriceps, glúteos, isquios, gemelos', ic: 'Footprints' },
  { k: 'torso', t: 'Día de torso', que: 'Espalda, pecho y brazos', zonas: 'Dorsales, pecho, hombros, bíceps, tríceps', ic: 'Dumbbell' },
  { k: 'completo', t: 'Día completo', que: 'Todo el cuerpo', zonas: 'Piernas, espalda, pecho y abdomen', ic: 'Flame' },
]
