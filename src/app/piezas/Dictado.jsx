import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Loader2, Check, X, Keyboard, ChevronDown } from 'lucide-react'

/* ============================================================
   Contarlo en voz alta en vez de rellenar campos.

   Va plegado: es un atajo, no la tarea principal del día, y
   cerrado ocupa una línea. Abierto es donde se habla.

   El dictado lo hace el propio teléfono (SpeechRecognition del
   navegador): no se sube audio a ningún lado y no cuesta nada.
   A la IA sólo le llega el texto.
   ============================================================ */

const Reconocedor =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

export default function Dictado({ onDatos }) {
  const [desplegado, setDesplegado] = useState(false)
  const [escuchando, setEscuchando] = useState(false)
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('quieto')
  const [escribir, setEscribir] = useState(!Reconocedor)
  const [resumen, setResumen] = useState(null)
  const rec = useRef(null)

  useEffect(() => () => rec.current?.stop?.(), [])

  const arrancar = () => {
    if (!Reconocedor) return setEscribir(true)
    const r = new Reconocedor()
    r.lang = 'es-ES'
    r.continuous = true
    r.interimResults = true

    let final = ''
    r.onresult = (ev) => {
      let parcial = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript
        if (ev.results[i].isFinal) final += t
        else parcial += t
      }
      setTexto((final + parcial).trim())
    }
    r.onerror = () => { setEstado('error'); setEscuchando(false) }
    r.onend = () => setEscuchando(false)

    rec.current = r
    setTexto('')
    setResumen(null)
    setEstado('oyendo')
    setEscuchando(true)
    r.start()
  }

  const parar = () => {
    rec.current?.stop?.()
    setEscuchando(false)
    setEstado('quieto')
  }

  const mandar = async () => {
    const t = texto.trim()
    if (!t) return
    parar()
    setEstado('pensando')
    try {
      const r = await fetch('/api/dictado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: t }),
      })
      if (!r.ok) throw new Error(String(r.status))
      const j = await r.json()
      setResumen(j.datos)
      setEstado('listo')
    } catch {
      setEstado('error')
    }
  }

  const confirmar = () => {
    onDatos(resumen)
    setTexto('')
    setResumen(null)
    setEstado('quieto')
    setDesplegado(false)
  }

  return (
    <div className={'dictado' + (desplegado ? ' abierto' : '')}>
      <button type="button" className="dictado-barra" onClick={() => setDesplegado((x) => !x)}>
        <span className="dictado-punta"><Mic size={15} /></span>
        <span className="dictado-lema">
          <b>Contámelo y yo lo anoto</b>
          <small>Hablá una vez y se llena todo el día</small>
        </span>
        <ChevronDown size={16} style={{ transform: desplegado ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }} />
      </button>

      {desplegado && (
        <div className="dictado-panel">
          {estado !== 'listo' && (
            <>
              {escribir ? (
                <textarea
                  className="campo dictado-campo"
                  rows={3}
                  value={texto}
                  placeholder="Hoy almorcé pollo con arroz, tomé dos botellas y en el gimnasio hice 50 kilos en pecho…"
                  onChange={(ev) => setTexto(ev.target.value)}
                />
              ) : (
                <button
                  type="button"
                  className={'dictado-boton' + (escuchando ? ' on' : '')}
                  onClick={escuchando ? parar : arrancar}
                >
                  <span className="dictado-ic">
                    {escuchando ? <Square size={17} fill="currentColor" /> : <Mic size={19} />}
                  </span>
                  <b>{escuchando ? 'Tocá para parar' : 'Tocá y contame tu día'}</b>
                </button>
              )}

              {Reconocedor && (
                <button type="button" className="dictado-alt" onClick={() => setEscribir((x) => !x)}>
                  {escribir ? <><Mic size={12} /> prefiero hablarlo</> : <><Keyboard size={12} /> prefiero escribirlo</>}
                </button>
              )}

              {texto && <p className="dictado-txt">{texto}</p>}

              {texto && estado !== 'pensando' && (
                <button type="button" className="cta" onClick={mandar}>Anotalo por mí</button>
              )}

              {estado === 'pensando' && (
                <p className="pista pensando"><Loader2 size={12} className="girando" /> Ordenando lo que dijiste…</p>
              )}

              {estado === 'error' && (
                <p className="pista" style={{ margin: '10px 0 0' }}>
                  No se pudo. Probá escribiéndolo con el botón de arriba.
                </p>
              )}
            </>
          )}

          {estado === 'listo' && resumen && (
            <>
              <p className="mini-t" style={{ margin: '0 0 10px' }}>Esto entendí</p>
              <div className="dictado-lista">
                {resumen.comidas?.map((c, i) => (
                  <div className="dictado-dato" key={'c' + i}><span>{c.cual || 'comida'}</span><b>{c.que}</b></div>
                ))}
                {resumen.agua && (
                  <div className="dictado-dato"><span>agua</span><b>{resumen.agua.cantidad} × {resumen.agua.unidad}</b></div>
                )}
                {resumen.movimiento && (
                  <div className="dictado-dato"><span>movimiento</span><b>{resumen.movimiento.que}{resumen.movimiento.minutos ? ` · ${resumen.movimiento.minutos} min` : ''}</b></div>
                )}
                {resumen.series?.map((s, i) => (
                  <div className="dictado-dato" key={'s' + i}>
                    <span>{s.ejercicio}</span>
                    <b>{[s.kilos ? s.kilos + ' kg' : null, s.repeticiones ? s.repeticiones + ' repes' : null].filter(Boolean).join(' · ') || '—'}</b>
                  </div>
                ))}
                {resumen.peso && <div className="dictado-dato"><span>tu peso</span><b>{resumen.peso} kg</b></div>}
                {resumen.nota && <div className="dictado-nota">Para Anto: {resumen.nota}</div>}
              </div>

              <div className="dictado-acciones">
                <button type="button" className="cta liso" onClick={() => { setResumen(null); setEstado('quieto') }}>
                  <X size={14} /> No es eso
                </button>
                <button type="button" className="cta" onClick={confirmar}>
                  <Check size={14} /> Está bien
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
