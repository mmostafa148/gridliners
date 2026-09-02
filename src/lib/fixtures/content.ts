import type {
  Announcement,
  CeremonyEdition,
  Faq,
  NewsItem,
  Partner,
  TeamMember,
  Testimonial,
} from "@/lib/api/types";
import { media } from "@/lib/media";

/**
 * Editorial content: the announcement bar, News & Insights, Partners and
 * Testimonials.
 *
 * Separate from the fixtures that seed the mutable store, because none of this
 * is application state. It is what a CMS will own, it is read-only for every
 * screen that touches it, and it is the last thing that should be reachable
 * through `api.__dev.reset()`.
 *
 * Photography is the mockup set in public/images, which CLAUDE.md classifies as
 * placeholder: real event coverage and real partner marks come from the client.
 */

export const announcements: Announcement[] = [
  {
    id: "an-001",
    message: {
      en: "Public voting for the 2026 cycle is open until 30 August.",
      ar: "التصويت العام لدورة 2026 مفتوح حتى 30 أغسطس.",
    },
    linkLabel: { en: "Vote now", ar: "صوّت الآن" },
    href: "/finalists",
    startsAt: "2026-07-01T00:00:00Z",
    endsAt: "2026-08-30T20:00:00Z",
  },
];

export const news: NewsItem[] = [
  {
    // Named for an invented juror, not a real one: this headline puts a
    // position in somebody's mouth, and the panel it draws on is a placeholder.
    id: "n-001",
    slug: "in-conversation-karim-daoud",
    kind: "interview",
    title: {
      en: "In conversation: Karim Daoud on judging without a house style",
      ar: "حوار: كريم داود عن التحكيم دون أسلوب واحد",
    },
    excerpt: {
      en: "The founding member on why a jury of one taste is the fastest way to make an award worthless.",
      ar: "العضو المؤسس يشرح لماذا تُفقد الجائزة قيمتها حين تحكمها ذائقة واحدة.",
    },
    imageUrl: "/media/editorial/design-talk-square.webp",
    ratio: 1,
    publishedAt: "2026-07-22T09:00:00Z",
  },
  {
    id: "n-002",
    slug: "what-verification-actually-checks",
    kind: "interview",
    title: {
      en: "What tier verification actually checks, and why it happens before scoring",
      ar: "ما الذي يتحقق منه فحص الفئة، ولماذا يسبق التحكيم",
    },
    excerpt: {
      en: "A student ranked against agencies is not a competition. Admin walks through the paperwork.",
      ar: "تنافس طالب مع الوكالات ليس تنافسًا. الإدارة تشرح المستندات المطلوبة.",
    },
    imageUrl: "/media/editorial/audience-qa-speaker.webp",
    ratio: 3 / 2,
    publishedAt: "2026-07-09T09:00:00Z",
  },
  {
    id: "n-003",
    slug: "ceremony-2026",
    kind: "event",
    title: {
      en: "Gridliners Awards 2026 ceremony",
      ar: "حفل جوائز جريدلاينرز 2026",
    },
    excerpt: {
      en: "Winners announced live, followed by the Designer of the Year presentation.",
      ar: "إعلان الفائزين مباشرة، يليه تكريم مصمم العام.",
    },
    imageUrl: "/media/editorial/stage-podium.webp",
    ratio: 3 / 2,
    publishedAt: "2026-06-30T09:00:00Z",
    startsAt: "2026-09-15T17:00:00Z",
    venue: { en: "Dubai Design District", ar: "حي دبي للتصميم" },
  },
  {
    id: "n-004",
    slug: "design-talk-october",
    kind: "event",
    title: {
      en: "Design Talk: type in two scripts",
      ar: "حديث تصميم: الحرف في نظامين",
    },
    excerpt: {
      en: "A panel on setting Arabic and Latin together without either one apologising.",
      ar: "جلسة عن صفّ العربية واللاتينية معًا دون أن تعتذر إحداهما عن الأخرى.",
    },
    imageUrl: "/media/editorial/audience-hall.webp",
    ratio: 3 / 2,
    publishedAt: "2026-06-18T09:00:00Z",
    startsAt: "2026-10-06T17:00:00Z",
    venue: { en: "Online", ar: "عبر الإنترنت" },
  },
  {
    id: "n-005",
    slug: "why-the-coordinate-is-on-the-certificate",
    kind: "interview",
    title: {
      en: "Why the coordinate is printed on the certificate",
      ar: "لماذا يُطبع الإحداثي على الشهادة",
    },
    excerpt: {
      en: "Gold is not an award on its own. The design team on putting the group key where a client can read it.",
      ar: "الذهبية وحدها ليست جائزة. فريق التصميم يشرح وضع مفتاح المجموعة حيث يقرأه العميل.",
    },
    imageUrl: "/media/editorial/community-panel.webp",
    ratio: 3 / 2,
    publishedAt: "2026-06-25T09:00:00Z",
  },
  {
    id: "n-006",
    slug: "portfolio-clinic-august",
    kind: "event",
    title: {
      en: "Portfolio clinic: preparing an entry",
      ar: "عيادة الأعمال: تجهيز مشاركتك",
    },
    excerpt: {
      en: "Bring one project. Two jurors read it against the published criteria, out loud.",
      ar: "أحضر مشروعًا واحدًا. يقرأه محكّمان وفق المعايير المعلنة، بصوت مسموع.",
    },
    imageUrl: "/media/editorial/design-talk-square.webp",
    ratio: 1,
    publishedAt: "2026-07-28T09:00:00Z",
    startsAt: "2026-08-20T16:00:00Z",
    venue: { en: "Online", ar: "عبر الإنترنت" },
  },
  {
    id: "n-007",
    slug: "jury-announcement-live",
    kind: "event",
    title: {
      en: "The 2026 jury, announced live",
      ar: "إعلان لجنة تحكيم 2026 مباشرة",
    },
    excerpt: {
      en: "Every juror, the categories they take, and why each one was asked.",
      ar: "كل محكّم، والتصنيفات التي يتولاها، وسبب دعوته.",
    },
    // Not 20_jury-group-press-wall: that file carries an orientation flag, and
    // The supplied PNG carried a conflicting EXIF orientation. The web-sized
    // derivative is re-encoded, so every browser now renders it consistently.
    imageUrl: "/media/editorial/ceremony-speaker-back.webp",
    ratio: 6720 / 4480,
    publishedAt: "2026-07-30T09:00:00Z",
    startsAt: "2026-08-28T17:00:00Z",
    venue: { en: "Online", ar: "عبر الإنترنت" },
  },
  {
    id: "n-008",
    slug: "winners-exhibition-2026",
    kind: "event",
    title: { en: "Winners exhibition opens", ar: "افتتاح معرض الفائزين" },
    excerpt: {
      en: "Every placed project, printed at size, for two weeks.",
      ar: "كل عمل فائز، مطبوعًا بحجمه الكامل، لمدة أسبوعين.",
    },
    imageUrl: "/media/editorial/posters-wall.webp",
    ratio: 3660 / 2880,
    publishedAt: "2026-07-31T09:00:00Z",
    startsAt: "2026-09-20T10:00:00Z",
    venue: { en: "Dubai Design District", ar: "حي دبي للتصميم" },
  },
];

