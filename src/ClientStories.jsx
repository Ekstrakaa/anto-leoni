import { useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Star, Pause, Play } from 'lucide-react'

// Incorporar únicamente reseñas reales y su enlace público de origen.
const googleReviews = []
const googleProfileUrl = ''

export default function ClientStories() {
  const [active, setActive] = useState(0)
  return <section className="f-section f-stories" id="historias" aria-labelledby="stories-title">
    <div className="f-stories-heading"><div><span className="f-kicker">PERSONAS QUE CONFIARON EN ANTO</span><h2 id="stories-title">CADA PERSONA.<br/><span>SU PROCESO.</span></h2></div><p>Antes y después de clientes de Anto. Cuatro recorridos distintos, con un punto de partida propio.</p></div>
    <div className="f-story-layout">
      <div className="f-story-pair" key={active} id="client-comparison" aria-label={`Antes y después, caso ${active + 1}`}>
        {['antes','despues'].map((phase)=><figure key={phase}><figcaption>{phase==='antes'?'Antes':'Después'}<span aria-hidden="true">{phase==='antes'?'01':'02'}</span></figcaption><div><img src={`/${phase}${active+1}.jpg`} alt={`${phase==='antes'?'Antes':'Después'} del acompañamiento — cliente ${active+1}`} loading="lazy"/></div></figure>)}
      </div>
      <div className="f-story-sidebar"><span className="f-kicker">ANTES / DESPUÉS</span><p className="f-story-counter" aria-live="polite" aria-atomic="true">0{active+1}<span> / 04</span></p><p>Elegí un caso para ver sus dos fotografías.</p><div className="f-story-choices" aria-label="Elegir caso">{[0,1,2,3].map(i=><button key={i} aria-label={`Ver caso ${i+1}`} aria-pressed={active===i} aria-controls="client-comparison" onClick={()=>setActive(i)}><span>0{i+1}</span><span>Caso {i+1}</span><ArrowUpRight size={18}/></button>)}</div><div className="f-story-arrows"><button aria-label="Caso anterior" disabled={active===0} onClick={()=>setActive(i=>i-1)}><ChevronLeft size={20}/></button><button aria-label="Siguiente caso" disabled={active===3} onClick={()=>setActive(i=>i+1)}><ChevronRight size={20}/></button></div><p className="f-story-note">Cada proceso es individual. Las fotografías muestran momentos distintos y no garantizan un resultado concreto.</p></div>
    </div>
    <Reviews/>
  </section>
}
const demoReviews = [
 {name:'Ejemplo 01',topic:'ENTRENAMIENTO',text:'Me ayuda tener una rutina clara y saber por dónde empezar. Puedo avanzar a mi ritmo y consultar lo que no entiendo.'},
 {name:'Ejemplo 02',topic:'HÁBITOS',text:'Estoy aprendiendo a organizarme sin querer cambiar todo de golpe. Los pequeños pasos hacen que cuidarme sea más sencillo.'},
 {name:'Ejemplo 03',topic:'ACOMPAÑAMIENTO',text:'Valoro poder contar cómo me siento y adaptar el plan a mi semana. Sentirme escuchada marca la diferencia.'},
 {name:'Ejemplo 04',topic:'ALIMENTACIÓN',text:'Me gusta pensar en comidas que encajen con mis gustos y mis horarios. Cuidarme también puede ser algo que disfrute.'},
]
function Reviews(){
 const [paused,setPaused]=useState(false)
 const demo=googleReviews.length===0
 const reviews=demo?demoReviews:googleReviews
 return <div className="f-reviews f-reviews-showcase" aria-labelledby="reviews-title">
  <div className="f-review-intro"><span className="f-kicker">{demo?'VISTA PREVIA · RESEÑAS SIMULADAS':'EXPERIENCIAS CON ANTO'}</span><h3 id="reviews-title">LA CONFIANZA<br/><span>SE CONSTRUYE.</span></h3><p>Entrenar, cuidarte y sentirte acompañado.<br/>Un espacio para contar cómo se vive el proceso.</p>{demo&&<small>Textos de ejemplo para mostrar el diseño. No son opiniones reales ni valoraciones de Google.</small>}</div>
  <div className={`f-review-window ${paused?'is-paused':''}`}><div className={`f-review-track ${reviews.length>1?'is-moving':''}`}>{[0,...(reviews.length>1?[1]:[])].map(copy=><div className="f-review-group" key={copy} aria-hidden={copy===1?true:undefined} inert={copy===1?'':undefined}>{reviews.map((review,i)=><article className="f-review-card" key={review.url||i}><header><span className="f-review-avatar" aria-hidden="true">{demo?String(i+1).padStart(2,'0'):review.name.slice(0,1)}</span><div><strong>{review.name}</strong><small>{demo?'Reseña simulada':'Reseña en Google'}</small></div></header><div aria-label={demo?'5 estrellas de ejemplo':`${review.rating} de 5 estrellas`} className="f-review-stars">{Array.from({length:5},(_,n)=><Star key={n} size={15} fill={n<(demo?5:review.rating)?'currentColor':'none'} aria-hidden="true"/>)}</div><blockquote>{review.text}</blockquote><footer>{demo?<span>{review.topic}</span>:<a href={review.url} target="_blank" rel="noreferrer" tabIndex={copy===1?-1:undefined}>Ver en Google <ArrowUpRight size={14}/></a>}</footer></article>)}</div>)}</div></div>
  <div className="f-review-bottom"><span>{demo?'Así se verán las futuras opiniones de tus clientes.':'Cada experiencia tiene su propia historia.'}</span>{reviews.length>1&&<button className="f-review-pause" onClick={()=>setPaused(p=>!p)}>{paused?<Play size={14}/>:<Pause size={14}/>} {paused?'Reanudar':'Pausar movimiento'}</button>}</div>
  {!demo&&googleProfileUrl&&<a className="f-text-link" href={googleProfileUrl} target="_blank" rel="noreferrer">Compartí tu experiencia en Google <ArrowUpRight size={16}/></a>}
 </div>
}