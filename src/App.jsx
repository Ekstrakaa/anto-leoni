import { useState, useEffect, useRef } from "react";
import {
  Camera, Instagram, Youtube, Mail, ArrowRight, ArrowLeft, Menu, X,
  Plus, Minus, MapPin, MessageCircle, Check,
} from "lucide-react";

/* ============================================================================
   ANTO LEONI · FEEL&MOVE
   - Copy en español peninsular (público de Anto)
   - <PhotoSlot/> = huecos señalizados (1 hueco = 1 foto/vídeo a subir)
   - Para VÍDEO de fondo: meté el archivo en /public y descomentá el <video/> del hero
   ========================================================================== */

const WHATSAPP = "34610939223";
const EMAIL = "alslife24@gmail.com";
const HERO_VIDEOS = ["/video1.mp4", "/video2.mp4", "/video3.mp4"];
const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

/* -------------------- hooks -------------------- */
function useReveal(threshold = 0.16) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.unobserve(e.target); } }),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, shown];
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const d = document.documentElement;
        const max = d.scrollHeight - d.clientHeight;
        setP(max > 0 ? d.scrollTop / max : 0);
        raf = 0;
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);
  return p;
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { setY(window.scrollY); raf = 0; });
    };
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);
  return y;
}

function useCountUp(target, run, dur = 1500) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(target); return; }
    let raf, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, dur]);
  return n;
}

/* -------------------- small components -------------------- */
function Reveal({ children, delay = 0, as: Tag = "div", className = "", style = {} }) {
  const [ref, shown] = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </Tag>
  );
}

function PhotoSlot({ label, hint, className = "", tall = false }) {
  return (
    <div className={`slot ${tall ? "slot--tall" : ""} ${className}`}>
      {/* Para poner la imagen real, reemplazá este bloque por:
          <img src="/tu-foto.jpg" alt="..." />   (el archivo va en /public) */}
      <div className="slot__inner">
        <Camera size={22} strokeWidth={1.4} />
        <span className="slot__label">{label}</span>
        {hint && <span className="slot__hint">{hint}</span>}
      </div>
    </div>
  );
}

const TikTok = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.5 3c.4 2.2 1.7 3.7 3.9 3.9v2.7c-1.3.1-2.5-.3-3.7-1v5.9c0 4-3.2 6.6-6.7 5.9-2.6-.5-4.3-2.9-4-5.6.3-2.6 2.7-4.5 5.4-4.2v2.9c-.5-.1-1-.1-1.5 0-1 .3-1.6 1.2-1.4 2.2.2 1 1.1 1.6 2.2 1.5 1-.1 1.7-.9 1.7-2V3h3.1z" />
  </svg>
);

function Marquee() {
  const words = ["Sentir", "Moverte", "Nutrirte", "Construir hábitos", "Evolucionar"];
  const items = [...words, ...words];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track">{items.map((w, i) => <span key={i}>{w}</span>)}</div>
      <div className="marquee__track marquee__track--rev">{items.map((w, i) => <span className="out" key={i}>{w}</span>)}</div>
    </div>
  );
}

