import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
const photos=[
 {src:'/media/anto-sonrisa.jpg',alt:'Anto Leoni sonriendo en el estudio',position:'center 29%'},
 {src:'/media/anto-fuerza.jpg',alt:'Anto Leoni entrenando con una mancuerna',position:'center 35%'},
 {src:'/media/anto-barra.jpg',alt:'Anto Leoni con una barra en el gimnasio al aire libre',position:'55% center'},
 {src:'/media/anto-calma.jpg',alt:'Anto Leoni en un momento de calma al aire libre',position:'center center'},
]
export default function CoachGallery(){
 const ref=useRef(null)
 const [active,setActive]=useState(0),[paused,setPaused]=useState(false),[visible,setVisible]=useState(false),[reduced,setReduced]=useState(false),[hover,setHover]=useState(false)
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(media.matches);sync();media.addEventListener('change',sync);const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.1});observer.observe(ref.current);return()=>{media.removeEventListener('change',sync);observer.disconnect()}},[])
 useEffect(()=>{if(paused||reduced||!visible||hover)return;const timer=setInterval(()=>{if(!document.hidden)setActive(i=>(i+1)%photos.length)},2000);return()=>clearInterval(timer)},[paused,reduced,visible,hover])
 return <div ref={ref} className="f-coach-photo f-coach-gallery f-reveal" role="region" aria-label="Fotos de Anto Leoni" aria-roledescription="carrusel" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>{photos.map((photo,i)=><img key={photo.src} src={photo.src} alt={photo.alt} aria-hidden={i!==active} className={i===active?'is-active':''} style={{objectPosition:photo.position}} loading="lazy"/>)}<div className="f-coach-gallery-controls"><div className="f-coach-gallery-dots">{photos.map((photo,i)=><button key={photo.src} aria-label={`Ver foto ${i+1} de Anto`} aria-pressed={i===active} onClick={()=>{setActive(i);setPaused(true)}}><span/></button>)}</div>{!reduced&&<button className="f-coach-gallery-toggle" aria-label={paused?'Reanudar fotos de Anto':'Pausar fotos de Anto'} onClick={()=>setPaused(p=>!p)}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>}</div></div>
}
