/**
 * Event photography.
 *
 * Real photographs from a Gridliners event: the stage carries the logo and the
 * poster wall carries the actual "Meet the Jury" artwork. Sources are the
 * print-resolution PNGs the client supplied in the reference archive; the
 * derivatives below are web-sized and are the only versions that ship.
 *
 * Aspect ratios are recorded so sections can reserve space and avoid layout
 * shift without hardcoding numbers at each call site.
 */

export interface MediaAsset {
  src: string;
  /** width / height of the source frame. */
  ratio: number;
}

const asset = (name: string, ratio: number, ext = "jpg"): MediaAsset => ({
  src: `/media/${name}.${ext}`,
  ratio,
});

/**
 * One square of the identity's pixel motif, placed over a frame.
 *
 * `at` names the corner it hangs off and `x`/`y` are whole units from it, so a
 * cluster stays welded to its corner at any hero size instead of drifting with
 * a percentage.
 */
export interface PixelCell {
  at: "start-top" | "end-top" | "start-bottom" | "end-bottom";
  x: number;
  y: number;
  /** Units square. Varying this is what stops a cluster reading as graph paper. */
  span?: number;
  tone: "navy" | "blue" | "purple" | "lime" | "cream";
  alpha: number;
}

/** One frame of the hero. */
export interface HeroSlide {
  wide: MediaAsset;
  /** Re-staged for a tall box, not a crop. */
  portrait: MediaAsset;
  /**
   * object-position for the wide frame.
   *
   * Per slide, because what has to stay in shot differs. The neon group is
   * anchored to its top end corner; the stage shot is anchored low, because
   * anchored high its projected Gridliners wordmark grows into the headline on
   * a wide screen and the brand name ends up printed twice, overlapping.
   */
  focus: string;
  /**
   * Pixel clusters for this frame, authored not generated.
   *
   * Each set has to miss that photograph's own subject as well as the copy and
   * the controls, and has to pick a tone that belongs to what is underneath —
   * which is a judgement about the picture, not something a seed can be asked
   * for. It is also why no two slides carry the same arrangement.
   */
  pixels: { wide: PixelCell[]; portrait: PixelCell[] };
  /**
   * The block the copy is set on, in pixel units.
   *
   * Taken from the deck, where a headline never sits on bare photography — it
   * sits on a solid field from the same square system, hung off the start edge
   * with the picture running out beside it. That is a device with an edge, not
   * a veil across the frame, and it is what lets the near-white press wall
   * carry cream type at all.
   */
  /**
   * The field the copy sits on, in units from the start edge and from the
   * copy's own vertical centre. Negative x bleeds off the edge of the screen.
   *
   * Coordinates and sizes are whole units, always. Fractional ones read as a
   * scatter rather than as the identity's grid, which is the difference between
   * a motif and noise — two-unit cells at odd x tile edge to edge, and one-unit
   * cells drop into the same lattice.
   *
   * Density is the only thing that varies between slides, and it varies with
   * how much ground the photograph underneath already gives the type.
   *
   * Cells under the copy carry weight; the faint ones that ragged the edge live
   * outside it. Mixed in among the type they let the picture through in patches
   * and took whole slides under AA while looking, from a distance, exactly the
   * same.
   */
  copyCluster: { x: number; y: number; size: number; tone: PixelCell["tone"]; alpha: number }[];
  copy: null | "jury" | "community";
}

/**
 * The hero rotation.
 *
 * Nothing sits over these frames; they are shown as supplied. `focus` is the
 * only art direction left, and it is per slide because what has to stay in shot
 * differs — hero-03 is anchored low so its projected Gridliners wordmark does
 * not grow into the headline on a wide screen and print the brand name twice.
 */
