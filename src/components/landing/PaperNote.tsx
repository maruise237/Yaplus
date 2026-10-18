// La feuille qu'on remplace : une page de cahier Seyès griffonnée, des lignes barrées,
// un produit entouré. Les gribouillis sont générés (graine fixe) pour rester identiques
// au serveur et au navigateur.

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

// Une ligne d'écriture cursive illisible : des jambages, des boucles montantes et
// descendantes, coupés en « mots » de longueur variable.
function scribble(x0: number, y: number, length: number, seed: number) {
  const r = rng(seed);
  const f = (n: number) => n.toFixed(1);
  let x = x0;
  let d = `M${x0} ${y}`;
  let letters = 2 + Math.floor(r() * 5);
  while (x < x0 + length) {
    const w = 4 + r() * 3;
    const k = r();
    if (k < 0.16) {
      const a = 11 + r() * 5; // boucle montante (l, b, d)
      d += ` c${f(w * 0.8)} ${f(-a * 0.5)} ${f(w * 0.9)} ${f(-a)} ${f(w * 0.45)} ${f(-a)} c${f(-w * 0.4)} 0 ${f(-w * 0.3)} ${f(a * 0.7)} ${f(w * 0.55)} ${f(a)}`;
    } else if (k < 0.26) {
      const g = 7 + r() * 3; // boucle descendante (g, j)
      d += ` c${f(w * 0.8)} ${f(g * 0.6)} ${f(w * 0.7)} ${f(g)} ${f(w * 0.4)} ${f(g)} c${f(-w * 0.4)} 0 ${f(-w * 0.2)} ${f(-g * 0.8)} ${f(w * 0.6)} ${f(-g)}`;
    } else if (k < 0.42) {
      const e = 4 + r() * 2; // petite boucle (e)
      d += ` c${f(w * 0.7)} ${f(-e * 0.4)} ${f(w * 0.8)} ${f(-e)} ${f(w * 0.4)} ${f(-e)} c${f(-w * 0.4)} 0 ${f(-w * 0.2)} ${f(e)} ${f(w * 0.6)} ${f(e)}`;
    } else {
      const h = 4.5 + r() * 2.5; // jambage (n, m, u)
      d += ` c${f(w * 0.05)} ${f(-h)} ${f(w * 0.95)} ${f(-h)} ${f(w)} 0`;
    }
    x += w;
    if (--letters === 0) {
      x += 6 + r() * 5;
      d += ` M${f(x)} ${f(y + (r() - 0.5) * 1.5)}`;
      letters = 2 + Math.floor(r() * 5);
    }
  }
  return d;
}

const LINES = [
  { len: 118, crossed: false },
  { len: 150, crossed: true },
  { len: 86, crossed: false, circled: true },
  { len: 162, crossed: false },
  { len: 104, crossed: true },
  { len: 138, crossed: false },
  { len: 70, crossed: false },
  { len: 126, crossed: true },
];

export function PaperNote({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 340" className={className} role="img" aria-label="Une feuille de cahier griffonnée, difficile à lire">
      <defs>
        <pattern id="seyes-paper" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 0.5H24M0 6.5H24M0 12.5H24M0 18.5H24" className="stroke-[#7aa7d8]" strokeWidth="0.5" opacity="0.3" />
          <path d="M0 0.5H24" className="stroke-[#7aa7d8]" strokeWidth="0.8" opacity="0.6" />
          <path d="M0.5 0V24" className="stroke-[#7aa7d8]" strokeWidth="0.5" opacity="0.3" />
        </pattern>
      </defs>
      {/* Feuille au bas déchiré */}
      <path
        d="M8 6H272V318l-9 6-8-5-10 7-9-6-8 6-11-6-8 5-10-6-9 7-8-6-10 5-9-6-9 7-8-6-10 6-9-5-9 6-10-7-8 6-9-6-10 6-9-5-8 6-9-7-8 5-11-6-9 7-9-5Z"
        className="fill-[#fffdf8] dark:fill-[#2e2d2a]"
      />
      <path
        d="M8 6H272V318l-9 6-8-5-10 7-9-6-8 6-11-6-8 5-10-6-9 7-8-6-10 5-9-6-9 7-8-6-10 6-9-5-9 6-10-7-8 6-9-6-10 6-9-5-8 6-9-7-8 5-11-6-9 7-9-5Z"
        fill="url(#seyes-paper)"
      />
      <path d="M52 6V322" className="stroke-flag" strokeWidth="1" opacity="0.5" />
      {/* Écriture au stylo bleu */}
      <g className="stroke-[#2c3d78] dark:stroke-[#9db4f0]" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
        <path d={scribble(64, 34, 92, 7)} strokeWidth="1.6" transform="translate(64 34) skewX(-14) translate(-64 -34)" />
        {LINES.map((l, i) => {
          const y = 70 + i * 30;
          return (
            <g key={i}>
              <path d={`M28 ${y - 3}l4 0`} strokeWidth="1.6" />
              <path d={scribble(64, y, l.len, 31 + i * 17)} transform={`rotate(${((i % 3) - 1) * 0.6} 64 ${y}) translate(64 ${y}) skewX(-14) translate(-64 ${-y})`} />
              {l.crossed && <path d={`M60 ${y - 4}q${l.len / 2} -3 ${l.len + 8} 1`} strokeWidth="1.5" />}
              {l.circled && <ellipse cx={64 + l.len / 2} cy={y - 3} rx={l.len / 2 + 10} ry="11" transform={`rotate(-3 ${64 + l.len / 2} ${y - 3})`} />}
            </g>
          );
        })}
        <path d={scribble(150, 312, 70, 99)} opacity="0.6" />
      </g>
    </svg>
  );
}
