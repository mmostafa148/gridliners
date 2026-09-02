import type { JuryCohort, Juror, Score } from "@/lib/api/types";

/**
 * Jury cohort with deliberately PARTIAL scoring, so the jury and admin screens
 * have real gaps to render (§3.5):
 *  - j-001 has scored everything in their cohort.
 *  - j-002 is mid-progress: some entries scored, some not.
 *  - j-003 never scored; Admin entered the missing score at period end, and
 *    the record carries `enteredByAdmin` provenance (auditable, internal-only).
 *
 * Cohorts freeze per parent category when the Jury Scoring Period opens;
 * adding jurors mid-period is not allowed.
 */

/**
 * All six names are invented, and every portrait is a studio placeholder.
 *
 * Two of these entries used to carry real people, named from the event's own
 * "Meet the Jury" poster artwork because their photographs were on the site.
 * Once the portraits became stock, those names were captioning strangers with
 * a real designer's identity. Invented throughout is the honest state until the
 * client's panel and photography land together.
 *
 * Each name is chosen to match the portrait it sits on, and the Arabic titles
 * are gendered accordingly.
 */
/**
 * PLACEHOLDER — every identity on this panel.
 *
 * No governing document names a juror. Names, titles, companies, biographies,
 * countries, languages and social handles are all invented and must be replaced
 * with the real panel before launch. The assignments, and the fact that a juror
 * is assigned at parent-category level with sub-categories inherited, are real:
 * that is consolidated-decisions §2 and it is what the Jury Panel publishes.
 *
 * The two event photographs of identifiable people, `jury-selwaye.jpg` and
 * `jury-abdullah.jpg`, are NOT referenced by any record here and must never be:
 * a real face under an invented name depicts a stranger as somebody else. Every
 * `photoUrl` below points at the commissioned set, `jury-1.png` to `jury-6.png`.
 */
