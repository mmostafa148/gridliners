import type { LocalizedText, PostSection } from "@/lib/api/types";

/**
 * The written substance of the media centre.
 *
 * **All of it is provisional and is recorded as such** in
 * `docs/temporary-media.md`: it is written for this build so the pages can be
 * reviewed populated, and it is replaced by the client's own editorial before
 * launch. It is not lorem ipsum - every line is about this programme, its
 * jury, its tiers and its region - but no sentence here has been approved by
 * anyone who runs the award.
 *
 * A post's opening paragraph is authored per post; the movements beneath it
 * are authored per **category**, because a piece filed under Judging &
 * Criteria and a piece filed under Craft & Process are about genuinely
 * different things and should not share a body.
 */

const t = (en: string, ar: string): LocalizedText => ({ en, ar });

/** Two authored movements per category, under the post's own opening. */
export const CATEGORY_SECTIONS: Record<string, PostSection[]> = {
  judging: [
    {
      heading: t("What the criteria actually measure", "ما الذي تقيسه المعايير فعليًا"),
      paragraphs: [
        t(
          "Every group is scored against the same four criteria: the problem the work was given, the idea it answered with, how well that idea was made, and what happened once it left the studio. A juror cannot substitute a fifth criterion of their own, and cannot score a piece on a criterion its category does not carry.",
          "تُقيَّم كل مجموعة وفق المعايير الأربعة نفسها: المشكلة التي كُلِّف بها العمل، والفكرة التي أجاب بها، وجودة تنفيذ تلك الفكرة، وما حدث بعد خروجه من الاستوديو. لا يملك المحكّم أن يضيف معيارًا خامسًا من عنده، ولا أن يقيّم عملًا وفق معيار لا تحمله فئته.",
        ),
        t(
          "The scores are recorded per criterion rather than as a single impression, which is what makes a result explainable afterwards. When two entries finish level, the tiebreak reads the criteria in a fixed order before it reads anything else.",
          "تُسجَّل الدرجات لكل معيار على حدة لا كانطباع واحد، وهذا ما يجعل النتيجة قابلة للتفسير لاحقًا. وحين يتعادل عملان، يقرأ فضّ التعادل المعايير بترتيب ثابت قبل أن يقرأ أي شيء آخر.",
        ),
      ],
    },
    {
      heading: t("Why the tier is settled first", "لماذا تُحسم الفئة أولًا"),
      paragraphs: [
        t(
          "A student ranked against an agency is not a competition, so the tier a piece competes in is verified before any juror sees it. Verification looks at the entrant, not the work: enrolment, trade licence, the size of the studio that made it.",
          "تنافس طالب مع وكالة ليس تنافسًا، لذلك تُفحص الفئة التي يتنافس فيها العمل قبل أن يراه أي محكّم. والفحص ينظر إلى المشارك لا إلى العمل: القيد الجامعي، والرخصة التجارية، وحجم الاستوديو الذي أنجزه.",
        ),
        t(
          "It happens before scoring for a plain reason: moving an entry after a jury has read it would either discard their work or carry a score across a boundary it was never given for.",
          "ويحدث ذلك قبل التحكيم لسبب بسيط: نقل مشاركة بعد قراءتها من لجنة يعني إما إهدار عملها أو نقل درجة عبر حدٍّ لم تُمنح لأجله.",
        ),
      ],
    },
  ],
  craft: [
    {
      heading: t("Execution is a criterion, not a courtesy", "التنفيذ معيار لا مجاملة"),
      paragraphs: [
        t(
          "A good idea badly made loses to a modest idea made well, and the criteria say so out loud. Jurors are asked to look at the join: the kerning on the sign that will be read at forty metres, the fold that has to survive a courier, the fallback when the typeface is not installed.",
          "الفكرة الجيدة سيئة التنفيذ تخسر أمام فكرة متواضعة أُحسن تنفيذها، والمعايير تقول ذلك صراحة. ويُطلب من المحكّمين النظر إلى المفاصل: تباعد الحروف في لافتة ستُقرأ من أربعين مترًا، والطية التي عليها أن تنجو من شركة شحن، والبديل حين لا يكون الخط مثبتًا.",
        ),
        t(
          "The entry form asks for the working files and the specimens for the same reason. A flat render proves an intention; a print sheet, a screen recording or a spec proves a decision was carried through.",
          "ولهذا يطلب نموذج المشاركة ملفات العمل والنماذج المطبوعة. فالصورة المسطّحة تثبت نية، أما ورقة الطباعة أو تسجيل الشاشة أو الدليل الفني فيثبت أن القرار نُفِّذ حتى نهايته.",
        ),
      ],
    },
    {
      heading: t("Arabic is not a second pass", "العربية ليست مرحلة ثانية"),
      paragraphs: [
        t(
          "Work that carries both scripts is judged on both. A layout that mirrors cleanly, a type pairing that holds its colour across two writing systems, and numerals that behave in a table are all execution, and all of them are visible to a jury that reads Arabic.",
          "العمل الذي يحمل النصّين يُحكَّم على كليهما. فالتخطيط الذي ينعكس بنظافة، والاقتران الطباعي الذي يحافظ على لونه عبر نظامَي كتابة، والأرقام التي تنضبط في جدول، كلها تنفيذ، وكلها ظاهرة أمام لجنة تقرأ العربية.",
        ),
        t(
          "The commonest deduction is not an ugly Arabic setting. It is an Arabic setting that was clearly done last, at a smaller size, in a weight that does not exist in the family.",
          "والخصم الأكثر شيوعًا ليس ضبطًا عربيًا قبيحًا، بل ضبطٌ عربي واضحٌ أنه أُنجز أخيرًا، بحجم أصغر، وبوزن لا وجود له في العائلة أصلًا.",
        ),
      ],
    },
  ],
  programme: [
    {
      heading: t("How the cycle runs", "كيف تسير الدورة"),
      paragraphs: [
        t(
          "One cycle a year, in six phases: configuration, submissions, verification, jury scoring, public voting and results. Each phase opens only when the one before it has closed, and the dates are published before entries open rather than announced as they arrive.",
          "دورة واحدة في السنة، على ست مراحل: الإعداد، والمشاركات، والتحقق، وتحكيم اللجنة، والتصويت العام، والنتائج. ولا تُفتح مرحلة إلا بعد إغلاق سابقتها، وتُنشر المواعيد قبل فتح باب المشاركة لا مع وصولها.",
        ),
        t(
          "A window can be extended before it closes, and the site reads the phase rather than the clock - so what a page says about voting is what the programme is actually doing, not what a date suggests it should be doing.",
          "ويمكن تمديد نافذة قبل إغلاقها، والموقع يقرأ المرحلة لا الساعة، فما تقوله الصفحة عن التصويت هو ما يفعله البرنامج فعلًا لا ما يوحي به تاريخ.",
        ),
      ],
    },
    {
      heading: t("What gets published, and when", "ما الذي يُنشر ومتى"),
      paragraphs: [
        t(
          "Nothing about a result appears before its group is finalised. Proposed rankings exist in the system throughout jury scoring and are never addressable from a public page - not in a listing, not in a share card, not in a URL somebody could guess.",
          "لا يظهر أي شيء عن نتيجة قبل اعتماد مجموعتها. فالترتيبات المقترحة موجودة في النظام طوال مرحلة التحكيم ولا يمكن الوصول إليها من أي صفحة عامة: لا في قائمة، ولا في بطاقة مشاركة، ولا في رابط يمكن تخمينه.",
        ),
        t(
          "When a place is withheld, it is simply not awarded. There is no fourth level and no note explaining an absence, because a published explanation of why nobody won is a judgement about the entries that did compete.",
          "وحين يُحجب مركز، فإنه ببساطة لا يُمنح. لا يوجد مستوى رابع ولا ملاحظة تفسّر الغياب، لأن نشر تفسير لعدم فوز أحد هو في ذاته حكم على المشاركات التي تنافست.",
        ),
      ],
    },
  ],
  region: [
    {
      heading: t("A regional award, judged regionally", "جائزة إقليمية تُحكَّم إقليميًا"),
      paragraphs: [
        t(
          "The programme exists because work made in Amman, Cairo, Riyadh, Dubai and Casablanca was being measured against criteria written somewhere else, for a market with different constraints, different scripts and different production.",
          "وُجد هذا البرنامج لأن أعمالًا صُنعت في عمّان والقاهرة والرياض ودبي والدار البيضاء كانت تُقاس بمعايير كُتبت في مكان آخر، لسوق له قيود مختلفة، ونصوص مختلفة، وإنتاج مختلف.",
        ),
        t(
          "That does not mean a softer standard. It means the standard is written where the work is made, and that a jury reading an entry knows what a two-week print turnaround or a bilingual signage brief actually costs.",
          "ولا يعني ذلك معيارًا أليَن، بل يعني أن المعيار يُكتب حيث يُصنع العمل، وأن اللجنة التي تقرأ مشاركة تعرف الكلفة الحقيقية لمهلة طباعة من أسبوعين أو لمشروع لافتات ثنائي اللغة.",
        ),
      ],
    },
    {
      heading: t("An archive, not a season", "أرشيف لا موسم"),
      paragraphs: [
        t(
          "Every edition stays addressable after its year closes. A finalist from an earlier cycle keeps their page, their groups and their count, because a reference that disappears when the next cycle opens is not a reference.",
          "تبقى كل دورة قابلة للوصول بعد انتهاء سنتها. فالمتأهل من دورة سابقة يحتفظ بصفحته ومجموعاته وعدد أصواته، لأن مرجعًا يختفي مع افتتاح الدورة التالية ليس مرجعًا.",
        ),
        t(
          "That is the part the region was missing: not another prize, but a record designers can point at years later when they are asked what good work here looked like.",
          "وهذا ما كان ينقص المنطقة: لا جائزة أخرى، بل سجلٌّ يمكن للمصممين الإشارة إليه بعد سنوات حين يُسألون كيف بدا العمل الجيد هنا.",
        ),
      ],
    },
  ],
  studio: [
    {
      heading: t("What an entry has to prove", "ما الذي على المشاركة إثباته"),
      paragraphs: [
        t(
          "The entry form asks for the brief as it was given, not as it is remembered. Jurors read the constraint first, because a piece that solved a hard problem modestly is a different achievement from one that solved an easy problem beautifully.",
          "يطلب نموذج المشاركة الموجز كما أُعطي لا كما يُتذكَّر. فالمحكّمون يقرأون القيد أولًا، لأن عملًا حلّ مشكلة صعبة بتواضع إنجازٌ مختلف عن عمل حلّ مشكلة سهلة ببراعة.",
        ),
        t(
          "Credits belong to the people who did the work. A studio may enter, but the record carries the names of the practitioners, which is what makes the archive useful to somebody hiring three years from now.",
          "والاعتمادات تعود إلى من أنجزوا العمل. فقد يشارك الاستوديو، لكن السجل يحمل أسماء الممارسين، وهذا ما يجعل الأرشيف مفيدًا لمن يوظّف بعد ثلاث سنوات.",
        ),
      ],
    },
    {
      heading: t("Entering as a small studio", "المشاركة بصفتك استوديو صغيرًا"),
      paragraphs: [
        t(
          "The tiers exist so that a two-person studio is not asked to look like a network agency. Freelancers compete with freelancers, students with students, and the same four criteria are applied inside each.",
          "وُجدت الفئات كي لا يُطلب من استوديو من شخصين أن يبدو كوكالة شبكية. فالمستقلون ينافسون المستقلين، والطلاب ينافسون الطلاب، وتُطبَّق المعايير الأربعة نفسها داخل كل فئة.",
        ),
        t(
          "The most common avoidable loss is a strong project entered in the wrong group. Read the sub-category description before the deadline, not after: the group sets which criteria carry weight.",
          "والخسارة الأكثر قابلية للتفادي هي مشروع قوي شارك في المجموعة الخطأ. اقرأ وصف التصنيف الفرعي قبل الموعد النهائي لا بعده، فالمجموعة هي التي تحدد أي المعايير يحمل وزنًا.",
        ),
      ],
    },
  ],
  education: [
    {
      heading: t("Why students have their own tier", "لماذا للطلاب فئتهم الخاصة"),
      paragraphs: [
        t(
          "Student work is judged against student work, with the same criteria and a different expectation of budget and access. The point is not a consolation category; it is that a brief answered without a production budget is a different brief.",
          "يُحكَّم عمل الطالب مقابل عمل الطالب، بالمعايير نفسها وبتوقّع مختلف للميزانية وسهولة الوصول. والغاية ليست فئة ترضية، بل أن موجزًا أُجيب عنه دون ميزانية إنتاج هو موجز مختلف.",
        ),
        t(
          "Enrolment is verified before scoring, and a graduate who entered as a student in a cycle that has closed keeps the record as it stood. The archive states what was true at the time.",
          "ويُتحقَّق من القيد الجامعي قبل التحكيم، والخريج الذي شارك بصفته طالبًا في دورة مغلقة يحتفظ بالسجل كما كان. فالأرشيف يذكر ما كان صحيحًا حينها.",
        ),
      ],
    },
    {
      heading: t("What tutors ask us most", "أكثر ما يسأله المدرّسون"),
      paragraphs: [
        t(
          "Whether coursework counts: it does, if the student made it and can supply the working files. Whether a group project can be entered: it can, with every contributor credited, and the credit list is read.",
          "هل تُحتسب أعمال المقررات الدراسية؟ نعم، إن أنجزها الطالب وأمكنه تقديم ملفات العمل. وهل يمكن مشاركة مشروع جماعي؟ نعم، مع ذكر كل مساهم، وقائمة الاعتمادات تُقرأ فعلًا.",
        ),
        t(
          "And whether a piece that did not win is worth entering again: not in the same form. The archive is public, and a jury that has seen a project once will read a resubmission as a resubmission.",
          "وهل يستحق عملٌ لم يفز أن يُعاد تقديمه؟ ليس بالصورة نفسها. فالأرشيف عام، واللجنة التي رأت مشروعًا مرة ستقرأ إعادة تقديمه على أنها إعادة تقديم.",
        ),
      ],
    },
  ],
};

