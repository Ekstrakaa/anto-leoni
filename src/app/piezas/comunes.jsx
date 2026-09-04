import { motion } from 'framer-motion'
import Icono from './Icono.jsx'
import { ICONO_OPCION } from '../datos.js'

/* Animación de entrada compartida: los bloques suben una vez,
   al montarse — nunca al responder algo. */
export const lista = { oculto: {}, visible: {} }
export const item = { oculto: {}, visible: {} }

export function Rotulo({ children, extra, ic: Ic }) {
  return (
    <motion.p className="rotulo" variants={item}>
      <span className="rl">
        {Ic && <Ic size={12} strokeWidth={2.6} aria-hidden />}
        {children}
      </span>
      {extra && <span>{extra}</span>}
    </motion.p>
  )
}

export function Chip({ on, onClick, ic, children }) {
  return (
    <motion.button
      type="button"
      className={'chip' + (on ? ' on' : '') + (ic ? ' con-ic' : '')}
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
    >
      {ic && <Icono nombre={ic} size={14} strokeWidth={2.1} />}
      {children}
    </motion.button>
  )
}

/* Selector de una o varias opciones en fichas.
   El icono no decora: ayuda a encontrar la respuesta sin leerlas
   todas. Cuatro preguntas seguidas de texto plano se leen como un
   formulario, y esto es lo primero que ve una clienta que pagó. */
export function Chips({ opciones, valor, varias, onPick }) {
  const activo = (o) => (varias ? (valor || []).includes(o) : valor === o)
  return (
    <div className="chips">
      {opciones.map((o) => (
        <Chip key={o} on={activo(o)} ic={ICONO_OPCION[o]} onClick={() => onPick(o)}>
          {o}
        </Chip>
      ))}
    </div>
  )
}

/* Número grande con más / menos */
export function Stepper({ etiqueta, valor, unidad, onCambio, min, max }) {
  return (
    <motion.div className="num" variants={item}>
      <span className="num-e">{etiqueta}</span>
      <div className="num-c">
        <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={() => onCambio(Math.max(min, valor - 1))} aria-label="menos">
          −
        </motion.button>
        <span className="num-v">
          {valor}
          <small>{unidad}</small>
        </span>
        <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={() => onCambio(Math.min(max, valor + 1))} aria-label="más">
          +
        </motion.button>
      </div>
    </motion.div>
  )
}