export const jurors: Juror[] = [
  {
    id: "j-001",
    // Named from the event's own "Meet the Jury" poster artwork. The event
    // photograph of this juror is still in public/media as jury-selwaye.jpg and
    // has to come back, together with j-002's, before anything is published:
    // these two are identifiable people, and a studio portrait under a real
    // name depicts a stranger as them. See docs/build-state.md.
    name: { en: "Karim Daoud", ar: "كريم داود" },
    title: { en: "Creative Director, Beirut", ar: "مدير إبداعي، بيروت" },
    company: { en: "Studio Meem", ar: "استوديو ميم" },
    bio: {
      en: "Twenty years on identity systems for regional institutions, and a decade teaching type in Beirut. Judges for whether a system survives contact with the people who have to use it.",
      ar: "عشرون عامًا في أنظمة الهوية لمؤسسات المنطقة، وعقد من تدريس الخط في بيروت. يقيس العمل بقدرة النظام على الصمود بين أيدي من سيستخدمونه.",
    },
    photoUrl: "/media/jury-1.webp",
    country: "LB",
    socials: [{ platform: "instagram", url: "https://instagram.com/example" }],
    assignedParentCategoryIds: ["visual-identity", "layout"],
    languages: ["en", "ar"],
    active: true,
  },
  {
    id: "j-002",
    name: { en: "Faisal Al Nuaimi", ar: "فيصل النعيمي" },
    title: { en: "Type Designer, Doha", ar: "مصمم حروف، الدوحة" },
    company: { en: "Rasm Editions", ar: "دار رسم" },
    bio: {
      en: "Book and magazine designer, and a publisher of Arabic type specimens. Reads a layout the way a reader does, from the page rather than the grid.",
      ar: "مصمم كتب ومجلات، وناشر لنماذج الخطوط العربية. يقرأ الإخراج كما يقرأه القارئ، من الصفحة لا من الشبكة.",
    },
    photoUrl: "/media/jury-2.webp",
    country: "QA",
    socials: [{ platform: "x", url: "https://x.com/example" }],
    assignedParentCategoryIds: ["type", "visual-identity"],
    languages: ["ar"],
    active: true,
  },
  {
    id: "j-003",
    name: { en: "Clara Brandt", ar: "كلارا برانت" },
    title: { en: "Editorial Designer, Berlin", ar: "مصممة تحرير، برلين" },
    company: { en: "Atlas & Co.", ar: "أطلس وشركاه" },
    bio: {
      en: "Editorial art director across three publishing houses. Interested in the sentence a spread makes before a word of it is read.",
      ar: "مدير فني تحريري في ثلاث دور نشر. يعنيه ما تقوله الصفحتان قبل أن تُقرأ كلمة منهما.",
    },
    photoUrl: "/media/jury-3.webp",
    country: "DE",
    socials: [],
    assignedParentCategoryIds: ["layout"],
    languages: ["en", "ar"],
    active: true,
  },
  {
    id: "j-004",
    name: { en: "Tarek Mansour", ar: "طارق منصور" },
    title: { en: "Founder, Motion Studio", ar: "مؤسس استوديو موشن" },
    company: { en: "Northbound Pictures", ar: "نورث باوند بيكتشرز" },
    bio: {
      en: "Director and motion designer working between commercials and title sequences. Judges timing before craft, on the grounds that craft cannot rescue a bad cut.",
      ar: "مخرج ومصمم موشن بين الإعلانات وتترات البداية. يقدّم الإيقاع على الحرفية، لأن الحرفية لا تنقذ قطعًا خاطئًا.",
    },
    photoUrl: "/media/jury-4.webp",
    country: "EG",
    socials: [{ platform: "linkedin", url: "https://linkedin.com/in/example" }],
    assignedParentCategoryIds: ["film", "digital"],
    languages: ["en", "ar"],
    active: true,
  },
  {
    id: "j-005",
    name: { en: "Idris Lahlou", ar: "إدريس لحلو" },
    title: { en: "Photographer, Casablanca", ar: "مصوّر، الدار البيضاء" },
    company: { en: "Field & Frame", ar: "فيلد آند فريم" },
    bio: {
      en: "Commercial photographer with a studio practice in product work. Looks for the frame that could not have been made by accident.",
      ar: "مصور تجاري له استوديو في تصوير المنتجات. يبحث عن الكادر الذي لا يمكن أن يكون قد وقع مصادفة.",
    },
    photoUrl: "/media/jury-5.webp",
    country: "MA",
    socials: [],
    assignedParentCategoryIds: ["photography"],
    languages: ["en"],
    active: true,
  },
  {
    id: "j-006",
    name: { en: "Maryam Al Suwaidi", ar: "مريم السويدي" },
    title: { en: "Packaging Consultant, Dubai", ar: "مستشارة تغليف، دبي" },
    company: { en: "Bayt Packaging", ar: "بيت التغليف" },
    bio: {
      en: "Packaging designer and structural engineer by training. Judges the object in the hand, not the render.",
      ar: "مصمم تغليف ومهندس إنشائي بالتكوين. يحكم على الشيء في اليد لا على الصورة المُركّبة.",
    },
    photoUrl: "/media/jury-6.webp",
    country: "AE",
    socials: [],
    assignedParentCategoryIds: ["packaging"],
    languages: ["en", "ar"],
    active: true,
  },
];