const STATS = [
  { value: 10, prefix: "+", label: "años acompañando procesos" },
  { text: "Wellness", label: "competidora profesional" },
  { value: 5, label: "pilares · un método propio" },
  { text: "Online", label: "y presencial · Tenerife Sur" },
];
function Stat({ item, delay }) {
  const [ref, shown] = useReveal(0.5);
  const n = useCountUp(item.value ?? 0, shown && item.value != null);
  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""} stat`} style={{ transitionDelay: `${delay}ms` }}>
      <span className="stat__big">
        {item.value != null ? `${item.prefix || ""}${n}${item.suffix || ""}` : item.text}
      </span>
      <span className="stat__small">{item.label}</span>
    </div>
  );
}

/* -------------------- QUIZ (cuestionario interactivo) -------------------- */
const QUIZ = [
  { id: "estado", type: "single", q: "¿Cómo te sientes con tu cuerpo y tus hábitos ahora mismo?",
    options: ["Sin motivación", "Estancado/a", "Sin energía", "Con ganas de un cambio"] },
  { id: "metas", type: "multi", q: "¿Qué te gustaría lograr?", help: "Puedes elegir varias",
    options: ["Sentirme mejor", "Ganar energía", "Mejorar mis hábitos", "Perder grasa", "Ganar fuerza", "Reconectar conmigo"] },
  { id: "tiempo", type: "single", q: "¿Cuánto tiempo puedes dedicarle a la semana?", help: "Sé sincera: preparo el plan a tu medida",
    options: ["2-3 días", "4-5 días", "Todos los días", "Aún no lo sé"] },
  { id: "modalidad", type: "single", q: "¿Cómo prefieres trabajar?",
    options: ["Online", "Presencial (Tenerife)", "Combinado", "Aún no lo sé"] },
];
const TOTAL = QUIZ.length + 1; // + paso final (datos)

function Quiz() {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [form, setForm] = useState({ nombre: "", contacto: "" });
  const [done, setDone] = useState(false);

  const isForm = step === QUIZ.length;
  const s = QUIZ[step];

  const pick = (id, val, multi) => {
    setAns((a) => {
      if (!multi) return { ...a, [id]: val };
      const cur = a[id] || [];
      return { ...a, [id]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
    });
    if (!multi) setTimeout(() => setStep((x) => Math.min(QUIZ.length, x + 1)), 380);
  };

  const canNext = isForm
    ? form.nombre.trim() && form.contacto.trim()
    : s.type === "multi" ? (ans[s.id]?.length > 0) : !!ans[s.id];

  const buildMsg = () => {
    const L = ["¡Hola Anto! Hice el test de Feel&Move y quiero mi plan 💪"];
    if (ans.estado) L.push(`• Cómo me siento: ${ans.estado}`);
    if (ans.metas?.length) L.push(`• Quiero lograr: ${ans.metas.join(", ")}`);
    if (ans.tiempo) L.push(`• Tiempo disponible: ${ans.tiempo}`);
    if (ans.modalidad) L.push(`• Modalidad: ${ans.modalidad}`);
    L.push(`• Nombre: ${form.nombre}`);
    L.push(`• Contacto: ${form.contacto}`);
    return L.join("\n");
  };

  const submit = () => { window.open(waLink(buildMsg()), "_blank"); setDone(true); };

  const pct = Math.round(((done ? TOTAL : step) / TOTAL) * 100);
  const chips = [ans.estado, ...(ans.metas || []), ans.tiempo, ans.modalidad].filter(Boolean);

  return (
    <div className={`quizcard ${done ? "is-done" : ""}`}>
      <span className="qsilk qs1" aria-hidden /><span className="qsilk qs2" aria-hidden /><span className="qsilk qs3" aria-hidden />

      <div className="quiz__top">
        <div className="quiz__toprow">
          <span className="quiz__step">
            <span className="quiz__pulse" />
            Paso <b>{Math.min(step + 1, TOTAL)}</b> de {TOTAL}
          </span>
          <span className="quiz__pct">{pct}%</span>
        </div>
        <div className="quiz__segs">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span key={i} className={`seg ${i < step || done ? "past" : ""} ${i === step && !done ? "now" : ""}`} />
          ))}
        </div>
        {chips.length > 0 && !done && (
          <div className="quiz__chips">
            {chips.slice(0, 4).map((c, i) => <span className="qchip" key={c + i}>{c}</span>)}
            {chips.length > 4 && <span className="qchip qchip--more">+{chips.length - 4}</span>}
          </div>
        )}
      </div>

      <div className="quiz__body" key={done ? "done" : step}>
        {done ? (
          <div className="quiz__done">
            <span className="quiz__doneicon">
              <Check size={30} strokeWidth={2.6} />
              <i className="spark s1" /><i className="spark s2" /><i className="spark s3" />
              <i className="spark s4" /><i className="spark s5" /><i className="spark s6" />
            </span>
            <h3>Tu propuesta está en camino</h3>
            <p>Te he abierto WhatsApp con tus respuestas ya escritas. Solo pulsa enviar y te responderé personalmente.</p>
            <button className="quiz__restart" onClick={() => { setDone(false); setStep(0); setAns({}); setForm({ nombre: "", contacto: "" }); }}>
              Volver a empezar
            </button>
          </div>
        ) : isForm ? (
          <div className="stepin">
            <h3 className="quiz__q">¿A dónde te envío tu propuesta?</h3>
            <p className="quiz__help">Con tus respuestas prepararé algo pensado solo para ti.</p>
            <label className="quiz__field" style={{ "--i": 0 }}>
              <span>Tu nombre</span>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" />
            </label>
            <label className="quiz__field" style={{ "--i": 1 }}>
              <span>Email o teléfono</span>
              <input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="Para poder responderte" />
            </label>
          </div>
        ) : (
          <div className="stepin">
            <h3 className="quiz__q">{s.q}</h3>
            {s.help && <p className="quiz__help">{s.help}</p>}
            <div className="opts">
              {s.options.map((op, oi) => {
                const sel = s.type === "multi" ? (ans[s.id] || []).includes(op) : ans[s.id] === op;
                return (
                  <button
                    key={op}
                    className={`opt ${sel ? "sel" : ""}`}
                    style={{ "--i": oi }}
                    onClick={() => pick(s.id, op, s.type === "multi")}
                  >
                    <span className="opt__key">
                      <b className="opt__letter">{String.fromCharCode(65 + oi)}</b>
                      <b className="opt__tick"><Check size={13} strokeWidth={3.4} /></b>
                    </span>
                    <span className="opt__txt">{op}</span>
                    <span className="opt__arrow"><ArrowRight size={15} /></span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!done && (
        <div className="quiz__foot">
          {step > 0 ? (
            <button className="quiz__back" onClick={() => setStep((x) => x - 1)}><ArrowLeft size={18} /> Atrás</button>
          ) : <span className="quiz__hint">Sin compromiso</span>}
          {isForm ? (
            <button className="btn btn--wine" disabled={!canNext} onClick={submit}>
              <MessageCircle size={18} /> Recibir mi propuesta
            </button>
          ) : s.type === "multi" ? (
            <button className="btn btn--wine" disabled={!canNext} onClick={() => setStep((x) => x + 1)}>
              Siguiente <ArrowRight size={18} />
            </button>
          ) : <span className="quiz__hint">Elige una opción</span>}
        </div>
      )}
    </div>
  );
}

/* Filtro SVG: hace que los degradados ondulen como tela con viento */
function ClothFilter() {
  return (
    <svg className="clothdefs" width="0" height="0" aria-hidden focusable="false">
      <defs>
        <filter id="cloth" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.011" numOctaves="2" seed="7" result="noise">
            <animate attributeName="baseFrequency"
              dur="14s" repeatCount="indefinite"
              values="0.006 0.011; 0.013 0.005; 0.004 0.014; 0.006 0.011" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="60" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="cloth-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.009" numOctaves="2" seed="3" result="n2">
            <animate attributeName="baseFrequency"
              dur="20s" repeatCount="indefinite"
              values="0.004 0.009; 0.010 0.004; 0.003 0.011; 0.004 0.009" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n2" scale="40" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/* -------------------- ANTES / DESPUÉS -------------------- */
/* Para añadir el testimonio real: rellená "quote" y "nombre".
   Si quote está vacío, no se muestra nada (la sección igual se ve terminada). */
const CASES = [
  { antes: "/antes1.jpg", despues: "/despues1.jpg", quote: "", nombre: "" },
  { antes: "/antes2.jpg", despues: "/despues2.jpg", quote: "", nombre: "" },
  { antes: "/antes3.jpg", despues: "/despues3.jpg", quote: "", nombre: "" },
  { antes: "/antes4.jpg", despues: "/despues4.jpg", quote: "", nombre: "" },
];

function BeforeAfter() {
  const [c, setC] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef({ x: 0, on: false });

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setC((i) => (i + 1) % CASES.length), 7000);
    return () => clearInterval(id);
  }, [paused]);

  const go = (d) => setC((i) => (i + d + CASES.length) % CASES.length);
  const cur = CASES[c];

  const onStart = (e) => { touch.current = { x: e.touches[0].clientX, on: true }; setPaused(true); };
  const onEnd = (e) => {
    if (!touch.current.on) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    touch.current.on = false;
    setPaused(false);
  };

  return (
    <div
      className="ba"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onStart}
      onTouchEnd={onEnd}
    >
      <div className="ba__stage">
        <button className="ba__side ba__side--l" onClick={() => go(-1)} aria-label="Caso anterior">
          <ArrowLeft size={18} />
        </button>

        <div className="ba__viewport">
          <div className="ba__track" style={{ transform: `translateX(-${c * 100}%)` }}>
            {CASES.map((cs, i) => (
              <div className="ba__slide" key={i}>
                <figure className="shot">
                  <span className="shot__tag shot__tag--before">Antes</span>
                  <img src={cs.antes} alt={`Antes — caso ${i + 1}`} loading="lazy" />
                </figure>
                <span className="ba__mid" aria-hidden><ArrowRight size={15} /></span>
                <figure className="shot shot--after">
                  <span className="shot__tag shot__tag--after">Después</span>
                  <img src={cs.despues} alt={`Después — caso ${i + 1}`} loading="lazy" />
                </figure>
              </div>
            ))}
          </div>
        </div>

        <button className="ba__side ba__side--r" onClick={() => go(1)} aria-label="Siguiente caso">
          <ArrowRight size={18} />
        </button>
      </div>

      {cur.quote && (
        <blockquote className="ba__quote">
          <span className="ba__mark">“</span>
          <p>{cur.quote}</p>
          {cur.nombre && <cite>— {cur.nombre}</cite>}
        </blockquote>
      )}

      <div className="ba__foot">
        <span className="ba__count">Caso <b>{c + 1}</b> de {CASES.length}</span>
        <div className="ba__dots">
          {CASES.map((_, i) => (
            <button key={i} className={i === c ? "on" : ""} onClick={() => setC(i)} aria-label={`Caso ${i + 1}`} />
          ))}
        </div>
        <span className="ba__swipe">Desliza →</span>
      </div>
    </div>
  );
}

/* -------------------- FAQ -------------------- */
const FAQS = [
  { q: "¿Prometes resultados rápidos?", a: "No. No creo en las dietas milagro ni en los cambios imposibles en pocas semanas. Prometo que, si trabajamos con compromiso, constancia y confianza, conseguiremos una transformación real y sostenible." },
  { q: "¿En qué crees y en qué no?", a: "No creo en las soluciones rápidas, en las dietas milagro, ni en compararte con los demás. Tampoco en trabajar desde la culpa o el miedo. Sí creo en los hábitos, en la disciplina con equilibrio, en escuchar tu cuerpo y en el movimiento con intención. Cada persona necesita un proceso diferente." },
  { q: "¿Trabajas online o presencial?", a: "Ambas. Tengo un enfoque especial en el acompañamiento online, con seguimiento continuo y videollamadas, pero también entreno de forma presencial en Tenerife Sur." },
  { q: "¿A quién acompañas?", a: "Principalmente a mujeres de 20 a 60 años que quieren mejorar su salud hormonal, recuperar energía y construir hábitos duraderos. También a hombres que buscan mejorar su composición corporal y bienestar desde un enfoque integral." },
  { q: "¿Qué incluye el programa online?", a: "Nutrición personalizada, entrenamiento adaptado, seguimiento continuo, una clase privada semanal por Zoom, educación en hábitos y asesoramiento en suplementación cuando sea necesario." },
  { q: "¿Y si nunca he entrenado?", a: "No pasa nada. Diseño programas para principiantes, nivel intermedio y avanzado. Empezamos desde donde estás hoy, a tu ritmo, sin presión ni culpa." },
];
function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`faq__item ${isOpen ? "open" : ""}`}>
            <button className="faq__q" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
              <span>{item.q}</span>{isOpen ? <Minus size={20} /> : <Plus size={20} />}
            </button>
            <div className="faq__a" style={{ maxHeight: isOpen ? 280 : 0 }}><p>{item.a}</p></div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================================ */
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoOk, setVideoOk] = useState(true);
  const [vi, setVi] = useState(0);
  const heroMedia = useRef(null);
  useEffect(() => {
    const el = heroMedia.current;
    if (!el) return;
    const vids = el.querySelectorAll("video");
    if (!vids.length) return;
    vids.forEach((v) => { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); });
    const first = vids[0].play();
    if (first && first.catch) first.catch(() => setVideoOk(false));
  }, []);
  useEffect(() => {
    if (!videoOk) return;
    const id = setTimeout(() => setVi((i) => (i + 1) % HERO_VIDEOS.length), 5000);
    return () => clearTimeout(id);
  }, [vi, videoOk]);
  const progress = useScrollProgress();
  const sy = useScrollY();
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const method = [
    { n: "01", t: "Sentir", d: "Aprender a escuchar tu cuerpo y a comprender tus emociones." },
    { n: "02", t: "Moverte", d: "Encontrar una forma de entrenar que disfrutes y puedas mantener." },
    { n: "03", t: "Nutrirte", d: "Aprender a alimentarte con equilibrio, sin restricciones innecesarias." },
    { n: "04", t: "Construir hábitos", d: "Pequeñas acciones sostenibles que generan grandes cambios." },
    { n: "05", t: "Evolucionar", d: "Transformarte física, mental y emocionalmente para vivir con plenitud." },
  ];

  return (
    <div className="page">
      <Styles />
      <ClothFilter />
      <div className="bgfx" aria-hidden style={{ filter: `hue-rotate(${progress * 40}deg)` }}>
        <span className="silk s1" /><span className="silk s2" /><span className="silk s3" />
      </div>
      <div className="scrollbar" style={{ width: `${progress * 100}%` }} />

      {/* NAV */}
      <header className="nav">
        <div className="wrap nav__inner">
          <a href="#top" className="brand" onClick={scrollTo("top")}>
            <span className="brand__name">ANTO LEONI</span>
            <span className="brand__sub">Feel&Move&nbsp;Method</span>
          </a>
          <nav className="nav__links">
            <a href="#metodo" onClick={scrollTo("metodo")}>Método</a>
            <a href="#sobre" onClick={scrollTo("sobre")}>Sobre mí</a>
            <a href="#servicios" onClick={scrollTo("servicios")}>Servicios</a>
            <a href="#resultados" onClick={scrollTo("resultados")}>Resultados</a>
          </nav>
          <a href="#test" className="btn btn--wine btn--sm nav__cta" onClick={scrollTo("test")}>Hacer el test</a>
          <button className="nav__burger" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
        <div className={`mobilemenu ${menuOpen ? "open" : ""}`}>
          <a href="#metodo" onClick={scrollTo("metodo")}>Método</a>
          <a href="#sobre" onClick={scrollTo("sobre")}>Sobre mí</a>
          <a href="#servicios" onClick={scrollTo("servicios")}>Servicios</a>
          <a href="#resultados" onClick={scrollTo("resultados")}>Resultados</a>
          <a href="#test" className="btn btn--wine" onClick={scrollTo("test")}>Hacer el test</a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero__media" ref={heroMedia}>
          {videoOk ? (
            HERO_VIDEOS.map((src, i) => (
              <video
                key={src}
                className={`hero__vid ${i === vi ? "on" : ""}`}
                src={src}
                autoPlay muted loop playsInline preload="auto"
              />
            ))
          ) : (
            <img className="hero__vid on" src="/anto2.png" alt="Antonella entrenando" />
          )}
          <div className="hero__scrim" />
        </div>
        <div className="wrap hero__content" style={{ transform: `translateY(${Math.min(sy * 0.22, 160)}px)`, opacity: Math.max(0, 1 - sy / 560) }}>
          <span className="hero__badge">Método Feel&Move<sup>®</sup></span>
          <p className="eyebrow eyebrow--light hero__eyebrow">Nutricionista · Naturópata · Entrenadora</p>
          <h1 className="hero__title">
            <span className="line-wrap"><span className="line">Vuelve</span></span>
            <span className="line-wrap"><span className="line"><em>a ti.</em></span></span>
          </h1>
          <p className="hero__lead">
            No se trata solo de moverte. Se trata de <em>sentir</em> para poder transformarte.
          </p>
          <div className="hero__cta">
            <a className="btn btn--wine btn--lg" href="#test" onClick={scrollTo("test")}>Descubre tu punto de partida <ArrowRight size={18} /></a>
            <a className="btn btn--glass btn--lg" href="#metodo" onClick={scrollTo("metodo")}>Conoce el método</a>
          </div>
        </div>
        <div className="hero__cue"><em>Desliza</em><span /></div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="wrap stats__grid">
          {STATS.map((item, i) => <Stat key={i} item={item} delay={i * 90} />)}
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee />

      {/* QUIZ / TEST */}
      <section className="quiz" id="test">
        <div className="wrap quiz__grid">
          <Reveal className="quiz__intro">
            <p className="eyebrow eyebrow--light">Empieza por aquí</p>
            <h2 className="h2 h2--light">Descubre tu punto de partida<em>.</em></h2>
            <p className="quiz__lead">
              Responde unas preguntas rápidas. Al terminar te preparo una propuesta pensada
              para ti, sin compromiso. Menos de un minuto.
            </p>
          </Reveal>
          <Reveal delay={120}><Quiz /></Reveal>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow eyebrow--light">El punto de partida</p>
            <p className="manifesto__q">No necesitas <em>una dieta más.</em> Necesitas aprender a vivir de una forma que te haga sentir bien.</p>
            <p className="manifesto__sig">Soy Anto Leoni y quiero acompañarte a construir hábitos que transformen tu cuerpo, tu mente y tu bienestar desde el movimiento consciente.</p>
          </Reveal>
        </div>
      </section>

      {/* SOBRE MÍ */}
      <section className="sobre" id="sobre">
        <div className="wrap sobre__grid">
          <Reveal className="sobre__media">
            <div className="sobre__collage">
              <img className="c1" src="/anto1.png" alt="Antonella compitiendo en fitness" />
              <img className="c2" src="/anto2.png" alt="Antonella entrenando" />
              <img className="c3" src="/anto3.png" alt="Antonella con su medalla" />
            </div>
          </Reveal>
          <Reveal delay={120} className="sobre__text">
            <p className="eyebrow">Sobre mí</p>
            <h2 className="h2">Nací en Uruguay. Con 20 años emigré sola para empezar de cero.</h2>
            <p>Competí a nivel profesional en fitness y me formé durante años en entrenamiento, nutrición, fitoterapia y naturopatía. Pero fue la propia vida la que me enseñó la mayor lección: un cuerpo sano no sirve de mucho si la mente y las emociones no lo acompañan.</p>
            <p>Por eso nació Feel&Move. Porque moverte no es únicamente entrenar. Es aprender a sentir, a escucharte y a construir hábitos que puedas mantener durante toda la vida.</p>
            <div className="chips">
              {["Profesorado de Educación Física", "Fitness superior", "Nutrición", "Fitoterapia", "Naturopatía", "Bailarina profesional"].map((c) => <span className="chip" key={c}>{c}</span>)}
            </div>
          </Reveal>
        </div>
      </section>

      {/* MÉTODO */}
      <section className="metodo" id="metodo">
        <div className="wrap">
          <Reveal className="metodo__head">
            <p className="eyebrow eyebrow--light">El Método</p>
            <h2 className="h2 h2--light">Feel&Move no es una rutina.<br /><em>Es un recorrido de cinco pasos.</em></h2>
          </Reveal>
          <div className="metodo__list">
            {method.map((m, i) => (
              <Reveal key={m.n} delay={i * 70} className="mstep">
                <span className="mstep__n">{m.n}</span>
                <div className="mstep__body"><h3>{m.t}</h3><p>{m.d}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="pasos">
        <div className="wrap">
          <Reveal className="pasos__head">
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="h2">Empezar es <em>más simple</em> de lo que crees.</h2>
          </Reveal>
          <div className="pasos__grid">
            {[
              ["Me escribes", "Haces el test o me mandas un WhatsApp. Sin compromiso."],
              ["Hablamos", "20 minutos para conocernos y entender dónde estás."],
              ["Diseño tu plan", "Nutrición y entrenamiento hechos a tu medida."],
              ["Empezamos", "Con seguimiento continuo. No estarás sola en el proceso."],
            ].map(([t, d], i) => (
              <Reveal key={i} delay={i * 90} className="paso">
                <span className="paso__n">{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="servicios" id="servicios">
        <div className="wrap servicios__grid">
          <Reveal className="prog">
            <span className="prog__badge">Más elegido</span>
            <p className="eyebrow">Programa destacado</p>
            <h2 className="h2">Programa Online Feel&Move</h2>
            <p className="prog__lead">
              El acompañamiento completo, estés donde estés. Un proceso pensado para que aprendas
              a cuidarte de verdad, no para depender de un plan.
            </p>
            <ul className="prog__list">
              {["Nutrición personalizada", "Entrenamiento adaptado a ti", "Seguimiento continuo", "Clase privada semanal por Zoom", "Educación en hábitos", "Asesoramiento en suplementación"].map((x) => (
                <li key={x}><span className="tick"><Check size={12} strokeWidth={3.2} /></span>{x}</li>
              ))}
            </ul>
            <a className="btn btn--wine btn--lg" href="#test" onClick={scrollTo("test")}>Quiero información <ArrowRight size={18} /></a>
          </Reveal>
          <Reveal delay={120} className="otros">
            <p className="eyebrow">Otros servicios</p>
            <div className="otros__grid">
              {["Entrenamiento personal presencial y online", "Rehabilitación y readaptación física", "Entrenamiento femenino", "Movilidad", "Pilates", "Yoga", "Baile fitness", "Programación por niveles"].map((x) => <div className="otros__item" key={x}>{x}</div>)}
            </div>
          </Reveal>
        </div>
      </section>

      {/* RESULTADOS */}
      <section className="resultados" id="resultados">
        <div className="wrap">
          <Reveal className="res__head">
            <p className="eyebrow">Resultados reales</p>
            <h2 className="h2">Personas, no cifras.</h2>
            <p className="res__sub">Transformaciones de personas reales que confiaron en el proceso.</p>
          </Reveal>
          <div className="res__grid">
            <Reveal className="res__card res__card--wide">
              <BeforeAfter />
            </Reveal>

            <Reveal delay={120} className="res__card res__card--cta">
              <h3>¿Y si la próxima<br />historia es la tuya?</h3>
              <p>No prometo milagros. Prometo un proceso real, acompañado y hecho a tu medida.</p>
              <a className="btn btn--wine btn--lg" href="#test" onClick={scrollTo("test")}>Empezar mi proceso <ArrowRight size={18} /></a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faqs">
        <div className="wrap faqs__grid">
          <Reveal className="faqs__aside"><p className="eyebrow">Preguntas</p><h2 className="h2">Lo que suelen preguntarme.</h2></Reveal>
          <Reveal delay={120} className="faqs__main"><Faq /></Reveal>
        </div>
      </section>

      {/* CONTACTO */}
      <section className="contacto" id="contacto">
        <div className="wrap contacto__grid">
          <Reveal className="contacto__intro">
            <p className="eyebrow eyebrow--light">Contacto</p>
            <h2 className="h2 h2--light">Tu transformación empieza aquí.</h2>
            <p className="contacto__lead">No vengo a venderte nada. Quiero darte la oportunidad de trabajar desde otro plano. Escríbeme y hablamos de dónde estás y hacia dónde quieres ir.</p>
            <div className="contacto__direct">
              <a href={waLink("Hola Anto :)")} target="_blank" rel="noreferrer"><MessageCircle size={18} /> +34 610 939 223</a>
              <a href={`mailto:${EMAIL}`}><Mail size={18} /> {EMAIL}</a>
              <span><MapPin size={18} /> Tenerife Sur, España</span>
            </div>
          </Reveal>
          <Reveal delay={120} className="contacto__cta-card">
            <h3>¿Aún no hiciste el test?</h3>
            <p>Es la forma más rápida de que sepa cómo ayudarte.</p>
            <a className="btn btn--wine" href="#test" onClick={scrollTo("test")}>Hacer el test ahora <ArrowRight size={18} /></a>
            <a className="btn btn--ghost-cream" href={waLink("Hola Anto, quiero empezar con Feel&Move.")} target="_blank" rel="noreferrer"><MessageCircle size={18} /> O escríbeme directo</a>
          </Reveal>
        </div>
      </section>

      {/* WHATSAPP FLOTANTE */}
      <a className="floatwa" href={waLink("Hola Anto :)")} target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp">
        <MessageCircle size={22} />
      </a>

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap footer__cta">
          <div>
            <p className="eyebrow">¿Empezamos?</p>
            <h2 className="h2 footer__ctah">Tu mejor versión<br />te está esperando.</h2>
          </div>
          <a className="btn btn--wine btn--lg" href={waLink("Hola Anto, quiero empezar con Feel&Move.")} target="_blank" rel="noreferrer">Escríbeme por WhatsApp <ArrowRight size={18} /></a>
        </div>
        <div className="wrap footer__cols">
          <div className="footer__col footer__col--brand">
            <span className="brand__name">ANTO LEONI</span>
            <span className="footer__tag">Feel&Move Method</span>
            <p className="footer__desc">Movimiento consciente, hábitos y bienestar. Un método que une cuerpo, mente y emociones. Online y presencial · Tenerife Sur.</p>
            <div className="footer__social">
              <a href="#" aria-label="Instagram"><Instagram size={19} /></a>
              <a href="#" aria-label="TikTok"><TikTok size={19} /></a>
              <a href="#" aria-label="YouTube"><Youtube size={19} /></a>
              <a href={waLink("Hola Anto :)")} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={19} /></a>
            </div>
          </div>
          <nav className="footer__col">
            <h4>Explora</h4>
            <a href="#test" onClick={scrollTo("test")}>Hacer el test</a>
            <a href="#metodo" onClick={scrollTo("metodo")}>El Método</a>
            <a href="#sobre" onClick={scrollTo("sobre")}>Sobre mí</a>
            <a href="#servicios" onClick={scrollTo("servicios")}>Servicios</a>
          </nav>
          <div className="footer__col">
            <h4>Contacto</h4>
            <a href={waLink("Hola Anto :)")} target="_blank" rel="noreferrer">+34 610 939 223</a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <span>Tenerife Sur, España</span>
          </div>
        </div>
        <div className="wrap footer__legal">
          <span>© {new Date().getFullYear()} Anto Leoni · Todos los derechos reservados</span>
          <span>Feel&Move Method®</span>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================================ */
function Styles() {
  return (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Manrope:wght@400;500;600;700;800&display=swap');
    :root{
      --paper:#ECE4D6; --paper2:#E4DAC8; --cream:#F5EFE4;
      --ink:#221926; --ink2:#5a4f5c; --ink3:#8a7f8c;
      --rose:#EC5F86; --violet:#7C5CE6; --coral:#F2926B;
      --sand:#F1B8CE;
      --line:rgba(34,25,38,.13);
      --grad:linear-gradient(120deg,#7C5CE6,#C651A8,#EC5F86,#F2926B);
      --band:linear-gradient(125deg,#221049,#4a1685,#9a2586,#5a1a86,#221049);
      --serif:'Fraunces',Georgia,serif; --sans:'Manrope',system-ui,sans-serif;
      --ease:cubic-bezier(.16,.84,.32,1);
    }
    *{box-sizing:border-box}
    html{scroll-behavior:smooth}
    html,body,#root{margin:0;padding:0;background:var(--paper)}
    ::selection{background:var(--rose);color:#fff}
    .page{background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:17px;line-height:1.65;-webkit-font-smoothing:antialiased;overflow-x:hidden}
    .page p{margin:0 0 1em}
    .wrap{width:100%;max-width:1180px;margin:0 auto;padding:0 28px;position:relative;z-index:2}
    a{color:inherit;text-decoration:none}
    em{font-style:italic}
    :focus-visible{outline:2.5px solid var(--rose);outline-offset:3px;border-radius:2px}

    /* grano cinematográfico */
    .page::after{content:"";position:fixed;inset:0;z-index:9;pointer-events:none;opacity:.05;mix-blend-mode:overlay;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

    .scrollbar{position:fixed;top:0;left:0;height:3px;background:var(--grad);z-index:100;width:0}

    @keyframes wave{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

    /* FONDO ANIMADO GLOBAL — cintas de seda */
    .bgfx{position:fixed;inset:-15%;z-index:0;pointer-events:none;overflow:hidden;transition:filter .25s linear}
    .silk{position:absolute;filter:blur(55px);opacity:.6;mix-blend-mode:multiply;border-radius:50%;will-change:transform}
    .s1{width:85vw;height:32vw;left:-28vw;bottom:-8vw;background:linear-gradient(112deg,transparent 8%,#7C5CE6 38%,#5b8bff 58%,transparent 88%);animation:silk1 24s ease-in-out infinite alternate}
    .s2{width:82vw;height:30vw;right:-28vw;top:6vh;background:linear-gradient(112deg,transparent 8%,#C651A8 40%,#7C5CE6 60%,transparent 90%);animation:silk2 30s ease-in-out infinite alternate}
    .s3{width:72vw;height:26vw;left:2vw;top:42vh;background:linear-gradient(100deg,transparent 10%,#EC5F86 42%,#F2926B 60%,transparent 90%);animation:silk3 27s ease-in-out infinite alternate}
    @keyframes silk1{from{transform:rotate(-18deg) translate(0,0)}to{transform:rotate(-7deg) translate(7vw,-4vh)}}
    @keyframes silk2{from{transform:rotate(20deg) translate(0,0)}to{transform:rotate(9deg) translate(-7vw,5vh)}}
    @keyframes silk3{from{transform:rotate(-8deg) translate(0,0) scale(1)}to{transform:rotate(-1deg) translate(5vw,-3vh) scale(1.1)}}
    .page > *:not(.bgfx):not(.scrollbar){position:relative;z-index:1}

    /* gradiente suave en textos clave */
    .h2,.h2 em,.hero__title em,.stat__big,.eyebrow,.grad-text{
      background:var(--grad);
      -webkit-background-clip:text;background-clip:text;
      -webkit-text-fill-color:transparent;color:transparent}
    .h2 em,.hero__title em{font-style:italic}
    .stat__big{font-style:normal}

    .eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;margin:0 0 18px}
    .eyebrow::before{content:"";width:26px;height:2px;background:var(--grad);border-radius:2px}
    .eyebrow--light{color:var(--sand);-webkit-text-fill-color:var(--sand);background:none}
    .eyebrow--light::before{background:var(--sand)}
    .h2{font-family:var(--serif);font-weight:400;font-size:clamp(30px,4.4vw,52px);line-height:1.08;letter-spacing:-.01em;margin:0 0 24px}
    .h2--light{color:var(--cream);-webkit-text-fill-color:var(--cream);background:none}
    .h2--light em{-webkit-text-fill-color:initial;color:var(--sand);background:none}

    /* REVEAL */
    .reveal{opacity:0;transform:translateY(34px) scale(.985);filter:blur(4px);transition:opacity .9s var(--ease),transform .9s var(--ease),filter .9s var(--ease)}
    .reveal.in{opacity:1;transform:none;filter:none}
    @media (prefers-reduced-motion:reduce){
      .reveal{opacity:1!important;transform:none!important;filter:none!important;transition:none}
      .line,.hero__lead,.hero__cta,.hero__eyebrow,.hero__badge,.marquee__track,.silk,.floatwa,
      .quiz,.manifesto,.metodo,.contacto,.quizcard,.qsilk{animation:none!important}
    }

    /* BOTONES */
    .btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:9px;font-family:var(--sans);font-weight:600;font-size:15px;letter-spacing:.01em;padding:14px 26px;border-radius:100px;cursor:pointer;border:1.5px solid transparent;transition:transform .3s var(--ease),color .25s ease,border-color .25s ease,box-shadow .35s ease,background .25s ease,filter .25s ease}
    .btn--lg{padding:17px 30px;font-size:16px}
    .btn:hover{transform:translateY(-2px) scale(1.015)}
    .btn:active{transform:translateY(0) scale(.99)}
    .btn svg{transition:transform .25s ease}
    .btn:hover svg:last-child{transform:translateX(4px)}
    .btn--sm{padding:10px 20px;font-size:14px}
    .btn--wine{background:var(--grad);color:#fff;box-shadow:0 12px 32px -10px rgba(124,92,230,.5)}
    .btn--wine::after{content:"";position:absolute;top:0;left:-80%;width:55%;height:100%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.42),transparent);transform:skewX(-18deg);transition:left .6s ease}
    .btn--wine:hover::after{left:130%}
    .btn--wine:hover{box-shadow:0 22px 52px -12px rgba(236,95,134,.65)}
    .btn--cream{background:var(--cream);color:var(--ink)}
    .btn--cream:hover{background:#fff;box-shadow:0 12px 30px -12px rgba(0,0,0,.35)}
    .btn--glass{background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.4);color:var(--cream);backdrop-filter:blur(10px)}
    .btn--glass:hover{background:rgba(255,255,255,.24);border-color:rgba(255,255,255,.6)}
    .btn--ghost-light{border-color:rgba(245,239,228,.5);color:var(--cream)}
    .btn--ghost-light:hover{background:rgba(245,239,228,.12)}
    .btn--ghost-ink{border-color:var(--ink);color:var(--ink)}
    .btn--ghost-ink:hover{background:var(--ink);color:var(--cream)}
    .btn--ghost-cream{border-color:rgba(245,239,228,.4);color:var(--cream)}
    .btn--ghost-cream:hover{background:rgba(245,239,228,.12)}
    .btn:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}

    /* SLOTS */
    .slot{position:relative;background:linear-gradient(135deg,rgba(124,92,230,.08),rgba(236,95,134,.08));border:1.5px dashed var(--rose);border-radius:16px;min-height:220px;display:flex;align-items:center;justify-content:center;color:var(--rose);text-align:center;padding:24px;overflow:hidden}
    .slot--tall{min-height:100%;height:100%}
    .slot img,.slot video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--ease)}
    .slot:hover img,.slot:hover video{transform:scale(1.06)}
    .slot__inner{display:flex;flex-direction:column;align-items:center;gap:10px;max-width:260px}
    .slot__label{font-weight:600;font-size:14px;line-height:1.35}
    .slot__hint{font-size:12px;color:var(--ink3);font-weight:500}
    .placeholder-text{color:var(--ink3);font-style:italic}

    /* NAV */
    .nav{position:sticky;top:0;z-index:50;background:rgba(236,228,214,.78);backdrop-filter:blur(14px) saturate(1.4);border-bottom:1px solid var(--line)}
    .nav__inner{display:flex;align-items:center;justify-content:space-between;height:72px;gap:20px}
    .brand{display:flex;flex-direction:column;line-height:1}
    .brand__name{font-family:var(--sans);font-weight:800;letter-spacing:.18em;font-size:16px}
    .brand__sub{font-family:var(--serif);font-style:italic;font-size:12px;color:var(--rose);margin-top:3px}
    .nav__links{display:flex;gap:30px;font-size:15px;font-weight:600}
    .nav__links a{color:var(--ink2);transition:color .2s;position:relative}
    .nav__links a::after{content:"";position:absolute;left:0;bottom:-4px;width:0;height:2px;background:var(--grad);border-radius:2px;transition:width .3s var(--ease)}
    .nav__links a:hover{color:var(--ink)} .nav__links a:hover::after{width:100%}
    .nav__burger{display:none;background:none;border:none;color:var(--ink);cursor:pointer;padding:8px;margin:-8px;align-items:center;justify-content:center}
    .mobilemenu{display:none}
    .mobilemenu a{display:block;padding:17px 28px;font-size:18px;font-weight:600;color:var(--ink);border-top:1px solid var(--line)}
    .mobilemenu a.btn{display:flex;justify-content:center;margin:16px 28px 22px;padding:16px 24px;border-top:none;color:#fff}

    /* HERO */
    .hero{position:relative;min-height:92vh;min-height:92dvh;display:flex;align-items:flex-start;color:var(--cream);overflow:hidden}
    .hero__media{position:absolute;inset:0;z-index:0;overflow:hidden;
      background:linear-gradient(125deg,#1b0a3d 0%,#4a1585 22%,#8e2192 45%,#c2367f 62%,#6b23a8 80%,#1b0a3d 100%);
      background-size:400% 400%;animation:meshflow 20s ease-in-out infinite}
    .hero__vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;opacity:0;transition:opacity .8s ease;transform:scale(1.02)}
    .hero__vid.on{opacity:1}
    video::-webkit-media-controls-start-playback-button,
    video::-webkit-media-controls-overlay-play-button,
    video::-webkit-media-controls-play-button,
    video::-webkit-media-controls-panel,
    video::-webkit-media-controls{display:none!important;-webkit-appearance:none!important;appearance:none!important;opacity:0!important}
    .hero__scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,10,26,.14) 0%,rgba(18,10,26,.42) 55%,rgba(18,10,26,.86) 100%),linear-gradient(90deg,rgba(18,10,26,.55) 0%,rgba(18,10,26,.12) 55%,transparent 100%)}

    /* PANTALLA ANCHA: los vídeos son verticales, así que se muestran ENTEROS a la
       derecha, apoyados sobre el degradado animado, con el texto a la izquierda.
       (En el celular siguen a pantalla completa, que es donde calzan perfecto.) */
    @media(min-width:981px){
      .hero{align-items:center}
      .hero__vid{object-fit:contain;object-position:80% center}
      .hero__scrim{background:
        linear-gradient(90deg,rgba(18,10,26,.78) 0%,rgba(18,10,26,.5) 40%,rgba(18,10,26,.12) 62%,transparent 80%),
        linear-gradient(180deg,rgba(18,10,26,.2) 0%,transparent 32%,rgba(18,10,26,.38) 100%)}
      .hero__content{max-width:600px;padding-top:40px;padding-bottom:40px}
    }
    .hero__content{position:relative;z-index:2;padding-top:96px;padding-bottom:60px;max-width:900px;will-change:transform,opacity}
    .hero__badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(8px);color:var(--cream);font-size:13px;font-weight:600;letter-spacing:.05em;padding:8px 16px;border-radius:100px;margin-bottom:18px;animation:fadein 1s ease .05s both}
    .hero__badge sup{font-size:9px}
    .hero__eyebrow{color:rgba(245,239,228,.85);-webkit-text-fill-color:rgba(245,239,228,.85);font-size:11px;letter-spacing:.18em;margin-bottom:14px;animation:fadein 1s ease .18s both}
    .hero__eyebrow::before{background:var(--grad)}
    .hero__title{font-family:var(--serif);font-weight:300;font-size:clamp(60px,12vw,150px);line-height:.92;letter-spacing:-.03em;margin:0 0 24px;text-shadow:0 4px 40px rgba(18,10,26,.35)}
    .line-wrap{display:block;overflow:hidden;padding-bottom:.06em}
    .line{display:block;animation:rise 1.15s var(--ease) both}
    .line-wrap:nth-child(2) .line{animation-delay:.14s}
    @keyframes rise{from{opacity:0;transform:translateY(105%)}to{opacity:1;transform:none}}
    .hero__lead{font-size:clamp(17px,2vw,22px);max-width:520px;color:rgba(245,239,228,.92);animation:fadein 1s ease .5s both}
    .hero__lead em{color:var(--sand)}
    .hero__cta{display:flex;gap:14px;flex-wrap:wrap;margin-top:14px;animation:fadein 1s ease .68s both}
    @keyframes fadein{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    .hero__cue{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px}
    .hero__cue em{font-family:var(--serif);font-style:italic;font-size:13px;color:rgba(245,239,228,.75);letter-spacing:.08em}
    .hero__cue span{display:block;width:1px;height:40px;background:rgba(245,239,228,.55);animation:cue 2.4s ease-in-out infinite;transform-origin:top}
    @keyframes cue{0%,100%{transform:scaleY(.35);opacity:.4}50%{transform:scaleY(1);opacity:1}}

    /* STATS */
    .stats{background:transparent;border-bottom:1px solid var(--line)}
    .stats__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:46px 28px}
    .stat{display:flex;flex-direction:column;gap:5px;padding:6px 4px;border-left:1px solid var(--line);transition:transform .35s var(--ease)}
    .stat:hover{transform:translateY(-3px)}
    .stat:first-child{border-left:none;padding-left:0}
    .stat__big{font-family:var(--serif);font-size:clamp(28px,3.6vw,44px);line-height:1}
    .stat__small{font-size:13px;color:var(--ink2);letter-spacing:.02em;font-weight:500}

    /* MARQUEE doble */
    .marquee{background:var(--grad);color:var(--cream);padding:16px 0 14px;overflow:hidden;white-space:nowrap;transform:rotate(-1.2deg) scale(1.02);box-shadow:0 20px 50px -30px rgba(124,92,230,.6)}
    .marquee__track{display:inline-flex;animation:marq 26s linear infinite;will-change:transform}
    .marquee__track--rev{animation:marqrev 34s linear infinite;margin-top:2px}
    .marquee:hover .marquee__track{animation-play-state:paused}
    .marquee span{font-family:var(--serif);font-style:italic;font-size:clamp(20px,3vw,34px);padding:0 28px;opacity:.97}
    .marquee span.out{-webkit-text-stroke:1px rgba(245,239,228,.85);color:transparent;opacity:.7;font-size:clamp(16px,2.2vw,24px)}
    .marquee span::after{content:"·";margin-left:56px;opacity:.5}
    .marquee span.out::after{-webkit-text-stroke:0;color:rgba(245,239,228,.5)}
    @keyframes marq{to{transform:translateX(-50%)}}
    @keyframes marqrev{from{transform:translateX(-50%)}to{transform:translateX(0)}}

    /* BANDAS VIOLETA */
    .quiz,.manifesto,.metodo,.contacto{position:relative;color:var(--cream);background:var(--band);background-size:300% 300%;animation:wave 22s ease infinite;overflow:hidden}
    .quiz::before,.manifesto::before,.metodo::before,.contacto::before{content:"";position:absolute;top:-25%;right:-12%;width:65%;height:90%;background:radial-gradient(circle,rgba(236,95,134,.45),transparent 60%);filter:blur(50px);pointer-events:none;z-index:0;animation:silk2 24s ease-in-out infinite alternate}
    .manifesto{animation-duration:26s} .contacto{animation-duration:20s} .quiz{animation-duration:14s}

    /* QUIZ */
    .quiz{padding:clamp(64px,9vw,120px) 0}
    .quiz__grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:56px;align-items:center}
    .quiz__lead{color:rgba(245,239,228,.78);max-width:380px}

    .clothdefs{position:absolute;width:0;height:0;overflow:hidden}

    /* ===== TARJETA DEL TEST: degradado animado ondulando como sábana ===== */
    .quizcard{position:relative;overflow:hidden;border-radius:26px;padding:clamp(26px,4vw,42px);
      border:1px solid rgba(255,255,255,.2);
      box-shadow:0 50px 100px -45px rgba(0,0,0,.8);
      background:#1b0a3d;
      isolation:isolate}

    /* capa base: mesh de color desplazándose */
    .qs1{position:absolute;inset:-25%;z-index:-3;pointer-events:none;
      background:linear-gradient(125deg,#2d0f6b 0%,#5c1aa8 18%,#a3229b 38%,#e0417f 54%,#f2706b 66%,#7b28c4 84%,#2d0f6b 100%);
      background-size:320% 320%;
      animation:meshflow 11s ease-in-out infinite;
      filter:url(#cloth);
      will-change:background-position}
    @keyframes meshflow{
      0%{background-position:0% 50%}
      50%{background-position:100% 50%}
      100%{background-position:0% 50%}
    }

    /* capa media: luces que ondulan (la "sábana") */
    .qs2{position:absolute;inset:-25%;z-index:-2;pointer-events:none;opacity:.9;
      background:
        radial-gradient(60% 44% at 20% 26%, rgba(255,120,170,.75), transparent 62%),
        radial-gradient(54% 40% at 82% 74%, rgba(130,100,255,.8), transparent 62%),
        radial-gradient(46% 34% at 60% 12%, rgba(110,170,255,.6), transparent 62%);
      background-size:230% 230%;
      animation:lights 13s ease-in-out infinite alternate;
      filter:url(#cloth-soft)}
    @keyframes lights{
      0%{background-position:0% 0%}
      100%{background-position:100% 100%}
    }

    /* capa superior: pliegue de luz que cruza */
    .qs3{position:absolute;inset:-25%;z-index:-1;pointer-events:none;
      background:linear-gradient(102deg,transparent 20%,rgba(255,255,255,.22) 40%,rgba(255,220,235,.4) 50%,rgba(255,255,255,.2) 60%,transparent 82%);
      filter:blur(22px) url(#cloth-soft);
      animation:band 9s ease-in-out infinite alternate}
    @keyframes band{
      from{transform:translate(-14%,8%) rotate(-8deg) scale(1.2)}
      to{transform:translate(12%,-8%) rotate(5deg) scale(1.3)}
    }

    .quizcard.is-done .qs1{animation-duration:5s}
    .quizcard.is-done .qs2{animation-duration:6s}

    .quiz__top{margin-bottom:26px}
    .quiz__toprow{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
    .quiz__step{display:inline-flex;align-items:center;gap:9px;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:rgba(245,239,228,.62)}
    .quiz__step b{color:var(--cream);font-weight:700}
    .quiz__pulse{width:7px;height:7px;border-radius:50%;background:var(--rose);box-shadow:0 0 0 0 rgba(236,95,134,.7);animation:blip 1.9s ease-out infinite}
    @keyframes blip{0%{box-shadow:0 0 0 0 rgba(236,95,134,.7)}70%{box-shadow:0 0 0 9px rgba(236,95,134,0)}100%{box-shadow:0 0 0 0 rgba(236,95,134,0)}}
    .quiz__pct{font-family:var(--serif);font-size:20px;font-weight:500;color:var(--sand);font-variant-numeric:tabular-nums}
    .quiz__segs{display:flex;gap:6px}
    .seg{position:relative;flex:1;height:4px;border-radius:100px;background:rgba(245,239,228,.16);overflow:hidden;transition:transform .45s var(--ease)}
    .seg.past::after{content:"";position:absolute;inset:0;background:var(--grad);animation:fill .5s var(--ease) both}
    .seg.now{transform:scaleY(1.6)}
    .seg.now::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(241,184,206,.9),transparent);animation:sweep 1.7s ease-in-out infinite}
    @keyframes fill{from{transform:scaleX(0);transform-origin:left}to{transform:scaleX(1)}}
    @keyframes sweep{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

    .quiz__chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}
    .qchip{font-size:11px;font-weight:600;color:rgba(245,239,228,.8);background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);border-radius:100px;padding:5px 11px;animation:chipin .4s var(--ease) both}
    .qchip--more{background:rgba(236,95,134,.25);border-color:transparent}
    @keyframes chipin{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:none}}

    .quiz__body{min-height:268px}
    .stepin{animation:stepin .5s var(--ease)}
    @keyframes stepin{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
    .quiz__q{font-family:var(--serif);font-weight:400;font-size:clamp(23px,3vw,32px);line-height:1.18;margin:0 0 6px;color:var(--cream)}
    .quiz__help{font-size:14px;color:rgba(245,239,228,.62);margin:0 0 20px}

    .opts{display:flex;flex-direction:column;gap:10px}
    .opt{position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:15px 18px;border-radius:14px;border:1.5px solid rgba(245,239,228,.2);background:rgba(255,255,255,.045);color:var(--cream);font-family:var(--sans);font-size:15px;font-weight:500;cursor:pointer;
      transition:border-color .3s var(--ease),background .3s var(--ease),transform .3s var(--ease),box-shadow .35s var(--ease);
      animation:optin .5s var(--ease) both;animation-delay:calc(var(--i) * 70ms)}
    @keyframes optin{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
    /* barrido de luz al pasar */
    .opt::after{content:"";position:absolute;top:0;left:-70%;width:45%;height:100%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.13),transparent);transform:skewX(-18deg);transition:left .55s ease}
    .opt:hover::after{left:130%}
    .opt:hover{border-color:rgba(241,184,206,.65);background:rgba(255,255,255,.09);transform:translateX(5px)}
    .opt:active{transform:translateX(5px) scale(.985)}
    .opt.sel{background:var(--grad);border-color:transparent;transform:translateX(5px);box-shadow:0 16px 40px -14px rgba(236,95,134,.75);animation:pick .45s var(--ease)}
    @keyframes pick{0%{transform:translateX(5px) scale(1)}40%{transform:translateX(5px) scale(1.028)}100%{transform:translateX(5px) scale(1)}}

    .opt__key{position:relative;flex:none;width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(245,239,228,.09);border:1px solid rgba(245,239,228,.2);font-size:12px;font-weight:700;color:rgba(245,239,228,.75);transition:all .3s var(--ease)}
    .opt:hover .opt__key{border-color:rgba(241,184,206,.6);color:var(--cream)}
    .opt__letter,.opt__tick{position:absolute;display:flex;align-items:center;justify-content:center;transition:opacity .25s var(--ease),transform .3s var(--ease)}
    .opt__tick{opacity:0;transform:scale(.4) rotate(-25deg)}
    .opt.sel .opt__key{background:#fff;border-color:#fff;color:var(--rose)}
    .opt.sel .opt__letter{opacity:0;transform:scale(.4)}
    .opt.sel .opt__tick{opacity:1;transform:none}
    .opt__txt{flex:1}
    .opt__arrow{opacity:0;transform:translateX(-6px);transition:all .3s var(--ease);color:rgba(245,239,228,.55)}
    .opt:hover .opt__arrow{opacity:1;transform:none}
    .opt.sel .opt__arrow{opacity:.9;color:#fff;transform:none}

    .quiz__foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:26px;padding-top:22px;border-top:1px solid rgba(245,239,228,.12)}
    .quiz__back{background:none;border:none;color:rgba(245,239,228,.7);cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-family:var(--sans);font-weight:600;font-size:15px;padding:8px 4px;transition:color .25s,transform .25s var(--ease)}
    .quiz__back:hover{color:var(--cream);transform:translateX(-3px)}
    .quiz__hint{font-size:13px;color:rgba(245,239,228,.45)}

    .quiz__field{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;animation:optin .5s var(--ease) both;animation-delay:calc(var(--i) * 90ms)}
    .quiz__field span{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(245,239,228,.6)}
    .quiz__field input{background:rgba(245,239,228,.07);border:1.5px solid rgba(245,239,228,.2);border-radius:14px;padding:15px 17px;color:var(--cream);font-family:var(--sans);font-size:16px;transition:border-color .3s,background .3s,box-shadow .3s}
    .quiz__field input::placeholder{color:rgba(245,239,228,.4)}
    .quiz__field input:focus{outline:none;border-color:var(--sand);background:rgba(245,239,228,.12);box-shadow:0 0 0 4px rgba(241,184,206,.14)}

    /* FINAL con destellos */
    .quiz__done{text-align:center;padding:26px 0;animation:stepin .55s var(--ease)}
    .quiz__doneicon{position:relative;display:inline-flex;width:66px;height:66px;border-radius:50%;background:var(--grad);color:#fff;align-items:center;justify-content:center;margin-bottom:12px;box-shadow:0 20px 44px -14px rgba(236,95,134,.75);animation:pop .6s var(--ease) both}
    @keyframes pop{0%{transform:scale(.3) rotate(-20deg);opacity:0}55%{transform:scale(1.12) rotate(4deg)}100%{transform:scale(1) rotate(0);opacity:1}}
    .quiz__doneicon::before{content:"";position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(236,95,134,.55);animation:halo 1.6s ease-out .35s infinite}
    @keyframes halo{0%{transform:scale(.9);opacity:.9}100%{transform:scale(1.5);opacity:0}}
    .spark{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--sand);opacity:0;animation:spark .9s var(--ease) .25s both}
    .spark.s1{top:-4px;left:50%} .spark.s2{top:12%;right:-6px;background:#fff}
    .spark.s3{bottom:6%;right:0} .spark.s4{bottom:-4px;left:44%;background:#fff}
    .spark.s5{bottom:10%;left:-6px} .spark.s6{top:10%;left:-2px;background:#fff}
    .spark.s1{--tx:0px;--ty:-28px} .spark.s2{--tx:26px;--ty:-18px} .spark.s3{--tx:26px;--ty:18px}
    .spark.s4{--tx:0px;--ty:28px} .spark.s5{--tx:-26px;--ty:18px} .spark.s6{--tx:-26px;--ty:-18px}
    @keyframes spark{0%{opacity:0;transform:translate(0,0) scale(.4)}35%{opacity:1}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(.9)}}
    .quiz__done h3{font-family:var(--serif);font-weight:400;font-size:clamp(24px,3vw,30px);margin:10px 0}
    .quiz__done p{color:rgba(245,239,228,.75);max-width:360px;margin:0 auto 22px}
    .quiz__restart{background:none;border:none;color:rgba(245,239,228,.6);font-family:var(--sans);font-size:14px;font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:4px;padding:6px;transition:color .25s}
    .quiz__restart:hover{color:var(--cream)}

    /* MANIFESTO */
    .manifesto{padding:clamp(80px,12vw,150px) 0}
    .manifesto__q{font-family:var(--serif);font-weight:300;font-size:clamp(28px,4.6vw,54px);line-height:1.14;letter-spacing:-.01em;max-width:960px;margin:0 0 30px}
    .manifesto__q em{color:var(--sand)}
    .manifesto__sig{font-size:clamp(16px,1.8vw,20px);color:rgba(245,239,228,.75);max-width:640px}

    /* CÓMO FUNCIONA */
    .pasos{padding:clamp(56px,8vw,100px) 0}
    .pasos__head{max-width:620px;margin-bottom:40px}
    .pasos__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
    .paso{position:relative;background:rgba(255,255,255,.5);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.55);border-radius:18px;padding:28px 22px;transition:transform .35s var(--ease),box-shadow .35s,background .35s}
    .paso:hover{transform:translateY(-4px);background:rgba(255,255,255,.72);box-shadow:0 26px 55px -32px rgba(124,92,230,.45)}
    .paso__n{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:var(--grad);color:#fff;font-weight:700;font-size:15px;margin-bottom:16px;box-shadow:0 10px 22px -10px rgba(236,95,134,.6)}
    .paso h3{font-family:var(--serif);font-weight:400;font-size:21px;margin:0 0 8px}
    .paso p{color:var(--ink2);margin:0;font-size:15px;line-height:1.55}

    /* SOBRE */
    .sobre{padding:clamp(64px,9vw,120px) 0}
    .sobre__grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:60px;align-items:start}
    .sobre__media{min-height:auto}
    .sobre__collage{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .sobre__collage img{width:100%;height:100%;object-fit:cover;border-radius:16px;display:block;box-shadow:0 28px 60px -30px rgba(30,10,40,.55);transition:transform .5s var(--ease),box-shadow .5s}
    .sobre__collage img:hover{transform:scale(1.03) rotate(.4deg);box-shadow:0 36px 80px -30px rgba(124,92,230,.5)}
    .sobre__collage .c1{grid-column:1;grid-row:1 / 3}
    .sobre__collage .c2{grid-column:2;grid-row:1;aspect-ratio:1 / 1}
    .sobre__collage .c3{grid-column:2;grid-row:2;aspect-ratio:1 / 1}
    .sobre__text p{color:var(--ink2);max-width:560px}
    .chips{display:flex;flex-wrap:wrap;gap:9px;margin-top:24px}
    .chip{font-size:13px;font-weight:600;padding:8px 16px;border:1px solid rgba(255,255,255,.5);border-radius:100px;background:rgba(255,255,255,.5);transition:all .3s var(--ease)}
    .chip:hover{background:var(--grad);color:#fff;border-color:transparent;transform:translateY(-2px)}

    /* MÉTODO */
    .metodo{padding:clamp(72px,11vw,140px) 0}
    .metodo__head{max-width:760px;margin-bottom:56px}
    .metodo__list{display:flex;flex-direction:column}
    .mstep{position:relative;display:grid;grid-template-columns:120px 1fr;gap:28px;align-items:baseline;padding:34px 10px;border-top:1px solid rgba(245,239,228,.16);transition:padding-left .4s var(--ease),background .4s}
    .mstep::before{content:"";position:absolute;left:0;top:0;height:100%;width:3px;background:var(--grad);transform:scaleY(0);transform-origin:top;transition:transform .45s var(--ease)}
    .mstep:last-child{border-bottom:1px solid rgba(245,239,228,.16)}
    .mstep:hover{padding-left:26px;background:rgba(255,255,255,.04)}
    .mstep:hover::before{transform:scaleY(1)}
    .mstep__n{font-family:var(--serif);font-size:clamp(34px,4vw,56px);color:var(--sand);line-height:1;transition:color .3s}
    .mstep:hover .mstep__n{color:var(--cream)}
    .mstep__body h3{font-family:var(--serif);font-weight:400;font-size:clamp(24px,2.6vw,34px);margin:0 0 8px}
    .mstep__body p{color:rgba(245,239,228,.75);margin:0;max-width:560px}

    /* SERVICIOS */
    .servicios{padding:clamp(64px,9vw,120px) 0}
    .servicios__grid{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:start}
    .prog{position:relative;background:rgba(255,255,255,.58);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.55);border-radius:24px;padding:44px;box-shadow:0 30px 70px -40px rgba(30,10,40,.35);transition:transform .4s var(--ease),box-shadow .4s}
    .prog::before{content:"";position:absolute;left:0;top:0;width:100%;height:4px;background:var(--grad);border-radius:24px 24px 0 0}
    .prog:hover{transform:translateY(-5px);box-shadow:0 44px 95px -40px rgba(124,92,230,.5)}
    .prog__badge{position:absolute;top:-13px;right:28px;background:var(--grad);color:#fff;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:7px 15px;border-radius:100px;box-shadow:0 12px 28px -12px rgba(236,95,134,.6)}
    .prog__lead{color:var(--ink2);max-width:440px}
    .prog__list{list-style:none;padding:0;margin:0 0 32px}
    .prog__list li{display:flex;align-items:center;gap:13px;padding:13px 0;border-bottom:1px solid var(--line);font-weight:500;transition:padding-left .3s var(--ease)}
    .prog__list li:hover{padding-left:8px}
    .prog__list li:last-child{border-bottom:none}
    .tick{flex:none;width:22px;height:22px;border-radius:50%;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px -6px rgba(236,95,134,.6)}
    .dot{width:8px;height:8px;border-radius:50%;background:var(--grad);flex:none}
    .otros__grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:6px}
    .otros__item{background:rgba(255,255,255,.5);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.5);border-radius:14px;padding:18px 16px;font-size:14px;font-weight:600;transition:all .3s var(--ease)}
    .otros__item:hover{background:var(--grad);color:#fff;border-color:transparent;transform:translateY(-3px);box-shadow:0 16px 36px -16px rgba(236,95,134,.55)}

    /* RESULTADOS */
    .resultados{background:transparent;padding:clamp(64px,9vw,120px) 0}
    .res__head{max-width:640px;margin-bottom:44px}
    .res__sub{color:var(--ink3);font-style:italic}
    .res__grid{display:grid;grid-template-columns:1.35fr .65fr;gap:26px;align-items:stretch;min-width:0}
    .res__card{background:rgba(255,255,255,.5);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.45);border-radius:22px;padding:22px;display:flex;flex-direction:column;gap:18px;min-width:0;overflow:hidden;transition:transform .4s var(--ease),box-shadow .4s}
    .res__card:hover{transform:translateY(-5px);box-shadow:0 34px 70px -38px rgba(124,92,230,.45)}
    .res__ba{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .ba{display:flex;flex-direction:column;gap:16px;width:100%;min-width:0}
    .ba__stage{position:relative;width:100%;min-width:0}
    .ba__side{position:absolute;top:50%;transform:translateY(-50%);z-index:5;width:44px;height:44px;border-radius:50%;border:none;background:rgba(255,255,255,.9);color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 14px 34px -12px rgba(30,10,40,.55);transition:all .3s var(--ease)}
    .ba__side:hover{background:var(--grad);color:#fff;transform:translateY(-50%) scale(1.1)}
    .ba__side:active{transform:translateY(-50%) scale(.94)}
    .ba__side--l{left:-14px}
    .ba__side--r{right:-14px}

    .ba__viewport{overflow:hidden;border-radius:18px;width:100%;min-width:0}
    .ba__track{display:flex;width:100%;transition:transform .8s var(--ease)}
    .ba__slide{position:relative;flex:0 0 100%;width:100%;min-width:0;display:grid;grid-template-columns:1fr 1fr;gap:12px}

    .shot{position:relative;margin:0;min-width:0;border-radius:16px;overflow:hidden;background:rgba(124,92,230,.06);box-shadow:0 20px 45px -26px rgba(30,10,40,.45)}
    .shot img{width:100%;aspect-ratio:3 / 4;object-fit:cover;display:block;transition:transform 1.4s var(--ease);filter:saturate(.8) contrast(.97)}
    .shot--after img{filter:saturate(1.08) contrast(1.03)}
    .shot:hover img{transform:scale(1.045)}
    .shot::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(18,10,26,.3) 0%,transparent 32%)}
    .shot__tag{position:absolute;top:12px;left:12px;z-index:2;display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:7px 12px;border-radius:100px;backdrop-filter:blur(8px)}
    .shot__tag::before{content:"";width:5px;height:5px;border-radius:50%}
    .shot__tag--before{background:rgba(34,25,38,.72);color:rgba(245,239,228,.9)}
    .shot__tag--before::before{background:rgba(245,239,228,.5)}
    .shot__tag--after{background:var(--grad);color:#fff;box-shadow:0 8px 22px -8px rgba(236,95,134,.75)}
    .shot__tag--after::before{background:#fff}

    .ba__mid{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;width:34px;height:34px;border-radius:50%;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 26px -8px rgba(236,95,134,.8),0 0 0 4px rgba(255,255,255,.55)}

    .ba__quote{position:relative;margin:0;padding:20px 22px 20px 46px;background:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.5);border-radius:16px}
    .ba__mark{position:absolute;left:16px;top:8px;font-family:var(--serif);font-size:44px;line-height:1;color:var(--rose);opacity:.55}
    .ba__quote p{font-family:var(--serif);font-size:17px;line-height:1.55;color:var(--ink);margin:0 0 8px}
    .ba__quote cite{font-style:normal;font-weight:700;font-size:13px;color:var(--rose)}

    .ba__foot{display:flex;align-items:center;justify-content:space-between;gap:14px}
    .ba__count{font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);white-space:nowrap}
    .ba__count b{color:var(--rose);font-weight:700}
    .ba__dots{display:flex;gap:8px}
    .ba__dots button{width:8px;height:8px;border-radius:50%;border:none;background:rgba(34,25,38,.2);cursor:pointer;padding:0;transition:all .35s var(--ease)}
    .ba__dots button.on{background:var(--grad);width:28px;border-radius:100px}
    .ba__swipe{font-family:var(--serif);font-style:italic;font-size:13px;color:var(--ink3);white-space:nowrap}
    .res__quote{padding:4px 6px 8px}
    .res__name{font-weight:700;color:var(--rose);font-size:14px}
    .res__card--cta{background:rgba(255,255,255,.42);justify-content:center;align-items:flex-start;gap:14px;padding:38px 32px}
    .res__card--cta h3{font-family:var(--serif);font-weight:400;font-size:clamp(24px,2.6vw,32px);line-height:1.15;margin:0}
    .res__card--cta p{color:var(--ink2);margin:0 0 8px}

    /* FAQ */
    .faqs{background:transparent;padding:clamp(64px,9vw,120px) 0}
    .faqs__grid{display:grid;grid-template-columns:.7fr 1.3fr;gap:56px;align-items:start}
    .faq__item{border-top:1px solid var(--line)}
    .faq__item:last-child{border-bottom:1px solid var(--line)}
    .faq__q{width:100%;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 6px;font-family:var(--serif);font-size:clamp(19px,2vw,24px);color:var(--ink);text-align:left;transition:padding-left .3s var(--ease)}
    .faq__q:hover{padding-left:14px}
    .faq__q svg{color:var(--rose);flex:none;transition:transform .3s var(--ease)}
    .faq__item.open .faq__q svg{transform:rotate(180deg)}
    .faq__a{overflow:hidden;transition:max-height .45s var(--ease)}
    .faq__a p{color:var(--ink2);max-width:640px;padding:0 6px 24px;margin:0}

    /* CONTACTO */
    .contacto{padding:clamp(72px,10vw,140px) 0}
    .contacto__grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
    .contacto__lead{color:rgba(245,239,228,.78);max-width:440px}
    .contacto__direct{display:flex;flex-direction:column;gap:14px;margin-top:30px}
    .contacto__direct a,.contacto__direct span{display:flex;align-items:center;gap:12px;color:rgba(245,239,228,.92);font-weight:500;transition:transform .3s var(--ease),color .25s}
    .contacto__direct a:hover{color:var(--sand);transform:translateX(4px)}
    .contacto__cta-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:24px;padding:40px;display:flex;flex-direction:column;gap:14px;align-items:flex-start;backdrop-filter:blur(12px);box-shadow:0 40px 90px -45px rgba(0,0,0,.6)}
    .contacto__cta-card h3{font-family:var(--serif);font-weight:400;font-size:28px;margin:0}
    .contacto__cta-card p{color:rgba(245,239,228,.72);margin:0 0 6px}

    /* WHATSAPP FLOTANTE */
    .floatwa{position:fixed;right:20px;bottom:20px;z-index:60;width:58px;height:58px;border-radius:50%;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 16px 40px -12px rgba(236,95,134,.7);transition:transform .3s var(--ease)}
    .floatwa::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid rgba(236,95,134,.5);animation:pulse 2.2s ease-out infinite}
    .floatwa:hover{transform:scale(1.08) translateY(-2px)}
    @keyframes pulse{0%{transform:scale(.85);opacity:.9}70%{transform:scale(1.25);opacity:0}100%{opacity:0}}

    /* FOOTER */
    .footer{position:relative;background:transparent;border-top:1px solid var(--line);overflow:hidden}
    .footer__cta{display:flex;align-items:center;justify-content:space-between;gap:30px;flex-wrap:wrap;padding:60px 28px 52px;border-bottom:1px solid var(--line)}
    .footer__ctah{margin:0}
    .footer__cta .eyebrow{margin-bottom:12px}
    .footer__cols{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:40px;padding:52px 28px 26px}
    .footer__col{display:flex;flex-direction:column;gap:12px}
    .footer__col h4{font-family:var(--sans);font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);margin:0 0 4px}
    .footer__col a{color:var(--ink2);font-weight:500;transition:color .25s,transform .25s var(--ease);width:fit-content}
    .footer__col a:hover{color:var(--rose);transform:translateX(3px)}
    .footer__col span{color:var(--ink2)}
    .footer__col--brand{gap:8px;max-width:360px}
    .footer__col--brand .brand__name{font-family:var(--sans);font-weight:800;letter-spacing:.18em;font-size:18px;color:var(--ink)}
    .footer__tag{font-family:var(--serif);font-style:italic;color:var(--rose);font-size:15px}
    .footer__desc{color:var(--ink2);font-size:14px;line-height:1.65;margin:6px 0 12px;max-width:320px}
    .footer__social{display:flex;gap:12px;margin-top:2px}
    .footer__social a{width:44px;height:44px;border:1px solid var(--line);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--ink);transition:all .3s var(--ease)}
    .footer__social a:hover{background:var(--grad);color:#fff;border-color:transparent;transform:translateY(-3px);box-shadow:0 14px 30px -14px rgba(236,95,134,.6)}
    .footer__legal{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:22px;padding:22px 28px 30px;border-top:1px solid var(--line);font-size:13px;color:var(--ink3)}
    @media(max-width:860px){
      .footer__cols{grid-template-columns:1fr 1fr;gap:32px 24px}
      .footer__col--brand{grid-column:1 / -1}
      .footer__cta{flex-direction:column;align-items:flex-start;gap:22px}
    }
    @media(max-width:560px){
      .footer__cols{grid-template-columns:1fr}
      .footer__cta .btn{width:100%;justify-content:center}
      .footer__legal{flex-direction:column;gap:8px}
    }

    /* RESPONSIVE */
    @media(max-width:980px){
      .sobre__grid,.servicios__grid,.contacto__grid,.faqs__grid,.quiz__grid{grid-template-columns:1fr;gap:40px}
      .stats__grid{grid-template-columns:1fr 1fr;gap:26px}
      .stat:nth-child(3){border-left:none;padding-left:0}
    }
    @media(max-width:860px){
      .pasos__grid{grid-template-columns:1fr 1fr}
      .res__grid{grid-template-columns:1fr}
      .nav__links,.nav__cta{display:none}
      .nav__burger{display:inline-flex}
      .mobilemenu{display:block;overflow:hidden;max-height:0;transition:max-height .4s var(--ease);background:rgba(236,228,214,.98);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
      .mobilemenu.open{max-height:440px}
      .mstep{grid-template-columns:64px 1fr;gap:16px}
    }
    @media(max-width:560px){
      .wrap{padding:0 20px}
      .pasos__grid{grid-template-columns:1fr}
      .ba__slide{gap:8px}
      .ba__side{width:38px;height:38px}
      .ba__side--l{left:6px}
      .ba__side--r{right:6px}
      .ba__swipe{display:none}
      .shot img{aspect-ratio:9 / 14}
      .shot__tag{font-size:9px;letter-spacing:.06em;padding:6px 9px;top:8px;left:8px}
      .ba__mid{width:28px;height:28px}
      .ba__quote{padding:16px 16px 16px 40px}
      .ba__quote p{font-size:15px}
      .res__card{padding:16px}
      .stats__grid{grid-template-columns:1fr 1fr;gap:16px;padding:30px 20px}
      .stat{border-left:none;padding-left:0}
      .otros__grid{grid-template-columns:1fr}
      .hero__content{padding-top:88px;padding-bottom:60px}
      .hero__cta .btn{width:100%;justify-content:center}
      .prog{padding:30px 22px}
      .quizcard{padding:24px 20px}
      .res__ba .slot{min-height:170px}
      .contacto__cta-card{padding:28px 22px;width:100%}
      .contacto__cta-card .btn{width:100%;justify-content:center}
      .footer__grid{flex-direction:column;align-items:flex-start}
      .footer__legal{flex-direction:column;gap:8px}
      .floatwa{width:54px;height:54px;right:16px;bottom:16px}
    }
    @media(max-width:380px){
      .hero__title{font-size:clamp(52px,17vw,64px)}
      .brand__name{font-size:15px}
      .opt{padding:12px 16px;font-size:14px}
    }
    `}</style>
  );
}
