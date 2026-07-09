import { useState, useEffect, useRef } from "react";
import {
  Camera, Instagram, Youtube, Mail, ArrowRight, ArrowLeft, Menu, X,
  Plus, Minus, MapPin, MessageCircle, Play, Check,
} from "lucide-react";

/* ============================================================================
   ANTO LEONI · FEEL&MOVE
   - Copy en español peninsular (público de Anto)
   - <PhotoSlot/> = huecos señalizados (1 hueco = 1 foto/vídeo a subir)
   - Para VÍDEO de fondo: meté el archivo en /public y descomentá el <video/> del hero
   ========================================================================== */

const WHATSAPP = "34610939223";
const EMAIL = "alslife24@gmail.com";
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
      <div className="marquee__track">
        {items.map((w, i) => <span key={i}>{w}</span>)}
      </div>
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
    if (ans.modalidad) L.push(`• Modalidad: ${ans.modalidad}`);
    L.push(`• Nombre: ${form.nombre}`);
    L.push(`• Contacto: ${form.contacto}`);
    return L.join("\n");
  };

  const submit = () => { window.open(waLink(buildMsg()), "_blank"); setDone(true); };

  return (
    <div className="quizcard">
      <div className="quiz__top">
        <span className="quiz__step">PASO <b>{Math.min(step + 1, TOTAL)}</b>/{TOTAL}</span>
        <div className="quiz__bar"><div className="quiz__fill" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} /></div>
      </div>

      <div className="quiz__body" key={done ? "done" : step}>
        {done ? (
          <div className="quiz__done stepin">
            <span className="quiz__doneicon"><Check size={26} /></span>
            <h3>¡Listo!</h3>
            <p>Te abrí WhatsApp con tus respuestas ya escritas. Solo pulsa enviar y Anto te responde en persona.</p>
            <button className="btn btn--cream" onClick={() => { setDone(false); setStep(0); setAns({}); setForm({ nombre: "", contacto: "" }); }}>
              Empezar de nuevo
            </button>
          </div>
        ) : isForm ? (
          <div className="stepin">
            <h3 className="quiz__q">Último paso: ¿a dónde te envío tu plan?</h3>
            <p className="quiz__help">Con tus respuestas, Anto prepara una propuesta personalizada.</p>
            <label className="quiz__field">
              <span>Tu nombre</span>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" />
            </label>
            <label className="quiz__field">
              <span>Email o teléfono</span>
              <input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="Para poder responderte" />
            </label>
          </div>
        ) : (
          <div className="stepin">
            <h3 className="quiz__q">{s.q}</h3>
            {s.help && <p className="quiz__help">{s.help}</p>}
            <div className="opts">
              {s.options.map((op) => {
                const sel = s.type === "multi" ? (ans[s.id] || []).includes(op) : ans[s.id] === op;
                return (
                  <button key={op} className={`opt ${sel ? "sel" : ""}`} onClick={() => pick(s.id, op, s.type === "multi")}>
                    {s.type === "multi" && <span className="opt__check">{sel && <Check size={12} strokeWidth={3} />}</span>}
                    {op}
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
          ) : <span />}
          {isForm ? (
            <button className="btn btn--wine" disabled={!canNext} onClick={submit}>
              <MessageCircle size={18} /> Recibir mi plan
            </button>
          ) : s.type === "multi" ? (
            <button className="btn btn--wine" disabled={!canNext} onClick={() => setStep((x) => x + 1)}>
              Siguiente <ArrowRight size={18} />
            </button>
          ) : <span className="quiz__hint">Toca una opción</span>}
        </div>
      )}
    </div>
  );
}

