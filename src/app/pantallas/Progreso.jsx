import { useMemo, useState } from 'react'
import { Check, Plus, Minus, Activity, Scale, Flame, Trophy } from 'lucide-react'
import { ETAPAS } from '../progresion.js'
import { Rotulo } from '../piezas/comunes.jsx'

/* ============================================================
   Progreso

   Acá NO hay datos de ejemplo. Antes esta pantalla dibujaba una
   línea de peso inventada de cuatro semanas mientras decía
   "0 pesajes tuyos": parecía su historia y no lo era.

   Con un solo registro tampoco se dibuja línea — una línea de un
   punto no dice nada. Se muestra el número y se pide el segundo.
   ============================================================ */

const kg = (n) => n.toString().replace('.', ',')

/* Los pesos pueden venir del formulario (con `fecha`) o del dictado
   (con `cuando`). Se normalizan acá, no en cada sitio que los lea. */
function normalizar(registros = []) {
  return registros
    .map((r) => {
      const d = r.cuando ? new Date(r.cuando) : null
      return { kg: r.kg, et: r.fecha || (d ? d.getDate() + '/' + (d.getMonth() + 1) : ''), cuando: r.cuando || 0 }
    })
    .sort((a, b) => a.cuando - b.cuando)
}

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
    <svg viewBox={`0 0 ${An} ${Al + 14}`} className="linea-peso" role="img" aria-label="Evolución de tu peso">
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
          <circle cx={X(i)} cy={Y(p.kg)} r="13" fill="transparent" />
          <circle cx={X(i)} cy={Y(p.kg)} r={i === sel ? 4.5 : 2.5}
            fill={i === sel ? '#E5417A' : '#120726'} stroke="#E5417A" strokeWidth="1.6" />
        </g>
      ))}
      <text x={Math.min(An - 34, Math.max(30, X(sel)))} y={Math.max(11, Y(puntos[sel].kg) - 9)}
        textAnchor="middle" className="linea-v">{kg(puntos[sel].kg)} kg</text>
      <text x={mx} y={Al + 11} className="linea-e">{puntos[0].et}</text>
      <text x={An - mx} y={Al + 11} textAnchor="end" className="linea-e">{puntos[ult].et}</text>
    </svg>
  )
}

export default function Progreso({ st, upd }) {
  const { registrosPeso = [], diasCerrados, perfil, racha = 0, mejorRacha = 0 } = st
  const [nuevo, setNuevo] = useState(perfil.peso)
  const [sel, setSel] = useState(null)

  const puntos = useMemo(() => normalizar(registrosPeso), [registrosPeso])
  const etapa = ETAPAS.find((e) => e.n === st.etapaActual) || ETAPAS[1]

  const guardar = () => {
    const hoy = new Date()
    upd({
      registrosPeso: [...registrosPeso, { fecha: hoy.getDate() + '/' + (hoy.getMonth() + 1), kg: nuevo, cuando: Date.now() }],
      perfil: { ...perfil, peso: Math.round(nuevo) },
    })
    setSel(null)
  }

  const diferencia = puntos.length >= 2 ? puntos[puntos.length - 1].kg - puntos[0].kg : null

  return (
    <div className="anima">
      {/* la racha manda: es lo que se pierde si mañana no entra */}
      <Rotulo ic={Flame}>Tu constancia</Rotulo>
      <div className="v racha-grande">
        <div>
          <span className="racha-n">{racha}</span>
          <b>{racha === 1 ? 'día seguido' : 'días seguidos'}</b>
        </div>
        <div className="racha-lado">
          <div><b>{diasCerrados}</b><span>días en total</span></div>
          <div><b>{mejorRacha}</b><span>tu récord</span></div>
        </div>
      </div>
      <p className="pista" style={{ marginBottom: 16 }}>
        {racha === 0
          ? 'Cerrá el día de hoy y arranca la cuenta.'
          : racha >= mejorRacha && racha > 1
            ? 'Estás en tu mejor momento. Mañana no la cortes.'
            : `Te faltan ${mejorRacha - racha + 1} para pasar tu récord.`}
      </p>

      {/* en qué etapa está, con su nombre y no con un número suelto */}
      <Rotulo ic={Activity} extra={`semana ${st.semana}`}>Tu etapa</Rotulo>
      <div className="v caja etapa-mini">
        <span className="etapa-mini-n">{etapa.n}</span>
        <div>
          <b>{etapa.t}</b>
          <p>{etapa.lema}</p>
        </div>
      </div>

      {/* el peso: sin datos inventados */}
      <Rotulo ic={Scale} extra={puntos.length ? `${puntos.length} registro${puntos.length === 1 ? '' : 's'}` : ''}>
        Tu peso
      </Rotulo>
      <div className="v caja">
        {puntos.length >= 2 ? (
          <>
            <LineaPeso puntos={puntos} seleccion={sel} onSel={setSel} />
            {diferencia !== null && (
              <p className="peso-dif">
                {diferencia === 0
                  ? 'Igual que al empezar.'
                  : `${diferencia < 0 ? '−' : '+'}${kg(Math.abs(Math.round(diferencia * 10) / 10))} kg desde tu primer registro.`}
              </p>
            )}
          </>
        ) : puntos.length === 1 ? (
          <div className="peso-uno">
            <b>{kg(puntos[0].kg)} kg</b>
            <span>Tu primer registro, del {puntos[0].et}. Con el segundo ya se ve la línea.</span>
          </div>
        ) : (
          <div className="peso-vacio">
            <Scale size={22} />
            <p>Todavía no te pesaste. Cuando registres el primero, acá aparece tu línea — no la de nadie más.</p>
          </div>
        )}

        <div className="reloj" style={{ marginTop: 4 }}>
          <span>Registrar el de hoy</span>
          <div className="reloj-c">
            <button type="button" aria-label="menos"
              onClick={() => setNuevo((v) => Math.max(35, Math.round((v - 0.5) * 10) / 10))}><Minus size={14} /></button>
            <b>{kg(nuevo)} kg</b>
            <button type="button" aria-label="más"
              onClick={() => setNuevo((v) => Math.min(180, Math.round((v + 0.5) * 10) / 10))}><Plus size={14} /></button>
          </div>
        </div>
        <button type="button" className="enviar" onClick={guardar}>
          <Check size={12} strokeWidth={3.5} /> Guardar
        </button>
        <p className="pista" style={{ margin: '10px 0 0' }}>
          Pesate una vez por semana, siempre a la misma hora. Más seguido solo mete ruido.
        </p>
      </div>

      {/* lo que ya conseguiste, con lo que hizo de verdad */}
      <Rotulo ic={Trophy}>Lo que llevás hecho</Rotulo>
      <div className="v caja">
        {ETAPAS.map((x) => {
          const estado = x.n < etapa.n ? 'pasado' : x.n === etapa.n ? 'actual' : ''
          return (
            <div className={'hito ' + estado} key={x.n}>
              <span className="hito-n">{x.n < etapa.n ? <Check size={12} strokeWidth={3.5} /> : x.n}</span>
              <div>
                <b>{x.t}</b>
                <p>{x.n <= etapa.n ? x.d : `${x.dias} días · ${x.series} series · ${x.descanso}s`}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
