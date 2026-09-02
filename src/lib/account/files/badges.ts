import "server-only";

/**
 * The downloadable badges.
 *
 * **SVG, and drawn here rather than copied from `public/brand/`.** The brand
 * folder's badge artwork carries no project, no year and no group; a winner
 * needs a mark that says which award it is, which is a different object. These
 * are generated per result so the file a participant embeds is specific to the
 * thing they won.
 *
 * The colourways follow the brand's own meanings: gold, silver and bronze for
 * the three places, the finalist blue for a shortlisted entry, and black for an
 * honorary designation (Addendum §21).
 */

export type BadgeKind = "gold" | "silver" | "bronze" | "finalist" | "honorary";

const COLORS: Record<BadgeKind, { ink: string; ground: string; rule: string }> = {
  gold: { ink: "#0a1a3c", ground: "#d4a64a", rule: "#0a1a3c" },
  silver: { ink: "#0a1a3c", ground: "#c8ccd2", rule: "#0a1a3c" },
  bronze: { ink: "#fdf9ef", ground: "#a06842", rule: "#fdf9ef" },
  finalist: { ink: "#fdf9ef", ground: "#2123bc", rule: "#fdf9ef" },
  honorary: { ink: "#fdf9ef", ground: "#111111", rule: "#fdf9ef" },
};

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function badgeSvg({
  kind,
  label,
  group,
  year,
}: {
  kind: BadgeKind;
  /** GOLD / FINALIST / DESIGNER OF THE YEAR. */
  label: string;
  /** The group or tier this was awarded in. */
  group: string;
  year: number;
}): string {
  const c = COLORS[kind];
  // Nine cells of the identity's grid, at three weights, in the corner the
  // public pages hang theirs from.
  const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    .map((i) => {
      const x = 300 + (i % 3) * 34;
      const y = 12 + Math.floor(i / 3) * 34;
      const alpha = [0.32, 0.14, 0.22, 0.1, 0.28, 0.16, 0.24, 0.12, 0.3][i];
      return `<rect x="${x}" y="${y}" width="34" height="34" fill="${c.ink}" opacity="${alpha}"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="402" height="150" viewBox="0 0 402 150" role="img" aria-label="${esc(label)} ${esc(year.toString())}">
  <title>Gridliners Awards ${esc(year.toString())} — ${esc(label)}</title>
  <rect width="402" height="150" fill="${c.ground}"/>
  <g>${cells}</g>
  <text x="24" y="46" font-family="Helvetica, Arial, sans-serif" font-size="13" letter-spacing="3.2" fill="${c.ink}" opacity="0.75">GRIDLINERS AWARDS</text>
  <text x="24" y="88" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="1.5" fill="${c.ink}">${esc(label.toUpperCase())}</text>
  <rect x="24" y="102" width="180" height="1.5" fill="${c.rule}" opacity="0.5"/>
  <text x="24" y="126" font-family="Helvetica, Arial, sans-serif" font-size="12.5" letter-spacing="1.2" fill="${c.ink}" opacity="0.85">${esc(group)}</text>
  <text x="378" y="126" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="700" fill="${c.ink}">${year}</text>
</svg>`;
}

/**
 * The snippet a winner pastes into their own site.
 *
 * A plain anchor around an image, with the badge's own alt text. No script, no
 * tracking pixel and no iframe: whatever a participant puts on their site has
 * to be something they can read and trust.
 */
export function embedSnippet({
  badgeUrl,
  linkUrl,
  label,
  year,
}: {
  badgeUrl: string;
  linkUrl: string;
  label: string;
  year: number;
}): string {
  return `<a href="${linkUrl}" rel="noopener">
  <img src="${badgeUrl}" width="402" height="150"
       alt="Gridliners Awards ${year} — ${label}" />
</a>`;
}