/**
 * The partner wall.
 *
 * **`categoryId` is what the wall groups by, not `tier`.** The Sitemap gives
 * Partners a Categories branch; `tier` is a commercial fact used elsewhere, and
 * a logo wall that scales its marks by spend is a medal table wearing a
 * different hat. Every mark on `/partners` is shown at one weight.
 */
export const partners: Partner[] = [
  {
    id: "p-adobe",
    categoryId: "tools",
    name: "Adobe",
    tier: "principal",
    url: "https://adobe.com",
    logoUrl: "/partners/adobe.svg",
    logoScale: 0.75,
  },
  {
    id: "p-d3",
    categoryId: "districts",
    name: "Dubai Design District",
    tier: "principal",
    url: "https://dubaidesigndistrict.com",
    logoUrl: "/partners/dubai-design-district.svg",
    logoScale: 1.15,
  },
  {
    id: "p-amazon",
    categoryId: "platforms",
    name: "Amazon",
    tier: "partner",
    url: "https://amazon.com",
    logoUrl: "/partners/amazon.svg",
    logoScale: 1.0,
  },
  {
    id: "p-behance",
    categoryId: "platforms",
    name: "Behance",
    tier: "partner",
    url: "https://behance.net",
    logoUrl: "/partners/behance.svg",
    logoScale: 1.2,
  },
  {
    id: "p-aus",
    categoryId: "education",
    name: "American University of Sharjah",
    tier: "partner",
    url: "https://aus.edu",
    logoUrl: "/partners/american-university-of-sharjah.png",
    logoScale: 0.8,
  },
  {
    id: "p-figma",
    categoryId: "tools",
    name: "Figma",
    tier: "supporter",
    url: "https://figma.com",
    logoUrl: "/partners/figma.svg",
    logoScale: 1.2,
  },
  {
    id: "p-canva",
    categoryId: "tools",
    name: "Canva",
    tier: "supporter",
    url: "https://canva.com",
    logoUrl: "/partners/canva.svg",
    logoScale: 1.15,
  },
  {
    id: "p-dribbble",
    categoryId: "platforms",
    name: "Dribbble",
    tier: "supporter",
    url: "https://dribbble.com",
    logoUrl: "/partners/dribbble.svg",
    logoScale: 1.2,
  },
  {
    id: "p-sketch",
    categoryId: "tools",
    name: "Sketch",
    tier: "supporter",
    url: "https://sketch.com",
    logoUrl: "/partners/sketch.svg",
    logoScale: 1.15,
  },
  {
    id: "p-framer",
    categoryId: "tools",
    name: "Framer",
    tier: "supporter",
    url: "https://framer.com",
    logoUrl: "/partners/framer.svg",
    logoScale: 1.1,
  },
  {
    id: "p-webflow",
    categoryId: "tools",
    name: "Webflow",
    tier: "supporter",
    url: "https://webflow.com",
    logoUrl: "/partners/webflow.svg",
    logoScale: 1.15,
  },
  {
    id: "p-wetransfer",
    categoryId: "platforms",
    name: "WeTransfer",
    tier: "supporter",
    url: "https://wetransfer.com",
    logoUrl: "/partners/wetransfer.svg",
    logoScale: 1.1,
  },
  {
    id: "p-vimeo",
    categoryId: "platforms",
    name: "Vimeo",
    tier: "partner",
    url: "https://vimeo.com",
    logoUrl: "/partners/vimeo.svg",
    logoScale: 1.1,
  },
  {
    id: "p-pinterest",
    categoryId: "platforms",
    name: "Pinterest",
    tier: "partner",
    url: "https://pinterest.com",
    logoUrl: "/partners/pinterest.svg",
    logoScale: 1.05,
  },
  // Provisional regional partners. Their marks are drawn by `PartnerMark`
  // rather than supplied as files - see docs/temporary-media.md - and every
  // name, link and category here awaits the client's real partner list.
  { id: "p-tashkeel", name: "Tashkeel", categoryId: "districts", tier: "partner", url: "https://example.com/tashkeel" },
  { id: "p-hayy", name: "Hayy Jameel", categoryId: "districts", tier: "partner", url: "https://example.com/hayy-jameel" },
  { id: "p-alserkal", name: "Alserkal Avenue", categoryId: "districts", tier: "partner", url: "https://example.com/alserkal" },
  { id: "p-misk", name: "Misk Art Institute", categoryId: "districts", tier: "supporter", url: "https://example.com/misk-art" },
  { id: "p-brownbook", name: "Brownbook", categoryId: "media", tier: "partner", url: "https://example.com/brownbook" },
  { id: "p-khatt", name: "Khatt Foundation", categoryId: "media", tier: "partner", url: "https://example.com/khatt" },
  { id: "p-majalla", name: "Majalla Design Review", categoryId: "media", tier: "supporter", url: "https://example.com/majalla-design" },
  { id: "p-nuqta", name: "Nuqta Type Journal", categoryId: "media", tier: "supporter", url: "https://example.com/nuqta" },
  { id: "p-emirates-press", name: "Emirates Press", categoryId: "production", tier: "partner", url: "https://example.com/emirates-press" },
  { id: "p-levant-paper", name: "Levant Paper Mill", categoryId: "production", tier: "supporter", url: "https://example.com/levant-paper" },
  { id: "p-atlas-bindery", name: "Atlas Bindery", categoryId: "production", tier: "supporter", url: "https://example.com/atlas-bindery" },
  { id: "p-gulf-signage", name: "Gulf Signage Works", categoryId: "production", tier: "supporter", url: "https://example.com/gulf-signage" },
  { id: "p-aud", name: "American University in Dubai", categoryId: "education", tier: "partner", url: "https://example.com/aud" },
  { id: "p-jouri", name: "Jouri Design School", categoryId: "education", tier: "supporter", url: "https://example.com/jouri-school" },
  { id: "p-cairo-poly", name: "Cairo Polytechnic of Art", categoryId: "education", tier: "supporter", url: "https://example.com/cairo-poly" },
  { id: "p-riyadh-lab", name: "Riyadh Design Lab", categoryId: "education", tier: "supporter", url: "https://example.com/riyadh-lab" },
];

