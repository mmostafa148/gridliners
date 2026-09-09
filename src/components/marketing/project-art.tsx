import type { ArtSpec } from "@/lib/project-media";

/**
 * A project's design work, drawn.
 *
 * **The pooled photograph fallback was rejected and this replaces it.** Sourcing
 * unrelated CC0 photographs and calling them a gallery contradicted the whole
 * point of the revision: a design-award page shows the designed work, and the
 * work in these fixtures is fictional, so it has to be drawn. That is settled
 * for the five hand-curated projects; this does the same for the other 385.
 *
 * **Drawn at render time, not stored.** 385 projects x 6 artefacts is 2 310
 * images; as files that is hundreds of megabytes of repository for material
 * that is provisional by definition. These are inline SVG instead - no files, no
 * weight, and every project gets its own.
 *
 * **Seven category systems, deterministic variation.** Each parent category has
 * its own set of six artefacts, and every project derives its palette, its mark,
 * its type treatment and its content from a hash of its own slug. Two projects
 * in one category share a design language and nothing else, which is exactly the
 * relationship real work in one discipline has.
 *
 * Everything here is provisional and is recorded as such in the manifest. It
 * is replaced the day the entrant's own documentation arrives.
 */

const DISPLAY = "var(--font-display), 'Helvetica Neue', Helvetica, Arial, sans-serif";
const SANS = "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Eight palettes. Enough that a category does not read as one repeated brand. */
const PALETTES = [
  { ink: "#101828", paper: "#f2f1ec", accent: "#d95b34", tint: "#b9c4d6" },
  { ink: "#12232b", paper: "#eef0ec", accent: "#2f8f7a", tint: "#c3d2cc" },
  { ink: "#1b1630", paper: "#f1eef5", accent: "#6d4ed6", tint: "#c9bfe4" },
  { ink: "#24170f", paper: "#f4efe6", accent: "#c08a3e", tint: "#ddcbae" },
  { ink: "#0e1b2e", paper: "#eef2f6", accent: "#2f6fd0", tint: "#bcd0e6" },
  { ink: "#2a1220", paper: "#f5eef0", accent: "#b03a63", tint: "#e0c3ce" },
  { ink: "#14211a", paper: "#eef2ee", accent: "#4f7a35", tint: "#c6d6bd" },
  { ink: "#221f1c", paper: "#f3f1ed", accent: "#7a6a52", tint: "#d5cec2" },
];