/** A closing movement per kind, so a notice and an essay do not end the same way. */
export const KIND_CLOSING: Record<string, PostSection> = {
  news: {
    heading: t("What happens next", "ما التالي"),
    paragraphs: [
      t(
        "Dates for the current cycle are published on How to Enter, and any change to a window is announced there before it takes effect. Entrants with an open submission are notified by email as well.",
        "تُنشر مواعيد الدورة الحالية في صفحة كيفية المشاركة، ويُعلن أي تغيير في نافذة قبل سريانه. كما يُبلَّغ أصحاب المشاركات المفتوحة بالبريد الإلكتروني.",
      ),
    ],
  },
  article: {
    heading: t("Read this next", "اقرأ بعد ذلك"),
    paragraphs: [
      t(
        "The criteria, the tiers and the six phases are set out in full under Awards. If a point here matters to an entry you are preparing, that is the page that governs it - this one only explains it.",
        "تُعرض المعايير والفئات والمراحل الست كاملةً ضمن قسم الجوائز. وإن كانت نقطة هنا تهم مشاركة تُعدّها، فتلك هي الصفحة الحاكمة، أما هذه فتشرح فقط.",
      ),
    ],
  },
  interview: {
    heading: t("About this conversation", "عن هذا الحوار"),
    paragraphs: [
      t(
        "The conversation was recorded for the programme and edited for length. The full transcript is above the related posts, so nothing said here depends on being able to play the film.",
        "سُجِّل الحوار لصالح البرنامج وحُرِّر اختصارًا للطول. والنص الكامل موجود أعلى المقالات ذات الصلة، فلا يتوقف شيء مما قيل هنا على القدرة على تشغيل الفيلم.",
      ),
    ],
  },
  event: {
    heading: t("Attending", "الحضور"),
    paragraphs: [
      t(
        "Seats are released to entrants and partners first, then to the public. Contact us if you need access arrangements and we will confirm before the day.",
        "تُتاح المقاعد للمشاركين والشركاء أولًا ثم للجمهور. تواصل معنا إن كنت تحتاج ترتيبات وصول خاصة وسنؤكدها قبل الموعد.",
      ),
    ],
  },
};
