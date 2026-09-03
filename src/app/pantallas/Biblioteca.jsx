import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, Loader2, MessageCircle, Info, Layers } from 'lucide-react'
import { cargarCatalogo, filtrar, fotoDe, ZONAS, LUGARES, NIVELES_F, alternativasDe } from '../biblioteca.js'
import Silueta from '../piezas/Silueta.jsx'
import Icono from '../piezas/Icono.jsx'
import { Rotulo } from '../piezas/comunes.jsx'

const DE_A_VEINTE = 20

/* Las dos fotos son el inicio y el final del movimiento. Alternarlas
   explica el ejercicio mejor que cualquier párrafo. */
function FotoViva({ id, alt, im }) {
  const [c, setC] = useState(0)
  useEffect(() => {
    if (im < 2) return
    const t = setInterval(() => setC((x) => (x ? 0 : 1)), 1500)
    return () => clearInterval(t)
  }, [im])
  return (
    <div className="bib-foto-viva">
      {[0, 1].slice(0, im).map((n) => (
        <img key={n} src={fotoDe(id, n)} alt={alt + (n ? ' — final' : ' — inicio')}
          className={c === n ? 'on' : ''} loading="lazy" />
      ))}
      <span className="bib-viva-et">{c ? 'final' : 'inicio'}</span>
    </div>
  )
}

/* La ficha va colgada del body con un portal. Si se dibuja dentro de la
   pantalla, hereda el `transform` de la animación de entrada, y entonces
   `position: fixed` deja de medirse contra la pantalla: la hoja aparecía
   a mil pixeles de scroll de donde tenía que estar. */
