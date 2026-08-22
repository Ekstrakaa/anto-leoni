import { useMemo, useState } from 'react'
import { Check, Plus, Minus, Activity, Scale, Trophy } from 'lucide-react'
import { NIVELES } from '../datos.js'
import { Rotulo } from '../piezas/comunes.jsx'

/* Serie de arranque, marcada como ejemplo hasta que haya registros reales. */
const DEMO = [
  { et: 'sem 1', kg: 72.0 },
  { et: 'sem 2', kg: 71.6 },
  { et: 'sem 3', kg: 71.8 },
  { et: 'sem 4', kg: 71.2 },
]

/* Línea de peso: una sola serie, un solo tono de marca, texto en tinta.
   El último punto va destacado y con su valor al lado. */
function LineaPeso({ puntos, seleccion, onSel }) {
  const An = 300, Al = 96, mx = 14, my = 14
  const vals = puntos.map((p) => p.kg)
  const min = Math.min(...vals), max = Math.max(...vals)
  const rango = Math.max(0.5, max - min)
  const X = (i) => mx + (i * (An - mx * 2)) / Math.max(1, puntos.length - 1)
  const Y = (v) => my + (Al - my * 2) * (1 - (v - min) / rango)
  const linea = puntos.map((p, i) => `${X(i)},${Y(p.kg)}`).join(' ')
  const area = `M ${mx},${Al - 4} L ${linea.replaceAll(' ', ' L ')} L ${X(puntos.length - 1)},${Al - 4} Z`
  const ult = puntos.length - 1
  const sel = seleccion ?? ult

  return (
    <svg viewBox={`0 0 ${An} ${Al + 14}`} className="linea-peso" role="img" aria-label="Evolución del peso">
      <defs>
        <linearGradient id="gPeso" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E5417A" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#E5417A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#gPeso)" />
      <polyline points={linea} fill="none" stroke="#E5417A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {puntos.map((p, i) => (
        <g key={i} onClick={() => onSel(i)} style={{ cursor: 'pointer' }}>
          {/* blanco de toque generoso, invisible */}
          <circle cx={X(i)} cy={Y(p.kg)} r="13" fill="transparent" />
          <circle
            cx={X(i)} cy={Y(p.kg)}
            r={i === sel ? 4.5 : 2.5}
            fill={i === sel ? '#E5417A' : '#120726'}
            stroke="#E5417A"
            strokeWidth="1.6"
          />
        </g>
      ))}
      {/* valor del punto elegido, en tinta */}
      <text x={Math.min(An - 34, Math.max(30, X(sel)))} y={Math.max(11, Y(puntos[sel].kg) - 9)} textAnchor="middle" className="linea-v">
        {puntos[sel].kg.toString().replace('.', ',')} kg
      </text>
      {/* etiquetas de borde, discretas */}
      <text x={mx} y={Al + 11} className="linea-e">{puntos[0].et}</text>
      <text x={An - mx} y={Al + 11} textAnchor="end" className="linea-e">{puntos[ult].et}</text>
    </svg>
  )
}

export default function Progreso({ st, upd }) {
  const { registrosPeso, diasCerrados, perfil } = st
  const [nuevo, setNuevo] = useState(perfil.peso)
  const [sel, setSel] = useState(null)

  const puntos = useMemo(
    () => [...DEMO, ...registrosPeso.map((r, i) => ({ et: r.fecha, kg: r.kg }))],
    [registrosPeso]
  )
  const soloDemo = registrosPeso.length === 0

  return (
    <div className="anima">
      {/* números que salen del uso real */}
      <Rotulo ic={Activity}>Cómo venís</Rotulo>
      <div className="tiles">
        <div className="v tile">
          <b>{diasCerrados}</b>
          <span>día{diasCerrados === 1 ? '' : 's'} enviado{diasCerrados === 1 ? '' : 's'}</span>
        </div>
        <div className="v tile">
          <b>2</b>
          <span>nivel actual</span>
        </div>
        <div className="v tile">
          <b>{registrosPeso.length}</b>
          <span>pesajes tuyos</span>
        </div>
      </div>

      {/* el peso */}
      <Rotulo ic={Scale} extra={soloDemo ? 'datos de ejemplo' : 'con tus registros'}>Tu peso</Rotulo>
      <div className="v caja">
        <LineaPeso puntos={puntos} seleccion={sel} onSel={setSel} />
        <div className="reloj" style={{ marginTop: 4 }}>
          <span>Registrar el de hoy</span>
          <div className="reloj-c">
            <button type="button" onClick={() => setNuevo((v) => Math.max(35, Math.round((v - 0.5) * 10) / 10))} aria-label="menos"><Minus size={14} /></button>
            <b>{nuevo.toString().replace('.', ',')} kg</b>
            <button type="button" onClick={() => setNuevo((v) => Math.min(180, Math.round((v + 0.5) * 10) / 10))} aria-label="más"><Plus size={14} /></button>
          </div>
        </div>
        <button
          type="button"
          className="enviar"
          onClick={() => {
            const hoy = new Date()
            const fecha = hoy.getDate() + '/' + (hoy.getMonth() + 1)
            upd({ registrosPeso: [...registrosPeso, { fecha, kg: nuevo }], perfil: { ...perfil, peso: Math.round(nuevo) } })
            setSel(null)
          }}
        >
          <Check size={12} strokeWidth={3.5} /> Guardar
        </button>
        <p className="pista" style={{ margin: '10px 0 0' }}>
          Pesate una vez por semana, siempre a la misma hora. Más seguido solo mete ruido.
        </p>
      </div>

      {/* el recorrido */}
      <Rotulo ic={Trophy}>Tu recorrido</Rotulo>
      <div className="v caja">
        {NIVELES.map((x) => {
          const estado = x.n < 2 ? 'pasado' : x.n === 2 ? 'actual' : ''
          return (
            <div className={'paso ' + estado} key={x.n}>
              <span className="paso-n">{x.n < 2 ? <Check size={12} strokeWidth={3.5} /> : x.n}</span>
              <div>
                <b>{x.t}</b>
                <p>{x.d}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="v caja">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
          <span style={{ color: 'var(--crema-2)' }}>Días para el nivel 3</span>
          <b>{Math.max(0, 14 - diasCerrados)} de 14</b>
        </div>
        <div className="tubo" style={{ marginTop: 8, marginBottom: 0 }}>
          <i style={{ width: Math.min(100, Math.round((diasCerrados / 14) * 100)) + '%' }}  />
        </div>
      </div>
    </div>
  )
}
