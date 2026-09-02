/**
 * Two families of drawn mark: a person, and a partner.
 *
 * **Neither is a photograph and neither pretends to be.** An invented
 * interviewee cannot borrow a real face, and a partner whose real logo the
 * client has not supplied cannot borrow somebody else's. Both are generated
 * from a seed, so the same person and the same organisation look the same on
 * every render, in both locales, on every page they appear.
 */

function hash(seed: number, salt: number): number {
  const x = Math.sin(seed * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

const SKIN = ["#e8c9a8", "#d9ab84", "#c08a5e", "#a06a41", "#7d4f2e"];
const CLOTH = ["#1b2a54", "#2123bc", "#3a4a7a", "#243b3b", "#4a2b3b"];
const GROUND = ["#e9e7f2", "#e4e8ea", "#efe9e2", "#e6eaf0"];

/**
 * A graphic portrait: a figure, not a likeness.
 *
 * Deliberately flat and geometric. A rendered face that almost looks like a
 * photograph is worse than an obvious drawing, because it invites a reader to
 * believe they are looking at somebody real.
 */
export function DrawnPortrait({
  seed,
  className,
  title,
}: {
  seed: number;
  className?: string;
  /** The person's name, so the drawing is announced rather than skipped. */
  title: string;
}) {
  const skin = SKIN[Math.floor(hash(seed, 1) * SKIN.length)];
  const cloth = CLOTH[Math.floor(hash(seed, 2) * CLOTH.length)];
  const ground = GROUND[Math.floor(hash(seed, 3) * GROUND.length)];
  const hair = hash(seed, 4);
  const wide = 0.9 + hash(seed, 5) * 0.25;
  const covered = hash(seed, 6) > 0.55;
  const glasses = hash(seed, 7) > 0.62;

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
      <rect width="200" height="200" fill={ground} />
      {/* Shoulders */}
      <path d="M22 200c0-38 26-58 78-58s78 20 78 58z" fill={cloth} />
      {/* Head covering, drawn behind the face where the seed asks for one. */}
      {covered ? (
        <path d="M56 96c0-30 20-52 44-52s44 22 44 52c0 26-8 44-18 56H74c-10-12-18-30-18-56z" fill={cloth} opacity={0.92} />
      ) : null}
      {/* Head */}
      <ellipse cx="100" cy="96" rx={38 * wide} ry="44" fill={skin} />
      {/* Hair, only when the head is uncovered. */}
      {!covered ? (
        <path
          d={
            hair > 0.5
              ? "M62 92c0-28 18-46 38-46s38 18 38 46c0-16-14-24-38-24s-38 8-38 24z"
              : "M62 96c-2-32 16-50 38-50s40 18 38 50c-4-22-16-30-38-30s-34 8-38 30z"
          }
          fill="#1a1a24"
          opacity={0.85}
        />
      ) : null}
      {/* Features: two marks and a line. Any more reads as a caricature. */}
      <circle cx={86} cy={96} r="3.4" fill="#1a1a24" />
      <circle cx={114} cy={96} r="3.4" fill="#1a1a24" />
      <path d="M90 118q10 7 20 0" stroke="#1a1a24" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {glasses ? (
        <g stroke="#1a1a24" strokeWidth="2.2" fill="none" opacity={0.8}>
          <circle cx="86" cy="96" r="10" />
          <circle cx="114" cy="96" r="10" />
          <path d="M96 96h8" />
        </g>
      ) : null}
    </svg>
  );
}

const MARK_INK = ["#0a1a3c", "#2123bc", "#243b3b", "#4a2b3b", "#1b2a54"];

/**
 * A provisional partner mark: a real drawn logo, not a name in a box.
 *
 * The geometry varies by seed - a stacked block, a ring, a bar set, a chevron -
 * so a wall of thirty marks reads as thirty organisations rather than as one
 * template repeated. The name is set beside it in the display face, which is
 * what most wordmarks on such a wall are anyway.
 */
export function PartnerMark({
  name,
  seed,
  className,
}: {
  name: string;
  seed: number;
  className?: string;
}) {
  const ink = MARK_INK[Math.floor(hash(seed, 11) * MARK_INK.length)];
  const shape = Math.floor(hash(seed, 12) * 4);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    // `direction: ltr`, pinned. An SVG inherits the page's direction, and in
    // Arabic that re-anchors `text-anchor: start` to the right - so the name,
    // set at x=70, ran leftward across the mark's own artwork and printed on
    // top of it. A drawn logo does not mirror; only the layout around it does.
    <svg
      viewBox="0 0 260 64"
      className={className}
      role="img"
      aria-label={name}
      style={{ direction: "ltr" }} // rtl-ok: drawn artwork does not mirror
    >
      <g fill={ink}>
        {shape === 0 ? (
          <>
            <rect x="4" y="12" width="18" height="40" />
            <rect x="26" y="22" width="14" height="30" />
            <rect x="44" y="30" width="10" height="22" />
          </>
        ) : shape === 1 ? (
          <>
            <circle cx="29" cy="32" r="24" fill="none" stroke={ink} strokeWidth="7" />
            <rect x="25" y="8" width="8" height="26" />
          </>
        ) : shape === 2 ? (
          <>
            <path d="M6 52 30 12l24 40z" />
            <rect x="20" y="40" width="20" height="12" fill="#ffffff" opacity={0.9} />
          </>
        ) : (
          <>
            <rect x="6" y="14" width="46" height="12" />
            <rect x="6" y="30" width="30" height="12" />
            <rect x="6" y="46" width="14" height="8" />
          </>
        )}
        <text
          x="70"
          y="41"
          fontFamily="var(--font-presicav), system-ui, sans-serif"
          fontSize="21"
          fontWeight={700}
          letterSpacing="0.5"
        >
          {initials}
        </text>
        <text
          x="70"
          y="55"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          fontSize="10.5"
        >
          {name.length > 30 ? `${name.slice(0, 29)}…` : name}
        </text>
      </g>
    </svg>
  );
}
