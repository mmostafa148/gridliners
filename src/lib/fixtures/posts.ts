import type { LocalizedText, NewsItem, NewsKind, PostCategory, PostSection } from "@/lib/api/types";
import { news as legacyNews } from "@/lib/fixtures/content";
import { CATEGORY_SECTIONS, KIND_CLOSING } from "@/lib/fixtures/post-content";
import { NEWS_COVERS } from "@/lib/news-media";

/**
 * The media centre's records: news, articles and winner interviews.
 *
 * **One content type, three public kinds**, exactly as the Sitemap's Media
 * Center branch and content-map §1.11 describe them. There is no `/blog` route
 * and no `/winner-interviews` route, because neither the Sitemap nor the screen
 * map asks for one: both are kinds inside `/news`.
 *
 * The five dated **events** that predate this file are carried in unchanged
 * from `content.ts` - Home reads them - and are filed under Programme News so
 * they answer a category filter like everything else.
 *
 * **Every record here is provisional**, and `docs/temporary-media.md` says so.
 * The titles, standfirsts and openings are written for this build; the
 * movements beneath them come from `post-content.ts` per category.
 */

const t = (en: string, ar: string): LocalizedText => ({ en, ar });

export const postCategories: PostCategory[] = [
  { id: "judging", slug: "judging", name: t("Judging & Criteria", "التحكيم والمعايير") },
  { id: "craft", slug: "craft", name: t("Craft & Process", "الحرفة والتنفيذ") },
  { id: "programme", slug: "programme", name: t("Programme News", "أخبار البرنامج") },
  { id: "region", slug: "region", name: t("Design in the Region", "التصميم في المنطقة") },
  { id: "studio", slug: "studio", name: t("Studio Practice", "ممارسة الاستوديو") },
  { id: "education", slug: "education", name: t("Students & Education", "الطلاب والتعليم") },
];

interface Person {
  name: LocalizedText;
  role: LocalizedText;
}

interface Spec {
  slug: string;
  kind: NewsKind;
  cat: string;
  date: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  lead: LocalizedText;
  person?: Person;
}

/**
 * Every invented person here is invented, and their portrait is **drawn**.
 * Putting a real face beside a name nobody holds misrepresents somebody who
 * never agreed to appear on this site, so no photograph of a human being is
 * used for anyone in this file.
 */