export const testimonials: Testimonial[] = [
  {
    id: "t-001",
    quote: {
      en: "The coordinate on the certificate is the part that mattered. It says which contest I actually won, and any designer reading it knows exactly what that means.",
      ar: "الإحداثي على الشهادة هو ما يهم فعلًا. فهو يحدد أي منافسة فزت بها، وأي مصمم يقرأه يعرف تمامًا ما يعنيه.",
    },
    author: { en: "Layla Haddad", ar: "ليلى حداد" },
    role: {
      en: "Creative Director, Mizan Studio",
      ar: "مديرة إبداعية، استوديو ميزان",
    },
    imageUrl: "/media/jury-3.webp",
    topic: { en: "Group-scoped results", ar: "نتائج مقيدة بالمجموعة" },
  },
  {
    id: "t-002",
    quote: {
      en: "I entered as a student and was ranked against students. That sounds obvious until you have paid to enter somewhere that does not do it.",
      ar: "قدّمت بصفتي طالبًا وقُيّمت مع الطلاب. يبدو هذا بديهيًا حتى تدفع رسوم جائزة لا تفعله.",
    },
    author: { en: "Noor Al Shammari", ar: "نور الشمري" },
    role: {
      en: "Student, American University of Sharjah",
      ar: "طالبة، الجامعة الأمريكية في الشارقة",
    },
    imageUrl: "/media/jury-6.webp",
    topic: { en: "Declared tiers", ar: "الفئات المعلنة" },
  },
  {
    id: "t-003",
    quote: {
      en: "Scores came back with the criteria attached. It is the first awards feedback I have been able to hand to a client.",
      ar: "وصلت الدرجات ومعها المعايير. إنها أول ملاحظات جوائز أستطيع تسليمها لعميل.",
    },
    author: { en: "Omar Fathi", ar: "عمر فتحي" },
    role: { en: "Independent designer, Cairo", ar: "مصمم مستقل، القاهرة" },
    imageUrl: "/media/jury-5.webp",
    topic: { en: "Scores with criteria", ar: "درجات مع المعايير" },
  },
  {
    id: "t-004",
    quote: {
      en: "I started the entry in the early window and finished it after that window had closed. The price I was quoted at the start is the price I paid.",
      ar: "بدأت المشاركة في نافذة الحجز المبكر وأنهيتها بعد إغلاقها. السعر الذي عُرض عليّ في البداية هو السعر الذي دفعته.",
    },
    author: { en: "Hana Toubia", ar: "هناء طوبية" },
    role: { en: "Art Director, Beirut", ar: "مديرة فنية، بيروت" },
    imageUrl: "/media/jury-portrait-c.jpg",
    topic: { en: "Price held at entry", ar: "السعر مثبّت عند البدء" },
  },
  {
    id: "t-005",
    quote: {
      en: "One vote per project, confirmed by a code sent to your inbox. It is the first public vote I have entered where the number at the end meant something.",
      ar: "صوت واحد لكل مشروع، يُؤكَّد برمز يصل إلى بريدك. إنه أول تصويت عام أشارك فيه ويعني الرقم في نهايته شيئاً.",
    },
    author: { en: "Bilal Amrani", ar: "بلال العمراني" },
    role: { en: "Designer, Casablanca", ar: "مصمم، الدار البيضاء" },
    imageUrl: "/media/jury-1.webp",
    topic: { en: "One vote, verified", ar: "صوت واحد موثّق" },
  },
  {
    id: "t-006",
    quote: {
      en: "I could see where my entry stood at every step, and what had to happen before the next one. I never had to email anyone to ask.",
      ar: "كنت أرى موضع مشاركتي في كل خطوة، وما يجب أن يحدث قبل الخطوة التالية. لم أضطر يوماً لمراسلة أحد للسؤال.",
    },
    author: { en: "Sara Nseir", ar: "سارة نصير" },
    role: { en: "Design Lead, Amman", ar: "مسؤولة تصميم، عمّان" },
    imageUrl: "/media/jury-2.webp",
    topic: { en: "Every state visible", ar: "كل حالة ظاهرة" },
  },
];


