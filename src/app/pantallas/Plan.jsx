import { Check, MessageCircle, Sparkles, Coffee, Salad, Cookie, Moon, Pill, CalendarDays } from 'lucide-react'
import { MENU, RUTINAS, ANTO, baja } from '../datos.js'
import { Rotulo, Chip } from '../piezas/comunes.jsx'
import Icono from '../piezas/Icono.jsx'

const IC_MENU = { desayuno: Coffee, almuerzo: Salad, merienda: Cookie, cena: Moon }

function Plato({ o, on, onPick }) {
  return (
    <button type="button" className={'plato tocar' + (on ? ' on' : '')} onClick={onPick}>
      <span className="plato-f">
        {o.foto ? <img src={o.foto} alt={o.n} loading="lazy" /> : <span className="plato-e"><Icono nombre={o.ic} size={30} strokeWidth={1.6} /></span>}
        {on && (
          <span className="plato-tk">
            <Check size={12} strokeWidth={3.5} />
          </span>
        )}
      </span>
      <b>{o.n}</b>
      <small>{o.d}</small>
    </button>
  )
}

export default function Plan({ st, upd, irAnto }) {
  const { perfil, resp, elegido, lugar } = st
  const meta = perfil.meta || 'Bajar grasa'
  const supl = (resp.supl || []).filter((s) => s !== 'Ninguno')

  return (
    <div className="anima">
      {/* lo que vio Anto en las respuestas */}
      <Rotulo ic={Sparkles} extra="en tus respuestas">Lo que vio Anto</Rotulo>
      <div className="v caja">
        <div className="hall">
          <span className="pt" style={{ background: 'var(--magenta)' }} />
          <div>
            <b>{resp.desayuna || 'Casi nunca'} desayunás</b>
            <p>Ahí está el hueco. Llegás al almuerzo con muchas horas encima.</p>
          </div>
        </div>
        <div className="hall">
          <span className="pt" style={{ background: 'var(--coral)' }} />
          <div>
            <b>Tomás {baja(resp.agua || 'Menos de 1 L')}</b>
            <p>Poco para lo que vamos a empezar a hacer. Subimos a 2 L.</p>
          </div>
        </div>
        <div className="hall">
          <span className="pt" style={{ background: 'var(--coral)' }} />
          <div>
            <b>Te movés {baja(resp.mueve || 'Nada')}</b>
            <p>Empezamos por tres días. Con eso alcanza para que el cuerpo cambie.</p>
          </div>
        </div>
        <div className="hall">
          <span className="pt" style={{ background: 'var(--ok)' }} />
          <div>
            <b>Objetivo: {baja(meta)}</b>
            <p>Se puede. Pero primero ordenamos las comidas, después el gimnasio.</p>
          </div>
        </div>
      </div>

      <div className="v caja alta">
        <div className="msg" style={{ margin: 0 }}>
          <span className="msg-foto">
            <img src={ANTO} alt="Anto" />
          </span>
          <div className="globo">
            No vamos a empezar por el gimnasio a lo loco. <b>Este mes el objetivo es uno: que desayunes y cumplas tres días.</b> Cuando eso salga solo, subimos.
          </div>
        </div>
      </div>

      {/* comidas del día, con opciones de verdad */}
      {MENU.map((m) => (
        <div key={m.k}>
          <Rotulo ic={IC_MENU[m.k]} extra="elegís vos">{m.titulo}</Rotulo>
          <p className="pista" style={{ margin: '-4px 2px 10px' }}>{m.ayuda}</p>
          <div className="platos">
            {m.con.map((o) => (
              <Plato key={o.k} o={o} on={elegido[m.k] === o.k} onPick={() => upd({ elegido: { ...elegido, [m.k]: o.k } })} />
            ))}
          </div>
          <div className="v caja" style={{ marginTop: 10 }}>
            <p className="mini-t">O cualquiera de estas {m.mas.length}</p>
            <div className="chips">
              {m.mas.map((x) => (
                <Chip key={x}>{x}</Chip>
              ))}
            </div>
            <button type="button" className="cta liso chico" onClick={irAnto}>
              <MessageCircle size={14} /> No me gusta ninguna · pedile otra a Anto
            </button>
          </div>
        </div>
      ))}

      {/* suplementos, según lo que contestó */}
      <Rotulo ic={Pill}>Tus suplementos</Rotulo>
      <div className="v caja">
        {supl.length ? (
          <>
            <div className="chips" style={{ marginBottom: 10 }}>
              {supl.map((s) => (
                <span className="chip on" key={s}>{s}</span>
              ))}
            </div>
            <p className="pista" style={{ margin: 0 }}>
              Con esto alcanza por ahora. No sumes nada nuevo sin consultarle a Anto.
            </p>
          </>
        ) : (
          <p className="pista" style={{ margin: 0 }}>
            No tomás ninguno, y está bien así. Si en algún momento hace falta, te lo dice Anto — no el mostrador de la tienda.
          </p>
        )}
      </div>

      {/* la semana entera, de un vistazo */}
      <Rotulo ic={CalendarDays} extra={lugar === 'gimnasio' ? 'gimnasio' : 'en casa'}>Tu semana de entreno</Rotulo>
      {RUTINAS[lugar].map((d) => (
        <div className="v caja dia-card" key={d.dia}>
          <span className="dia-ic"><Icono nombre={d.ic} size={18} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>{d.dia} · {d.nombre}</b>
            <p>{d.ejercicios.map((e) => e.n).join(' · ')}</p>
          </div>
          <span className="dia-n">{d.ejercicios.length}</span>
        </div>
      ))}
      <p className="pista">
        Martes y jueves: caminata de 30 minutos. El finde, descanso de verdad — ahí es cuando el cuerpo cambia.
      </p>
    </div>
  )
}
