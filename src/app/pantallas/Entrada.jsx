import { motion } from 'framer-motion'
import { ANTO } from '../datos.js'
import { lista, item } from '../piezas/comunes.jsx'

export default function Entrada({ onEntrar }) {
  return (
    <div className="entrada">
      <div className="entrada-foto">
        <motion.img
          src={ANTO}
          alt="Anto Leoni"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.4, ease: [0.16, 0.84, 0.32, 1] }}
        />
      </div>

      <motion.div variants={lista} initial="oculto" animate="visible">
        <motion.h1 variants={item}>
          Tu proceso<em>empieza hoy.</em>
        </motion.h1>
        <motion.p variants={item}>No en una semana. Hoy contestás unas preguntas y ya tenés tu plan.</motion.p>

        <motion.div className="campo-l" variants={item}>
          <label htmlFor="usuario">Usuario</label>
          <input id="usuario" defaultValue="lucia" autoComplete="off" />
        </motion.div>
        <motion.div className="campo-l" variants={item}>
          <label htmlFor="clave">Clave</label>
          <input id="clave" type="password" defaultValue="feelmove" autoComplete="off" />
        </motion.div>

        <motion.button type="button" className="cta" variants={item} whileTap={{ scale: 0.97 }} onClick={onEntrar}>
          Entrar
        </motion.button>
        <motion.p className="nota" variants={item}>
          Solo entra quien contrató el acompañamiento.
        </motion.p>
      </motion.div>
    </div>
  )
}
