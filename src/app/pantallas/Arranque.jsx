import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { TANDAS, ANTO } from '../datos.js'
import { lista, item, Chips, Stepper } from '../piezas/comunes.jsx'

/* Las tres tandas del primer día. Llegan de a una, como si Anto las mandara. */
export function Tanda({ tanda, perfil, resp, onPerfil, onResp, onSeguir }) {
  const t = TANDAS[tanda]

  const valorDe = (k) => (k === 'meta' ? perfil.meta : resp[k])
  const elegir = (p, o) => {
    if (p.k === 'meta') return onPerfil({ ...perfil, meta: o })
    if (p.varias) {
      const cur = resp[p.k] || []
      return onResp({ ...resp, [p.k]: cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o] })
    }
    onResp({ ...resp, [p.k]: o })
  }

  const lista_ok = t.preguntas.every((p) => {
    const v = valorDe(p.k)
    return p.varias ? v && v.length : !!v
  })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tanda}
        variants={lista}
        initial="oculto"
        animate="visible"
        exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
      >
        <motion.div className="dice" variants={item}>
          <span className="dice-foto">
            <img src={ANTO} alt="Anto" />
          </span>
          <div className="globo">{t.dice}</div>
        </motion.div>

        {(t.numeros || []).map((n) => (
          <Stepper
            key={n.k}
            etiqueta={n.e}
            unidad={n.u}
            valor={perfil[n.k]}
            min={n.min}
            max={n.max}
            onCambio={(v) => onPerfil({ ...perfil, [n.k]: v })}
          />
        ))}

        {t.preguntas.map((p) => (
          <motion.div className="preg" key={p.k} variants={item}>
            <p className="preg-t">
              {p.t} {p.varias && <small>· varias</small>}
            </p>
            <Chips opciones={p.opciones} valor={valorDe(p.k)} varias={p.varias} onPick={(o) => elegir(p, o)} />
          </motion.div>
        ))}

        <motion.button type="button" className="cta" variants={item} disabled={!lista_ok} whileTap={{ scale: 0.97 }} onClick={onSeguir}>
          {lista_ok
            ? tanda < TANDAS.length - 1
              ? 'Enviar y seguir'
              : 'Enviar · armame el plan'
            : 'Contestá para seguir'}
          {lista_ok && <ArrowRight size={17} />}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}

/* La pausa mientras "Anto lee": el momento de teatro que vende el concepto. */
export function Armando() {
  return (
    <div className="armando">
      <motion.div
        className="armando-foto"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img src={ANTO} alt="Anto" />
      </motion.div>
      <h3>
        Anto está leyendo
        <br />
        tus respuestas
      </h3>
      <p>Con esto te arma la comida y el entreno. No hace falta esperar una semana.</p>
      <div className="puntos">
        {[0, 1, 2].map((i) => (
          <motion.i
            key={i}
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  )
}