function hash(seed: number, salt: number): number {
  let h = (seed * 374761393 + salt * 668265263) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Six mark constructions, all built on one circle so a set stays a family. */
function Mark({ v, cx, cy, r, fill, accent }: { v: number; cx: number; cy: number; r: number; fill: string; accent: string }) {
  const s = (n: number) => r * n;
  switch (v % 6) {
    case 0:
      return (<g><circle cx={cx} cy={cy} r={r} fill="none" stroke={fill} strokeWidth={s(0.22)} />
        <rect x={cx - s(0.08)} y={cy - r} width={s(0.16)} height={s(1.1)} fill={accent} /></g>);
    case 1:
      return (<g><path d={`M ${cx - r} ${cy + r} L ${cx} ${cy - r} L ${cx + r} ${cy + r} Z`} fill={fill} />
        <rect x={cx - s(0.55)} y={cy + s(0.16)} width={s(1.1)} height={s(0.18)} fill={accent} /></g>);
    case 2:
      return (<g><rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={fill} />
        <circle cx={cx} cy={cy} r={s(0.5)} fill={accent} /></g>);
    case 3:
      return (<g><path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`} fill={fill} />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy} Z`} fill={accent} opacity={0.75} /></g>);
    case 4:
      return (<g>{[0, 1, 2].map((i) => (
        <rect key={i} x={cx - r + i * s(0.72)} y={cy - r + i * s(0.3)} width={s(0.5)} height={r * 2 - i * s(0.6)} fill={i === 1 ? accent : fill} />
      ))}</g>);
    default:
      return (<g><circle cx={cx} cy={cy} r={r} fill={fill} />
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`} fill={accent} /></g>);
  }
}

function Grid({ w, h, step, stroke }: { w: number; h: number; step: number; stroke: string }) {
  const cols = Math.ceil(w / step), rows = Math.ceil(h / step);
  return (<g stroke={stroke} strokeWidth={1}>
    {Array.from({ length: cols + 1 }, (_, i) => <line key={`c${i}`} x1={i * step} y1={0} x2={i * step} y2={h} />)}
    {Array.from({ length: rows + 1 }, (_, i) => <line key={`r${i}`} x1={0} y1={i * step} x2={w} y2={i * step} />)}
  </g>);
}

const LABELS = ["01", "02", "03", "04", "05", "06"];

/**
 * The artefact set per category.
 *
 * Six each, and the **names match what `Body` actually draws at that index**:
 * the object, its construction, its type and colour, a detail, a range, an
 * application. A list that drifted from the drawing labelled a construction
 * study "Type and colour".
 */
const SYSTEMS: Record<string, string[]> = {
  "visual-identity": ["Primary mark", "Construction", "Type and colour", "Mark detail", "Applications", "Digital application"],
  packaging: ["Pack front", "Structure", "Type and colour", "Material detail", "Range", "Shelf application"],
  type: ["Specimen", "Construction", "Weights and colour", "Glyph detail", "Settings", "Applied setting"],
  photography: ["Selected frame", "Grid and crop", "Tone and colour", "Frame detail", "Series", "Print application"],
  film: ["Title card", "Storyboard grid", "Grade and colour", "Frame detail", "Sequence", "End card"],
  digital: ["Primary screen", "Layout grid", "Type and colour", "Component detail", "Screen set", "Applied interface"],
  layout: ["Cover", "Grid", "Type and colour", "Detail", "Section openers", "Spread"],
};

export function artefactsFor(parentId: string): string[] {
  return SYSTEMS[parentId] ?? SYSTEMS["visual-identity"];
}

/** Aspect per index, so the approved gallery rhythm still has shapes to work with. */
export const ART_RATIOS = [16 / 9, 4 / 5, 4 / 5, 1, 3 / 2, 16 / 9];

/**
 * The caption an artefact carries, as text rather than as pixels.
 *
 * Drawn into the SVG it is 22px on a 1600px canvas: legible at full bleed,
 * unreadable in a gallery cell, and a different size in every frame depending
 * on how much measure that frame was given. Rendered as real text beside the
 * frame it is one size everywhere, selectable, and translatable later.
 */
export function artefactLabel(spec: ArtSpec): string {
  const names = artefactsFor(spec.parentId);
  return `${LABELS[spec.index]} — ${(names[spec.index] ?? "").toUpperCase()}`;
}

export function ProjectArt({
  spec,
  className,
  ratio: ratioOverride,
  caption = true,
  plain = false,
}: {
  spec: ArtSpec;
  className?: string;
  /**
   * Draw at this shape instead of the artefact's own.
   *
   * **This is what stops the artwork being cropped.** `slice` fills whatever
   * box it is given, so a 16:9 drawing in a box the page has capped to 2.3:1
   * loses a quarter of its width - which is how a cover lost the end of its own
   * wordmark. Because the art is generated rather than photographed, the honest
   * fix is to draw it at the shape it will occupy.
   */
  ratio?: number;
  /** False where the caption is rendered as text outside the frame. */
  caption?: boolean;
  /**
   * Draw the geometry without the project's lettering.
   *
   * Behind a hero the artwork is texture, and its wordmark - set large, in the
   * project's own name - becomes a second headline beside the `h1`.
   */
  plain?: boolean;
}) {
  const { parentId, index, seed, title } = spec;
  const p = PALETTES[Math.floor(hash(seed, 1) * PALETTES.length)];
  const markV = Math.floor(hash(seed, 2) * 6);
  const ratio = ratioOverride ?? ART_RATIOS[index] ?? 3 / 2;
  const W = 1600, H = Math.round(W / ratio);
  const names = artefactsFor(parentId);
  const label = `${LABELS[index]} — ${(names[index] ?? "").toUpperCase()}`;
  const initial = title.trim().charAt(0).toUpperCase();
  const wordmark = plain ? "" : title.toUpperCase().slice(0, 26);
  const dark = index % 3 === 2;
  const bg = dark ? p.ink : p.paper;
  const fg = dark ? p.paper : p.ink;

  return (
    /* The drawing does not mirror, and this is the one place on the page that
       is true. Every element in it is positioned at an explicit x, so flipping
       the text direction moved the lettering across a composition whose
       geometry stayed put - on the Arabic page the wordmark landed on top of
       the mark, and its full stops jumped to the wrong end. A drawing is
       artwork, not interface: it is composed once and reads the same either
       way. Arabic *glyph runs* inside it still shape right-to-left, which is
       bidi doing its job and is unaffected by this. */
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="presentation"
      preserveAspectRatio="xMidYMid slice"
      style={{ direction: "ltr" }} // rtl-ok: artwork is composed once, not mirrored
    >
      <rect width={W} height={H} fill={bg} />
      <Body W={W} H={H} p={p} fg={fg} dark={dark} index={index} parentId={parentId} markV={markV} seed={seed} wordmark={wordmark} initial={initial} />
      {caption ? (
        <text x={64} y={H - 52} fontFamily={DISPLAY} fontSize={22} letterSpacing={6} fill={p.accent} fontWeight={700}>{label}</text>
      ) : null}
    </svg>
  );
}

/**
 * A display size that fits the measure.
 *
 * Titles run from four characters to twenty-six, and a fixed size sent the long
 * ones off the edge of the frame. A bold display face sets at roughly 0.62em per
 * character, so the size is solved from the width rather than guessed.
 */
function fitted(text: string, measure: number, max: number, tracking = 0): number {
  if (!text.length) return max;
  // **0.78, not 0.62.** The display face is an engineered, orthogonal
  // sans - it is wide - and estimating its average advance at 0.62em made
  // every long wordmark wider than the measure it was solved for. On a 4:3
  // canvas that put "ALMOND BRAND SYSTEM" over the end of its own artboard.
  // The estimate now errs generous, and the tracking is subtracted rather
  // than ignored: `letterSpacing` adds a full unit per character and was
  // simply missing from the sum.
  const usable = Math.max(0, measure - tracking * text.length);
  return Math.max(18, Math.min(max, usable / (text.length * 0.78)));
}

function Body({ W, H, p, fg, dark, index, parentId, markV, seed, wordmark, initial }: {
  W: number; H: number; p: (typeof PALETTES)[number]; fg: string; dark: boolean;
  index: number; parentId: string; markV: number; seed: number; wordmark: string; initial: string;
}) {
  const cx = W * 0.28, cy = H * 0.44;
  const soft = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";

  // 0 — the object, whatever the discipline calls it.
  if (index === 0) {
    if (parentId === "photography" || parentId === "film") {
      return (<g>
        <rect x={64} y={64} width={W - 128} height={H - 190} fill={p.tint} />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={64 + i * ((W - 128) / 7)} y={64} width={(W - 128) / 7} height={H - 190}
            fill={p.ink} opacity={0.06 + hash(seed, 30 + i) * 0.5} />
        ))}
        <rect x={64} y={H * 0.62} width={W - 128} height={2} fill={p.accent} />
        <text x={96} y={H * 0.58} fontFamily={DISPLAY} fontSize={fitted(wordmark, W * 0.78, 72)} fontWeight={700} fill={p.paper}>{wordmark}</text>
      </g>);
    }
    if (parentId === "layout" || parentId === "packaging") {
      return (<g>
        <rect x={W * 0.18} y={70} width={W * 0.64} height={H - 200} fill={dark ? p.paper : "#ffffff"} />
        <rect x={W * 0.18} y={70} width={W * 0.64} height={18} fill={p.accent} />
        <text x={W * 0.5} y={H * 0.44} textAnchor="middle" fontFamily={DISPLAY} fontSize={fitted(wordmark, W * 0.58, 78)} fontWeight={700} fill={p.ink}>{wordmark}</text>
        <line x1={W * 0.28} y1={H * 0.52} x2={W * 0.72} y2={H * 0.52} stroke={p.accent} strokeWidth={5} />
        <Mark v={markV} cx={W * 0.5} cy={H * 0.68} r={54} fill={p.ink} accent={p.accent} />
      </g>);
    }
    if (parentId === "type") {
      // A specimen, not a mark: the object of a type project is the letterform.
      return (<g>
        <text x={W * 0.5} y={H * 0.56} textAnchor="middle" fontFamily={DISPLAY} fontSize={H * 0.62} fontWeight={700} fill={fg}>
          {initial}
        </text>
        <line x1={90} y1={H * 0.68} x2={W - 90} y2={H * 0.68} stroke={p.accent} strokeWidth={4} />
        <text x={90} y={H * 0.8} fontFamily={SANS} fontSize={44} fill={fg} opacity={0.75} letterSpacing={6}>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ
        </text>
        <text x={W - 90} y={H * 0.28} textAnchor="end" fontFamily={DISPLAY} fontSize={fitted(wordmark, W * 0.5, 46, 3)} fontWeight={500} fill={p.accent} letterSpacing={3}>
          {wordmark}
        </text>
      </g>);
    }
    if (parentId === "digital") {
      // A screen, because that is what a digital project delivers.
      return (<g>
        <rect x={110} y={70} width={W - 220} height={H - 200} fill={dark ? p.ink : "#ffffff"} stroke={fg} strokeOpacity={0.12} />
        <rect x={110} y={70} width={W - 220} height={78} fill={fg} />
        {[0, 1, 2].map((i) => <circle key={i} cx={150 + i * 34} cy={109} r={9} fill={p.paper} opacity={0.45} />)}
        <text x={W * 0.5} y={118} textAnchor="middle" fontFamily={SANS} fontSize={26} fill={p.paper} opacity={0.75}>{wordmark.toLowerCase()}</text>
        <rect x={170} y={200} width={W * 0.34} height={54} fill={p.accent} />
        <text x={196} y={239} fontFamily={DISPLAY} fontSize={30} fontWeight={700} fill={p.paper}>{initial}—{LABELS[1]}</text>
        {Array.from({ length: 4 }, (_, i) => (
          <g key={i}>
            <rect x={170} y={300 + i * 96} width={W - 340} height={72} fill={p.tint} opacity={0.4} />
            <rect x={170} y={300 + i * 96} width={7} height={72} fill={i === 0 ? p.accent : fg} />
            <rect x={210} y={324 + i * 96} width={220 + i * 90} height={12} fill={fg} opacity={0.45} />
            <rect x={W - 400} y={324 + i * 96} width={110} height={12} fill={fg} opacity={0.25} />
          </g>
        ))}
      </g>);
    }
    if (parentId === "film") {
      // A title card and its grade, which is a film's own opening statement.
      return (<g>
        <rect width={W} height={H} fill={p.ink} />
        <text x={W * 0.5} y={H * 0.46} textAnchor="middle" fontFamily={DISPLAY} fontSize={fitted(wordmark, W * 0.72, 96, 6)} fontWeight={700} fill={p.paper} letterSpacing={6}>
          {wordmark}
        </text>
        <line x1={W * 0.3} y1={H * 0.56} x2={W * 0.7} y2={H * 0.56} stroke={p.accent} strokeWidth={4} />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={90 + i * ((W - 180) / 10)} y={H * 0.74} width={(W - 180) / 10 - 8} height={H * 0.1}
            fill={i % 3 === 0 ? p.accent : p.tint} opacity={0.35 + (i / 10) * 0.6} />
        ))}
      </g>);
    }
    return (<g>
      <Grid w={W} h={H} step={80} stroke={soft} />
      <circle cx={cx} cy={cy} r={190} fill="none" stroke={p.accent} strokeOpacity={0.4} strokeWidth={2} strokeDasharray="10 8" />
      <Mark v={markV} cx={cx} cy={cy} r={130} fill={fg} accent={p.accent} />
      <text x={W * 0.52} y={cy - 10} fontFamily={DISPLAY} fontSize={fitted(wordmark, W * 0.42, 84, 2)} fontWeight={700} fill={fg} letterSpacing={2}>{wordmark}</text>
      <line x1={W * 0.52} y1={cy + 26} x2={W - 90} y2={cy + 26} stroke={p.accent} strokeWidth={5} />
      <text x={W * 0.52} y={cy + 82} fontFamily={SANS} fontSize={24} fill={fg} opacity={0.62}>Built on a single module.</text>
      <text x={W * 0.52} y={cy + 118} fontFamily={SANS} fontSize={24} fill={fg} opacity={0.62}>The mark scales without redrawing.</text>
    </g>);
  }

  // 1 — how it is built.
  if (index === 1) {
    return (<g>
      <Grid w={W} h={H} step={100} stroke={soft} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={140 + i * 420} y={H * 0.2 + i * 30} width={300} height={H * 0.42} fill={i === 1 ? p.accent : fg} opacity={i === 2 ? 0.55 : 1} />
          <text x={140 + i * 420} y={H * 0.2 + i * 30 - 22} fontFamily={DISPLAY} fontSize={20} letterSpacing={4} fill={fg} opacity={0.6}>
            {["A", "B", "C"][i]} / {(1 + i * 0.5).toFixed(1)}×
          </text>
        </g>
      ))}
      <line x1={90} y1={H * 0.2} x2={W - 90} y2={H * 0.2} stroke={p.accent} strokeWidth={2} strokeDasharray="12 8" />
      <line x1={90} y1={H * 0.62} x2={W - 90} y2={H * 0.62} stroke={p.accent} strokeWidth={2} strokeDasharray="12 8" />
    </g>);
  }

  // 2 — type and colour, on the dark ground.
  if (index === 2) {
    return (<g>
      <text x={90} y={H * 0.3} fontFamily={DISPLAY} fontSize={150} fontWeight={300} fill={fg}>{initial}a</text>
      <text x={420} y={H * 0.3} fontFamily={DISPLAY} fontSize={150} fontWeight={500} fill={fg}>{initial}a</text>
      <text x={750} y={H * 0.3} fontFamily={DISPLAY} fontSize={150} fontWeight={700} fill={fg}>{initial}a</text>
      <line x1={90} y1={H * 0.38} x2={W - 90} y2={H * 0.38} stroke={fg} strokeOpacity={0.3} strokeWidth={2} />
      <text x={90} y={H * 0.52} fontFamily={SANS} fontSize={54} fill={fg} opacity={0.9}>ABCDEFGHIJKLMNOPQRSTUVW</text>
      <text x={90} y={H * 0.63} fontFamily={SANS} fontSize={54} fill={fg} opacity={0.55}>0123456789 — / % &amp;</text>
      {[p.accent, p.tint, fg].map((c, i) => (
        <rect key={i} x={90 + i * 260} y={H * 0.72} width={220} height={H * 0.14} fill={c} />
      ))}
    </g>);
  }

  // 3 — a detail, square.
  if (index === 3) {
    return (<g>
      <rect x={W * 0.1} y={H * 0.1} width={W * 0.8} height={H * 0.66} fill={dark ? p.ink : "#ffffff"} stroke={fg} strokeOpacity={0.15} />
      <Mark v={markV} cx={W * 0.5} cy={H * 0.4} r={W * 0.16} fill={fg} accent={p.accent} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={W * 0.1} y1={H * 0.1 + i * (H * 0.66 / 8)} x2={W * 0.9} y2={H * 0.1 + i * (H * 0.66 / 8)} stroke={p.accent} strokeOpacity={0.12} />
      ))}
    </g>);
  }

  // 4 — a range or a series.
  if (index === 4) {
    const n = parentId === "packaging" || parentId === "layout" ? 5 : 4;
    return (<g>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect x={90 + i * ((W - 180) / n)} y={H * 0.16} width={(W - 180) / n - 26} height={H * 0.58}
            fill={i % 2 ? p.tint : fg} opacity={i % 2 ? 1 : 0.92} />
          <Mark v={markV} cx={90 + i * ((W - 180) / n) + ((W - 180) / n - 26) / 2} cy={H * 0.42} r={40}
            fill={i % 2 ? p.ink : p.paper} accent={p.accent} />
          <text x={90 + i * ((W - 180) / n)} y={H * 0.82} fontFamily={DISPLAY} fontSize={22} letterSpacing={3} fill={fg} opacity={0.7}>
            {`0${i + 1}`}
          </text>
        </g>
      ))}
    </g>);
  }

  // 5 — where it is used.
  return (<g>
    <rect x={90} y={70} width={W - 180} height={H - 200} fill={dark ? p.ink : "#ffffff"} />
    <rect x={90} y={70} width={W - 180} height={92} fill={fg} />
    <Mark v={markV} cx={150} cy={116} r={26} fill={p.paper} accent={p.accent} />
    <text x={210} y={128} fontFamily={DISPLAY} fontSize={fitted(wordmark, W * 0.6, 34)} fontWeight={700} fill={p.paper} letterSpacing={2}>{wordmark}</text>
    {Array.from({ length: 3 }, (_, i) => (
      <g key={i}>
        <rect x={140} y={220 + i * 130} width={W - 280} height={96} fill={p.tint} opacity={0.35} />
        <rect x={140} y={220 + i * 130} width={8} height={96} fill={i === 0 ? p.accent : fg} />
        <text x={180} y={272 + i * 130} fontFamily={SANS} fontSize={30} fill={fg} opacity={0.8}>
          {["Overview", "Detail", "Related"][i]}
        </text>
      </g>
    ))}
  </g>);
}
