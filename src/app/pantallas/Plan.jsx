import {
  Check, MessageCircle, Sparkles, Coffee, Salad, Cookie, Moon, Pill,
  CalendarDays, Target, TrendingUp, Lock, Loader2,
} from 'lucide-react'
import { MENU, ANTO, baja } from '../datos.js'
import { DIAS_DE_LA_SEMANA } from '../restricciones.js'
import { ETAPAS, faltaParaSubir, retoDeLaSemana } from '../progresion.js'
import { usarCoach } from '../usarCoach.js'
import { Rotulo, Chip } from '../piezas/comunes.jsx'
import Icono from '../piezas/Icono.jsx'

const IC_MENU = { desayuno: Coffee, almuerzo: Salad, merienda: Cookie, cena: Moon }
const COLOR_TONO = { bien: 'var(--ok)', ojo: 'var(--coral)', atencion: 'var(--magenta)' }

function Plato({ o, on, onPick }) {
  return (
    <button type="button" className={'plato tocar' + (on ? ' on' : '')} onClick={onPick}>
      <span className="plato-f">
        {o.foto ? <img src={o.foto} alt={o.n} loading="lazy" /> : <span className="plato-e"><Icono nombre={o.ic} size={30} strokeWidth={1.6} /></span>}
        {on && <span className="plato-tk"><Check size={12} strokeWidth={3.5} /></span>}
      </span>
      <b>{o.n}</b>
      <small>{o.d}</small>
    </button>
  )
}