const SPECS: Spec[] = [
  // ---- Programme news -----------------------------------------------------
  { slug: "2026-entries-open", kind: "news", cat: "programme", date: "2025-11-15T08:00:00Z",
    title: t("Entries open for the 2026 cycle", "فتح باب المشاركة لدورة 2026"),
    excerpt: t("Early-bird pricing runs to 14 December, and the three tiers are unchanged.", "يستمر السعر المبكر حتى 14 ديسمبر، والفئات الثلاث دون تغيير."),
    lead: t("Submissions for the 2026 cycle opened this morning and close on 15 February. Early-bird pricing runs to 14 December, normal pricing to 31 January, and a late window closes the season.", "فُتح باب المشاركة لدورة 2026 صباح اليوم ويُغلق في 15 فبراير. يستمر السعر المبكر حتى 14 ديسمبر، والسعر العادي حتى 31 يناير، ثم تُغلق نافذة متأخرة الموسم.") },
  { slug: "verification-window-2026", kind: "news", cat: "programme", date: "2026-02-20T08:00:00Z",
    title: t("Tier verification begins for 2026", "بدء التحقق من الفئات لدورة 2026"),
    excerpt: t("Every entry is checked against the tier it was entered in before any juror reads it.", "تُفحص كل مشاركة مقابل الفئة التي دخلت بها قبل أن يقرأها أي محكّم."),
    lead: t("Verification opened this week. Entrants who declared a tier that the paperwork does not support are contacted directly, and a correction before scoring costs nothing.", "بدأ التحقق هذا الأسبوع. ويُتواصل مباشرة مع من أعلنوا فئة لا تدعمها المستندات، وتصحيحها قبل التحكيم لا يكلّف شيئًا.") },
  { slug: "jury-2026-announced", kind: "news", cat: "programme", date: "2026-03-01T09:00:00Z",
    title: t("The 2026 jury is announced", "الإعلان عن لجنة تحكيم 2026"),
    excerpt: t("Nineteen jurors across seven categories, with every conflict of interest declared.", "تسعة عشر محكّمًا في سبع فئات، مع إعلان كل تضارب مصالح."),
    lead: t("The panel for 2026 is published in full on the Jury page, with each juror's category assignment and declared conflicts listed beside their name.", "نُشرت لجنة 2026 كاملةً في صفحة لجنة التحكيم، مع تصنيف كل محكّم وتضارب المصالح المعلن بجانب اسمه.") },
  { slug: "public-voting-opens-2026", kind: "news", cat: "programme", date: "2026-06-20T08:00:00Z",
    title: t("Public voting opens on the 2026 shortlist", "فتح التصويت العام على قائمة 2026"),
    excerpt: t("One vote per project per email, confirmed by a code. No account is created.", "صوت واحد لكل مشروع لكل بريد، يؤكَّد برمز. ولا يُنشأ أي حساب."),
    lead: t("Voting is open on all 372 shortlisted projects. A vote is confirmed by a code sent to an email address, and the address is never used for anything else.", "التصويت مفتوح على 372 مشروعًا متأهلًا. ويُؤكَّد الصوت برمز يُرسل إلى بريد إلكتروني، ولا يُستخدم ذلك البريد لأي غرض آخر.") },
  { slug: "results-2025-published", kind: "news", cat: "programme", date: "2025-09-18T16:00:00Z",
    title: t("The 2025 results are published", "نشر نتائج 2025"),
    excerpt: t("Fourteen medals across five groups, and three honorary awards.", "أربع عشرة ميدالية في خمس مجموعات، وثلاث جوائز فخرية."),
    lead: t("Results for the 2025 cycle are live. Every awarded group is published with its medal; where a place was withheld it is simply not awarded, and no explanation stands in for it.", "نتائج دورة 2025 متاحة الآن. تُنشر كل مجموعة ممنوحة مع ميداليتها، وحين يُحجب مركز فإنه لا يُمنح ببساطة، ولا يحلّ أي تفسير محلّه.") },
  { slug: "fee-structure-2026", kind: "news", cat: "programme", date: "2025-10-30T08:00:00Z",
    title: t("What an entry costs in 2026, and why", "كم تكلّف المشاركة في 2026 ولماذا"),
    excerpt: t("Base entry, add-on groups and the student rate, set out before entries open.", "المشاركة الأساسية والمجموعات الإضافية وسعر الطلاب، محددة قبل فتح الباب."),
    lead: t("Pricing for 2026 is published before entries open, as it is every year. A price is locked to an entry at checkout, so a window closing mid-submission never changes what somebody already agreed to pay.", "نُشر تسعير 2026 قبل فتح باب المشاركة، كما في كل عام. ويُثبَّت السعر للمشاركة عند الدفع، فإغلاق نافذة أثناء التقديم لا يغيّر ما وافق عليه المشارك.") },
  { slug: "cycle-2024-archive", kind: "news", cat: "programme", date: "2025-01-12T08:00:00Z",
    title: t("The 2024 edition moves to the archive", "انتقال دورة 2024 إلى الأرشيف"),
    excerpt: t("Every finalist page from 2024 stays addressable, with its count and its groups.", "تبقى كل صفحة متأهل من 2024 قابلة للوصول بعددها ومجموعاتها."),
    lead: t("The 2024 cycle is now archived. Nothing is removed: every project page, medal and vote count stays exactly where it was, because a reference that disappears is not a reference.", "أُرشفت دورة 2024. ولم يُحذف شيء: تبقى كل صفحة مشروع وميدالية وعدد أصوات في مكانها تمامًا، لأن مرجعًا يختفي ليس مرجعًا.") },
  { slug: "ceremony-city-2026", kind: "news", cat: "programme", date: "2026-05-05T08:00:00Z",
    title: t("The 2026 ceremony moves to Dubai Design District", "حفل 2026 ينتقل إلى حي دبي للتصميم"),
    excerpt: t("A larger hall, and the winners' exhibition runs for a week afterwards.", "قاعة أكبر، ويستمر معرض الفائزين أسبوعًا بعده."),
    lead: t("This year's ceremony moves to a larger hall, and for the first time the winners' exhibition stays open for a week afterwards rather than a single evening.", "ينتقل حفل هذا العام إلى قاعة أكبر، ولأول مرة يبقى معرض الفائزين مفتوحًا أسبوعًا كاملًا بدل أمسية واحدة.") },
  { slug: "arabic-first-entry-form", kind: "news", cat: "programme", date: "2026-01-08T08:00:00Z",
    title: t("The entry form now accepts Arabic-first submissions", "نموذج المشاركة يقبل الآن التقديم بالعربية أولًا"),
    excerpt: t("Write the entry in the language the work was made in. Nothing is translated for judging.", "اكتب المشاركة باللغة التي صُنع بها العمل. ولا يُترجم شيء لأغراض التحكيم."),
    lead: t("An entry can now be written in Arabic throughout, and it is judged in the language it was written in. Nothing is machine-translated before a juror reads it.", "يمكن الآن كتابة المشاركة بالعربية بالكامل، وتُحكَّم باللغة التي كُتبت بها. ولا يُترجم شيء آليًا قبل أن يقرأه المحكّم.") },
  { slug: "student-rate-extended", kind: "news", cat: "education", date: "2026-01-22T08:00:00Z",
    title: t("The student rate is extended to graduating cohorts", "تمديد سعر الطلاب لدفعات التخرج"),
    excerpt: t("Work made as coursework stays student work, even if the degree finished in between.", "العمل المنجز ضمن المقررات يبقى عمل طالب، حتى لو انتهت الدراسة بعده."),
    lead: t("A graduate entering work they made while enrolled now keeps the student rate and the student tier. What matters is when the work was made, not when the form was filled in.", "الخريج الذي يقدّم عملًا أنجزه أثناء دراسته يحتفظ الآن بسعر الطلاب وفئتهم. فالمهم متى أُنجز العمل لا متى مُلئ النموذج.") },
  { slug: "portfolio-clinics-return", kind: "news", cat: "education", date: "2026-04-14T08:00:00Z",
    title: t("Portfolio clinics return, in Amman and online", "عودة عيادات المحفظة في عمّان وعبر الإنترنت"),
    excerpt: t("Thirty-minute reviews with jurors from previous cycles. Free, and not part of judging.", "مراجعات من ثلاثين دقيقة مع محكّمين من دورات سابقة. مجانية وخارج التحكيم."),
    lead: t("Clinics run again this spring. Reviewers are jurors from earlier cycles and never from the current one, so nothing said in a clinic can touch a live entry.", "تعود العيادات هذا الربيع. والمراجعون محكّمون من دورات سابقة لا من الدورة الحالية، فلا يمكن لما يُقال في عيادة أن يمسّ مشاركة قائمة.") },
  { slug: "partners-2026-announced", kind: "news", cat: "programme", date: "2026-02-02T08:00:00Z",
    title: t("This year's partners, and what each one actually does", "شركاء هذا العام وما يقدّمه كل منهم"),
    excerpt: t("Every partnership is listed with its contribution. None of them touches judging.", "تُدرج كل شراكة مع مساهمتها. ولا تمسّ أي منها التحكيم."),
    lead: t("Partners for 2026 are published with what each contributes - venue, production, tools or teaching time. No partner sees an entry before results, and none sits on a jury.", "نُشر شركاء 2026 مع مساهمة كل منهم: مكان أو إنتاج أو أدوات أو وقت تدريس. ولا يرى أي شريك مشاركة قبل النتائج، ولا يجلس أي منهم في لجنة.") },
  { slug: "accessibility-pass-site", kind: "news", cat: "programme", date: "2026-03-19T08:00:00Z",
    title: t("An accessibility pass across the whole site", "مراجعة شاملة لسهولة الوصول في الموقع"),
    excerpt: t("Contrast, focus order and Arabic mirroring, checked on every public page.", "التباين وترتيب التركيز والانعكاس العربي، مفحوصة في كل صفحة عامة."),
    lead: t("Every public page has been measured for contrast against its own composited pixels, checked for focus order, and verified to mirror properly in Arabic rather than merely translate.", "قيست كل صفحة عامة من حيث التباين مقابل بكسلاتها المركّبة، وفُحص ترتيب التركيز، وتُحقّق من انعكاسها الصحيح بالعربية لا مجرد ترجمتها.") },

  // ---- Articles -----------------------------------------------------------
  { slug: "four-criteria-explained", kind: "article", cat: "judging", date: "2026-03-11T09:00:00Z",
    title: t("The four criteria, and what each one is really asking", "المعايير الأربعة وما يسأل عنه كل منها حقًا"),
    excerpt: t("Brief, idea, execution, outcome. Most lost points are lost on the first and the last.", "الموجز، والفكرة، والتنفيذ، والأثر. ومعظم النقاط تُفقد في الأول والأخير."),
    lead: t("Entrants tend to over-prepare the idea and under-prepare the brief and the outcome. Those are two of the four, and they are the two a juror cannot infer from a picture.", "يميل المشاركون إلى المبالغة في إعداد الفكرة وإهمال الموجز والأثر. وهما اثنان من أربعة، وهما ما لا يستطيع المحكّم استنتاجه من صورة.") },
  { slug: "why-tiers-not-experience", kind: "article", cat: "judging", date: "2026-02-11T09:00:00Z",
    title: t("Why the award splits by tier and not by years of experience", "لماذا تنقسم الجائزة بالفئة لا بسنوات الخبرة"),
    excerpt: t("Experience is unverifiable. Enrolment and a trade licence are not.", "الخبرة غير قابلة للتحقق، أما القيد الجامعي والرخصة التجارية فقابلان."),
    lead: t("A tier has to be checkable by somebody who has never met the entrant. Enrolment, a licence and a headcount can be evidenced; a claim of seniority cannot.", "على الفئة أن تكون قابلة للفحص من شخص لم يلتقِ المشارك قط. فالقيد الجامعي والرخصة وعدد الموظفين يمكن إثباتها، أما ادعاء الأقدمية فلا.") },
  { slug: "reading-a-tiebreak", kind: "article", cat: "judging", date: "2026-07-02T09:00:00Z",
    title: t("How a tie is broken, step by step", "كيف يُفضّ التعادل خطوة بخطوة"),
    excerpt: t("The criteria are read in a fixed order. Public votes are not part of it.", "تُقرأ المعايير بترتيب ثابت. والأصوات العامة ليست جزءًا منه."),
    lead: t("When two entries in a group finish level, the tiebreak reads execution first, then the brief, then the outcome. Public votes never enter the calculation.", "حين يتعادل عملان في مجموعة، يقرأ فضّ التعادل التنفيذ أولًا، ثم الموجز، ثم الأثر. ولا تدخل الأصوات العامة في الحساب إطلاقًا.") },
  { slug: "what-a-withheld-place-means", kind: "article", cat: "judging", date: "2026-08-06T09:00:00Z",
    title: t("What it means when a place is withheld", "ماذا يعني حجب مركز"),
    excerpt: t("Not a fourth level, and not a comment on the entries that did compete.", "ليس مستوى رابعًا ولا تعليقًا على المشاركات التي تنافست."),
    lead: t("A group can award gold, silver and bronze - or fewer. A withheld place is simply not awarded, and the site publishes no note explaining the absence.", "قد تمنح المجموعة الذهب والفضة والبرونز، أو أقل. والمركز المحجوب لا يُمنح ببساطة، ولا ينشر الموقع أي ملاحظة تفسّر غيابه.") },
  { slug: "bilingual-layout-that-holds", kind: "article", cat: "craft", date: "2026-04-23T09:00:00Z",
    title: t("A bilingual layout that holds at both ends", "تخطيط ثنائي اللغة يصمد من الطرفين"),
    excerpt: t("Mirroring is structural. Swapping a margin is not mirroring.", "الانعكاس بنيوي. وتبديل هامش ليس انعكاسًا."),
    lead: t("The layouts that survive a jury are the ones built on logical properties from the start. The ones that fail are the ones where Arabic was a final pass over a layout that had already been decided.", "التخطيطات التي تصمد أمام لجنة هي التي بُنيت على خصائص منطقية منذ البداية. والتي تفشل هي التي كانت العربية فيها مرحلة أخيرة فوق تخطيط اتُّخذ قراره سلفًا.") },
  { slug: "type-that-survives-production", kind: "article", cat: "craft", date: "2026-05-14T09:00:00Z",
    title: t("Type that survives production", "خطوط تصمد أمام الإنتاج"),
    excerpt: t("A specimen proves an intention. A print sheet proves a decision.", "النموذج يثبت نية، وورقة الطباعة تثبت قرارًا."),
    lead: t("Jurors are asked to look at the join, and the join is where type usually fails: at the size it will actually be set, on the substrate it will actually be printed on.", "يُطلب من المحكّمين النظر إلى المفصل، وعنده غالبًا يفشل الخط: عند الحجم الذي سيُضبط به فعلًا، وعلى السطح الذي سيُطبع عليه فعلًا.") },
  { slug: "the-brief-as-evidence", kind: "article", cat: "studio", date: "2026-06-04T09:00:00Z",
    title: t("Write the brief you were given, not the one you wish you had", "اكتب الموجز الذي أُعطي لك لا الذي تتمناه"),
    excerpt: t("A hard problem solved modestly beats an easy problem solved beautifully.", "مشكلة صعبة حُلّت بتواضع تتفوق على مشكلة سهلة حُلّت ببراعة."),
    lead: t("The brief field is read first and it is read literally. Entrants who rewrite the brief to flatter the outcome lose the one piece of context that would have explained their constraint.", "يُقرأ حقل الموجز أولًا ويُقرأ حرفيًا. ومن يعيد كتابة الموجز ليجمّل النتيجة يفقد السياق الوحيد الذي كان سيفسّر قيده.") },
  { slug: "credits-are-not-decoration", kind: "article", cat: "studio", date: "2026-06-25T09:00:00Z",
    title: t("Credits are read, and they matter later", "الاعتمادات تُقرأ، وتهم لاحقًا"),
    excerpt: t("The archive outlives the cycle. Name the people who did the work.", "الأرشيف يبقى بعد الدورة. اذكر من أنجزوا العمل."),
    lead: t("A studio may enter, but the record carries practitioners' names. Three years from now the archive is what somebody searches when they are hiring, and an uncredited contributor is invisible in it.", "قد يشارك الاستوديو، لكن السجل يحمل أسماء الممارسين. وبعد ثلاث سنوات يكون الأرشيف ما يبحث فيه من يوظّف، والمساهم غير المذكور غير مرئي فيه.") },
  { slug: "entering-the-right-group", kind: "article", cat: "studio", date: "2026-01-29T09:00:00Z",
    title: t("The most avoidable loss is the wrong group", "أكثر الخسائر قابلية للتفادي هي المجموعة الخطأ"),
    excerpt: t("The group decides which criteria carry weight. Read it before the deadline.", "المجموعة تحدد أي المعايير يحمل وزنًا. اقرأها قبل الموعد النهائي."),
    lead: t("Strong work loses every cycle because it was entered where its strengths do not count. The sub-category description is short, it is published months ahead, and it governs the score.", "تخسر أعمال قوية في كل دورة لأنها شاركت حيث لا تُحتسب مواطن قوتها. ووصف التصنيف الفرعي قصير، ويُنشر قبل أشهر، وهو الذي يحكم الدرجة.") },
  { slug: "design-in-the-gulf-2026", kind: "article", cat: "region", date: "2026-05-28T09:00:00Z",
    title: t("What the 2026 entries say about design in the Gulf", "ماذا تقول مشاركات 2026 عن التصميم في الخليج"),
    excerpt: t("More signage, more Arabic type commissioning, fewer imported systems.", "لافتات أكثر، وتكليفات خطوط عربية أكثر، وأنظمة مستوردة أقل."),
    lead: t("Across 372 shortlisted projects the clearest shift is commissioning: more studios are having Arabic type drawn for a project rather than adapting a family that was never meant to carry it.", "عبر 372 مشروعًا متأهلًا، أوضح تحوّل هو في التكليف: استوديوهات أكثر تطلب رسم خط عربي للمشروع بدل تكييف عائلة لم تُصمَّم لحمله.") },
  { slug: "why-a-regional-award", kind: "article", cat: "region", date: "2025-12-03T09:00:00Z",
    title: t("Why a regional award, when international ones exist", "لماذا جائزة إقليمية والجوائز الدولية موجودة"),
    excerpt: t("Not a softer standard. A standard written where the work is made.", "ليس معيارًا أليَن، بل معيارًا يُكتب حيث يُصنع العمل."),
    lead: t("The case for a regional award is not that international judging is unfair. It is that a jury which has never specified bilingual signage cannot weigh how hard it was to get right.", "حجة الجائزة الإقليمية ليست أن التحكيم الدولي غير عادل، بل أن لجنة لم تحدد يومًا مواصفات لافتات ثنائية اللغة لا تستطيع وزن صعوبة إتقانها.") },
  { slug: "print-in-a-two-week-turnaround", kind: "article", cat: "region", date: "2026-07-16T09:00:00Z",
    title: t("Print, in a two-week turnaround", "الطباعة في مهلة أسبوعين"),
    excerpt: t("Regional production constraints are real, and jurors are told to account for them.", "قيود الإنتاج الإقليمية حقيقية، ويُطلب من المحكّمين مراعاتها."),
    lead: t("A studio that got a five-colour job through a regional press in a fortnight has solved a problem the render does not show. The entry form has a field for exactly that.", "الاستوديو الذي أنجز عملًا بخمسة ألوان عبر مطبعة إقليمية في أسبوعين حلّ مشكلة لا تظهر في الصورة. ولنموذج المشاركة حقل مخصص لذلك تحديدًا.") },
  { slug: "student-entries-what-changes", kind: "article", cat: "education", date: "2026-02-26T09:00:00Z",
    title: t("What actually changes when you enter as a student", "ما الذي يتغير فعلًا حين تشارك بصفتك طالبًا"),
    excerpt: t("The criteria do not change. The expectation of budget and access does.", "المعايير لا تتغير، أما توقّع الميزانية وسهولة الوصول فيتغير."),
    lead: t("Students are judged on the same four criteria. What differs is that a juror reading a student entry is not expecting a production budget behind it.", "يُحكَّم الطلاب وفق المعايير الأربعة نفسها. والفرق أن المحكّم الذي يقرأ مشاركة طالب لا يتوقع ميزانية إنتاج خلفها.") },
  { slug: "coursework-counts", kind: "article", cat: "education", date: "2026-04-02T09:00:00Z",
    title: t("Coursework counts, and group projects do too", "أعمال المقررات تُحتسب، والمشاريع الجماعية كذلك"),
    excerpt: t("Bring the working files, and credit everyone who touched it.", "أحضر ملفات العمل، واذكر كل من شارك فيه."),
    lead: t("Two questions arrive from tutors every year, and the answer to both is yes - with conditions that are about evidence rather than about permission.", "يصل سؤالان من المدرّسين كل عام، والإجابة عن كليهما نعم، بشروط تتعلق بالإثبات لا بالإذن.") },
  { slug: "resubmitting-work", kind: "article", cat: "education", date: "2026-08-13T09:00:00Z",
    title: t("Should you enter the same project twice?", "هل تشارك بالمشروع نفسه مرتين؟"),
    excerpt: t("The archive is public. A jury will read a resubmission as a resubmission.", "الأرشيف عام، واللجنة ستقرأ إعادة التقديم على أنها إعادة تقديم."),
    lead: t("Nothing forbids it. But every earlier cycle stays published, and a juror who searches the project name will find the version that did not place.", "لا شيء يمنع ذلك، لكن كل دورة سابقة تبقى منشورة، والمحكّم الذي يبحث عن اسم المشروع سيجد النسخة التي لم تحصل على مركز.") },

  // ---- Winner interviews --------------------------------------------------
  { slug: "interview-mizan-rebrand", kind: "interview", cat: "studio", date: "2026-07-30T09:00:00Z",
    title: t("Layla Haddad on rebuilding an identity around a scale", "ليلى حداد عن إعادة بناء هوية حول ميزان"),
    excerpt: t("The Mizan team on why the mark had to measure rather than illustrate.", "فريق ميزان يشرح لماذا كان على العلامة أن تقيس لا أن توضّح."),
    lead: t("Mizan Rebrand took gold in Brand Identity Redesign and bronze in Logo Design off one pool of votes. Its lead designer explains why a freight identity had to be built on a unit rather than a picture.", "حصد مشروع «تجديد هوية ميزان» الذهب في إعادة تصميم الهوية والبرونز في تصميم الشعار من مجموعة أصوات واحدة. وتشرح مصممته الرئيسية لماذا وجب بناء هوية شحن على وحدة قياس لا على صورة."),
    person: { name: t("Layla Haddad", "ليلى حداد"), role: t("Creative director, Mizan Freight Systems", "المديرة الإبداعية، ميزان لأنظمة الشحن") } },
  { slug: "interview-qamar-identity", kind: "interview", cat: "craft", date: "2025-09-25T09:00:00Z",
    title: t("Qamar Studio on a mark that fills through the month", "استوديو قمر عن علامة تمتلئ عبر الشهر"),
    excerpt: t("A lunar calendar identity where the logo is a state, not a picture.", "هوية تقويم قمري يكون فيها الشعار حالة لا صورة."),
    lead: t("Qamar Identity took gold and bronze in the 2025 cycle. The studio talks through delivering a logo as a small library rather than a file, and what that asked of the client's team.", "حصدت «هوية قمر» الذهب والبرونز في دورة 2025. ويتحدث الاستوديو عن تسليم شعار كمكتبة صغيرة بدل ملف، وما تطلّبه ذلك من فريق العميل."),
    person: { name: t("Nour Al Sabah", "نور الصباح"), role: t("Founder, Qamar Studio", "مؤسِّسة استوديو قمر") } },
  { slug: "interview-khat-al-waha", kind: "interview", cat: "craft", date: "2026-06-11T09:00:00Z",
    title: t("Drawing an Arabic face for a signage system", "رسم خط عربي لنظام لافتات"),
    excerpt: t("Three weights, cut to survive a stencil on steel and a 6pt line on a form.", "ثلاثة أوزان صُمّمت لتصمد على استنسل فولاذي وسطر بحجم 6 على استمارة."),
    lead: t("Khat Al Waha was commissioned as a signage face and ended up carrying an entire wayfinding system. Its designer explains what changes when a face has to work at two extremes.", "كُلِّف «خط الواحة» ليكون خط لافتات فانتهى حاملًا نظام إرشاد كاملًا. ويشرح مصممه ما الذي يتغير حين يجب أن يعمل الخط عند طرفين متناقضين."),
    person: { name: t("Bassel Rahhal", "باسل رحال"), role: t("Type designer, Noor Type", "مصمم خطوط، نور تايب") } },
  { slug: "interview-nakhla-packaging", kind: "interview", cat: "craft", date: "2026-05-21T09:00:00Z",
    title: t("Packaging that had to ship before it had to photograph", "تغليف كان عليه أن يُشحن قبل أن يُصوَّر"),
    excerpt: t("A coffee pack designed around a courier, not a shelf.", "علبة قهوة صُمّمت حول شركة شحن لا حول رفّ."),
    lead: t("Nakhla Coffee took silver in Packaging Design. The studio explains why the structure was fixed before a single colour was chosen, and why that order is unusual.", "حصدت «قهوة نخلة» الفضة في تصميم التغليف. ويشرح الاستوديو لماذا حُسم الهيكل قبل اختيار أي لون، ولماذا هذا الترتيب غير معتاد."),
    person: { name: t("Yara Mansour", "يارا منصور"), role: t("Partner, Nakhla Studio", "شريكة، استوديو نخلة") } },
  { slug: "interview-harbour-line", kind: "interview", cat: "region", date: "2026-04-30T09:00:00Z",
    title: t("An identity drawn from tide tables and berth numbers", "هوية مستمدة من جداول المد وأرقام الأرصفة"),
    excerpt: t("Harbour Line's designer on finding a system inside an operations manual.", "مصمم «خط الميناء» عن إيجاد نظام داخل دليل تشغيل."),
    lead: t("Harbour Line was a ferry operator with no brand and a very complete operations manual. The identity came out of the manual rather than out of a moodboard.", "كان «خط الميناء» مشغّل عبّارات بلا علامة وبدليل تشغيل مكتمل جدًا. وقد خرجت الهوية من الدليل لا من لوحة إلهام."),
    person: { name: t("Omar Zeidan", "عمر زيدان"), role: t("Design lead, Harbour Line", "قائد التصميم، خط الميناء") } },
  { slug: "interview-anfa-atlas", kind: "interview", cat: "craft", date: "2026-03-26T09:00:00Z",
    title: t("Setting an atlas that has to be read on a table", "ضبط أطلس يُقرأ على طاولة"),
    excerpt: t("Anfa Press on grids, gutters and the tyranny of the binding margin.", "دار أنفا عن الشبكات والهوامش وطغيان هامش التجليد."),
    lead: t("Anfa Atlas is a 400-page book that opens flat because the binding was specified before the grid. Its designer explains why that decision came first.", "«أطلس أنفا» كتاب من 400 صفحة يُفتح مسطّحًا لأن التجليد حُدِّد قبل الشبكة. ويشرح مصممه لماذا جاء ذلك القرار أولًا."),
    person: { name: t("Salma Idrissi", "سلمى الإدريسي"), role: t("Book designer, Anfa Press", "مصممة كتب، دار أنفا") } },
  { slug: "interview-solace-logo", kind: "interview", cat: "studio", date: "2026-02-19T09:00:00Z",
    title: t("One mark, forty applications, no redraws", "علامة واحدة وأربعون تطبيقًا دون إعادة رسم"),
    excerpt: t("Building a logo that scales without a second version.", "بناء شعار يتدرّج دون نسخة ثانية."),
    lead: t("Solace Logo was drawn on a single module so it never needed a simplified variant. Its designer talks about the constraint that made that possible.", "رُسم شعار «سولاس» على وحدة واحدة فلم يحتج قط إلى نسخة مبسّطة. ويتحدث مصممه عن القيد الذي جعل ذلك ممكنًا."),
    person: { name: t("Karim Nasser", "كريم ناصر"), role: t("Founder, Solace Studio", "مؤسس استوديو سولاس") } },
  { slug: "interview-student-gold-2025", kind: "interview", cat: "education", date: "2025-10-09T09:00:00Z",
    title: t("Winning gold in the student tier, with no production budget", "الفوز بالذهب في فئة الطلاب دون ميزانية إنتاج"),
    excerpt: t("A graduation project made entirely on a borrowed press.", "مشروع تخرج أُنجز بالكامل على مطبعة مستعارة."),
    lead: t("The 2025 student gold went to a project printed on a borrowed press over four weekends. Its maker explains what she would tell somebody entering this year.", "ذهب ذهب الطلاب لعام 2025 إلى مشروع طُبع على مطبعة مستعارة عبر أربع عطلات نهاية أسبوع. وتشرح صاحبته ما ستقوله لمن يشارك هذا العام."),
    person: { name: t("Hala Barakat", "هالة بركات", ), role: t("Graduate, Cairo Polytechnic of Art", "خريجة، بوليتكنك القاهرة للفنون") } },
  { slug: "interview-juror-craft", kind: "interview", cat: "judging", date: "2026-07-23T09:00:00Z",
    title: t("A juror on the difference between finished and resolved", "محكّم عن الفرق بين المنجَز والمحسوم"),
    excerpt: t("Most entries are finished. Fewer are resolved, and the criteria can tell.", "معظم المشاركات منجَزة، وأقلّها محسوم، والمعايير تكشف الفرق."),
    lead: t("A juror across three cycles describes what separates the entries that place from the ones that merely look complete.", "يصف محكّم شارك في ثلاث دورات ما يفصل المشاركات التي تحصد مراكز عن تلك التي تبدو مكتملة فحسب."),
    person: { name: t("Rania Fakhoury", "رانيا فاخوري"), role: t("Juror, Visual Identity", "محكّمة، الهوية البصرية") } },
  { slug: "interview-juror-arabic", kind: "interview", cat: "judging", date: "2026-08-20T09:00:00Z",
    title: t("Judging Arabic type without a house style", "تحكيم الخط العربي دون أسلوب واحد"),
    excerpt: t("A panel of one taste is the fastest way to make an award worthless.", "لجنة بذائقة واحدة أسرع طريق لإفراغ الجائزة من قيمتها."),
    lead: t("A type juror explains how a panel with genuinely different tastes reaches an agreed score, and why that disagreement is the point rather than a problem.", "يشرح محكّم خطوط كيف تصل لجنة ذات أذواق مختلفة فعلًا إلى درجة متفق عليها، ولماذا هذا الاختلاف هو الغاية لا المشكلة."),
    person: { name: t("Tarek Sabbagh", "طارق صباغ"), role: t("Juror, Typography", "محكّم، فنون الخط") } },
  { slug: "interview-signage-riyadh", kind: "interview", cat: "region", date: "2026-01-15T09:00:00Z",
    title: t("Wayfinding for a district that was still being built", "إرشاد لحيّ كان لا يزال قيد الإنشاء"),
    excerpt: t("Designing signage when the streets change between drafts.", "تصميم لافتات حين تتغير الشوارع بين مسودة وأخرى."),
    lead: t("A Riyadh wayfinding system had to be specified while the district around it was still moving. Its designer explains the system that made that survivable.", "وجب تحديد نظام إرشاد في الرياض بينما الحيّ من حوله لا يزال يتغير. ويشرح مصممه النظام الذي جعل ذلك محتملًا."),
    person: { name: t("Faisal Al Otaibi", "فيصل العتيبي"), role: t("Environmental designer, Riyadh Design Lab", "مصمم بيئي، مختبر الرياض للتصميم") } },
  { slug: "interview-motion-titles", kind: "interview", cat: "studio", date: "2025-11-27T09:00:00Z",
    title: t("Title sequences that have to work muted", "تترات يجب أن تعمل دون صوت"),
    excerpt: t("Most of the audience will never hear the sound design.", "معظم الجمهور لن يسمع التصميم الصوتي أبدًا."),
    lead: t("A motion designer on building title work for feeds where sound is off by default, and why that changed the typography before it changed the animation.", "مصمم حركة يتحدث عن بناء تترات لمنصات يكون الصوت فيها مغلقًا افتراضيًا، ولماذا غيّر ذلك الطباعة قبل أن يغيّر الحركة."),
    person: { name: t("Dina Chahine", "دينا شاهين"), role: t("Motion lead, Levant Pictures", "قائدة الحركة، صور الشام") } },
];