/**
 * The people who run the programme.
 *
 * Every name and every role here is invented, and there is no team
 * photography in the repo at all. No governing document names a single member
 * of this team: not the delta, not the addendum, not the consolidated
 * decisions. Invented throughout is the honest state until the client sends
 * the real list, the same position `fixtures/jury.ts` takes about its panel.
 *
 * **Every name here is invented and every handle is a placeholder.** The client
 * has not sent the real team, and this file takes the same position
 * `fixtures/jury.ts` takes about the panel: invented is the honest state until
 * the real list arrives.
 *
 * The portraits were **supplied by the client on 2026-08-13 for these
 * placeholder people**, one per invented name, as a matched greyscale set at
 * 960x1200. That is what makes them usable where the jury's are not: the jury
 * fixture logs `j-001` and `j-002` as photographs of *identifiable* people
 * captioned with invented names, which depicts a stranger as somebody else.
 * These were commissioned for the names they carry.
 *
 * **Provenance still has to be confirmed before launch** — whether each frame
 * is synthetic or a licensed shoot, and on what terms. Recorded in build-state
 * §9 rather than assumed here.
 *
 * The handles are constructed under the organisation's own namespace and are
 * not expected to resolve. They must be replaced or nulled before launch — a
 * link pointing at a stranger's account is worse than no link, which is why
 * `links` is nullable per network and a null renders nothing.
 */