function Ficha({ e, onCerrar, onPreguntar, lista }) {
  const alternativas = useMemo(() => alternativasDe(lista, e, { cuantas: 4 }), [lista, e])

  /* con la ficha abierta, el fondo no se mueve */
  useEffect(() => {
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const salir = (ev) => ev.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', salir)
    return () => {
      document.body.style.overflow = antes
      window.removeEventListener('keydown', salir)
    }
  }, [onCerrar])

  return createPortal(
    <div className="bib-manta" onClick={onCerrar}>
      <div className="bib-ficha" onClick={(ev) => ev.stopPropagation()}>
        <button type="button" className="bib-x" onClick={onCerrar} aria-label="Cerrar">
          <X size={18} />
        </button>

        <FotoViva id={e.id} alt={e.n} im={e.im} />

        <div className="bib-ficha-c">
          <h3>{e.n}</h3>
          {e.crudo ? <p className="bib-en">Todavía sin traducir · {e.en}</p> : <p className="bib-en">{e.en}</p>}

          <div className="bib-datos">
            <div><span>Trabaja</span><b>{e.mus.join(', ')}</b></div>
            <div><span>Material</span><b>{e.eq}</b></div>
            <div><span>Dificultad</span><b>{e.niv}</b></div>
            <div><span>Tipo</span><b>{e.mec || e.tipo}</b></div>
          </div>

          <div className="bib-silueta">
            <Silueta musculo={e.m} />
            <p className="pista" style={{ margin: 0 }}>
              {e.sec.length
                ? <>También entran <b>{e.sec.join(', ').toLowerCase()}</b>.</>
                : <>Trabaja sólo <b>{e.mus.join(', ').toLowerCase()}</b>.</>}
            </p>
          </div>

          <button type="button" className="cta liso" onClick={() => onPreguntar(e)}>
            <MessageCircle size={15} /> No puedo hacerlo · pedirle otro a Anto
          </button>

          {alternativas.length > 0 && (
            <>
              <p className="mini-t" style={{ marginTop: 16 }}>Trabajan lo mismo</p>
              <div className="bib-otras">
                {alternativas.map((a) => (
                  <div className="bib-otra" key={a.id}>
                    <img src={fotoDe(a.id, 0)} alt={a.n} loading="lazy" />
                    <span>{a.n}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function Biblioteca({ irAnto }) {
  const [lista, setLista] = useState(null)
  const [error, setError] = useState(false)
  const [texto, setTexto] = useState('')
  const [zona, setZona] = useState(null)
  const [lugar, setLugar] = useState('todo')
  const [nivel, setNivel] = useState('todo')
  const [cuantos, setCuantos] = useState(DE_A_VEINTE)
  const [abierto, setAbierto] = useState(null)

  useEffect(() => {
    cargarCatalogo()
      .then((j) => {
        setLista(j)
        /* ?ficha=<id> abre un ejercicio directo: sirve para pasarle
           a alguien el link de un ejercicio concreto. */
        const pedido = new URLSearchParams(location.search).get('ficha')
        if (pedido) {
          const e = j.find((x) => x.id === pedido)
          if (e) setAbierto(e)
        }
      })
      .catch(() => setError(true))
  }, [])

  const resultado = useMemo(
    () => (lista ? filtrar(lista, { texto, zona, lugar, nivel }) : []),
    [lista, texto, zona, lugar, nivel]
  )

  /* al cambiar cualquier filtro se vuelve al principio de la lista */
  useEffect(() => setCuantos(DE_A_VEINTE), [texto, zona, lugar, nivel])

  if (error) {
    return (
      <div className="v caja">
        <p className="pista" style={{ margin: 0 }}>
          No se pudo cargar la biblioteca. Probá de nuevo con conexión.
        </p>
      </div>
    )
  }

  if (!lista) {
    return (
      <div className="v caja bib-cargando">
        <Loader2 size={20} className="girando" />
        <p className="pista" style={{ margin: 0 }}>Abriendo la biblioteca…</p>
      </div>
    )
  }

  return (
    <div className="anima">
      <div className="bib-buscar">
        <Search size={16} />
        <input
          type="search"
          value={texto}
          placeholder="Buscar: sentadilla, glúteos, mancuernas…"
          onChange={(ev) => setTexto(ev.target.value)}
          aria-label="Buscar ejercicio"
        />
        {texto && (
          <button type="button" onClick={() => setTexto('')} aria-label="Borrar">
            <X size={15} />
          </button>
        )}
      </div>

      <div className="bib-zonas">
        <button type="button" className={'bib-zona' + (zona === null ? ' on' : '')} onClick={() => setZona(null)}>
          <Layers size={16} />
          <span>Todo</span>
        </button>
        {ZONAS.map((z) => (
          <button
            key={z.k}
            type="button"
            className={'bib-zona' + (zona === z.k ? ' on' : '')}
            onClick={() => setZona(zona === z.k ? null : z.k)}
          >
            <Icono nombre={z.ic} size={16} />
            <span>{z.t}</span>
          </button>
        ))}
      </div>

      <div className="bib-filtros">
        <div className="chips">
          {LUGARES.map((l) => (
            <button key={l.k} type="button" className={'chip' + (lugar === l.k ? ' on' : '')} onClick={() => setLugar(l.k)}>
              {l.t}
            </button>
          ))}
        </div>
        <div className="chips">
          {NIVELES_F.map((n) => (
            <button key={n.k} type="button" className={'chip' + (nivel === n.k ? ' on' : '')} onClick={() => setNivel(n.k)}>
              {n.t}
            </button>
          ))}
        </div>
      </div>

      <Rotulo ic={Info} extra={`${resultado.length} de ${lista.length}`}>
        {zona ? ZONAS.find((z) => z.k === zona).t : 'Todos los ejercicios'}
      </Rotulo>

      {resultado.length === 0 ? (
        <div className="v caja">
          <p className="pista" style={{ margin: 0 }}>
            Nada con esos filtros. Probá quitando alguno.
          </p>
        </div>
      ) : (
        <>
          <div className="bib-rejilla">
            {resultado.slice(0, cuantos).map((e) => (
              <button type="button" className="bib-card" key={e.id} onClick={() => setAbierto(e)}>
                <span className="bib-card-f">
                  <img src={fotoDe(e.id, 0)} alt={e.n} loading="lazy" />
                  {e.casa ? <i className="bib-tag">casa</i> : null}
                </span>
                <b>{e.n}</b>
                <small>{e.eq} · {e.niv}</small>
              </button>
            ))}
          </div>

          {cuantos < resultado.length && (
            <button type="button" className="cta liso" onClick={() => setCuantos((c) => c + DE_A_VEINTE * 2)}>
              Ver más · quedan {resultado.length - cuantos}
            </button>
          )}
        </>
      )}

      <p className="pista bib-fuente">
        Fotos y datos: Free Exercise DB, dominio público. Los nombres y la
        organización son nuestros. Lo que entra en tu plan lo elige Anto.
      </p>

      {abierto && (
        <Ficha
          e={abierto}
          lista={lista}
          onCerrar={() => setAbierto(null)}
          onPreguntar={() => { setAbierto(null); irAnto() }}
        />
      )}
    </div>
  )
}
