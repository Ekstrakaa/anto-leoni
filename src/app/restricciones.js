/* Las etiquetas del formulario. El filtro de verdad vive en el
   servidor (api/_motor.js): acá sólo están los textos, para que
   nadie pueda tocar las reglas de seguridad desde el navegador. */

export const RESTRICCIONES = [
  { k: 'ninguna', t: 'Nada, estoy bien', d: 'Sin lesiones ni operaciones', sola: true },
  { k: 'cadera', t: 'Cadera', d: 'Operada, prótesis o dolor' },
  { k: 'rodilla', t: 'Rodilla', d: 'Menisco, ligamentos o dolor' },
  { k: 'hombro', t: 'Hombro', d: 'Manguito, luxación o dolor' },
  { k: 'espalda', t: 'Espalda baja', d: 'Hernia, lumbalgia o dolor' },
  { k: 'muneca', t: 'Muñecas', d: 'Túnel carpiano o dolor al apoyar' },
  { k: 'embarazo', t: 'Embarazo o posparto', d: 'Cualquier trimestre' },
  { k: 'tension', t: 'Tensión alta', d: 'Con o sin medicación' },
  { k: 'impacto', t: 'No puedo saltar', d: 'Suelo pélvico, peso o articulaciones' },
  { k: 'suelo', t: 'Me cuesta el suelo', d: 'Bajar y levantarme cuesta' },
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
