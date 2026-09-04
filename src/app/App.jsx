import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Dumbbell, TrendingUp, MessageCircle } from 'lucide-react'
import { TANDAS, COMIDAS_BASE, ELEGIDO_BASE, DIAS_SEMANA, clavesDeLesiones } from './datos.js'
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
  restricciones: ['ninguna'],
  recuperacion: {},
  elegido: ELEGIDO_BASE,
  agua: { envase: 0, llenados: 0 },
  comidas: COMIDAS_BASE,
  mov: { que: '', min: 0, enviado: false },
  series: {},
  modoCorto: false,
  diaCerrado: false,
  diasCerrados: 0,
  registrosPeso: [],
  semana: 1,
  etapaActual: 2,
  adherenciaMedia: 0,
  mensajes: [],
  /* de qué día es el registro que está en pantalla, y cuántos días
     seguidos lleva cerrados. Sin esto la app servía un solo día. */
  diaDelRegistro: null,
  ultimoCierre: null,
  racha: 0,
  mejorRacha: 0,
}

export const HOY_ISO = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

const ayerDe = (iso) => {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

/* Lo que se borra al cambiar el día y lo que se conserva.
   Se conserva todo lo acumulado: racha, días cerrados, peso,
   recuperación y la conversación con Anto. */
function abrirDiaNuevo(guardado) {
  const hoy = HOY_ISO()
  if (guardado.diaDelRegistro === hoy) return guardado

  /* si se saltó un día, la racha se corta */
  const seguida = guardado.ultimoCierre === ayerDe(hoy) || guardado.ultimoCierre === hoy
  return {
    ...guardado,
    diaDelRegistro: hoy,
    agua: { ...BASE.agua, envase: guardado.agua?.envase ?? 0 },
    comidas: COMIDAS_BASE,
    mov: { que: '', min: 0, enviado: false },
    series: {},
    modoCorto: false,
    diaCerrado: false,
    racha: seguida ? guardado.racha || 0 : 0,
  }
}

/* ?demo=hoy|plan|progreso|anto salta directo a esa pantalla con datos
   de muestra — sirve para enseñarle la app a alguien sin completar todo. */
function estadoInicial() {
  const demo = new URLSearchParams(location.search).get('demo')
  if (demo) {
    const lleno = {
      ...BASE,
      etapa: demo === 'arranque' ? 'arranque' : demo === 'armando' ? 'armando' : 'app',
      /* ?tanda=2 para poder ver cada tanda del alta */
      tanda: Number(new URLSearchParams(location.search).get('tanda') || 0),
      vista: ['hoy', 'plan', 'progreso', 'anto'].includes(demo) ? demo : 'hoy',
      perfil: { edad: 34, peso: 72, altura: 165, meta: 'Bajar grasa' },
      resp: { levanta: '6 a 8', desayuna: 'Casi nunca', veces: '2', cuesta: ['Dulce', 'Picar entre horas'], mueve: 'Nada', donde: ['Gimnasio'], agua: 'Menos de 1 L', supl: ['Proteína'] },
      agua: { envase: 1, llenados: 3 },
      comidas: COMIDAS_BASE.map((c, i) =>
        i === 0 ? { ...c, t: 'Café con leche y dos tostadas', hora: '08:15' } : i === 2 ? { ...c, t: 'Pollo con arroz y ensalada', hora: '14:30' } : c
      ),
      diasCerrados: 4,
      semana: 3,
      etapaActual: 2,
      adherenciaMedia: 72,
      racha: 4,
      mejorRacha: 6,
      ultimoCierre: HOY_ISO(),
      /* ?listo=1 deja el día terminado, para ver el estado de cierre */
      ...(new URLSearchParams(location.search).get('listo')
        ? {
            comidas: COMIDAS_BASE.map((c) => ({ ...c, t: 'Anotado', hora: '13:00' })),
            mov: { que: 'Caminata', min: 45, enviado: true },
          }
        : {}),
      /* ?lesion=cadera,hombro — para ver cómo cambia el entreno */
      restricciones: (new URLSearchParams(location.search).get('lesion') || 'ninguna').split(','),
    }
    return { st: lleno, demo: true }
  }
  try {
    const g = localStorage.getItem(CLAVE)
    if (g) return { st: abrirDiaNuevo({ ...BASE, ...JSON.parse(g) }), demo: false }
  } catch {}
  return { st: { ...BASE, diaDelRegistro: HOY_ISO() }, demo: false }
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

  /* La app suele quedar abierta toda la noche en el teléfono. Si pasa
     la medianoche con la pantalla puesta, el día se abre igual. */
  useEffect(() => {
    if (inicial.demo) return
    const t = setInterval(() => {
      setSt((s) => (s.diaDelRegistro === HOY_ISO() ? s : abrirDiaNuevo(s)))
    }, 60000)
    const alVolver = () => setSt((s) => (s.diaDelRegistro === HOY_ISO() ? s : abrirDiaNuevo(s)))
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [])

  const seguirTanda = () => {
    if (st.tanda < TANDAS.length - 1) return upd({ tanda: st.tanda + 1 })
    /* las lesiones que marcó se traducen a las claves del motor */
    upd({ etapa: 'armando', restricciones: clavesDeLesiones(st.resp.lesiones) })
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
    ? `Tanda ${st.tanda + 1} de ${TANDAS.length} · dos minutos en total`
    : st.etapa === 'armando'
      ? ''
      : { plan: 'Lo que armó con tus respuestas', progreso: 'Lo que llevás hecho', anto: 'Ella, del otro lado' }[st.vista]

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
            {!(enApp && st.vista === 'hoy') && <p className="hola">
              {enArranque ? (
                <>Empecemos, <em>Lucía</em></>
              ) : st.etapa === 'armando' ? (
                <>Un momento…</>
              ) : (
                { plan: <>Tu <em>plan</em></>, progreso: <>Tu <em>progreso</em></>, anto: <>Hablá con <em>Anto</em></> }[st.vista]
              )}
            </p>}
            {sub && !(enApp && st.vista === 'hoy') && <p className="sub">{sub}</p>}
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