export default function Plan({ st, upd, irAnto }) {
  const { perfil, resp, elegido, lugar, diasCerrados, semana, adherenciaMedia } = st

  const { plan, estado } = usarCoach({ perfil, resp, registro: { diasCerrados, adherencia: adherenciaMedia } })

  const etapa = ETAPAS.find((e) => e.n === st.etapaActual) || ETAPAS[1]
  const semanasCumplidas = Math.max(0, semana - 1)
  const reto = retoDeLaSemana(semana)
  const falta = faltaParaSubir(etapa, { semanas: semana, adherenciaMedia, diasCerrados })
  const supl = (resp.supl || []).filter((s) => s !== 'Ninguno')

  return (
    <div className="anima">
      {/* --- dónde estás y qué falta para subir --- */}
      <Rotulo ic={TrendingUp} extra={`semana ${semana}`}>Tu etapa</Rotulo>
      <div className="v etapa-card">
        <div className="etapa-top">
          <span className="etapa-n">{etapa.n}</span>
          <div>
            <b>{etapa.t}</b>
            <span>{etapa.lema}</span>
          </div>
        </div>
        <p className="etapa-d">{etapa.d}</p>
        <div className="etapa-datos">
          <div><b>{etapa.dias}</b><span>días</span></div>
          <div><b>{etapa.series}</b><span>series</span></div>
          <div><b>{etapa.descanso}s</b><span>descanso</span></div>
        </div>
        <div className="etapa-falta">
          <Target size={13} />
          <span>{falta}</span>
        </div>
      </div>

      {/* --- el reto de la semana --- */}
      <div className="v reto-card">
        <span className="reto-ic"><Target size={17} /></span>
        <div>
          <b>{reto.t}</b>
          <p>{reto.d}</p>
        </div>
        <span className="reto-meta">{reto.meta}×</span>
      </div>

      {/* --- lo que leyó Anto (generado o de respaldo) --- */}
      <Rotulo ic={Sparkles} extra={estado === 'pidiendo' ? 'leyendo…' : 'en tus respuestas'}>
        Lo que vio Anto
      </Rotulo>
      <div className="v caja">
        <p className="titular-ia">{plan.titular}</p>
        {plan.lectura.map((h, i) => (
          <div className="hall" key={i}>
            <span className="pt" style={{ background: COLOR_TONO[h.tono] || 'var(--coral)' }} />
            <div>
              <b>{h.que}</b>
              <p>{h.porque}</p>
            </div>
          </div>
        ))}
        {estado === 'pidiendo' && (
          <p className="pista pensando"><Loader2 size={12} className="girando" /> Anto está leyendo tus respuestas…</p>
        )}
      </div>

      <div className="v caja alta">
        <div className="msg" style={{ margin: 0 }}>
          <span className="msg-foto"><img src={ANTO} alt="Anto" /></span>
          <div className="globo">{plan.mensaje}</div>
        </div>
      </div>

      {plan.objetivoDelMes && (
        <div className="v objetivo">
          <span className="objetivo-et">El objetivo de este mes</span>
          <b>{plan.objetivoDelMes}</b>
          <p>Uno solo. Cuando salga sin pensarlo, sumamos el siguiente.</p>
        </div>
      )}

      {/* --- comidas --- */}
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
            <div className="chips">{m.mas.map((x) => <Chip key={x}>{x}</Chip>)}</div>
            <button type="button" className="cta liso chico" onClick={irAnto}>
              <MessageCircle size={14} /> No me gusta ninguna · pedile otra a Anto
            </button>
          </div>
        </div>
      ))}

      {/* --- suplementos --- */}
      <Rotulo ic={Pill}>Tus suplementos</Rotulo>
      <div className="v caja">
        {supl.length ? (
          <>
            <div className="chips" style={{ marginBottom: 10 }}>
              {supl.map((s) => <span className="chip on" key={s}>{s}</span>)}
            </div>
            <p className="pista" style={{ margin: 0 }}>Con esto alcanza por ahora. No sumes nada nuevo sin consultarle a Anto.</p>
          </>
        ) : (
          <p className="pista" style={{ margin: 0 }}>
            No tomás ninguno, y está bien así. Si en algún momento hace falta, te lo dice Anto — no el mostrador de la tienda.
          </p>
        )}
      </div>

      {/* --- cómo se reparte la semana ---
           Los ejercicios concretos no viven acá: los elige el motor
           cada día, según lo que tengas descansado y lo que puedas
           hacer. Esto es la forma de la semana, no la lista. */}
      <Rotulo ic={CalendarDays} extra={lugar === 'gimnasio' ? 'gimnasio' : 'en casa'}>Cómo se reparte tu semana</Rotulo>
      {DIAS_DE_LA_SEMANA.map((d) => (
        <div className="v dia-card" key={d.k}>
          <div className="dia-top">
            <span className="dia-ic"><Icono nombre={d.ic} size={17} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b>{d.t}</b>
              <span>{d.que}</span>
            </div>
            <span className="dia-n">{etapa.series}×</span>
          </div>
          <div className="dia-lista">
            <div className="dia-ej">
              <span>Trabaja</span>
              <b>{d.zonas}</b>
            </div>
            <div className="dia-ej">
              <span>Descanso entre series</span>
              <b>{etapa.descanso}s</b>
            </div>
          </div>
        </div>
      ))}
      <p className="pista">
        Qué ejercicios te tocan cada día no está escrito de antemano: se elige
        esa mañana, con lo que tengas descansado y con lo que nos dijiste que
        no podés hacer.
      </p>

      {/* --- lo que viene después --- */}
      <Rotulo ic={Lock}>Lo que viene</Rotulo>
      <div className="v caja">
        {ETAPAS.filter((e) => e.n > etapa.n).map((e) => (
          <div className="futuro" key={e.n}>
            <span className="futuro-n">{e.n}</span>
            <div>
              <b>{e.t} · {e.lema}</b>
              <p>{e.dias} días · {e.series} series · {e.descanso}s de descanso. {e.foco}</p>
            </div>
          </div>
        ))}
        {etapa.n === 4 && <p className="pista" style={{ margin: 0 }}>Llegaste a la última etapa. De acá en adelante es sostenerlo.</p>}
      </div>
    </div>
  )
}
