import type { ContentLanguage } from "@/lib/api/types";
import type { Locale } from "@/i18n/routing";

/**
 * Provisional project narratives, awaiting client copy.
 *
 * **All of this is placeholder copy and is registered as such.** The entry
 * model carries one `description` field and nothing else, and one line is not
 * what the Sitemap means by "individual project pages fostering storytelling
 * and visual appeal". Rather than invent a permanent content model for copy the
 * client has not written, the narrative lives here as fixture data with an
 * explicit `provisional` flag, keyed by slug.
 *
 * **Written per project, never templated.** Each brief, concept, execution and
 * outcome is about that specific work - its own material, its own constraint,
 * its own result. No lorem ipsum, and no one story with the names changed.
 *
 * **Bilingual where the interface needs it.** A project authored in Arabic
 * keeps its own `lang` and `dir` wherever it appears, whatever locale the page
 * is in; these blocks are the page's own editorial voice and follow the reader.
 *
 * These stories remain provisional until the client's final records arrive.
 */

export interface ProjectStory {
  /** Always true while the copy is ours rather than the client's. */
  provisional: true;
  /** The language the project itself was authored in. */
  contentLanguage: ContentLanguage;
  /**
   * Who the work was made **for**.
   *
   * The Sitemap's Project Details node distinguishes **Project Client** from
   * **Project Owner**, and the entry model has only the latter - the participant
   * who submitted it. Rather than add a field to `Entry` for copy the client has
   * not written, the client name lives here with the rest of the provisional
   * story and is registered for replacement. A project with no separate client
   * omits it and the page composes without.
   */
  client: Record<Locale, string> | null;
  brief: Record<Locale, string>;
  concept: Record<Locale, string>;
  execution: Record<Locale, string>;
  outcome: Record<Locale, string>;
}

const story = (
  contentLanguage: ContentLanguage,
  parts: Omit<ProjectStory, "provisional" | "contentLanguage">,
): ProjectStory => ({ provisional: true, contentLanguage, ...parts });