export const team: TeamMember[] = [
  {
    id: "t-001",
    name: { en: "Layla Haddad", ar: "ليلى حداد" },
    role: { en: "Programme Director", ar: "مديرة البرنامج" },
    bio: {
      en: "Runs the cycle end to end and chairs the jury briefing.",
      ar: "تدير الدورة من أولها إلى آخرها وتترأس اجتماع لجنة التحكيم.",
    },
    order: 1,
    photoUrl: "/media/team-layla-haddad.webp",
    links: {
      linkedin: "https://linkedin.com/in/gridliners-layla-haddad",
      instagram: "https://instagram.com/gridliners.layla",
    },
  },
  {
    id: "t-002",
    name: { en: "Omar Nasser", ar: "عمر ناصر" },
    role: { en: "Head of Judging", ar: "رئيس التحكيم" },
    bio: {
      en: "Assembles the panel, assigns categories and holds the criteria.",
      ar: "يشكّل اللجنة ويوزّع الفئات ويضبط معايير التقييم.",
    },
    order: 2,
    photoUrl: "/media/team-omar-nasser.webp",
    links: {
      linkedin: "https://linkedin.com/in/gridliners-omar-nasser",
      instagram: null,
    },
  },
  {
    id: "t-003",
    name: { en: "Rana Khalil", ar: "رنا خليل" },
    role: { en: "Entries and Verification", ar: "المشاركات والتحقق" },
    bio: {
      en: "Checks declared tiers against proofs before judging opens.",
      ar: "تتحقق من الفئة المعلنة مقابل الإثباتات قبل فتح التحكيم.",
    },
    order: 3,
    photoUrl: "/media/team-rana-khalil.webp",
    links: {
      linkedin: "https://linkedin.com/in/gridliners-rana-khalil",
      instagram: "https://instagram.com/gridliners.rana",
    },
  },
  {
    id: "t-004",
    name: { en: "Yusuf Amari", ar: "يوسف عماري" },
    role: { en: "Partnerships", ar: "الشراكات" },
    bio: {
      en: "Works with the partners and sponsors who fund the cycle.",
      ar: "يعمل مع الشركاء والرعاة الذين يدعمون الدورة.",
    },
    order: 4,
    photoUrl: "/media/team-yusuf-amari.webp",
    links: {
      linkedin: "https://linkedin.com/in/gridliners-yusuf-amari",
      instagram: "https://instagram.com/gridliners.yusuf",
    },
  },
  {
    id: "t-005",
    name: { en: "Dina Saab", ar: "دينا صعب" },
    role: { en: "Ceremony and Production", ar: "الحفل والإنتاج" },
    bio: {
      en: "Plans the annual ceremony and the winners' materials.",
      ar: "تخطط للحفل السنوي ولمواد الفائزين.",
    },
    order: 5,
    photoUrl: "/media/team-dina-saab.webp",
    links: {
      linkedin: "https://linkedin.com/in/gridliners-dina-saab",
      instagram: "https://instagram.com/gridliners.dina",
    },
  },
  {
    id: "t-006",
    name: { en: "Karim Fahmy", ar: "كريم فهمي" },
    role: { en: "Communications", ar: "التواصل" },
    bio: {
      en: "Publishes the cycle: announcements, news and the archive.",
      ar: "ينشر أخبار الدورة: الإعلانات والأخبار والأرشيف.",
    },
    order: 6,
    photoUrl: "/media/team-karim-fahmy.webp",
    links: {
      linkedin: null,
      instagram: "https://instagram.com/gridliners.karim",
    },
  },
];


