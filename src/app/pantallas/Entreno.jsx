import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, ChevronLeft, ChevronRight, Timer, Plus } from 'lucide-react'
import { fotoEjercicio, NOMBRE_MUSCULO } from '../datos.js'
import Silueta from '../piezas/Silueta.jsx'

/* ============================================================
   MODO ENTRENO — a pantalla completa

   Esto se usa de pie, en un gimnasio, con una mano y el móvil en
   la otra. Metido dentro de una tarjeta dentro de otra tarjeta la
   foto quedaba del tamaño de un sello y los botones de serie
   pedían puntería.

   Acá la foto manda, las series son círculos grandes y el
   descanso se apodera de la pantalla cuando toca descansar.
   ============================================================ */

const musculoDe = (e) => e.musculo || e.m

function Foto({ ej }) {
  const [cuadro, setCuadro] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCuadro((c) => (c ? 0 : 1)), 1500)
    return () => clearInterval(t)
  }, [ej.id])

  return (
    <div className="ent-foto">
      {[0, 1].map((n) => (
        <img key={n} src={fotoEjercicio(ej.id, n)} alt="" className={cuadro === n ? 'on' : ''} />
      ))}
      <span className="ent-etapa">{cuadro ? 'final' : 'inicio'}</span>
      <span className="ent-musculo">{(NOMBRE_MUSCULO[musculoDe(ej)] || '').toUpperCase()}</span>
    </div>
  )
}

function Descanso({ segundos, onFin }) {
  const [queda, setQueda] = useState(segundos)
  useEffect(() => {
    const t = setInterval(() => {
      setQueda((s) => {
        if (s <= 1) { clearInterval(t); onFin(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const parte = 1 - queda / segundos
  return (
    <div className="ent-descanso">
      <div className="ent-barra"><i style={{ width: parte * 100 + '%' }} /></div>
      <div className="ent-desc-c">
        <Timer size={17} />
        <b>{queda}s</b>
        <span>de descanso</span>
        <button type="button" onClick={onFin}>saltar</button>
      </div>
    </div>
  )
}

export default function Entreno({ ejercicios, indice, series, onSerie, onIr, onCerrar }) {
  const ej = ejercicios[indice]
  const hechas = series[ej.id] || []
  const total = ej.series || 3
  const [descansando, setDescansando] = useState(false)
  const tocado = useRef(false)

  useEffect(() => {
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const salir = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', salir)
    return () => {
      document.body.style.overflow = antes
      window.removeEventListener('keydown', salir)
    }
  }, [onCerrar])

  /* al cambiar de ejercicio se corta el descanso del anterior */
  useEffect(() => setDescansando(false), [indice])

  const marcar = (i) => {
    const nuevas = [...(hechas.length ? hechas : Array(total).fill(false))]
    const encendiendo = !nuevas[i]
    nuevas[i] = encendiendo
    onSerie(ej.id, nuevas)
    tocado.current = true
    const quedan = nuevas.filter(Boolean).length < total
    if (encendiendo && quedan) setDescansando(true)
  }

  const completo = hechas.filter(Boolean).length >= total
  const ultimo = indice >= ejercicios.length - 1

  return createPortal(
    <div className="ent">
      <header className="ent-top">
        <button type="button" onClick={onCerrar} aria-label="Salir del entreno"><X size={19} /></button>
        <div className="ent-puntos">
          {ejercicios.map((x, i) => {
            const hecho = (series[x.id] || []).filter(Boolean).length >= (x.series || 3)
            return <i key={x.id} className={hecho ? 'ok' : i === indice ? 'aqui' : ''} />
          })}
        </div>
        <span className="ent-cuenta">{indice + 1}/{ejercicios.length}</span>
      </header>

      <Foto ej={ej} />

      <div className="ent-cuerpo">
        <span className="ent-papel">{ej.papel}</span>
        <h2>{ej.n}</h2>
        <p className="ent-dosis">{total} series × {ej.repes}</p>

        {ej.porque && <p className="ent-porque">{ej.porque}</p>}

        <div className="ent-series">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={'ent-serie' + (hechas[i] ? ' on' : '')}
              onClick={() => marcar(i)}
              aria-label={'Serie ' + (i + 1)}
            >
              {hechas[i] ? <Check size={22} strokeWidth={3.4} /> : i + 1}
            </button>
          ))}
        </div>

        <div className="ent-silueta">
          <Silueta musculo={musculoDe(ej)} />
          <p>
            {ej.sec?.length
              ? <>Trabaja <b>{ej.mus?.join(', ').toLowerCase()}</b>, y de paso {ej.sec.join(', ').toLowerCase()}.</>
              : <>Trabaja <b>{ej.mus?.join(', ').toLowerCase()}</b>.</>}
          </p>
        </div>

        <p className="ent-aviso">
          Las dos fotos son el inicio y el final del movimiento. Si algo te
          molesta, pará y escribile a Anto.
        </p>
      </div>

      {descansando && <Descanso segundos={ej.descanso || 60} onFin={() => setDescansando(false)} />}

      <nav className="ent-pie">
        <button type="button" disabled={indice === 0} onClick={() => onIr(indice - 1)} aria-label="Anterior">
          <ChevronLeft size={20} />
        </button>
        {ultimo ? (
          <button type="button" className="ent-listo" onClick={onCerrar}>
            {completo ? 'Terminé el entreno' : 'Volver al día'}
          </button>
        ) : (
          <button type="button" className={'ent-listo' + (completo ? ' vamos' : '')} onClick={() => onIr(indice + 1)}>
            {completo ? 'Siguiente ejercicio' : 'Saltar al siguiente'}
            <ChevronRight size={18} />
          </button>
        )}
      </nav>
    </div>,
    document.body
  )
}
