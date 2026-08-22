import { useEffect, useState } from 'react'
import { Check, Plus, Minus, Send, RotateCcw, Zap, Droplets, Utensils, Footprints, Dumbbell } from 'lucide-react'
import { ENVASES, META_AGUA, RUTINAS, DIAS_SEMANA, diaDeHoy } from '../datos.js'
import { Rotulo, Chip } from '../piezas/comunes.jsx'
import Ejercicio from '../piezas/Ejercicio.jsx'
import Icono from '../piezas/Icono.jsx'

const hoyNombre = () => DIAS_SEMANA[new Date().getDay()]

/* cuánto falta para el próximo registro */
function faltaParaManana() {
  const a = new Date()
  const m = new Date(a)
  m.setHours(24, 0, 0, 0)
  const s = Math.floor((m - a) / 1000)
  return Math.floor(s / 3600) + ' h ' + Math.floor((s % 3600) / 60) + ' min'
}

function Cuenta() {
  const [txt, setTxt] = useState(faltaParaManana())
  useEffect(() => {
    const t = setInterval(() => setTxt(faltaParaManana()), 30000)
    return () => clearInterval(t)
  }, [])
  return <b>{txt}</b>
}

export default function Hoy({ st, upd }) {
  const { agua, comidas, mov, series, lugar, modoCorto, diaCerrado } = st
  const foco = new URLSearchParams(location.search).get('foco')
  const [abierto, setAbierto] = useState(() =>
    foco === 'entreno' ? RUTINAS[st.lugar][diaDeHoy().idx].ejercicios[0].id : null
  )
  const [borradores, setBorradores] = useState({})

  const ml = agua.llenados * ENVASES[agua.envase].ml
  const litros = (ml / 1000).toFixed(1).replace('.', ',')
  const pct = Math.min(100, Math.round((ml / META_AGUA) * 100))

  const pendientes = []
  const sinComida = comidas.filter((c) => !c.t).length
  if (sinComida) pendientes.push(`Anotar ${sinComida} comida${sinComida > 1 ? 's' : ''}`)
  if (agua.llenados === 0) pendientes.push('Anotar el agua')
  if (!mov.enviado) pendientes.push('Contar si te moviste')

  const { idx, descanso } = diaDeHoy()
  useEffect(() => {
    if (foco !== 'entreno') return
    setTimeout(() => document.querySelector('.lugar')?.scrollIntoView({ block: 'start' }), 700)
  }, [])
  const rutina = RUTINAS[lugar][idx]
  const ejercicios = modoCorto ? rutina.ejercicios.slice(0, 3) : rutina.ejercicios

  /* ---------- día ya enviado ---------- */
  if (diaCerrado) {
    return (
      <div className="cerrado anima">
        <span className="cerrado-ic">
          <Check size={30} strokeWidth={3} />
        </span>
        <h3>{hoyNombre()} enviado</h3>
        <p>Anto ya tiene tu día. No tenés que hacer nada más hasta mañana.</p>
        <div className="v cuenta">
          <span>Próximo registro en</span>
          <Cuenta />
        </div>
        <div className="v caja" style={{ textAlign: 'left' }}>
          <p className="rotulo" style={{ margin: '0 0 8px' }}>Lo que le llegó a Anto</p>
          <div className="res-l"><b>Comidas</b><span>{comidas.filter((c) => c.t).length} de {comidas.length}</span></div>
          <div className="res-l"><b>Agua</b><span>{litros} L de 2 L</span></div>
          <div className="res-l"><b>Movimiento</b><span>{mov.que || 'sin registrar'}{mov.min > 0 ? ` · ${mov.min} min` : ''}</span></div>
          <div className="res-l"><b>Entreno</b><span>{Object.values(series).flat().filter(Boolean).length} series hechas</span></div>
        </div>
        <button
          type="button"
          className="cta liso"
         
          onClick={() => upd({ diaCerrado: false, diasCerrados: Math.max(0, st.diasCerrados - 1) })}
        >
          <RotateCcw size={15} /> Me olvidé algo · reabrir el día
        </button>
      </div>
    )
  }

  /* ---------- helpers de comidas ---------- */
  const enviarComida = (i) => {
    const texto = (borradores[i] ?? comidas[i].t).trim()
    if (!texto) return
    const nuevas = comidas.map((c, j) =>
      j === i ? { ...c, t: texto, hora: new Date().toTimeString().slice(0, 5), editando: false } : c
    )
    upd({ comidas: nuevas })
  }

  return (
    <div className="anima">
      {/* guía del día */}
      <div className={'guia' + (pendientes.length ? '' : ' ok')}>
        <div className="guia-h">
          <b>{pendientes.length ? `Te faltan ${pendientes.length}` : 'Está todo'}</b>
          <span>{pendientes.length ? `para cerrar el ${hoyNombre().toLowerCase()}` : 'ya podés cerrar el día'}</span>
        </div>
        {pendientes.length > 0 && (
          <div>
            {pendientes.map((p) => (
              <span className="pend" key={p}>{p}</span>
            ))}
          </div>
        )}
      </div>

      {/* 1 · agua */}
      <Rotulo ic={Droplets} extra="meta 2 L">1 · Agua</Rotulo>
      <div className="v caja alta">
        <div className="agua-t">
          <span className="agua-n">
            {litros}
            <small>L</small>
          </span>
          <span className="agua-m">
            {agua.llenados} × {ENVASES[agua.envase].n.toLowerCase()}
            <br />
            de 2 L
          </span>
        </div>
        <div className="tubo">
          <i style={{ width: pct + '%' }}  />
        </div>
        <div className="env">
          {ENVASES.map((e, i) => (
            <button
              key={e.n}
              type="button"
              className={i === agua.envase ? 'on' : ''}
              onClick={() => upd({ agua: { ...agua, envase: i } })}
            >
              <i><Icono nombre={e.ic} size={16} /></i>
              {e.n}
              <br />
              {e.ml} ml
            </button>
          ))}
        </div>
        <div className="mas">
          <button type="button" className="tocar" onClick={() => upd({ agua: { ...agua, llenados: Math.max(0, agua.llenados - 1) } })} aria-label="menos">
            <Minus size={16} />
          </button>
          <button type="button" className="tocar pri" onClick={() => upd({ agua: { ...agua, llenados: agua.llenados + 1 } })}>
            <Plus size={16} /> Uno más
          </button>
        </div>
      </div>

      {/* 2 · comidas */}
      <Rotulo ic={Utensils}>2 · Qué comiste hoy</Rotulo>
      <div className="v caja">
        {comidas.map((c, i) => {
          const llena = c.t && !c.editando
          return (
            <div className="fila" key={c.h}>
              <span className="fila-h">{c.h}</span>
              <div className="fila-c">
                {llena ? (
                  <div className="listo">
                    <span className="tk">
                      <Check size={11} strokeWidth={3.5} />
                    </span>
                    <div>
                      <p>{c.t}</p>
                      <span className="met">
                        Enviado {c.hora}
                        <button
                          type="button"
                          onClick={() => {
                            setBorradores({ ...borradores, [i]: c.t })
                            upd({ comidas: comidas.map((x, j) => (j === i ? { ...x, editando: true } : x)) })
                          }}
                        >
                          editar
                        </button>
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      className="campo"
                      placeholder="Escribí lo que comiste…"
                      value={borradores[i] ?? c.t ?? ''}
                      onChange={(e) => setBorradores({ ...borradores, [i]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && enviarComida(i)}
                    />
                    <button type="button" className="enviar" onClick={() => enviarComida(i)}>
                      <Send size={12} /> Listo
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="pista">
        Escribilo como te salga. No hace falta pesar nada ni contar calorías — de eso se encarga Anto.
      </p>

      {/* 3 · movimiento */}
      <Rotulo ic={Footprints}>3 · Te moviste hoy</Rotulo>
      <div className="v caja">
        {mov.enviado ? (
          <div className="listo">
            <span className="tk"><Check size={11} strokeWidth={3.5} /></span>
            <div>
              <p>
                {mov.que}
                {mov.min > 0 ? ` · ${mov.min} minutos` : ''}
              </p>
              <span className="met">
                Enviado <button type="button" onClick={() => upd({ mov: { ...mov, enviado: false } })}>editar</button>
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="chips">
              {['Gimnasio', 'Caminata', 'Clase', 'En casa', 'No me moví'].map((x) => (
                <Chip key={x} on={mov.que === x} onClick={() => upd({ mov: { ...mov, que: x, min: x === 'No me moví' ? 0 : mov.min } })}>
                  {x}
                </Chip>
              ))}
            </div>
            {mov.que && mov.que !== 'No me moví' && (
              <div className="reloj">
                <span>¿Cuánto tiempo?</span>
                <div className="reloj-c">
                  <button type="button" onClick={() => upd({ mov: { ...mov, min: Math.max(0, mov.min - 15) } })} aria-label="menos"><Minus size={14} /></button>
                  <b>{mov.min} min</b>
                  <button type="button" onClick={() => upd({ mov: { ...mov, min: mov.min + 15 } })} aria-label="más"><Plus size={14} /></button>
                </div>
              </div>
            )}
            {mov.que && (
              <button type="button" className="enviar" onClick={() => upd({ mov: { ...mov, enviado: true } })}>
                <Send size={12} /> Listo
              </button>
            )}
          </>
        )}
      </div>

      {/* 4 · entreno del día */}
      <Rotulo ic={Dumbbell} extra={rutina.dia}>4 · Tu entreno · {rutina.nombre}</Rotulo>
      {descanso && (
        <div className="v caja" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="dia-ic"><Icono nombre="Flame" size={18} /></span>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--crema-2)' }}>
            Hoy toca descanso: una caminata alcanza. Este es tu próximo entreno, por si querés adelantarlo.
          </p>
        </div>
      )}
      <div className="lugar">
        {['gimnasio', 'casa'].map((l) => (
          <button key={l} type="button" className={lugar === l ? 'on' : ''} onClick={() => { upd({ lugar: l }); setAbierto(null) }}>
            {lugar === l && <span className="pastilla" layoutId="pastilla-lugar"  />}
            {l === 'gimnasio' ? 'En el gimnasio' : 'En casa'}
          </button>
        ))}
      </div>
      <div className="v" style={{ padding: 0, overflow: 'hidden' }}>
        {ejercicios.map((ej) => (
          <Ejercicio
            key={ej.id}
            ej={ej}
            hechas={series[ej.id] || []}
            onSerie={(nuevas) => upd({ series: { ...series, [ej.id]: nuevas } })}
            abierto={abierto === ej.id}
            onAbrir={setAbierto}
          />
        ))}
      </div>
      <button
        type="button"
        className="cta liso"
       
        onClick={() => upd({ modoCorto: !modoCorto })}
      >
        <Zap size={15} />
        {modoCorto ? 'Volver a la rutina completa' : 'Hoy no puedo · dame la versión corta'}
      </button>

      {/* cerrar el día */}
      <button
        type="button"
        className="cta"
       
        disabled={pendientes.length> 0}
        whileTap={{ scale: 0.97 }}
        onClick={() => upd({ diaCerrado: true, diasCerrados: st.diasCerrados + 1 })}
      >
        {pendientes.length ? `Cerrar el día · te faltan ${pendientes.length}` : 'Cerrar el día y enviárselo a Anto'}
      </button>
    </div>
  )
}