export const heroSlides: HeroSlide[] = [
  {
    wide: asset("hero-01", 2912 / 1632, "webp"),
    portrait: asset("hero-01-mobile", 816 / 1456, "webp"),
    focus: "100% 0%",
    // Neon group on a dark start field. The cluster hangs off the top corners:
    // deep tones over the empty field, the campaign purple where the frame is
    // already magenta so the squares read as part of the lighting.
    // The core is a full rectangle, not a staircase. Stopping a row short left
    // the tail of the paragraph off the field, and no amount of weight on the
    // cells that were there could reach it — 3.57:1 at 1440 whether the core
    // sat at 0.8 or 0.9.
    copyCluster: [
      { x: -1, y: -3, size: 2, tone: "navy", alpha: 0.987 },
      { x: 1, y: -3, size: 2, tone: "navy", alpha: 0.987 },
      { x: 3, y: -3, size: 2, tone: "blue", alpha: 0.987 },
      { x: 5, y: -3, size: 2, tone: "navy", alpha: 0.987 },
      { x: 7, y: -3, size: 2, tone: "navy", alpha: 0.987 },
      { x: -1, y: -1, size: 2, tone: "navy", alpha: 0.987 },
      { x: 1, y: -1, size: 2, tone: "blue", alpha: 0.987 },
      { x: 3, y: -1, size: 2, tone: "navy", alpha: 0.987 },
      { x: 5, y: -1, size: 2, tone: "navy", alpha: 0.987 },
      { x: 7, y: -1, size: 2, tone: "blue", alpha: 0.987 },
      { x: -1, y: 1, size: 2, tone: "blue", alpha: 0.984 },
      { x: 1, y: 1, size: 2, tone: "navy", alpha: 0.984 },
      { x: 3, y: 1, size: 2, tone: "navy", alpha: 0.984 },
      { x: 5, y: 1, size: 2, tone: "blue", alpha: 0.984 },
      { x: 7, y: 1, size: 2, tone: "navy", alpha: 0.984 },
      // Ragged edge, all of it clear of the type
      { x: 9, y: -1, size: 1, tone: "navy", alpha: 0.817 },
      { x: -1, y: 3, size: 2, tone: "blue", alpha: 0.828 },
      { x: 1, y: 3, size: 1, tone: "navy", alpha: 0.797 },
    ],
    copy: null,
    pixels: {
      wide: [
        { at: "end-top", x: 0, y: 0, span: 2, tone: "purple", alpha: 0.843 },
        { at: "end-top", x: 2, y: 0, tone: "navy", alpha: 0.869 },
        { at: "end-top", x: 2, y: 1, tone: "purple", alpha: 0.812 },
        { at: "end-top", x: 0, y: 2, tone: "purple", alpha: 0.797 },
      ],
      portrait: [
        { at: "end-top", x: 0, y: 1, tone: "purple", alpha: 0.802 },
      ],
    },
  },
  {
    wide: asset("hero-02", 2912 / 1632, "webp"),
    portrait: asset("hero-02-mobile", 816 / 1456, "webp"),
    focus: "50% 35%",
    // A near-white press wall, so the squares are the dark ones here. They give
    // the frame the edge weight it has none of, and the cream cell keeps the
    // cluster from reading as a hole punched in the picture.
    // Heaviest block of the three: nothing else stands between cream type and a
    // white wall.
    // The densest of the three: a near-white wall gives cream type no ground at
    // all, so the field has to make it.
    copyCluster: [
      { x: -1, y: -3, size: 2, tone: "blue", alpha: 0.974 },
      { x: 1, y: -3, size: 2, tone: "blue", alpha: 0.974 },
      { x: 3, y: -3, size: 2, tone: "navy", alpha: 0.974 },
      { x: 5, y: -3, size: 2, tone: "blue", alpha: 0.974 },
      { x: 7, y: -3, size: 2, tone: "blue", alpha: 0.974 },
      { x: -1, y: -1, size: 2, tone: "blue", alpha: 0.984 },
      { x: 1, y: -1, size: 2, tone: "navy", alpha: 0.984 },
      { x: 3, y: -1, size: 2, tone: "blue", alpha: 0.984 },
      { x: 5, y: -1, size: 2, tone: "blue", alpha: 0.984 },
      { x: 7, y: -1, size: 2, tone: "navy", alpha: 0.984 },
      { x: -1, y: 1, size: 2, tone: "navy", alpha: 0.979 },
      { x: 1, y: 1, size: 2, tone: "blue", alpha: 0.979 },
      { x: 3, y: 1, size: 2, tone: "blue", alpha: 0.979 },
      { x: 5, y: 1, size: 2, tone: "navy", alpha: 0.979 },
      { x: 7, y: 1, size: 2, tone: "blue", alpha: 0.979 },
      { x: 9, y: -1, size: 1, tone: "blue", alpha: 0.843 },
      { x: -1, y: 3, size: 2, tone: "blue", alpha: 0.869 },
      { x: 1, y: 3, size: 1, tone: "navy", alpha: 0.83 },
    ],
    copy: "jury",
    pixels: {
      wide: [
        { at: "end-top", x: 0, y: 0, tone: "blue", alpha: 0.901 },
        { at: "end-top", x: 1, y: 0, tone: "navy", alpha: 0.856 },
        { at: "end-top", x: 0, y: 1, tone: "cream", alpha: 0.856 },
        { at: "end-top", x: 1, y: 1, tone: "navy", alpha: 0.797 },
      ],
      portrait: [
        { at: "end-top", x: 0, y: 0, tone: "blue", alpha: 0.856 },
        { at: "end-top", x: 0, y: 1, tone: "cream", alpha: 0.817 },
      ],
    },
  },
  {
    wide: asset("hero-03", 2912 / 1632, "webp"),
    portrait: asset("hero-03-mobile", 816 / 1456, "webp"),
    focus: "50% 100%",
    // The stage shot is already blue and already dark, so this set is the
    // sparest of the three and carries the single lime cell in the rotation —
    // one pop against a frame that has none of its own.
    // This frame is already dark where the copy lands, so its field is the
    // lightest of the three. It also carries the rotation's one lime cell.
    copyCluster: [
      { x: -1, y: -3, size: 2, tone: "navy", alpha: 0.932 },
      { x: 1, y: -3, size: 2, tone: "blue", alpha: 0.932 },
      { x: 3, y: -3, size: 2, tone: "navy", alpha: 0.932 },
      { x: 5, y: -3, size: 2, tone: "navy", alpha: 0.932 },
      { x: 7, y: -3, size: 2, tone: "blue", alpha: 0.932 },
      { x: -1, y: -1, size: 2, tone: "blue", alpha: 0.958 },
      { x: 1, y: -1, size: 2, tone: "navy", alpha: 0.958 },
      { x: 3, y: -1, size: 2, tone: "navy", alpha: 0.958 },
      { x: 5, y: -1, size: 2, tone: "blue", alpha: 0.958 },
      { x: 7, y: -1, size: 2, tone: "navy", alpha: 0.958 },
      { x: -1, y: 1, size: 2, tone: "navy", alpha: 0.948 },
      { x: 1, y: 1, size: 2, tone: "navy", alpha: 0.948 },
      { x: 3, y: 1, size: 2, tone: "blue", alpha: 0.948 },
      { x: 5, y: 1, size: 2, tone: "navy", alpha: 0.948 },
      { x: 7, y: 1, size: 2, tone: "navy", alpha: 0.948 },
      { x: 9, y: -1, size: 1, tone: "blue", alpha: 0.804 },
      { x: -1, y: 3, size: 2, tone: "navy", alpha: 0.823 },
      { x: 1, y: 3, size: 1, tone: "lime", alpha: 0.948 },
    ],
    copy: "community",
    pixels: {
      wide: [
        { at: "end-top", x: 0, y: 0, span: 2, tone: "navy", alpha: 0.883 },
        { at: "end-top", x: 2, y: 0, tone: "blue", alpha: 0.856 },
        { at: "end-top", x: 2, y: 1, tone: "blue", alpha: 0.791 },
        { at: "end-top", x: 0, y: 2, tone: "lime", alpha: 0.883 },
      ],
      portrait: [
        { at: "end-top", x: 0, y: 0, tone: "navy", alpha: 0.849 },
        { at: "end-top", x: 0, y: 1, tone: "lime", alpha: 0.856 },
      ],
    },
  },
];

