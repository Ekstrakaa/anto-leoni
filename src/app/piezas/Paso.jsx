import { Check, ChevronDown } from 'lucide-react'

/* ============================================================
   Un paso del día.

   El día es un hilo vertical, no una lista de cuadros iguales.
   Sólo el paso actual está encendido y abierto; lo hecho se
   pliega a una línea con su tilde y lo que falta queda apagado.

   Es lo que contesta las dos preguntas que la app no contestaba:
   dónde estoy y qué toco ahora.
   ============================================================ */

export default function Paso({
  n,
  titulo,
  ayuda,
  estado = 'pendiente', // hecho | actual | pendiente
  resumen,
  pista,
  abierto,
  onAbrir,
  ultimo = false,
  children,
}) {
  const hecho = estado === 'hecho'

  return (
    <div className={`paso paso-${estado}${abierto ? ' abierto' : ''}${ultimo ? ' ultimo' : ''}`}>
      <div className="paso-hilo" aria-hidden>
        <span className="paso-marca">
          {hecho ? <Check size={13} strokeWidth={3.4} /> : <b>{n}</b>}
        </span>
        {!ultimo && <i className="paso-linea" />}
      </div>

      <div className="paso-cuerpo">
        <button type="button" className="paso-cab" onClick={onAbrir} aria-expanded={abierto}>
          <span className="paso-tit">
            <b>{titulo}</b>
            {hecho && !abierto && resumen ? (
              <span className="paso-res">{resumen}</span>
            ) : ayuda && (abierto || estado === 'actual') ? (
              <span className="paso-ayuda">{ayuda}</span>
            ) : pista ? (
              /* lo que falta también dice qué hay dentro, para que no
                 haya que abrirlo para enterarse */
              <span className="paso-pista">{pista}</span>
            ) : null}
          </span>
          <span className="paso-flecha" style={{ transform: abierto ? 'rotate(180deg)' : 'none' }}>
            <ChevronDown size={16} />
          </span>
        </button>

        {abierto && <div className="paso-caja">{children}</div>}
      </div>
    </div>
  )
}
