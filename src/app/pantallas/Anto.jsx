import { useRef, useState } from 'react'
import { Camera, Send, Eye, ArrowLeft, RotateCcw, Video, CalendarDays, MessageCircle, PenLine } from 'lucide-react'
import { ANTO, VIDEO_ANTO, baja } from '../datos.js'
import { Rotulo } from '../piezas/comunes.jsx'

export default function Anto({ st, upd, onReiniciar }) {
  const { perfil, resp, mensajes, comidas, agua, mov } = st
  const [verAnto, setVerAnto] = useState(false)
  const [texto, setTexto] = useState('')
  const archivo = useRef(null)

  const enviar = (img) => {
    const t = texto.trim()
    if (!t && !img) return
    upd({ mensajes: [...mensajes, { t: t || '📷 Foto', img: img || null }] })
    setTexto('')
  }

  /* ---------- lo que ve Anto: armado con los datos reales ---------- */
  if (verAnto) {
    const comidasHoy = comidas.filter((c) => c.t)
    return (
      <div className="dela anima">
        <Rotulo ic={Eye} extra="de vos">Lo que ve Anto</Rotulo>
        <div className="v caja">
          <div className="ficha">
            <span className="yo">L</span>
            <div>
              <b>Lucía · {perfil.edad} años</b>
              <small>
                {perfil.peso} kg · {perfil.altura} cm · {baja(perfil.meta || 'Bajar grasa')}
              </small>
            </div>
            <span className="alerta">Atención</span>
          </div>
          <div className="resu">
            <p>
              <b>Arranque:</b> {baja(resp.desayuna || 'Casi nunca')} desayuna, come {resp.veces || '2'} veces al día, toma{' '}
              {baja(resp.agua || 'Menos de 1 L')} de agua y se mueve {baja(resp.mueve || 'Nada')}.
            </p>
            <p>
              <b>Le cuesta dejar:</b> {(resp.cuesta || ['Dulce']).join(', ').toLowerCase()}.
            </p>
            <p>
              <b>Hoy:</b> registró {comidasHoy.length} comida{comidasHoy.length === 1 ? '' : 's'}, {agua.llenados} envase
              {agua.llenados === 1 ? '' : 's'} de agua
              {mov.enviado ? ` y contó: ${baja(mov.que)}` : ' y todavía no contó si se movió'}.
            </p>
          </div>
          <p className="resu-f">
            Vista previa armada con lo que registró. El resumen redactado lo genera la IA cuando se conecte la clave de la API — y Anto lo revisa antes de responder.
          </p>
        </div>
        <button type="button" className="cta liso" onClick={() => setVerAnto(false)}>
          <ArrowLeft size={15} /> Volver a mi app
        </button>
      </div>
    )
  }

  return (
    <div className="anima">
      {/* el video real de Anto */}
      <Rotulo ic={Video}>Un mensaje de Anto</Rotulo>
      <div className="v video-caja">
        <video src={VIDEO_ANTO} controls playsInline preload="metadata" />
      </div>

      {/* la clase */}
      <Rotulo ic={CalendarDays}>Tu clase</Rotulo>
      <div className="v clase">
        <div className="clase-f">
          <img src={ANTO} alt="Anto" />
        </div>
        <div className="clase-c">
          <b>Martes · 18:30</b>
          <span>45 minutos por Zoom · técnica de sentadilla</span>
          <button type="button" className="cta" style={{ marginTop: 12 }}>
            Entrar a la clase
          </button>
        </div>
      </div>

      {/* mensajes */}
      <Rotulo ic={MessageCircle}>Mensajes</Rotulo>
      <div className="v caja">
        <div className="msg">
          <span className="msg-foto">
            <img src={ANTO} alt="Anto" />
          </span>
          <div>
            <div className="globo">
              Leí tus respuestas. Empezamos suave: <b>desayuno y tres días</b>. Nada más por ahora.
            </div>
            <span className="msg-h">Hoy, 09:12</span>
          </div>
        </div>
        {mensajes.map((m, i) => (
          <div className="msg mio" key={i}>
            <div className="globo">
              {m.img && <img className="msg-img" src={m.img} alt="Foto enviada" />}
              {m.t}
              <span className="msg-h">Enviado · sin leer</span>
            </div>
          </div>
        ))}
      </div>

      {/* escribirle */}
      <Rotulo ic={PenLine}>Escribile</Rotulo>
      <div className="v caja">
        <input
          className="campo"
          placeholder="Contale cómo vas…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
          <button type="button" className="enviar tocar" onClick={() => enviar()}>
            <Send size={12} /> Enviar
          </button>
          <button type="button" className="adj tocar" onClick={() => archivo.current?.click()}>
            <Camera size={13} /> Foto
          </button>
          <input
            ref={archivo}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) enviar(URL.createObjectURL(f))
              e.target.value = ''
            }}
          />
        </div>
        <p className="pista" style={{ margin: '9px 2px 0' }}>
          Te responde ella, en persona. Suele contestar en el día.
        </p>
      </div>

      <button type="button" className="cta liso" onClick={() => setVerAnto(true)}>
        <Eye size={15} /> Ver lo que Anto ve de mí
      </button>

      <button type="button" className="reinicio" onClick={onReiniciar}>
        <RotateCcw size={12} /> Reiniciar la demo
      </button>
    </div>
  )
}
