/* El día, de un vistazo. Un anillo que se llena: dice cuánto
   llevás sin que haya que leer nada. */

export default function Anillo({ hechos, total, size = 62 }) {
  const r = (size - 7) / 2
  const largo = 2 * Math.PI * r
  const parte = total ? hechos / total : 0

  return (
    <div className="anillo" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id="gradAnillo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f1b8ce" />
            <stop offset="50%" stopColor="#e5417a" />
            <stop offset="100%" stopColor="#f08a4b" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(247,241,230,.13)" strokeWidth="5"
        />
        <circle
          className="anillo-arco"
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="url(#gradAnillo)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={largo}
          strokeDashoffset={largo * (1 - parte)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="anillo-txt">
        <b>{hechos}</b>
        <i>/{total}</i>
      </span>
    </div>
  )
}
