import { useEffect, useState } from 'react'
import {
  Check, Plus, Minus, Send, RotateCcw, Zap, Loader2, ShieldAlert, ArrowDown,
} from 'lucide-react'
import { ENVASES, META_AGUA, DIAS_SEMANA } from '../datos.js'
import Ejercicio from '../piezas/Ejercicio.jsx'
import Icono from '../piezas/Icono.jsx'
import MapaRecuperacion from '../piezas/MapaRecuperacion.jsx'
import Dictado from '../piezas/Dictado.jsx'
import Paso from '../piezas/Paso.jsx'
import Anillo from '../piezas/Anillo.jsx'
import { usarPlan } from '../usarPlan.js'

const hoyNombre = () => DIAS_SEMANA[new Date().getDay()]

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
  const { agua, comidas, mov, series, lugar, modoCorto, diaCerrado, recuperacion = {} } = st
  const [abiertoEj, setAbiertoEj] = useState(null)
  const [borradores, setBorradores] = useState({})
  /* ?paso=entreno abre ese paso directo: sirve para enseñar la pantalla */
  const [abierto, setAbierto] = useState(
    () => new URLSearchParams(location.search).get('paso') || null
  )

  const { plan, estado } = usarPlan({
    perfil: st.perfil,
    restricciones: st.restricciones?.length ? st.restricciones : ['ninguna'],
    lugar,
    nivel: st.etapaActual >= 3 ? 'Media' : 'Inicio',
    etapa: st.etapaActual,
    recuperacion,
  })

  const todos = plan?.ejercicios || []
  const ejercicios = modoCorto ? todos.slice(0, 3) : todos
  const zonasDeHoy = [...new Set(todos.map((e) => e.z))]

  const ml = agua.llenados * ENVASES[agua.envase].ml
  const litros = (ml / 1000).toFixed(1).replace('.', ',')
  const pct = Math.min(100, Math.round((ml / META_AGUA) * 100))

  const comidasHechas = comidas.filter((c) => c.t).length
  const seriesHechas = Object.values(series).flat().filter(Boolean).length
  const seriesTotales = todos.reduce((s, e) => s + (e.series || 3), 0)

  /* ---------- día ya enviado ---------- */
  if (diaCerrado) {
    return (
      <div className="cerrado anima">
        <span className="cerrado-ic"><Check size={30} strokeWidth={3} /></span>
        <h3>{hoyNombre()} enviado</h3>
        <p>Anto ya tiene tu día. No tenés que hacer nada más hasta mañana.</p>
        <div className="v cuenta">
          <span>Próximo registro en</span>
          <Cuenta />
        </div>
        <div className="v caja" style={{ textAlign: 'left' }}>
          <p className="rotulo" style={{ margin: '0 0 8px' }}>Lo que le llegó a Anto</p>
          <div className="res-l"><b>Comidas</b><span>{comidasHechas} de {comidas.length}</span></div>
          <div className="res-l"><b>Agua</b><span>{litros} L de 2 L</span></div>
          <div className="res-l"><b>Movimiento</b><span>{mov.que || 'sin registrar'}{mov.min > 0 ? ` · ${mov.min} min` : ''}</span></div>
          <div className="res-l"><b>Entreno</b><span>{seriesHechas} series hechas</span></div>
        </div>
        <button type="button" className="cta liso"
          onClick={() => upd({ diaCerrado: false, diasCerrados: Math.max(0, st.diasCerrados - 1) })}>
          <RotateCcw size={15} /> Me olvidé algo · reabrir el día
        </button>
      </div>
    )
  }

  const aplicarDictado = (d) => {
    if (!d) return
    const cambios = {}
    if (d.comidas?.length) {
      const sinTilde = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      cambios.comidas = comidas.map((c) => {
        const dicha = d.comidas.find((x) => sinTilde(x.cual) === sinTilde(c.h))
        return dicha ? { ...c, t: dicha.que, hora: new Date().toTimeString().slice(0, 5), editando: false } : c
      })
    }
    if (d.agua) {
      const porEnvase = { vaso: 0, botella: 1, litro: 2 }
      cambios.agua = { envase: porEnvase[d.agua.unidad] ?? agua.envase, llenados: d.agua.cantidad }
    }
    if (d.movimiento) cambios.mov = { que: d.movimiento.que, min: d.movimiento.minutos || 0, enviado: true }
    if (d.peso) cambios.registrosPeso = [...(st.registrosPeso || []), { kg: d.peso, cuando: Date.now() }]
    if (d.nota) cambios.mensajes = [...(st.mensajes || []), { de: 'yo', t: d.nota, hora: new Date().toTimeString().slice(0, 5) }]
    upd(cambios)
  }

  const enviarComida = (i) => {
    const texto = (borradores[i] ?? comidas[i].t).trim()
    if (!texto) return
    upd({
      comidas: comidas.map((c, j) =>
        j === i ? { ...c, t: texto, hora: new Date().toTimeString().slice(0, 5), editando: false } : c
      ),
    })
  }

  /* ---------- los cuatro pasos del día ---------- */

  const PASOS = [
    {
      k: 'agua',
      titulo: 'El agua',
      ayuda: 'Contá por envases, no por vasos sueltos.',
      pista: 'vaso, botella o termo',
      hecho: agua.llenados > 0,
      resumen: `${litros} L de 2 L`,
      contenido: (
        <>
          <div className="agua-t">
            <span className="agua-n">{litros}<small>L</small></span>
            <span className="agua-m">{agua.llenados} × {ENVASES[agua.envase].n.toLowerCase()}<br />de 2 L</span>
          </div>
          <div className="tubo"><i style={{ width: pct + '%' }} /></div>
          <div className="env">
            {ENVASES.map((e, i) => (
              <button key={e.n} type="button" className={i === agua.envase ? 'on' : ''}
                onClick={() => upd({ agua: { ...agua, envase: i } })}>
                <i><Icono nombre={e.ic} size={16} /></i>
                {e.n}<br />{e.ml} ml
              </button>
            ))}
          </div>
          <div className="mas">
            <button type="button" className="tocar" aria-label="menos"
              onClick={() => upd({ agua: { ...agua, llenados: Math.max(0, agua.llenados - 1) } })}>
              <Minus size={16} />
            </button>
            <button type="button" className="tocar pri"
              onClick={() => upd({ agua: { ...agua, llenados: agua.llenados + 1 } })}>
              <Plus size={16} /> Uno más
            </button>
          </div>
        </>
      ),
    },
    {
      k: 'comidas',
      titulo: 'Lo que comiste',
      ayuda: 'Como te salga. No hay que pesar nada.',
      pista: 'cinco huecos',
      hecho: comidasHechas === comidas.length,
      resumen: `${comidasHechas} de ${comidas.length}`,
      contenido: (
        <>
          {plan?.comidas && (
            <div className="sugerido">
              <p className="mini-t" style={{ margin: '0 0 8px' }}>Lo que te propone Anto</p>
              {['desayuno', 'almuerzo', 'merienda', 'cena'].map((k) =>
                plan.comidas[k] ? (
                  <div className="sug-fila" key={k}><span>{k}</span><b>{plan.comidas[k]}</b></div>
                ) : null
              )}
              {plan.nota && <p className="sug-nota">{plan.nota}</p>}
            </div>
          )}
          {comidas.map((c, i) => {
            const llena = c.t && !c.editando
            return (
              <div className="fila" key={c.h}>
                <span className="fila-h">{c.h}</span>
                <div className="fila-c">
                  {llena ? (
                    <div className="listo">
                      <span className="tk"><Check size={11} strokeWidth={3.5} /></span>
                      <div>
                        <p>{c.t}</p>
                        <span className="met">
                          Enviado {c.hora}
                          <button type="button" onClick={() => {
                            setBorradores({ ...borradores, [i]: c.t })
                            upd({ comidas: comidas.map((x, j) => (j === i ? { ...x, editando: true } : x)) })
                          }}>editar</button>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input className="campo" placeholder="Escribí lo que comiste…"
                        value={borradores[i] ?? c.t ?? ''}
                        onChange={(e) => setBorradores({ ...borradores, [i]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && enviarComida(i)} />
                      <button type="button"
                        className={`enviar${(borradores[i] ?? c.t ?? '').trim() ? '' : ' apagado'}`}
                        onClick={() => enviarComida(i)}>
                        <Send size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </>
      ),
    },
    {
      k: 'mov',
      titulo: 'Si te moviste',
      ayuda: 'Cuenta también la caminata al súper.',
      pista: 'gimnasio, caminata o nada',
      hecho: mov.enviado,
      resumen: mov.que ? `${mov.que}${mov.min ? ` · ${mov.min} min` : ''}` : '',
      contenido: mov.enviado ? (
        <div className="listo">
          <span className="tk"><Check size={11} strokeWidth={3.5} /></span>
          <div>
            <p>{mov.que}{mov.min > 0 ? ` · ${mov.min} minutos` : ''}</p>
            <span className="met">
              Enviado <button type="button" onClick={() => upd({ mov: { ...mov, enviado: false } })}>editar</button>
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="chips">
            {['Gimnasio', 'Caminata', 'Clase', 'En casa', 'No me moví'].map((x) => (
              <button key={x} type="button" className={'chip' + (mov.que === x ? ' on' : '')}
                onClick={() => upd({ mov: { ...mov, que: x, min: x === 'No me moví' ? 0 : mov.min } })}>
                {x}
              </button>
            ))}
          </div>
          {mov.que && mov.que !== 'No me moví' && (
            <div className="reloj">
              <span>¿Cuánto tiempo?</span>
              <div className="reloj-c">
                <button type="button" aria-label="menos" onClick={() => upd({ mov: { ...mov, min: Math.max(0, mov.min - 15) } })}><Minus size={14} /></button>
                <b>{mov.min} min</b>
                <button type="button" aria-label="más" onClick={() => upd({ mov: { ...mov, min: mov.min + 15 } })}><Plus size={14} /></button>
              </div>
            </div>
          )}
          {mov.que && (
            <button type="button" className="enviar" onClick={() => upd({ mov: { ...mov, enviado: true } })}>
              <Send size={12} /> Listo
            </button>
          )}
        </>
      ),
    },
    {
      k: 'entreno',
      titulo: plan?.dia?.t ? `Entrenar · ${plan.dia.t.toLowerCase()}` : 'Tu entreno',
      ayuda: `${todos.length || 5} ejercicios. Marcá cada serie al terminarla.`,
      pista: `${todos.length || 5} ejercicios`,
      hecho: seriesTotales > 0 && seriesHechas >= seriesTotales,
      resumen: `${seriesHechas} de ${seriesTotales} series`,
      contenido: (
        <>
          <div className="lugar">
            {['gimnasio', 'casa'].map((l) => (
              <button key={l} type="button" className={lugar === l ? 'on' : ''}
                onClick={() => { upd({ lugar: l }); setAbiertoEj(null) }}>
                {l === 'gimnasio' ? 'En el gimnasio' : 'En casa'}
              </button>
            ))}
          </div>

          {estado === 'pidiendo' && (
            <div className="cargando-fila">
              <Loader2 size={17} className="girando" />
              <span>Armando tu entreno…</span>
            </div>
          )}

          {estado === 'falla' && (
            <p className="pista" style={{ margin: 0 }}>No se pudo armar el entreno. Probá con conexión.</p>
          )}

          {plan?.revisar && (
            <div className="aviso-revisar">
              <span className="aviso-ic"><ShieldAlert size={16} /></span>
              <div>
                <b>{plan.obligaRevision ? 'Esto lo cierra Anto con vos' : 'Pendiente de que lo vea Anto'}</b>
                <p>Dejamos fuera {plan.descartados} ejercicios y elegimos entre {plan.deCuantos}. Reduce el riesgo, no es un alta médica.</p>
                {plan.notas?.map((n) => (
                  <span className="aviso-nota" key={n.t}><b>{n.t}:</b> {n.nota}</span>
                ))}
              </div>
            </div>
          )}

          {plan?.intro && <p className="intro-dia">{plan.intro}</p>}

          {ejercicios.length > 0 && (
            <div className="ejer-lista">
              {ejercicios.map((ej) => (
                <Ejercicio key={ej.id} ej={ej}
                  hechas={series[ej.id] || []}
                  onSerie={(nuevas) => upd({ series: { ...series, [ej.id]: nuevas } })}
                  abierto={abiertoEj === ej.id}
                  onAbrir={setAbiertoEj} />
              ))}
            </div>
          )}

          {plan?.faltaron?.length > 0 && (
            <p className="pista">No pudimos cubrir: {plan.faltaron.join(', ').toLowerCase()}. Anto lo completa a mano.</p>
          )}

          <button type="button" className="cta liso chico" onClick={() => upd({ modoCorto: !modoCorto })}>
            <Zap size={14} />
            {modoCorto ? 'Volver al entreno completo' : 'Hoy no puedo · versión corta'}
          </button>
        </>
      ),
    },
  ]

  const hechos = PASOS.filter((p) => p.hecho).length
  const indiceActual = PASOS.findIndex((p) => !p.hecho)
  const actual = indiceActual === -1 ? PASOS.length - 1 : indiceActual
  const todoHecho = hechos === PASOS.length

  const cerrarDia = () => {
    const ahora = Date.now()
    const marcas = { ...recuperacion }
    zonasDeHoy.forEach((z) => { marcas[z] = ahora })
    upd({ diaCerrado: true, diasCerrados: st.diasCerrados + 1, recuperacion: marcas })
  }

  return (
    <div className="anima">
      {/* dónde estás, sin leer nada */}
      <div className="dia-cab">
        <div>
          <span className="dia-et">{hoyNombre()}</span>
          <h2>{todoHecho ? 'Está todo' : hechos === 0 ? 'Empecemos' : `Te faltan ${PASOS.length - hechos}`}</h2>
          <p>
            {todoHecho
              ? 'Ya podés cerrar el día y mandárselo a Anto.'
              : `Ahora toca: ${PASOS[actual].titulo.toLowerCase()}`}
          </p>
        </div>
        <Anillo hechos={hechos} total={PASOS.length} />
      </div>

      <Dictado onDatos={aplicarDictado} />

      {/* el hilo del día */}
      <div className="hilo">
        {PASOS.map((p, i) => (
          <Paso
            key={p.k}
            n={i + 1}
            titulo={p.titulo}
            ayuda={p.ayuda}
            resumen={p.resumen}
            pista={p.pista}
            estado={p.hecho ? 'hecho' : i === actual ? 'actual' : 'pendiente'}
            abierto={abierto === null ? i === actual : abierto === p.k}
            onAbrir={() => setAbierto(abierto === p.k ? '' : p.k)}
            ultimo={i === PASOS.length - 1}
          >
            {p.contenido}
          </Paso>
        ))}
      </div>

      <MapaRecuperacion recuperacion={recuperacion} hoy={zonasDeHoy} />

      <button type="button" className={'cta cerrar' + (todoHecho ? ' listo' : '')}
        disabled={!todoHecho} onClick={cerrarDia}>
        {todoHecho ? (
          <>Cerrar el día y enviárselo a Anto</>
        ) : (
          <><ArrowDown size={15} /> Te faltan {PASOS.length - hechos} para cerrar</>
        )}
      </button>
    </div>
  )
}
