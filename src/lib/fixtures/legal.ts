import type { LocalizedText, PostSection } from "@/lib/api/types";

/**
 * Terms and Privacy, in full.
 *
 * **This text is provisional and has not been through legal review**, and both
 * pages say so on the page rather than only in a document nobody reads. It
 * describes how the programme actually intends to operate - the rules here are
 * the ones the rest of the build implements - but it is not the binding
 * version, and the client's counsel replaces it before launch.
 *
 * Structured as sections rather than one block of prose so the pages can build
 * their own contents list from the same data the body renders from. A heading
 * that appears in the navigation and a heading that appears in the document
 * cannot drift apart if there is only one of them.
 */

const t = (en: string, ar: string): LocalizedText => ({ en, ar });

export interface LegalDoc {
  id: "terms" | "privacy";
  updatedAt: string;
  sections: (PostSection & { id: string; heading: LocalizedText })[];
}

export const TERMS: LegalDoc = {
  id: "terms",
  updatedAt: "2026-08-31",
  sections: [
    {
      id: "eligibility",
      heading: t("Eligibility", "الأهلية"),
      paragraphs: [
        t("Entry is open to individuals and organisations working in design, wherever they are based, provided the work entered was made for a client, an institution or a course in the region the programme serves, or by an entrant based in it.", "المشاركة مفتوحة للأفراد والمؤسسات العاملين في التصميم أينما كانوا، شرط أن يكون العمل المقدَّم قد أُنجز لعميل أو مؤسسة أو مقرر دراسي في المنطقة التي يخدمها البرنامج، أو أن يكون المشارك مقيمًا فيها."),
        t("Three tiers run in parallel: Students, Freelancers, and Companies & Agencies. An entrant competes in one tier per entry, and the tier is verified against evidence before judging - enrolment for students, a trade licence or registration for the other two.", "تعمل ثلاث فئات بالتوازي: الطلاب، والمستقلون، والشركات والوكالات. ويتنافس المشارك في فئة واحدة لكل مشاركة، وتُفحص الفئة مقابل إثبات قبل التحكيم: قيد جامعي للطلاب، ورخصة تجارية أو سجل للفئتين الأخريين."),
        t("Work made while enrolled may be entered in the Students tier even if the entrant has since graduated. What governs the tier is when the work was made, not when the form was submitted.", "يجوز تقديم عمل أُنجز أثناء الدراسة في فئة الطلاب حتى لو تخرّج المشارك بعدها. فما يحكم الفئة هو وقت إنجاز العمل لا وقت تقديم النموذج."),
        t("Members of the current jury, the programme team and their immediate colleagues may not enter in the cycle they serve. A declared conflict of interest removes a juror from a group, not an entrant from the award.", "لا يجوز لأعضاء لجنة التحكيم الحالية وفريق البرنامج وزملائهم المباشرين المشاركة في الدورة التي يخدمونها. وتضارب المصالح المعلن يُبعد المحكّم عن مجموعة، لا المشارك عن الجائزة."),
      ],
    },
    {
      id: "entry-rules",
      heading: t("Entry rules", "قواعد المشاركة"),
      paragraphs: [
        t("Each entry names one base sub-category, which sets the criteria it is judged on and the price it is charged. Additional groups may be added as paid add-ons, and every add-on must share the base group's parent category.", "تحدد كل مشاركة تصنيفًا فرعيًا أساسيًا واحدًا، وهو الذي يحدد المعايير التي تُحكَّم بها والسعر الذي تُحتسب به. ويمكن إضافة مجموعات أخرى كإضافات مدفوعة، وعلى كل إضافة أن تشترك مع المجموعة الأساسية في الفئة الأم."),
        t("The entrant warrants that they hold the rights to everything submitted, that any client whose work appears has agreed to its publication, and that credited contributors have been named accurately.", "يُقرّ المشارك بأنه يملك حقوق كل ما يقدّمه، وأن أي عميل يظهر عمله قد وافق على نشره، وأن المساهمين المذكورين قد ذُكروا بدقة."),
        t("Work already entered in a previous Gridliners cycle may be entered again, but the earlier record stays published and a jury will see it. Work that has won in a previous cycle may not be re-entered in the same form.", "يجوز إعادة تقديم عمل شارك في دورة سابقة، لكن السجل الأقدم يبقى منشورًا وستراه اللجنة. ولا يجوز إعادة تقديم عمل فاز في دورة سابقة بالصورة نفسها."),
        t("An entry may be edited until its submission window closes. After that it is locked, because a jury reading a moving target is not judging the same thing as the jury beside it.", "يمكن تعديل المشاركة حتى إغلاق نافذة التقديم. وبعدها تُقفل، لأن لجنة تقرأ هدفًا متحركًا لا تحكّم الشيء نفسه الذي تحكّمه اللجنة المجاورة."),
      ],
    },
    {
      id: "judging",
      heading: t("Judging and public voting", "التحكيم والتصويت العام"),
      paragraphs: [
        t("Every group is scored against four criteria: the brief, the idea, the execution and the outcome. Scores are recorded per criterion, not as a single impression, and jurors may not introduce a criterion of their own.", "تُقيَّم كل مجموعة وفق أربعة معايير: الموجز، والفكرة، والتنفيذ، والأثر. وتُسجَّل الدرجات لكل معيار على حدة لا كانطباع واحد، ولا يجوز للمحكّم إدخال معيار من عنده."),
        t("Where two entries in a group finish level, the tiebreak reads execution, then the brief, then the outcome, in that order. Public votes are never part of the calculation.", "وحين يتعادل عملان في مجموعة، يقرأ فضّ التعادل التنفيذ ثم الموجز ثم الأثر بهذا الترتيب. ولا تدخل الأصوات العامة في الحساب إطلاقًا."),
        t("Public voting is a separate, published count. It runs on the shortlist, one vote per project per email address, confirmed by a code. It does not affect a medal, and it is not a jury score.", "التصويت العام عدّ منفصل ومنشور. يجري على القائمة المختصرة، بصوت واحد لكل مشروع لكل بريد إلكتروني، ويُؤكَّد برمز. ولا يؤثر في ميدالية، وليس درجة تحكيم."),
        t("A group may award gold, silver and bronze, or fewer. A withheld place is simply not awarded and no explanation is published, because publishing why nobody won is a judgement on the entries that did compete.", "قد تمنح المجموعة الذهب والفضة والبرونز أو أقل. والمركز المحجوب لا يُمنح ببساطة ولا يُنشر أي تفسير، لأن نشر سبب عدم فوز أحد حكمٌ على المشاركات التي تنافست."),
      ],
    },
    {
      id: "fees-refunds",
      heading: t("Fees and refunds", "الرسوم والاسترداد"),
      paragraphs: [
        t("Prices are published before entries open and are locked to an entry at checkout, so a window closing mid-submission never changes what an entrant already agreed to pay.", "تُنشر الأسعار قبل فتح باب المشاركة وتُثبَّت للمشاركة عند الدفع، فإغلاق نافذة أثناء التقديم لا يغيّر ما وافق عليه المشارك."),
        t("An entry fee is refundable in full until the submission window closes. After it closes the entry has entered verification and the fee is not refundable, because the work of assessing it has begun.", "رسوم المشاركة قابلة للاسترداد بالكامل حتى إغلاق نافذة التقديم. وبعد إغلاقها تكون المشاركة قد دخلت مرحلة التحقق ولا تُسترد الرسوم، لأن عمل تقييمها قد بدأ."),
        t("Where the programme moves an entry to a different tier after verification and the price of that tier is lower, the difference is refunded. Where it is higher, no additional charge is made.", "إذا نقل البرنامج مشاركة إلى فئة أخرى بعد التحقق وكان سعر تلك الفئة أقل، يُسترد الفرق. وإن كان أعلى، فلا يُفرض أي مبلغ إضافي."),
        t("Payments are processed by Stripe. The programme does not hold card numbers at any point.", "تُعالج المدفوعات عبر Stripe. ولا يحتفظ البرنامج بأرقام البطاقات في أي مرحلة."),
      ],
    },
    {
      id: "disqualification",
      heading: t("Disqualification", "الاستبعاد"),
      paragraphs: [
        t("An entry is disqualified where the work is not the entrant's, where rights or client consent were misrepresented, where a tier declaration is contradicted by the evidence and not corrected, or where votes were obtained by automated or purchased means.", "تُستبعد المشاركة إذا لم يكن العمل للمشارك، أو إذا أُسيء تمثيل الحقوق أو موافقة العميل، أو إذا ناقض الدليل إعلان الفئة ولم يُصحَّح، أو إذا حُصِّلت الأصوات بوسائل آلية أو مشتراة."),
        t("Disqualification is decided by the programme, recorded with its reason in an internal audit log, and communicated to the entrant. The reason is not published: a public explanation of a disqualification is a public accusation.", "يقرر البرنامج الاستبعاد، ويُسجَّل مع سببه في سجل تدقيق داخلي، ويُبلَّغ به المشارك. ولا يُنشر السبب، لأن التفسير العلني للاستبعاد اتهام علني."),
        t("A disqualified entry forfeits its fee and any place it held. Where a disqualification happens after results are published, the record is corrected and the correction is dated.", "تفقد المشاركة المستبعدة رسومها وأي مركز حصلت عليه. وإذا وقع الاستبعاد بعد نشر النتائج، يُصحَّح السجل ويُؤرَّخ التصحيح."),
      ],
    },
    {
      id: "publishing",
      heading: t("Publishing rights", "حقوق النشر"),
      paragraphs: [
        t("The entrant keeps every right in their work. By entering, they grant the programme a non-exclusive, worldwide licence to reproduce the submitted material for the purpose of judging, publication of results, the archive, the ceremony and the programme's own editorial coverage.", "يحتفظ المشارك بكل حقوقه في عمله. وبالمشاركة يمنح البرنامج ترخيصًا غير حصري وعالميًا لإعادة إنتاج المواد المقدَّمة لأغراض التحكيم ونشر النتائج والأرشيف والحفل والتغطية التحريرية للبرنامج."),
        t("That licence does not extend to advertising a third party, to resale, or to any use by a partner. No partner receives entry material.", "ولا يمتد هذا الترخيص إلى الإعلان لطرف ثالث أو إعادة البيع أو أي استخدام من قبل شريك. ولا يتلقى أي شريك مواد المشاركات."),
        t("Shortlisted and awarded entries stay published after their cycle closes. That permanence is the point of the archive; an entrant who needs a page withdrawn should write to the programme, and a withdrawal removes the page rather than rewriting the record of the result.", "تبقى المشاركات المتأهلة والفائزة منشورة بعد إغلاق دورتها. وهذا الثبات هو غاية الأرشيف؛ ومن يحتاج سحب صفحة فليراسل البرنامج، والسحب يزيل الصفحة ولا يعيد كتابة سجل النتيجة."),
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  id: "privacy",
  updatedAt: "2026-08-31",
  sections: [
    {
      id: "account",
      heading: t("Account information", "معلومات الحساب"),
      paragraphs: [
        t("Creating an account stores a name, an email address, a country of residence and, for organisations, a company name. Entrants may add a job title, a nationality and a profile image; none of those is required to enter.", "يخزّن إنشاء الحساب الاسم والبريد الإلكتروني وبلد الإقامة، واسم الشركة للمؤسسات. ويمكن للمشاركين إضافة مسمى وظيفي وجنسية وصورة شخصية، ولا شيء من ذلك مطلوب للمشاركة."),
        t("This information identifies an entrant to the programme and appears in public only where the entrant put it there: a project page names the participant and, where supplied, the client.", "تعرّف هذه المعلومات المشارك لدى البرنامج ولا تظهر علنًا إلا حيث وضعها المشارك بنفسه: فصفحة المشروع تذكر المشارك، والعميل حين يُقدَّم."),
      ],
    },
    {
      id: "proofs",
      heading: t("Proof documents", "مستندات الإثبات"),
      paragraphs: [
        t("Tier verification requires evidence: an enrolment record for students, a trade licence or commercial registration for freelancers and companies. These documents are seen by the verification team only.", "يتطلب التحقق من الفئة إثباتًا: وثيقة قيد للطلاب، ورخصة تجارية أو سجل تجاري للمستقلين والشركات. ولا يطّلع على هذه المستندات إلا فريق التحقق."),
        t("They are never shown to jurors, never shown to partners, and never published. They are held for the length of the cycle and the dispute window that follows it, then deleted.", "ولا تُعرض على المحكّمين ولا على الشركاء ولا تُنشر أبدًا. وتُحفظ طوال الدورة ونافذة الاعتراض التي تليها ثم تُحذف."),
      ],
    },
    {
      id: "payments",
      heading: t("Payments", "المدفوعات"),
      paragraphs: [
        t("Payments are processed by Stripe. Card details are entered on Stripe's own form and are never sent to, seen by, or stored on the programme's systems.", "تُعالج المدفوعات عبر Stripe. وتُدخل بيانات البطاقة في نموذج Stripe نفسه ولا تُرسل إلى أنظمة البرنامج ولا تُرى فيها ولا تُخزَّن."),
        t("What the programme keeps is a payment record: an amount, a currency, a date, a method label such as the last four digits, and Stripe's own identifier - enough to issue an invoice and answer a refund, and nothing more.", "وما يحتفظ به البرنامج هو سجل دفع: مبلغ وعملة وتاريخ ووصف للوسيلة مثل آخر أربعة أرقام ومعرّف Stripe، وهو ما يكفي لإصدار فاتورة والرد على استرداد، لا أكثر."),
      ],
    },
    {
      id: "voting",
      heading: t("Voter email addresses", "عناوين بريد المصوّتين"),
      paragraphs: [
        t("Public voting does not create an account. An address is used once, to send a confirmation code and to enforce one vote per project per person.", "لا ينشئ التصويت العام حسابًا. ويُستخدم العنوان مرة واحدة لإرسال رمز تأكيد ولضمان صوت واحد لكل مشروع لكل شخص."),
        t("The address is stored as a one-way hash, so the programme can tell that an address has already voted without being able to read it back. Voter addresses are never added to the newsletter, never shown to entrants, and never sold.", "يُخزَّن العنوان كبصمة أحادية الاتجاه، فيستطيع البرنامج معرفة أن عنوانًا قد صوّت دون القدرة على قراءته. ولا تُضاف عناوين المصوّتين إلى النشرة، ولا تُعرض على المشاركين، ولا تُباع أبدًا."),
      ],
    },
    {
      id: "newsletter",
      heading: t("Newsletter", "النشرة البريدية"),
      paragraphs: [
        t("Subscribing stores an email address and the date it was given. The list is used for entry windows, jury announcements and results, a few times a year.", "يخزّن الاشتراك عنوان بريد وتاريخ تقديمه. وتُستخدم القائمة لنوافذ المشاركة وإعلانات اللجنة والنتائج، بضع مرات في السنة."),
        t("Every message carries an unsubscribe link, and unsubscribing removes the address rather than flagging it. Submitting an address that is already subscribed returns the same confirmation as a new one, because telling a visitor whether an address is on the list would leak whether that person entered.", "تحمل كل رسالة رابط إلغاء اشتراك، ويؤدي الإلغاء إلى حذف العنوان لا وضع علامة عليه. وتقديم عنوان مشترك مسبقًا يعيد التأكيد نفسه الذي يعيده عنوان جديد، لأن إخبار الزائر بما إذا كان عنوان ما في القائمة يكشف ما إذا كان صاحبه قد شارك."),
      ],
    },
    {
      id: "retention",
      heading: t("How long things are kept", "مدة الاحتفاظ"),
      paragraphs: [
        t("Published entries and results are permanent: the archive is the point of the programme. Proof documents are deleted after the cycle's dispute window. Payment records are kept as long as accounting law requires. Voter hashes are kept for the cycle they were cast in.", "المشاركات والنتائج المنشورة دائمة، فالأرشيف هو غاية البرنامج. وتُحذف مستندات الإثبات بعد نافذة الاعتراض في الدورة. وتُحفظ سجلات الدفع بالمدة التي يفرضها قانون المحاسبة. وتُحفظ بصمات المصوّتين للدورة التي أُدلي فيها بالصوت."),
        t("An account that is closed removes the profile and its documents. It does not remove a published result, because a result is a record of something that happened.", "إغلاق الحساب يزيل الملف الشخصي ومستنداته، ولا يزيل نتيجة منشورة، لأن النتيجة سجلّ لشيء حدث."),
      ],
    },
    {
      id: "rights",
      heading: t("Your rights", "حقوقك"),
      paragraphs: [
        t("You can ask for a copy of what the programme holds about you, ask for a correction, ask for an account and its documents to be deleted, unsubscribe from the newsletter at any time, and object to a specific use.", "يمكنك طلب نسخة مما يحتفظ به البرنامج عنك، وطلب تصحيح، وطلب حذف حساب ومستنداته، وإلغاء الاشتراك في النشرة في أي وقت، والاعتراض على استخدام بعينه."),
        t("Requests go to privacy@gridliners.example and are answered within thirty days. Where a request cannot be met in full - a published result, an accounting record - the reply says which part could not be met and why.", "تُرسل الطلبات إلى privacy@gridliners.example ويُجاب عنها خلال ثلاثين يومًا. وحين يتعذر تلبية طلب بالكامل، كنتيجة منشورة أو سجل محاسبي، يوضح الرد أي جزء تعذّرت تلبيته ولماذا."),
      ],
    },
  ],
};