export const juryCohorts: JuryCohort[] = [
  { cycleId: "cycle-2026", parentCategoryId: "visual-identity", jurorIds: ["j-001", "j-002"], frozenAt: "2026-03-01T00:00:00Z" },
  { cycleId: "cycle-2026", parentCategoryId: "packaging", jurorIds: ["j-006"], frozenAt: "2026-03-01T00:00:00Z" },
  { cycleId: "cycle-2026", parentCategoryId: "type", jurorIds: ["j-002"], frozenAt: "2026-03-01T00:00:00Z" },
  { cycleId: "cycle-2026", parentCategoryId: "photography", jurorIds: ["j-005"], frozenAt: "2026-03-01T00:00:00Z" },
  { cycleId: "cycle-2026", parentCategoryId: "film", jurorIds: ["j-004"], frozenAt: "2026-03-01T00:00:00Z" },
  { cycleId: "cycle-2026", parentCategoryId: "digital", jurorIds: ["j-004"], frozenAt: "2026-03-01T00:00:00Z" },
  { cycleId: "cycle-2026", parentCategoryId: "layout", jurorIds: ["j-001", "j-003"], frozenAt: "2026-03-01T00:00:00Z" },
];

function score(
  id: string,
  jurorId: string,
  entryId: string,
  parentCategoryId: string,
  values: number[],
  weights: number[],
  submittedAt: string | null,
  enteredByAdmin: Score["enteredByAdmin"] = null,
): Score {
  const criterionIds = CRITERION_IDS[parentCategoryId];
  const weightedTotal = values.reduce((sum, v, i) => sum + (v * weights[i]) / 100, 0);

  return {
    id,
    jurorId,
    entryId,
    criterionScores: values.map((value, i) => ({ criterionId: criterionIds[i], score: value })),
    weightedTotal: Math.round(weightedTotal * 10) / 10,
    submittedAt,
    enteredByAdmin,
  };
}

/** Criterion ids per parent, in the same order as taxonomy.ts declares them. */
const CRITERION_IDS: Record<string, string[]> = {
  "visual-identity": [
    "visual-identity-concept",
    "visual-identity-craft",
    "visual-identity-system",
    "visual-identity-distinctiveness",
    "visual-identity-applicability",
  ],
  packaging: ["packaging-concept", "packaging-structure", "packaging-craft", "packaging-shelf-impact", "packaging-sustainability"],
  type: ["type-concept", "type-letterforms", "type-rhythm", "type-technical", "type-range"],
  layout: ["layout-concept", "layout-typography", "layout-grid", "layout-production", "layout-coherence"],
};

const VI_WEIGHTS = [25, 25, 20, 15, 15];
const TYPE_WEIGHTS = [20, 30, 25, 15, 10];
const LAYOUT_WEIGHTS = [20, 25, 25, 15, 15];

export const scores: Score[] = [
  // j-001 — complete across her Visual Identity assignments.
  score("s-001", "j-001", "e-001", "visual-identity", [90, 88, 84, 86, 82], VI_WEIGHTS, "2026-04-02T10:00:00Z"),
  score("s-002", "j-001", "e-013", "visual-identity", [84, 82, 80, 78, 80], VI_WEIGHTS, "2026-04-02T10:20:00Z"),
  score("s-003", "j-001", "e-008", "visual-identity", [70, 68, 66, 72, 64], VI_WEIGHTS, "2026-04-02T10:40:00Z"),

  // j-002 — mid-progress: e-001 scored, e-013 and e-008 still open.
  score("s-004", "j-002", "e-001", "visual-identity", [86, 84, 88, 82, 80], VI_WEIGHTS, "2026-04-05T14:00:00Z"),
  score("s-005", "j-002", "e-003", "type", [74, 72, 70, 68, 76], TYPE_WEIGHTS, "2026-04-05T14:30:00Z"),

  // j-003 — never scored; Admin entered the missing score at period end.
  score("s-006", "j-003", "e-014", "layout", [64, 62, 66, 60, 62], LAYOUT_WEIGHTS, "2026-06-15T20:00:00Z", {
    actor: "admin@gridliners.com",
    at: "2026-06-15T20:00:00Z",
    justification: "Juror unreachable through the scoring period; score entered to complete the cohort.",
  }),
  score("s-007", "j-001", "e-014", "layout", [66, 64, 62, 64, 60], LAYOUT_WEIGHTS, "2026-06-10T09:00:00Z"),
];
