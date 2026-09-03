import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Loader2, Check, X, Keyboard } from 'lucide-react'

/* ============================================================
   Contarlo en voz alta en vez de rellenar campos.

   El dictado lo hace el propio teléfono (SpeechRecognition del
   navegador): no se sube audio a ningún lado y no cuesta nada.
   A la IA sólo le llega el texto, que es un puñado de palabras.

   Si el navegador no sabe dictar, aparece el mismo cuadro para
   escribir. No se pierde la función, cambia cómo se entra.
   ============================================================ */

const Reconocedor =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

export default function Dictado({ onDatos }) {
  const [escuchando, setEscuchando] = useState(false)
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('quieto') // quieto | oyendo | pensando | listo | error
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
  }

  return (
    <div className="v dictado">
      {estado !== 'listo' && (
        <>
          <div className="dictado-cab">
            <p className="mini-t" style={{ margin: 0 }}>Contámelo y yo lo anoto</p>
            {Reconocedor && (
              <button type="button" className="dictado-alt" onClick={() => setEscribir((x) => !x)}>
                {escribir ? <><Mic size={12} /> hablar</> : <><Keyboard size={12} /> escribir</>}
              </button>
            )}
          </div>

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
                {escuchando ? <Square size={20} fill="currentColor" /> : <Mic size={22} />}
              </span>
              <b>{escuchando ? 'Tocá para parar' : 'Mantené y contame tu día'}</b>
              {escuchando && <i className="dictado-onda" />}
            </button>
          )}

          {texto && <p className="dictado-txt">{texto}</p>}

          {texto && estado !== 'pensando' && (
            <button type="button" className="cta" onClick={mandar}>
              Anotalo por mí
            </button>
          )}

          {estado === 'pensando' && (
            <p className="pista pensando"><Loader2 size={12} className="girando" /> Ordenando lo que dijiste…</p>
          )}

          {estado === 'error' && (
            <p className="pista">
              No se pudo. Probá escribiéndolo — el botón de arriba cambia a teclado.
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
  )
}