export const media = {
  /**
   * Dubai at night, and the only frame here that did not come from the client.
   *
   * Sourced 2026-08-26 from Wikimedia Commons, "Dubai skyscrapers at night
   * 2011.jpg", released **CC0 / Public Domain Dedication** - no attribution
   * required and no share-alike obligation, which is why it was chosen over
   * five better-framed candidates that were all CC BY or CC BY-SA and would
   * have put a credit line into the hero or a licence term onto the site.
   * Downscaled to 2560px and re-encoded at q74 (178KB) from the 3827px
   * original.
   *
   * **It is a placeholder and it is a city, not a ceremony.** It says where the
   * 2026 night will be held; it makes no claim about the night, which is the
   * whole reason `cityImage` is a separate field from `image`. Replace it with
   * the client's own photography when that arrives.
   */
  cityDubai: asset("city-dubai", 2560 / 1602),
  ceremonyStage: asset("ceremony-stage", 6720 / 4480),
  winnersStage: asset("winners-stage", 4197 / 1880),
  audienceHall: asset("audience-hall", 3 / 2),
  communityPanel: asset("community-panel", 3 / 2),
  awardMoment: asset("award-moment", 3 / 2),
  juryPortraitF: asset("jury-portrait-f", 3 / 2),
  postersWall: asset("posters-wall", 3660 / 2880),
  lanyard: asset("lanyard", 3 / 2),
  idCards: asset("id-cards", 3 / 2),
  notebook: asset("notebook", 8888 / 5000),
  posterGold: asset("poster-gold", 2084 / 3126),
} as const;