/**
 * The annual ceremony, by year.
 *
 * The photographs are real: `src/lib/media.ts` records them as client-supplied
 * coverage of an actual Gridliners event, and they are the one part of this
 * fixture that is not provisional.
 *
 * The cities and venues are NOT. No governing document names a city any
 * edition was held in. These are placeholders chosen only to exercise the
 * bilingual layout, and they must be replaced before launch. `year` joins to
 * `Cycle.year`, so the three rows line up with the three cycles in
 * `fixtures/cycles.ts`.
 *
 * **Which year a photograph belongs to is also NOT established.** The frames
 * are real coverage of a real Gridliners event; nothing records which edition
 * any of them was shot at. The distribution below exists to give each year a
 * distinct gallery, and it is a placeholder awaiting the client's confirmation
 * exactly as the cities are. No screen may caption a frame as documented
 * coverage of the year it happens to sit under.
 *
 * **How many frames a year has is placeholder too.** Six event frames exist in
 * `public/media` for three editions, so every year here carries two at most.
 * That is the asset set, not a design decision, and the galleries are built to
 * scale the day the client delivers real per-year coverage.
 *
 * **`media.postersWall` is excluded from every gallery and must stay
 * excluded.** It shows the "Meet the Jury" poster art legibly, and that art
 * carries Mohamed Selwaye and Rayan Abdullah - the two identifiable people
 * whose portrait files this build may never publish. Publishing their faces and
 * names through a photograph of a wall breaks the same rule by another route.
 *
 * **`media.awardMoment` is excluded from any year that is not yet resolved**
 * (narrowed 2026-08-26; it was excluded from the whole of 1.6 before). It
 * carries the word BRONZE and a category on the screen behind it, and the
 * reason first written for that exclusion was that "1.6 is the screen where
 * nothing is decided yet" - which is true only of the running year. On 2024 and
 * 2025 the results are long published, so a frame of a medal being conferred
 * documents that night rather than pre-empting 1.7, and it puts no award data
 * into the markup either: the leak assertions read HTML, and a photograph is
 * pixels. It stays off the open year, where it would show a decision that has
 * not been taken.
 *
 * **`cityImage` carries a placeholder on 2026 and null elsewhere.** No city
 * frame existed in the asset set at all - the closest were two unused campaign
 * composites, and both show people rather than a place - so a CC0 skyline was
 * sourced on 2026-08-26 to fill the finalists hero (`media.cityDubai` records
 * where it came from and why that licence). It is a placeholder like the cities
 * and venues around it, and **the client's own city photography replaces it**.
 * The archived years take none: their hero is the ceremony photograph itself.
 *
 * **`videoUrl` is null on every row and no video is invented.** The client has
 * supplied no ceremony film and there is no video file in the repository. The
 * field exists so the capability is typed and ready; a screen renders the film
 * when one arrives and omits the slot entirely until then.
 */
