import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Printer } from 'lucide-react'
import { MENU } from '../datos.js'
import { RESTRICCIONES, DIAS_DE_LA_SEMANA } from '../restricciones.js'
import { ETAPAS, retoDeLaSemana } from '../progresion.js'

/* ============================================================
   LA HOJA

   Lo que la persona se lleva: su semana en papel, para la nevera
   o el bolso. Se imprime con el propio navegador, así que en el
   teléfono sale "Guardar en PDF" sin que cueste nada ni haga
   falta ninguna librería.

   Está en crema con tinta oscura porque está pensada para
   imprimirse: la pantalla oscura de la app gastaría media
   cartuchera de tinta.
   ============================================================ */

const hoy = () =>
  new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

export default function Hoja({ st, plan, onCerrar }) {
  const etapa = ETAPAS.find((e) => e.n === st.etapaActual) || ETAPAS[1]
  const reto = retoDeLaSemana(st.semana)
  const lesiones = RESTRICCIONES.filter(
    (r) => (st.restricciones || []).includes(r.k) && r.k !== 'ninguna'
  )

  /* Va colgada del body. Si se dibuja dentro de la pantalla hereda el
     transform de la animación de entrada, y entonces `position: fixed`
     deja de medirse contra la ventana y la hoja queda recortada por
     la barra de abajo. */
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
    <div className="hoja-manta">
      <div className="hoja-barra no-imprimir">
        <button type="button" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
        <span>Tu semana</span>
        <button type="button" className="hoja-imprimir" onClick={() => window.print()}>
          <Printer size={15} /> Guardar
        </button>
      </div>

      <article className="hoja">
        <header className="hoja-cab">
          <div>
            <span className="hoja-marca">Feel&amp;Move · Anto Leoni</span>
            <h1>Tu semana</h1>
            <p>Semana {st.semana} · etapa {etapa.n}, {etapa.t} · {hoy()}</p>
          </div>
          <div className="hoja-sello">
            <b>{etapa.dias}</b>
            <span>días</span>
          </div>
        </header>

        {plan?.objetivoDelMes && (
          <section className="hoja-objetivo">
            <span>El objetivo de este mes</span>
            <b>{plan.objetivoDelMes}</b>
            <p>Uno solo. Cuando salga sin pensarlo, sumamos el siguiente.</p>
          </section>
        )}

        <section className="hoja-bloque">
          <h2>El reto de esta semana</h2>
          <div className="hoja-reto">
            <b>{reto.t}</b>
            <span>{reto.d}</span>
            <div className="hoja-casillas">
              {Array.from({ length: reto.meta }).map((_, i) => <i key={i} />)}
            </div>
            <small>{reto.meta} días. Tachá cada uno.</small>
          </div>
        </section>

        <section className="hoja-bloque">
          <h2>Cómo comés</h2>
          <table className="hoja-tabla">
            <tbody>
              {MENU.map((m) => {
                const elegida = m.con.find((o) => o.k === st.elegido[m.k]) || m.con[0]
                return (
                  <tr key={m.k}>
                    <th>{m.titulo.replace('Tu ', '').replace('Tus ', '')}</th>
                    <td>
                      <b>{elegida.n}</b>
                      <span>o bien: {m.mas.slice(0, 3).join(' · ')}</span>
                    </td>
                  </tr>
                )
              })}
              <tr>
                <th>Agua</th>
                <td><b>2 litros al día</b><span>Contalo por envases, no por vasos sueltos.</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="hoja-bloque">
          <h2>Cómo entrenás</h2>
          <div className="hoja-dias">
            {DIAS_DE_LA_SEMANA.map((d) => (
              <div className="hoja-dia" key={d.k}>
                <b>{d.que}</b>
                <span>{d.zonas}</span>
                <small>{etapa.series} series · {etapa.descanso}s de descanso</small>
              </div>
            ))}
          </div>
          <p className="hoja-nota">
            Los ejercicios concretos te los da la app cada mañana, según lo que
            tengas descansado. Esta hoja es el reparto, no la lista.
          </p>
        </section>

        {lesiones.length > 0 && (
          <section className="hoja-bloque hoja-cuidado">
            <h2>Lo que hay que cuidar</h2>
            {lesiones.map((r) => (
              <p key={r.k}><b>{r.t}:</b> {r.nota}</p>
            ))}
            <p className="hoja-aviso">
              Esto reduce el riesgo, no es un alta médica. Ante cualquier duda,
              se lo preguntás a Anto antes de hacerlo.
            </p>
          </section>
        )}

        <footer className="hoja-pie">
          <span>Hecho para {st.perfil.edad ? `vos, ${st.perfil.edad} años` : 'vos'} · {hoy()}</span>
          <span>Anto Leoni · Tenerife</span>
        </footer>
      </article>
    </div>,
    document.body
  )
}