export const projectStories: Record<string, ProjectStory> = {
  "mizan-rebrand": story("en", {
    client: { en: "Mizan Freight Systems FZE", ar: "ميزان لأنظمة الشحن م.م.ح" },
    brief: {
      en: "Mizan moves freight across seven countries and had been trading on a mark drawn for a single warehouse in 1994. The brief was to replace a literal picture of cargo with a system that could hold a network: one identity that works on a bill of lading, a forty-foot container and a phone screen.",
      ar: "تنقل ميزان الشحن عبر سبع دول، وكانت تعمل بعلامة رُسمت لمستودع واحد عام 1994. طلب الإيجاز استبدال الصورة الحرفية للبضائع بنظام يتّسع لشبكة كاملة: هوية واحدة تصلح لبوليصة شحن، ولحاوية بطول أربعين قدمًا، ولشاشة هاتف.",
    },
    concept: {
      en: "Balance, which is what the name means. The mark is a beam that finds level, and the grid beneath it is built on the same unit as a shipping pallet - so the system measures rather than illustrates. Weight, not movement, is the idea the whole identity rests on.",
      ar: "التوازن، وهو معنى الاسم نفسه. العلامة عارضة تبحث عن استوائها، والشبكة تحتها مبنية على وحدة المنصّة نفسها، فيصبح النظام قياسًا لا تصويرًا. الثقل، لا الحركة، هو الفكرة التي تقوم عليها الهوية كلها.",
    },
    execution: {
      en: "Three weights of a bespoke sans, cut to survive a stencil on steel and a 6pt line on a customs form. The palette is two colours and a lot of restraint: a working blue for the system and a signal orange reserved for anything a driver has to find in a hurry.",
      ar: "ثلاثة أوزان من خط سانس مُصمَّم خصيصًا، مقطوعة لتصمد استنسلًا على الفولاذ وسطرًا بحجم 6 نقاط على استمارة جمركية. اللوحة لونان وقدر كبير من ضبط النفس: أزرق تشغيلي للنظام، وبرتقالي إشاري محجوز لكل ما يحتاج السائق إلى إيجاده بسرعة.",
    },
    outcome: {
      en: "Rolled out across 400 vehicles, eleven depots and the customer portal in one quarter. The operations team reports that drivers now read the depot signage from the cab, which was the test the whole system was drawn against.",
      ar: "طُبِّقت على 400 مركبة وأحد عشر مستودعًا وبوابة العملاء خلال ربع سنة واحد. يفيد فريق التشغيل بأن السائقين صاروا يقرأون لافتات المستودعات من مقاعدهم، وهو الاختبار الذي رُسم النظام كله لأجله.",
    },
  }),

  "khat-al-waha": story("ar", {
    client: { en: "American University of Sharjah", ar: "الجامعة الأمريكية في الشارقة" },
    brief: {
      en: "A graduation project asking whether the Thuluth script can carry a contemporary display face without being flattened into a logo. The constraint the student set was that every letterform had to remain writable by hand before it was allowed to be drawn digitally.",
      ar: "مشروع تخرّج يسأل إن كان خط الثلث يحتمل وجهًا عرضيًا معاصرًا دون أن يُسطَّح إلى شعار. القيد الذي وضعته الطالبة أن يبقى كل شكل حرفي قابلًا للكتابة باليد قبل أن يُسمح برسمه رقميًا.",
    },
    concept: {
      en: "The oasis palm, read as a column. The vertical strokes take the trunk's slight lean and its stacked scars; the horizontal run beneath them is the shade the canopy throws. The script keeps its traditional proportions and changes only what the eye meets first.",
      ar: "نخلة الواحة، مقروءةً كعمود. تأخذ السيقان الرأسية ميل الجذع الطفيف وندوبه المتراكبة، ويكون المدّ الأفقي تحتها هو الظل الذي يلقيه السعف. يحتفظ الخط بنسبه التقليدية ولا يغيّر إلا ما تلقاه العين أولًا.",
    },
    execution: {
      en: "Written first with a reed pen at three nib widths, then digitised without correction so the hand stays visible in the curve. Three weights, 640 glyphs, and a set of alternates that only appear at display sizes where the eye has room to read them.",
      ar: "كُتب أولًا بقلم القصب بثلاثة عروض للسنّ، ثم رُقمن دون تصحيح ليبقى أثر اليد ظاهرًا في المنحنى. ثلاثة أوزان، و640 مِحرفًا، ومجموعة بدائل لا تظهر إلا في القياسات العرضية حيث تجد العين متسعًا لقراءتها.",
    },
    outcome: {
      en: "Shown as a wall of eighty compositions at the graduation exhibition and since adopted for the university's own Arabic signage. The typeface is being extended to a text weight, which was never part of the brief.",
      ar: "عُرض جدارًا من ثمانين تكوينًا في معرض التخرّج، ثم اعتُمد للافتات الجامعة العربية. يجري الآن توسيع الخط إلى وزن نصّي، وهو ما لم يكن في الإيجاز أصلًا.",
    },
  }),

  "qamar-identity": story("en", {
    client: { en: "Qamar Cultural Foundation", ar: "مؤسسة قمر الثقافية" },
    brief: {
      en: "A cultural foundation running a programme that follows the Hijri calendar needed an identity that could say which part of the month it was in. Nothing static would do: the mark had to be a state, not a picture.",
      ar: "مؤسسة ثقافية تدير برنامجًا يتبع التقويم الهجري احتاجت هوية تستطيع أن تقول في أي جزء من الشهر نحن. لم يكن الثابت كافيًا: كان على العلامة أن تكون حالة لا صورة.",
    },
    concept: {
      en: "The mark fills the way the moon does. One shape, twenty-nine states, drawn on the same circle so the transition is a fill rather than a redraw - and the state on any given day is the correct one, taken from the calendar rather than chosen.",
      ar: "تمتلئ العلامة كما يمتلئ القمر. شكل واحد وتسع وعشرون حالة، مرسومة على الدائرة نفسها ليكون الانتقال امتلاءً لا إعادة رسم، والحالة في أي يوم هي الصحيحة، مأخوذة من التقويم لا مختارة.",
    },
    execution: {
      en: "Delivered as a small library rather than a logo file: the fill is computed from the date, so print takes a frozen state and screen takes the live one. The rest of the system stays deliberately quiet, because the mark is already doing something.",
      ar: "سُلِّمت مكتبةً صغيرة لا ملفَّ شعار: يُحسب الامتلاء من التاريخ، فتأخذ المطبوعات حالة مجمّدة وتأخذ الشاشة الحالة الحيّة. ويبقى بقية النظام هادئًا عن قصد، لأن العلامة تقوم بشيء بالفعل.",
    },
    outcome: {
      en: "Used across a full programme year. Visitors began referring to events by the shape of the mark on the invitation, which is the closest thing to proof an identity of this kind can offer.",
      ar: "استُخدمت طوال سنة برنامجية كاملة. وبدأ الزوّار يشيرون إلى الفعاليات بشكل العلامة على الدعوة، وهو أقرب ما تقدّمه هوية من هذا النوع من دليل.",
    },
  }),

  "nakhla-coffee-packaging": story("en", {
    client: { en: "Nakhla Roasters", ar: "محمصة نخلة" },
    brief: {
      en: "A single-origin roaster selling 250g bags wanted packaging that did not end in a bin liner and a bulldog clip. The constraint was a shelf life of nine months and a printer who could not foil, emboss or die-cut.",
      ar: "محمصة بنٍّ أحادي المصدر تبيع أكياسًا بوزن 250 غرامًا أرادت تغليفًا لا ينتهي في كيس قمامة ومشبك ورق. القيد صلاحية تسعة أشهر ومطبعة لا تستطيع الرقائق ولا النقش ولا القصّ.",
    },
    concept: {
      en: "The tear-strip becomes the clip. One die does both jobs: opening the bag produces the stiffener that reseals it, so the part usually thrown away is the part that keeps the coffee. Nothing is added to the pack to achieve it.",
      ar: "يتحوّل شريط الفتح إلى مشبك. قالب واحد يؤدي الوظيفتين: فتح الكيس يُنتج المقوّي الذي يعيد إغلاقه، فيصير الجزء الذي يُرمى عادةً هو الجزء الذي يحفظ البن. ولا يُضاف شيء إلى العبوة لتحقيق ذلك.",
    },
    execution: {
      en: "Date-palm fibre board, sourced within 200km of the roastery, with a compostable liner that carries the barrier. Two-colour flexo on uncoated stock, and the origin data printed as a stamp so a new lot needs no new plate.",
      ar: "لوح من ليف النخيل، مُورَّد ضمن 200 كم من المحمصة، مع بطانة قابلة للتحلل تحمل الحاجز. طباعة فلكسو بلونين على ورق غير مطلي، وبيانات المصدر مطبوعة ختمًا حتى لا تحتاج الدفعة الجديدة إلى لوح جديد.",
    },
    outcome: {
      en: "In production for three lots. The roaster reports that returned-bag reuse, which they had never measured before, is now the thing customers mention at the counter.",
      ar: "دخل الإنتاج لثلاث دفعات. وتفيد المحمصة بأن إعادة استخدام الأكياس، وهو ما لم تقسه من قبل، صار الأمر الذي يذكره الزبائن عند الطاولة.",
    },
  }),
};