export const ceremonies: CeremonyEdition[] = [
  {
    id: "cer-2026",
    year: 2026,
    city: { en: "Dubai", ar: "دبي" },
    venue: { en: "Venue to be announced", ar: "المكان يُعلن لاحقاً" },
    // `image` is kept although the finalists screen renders no photography for
    // a ceremony that has not happened: About's `CeremonyGallery` reads this
    // field for all three editions, and that screen is approved and closed.
    image: media.ceremonyStage,
    // The host city, not the night. See `media.cityDubai` for provenance: it is
    // a CC0 placeholder standing in until the client supplies their own.
    cityImage: media.cityDubai,
    videoUrl: null,
    // Empty, and that is the point. The night has not taken place, so there is
    // nothing to have covered.
    gallery: [],
  },
  {
    id: "cer-2025",
    year: 2025,
    city: { en: "Amman", ar: "عمّان" },
    venue: null,
    image: media.winnersStage,
    cityImage: null,
    videoUrl: null,
    // Was `audienceHall`, which is 2024's own hero frame: one photograph stood
    // as coverage of two different nights. Every frame now appears under
    // exactly one year.
    gallery: [media.communityPanel],
  },
  {
    id: "cer-2024",
    year: 2024,
    city: { en: "Cairo", ar: "القاهرة" },
    venue: null,
    image: media.audienceHall,
    cityImage: null,
    videoUrl: null,
    gallery: [media.awardMoment],
  },
];

/**
 * The FAQ list.
 *
 * The selection is provisional and the client will replace it, but every
 * answer here is true of the platform as built rather than invented: the
 * windows, the tier proofs, the refund position, the voting mechanism and the
 * language rule are all documented and all implemented. Nothing in this list
 * makes a claim the site cannot keep.
 */