/** Four covers per category, sourced CC0/PD; a post takes one by its index. */
const COVERS = NEWS_COVERS;

function coverFor(cat: string, index: number): { url: string; ratio: number } {
  const pool = COVERS.filter((c) => c.category === cat);
  if (!pool.length) {
    // No file for this category: the drawn fallback keeps the slot filled
    // rather than leaving a hole, and `ratio` still reserves the space.
    return { url: "", ratio: 1.6 };
  }
  const c = pool[index % pool.length];
  return { url: c.file, ratio: c.width / c.height };
}

/** Interview films, four loops shared across the interviews, poster per post. */
const FILMS = [
  "/media/news/interview-1.mp4",
  "/media/news/interview-2.mp4",
  "/media/news/interview-3.mp4",
  "/media/news/interview-4.mp4",
];

function bodyFor(spec: Spec): PostSection[] {
  const dev = CATEGORY_SECTIONS[spec.cat] ?? [];
  const close = KIND_CLOSING[spec.kind];
  return [{ paragraphs: [spec.lead] }, ...dev, ...(close ? [close] : [])];
}

function words(sections: PostSection[]): number {
  return sections.reduce(
    (n, s) => n + s.paragraphs.reduce((m, p) => m + p.en.split(/\s+/).length, 0),
    0,
  );
}

