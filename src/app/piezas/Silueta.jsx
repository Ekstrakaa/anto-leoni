/* Silueta con el músculo trabajado marcado. Dibujada en SVG propio,
   con los colores de la marca: no depende de ninguna API. */

const FRENTE = [
  ['neck', 26.6, 15, 6.8, 4, 2],
  ['shoulders', 10.5, 20.5, 10, 9, 4.6], ['shoulders', 39.5, 20.5, 10, 9, 4.6],
  ['chest', 20.4, 21, 9, 10, 3.4], ['chest', 30.6, 21, 9, 10, 3.4],
  ['abdominals', 23.4, 32.5, 13.2, 16, 4],
  ['biceps', 11.2, 30.5, 6.4, 13, 3.2], ['biceps', 42.4, 30.5, 6.4, 13, 3.2],
  ['forearms', 9.6, 44.5, 5.6, 14, 2.8], ['forearms', 44.8, 44.5, 5.6, 14, 2.8],
  ['quadriceps', 20.2, 50, 6.6, 25, 3.3], ['quadriceps', 33.2, 50, 6.6, 25, 3.3],
  ['calves', 21.4, 77, 6, 17, 3], ['calves', 32.6, 77, 6, 17, 3],
]

const ESPALDA = [
  ['traps', 22, 17, 16, 8, 3.5],
  ['shoulders', 10.5, 20.5, 10, 9, 4.6], ['shoulders', 39.5, 20.5, 10, 9, 4.6],
  ['lats', 18.6, 25.5, 9, 15, 3.6], ['lats', 32.4, 25.5, 9, 15, 3.6],
  ['middle back', 23.4, 25, 13.2, 13, 3.6],
  ['lower back', 24.6, 38.5, 10.8, 9, 3.2],
  ['triceps', 11.2, 30.5, 6.4, 13, 3.2], ['triceps', 42.4, 30.5, 6.4, 13, 3.2],
  ['forearms', 9.6, 44.5, 5.6, 14, 2.8], ['forearms', 44.8, 44.5, 5.6, 14, 2.8],
  ['glutes', 21.2, 48, 8.2, 10, 3.8], ['glutes', 30.6, 48, 8.2, 10, 3.8],
  ['hamstrings', 20.6, 59, 6.6, 17, 3.3], ['hamstrings', 32.8, 59, 6.6, 17, 3.3],
  ['calves', 21.4, 77, 6, 17, 3], ['calves', 32.6, 77, 6, 17, 3],
]

function Figura({ zonas, activo }) {
  return (
    <svg viewBox="0 0 60 98" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="30" cy="9" r="6.4" fill="rgba(247,241,230,.16)" />
      {zonas.map(([m, x, y, w, h, rx], i) => (
        <rect key={i} className={'zona' + (m === activo ? ' act' : '')} x={x} y={y} width={w} height={h} rx={rx} />
      ))}
    </svg>
  )
}

export default function Silueta({ musculo }) {
  return (
    <div className="mapa" role="img" aria-label={'Músculo trabajado: ' + musculo}>
      <Figura zonas={FRENTE} activo={musculo} />
      <Figura zonas={ESPALDA} activo={musculo} />
    </div>
  )
}
