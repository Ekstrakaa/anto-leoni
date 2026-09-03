import { ZONAS_CUERPO, frescura } from '../restricciones.js'

/* ============================================================
   Mapa de recuperación

   Cada zona se pinta según cuánto hace que la entrenaste:
   caliente cuando está cansada, fría cuando está lista. No es
   un adorno — de acá sale qué entrenás hoy.

   Dibujado en SVG propio, con los colores de la marca.
   ============================================================ */

const FRENTE = [
  ['hombros', 10.5, 20.5, 10, 9, 4.6], ['hombros', 39.5, 20.5, 10, 9, 4.6],
  ['pecho', 20.4, 21, 9, 10, 3.4], ['pecho', 30.6, 21, 9, 10, 3.4],
  ['core', 23.4, 32.5, 13.2, 16, 4],
  ['brazos', 11.2, 30.5, 6.4, 13, 3.2], ['brazos', 42.4, 30.5, 6.4, 13, 3.2],
  ['brazos', 9.6, 44.5, 5.6, 14, 2.8], ['brazos', 44.8, 44.5, 5.6, 14, 2.8],
  ['piernas', 20.2, 50, 6.6, 25, 3.3], ['piernas', 33.2, 50, 6.6, 25, 3.3],
  ['piernas', 21.4, 77, 6, 17, 3], ['piernas', 32.6, 77, 6, 17, 3],
]

const ESPALDA = [
  ['espalda', 22, 17, 16, 8, 3.5],
  ['hombros', 10.5, 20.5, 10, 9, 4.6], ['hombros', 39.5, 20.5, 10, 9, 4.6],
  ['espalda', 18.6, 25.5, 9, 15, 3.6], ['espalda', 32.4, 25.5, 9, 15, 3.6],
  ['espalda', 23.4, 25, 13.2, 13, 3.6],
  ['espalda', 24.6, 38.5, 10.8, 9, 3.2],
  ['brazos', 11.2, 30.5, 6.4, 13, 3.2], ['brazos', 42.4, 30.5, 6.4, 13, 3.2],
  ['brazos', 9.6, 44.5, 5.6, 14, 2.8], ['brazos', 44.8, 44.5, 5.6, 14, 2.8],
  ['gluteos', 21.2, 48, 8.2, 10, 3.8], ['gluteos', 30.6, 48, 8.2, 10, 3.8],
  ['piernas', 20.6, 59, 6.6, 17, 3.3], ['piernas', 32.8, 59, 6.6, 17, 3.3],
  ['piernas', 21.4, 77, 6, 17, 3], ['piernas', 32.6, 77, 6, 17, 3],
]

/* De cansada a lista: coral encendido → verde tranquilo. */
function color(f) {
  if (f >= 0.95) return 'rgba(87, 214, 168, 0.42)'
  if (f >= 0.66) return 'rgba(87, 214, 168, 0.26)'
  if (f >= 0.33) return 'rgba(240, 138, 75, 0.5)'
  return 'rgba(229, 65, 122, 0.72)'
}

function Figura({ zonas, estado, hoy }) {
  return (
    <svg viewBox="0 0 60 98" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="30" cy="9" r="6.4" fill="rgba(247,241,230,.14)" />
      {zonas.map(([z, x, y, w, h, rx], i) => (
        <rect
          key={i}
          x={x} y={y} width={w} height={h} rx={rx}
          fill={color(estado[z] ?? 1)}
          stroke={hoy.includes(z) ? 'var(--rosa)' : 'transparent'}
          strokeWidth={hoy.includes(z) ? 0.9 : 0}
        />
      ))}
    </svg>
  )
}

export default function MapaRecuperacion({ recuperacion = {}, hoy = [] }) {
  const ahora = Date.now()
  const estado = Object.fromEntries(
    ZONAS_CUERPO.map((z) => [z.k, frescura(recuperacion[z.k], ahora)])
  )

  const cansadas = ZONAS_CUERPO.filter((z) => estado[z.k] < 0.5)
  const listas = ZONAS_CUERPO.filter((z) => estado[z.k] >= 0.95)

  return (
    <div className="v recu">
      <div className="recu-figuras">
        <Figura zonas={FRENTE} estado={estado} hoy={hoy} />
        <Figura zonas={ESPALDA} estado={estado} hoy={hoy} />
      </div>
      <div className="recu-txt">
        <p className="mini-t" style={{ margin: 0 }}>Cómo estás hoy</p>
        {cansadas.length ? (
          <p>
            <b>{cansadas.map((z) => z.t.toLowerCase()).join(', ')}</b> todavía se está
            recuperando. Por eso hoy no toca.
          </p>
        ) : (
          <p>Está todo descansado. Se puede entrenar lo que quieras.</p>
        )}
        <div className="recu-clave">
          <span><i style={{ background: color(0) }} /> cansada</span>
          <span><i style={{ background: color(0.5) }} /> a medias</span>
          <span><i style={{ background: color(1) }} /> lista</span>
        </div>
      </div>
    </div>
  )
}