let interviewIndex = 0;
const authored: NewsItem[] = SPECS.map((spec, i) => {
  const cover = coverFor(spec.cat, i);
  const body = bodyFor(spec);
  const item: NewsItem = {
    id: `p-${String(i + 1).padStart(3, "0")}`,
    slug: spec.slug,
    kind: spec.kind,
    title: spec.title,
    excerpt: spec.excerpt,
    imageUrl: cover.url,
    ratio: cover.ratio,
    publishedAt: spec.date,
    categoryId: spec.cat,
    body,
    readMinutes: Math.max(2, Math.round(words(body) / 180)),
  };
  if (spec.kind === "interview" && spec.person) {
    const film = FILMS[interviewIndex % FILMS.length];
    interviewIndex += 1;
    item.interview = {
      name: spec.person.name,
      role: spec.person.role,
      portraitSeed: i * 7919 + 13,
      videoUrl: film,
      posterUrl: cover.url,
      transcript: [
        {
          heading: t("On what the brief actually asked", "عن ما طلبه الموجز فعلًا"),
          paragraphs: [
            spec.lead,
            t(
              "The constraint was the useful part. Once it was written down properly, most of the options disappeared on their own and what was left was arguable rather than arbitrary.",
              "كان القيد هو الجزء المفيد. وحين كُتب بوضوح اختفت معظم الخيارات من تلقاء نفسها، وبقي ما يمكن مناقشته لا ما هو اعتباطي.",
            ),
          ],
        },
        {
          heading: t("On entering", "عن المشاركة"),
          paragraphs: [
            t(
              "Read the sub-category before the deadline, not after. The group decides which of the four criteria carry weight, and strong work loses every year for being entered where its strengths are not counted.",
              "اقرأ التصنيف الفرعي قبل الموعد النهائي لا بعده. فالمجموعة تحدد أي المعايير الأربعة يحمل وزنًا، وتخسر أعمال قوية كل عام لأنها شاركت حيث لا تُحتسب مواطن قوتها.",
            ),
          ],
        },
      ],
    };
  }
  return item;
});