/**
 * Project-cover placeholders, grouped by parent category.
 *
 * **No entrant photography exists in this build.** Every `EntryMedia.coverUrl`
 * in the fixtures points into `/placeholders`, a directory that does not exist,
 * so the finalists rows had nothing to show. On client instruction (2026-08-27)
 * a pool was sourced from the web, filtered to **CC0 / Public Domain only** - no
 * attribution owed, no share-alike - and grouped to the parent category whose
 * work each frame most plausibly illustrates.
 *
 * **None of these is the work of the entrant it appears beside**, and the
 * decision to publish them anyway is recorded in `docs/build-state.md`. Every
 * file's source and licence is listed in `docs/cover-sources.md`. They are
 * replaced wholesale the day real covers arrive.
 *
 * Resized to 560x350 and re-encoded at q72 - a row renders them at 112px wide,
 * so this is already generous for a 2x display.
 */
export const projectCovers: Record<string, MediaAsset[]> = {
  "visual-identity": [asset("covers/c06", 560 / 350), asset("covers/c04", 560 / 350), asset("covers/c05", 560 / 350), asset("covers/c00", 560 / 350), asset("covers/c45", 560 / 350)],
  "packaging": [asset("covers/c02", 560 / 350), asset("covers/c19", 560 / 350), asset("covers/c35", 560 / 350), asset("covers/c42", 560 / 350), asset("covers/c45", 560 / 350)],
  "type": [asset("covers/c13", 560 / 350), asset("covers/c14", 560 / 350), asset("covers/c40", 560 / 350), asset("covers/c43", 560 / 350), asset("covers/c44", 560 / 350), asset("covers/c46", 560 / 350)],
  "photography": [asset("covers/c49", 560 / 350), asset("covers/c51", 560 / 350), asset("covers/c52", 560 / 350), asset("covers/c53", 560 / 350), asset("covers/c55", 560 / 350), asset("covers/c56", 560 / 350)],
  "film": [asset("covers/c01", 560 / 350), asset("covers/c53", 560 / 350), asset("covers/c56", 560 / 350), asset("covers/c47", 560 / 350)],
  "digital": [asset("covers/c07", 560 / 350), asset("covers/c20", 560 / 350), asset("covers/c31", 560 / 350), asset("covers/c47", 560 / 350), asset("covers/c48", 560 / 350)],
  "layout": [asset("covers/c03", 560 / 350), asset("covers/c36", 560 / 350), asset("covers/c38", 560 / 350), asset("covers/c39", 560 / 350), asset("covers/c41", 560 / 350)],
};

/**
 * Category photography, keyed by parent category id.
 *
 * Art-directed frames rather than event coverage: each one shows the kind of
 * work its category is for. That is why they are not graded like the rest of
 * the photography here (see CategoryTile) and why they are all one 5:4 frame,
 * which is the tile's own aspect, so nothing is cropped away by the fit.
 */
export const categoryImage: Record<string, MediaAsset> = {
  "visual-identity": asset("cat-1-visual-identity", 1200 / 960, "webp"),
  packaging: asset("cat-2-packaging", 1200 / 960, "webp"),
  type: asset("cat-3-type", 1200 / 960, "webp"),
  photography: asset("cat-4-photography", 1200 / 960, "webp"),
  film: asset("cat-5-film", 1200 / 960, "webp"),
  digital: asset("cat-6-digital", 1200 / 960, "webp"),
  layout: asset("cat-7-layout", 1200 / 960, "webp"),
};
