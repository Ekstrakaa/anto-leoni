import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Dumbbell, TrendingUp, MessageCircle } from 'lucide-react'
import { TANDAS, COMIDAS_BASE, ELEGIDO_BASE, DIAS_SEMANA } from './datos.js'
import Entrada from './pantallas/Entrada.jsx'
import { Tanda, Armando } from './pantallas/Arranque.jsx'
import Hoy from './pantallas/Hoy.jsx'
import Plan from './pantallas/Plan.jsx'
import Progreso from './pantallas/Progreso.jsx'
import Anto from './pantallas/Anto.jsx'

const CLAVE = 'feelmove_v1'

const BASE = {
  etapa: 'entrada', // entrada | arranque | armando | app
  tanda: 0,
  vista: 'hoy',
  perfil: { edad: 30, peso: 70, altura: 165, meta: null },
  resp: {},
  lugar: 'gimnasio',
  elegido: ELEGIDO_BASE,
  agua: { envase: 0, llenados: 0 },
  comidas: COMIDAS_BASE,
  mov: { que: '', min: 0, enviado: false },
  series: {},
  modoCorto: false,
  diaCerrado: false,
  diasCerrados: 0,
  registrosPeso: [],
  mensajes: [],
}

/* ?demo=hoy|plan|progreso|anto salta directo a esa pantalla con datos
   de muestra — sirve para enseñarle la app a alguien sin completar todo. */
function estadoInicial() {
  const demo = new URLSearchParams(location.search).get('demo')
  if (demo) {
    const lleno = {
      ...BASE,
      etapa: demo === 'arranque' ? 'arranque' : 'app',
      vista: ['hoy', 'plan', 'progreso', 'anto'].includes(demo) ? demo : 'hoy',
      perfil: { edad: 34, peso: 72, altura: 165, meta: 'Bajar grasa' },
      resp: { levanta: '6 a 8', desayuna: 'Casi nunca', veces: '2', cuesta: ['Dulce', 'Picar entre horas'], mueve: 'Nada', donde: ['Gimnasio'], agua: 'Menos de 1 L', supl: ['Proteína'] },
      agua: { envase: 1, llenados: 3 },
      comidas: COMIDAS_BASE.map((c, i) =>
        i === 0 ? { ...c, t: 'Café con leche y dos tostadas', hora: '08:15' } : i === 2 ? { ...c, t: 'Pollo con arroz y ensalada', hora: '14:30' } : c
      ),
      diasCerrados: 4,
    }
    return { st: lleno, demo: true }
  }
  try {
    const g = localStorage.getItem(CLAVE)
    if (g) return { st: { ...BASE, ...JSON.parse(g) }, demo: false }
  } catch {}
  return { st: BASE, demo: false }
}

export default function App() {
  const inicial = useMemo(estadoInicial, [])
  const [st, setSt] = useState(inicial.st)
  const upd = (patch) => setSt((s) => ({ ...s, ...patch }))

  /* lo registrado queda guardado en el teléfono */
  useEffect(() => {
    if (inicial.demo) return
    try {
      const { mensajes, ...resto } = st
      localStorage.setItem(CLAVE, JSON.stringify({ ...resto, mensajes: mensajes.filter((m) => !m.img) }))
    } catch {}
  }, [st])

  const seguirTanda = () => {
    if (st.tanda < TANDAS.length - 1) return upd({ tanda: st.tanda + 1 })
    upd({ etapa: 'armando' })
    setTimeout(() => setSt((s) => ({ ...s, etapa: 'app', vista: 'plan' })), 2600)
  }

  const reiniciar = () => {
    try { localStorage.removeItem(CLAVE) } catch {}
    setSt(BASE)
  }

  const enArranque = st.etapa === 'arranque'
  const enApp = st.etapa === 'app'
  const hoy = DIAS_SEMANA[new Date().getDay()]

  const sub = enArranque
    ? `Tanda ${st.tanda + 1} de ${TANDAS.length} · un minuto en total`
    : st.etapa === 'armando'
      ? ''
      : { hoy: `${hoy} · nivel 2`, plan: 'Hecho con tus respuestas', progreso: 'Semana a semana', anto: 'Ella, del otro lado' }[st.vista]

  const NAV = [
    { k: 'hoy', t: 'Hoy', I: Flame },
    { k: 'plan', t: 'Mi plan', I: Dumbbell },
    { k: 'progreso', t: 'Progreso', I: TrendingUp },
    { k: 'anto', t: 'Anto', I: MessageCircle },
  ]

  return (
    <div className="marco">
      <div className="cielo">
        <i className="luz a" />
        <i className="luz b" />
        <i className="luz c" />
        <i className="luz d" />
      </div>
      <div className="velo" />
      <div className="grano" />

      {st.etapa === 'entrada' ? (
        <Entrada onEntrar={() => upd({ etapa: 'arranque' })} />
      ) : (
        <div id="panel" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <header className="top">
            <div className="fila">
              <span className="marca">FEEL&MOVE</span>
              <span className="yo">L</span>
            </div>
            <p className="hola">
              {enArranque ? (
                <>Empecemos, <em>Lucía</em></>
              ) : st.etapa === 'armando' ? (
                <>Un momento…</>
              ) : (
                <>Buenas, <em>Lucía</em></>
              )}
            </p>
            {sub && <p className="sub">{sub}</p>}
          </header>

          {enArranque && (
            <div className="barra-tandas">
              {TANDAS.map((_, i) => (
                <i key={i}>
                  <span style={{ width: i <= st.tanda ? '100%' : '0%' }} />
                </i>
              ))}
            </div>
          )}

          <div className="cuerpo">
            {enArranque && (
              <Tanda
                tanda={st.tanda}
                perfil={st.perfil}
                resp={st.resp}
                onPerfil={(p) => upd({ perfil: p })}
                onResp={(r) => upd({ resp: r })}
                onSeguir={seguirTanda}
              />
            )}
            {st.etapa === 'armando' && <Armando />}
            {enApp && (
              <div key={st.vista} className="anima">
                  {st.vista === 'hoy' && <Hoy st={st} upd={upd} />}
                  {st.vista === 'plan' && <Plan st={st} upd={upd} irAnto={() => upd({ vista: 'anto' })} />}
                  {st.vista === 'progreso' && <Progreso st={st} upd={upd} />}
                  {st.vista === 'anto' && <Anto st={st} upd={upd} onReiniciar={reiniciar} />}
                </div>
              )}
          </div>

          {enApp && (
            <nav className="nav">
              {NAV.map(({ k, t, I }) => (
                <button key={k} type="button" className={st.vista === k ? 'on' : ''} onClick={() => upd({ vista: k })}>
                  <span className="ic-w">
                    <I size={17} strokeWidth={st.vista === k ? 2.4 : 2} />
                  </span>
                  {t}
                </button>
              ))}
            </nav>
          )}
          <p className="pie">Prototipo · fotos de ejercicios: Free Exercise DB (dominio público) · los planes los define Anto</p>
        </div>
      )}
    </div>
  )
}