/**
 * The five dated events written before this file, re-filed under Programme
 * News so they answer the category filter, and left otherwise untouched.
 */
/** The three carried interviews get a full profile like every other one. */
const LEGACY_PEOPLE: Record<string, Person> = {
  "in-conversation-karim-daoud": {
    name: t("Karim Daoud", "كريم داود"),
    role: t("Founding member of the jury", "عضو مؤسِّس في لجنة التحكيم"),
  },
  "what-verification-actually-checks": {
    name: t("Mona Haddadin", "منى حدادين"),
    role: t("Verification lead, Gridliners", "مسؤولة التحقق، جريدلاينرز"),
  },
  "why-the-coordinate-is-on-the-certificate": {
    name: t("Ziad Kanaan", "زياد كنعان"),
    role: t("Programme director", "مدير البرنامج"),
  },
};

const carried: NewsItem[] = legacyNews.map((n, i) => {
  const cat = n.categoryId ?? (n.kind === "interview" ? "judging" : "programme");
  const body =
    n.body ??
    bodyFor({
      slug: n.slug, kind: n.kind, cat, date: n.publishedAt,
      title: n.title, excerpt: n.excerpt, lead: n.excerpt,
    });
  const item: NewsItem = { ...n, categoryId: cat, body, readMinutes: Math.max(2, Math.round(words(body) / 180)) };
  const person = LEGACY_PEOPLE[n.slug];
  if (n.kind === "interview" && person) {
    const cover = coverFor(cat, i + 3);
    item.interview = {
      name: person.name,
      role: person.role,
      portraitSeed: (i + 41) * 6577,
      videoUrl: FILMS[(interviewIndex + i) % FILMS.length],
      posterUrl: cover.url,
      transcript: [
        {
          heading: t("On the question this answers", "عن السؤال الذي يجيب عنه"),
          paragraphs: [
            n.excerpt,
            t(
              "The rule exists because somebody asked the question in a cycle where the answer was not written down. It is written down now, and it is applied the same way to every entry in the group.",
              "وُجدت القاعدة لأن أحدهم طرح السؤال في دورة لم تكن الإجابة فيها مكتوبة. وهي مكتوبة الآن، وتُطبَّق بالطريقة نفسها على كل مشاركة في المجموعة.",
            ),
          ],
        },
        {
          heading: t("On what changes for an entrant", "عن ما يتغير للمشارك"),
          paragraphs: [
            t(
              "Nothing, if the paperwork matches the declaration. Everything, if it does not - which is why the check happens before a juror reads anything rather than after.",
              "لا شيء، إن طابقت المستندات ما أُعلن. وكل شيء، إن لم تطابق، ولهذا يجري الفحص قبل أن يقرأ المحكّم شيئًا لا بعده.",
            ),
          ],
        },
      ],
    };
  }
  return item;
});

export const posts: NewsItem[] = [...authored, ...carried].sort(
  (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
);