/**
 * A category-aware provisional narrative for every other public project.
 *
 * **No public project may fall back to a one-line page.** The four curated
 * projects have individual stories written for their own work; the remaining
 * 386 get a narrative composed from their parent category and their own title,
 * so a reviewer opening any project finds a complete page rather than an
 * obviously unfinished one.
 *
 * These are **generated and are marked provisional exactly as the hand-written
 * ones are**. They say what is true of the category and nothing that would be a
 * claim about the specific work - no invented client, no invented result, no
 * invented measurement. Every one of them is replaced by the entrant's own copy.
 */
const CATEGORY_STORY: Record<string, Omit<ProjectStory, "provisional" | "contentLanguage" | "client">> = {
  "visual-identity": {
    brief: {
      en: "An identity that had to work as a system rather than as a single mark: one set of rules holding a name, a voice and a set of applications together across every place the organisation appears.",
      ar: "هوية كان عليها أن تعمل نظامًا لا علامة واحدة: مجموعة قواعد تجمع الاسم والصوت والتطبيقات في كل موضع تظهر فيه المؤسسة.",
    },
    concept: {
      en: "The mark is drawn from what the organisation actually does rather than from what its sector usually looks like, and the system around it is built on one module so nothing has to be redrawn to fit a new format.",
      ar: "رُسمت العلامة مما تفعله المؤسسة فعلًا لا مما يبدو عليه قطاعها عادة، وبُني النظام حولها على وحدة واحدة حتى لا يُعاد رسم شيء ليناسب قالبًا جديدًا.",
    },
    execution: {
      en: "A restrained palette, a type scale with a small number of steps, and a grid that carries from stationery to signage without exception. The applications shown are the ones the organisation uses most, not the ones that photograph best.",
      ar: "لوحة ألوان منضبطة، وسلّم طباعي بخطوات قليلة، وشبكة تمتد من القرطاسية إلى اللافتات دون استثناء. والتطبيقات المعروضة هي الأكثر استعمالًا، لا الأجمل تصويرًا.",
    },
    outcome: {
      en: "In use across the organisation's own materials. The full rollout, its measures and the client's own account of it are still to come from the entrant.",
      ar: "قيد الاستخدام في مواد المؤسسة. أما التطبيق الكامل ومقاييسه ورواية العميل عنه فما زالت بانتظار المشارك.",
    },
  },
  packaging: {
    brief: {
      en: "A pack that has to survive a supply chain and a shelf, and still say what is inside it in the half second a shopper gives it.",
      ar: "عبوة عليها أن تصمد في سلسلة التوريد وعلى الرف، وأن تقول ما بداخلها في نصف الثانية التي يمنحها المتسوّق.",
    },
    concept: {
      en: "The structure carries the idea rather than the graphics alone: how the pack opens, what it is made of and what happens to it afterwards are all part of what it says.",
      ar: "يحمل الهيكل الفكرة لا الرسوم وحدها: كيف تُفتح العبوة، ومم صُنعت، وما يحدث لها بعد ذلك، كلها جزء مما تقوله.",
    },
    execution: {
      en: "Material and print chosen against the real constraints of the run - the substrate, the number of colours, and the finishing the printer can actually do - rather than against a mockup.",
      ar: "اختيرت المادة والطباعة وفق قيود الإنتاج الحقيقية - الركيزة وعدد الألوان والتشطيب الذي تستطيعه المطبعة - لا وفق نموذج تخيّلي.",
    },
    outcome: {
      en: "Produced and on shelf. Run figures and the client's own account are still to come from the entrant.",
      ar: "أُنتجت ووصلت الرف. أما أرقام الإنتاج ورواية العميل فما زالت بانتظار المشارك.",
    },
  },
  type: {
    brief: {
      en: "A typeface asked to do a specific job - a size, a language, a surface - rather than to be a general-purpose family competing with the ones that already exist.",
      ar: "خط طُلب منه أداء مهمة محددة - قياس ولغة وسطح بعينه - لا أن يكون عائلة عامة تنافس ما هو قائم.",
    },
    concept: {
      en: "The letterforms are derived from a source outside typography and then disciplined by it, so the family has a reason to exist beyond its own drawing.",
      ar: "اشتُقّت أشكال الحروف من مصدر خارج فنّ الحروف ثم انضبطت به، فصار للعائلة سبب وجود يتجاوز رسمها نفسه.",
    },
    execution: {
      en: "Drawn at the size it will be read at, tested in setting rather than in specimen, and released in the weights the job actually needs.",
      ar: "رُسم بالقياس الذي سيُقرأ به، واختُبر في التنضيد لا في العيّنة، وصدر بالأوزان التي تحتاجها المهمة فعلًا.",
    },
    outcome: {
      en: "In use in the setting it was drawn for. Its extension and licensing are still to come from the entrant.",
      ar: "قيد الاستخدام في السياق الذي رُسم له. أما توسيعه وترخيصه فما زالا بانتظار المشارك.",
    },
  },
  photography: {
    brief: {
      en: "A set of frames that had to work as a series rather than as single images: one light, one distance and one treatment holding across every shot so the set reads as one body of work.",
      ar: "مجموعة لقطات كان عليها أن تعمل سلسلةً لا صورًا مفردة: إضاءة واحدة ومسافة واحدة ومعالجة واحدة تمتد عبر كل لقطة حتى تُقرأ المجموعة عملًا واحدًا.",
    },
    concept: {
      en: "The subject is photographed on its own terms rather than staged into a style: the light is the one it is normally seen in, and the framing is the distance a person would actually stand at.",
      ar: "يُصوَّر الموضوع بشروطه لا بأسلوب مفروض عليه: الإضاءة هي التي يُرى بها عادة، والتأطير على المسافة التي يقف عندها الناظر فعلًا.",
    },
    execution: {
      en: "Shot to a fixed set of focal lengths and graded once, so nothing in the series is corrected into agreement with the rest after the fact.",
      ar: "صُوِّرت بأطوال بؤرية محددة ودُرِّجت مرة واحدة، فلا يُصحَّح شيء في السلسلة ليتفق مع بقيتها لاحقًا.",
    },
    outcome: {
      en: "Published as a series. The full edit, its use and the client's own account are still to come from the entrant.",
      ar: "نُشرت سلسلةً. أما المونتاج الكامل واستخدامه ورواية العميل فما زالت بانتظار المشارك.",
    },
  },
  film: {
    brief: {
      en: "A film that had to carry an idea in the length it was given, with a title sequence and an end card that belong to the same system as the picture.",
      ar: "فيلم كان عليه أن يحمل فكرة في المدة الممنوحة له، بمقدمة ونهاية تنتميان إلى نظام الصورة نفسه.",
    },
    concept: {
      en: "One visual device carries the whole cut rather than a sequence of effects: the grade, the type and the pacing are three expressions of a single decision.",
      ar: "أداة بصرية واحدة تحمل المونتاج كله بدل تتابع من المؤثرات: التدريج والحروف والإيقاع ثلاثة تعبيرات عن قرار واحد.",
    },
    execution: {
      en: "Storyboarded to the frame, graded to a fixed palette, and titled in the same family the rest of the identity uses.",
      ar: "رُسمت لوحاته إطارًا إطارًا، ودُرِّج بلوحة ألوان ثابتة، وكُتبت عناوينه بالعائلة نفسها التي تستخدمها بقية الهوية.",
    },
    outcome: {
      en: "Released in the cut shown here. Distribution figures and the client's own account are still to come from the entrant.",
      ar: "صدر بالنسخة المعروضة هنا. أما أرقام التوزيع ورواية العميل فما زالت بانتظار المشارك.",
    },
  },
  digital: {
    brief: {
      en: "An interface asked to make a specific job easy rather than to look current: the same task, done faster, by people who did not choose to be there.",
      ar: "واجهة طُلب منها تسهيل مهمة بعينها لا أن تبدو عصرية: المهمة نفسها، تُنجَز أسرع، على يد أناس لم يختاروا وجودهم هنا.",
    },
    concept: {
      en: "One screen carries the whole job and everything else supports it. What could be a step is a state, and what could be a choice has a default.",
      ar: "شاشة واحدة تحمل المهمة كلها وما عداها يدعمها. ما يمكن أن يكون خطوة صار حالة، وما يمكن أن يكون اختيارًا صار له خيار افتراضي.",
    },
    execution: {
      en: "Built on a small component set and a type scale with few steps, tested at the smallest screen the audience actually uses rather than at the widest.",
      ar: "بُنيت على مجموعة مكوّنات صغيرة وسلّم طباعي بخطوات قليلة، واختُبرت على أصغر شاشة يستخدمها الجمهور فعلًا لا على أوسعها.",
    },
    outcome: {
      en: "In production. Usage figures and the client's own account are still to come from the entrant.",
      ar: "قيد التشغيل. أما أرقام الاستخدام ورواية العميل فما زالت بانتظار المشارك.",
    },
  },
  layout: {
    brief: {
      en: "A publication whose structure had to survive contributors, a page count that moved and a printer's constraints, without the reader ever noticing the compromise.",
      ar: "مطبوعة كان على بنيتها أن تصمد أمام مشاركين متعددين وعدد صفحات متغيّر وقيود المطبعة، دون أن يلحظ القارئ أي تنازل.",
    },
    concept: {
      en: "The grid is the argument. Hierarchy is made by position and space rather than by adding weights, so a long text and a short one sit in the same system.",
      ar: "الشبكة هي الحجّة. يُصنع التدرّج بالموضع والفراغ لا بإضافة أوزان، فيجلس النص الطويل والقصير في النظام نفسه.",
    },
    execution: {
      en: "One measure, three text sizes and a fixed baseline, so every spread aligns without being individually adjusted.",
      ar: "مقاس واحد وثلاثة أحجام للنص وخط أساس ثابت، فتتراصف كل الصفحات دون ضبط فردي.",
    },
    outcome: {
      en: "Printed and in circulation. The run, its distribution and the client's own account are still to come from the entrant.",
      ar: "طُبعت وتداولت. أما الطبعة وتوزيعها ورواية العميل فما زالت بانتظار المشارك.",
    },
  },
};
const FALLBACK = CATEGORY_STORY["visual-identity"];

/**
 * The story for a project: hand-written where one exists, category-aware
 * otherwise. Never null, because a public project is never allowed to fall back
 * to a one-line page.
 */
export function storyFor(slug: string, parentId?: string): ProjectStory | null {
  const own = projectStories[slug];
  if (own) return own;
  if (!parentId) return null;
  const base = CATEGORY_STORY[parentId] ?? FALLBACK;
  return { provisional: true, contentLanguage: "en", client: null, ...base };
}