export const faqs: Faq[] = [
  {
    id: "faq-001",
    question: { en: "Who can enter?", ar: "من يمكنه المشاركة؟" },
    answer: {
      en: "Anyone working in design in the region, in one of three tiers: students, freelancers, or companies and agencies. You declare your tier when you enter and it is verified against your proof before judging opens.",
      ar: "كل من يعمل في التصميم في المنطقة، ضمن ثلاث فئات: الطلاب، والمستقلون، والشركات والوكالات. تختار فئتك عند التقديم ويجري التحقق منها مقابل إثباتك قبل فتح التحكيم.",
    },
    order: 1,
  },
  {
    id: "faq-002",
    question: {
      en: "Does it cost more to enter late?",
      ar: "هل تزيد التكلفة عند التقديم المتأخر؟",
    },
    answer: {
      en: "Yes. Each tier has three prices, one per submission window, and the price is fixed at checkout. The full table and the window dates are on the How to Enter page.",
      ar: "نعم. لكل فئة ثلاثة أسعار، سعر لكل نافذة تقديم، ويُثبَّت السعر عند الدفع. الجدول الكامل ومواعيد النوافذ في صفحة كيفية المشاركة.",
    },
    order: 2,
  },
  {
    id: "faq-003",
    question: {
      en: "Can one project enter more than one category?",
      ar: "هل يمكن تقديم المشروع في أكثر من فئة؟",
    },
    answer: {
      en: "Yes, within the same parent category. The entry price covers one sub-category and each additional one has its own fee.",
      ar: "نعم، ضمن الفئة الرئيسية نفسها. يشمل سعر المشاركة فئة فرعية واحدة، ولكل فئة إضافية رسم خاص بها.",
    },
    order: 3,
  },
  {
    id: "faq-004",
    question: { en: "How are winners decided?", ar: "كيف يُختار الفائزون؟" },
    answer: {
      en: "An assigned jury scores every entry against published criteria. Entries that pass their tier's threshold become finalists, and the public vote then ranks them inside each sub-category and tier.",
      ar: "تُقيّم لجنة مخصصة كل مشاركة وفق معايير منشورة. وتصبح المشاركات التي تتجاوز عتبة فئتها مرشحة نهائية، ثم يرتّبها التصويت العام داخل كل فئة فرعية وفئة مشاركة.",
    },
    order: 4,
  },
  {
    id: "faq-005",
    question: {
      en: "Do I need an account to vote?",
      ar: "هل أحتاج حساباً للتصويت؟",
    },
    answer: {
      en: "No. Voting takes an email address and a code sent to it. One vote per project per email.",
      ar: "لا. يحتاج التصويت إلى بريد إلكتروني ورمز يُرسل إليه. صوت واحد لكل مشروع لكل بريد.",
    },
    order: 5,
  },
  {
    id: "faq-006",
    question: {
      en: "Can I submit in Arabic?",
      ar: "هل يمكنني التقديم بالعربية؟",
    },
    answer: {
      en: "Yes. Write your entry in Arabic or English and it is published in the language you wrote it in. Entries are never translated for you.",
      ar: "نعم. اكتب مشاركتك بالعربية أو الإنجليزية وتُنشر باللغة التي كتبتها بها. ولا تُترجم المشاركات نيابة عنك.",
    },
    order: 6,
  },
  {
    id: "faq-007",
    question: {
      en: "Are entry fees refundable?",
      ar: "هل رسوم المشاركة قابلة للاسترداد؟",
    },
    answer: {
      en: "Fees are final once an entry is submitted and paid. Drafts cost nothing. The full refund position is in the terms.",
      ar: "تصبح الرسوم نهائية بمجرد تقديم المشاركة ودفعها. أما المسودات فمجانية. وموقف الاسترداد كاملاً في الشروط.",
    },
    order: 7,
  },
];