/* -------------------- FAQ -------------------- */
const FAQS = [
  { q: "¿Prometes resultados rápidos?", a: "No. No creo en las dietas milagro ni en los cambios imposibles en pocas semanas. Prometo que, si trabajamos con compromiso, constancia y confianza, conseguiremos una transformación real y sostenible." },
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
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef(null);
  useEffect(() => {
    const vids = heroRef.current ? heroRef.current.querySelectorAll("video") : [];
    vids.forEach((v) => { v.muted = true; const p = v.play(); if (p) p.catch(() => {}); });
  }, []);
  useEffect(() => {
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % 3), 5000);
    return () => clearInterval(id);
  }, []);
  const progress = useScrollProgress();
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
        <div className="hero__media" ref={heroRef}>
          <div className="hero__track" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
            <div className="hero__slide"><video src="/video1.mp4" autoPlay muted loop playsInline preload="auto" /></div>
            <div className="hero__slide"><video src="/video2.mp4" autoPlay muted loop playsInline preload="auto" /></div>
            <div className="hero__slide"><video src="/video3.mp4" autoPlay muted loop playsInline preload="auto" /></div>
          </div>
          <div className="hero__scrim" />
          <div className="hero__dots">
            {[0, 1, 2].map((i) => (
              <button key={i} className={i === heroIndex ? "on" : ""} onClick={() => setHeroIndex(i)} aria-label={`Ver vídeo ${i + 1}`} />
            ))}
          </div>
        </div>
        <div className="wrap hero__content">
          <p className="eyebrow eyebrow--light hero__eyebrow">Nutricionista · Naturópata · Fitoterapeuta · Entrenadora</p>
          <h1 className="hero__title">
            <span className="line-wrap"><span className="line">Vuelve</span></span>
            <span className="line-wrap"><span className="line"><em>a ti.</em></span></span>
          </h1>
          <p className="hero__lead">
            No se trata solo de moverte. Se trata de <em>sentir</em> para poder transformarte.
            Un método que une cuerpo, mente y emociones para que el cambio sea real y dure toda la vida.
          </p>
          <div className="hero__cta">
            <a className="btn btn--wine btn--lg" href="#test" onClick={scrollTo("test")}>Descubre tu punto de partida <ArrowRight size={18} /></a>
            <a className="btn btn--glass btn--lg" href="#metodo" onClick={scrollTo("metodo")}>Conoce el método</a>
          </div>
        </div>
        <div className="hero__cue"><span /></div>
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
              Responde 4 preguntas rápidas. Al terminar te preparo una propuesta pensada
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

      {/* TRÍPTICO */}
      <section className="tri">
        <div className="wrap tri__grid">
          {[["Muévete", "Entrena desde el conocimiento, no desde la obligación."],
            ["Aliméntate", "Aprende a nutrir tu cuerpo sin restricciones extremas."],
            ["Vuelve a ti", "Recupera la confianza, la energía y el equilibrio."]].map(([t, d], i) => (
            <Reveal key={i} delay={i * 110} className="tri__card">
              <span className="tri__idx">/ 0{i + 1}</span>
              <h3>{t}</h3><p>{d}</p>
            </Reveal>
          ))}
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

      {/* SERVICIOS */}
      <section className="servicios" id="servicios">
        <div className="wrap servicios__grid">
          <Reveal className="prog">
            <p className="eyebrow">Programa destacado</p>
            <h2 className="h2">Programa Online Feel&Move</h2>
            <p className="prog__lead">El acompañamiento completo, estés donde estés. Un proceso pensado para que aprendas a cuidarte de verdad, no para depender de un plan.</p>
            <ul className="prog__list">
              {["Nutrición personalizada", "Entrenamiento adaptado a ti", "Seguimiento continuo", "Clase privada semanal por Zoom", "Educación en hábitos", "Asesoramiento en suplementación"].map((x) => <li key={x}><span className="dot" />{x}</li>)}
            </ul>
            <a className="btn btn--wine" href="#test" onClick={scrollTo("test")}>Quiero información <ArrowRight size={18} /></a>
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
            <p className="res__sub">Aquí irán transformaciones reales y testimonios. Contenido por completar.</p>
          </Reveal>
          <div className="res__grid">
            {[1, 2].map((i) => (
              <Reveal key={i} delay={i * 100} className="res__card">
                <div className="res__ba"><PhotoSlot label={`Antes — caso ${i}`} /><PhotoSlot label={`Después — caso ${i}`} /></div>
                <div className="res__quote">
                  <p className="placeholder-text">[ Testimonio {i} — texto por añadir, en español o inglés ]</p>
                  <span className="res__name">— Nombre del cliente</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FILOSOFÍA */}
      <section className="filo">
        <div className="wrap filo__grid">
          <Reveal className="filo__col filo__col--no">
            <p className="eyebrow eyebrow--light">Filosofía</p>
            <h3>Lo que <em>no</em> hago</h3>
            <ul>{["Soluciones rápidas", "Dietas milagro", "Comparar tu camino con el de los demás", "Trabajar desde la culpa o el miedo", "Vender cambios irreales"].map((x) => <li key={x}>{x}</li>)}</ul>
          </Reveal>
          <Reveal delay={120} className="filo__col filo__col--si">
            <h3>Lo que <em>sí</em> hago</h3>
            <ul>{["Creer en los hábitos", "Disciplina con equilibrio", "Escuchar el cuerpo", "Aprendizaje continuo", "Movimiento con intención", "Un proceso distinto para cada persona"].map((x) => <li key={x}>{x}</li>)}</ul>
          </Reveal>
        </div>
      </section>

      {/* APRENDE CONMIGO */}
      <section className="aprende">
        <div className="wrap">
          <Reveal className="aprende__head">
            <p className="eyebrow">Aprende conmigo</p>
            <h2 className="h2">Antes de empezar un programa, quiero que me conozcas.</h2>
            <p className="aprende__sub">En mi canal comparto nutrición, entrenamientos, hábitos, reflexiones y mi día a día.</p>
          </Reveal>
          <div className="aprende__grid">
            {[1, 2, 3].map((i) => (
              <Reveal key={i} delay={i * 90} className="vid">
                <PhotoSlot label={`Miniatura de vídeo ${i}`} hint="Horizontal 16:9" />
                <span className="vid__play"><Play size={20} fill="currentColor" /></span>
              </Reveal>
            ))}
          </div>
          {/* TODO: reemplazar # por el enlace real del canal de YouTube */}
          <div className="aprende__cta"><a className="btn btn--ghost-ink" href="#" target="_blank" rel="noreferrer"><Youtube size={18} /> Ver vídeos en YouTube</a></div>
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

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap footer__grid">
          <div className="footer__brand"><span className="brand__name">ANTO LEONI</span><span className="footer__tag">Movimiento · Hábitos · Bienestar</span></div>
          <div className="footer__social">
            {/* TODO: enlaces reales */}
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" aria-label="TikTok"><TikTok size={20} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={20} /></a>
            <a href={waLink("Hola Anto :)")} aria-label="WhatsApp"><MessageCircle size={20} /></a>
          </div>
        </div>
        <div className="wrap footer__legal">
          <span>© {new Date().getFullYear()} Anto Leoni · Feel&Move Method</span>
          <span>Sentir · Moverte · Nutrirte · Construir hábitos · Evolucionar</span>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================================ */
function Styles() {
  return (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Manrope:wght@400;500;600;700&display=swap');
    :root{
      --paper:#ECE4D6; --paper2:#E4DAC8; --cream:#F5EFE4;
      --ink:#221926; --ink2:#5a4f5c; --ink3:#8a7f8c;
      --rose:#EC5F86; --violet:#7C5CE6; --coral:#F2926B;
      --sand:#F1B8CE;            /* blush claro para bandas violeta */
      --line:rgba(34,25,38,.13);
      --grad:linear-gradient(120deg,#7C5CE6,#C651A8,#EC5F86,#F2926B);
      --band:linear-gradient(125deg,#221049,#4a1685,#9a2586,#5a1a86,#221049);
      --serif:'Fraunces',Georgia,serif; --sans:'Manrope',system-ui,sans-serif;
    }
    *{box-sizing:border-box}
    html,body,#root{margin:0;padding:0;background:var(--paper)}
    .page{background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:17px;line-height:1.65;-webkit-font-smoothing:antialiased;overflow-x:hidden}
    .page p{margin:0 0 1em}
    .wrap{width:100%;max-width:1180px;margin:0 auto;padding:0 28px;position:relative;z-index:2}
    a{color:inherit;text-decoration:none}
    em{font-style:italic}
    :focus-visible{outline:2.5px solid var(--rose);outline-offset:3px;border-radius:2px}

    .scrollbar{position:fixed;top:0;left:0;height:3px;background:var(--grad);background-size:200% auto;z-index:100;width:0;animation:shimmer 5s linear infinite}

    /* FONDO ANIMADO GLOBAL — cintas de seda que fluyen */
    .bgfx{position:fixed;inset:-15%;z-index:0;pointer-events:none;overflow:hidden;transition:filter .25s linear}
    .silk{position:absolute;filter:blur(55px);opacity:.6;mix-blend-mode:multiply;border-radius:50%;will-change:transform}
    .s1{width:85vw;height:32vw;left:-28vw;bottom:-8vw;background:linear-gradient(112deg,transparent 8%,#7C5CE6 38%,#5b8bff 58%,transparent 88%);animation:silk1 24s ease-in-out infinite alternate}
    .s2{width:82vw;height:30vw;right:-28vw;top:6vh;background:linear-gradient(112deg,transparent 8%,#C651A8 40%,#7C5CE6 60%,transparent 90%);animation:silk2 30s ease-in-out infinite alternate}
    .s3{width:72vw;height:26vw;left:2vw;top:42vh;background:linear-gradient(100deg,transparent 10%,#EC5F86 42%,#F2926B 60%,transparent 90%);animation:silk3 27s ease-in-out infinite alternate}
    @keyframes silk1{from{transform:rotate(-18deg) translate(0,0)}to{transform:rotate(-7deg) translate(7vw,-4vh)}}
    @keyframes silk2{from{transform:rotate(20deg) translate(0,0)}to{transform:rotate(9deg) translate(-7vw,5vh)}}
    @keyframes silk3{from{transform:rotate(-8deg) translate(0,0) scale(1)}to{transform:rotate(-1deg) translate(5vw,-3vh) scale(1.1)}}
    .page > *:not(.bgfx):not(.scrollbar){position:relative;z-index:1}

    @keyframes shimmer{to{background-position:200% center}}
    @keyframes wave{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

    /* gradiente animado en títulos, eyebrows y números */
    .h2,.h2 em,.hero__title em,.stat__big,.eyebrow,.grad-text{
      background:var(--grad);background-size:200% auto;
      -webkit-background-clip:text;background-clip:text;
      -webkit-text-fill-color:transparent;color:transparent;
      animation:shimmer 5s linear infinite}
    .h2 em,.hero__title em{font-style:italic}
    .stat__big{font-style:normal}

    .eyebrow{font-size:12px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;margin:0 0 18px}
    .eyebrow--light{color:var(--sand);-webkit-text-fill-color:var(--sand);background:none;animation:none}
    .h2{font-family:var(--serif);font-weight:400;font-size:clamp(30px,4.4vw,52px);line-height:1.08;letter-spacing:-.01em;margin:0 0 24px}
    .h2--light{color:var(--cream);-webkit-text-fill-color:var(--cream);background:none;animation:none}
    .h2--light em{-webkit-text-fill-color:initial;color:var(--sand);background:none;animation:none}

    /* REVEAL (más suave y con escala) */
    .reveal{opacity:0;transform:translateY(32px) scale(.985);transition:opacity .85s cubic-bezier(.16,.84,.32,1),transform .85s cubic-bezier(.16,.84,.32,1)}
    .reveal.in{opacity:1;transform:none}
    @media (prefers-reduced-motion:reduce){
      .reveal{opacity:1!important;transform:none!important;transition:none}
      .line,.hero__lead,.hero__cta,.hero__eyebrow,.marquee__track,.hero__media,.silk,.btn--wine,
      .manifesto,.metodo,.filo,.contacto,.quiz,.scrollbar,.h2,.eyebrow,.h2 em,.hero__title em,.stat__big{animation:none!important}
    }

    /* BOTONES */
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;font-family:var(--sans);font-weight:600;font-size:15px;letter-spacing:.01em;padding:14px 26px;border-radius:100px;cursor:pointer;border:1.5px solid transparent;transition:transform .25s ease,background-position .5s ease,color .25s ease,border-color .25s ease,box-shadow .3s ease}
    .btn--lg{padding:17px 30px;font-size:16px}
    .btn:hover{transform:translateY(-2px)}
    .btn svg{transition:transform .25s ease}
    .btn:hover svg:last-child{transform:translateX(3px)}
    .btn--sm{padding:10px 20px;font-size:14px}
    .btn--wine{background:var(--grad);background-size:200% auto;color:#fff;box-shadow:0 12px 34px -8px rgba(124,92,230,.65);animation:shimmer 4s linear infinite}
    .btn--wine:hover{box-shadow:0 20px 50px -10px rgba(236,95,134,.8)}
    .btn--glass{background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.4);color:var(--cream);backdrop-filter:blur(10px)}
    .btn--glass:hover{background:rgba(255,255,255,.22)}
    .btn--cream{background:var(--cream);color:var(--ink)}
    .btn--cream:hover{background:#fff;box-shadow:0 12px 30px -12px rgba(0,0,0,.35)}
    .btn--ghost-light{border-color:rgba(245,239,228,.5);color:var(--cream)}
    .btn--ghost-light:hover{background:rgba(245,239,228,.12)}
    .btn--ghost-ink{border-color:var(--ink);color:var(--ink)}
    .btn--ghost-ink:hover{background:var(--ink);color:var(--cream)}
    .btn--ghost-cream{border-color:rgba(245,239,228,.4);color:var(--cream)}
    .btn--ghost-cream:hover{background:rgba(245,239,228,.12)}
    .btn:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}

    /* SLOTS de foto/vídeo */
    .slot{position:relative;background:linear-gradient(135deg,rgba(124,92,230,.08),rgba(236,95,134,.08));border:1.5px dashed var(--rose);border-radius:14px;min-height:220px;display:flex;align-items:center;justify-content:center;color:var(--rose);text-align:center;padding:24px;overflow:hidden}
    .slot--tall{min-height:100%;height:100%}
    .slot img,.slot video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s ease}
    .slot:hover img,.slot:hover video{transform:scale(1.06)}
    .slot__inner{display:flex;flex-direction:column;align-items:center;gap:10px;max-width:260px}
    .slot__label{font-weight:600;font-size:14px;line-height:1.35}
    .slot__hint{font-size:12px;color:var(--ink3);font-weight:500}
    .placeholder-text{color:var(--ink3);font-style:italic}

    /* NAV */
    .nav{position:sticky;top:0;z-index:50;background:rgba(236,228,214,.82);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
    .nav__inner{display:flex;align-items:center;justify-content:space-between;height:72px;gap:20px}
    .brand{display:flex;flex-direction:column;line-height:1}
    .brand__name{font-family:var(--sans);font-weight:700;letter-spacing:.18em;font-size:16px}
    .brand__sub{font-family:var(--serif);font-style:italic;font-size:12px;color:var(--rose);margin-top:3px}
    .nav__links{display:flex;gap:30px;font-size:15px;font-weight:500}
    .nav__links a{color:var(--ink2);transition:color .2s;position:relative}
    .nav__links a::after{content:"";position:absolute;left:0;bottom:-4px;width:0;height:1.5px;background:var(--grad);transition:width .25s ease}
    .nav__links a:hover{color:var(--rose)} .nav__links a:hover::after{width:100%}
    .nav__burger{display:none;background:none;border:none;color:var(--ink);cursor:pointer;padding:8px;margin:-8px;align-items:center;justify-content:center}
    .mobilemenu{display:none}
    .mobilemenu a{display:block;padding:17px 28px;font-size:18px;font-weight:600;color:var(--ink);border-top:1px solid var(--line)}
    .mobilemenu a.btn{display:flex;justify-content:center;margin:16px 28px 22px;padding:16px 24px;border-top:none;color:#fff}

    /* HERO */
    .hero{position:relative;min-height:92vh;min-height:92dvh;display:flex;align-items:flex-end;color:var(--cream);overflow:hidden}
    .hero__media{position:absolute;inset:0;z-index:0;overflow:hidden;background:linear-gradient(160deg,#2a1440,#4a1c52 55%,#1a0f2e)}
    .hero__track{display:flex;width:100%;height:100%;transition:transform 1.1s cubic-bezier(.7,0,.2,1)}
    .hero__slide{position:relative;flex:0 0 100%;width:100%;height:100%}
    .hero__slide video{width:100%;height:100%;object-fit:cover;display:block}
    .hero__dots{position:absolute;right:22px;bottom:22px;display:flex;gap:8px;z-index:3}
    .hero__dots button{width:9px;height:9px;border-radius:50%;border:none;background:rgba(245,239,228,.45);cursor:pointer;padding:0;transition:all .3s}
    .hero__dots button.on{background:var(--cream);width:26px;border-radius:100px}
    .hero__video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .hero__slot{border-radius:0;border:none;min-height:100%;background:linear-gradient(160deg,#2a1440,#4a1c52 55%,#1a0f2e);color:rgba(245,239,228,.55)}
    .hero__slot .slot__label,.hero__slot .slot__hint{color:rgba(245,239,228,.6)}
    .hero__scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,12,28,.15) 0%,rgba(20,12,28,.4) 55%,rgba(20,12,28,.82) 100%)}
    @keyframes kenburns{from{transform:scale(1)}to{transform:scale(1.09)}}
    .hero__content{position:relative;z-index:2;padding-top:120px;padding-bottom:88px;max-width:900px}
    .hero__eyebrow{animation:fadein 1s ease .15s both}
    .hero__title{font-family:var(--serif);font-weight:300;font-size:clamp(60px,12vw,150px);line-height:.92;letter-spacing:-.03em;margin:0 0 26px}
    .line-wrap{display:block;overflow:hidden;padding-bottom:.06em}
    .line{display:block;animation:rise 1.05s cubic-bezier(.2,.7,.2,1) both}
    .line-wrap:nth-child(2) .line{animation-delay:.12s}
    @keyframes rise{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:none}}
    .hero__lead{font-size:clamp(17px,2vw,21px);max-width:560px;color:rgba(245,239,228,.9);animation:fadein 1s ease .45s both}
    .hero__lead em{color:var(--sand)}
    .hero__cta{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;animation:fadein 1s ease .6s both}
    @keyframes fadein{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    .hero__cue{position:absolute;bottom:26px;left:50%;transform:translateX(-50%);z-index:2}
    .hero__cue span{display:block;width:1px;height:44px;background:rgba(245,239,228,.5);animation:cue 2.4s ease-in-out infinite;transform-origin:top}
    @keyframes cue{0%,100%{transform:scaleY(.4);opacity:.4}50%{transform:scaleY(1);opacity:1}}

    /* STATS */
    .stats{background:transparent;border-bottom:1px solid var(--line)}
    .stats__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:44px 28px}
    .stat{display:flex;flex-direction:column;gap:4px;padding:0 4px;border-left:1px solid var(--line)}
    .stat:first-child{border-left:none;padding-left:0}
    .stat__big{font-family:var(--serif);font-size:clamp(26px,3.4vw,40px);line-height:1}
    .stat__small{font-size:13px;color:var(--ink2);letter-spacing:.02em}

    /* MARQUEE */
    .marquee{background:var(--grad);background-size:200% auto;animation:shimmer 8s linear infinite;color:var(--cream);padding:18px 0;overflow:hidden;white-space:nowrap}
    .marquee__track{display:inline-flex;animation:marq 24s linear infinite;will-change:transform}
    .marquee:hover .marquee__track{animation-play-state:paused}
    .marquee span{font-family:var(--serif);font-style:italic;font-size:clamp(22px,3.4vw,38px);padding:0 30px;opacity:.96}
    .marquee span::after{content:"·";margin-left:60px;opacity:.5}
    @keyframes marq{to{transform:translateX(-50%)}}

    /* BANDAS VIOLETA (ola animada) */
    .quiz,.manifesto,.metodo,.filo,.contacto{position:relative;color:var(--cream);background:var(--band);background-size:300% 300%;animation:wave 22s ease infinite;overflow:hidden}
    .quiz::before,.manifesto::before,.metodo::before,.filo::before,.contacto::before{content:"";position:absolute;top:-25%;right:-12%;width:65%;height:90%;background:radial-gradient(circle,rgba(236,95,134,.45),transparent 60%);filter:blur(50px);pointer-events:none;z-index:0;animation:fxb 24s ease-in-out infinite alternate}
    .manifesto{animation-duration:26s} .filo{animation-duration:24s} .contacto{animation-duration:20s}

    /* QUIZ */
    .quiz{padding:clamp(64px,9vw,120px) 0}
    .quiz__grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:56px;align-items:center}
    .quiz__lead{color:rgba(245,239,228,.75);max-width:380px}
    .quizcard{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:22px;padding:clamp(24px,4vw,40px);box-shadow:0 40px 90px -40px rgba(0,0,0,.6);backdrop-filter:blur(10px)}
    .quiz__top{display:flex;align-items:center;gap:14px;margin-bottom:26px}
    .quiz__step{font-size:12px;font-weight:700;letter-spacing:.14em;color:var(--sand);white-space:nowrap}
    .quiz__step b{color:var(--cream)}
    .quiz__bar{flex:1;height:4px;border-radius:100px;background:rgba(245,239,228,.16);overflow:hidden}
    .quiz__fill{height:100%;background:var(--grad);background-size:200% auto;border-radius:100px;transition:width .5s cubic-bezier(.2,.7,.2,1);animation:shimmer 4s linear infinite}
    .quiz__body{min-height:238px}
    .stepin{animation:stepin .45s cubic-bezier(.2,.7,.2,1)}
    @keyframes stepin{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    .quiz__q{font-family:var(--serif);font-weight:400;font-size:clamp(22px,3vw,31px);line-height:1.15;margin:0 0 6px;color:var(--cream)}
    .quiz__help{font-size:14px;color:rgba(245,239,228,.62);margin:0 0 22px}
    .opts{display:flex;flex-wrap:wrap;gap:12px}
    .opt{display:inline-flex;align-items:center;gap:9px;padding:14px 20px;border-radius:100px;border:1.5px solid rgba(245,239,228,.3);background:transparent;color:var(--cream);font-family:var(--sans);font-size:15px;font-weight:500;cursor:pointer;transition:all .2s}
    .opt:hover{border-color:var(--sand);transform:translateY(-1px)}
    .opt.sel{background:var(--rose);border-color:var(--rose)}
    .opt__check{width:18px;height:18px;border-radius:50%;border:1.5px solid rgba(245,239,228,.45);display:flex;align-items:center;justify-content:center;flex:none}
    .opt.sel .opt__check{background:var(--cream);border-color:var(--cream);color:var(--rose)}
    .quiz__foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:28px}
    .quiz__back{background:none;border:none;color:rgba(245,239,228,.72);cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-family:var(--sans);font-weight:600;font-size:15px;padding:8px 4px}
    .quiz__back:hover{color:var(--cream)}
    .quiz__hint{font-size:13px;color:rgba(245,239,228,.5);font-style:italic}
    .quiz__field{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
    .quiz__field span{font-size:13px;font-weight:600;letter-spacing:.04em;color:var(--sand)}
    .quiz__field input{background:rgba(245,239,228,.08);border:1px solid rgba(245,239,228,.25);border-radius:12px;padding:14px 16px;color:var(--cream);font-family:var(--sans);font-size:16px}
    .quiz__field input::placeholder{color:rgba(245,239,228,.45)}
    .quiz__field input:focus{outline:none;border-color:var(--sand);background:rgba(245,239,228,.12)}
    .quiz__done{text-align:center;padding:18px 0}
    .quiz__doneicon{display:inline-flex;width:56px;height:56px;border-radius:50%;background:var(--coral);color:#fff;align-items:center;justify-content:center;margin-bottom:6px}
    .quiz__done h3{font-family:var(--serif);font-weight:400;font-size:28px;margin:8px 0}
    .quiz__done p{color:rgba(245,239,228,.75);max-width:360px;margin:0 auto 20px}

    /* MANIFESTO */
    .manifesto{padding:clamp(80px,12vw,150px) 0}
    .manifesto__q{font-family:var(--serif);font-weight:300;font-size:clamp(28px,4.6vw,54px);line-height:1.14;letter-spacing:-.01em;max-width:960px;margin:0 0 30px}
    .manifesto__q em{color:var(--sand)}
    .manifesto__sig{font-size:clamp(16px,1.8vw,20px);color:rgba(245,239,228,.75);max-width:640px}

    /* TRÍPTICO */
    .tri{padding:clamp(64px,9vw,110px) 0}
    .tri__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--line);border-radius:16px;overflow:hidden;border:1px solid var(--line)}
    .tri__card{background:rgba(255,255,255,.5);backdrop-filter:blur(8px);padding:44px 34px;min-height:230px;transition:background .3s,transform .3s}
    .tri__card:hover{background:rgba(255,255,255,.72);transform:translateY(-3px)}
    .tri__idx{font-family:var(--sans);font-size:12px;font-weight:600;letter-spacing:.14em;color:var(--violet)}
    .tri__card h3{font-family:var(--serif);font-weight:400;font-size:30px;margin:16px 0 12px}
    .tri__card p{color:var(--ink2);margin:0}

    /* SOBRE */
    .sobre{padding:clamp(64px,9vw,120px) 0}
    .sobre__grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:60px;align-items:start}
    .sobre__media{min-height:auto}
    .sobre__collage{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .sobre__collage img{width:100%;height:100%;object-fit:cover;border-radius:14px;display:block;box-shadow:0 24px 55px -28px rgba(30,10,40,.5)}
    .sobre__collage .c1{grid-column:1;grid-row:1 / 3}
    .sobre__collage .c2{grid-column:2;grid-row:1;aspect-ratio:1 / 1}
    .sobre__collage .c3{grid-column:2;grid-row:2;aspect-ratio:1 / 1}
    .sobre__text p{color:var(--ink2);max-width:560px}
    .chips{display:flex;flex-wrap:wrap;gap:9px;margin-top:24px}
    .chip{font-size:13px;font-weight:500;padding:7px 15px;border:1px solid rgba(255,255,255,.5);border-radius:100px;background:rgba(255,255,255,.5)}

    /* MÉTODO */
    .metodo{padding:clamp(72px,11vw,140px) 0}
    .metodo__head{max-width:760px;margin-bottom:56px}
    .metodo__list{display:flex;flex-direction:column}
    .mstep{display:grid;grid-template-columns:120px 1fr;gap:28px;align-items:baseline;padding:34px 0;border-top:1px solid rgba(245,239,228,.16);transition:padding-left .35s ease}
    .mstep:last-child{border-bottom:1px solid rgba(245,239,228,.16)}
    .mstep:hover{padding-left:14px}
    .mstep__n{font-family:var(--serif);font-size:clamp(34px,4vw,56px);color:var(--sand);line-height:1}
    .mstep__body h3{font-family:var(--serif);font-weight:400;font-size:clamp(24px,2.6vw,34px);margin:0 0 8px}
    .mstep__body p{color:rgba(245,239,228,.75);margin:0;max-width:560px}

    /* SERVICIOS */
    .servicios{padding:clamp(64px,9vw,120px) 0}
    .servicios__grid{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:start}
    .prog{background:rgba(255,255,255,.55);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.5);border-radius:20px;padding:44px}
    .prog__lead{color:var(--ink2);max-width:440px}
    .prog__list{list-style:none;padding:0;margin:0 0 30px}
    .prog__list li{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--line);font-weight:500}
    .prog__list li:last-child{border-bottom:none}
    .dot{width:7px;height:7px;border-radius:50%;background:var(--rose);flex:none}
    .otros__grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:6px}
    .otros__item{background:rgba(255,255,255,.45);backdrop-filter:blur(6px);border-radius:12px;padding:18px 16px;font-size:14px;font-weight:500;transition:background .25s,color .25s,transform .25s}
    .otros__item:hover{background:var(--grad);color:#fff;transform:translateY(-2px)}

    /* RESULTADOS */
    .resultados{background:transparent;padding:clamp(64px,9vw,120px) 0}
    .res__head{max-width:640px;margin-bottom:44px}
    .res__sub{color:var(--ink3);font-style:italic}
    .res__grid{display:grid;grid-template-columns:1fr 1fr;gap:32px}
    .res__card{background:rgba(255,255,255,.5);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.45);border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:18px}
    .res__ba{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .res__ba .slot{min-height:230px}
    .res__quote{padding:4px 6px 8px}
    .res__name{font-weight:600;color:var(--rose);font-size:14px}

    /* FILOSOFÍA */
    .filo{padding:clamp(64px,9vw,120px) 0}
    .filo__grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
    .filo__col h3{font-family:var(--serif);font-weight:400;font-size:clamp(26px,3vw,38px);margin:0 0 22px}
    .filo__col--no h3 em{color:var(--sand)} .filo__col--si h3 em{color:#f0c0d0}
    .filo__col ul{list-style:none;padding:0;margin:0}
    .filo__col li{padding:14px 0;border-top:1px solid rgba(245,239,228,.16);color:rgba(245,239,228,.88)}
    @media(min-width:861px){.filo__col--si{padding-top:44px}}
    .filo__col--si li{position:relative;padding-left:26px}
    .filo__col--si li::before{content:"";position:absolute;left:0;top:22px;width:12px;height:2px;background:var(--sand)}

    /* APRENDE */
    .aprende{padding:clamp(64px,9vw,120px) 0}
    .aprende__head{max-width:680px;margin-bottom:44px}
    .aprende__sub{color:var(--ink2)}
    .aprende__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
    .vid{position:relative}
    .vid .slot{min-height:200px}
    .vid__play{position:absolute;inset:0;margin:auto;width:56px;height:56px;border-radius:50%;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;pointer-events:none;transition:transform .3s}
    .vid:hover .vid__play{transform:scale(1.12)}
    .aprende__cta{margin-top:34px}

    /* FAQ */
    .faqs{background:transparent;padding:clamp(64px,9vw,120px) 0}
    .faqs__grid{display:grid;grid-template-columns:.7fr 1.3fr;gap:56px;align-items:start}
    .faq__item{border-top:1px solid var(--line)}
    .faq__item:last-child{border-bottom:1px solid var(--line)}
    .faq__q{width:100%;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 0;font-family:var(--serif);font-size:clamp(19px,2vw,24px);color:var(--ink);text-align:left}
    .faq__q svg{color:var(--rose);flex:none}
    .faq__a{overflow:hidden;transition:max-height .4s ease}
    .faq__a p{color:var(--ink2);max-width:640px;padding-bottom:24px;margin:0}

    /* CONTACTO */
    .contacto{padding:clamp(72px,10vw,140px) 0}
    .contacto__grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
    .contacto__lead{color:rgba(245,239,228,.78);max-width:440px}
    .contacto__direct{display:flex;flex-direction:column;gap:14px;margin-top:30px}
    .contacto__direct a,.contacto__direct span{display:flex;align-items:center;gap:12px;color:rgba(245,239,228,.92);font-weight:500}
    .contacto__direct a:hover{color:var(--sand)}
    .contacto__cta-card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:22px;padding:40px;display:flex;flex-direction:column;gap:14px;align-items:flex-start;backdrop-filter:blur(10px)}
    .contacto__cta-card h3{font-family:var(--serif);font-weight:400;font-size:28px;margin:0}
    .contacto__cta-card p{color:rgba(245,239,228,.72);margin:0 0 6px}

    /* FOOTER */
    .footer{background:transparent;padding:48px 0 34px;border-top:1px solid var(--line)}
    .footer__grid{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
    .footer__brand{display:flex;flex-direction:column;gap:6px}
    .footer__tag{font-family:var(--serif);font-style:italic;color:var(--rose);font-size:15px}
    .footer__social{display:flex;gap:16px}
    .footer__social a{width:44px;height:44px;border:1px solid var(--line);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--ink);transition:all .25s}
    .footer__social a:hover{background:var(--grad);color:#fff;border-color:transparent;transform:translateY(-2px)}
    .footer__legal{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:30px;padding-top:22px;border-top:1px solid var(--line);font-size:13px;color:var(--ink3)}

    /* RESPONSIVE */
    @media(max-width:980px){
      .sobre__grid,.servicios__grid,.contacto__grid,.filo__grid,.faqs__grid,.quiz__grid{grid-template-columns:1fr;gap:40px}
      .sobre__media{min-height:420px}
      .stats__grid{grid-template-columns:1fr 1fr;gap:26px}
      .stat:nth-child(3){border-left:none;padding-left:0}
    }
    @media(max-width:860px){
      .tri__grid,.aprende__grid{grid-template-columns:1fr}
      .res__grid{grid-template-columns:1fr}
      .nav__links,.nav__cta{display:none}
      .nav__burger{display:inline-flex}
      .mobilemenu{display:block;overflow:hidden;max-height:0;transition:max-height .4s cubic-bezier(.2,.7,.2,1);background:rgba(236,228,214,.98);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
      .mobilemenu.open{max-height:440px}
      .mstep{grid-template-columns:64px 1fr;gap:16px}
    }
    @media(max-width:560px){
      .wrap{padding:0 20px}
      .stats__grid{grid-template-columns:1fr;gap:18px;padding:34px 20px}
      .stat{border-left:none;padding-left:0}
      .otros__grid{grid-template-columns:1fr}
      .hero__content{padding-top:96px;padding-bottom:60px}
      .hero__cta .btn{width:100%;justify-content:center}
      .prog{padding:30px 22px}
      .quizcard{padding:24px 20px}
      .res__ba .slot{min-height:170px}
      .contacto__cta-card{padding:28px 22px;width:100%}
      .contacto__cta-card .btn{width:100%;justify-content:center}
      .footer__grid{flex-direction:column;align-items:flex-start}
      .footer__legal{flex-direction:column;gap:8px}
    }
    @media(max-width:380px){
      .hero__title{font-size:clamp(52px,17vw,64px)}
      .brand__name{font-size:15px}
      .opt{padding:12px 16px;font-size:14px}
    }
    `}</style>
  );
}
