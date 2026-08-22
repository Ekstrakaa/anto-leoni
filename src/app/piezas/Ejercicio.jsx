import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Timer } from 'lucide-react'
import Silueta from './Silueta.jsx'
import { fotoEjercicio, NOMBRE_MUSCULO } from '../datos.js'

const DESCANSO = 60 // segundos entre series

/* Las dos fotos del ejercicio se alternan solas: inicio y final del movimiento. */
function FotoDemo({ ej }) {
  const [cuadro, setCuadro] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCuadro((c) => (c ? 0 : 1)), 1400)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="foto-ej">
      {[0, 1].map((n) => (
        <motion.img
          key={n}
          src={fotoEjercicio(ej.id, n)}
          alt={ej.n + (n ? ' — final' : ' — inicio')}
          animate={{ opacity: cuadro === n ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          loading="lazy"
        />
      ))}
      <span className="foto-et">{(NOMBRE_MUSCULO[ej.musculo] || ej.musculo).toUpperCase()}</span>
    </div>
  )
}

/* Cronómetro de descanso: arranca solo al marcar una serie. */
function Descanso({ activo, onFin }) {
  const [seg, setSeg] = useState(DESCANSO)
  useEffect(() => {
    if (!activo) return
    setSeg(DESCANSO)
    const t = setInterval(() => {
      setSeg((s) => {
        if (s <= 1) { clearInterval(t); onFin(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [activo])
  if (!activo) return null
  return (
    <motion.div className="descanso" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Timer size={14} />
      <span>Descansá</span>
      <b>{seg} s</b>
      <button type="button" onClick={onFin}>saltar</button>
    </motion.div>
  )
}

export default function Ejercicio({ ej, hechas = [], onSerie, abierto, onAbrir }) {
  const [descansando, setDescansando] = useState(false)
  const completo = hechas.filter(Boolean).length >= ej.series
  const primerToque = useRef(true)

  const marcarSerie = (i) => {
    const nuevas = [...(hechas.length ? hechas : Array(ej.series).fill(false))]
    const encendiendo = !nuevas[i]
    nuevas[i] = encendiendo
    onSerie(nuevas)
    const quedan = nuevas.filter(Boolean).length < ej.series
    if (encendiendo && quedan) setDescansando(true)
  }

  useEffect(() => { primerToque.current = false }, [])

  return (
    <div className={'ejer' + (completo ? ' hecho' : '')}>
      <button type="button" className="ejer-t" onClick={() => onAbrir(abierto ? null : ej.id)}>
        <span className="ejer-b">{completo && <Check size={13} strokeWidth={3.5} />}</span>
        <span className="ejer-c">
          <b className="ejer-n">{ej.n}</b>
          <span className="ejer-d">
            {ej.series} × {ej.repes} · {ej.peso}
          </span>
        </span>
        <motion.span className="ejer-v" animate={{ rotate: abierto ? 180 : 0 }}>
          <ChevronDown size={17} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            key="detalle"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 0.84, 0.32, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="demo">
              <FotoDemo ej={ej} />
              <Silueta musculo={ej.musculo} />
            </div>

            <div className="series">
              <span className="series-t">Series</span>
              {Array.from({ length: ej.series }).map((_, i) => (
                <motion.button
                  key={i}
                  type="button"
                  className={'serie' + (hechas[i] ? ' on' : '')}
                  onClick={() => marcarSerie(i)}
                  whileTap={{ scale: 0.85 }}
                  aria-label={'Serie ' + (i + 1)}
                >
                  {hechas[i] ? <Check size={13} strokeWidth={3.5} /> : i + 1}
                </motion.button>
              ))}
              <AnimatePresence>
                {descansando && <Descanso activo={descansando} onFin={() => setDescansando(false)} />}
              </AnimatePresence>
            </div>

            <div className="pasos">
              <ol>
                {ej.pasos.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
