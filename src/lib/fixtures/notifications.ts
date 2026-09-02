import type { NotificationTemplate } from "@/lib/api/types";

/**
 * All 27 notification templates, AR + EN.
 *
 * Sources:
 *  - 17 carried from the Notification Specification matrix (§3.1 ×6, §3.2 ×1,
 *    §3.3 ×3, §4 jury ×3, §5 voter ×2, §6 admin ×2).
 *  - 10 new templates from Addendum §4.1–4.10.
 *
 * Superseded and therefore NOT present: the single-group winner email
 * [NS §3.3 / §9.3], replaced by the consolidated results template (§4.8).
 * "Thank You for Participating" now serves non-shortlisted entries only.
 *
 * Language rule (§3.8): participant / jury / admin emails follow the
 * recipient's UI language; voter emails follow the language of the page the
 * vote was initiated from.
 *
 * The English bodies are the specified drafts. The Arabic bodies are working
 * translations authored alongside them, as §3.8 requires — final Arabic copy
 * is editable by Admin without a deployment.
 */

function template(
  id: string,
  source: string,
  audience: NotificationTemplate["audience"],
  timing: NotificationTemplate["timing"],
  trigger: [string, string],
  subject: [string, string],
  body: [string, string],
  options: Partial<NotificationTemplate> = {},
): NotificationTemplate {
  return {
    id,
    source,
    audience,
    timing,
    trigger: { en: trigger[0], ar: trigger[1] },
    subject: { en: subject[0], ar: subject[1] },
    body: { en: body[0], ar: body[1] },
    enabled: true,
    optional: false,
    ...options,
  };
}

export const notificationTemplates: NotificationTemplate[] = [
  // --- NS §3.1 / §9.1 — Participant: account & entry ------------------------
  template(
    "welcome",
    "NS §9.1",
    "participant",
    "immediate",
    ["Account registered", "إنشاء حساب"],
    ["Welcome to Gridliners", "أهلًا بك في غريدلاينرز"],
    [
      "Hi [Participant Name], welcome to Gridliners! Your account has been created. Ready to get started? Head to your dashboard to create your first entry.",
      "مرحبًا [اسم المشارك]، أهلًا بك في غريدلاينرز! تم إنشاء حسابك. جاهز للبدء؟ انتقل إلى لوحة التحكم لإنشاء مشاركتك الأولى.",
    ],
  ),
  template(
    "entry-submitted",
    "NS §9.1",
    "participant",
    "immediate",
    ["Entry submitted & paid (card)", "تقديم المشاركة والدفع بالبطاقة"],
    ["Entry Submitted — [Entry Title]", "تم تقديم المشاركة — [عنوان المشاركة]"],
    [
      'Hi [Participant Name], your entry "[Entry Title]" has been submitted under the [Tier] tier and payment of [Amount] has been received. Your entry is now locked and will be reviewed by our jury. You can view it anytime from My Entries.',
      "مرحبًا [اسم المشارك]، تم تقديم مشاركتك «[عنوان المشاركة]» ضمن مستوى [المستوى]، واستلمنا مبلغ [المبلغ]. مشاركتك الآن مقفلة وستراجعها لجنة التحكيم. يمكنك عرضها في أي وقت من صفحة «مشاركاتي».",
    ],
  ),
  template(
    "entry-cash-pending",
    "NS §9.1",
    "participant",
    "immediate",
    ["Entry submitted, cash pending", "تقديم المشاركة مع دفع نقدي معلّق"],
    ["Entry Received — Payment Pending", "تم استلام المشاركة — بانتظار الدفع"],
    [
      'Hi [Participant Name], we\'ve received your entry "[Entry Title]" under the [Tier] tier. Since you selected Cash as your payment method, your entry will remain pending until we confirm receipt of payment. We\'ll notify you as soon as it\'s confirmed and locked in for judging.',
      "مرحبًا [اسم المشارك]، استلمنا مشاركتك «[عنوان المشاركة]» ضمن مستوى [المستوى]. بما أنك اخترت الدفع النقدي، ستبقى المشاركة معلّقة حتى نؤكد استلام المبلغ. سنبلغك فور تأكيده وقفل المشاركة للتحكيم.",
    ],
  ),
  template(
    "cash-confirmed",
    "NS §9.1",
    "participant",
    "on_admin_action",
    ["Cash payment confirmed", "تأكيد الدفع النقدي"],
    ["Payment Confirmed — [Entry Title]", "تم تأكيد الدفع — [عنوان المشاركة]"],
    [
      'Hi [Participant Name], we\'ve confirmed your cash payment for "[Entry Title]". Your entry is now officially submitted, locked, and will be reviewed by our jury.',
      "مرحبًا [اسم المشارك]، أكدنا استلام دفعتك النقدية لمشاركة «[عنوان المشاركة]». مشاركتك الآن مقدَّمة رسميًا ومقفلة وستراجعها لجنة التحكيم.",
    ],
  ),
  template(
    "draft-reminder",
    "NS §9.1",
    "participant",
    "scheduled",
    ["Draft incomplete near deadline", "مسودة غير مكتملة قرب الموعد النهائي"],
    ["Your Draft Entry Needs Attention", "مسودة مشاركتك بحاجة إلى انتباهك"],
    [
      'Hi [Participant Name], you have a Draft entry, "[Entry Title]", that hasn\'t been submitted yet. Submissions close on [Deadline Date] — after that, this entry won\'t be eligible for judging. Finish and submit it from your dashboard.',
      "مرحبًا [اسم المشارك]، لديك مشاركة بحالة مسودة بعنوان «[عنوان المشاركة]» لم تُقدَّم بعد. يُغلق باب التقديم في [تاريخ الإغلاق]، وبعدها لن تكون هذه المشاركة مؤهلة للتحكيم. أكملها وقدّمها من لوحة التحكم.",
    ],
    { scheduleHint: "48h before the Participation Period ends" },
  ),
  template(
    "password-reset",
    "NS §9.1",
    "participant",
    "immediate",
    ["Password reset requested", "طلب إعادة تعيين كلمة المرور"],
    ["Reset Your Password", "إعادة تعيين كلمة المرور"],
    [
      "Hi [Name], we received a request to reset your password. Click the link below to choose a new one. This link expires in [X] minutes. If you didn't request this, you can safely ignore this email. [Reset Link]",
      "مرحبًا [الاسم]، وصلنا طلب لإعادة تعيين كلمة المرور. اضغط الرابط أدناه لاختيار كلمة مرور جديدة. تنتهي صلاحية الرابط خلال [X] دقيقة. إن لم تطلب ذلك، يمكنك تجاهل هذه الرسالة. [رابط إعادة التعيين]",
    ],
  ),

  // --- NS §3.2 / §9.2 — Participant: tier verification ----------------------
  template(
    "entry-verified",
    "NS §9.2",
    "participant",
    "on_admin_action",
    ["Admin marks the entry Verified", "تحديد المشاركة كموثَّقة"],
    ["Your Entry Has Been Verified", "تم توثيق مشاركتك"],
    [
      'Hi [Participant Name], this confirms that your entry "[Entry Title]" has been verified under the [Tier] tier. Your entry will now be considered under this tier for judging.',
      "مرحبًا [اسم المشارك]، نؤكد توثيق مشاركتك «[عنوان المشاركة]» ضمن مستوى [المستوى]. ستُقيَّم مشاركتك ضمن هذا المستوى في التحكيم.",
    ],
  ),

  // --- NS §3.3 / §9.3 — Participant: results --------------------------------
  template(
    "entry-shortlisted",
    "NS §9.3",
    "participant",
    "immediate",
    ["Entry reaches Cadet status", "بلوغ المشاركة مرحلة الكاديت"],
    ["Your Entry Has Been Shortlisted", "مشاركتك في القائمة القصيرة"],
    [
      'Congratulations, [Participant Name]! Your entry "[Entry Title]" has been shortlisted as a Cadet. It\'s now eligible for public voting once the Voting Window opens — we\'ll let you know as soon as it\'s live so you can start sharing.',
      "تهانينا [اسم المشارك]! أُدرجت مشاركتك «[عنوان المشاركة]» في القائمة القصيرة بصفة كاديت، وأصبحت مؤهلة للتصويت العام فور فتح باب التصويت. سنبلغك عند انطلاقه لتبدأ بمشاركة رابط مشروعك.",
    ],
  ),
  template(
    "voting-open",
    "NS §9.3",
    "participant",
    "immediate",
    ["Voting Window opens", "فتح باب التصويت"],
    ["Voting Is Now Open", "بدأ التصويت"],
    [
      'Hi [Participant Name], public voting is now open! Your entry "[Entry Title]" is live and ready to receive votes. Share your project\'s link with your network to gather support before voting closes on [Voting End Date]. [Project Link]',
      "مرحبًا [اسم المشارك]، بدأ التصويت العام! مشاركتك «[عنوان المشاركة]» متاحة الآن لاستقبال الأصوات. شارك رابط مشروعك مع شبكتك لحشد الدعم قبل إغلاق التصويت في [تاريخ إغلاق التصويت]. [رابط المشروع]",
    ],
  ),
  template(
    "entry-did-not-place",
    "NS §9.3",
    "participant",
    "optional",
    ["Entry was not shortlisted", "عدم إدراج المشاركة في القائمة القصيرة"],
    ["Thank You for Participating", "شكرًا لمشاركتك"],
    [
      'Hi [Participant Name], thank you for submitting "[Entry Title]" to this year\'s awards. While it wasn\'t selected as a winner this time, we appreciate your participation and hope to see you again next cycle.',
      "مرحبًا [اسم المشارك]، شكرًا لتقديمك «[عنوان المشاركة]» لجوائز هذا العام. لم تُختَر هذه المرة، لكننا نقدّر مشاركتك ونتطلع لرؤيتك في الدورة القادمة.",
    ],
    {
      optional: true,
      scheduleHint: "Non-shortlisted entries only; admin-toggleable (Addendum §4)",
    },
  ),

  // --- NS §4 / §9.4 — Jury ---------------------------------------------------
  template(
    "jury-account-created",
    "NS §9.4",
    "jury",
    "immediate",
    ["Jury account created", "إنشاء حساب محكّم"],
    ["You've Been Invited to Judge", "دعوة للانضمام إلى لجنة التحكيم"],
    [
      "Hi [Jury Name], you've been invited to join the Gridliners jury panel for [Category]. Log in using the credentials below to view your assigned projects once the Jury Scoring Period opens. [Login Link]",
      "مرحبًا [اسم المحكّم]، تمت دعوتك للانضمام إلى لجنة تحكيم غريدلاينرز لفئة [الفئة]. سجّل الدخول ببيانات الاعتماد أدناه لعرض المشاريع المسندة إليك فور بدء فترة التحكيم. [رابط تسجيل الدخول]",
    ],
  ),
  template(
    "jury-scoring-open",
    "NS §9.4",
    "jury",
    "immediate",
    ["Jury Scoring Period opens", "بدء فترة التحكيم"],
    ["Scoring Is Now Open", "بدأ التقييم"],
    [
      "Hi [Jury Name], the Jury Scoring Period is now open. You have [X] projects assigned to you in [Category/Sub-category]. Please submit your scores before [Scoring Deadline]. [Dashboard Link]",
      "مرحبًا [اسم المحكّم]، بدأت فترة التحكيم. لديك [X] مشروعًا مسندًا إليك في [الفئة/الفئة الفرعية]. يُرجى إرسال تقييماتك قبل [الموعد النهائي للتقييم]. [رابط لوحة التحكم]",
    ],
  ),
  template(
    "jury-deadline-reminder",
    "NS §9.4",
    "jury",
    "scheduled",
    ["Scoring deadline approaching", "اقتراب الموعد النهائي للتقييم"],
    ["Reminder: Scoring Closes Soon", "تذكير: التقييم يُغلق قريبًا"],
    [
      "Hi [Jury Name], this is a reminder that the Jury Scoring Period closes on [Scoring Deadline]. You still have [X] project(s) awaiting your score. Please complete your evaluations before the deadline. [Dashboard Link]",
      "مرحبًا [اسم المحكّم]، نذكّرك بأن فترة التحكيم تُغلق في [الموعد النهائي للتقييم]. ما زال لديك [X] مشروعًا بانتظار تقييمك. يُرجى إكمال تقييماتك قبل الموعد. [رابط لوحة التحكم]",
    ],
    { scheduleHint: "3 days before close" },
  ),

  // --- NS §5 / §9.5 — Voter --------------------------------------------------
  template(
    "vote-otp",
    "NS §9.5",
    "voter",
    "immediate",
    ["Vote OTP requested", "طلب رمز تحقق للتصويت"],
    ["Your Voting Verification Code", "رمز التحقق للتصويت"],
    [
      'Your verification code is [OTP Code]. Enter this code to confirm your vote for "[Entry Title]". This code expires in [X] minutes. If you didn\'t request this, you can ignore this email.',
      "رمز التحقق الخاص بك هو [رمز التحقق]. أدخل هذا الرمز لتأكيد تصويتك لمشروع «[عنوان المشاركة]». تنتهي صلاحية الرمز خلال [X] دقيقة. إن لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.",
    ],
  ),
  template(
    "vote-recorded",
    "NS §9.5",
    "voter",
    "optional",
    ["Vote recorded", "تسجيل الصوت"],
    ["Your Vote Has Been Recorded", "تم تسجيل صوتك"],
    [
      'Thank you! Your vote for "[Entry Title]" has been recorded. No account was created — this email is just your confirmation.',
      "شكرًا لك! تم تسجيل صوتك لمشروع «[عنوان المشاركة]». لم يُنشأ أي حساب — هذه الرسالة للتأكيد فقط.",
    ],
    { optional: true },
  ),

  // --- NS §6 / §9.6 — Admin --------------------------------------------------
  template(
    "admin-cash-awaiting",
    "NS §9.6",
    "admin",
    "immediate",
    ["Cash payment awaiting confirmation", "دفعة نقدية بانتظار التأكيد"],
    ["Cash Payment Awaiting Confirmation", "دفعة نقدية بانتظار التأكيد"],
    [
      'A cash payment is awaiting confirmation for entry "[Entry Title]" ([Participant Name], [Tier] tier, [Amount]). Please confirm receipt in the admin panel to move this entry to Submitted. [Admin Link]',
      "هناك دفعة نقدية بانتظار التأكيد للمشاركة «[عنوان المشاركة]» ([اسم المشارك]، مستوى [المستوى]، [المبلغ]). يُرجى تأكيد الاستلام من لوحة الإدارة لنقل المشاركة إلى حالة «مقدَّمة». [رابط الإدارة]",
    ],
    { scheduleHint: "Immediate, or daily digest" },
  ),
  template(
    "admin-scoring-gaps",
    "NS §9.6",
    "admin",
    "scheduled",
    ["Scoring period closing with gaps", "اقتراب إغلاق التحكيم مع نواقص"],
    ["Scoring Period Closing — Gaps Remain", "اقتراب إغلاق التحكيم — نواقص متبقية"],
    [
      "The Jury Scoring Period for [Category/Sub-category] closes on [Scoring Deadline]. The following jurors still have incomplete scoring: [Juror List with counts]. Consider sending a reminder or extending the period. [Admin Link]",
      "تُغلق فترة تحكيم [الفئة/الفئة الفرعية] في [الموعد النهائي]. لم يُكمل المحكّمون التالون تقييماتهم: [قائمة المحكّمين مع الأعداد]. يمكنك إرسال تذكير أو تمديد الفترة. [رابط الإدارة]",
    ],
  ),

  // --- Addendum §4.1–4.10 — new templates ------------------------------------
  template(
    "tier-adjustment-required",
    "Addendum §4.1",
    "participant",
    "on_admin_action",
    ["Declared tier is wrong; settlement required", "خطأ في المستوى المُعلن؛ تسوية مطلوبة"],
    ["Action Needed — Tier Adjustment for [Entry Title]", "إجراء مطلوب — تعديل المستوى لمشاركة [عنوان المشاركة]"],
    [
      'Hi [Participant Name], while verifying "[Entry Title]" we found it qualifies under the [Correct Tier] tier rather than the declared [Declared Tier]. To proceed to judging, please settle the price difference of [Amount] using the secure link below before [Settlement Deadline]. Your entry cannot be verified until this is resolved. [Payment Link]',
      "مرحبًا [اسم المشارك]، أثناء توثيق «[عنوان المشاركة]» وجدنا أنها تندرج ضمن مستوى [المستوى الصحيح] بدلًا من [المستوى المُعلن]. للمتابعة إلى التحكيم، يُرجى تسوية فرق السعر البالغ [المبلغ] عبر الرابط الآمن أدناه قبل [الموعد النهائي للتسوية]. لا يمكن توثيق مشاركتك قبل ذلك. [رابط الدفع]",
    ],
  ),
  template(
    "tier-adjustment-complete",
    "Addendum §4.2",
    "participant",
    "immediate",
    ["Tier difference paid", "سداد فرق المستوى"],
    ["Tier Adjusted — [Entry Title]", "تم تعديل المستوى — [عنوان المشاركة]"],
    [
      'Hi [Participant Name], we\'ve received your payment of [Amount]. "[Entry Title]" is now verified under the [Correct Tier] tier and will proceed to judging.',
      "مرحبًا [اسم المشارك]، استلمنا مبلغ [المبلغ]. أصبحت «[عنوان المشاركة]» موثَّقة ضمن مستوى [المستوى الصحيح] وستنتقل إلى التحكيم.",
    ],
  ),
  template(
    "tier-adjusted-credit",
    "Addendum §4.3",
    "participant",
    "on_admin_action",
    ["Tier downgrade; credit issued", "خفض المستوى وإصدار رصيد"],
    ["Tier Adjusted — Credit Issued for [Entry Title]", "تم تعديل المستوى — إصدار رصيد لمشاركة [عنوان المشاركة]"],
    [
      'Hi [Participant Name], "[Entry Title]" has been verified under the [Correct Tier] tier. The price difference of [Amount] has been issued as a single-use credit ([Credit Code]) valid for your next-cycle entry.',
      "مرحبًا [اسم المشارك]، تم توثيق «[عنوان المشاركة]» ضمن مستوى [المستوى الصحيح]. أُصدر فرق السعر البالغ [المبلغ] كرصيد يُستخدم مرة واحدة ([كود الرصيد]) صالح لمشاركتك في الدورة القادمة.",
    ],
  ),
  template(
    "verification-not-completed",
    "Addendum §4.4",
    "participant",
    "scheduled",
    ["Settlement unresolved when scoring opened", "عدم تسوية الفرق قبل بدء التحكيم"],
    ["[Entry Title] — Verification Not Completed", "[عنوان المشاركة] — لم يكتمل التوثيق"],
    [
      'Hi [Participant Name], we were unable to complete tier verification for "[Entry Title]" before judging opened, so the entry has been excluded from this cycle in line with the competition rules. Entry fees are handled per the refund policy. We\'d be glad to see this project again next cycle.',
      "مرحبًا [اسم المشارك]، لم نتمكن من إكمال توثيق المستوى لمشاركة «[عنوان المشاركة]» قبل بدء التحكيم، لذا استُبعدت من هذه الدورة وفق قواعد المسابقة. تُعالَج رسوم المشاركة وفق سياسة الاسترداد. يسعدنا أن نرى هذا المشروع مجددًا في الدورة القادمة.",
    ],
    { scheduleHint: "At Jury Scoring Period open" },
  ),
  template(
    "cash-expiry-reminder",
    "Addendum §4.5",
    "participant",
    "scheduled",
    ["Cash pending nearing expiry", "اقتراب انتهاء مهلة الدفع النقدي"],
    ["Reminder — Payment Pending for [Entry Title]", "تذكير — دفعة معلّقة لمشاركة [عنوان المشاركة]"],
    [
      'Hi [Participant Name], your entry "[Entry Title]" is still awaiting cash payment confirmation and will be cancelled on [Expiry Date] if payment isn\'t received. Please complete payment, or contact us if it\'s already on its way.',
      "مرحبًا [اسم المشارك]، ما زالت مشاركتك «[عنوان المشاركة]» بانتظار تأكيد الدفع النقدي وستُلغى في [تاريخ الانتهاء] إن لم يصل المبلغ. يُرجى إكمال الدفع، أو التواصل معنا إن كان المبلغ في الطريق.",
    ],
  ),
  template(
    "cash-expired-cancelled",
    "Addendum §4.6",
    "participant",
    "scheduled",
    ["Cash pending expired", "انتهاء مهلة الدفع النقدي"],
    ["Entry Cancelled — Payment Not Received", "إلغاء المشاركة — لم يصل الدفع"],
    [
      'Hi [Participant Name], we didn\'t receive payment for "[Entry Title]" within the pending window, so the entry has been cancelled. Nothing is owed. You\'re welcome to re-enter any time before submissions close.',
      "مرحبًا [اسم المشارك]، لم نستلم الدفع لمشاركة «[عنوان المشاركة]» خلال المهلة المحددة، لذا أُلغيت المشاركة. لا توجد أي مستحقات عليك. يمكنك إعادة التقديم في أي وقت قبل إغلاق باب التقديم.",
    ],
  ),
  template(
    "disqualification-notice",
    "Addendum §4.7",
    "participant",
    "on_admin_action",
    ["Disqualification recorded", "تسجيل تجريد من الأهلية"],
    ["Notice of Disqualification — [Entry Title]", "إشعار تجريد من الأهلية — [عنوان المشاركة]"],
    [
      'Hi [Participant Name], following review, "[Entry Title]" has been disqualified for: [Reason Summary]. Per the competition rules this includes [removal of results and issued assets / exclusion from the current and future editions, as applicable]. For questions, reply to this email.',
      "مرحبًا [اسم المشارك]، بعد المراجعة، جُرِّدت «[عنوان المشاركة]» من الأهلية للسبب التالي: [ملخص السبب]. ووفق قواعد المسابقة يشمل ذلك [إزالة النتائج والأصول الصادرة / الاستبعاد من الدورة الحالية والدورات القادمة، حسب الحالة]. لأي استفسار، يمكنك الرد على هذه الرسالة.",
    ],
  ),
  template(
    "consolidated-results",
    "Addendum §4.8",
    "participant",
    "on_admin_action",
    ["Results finalized (all Cadets)", "اعتماد النتائج (لكل الكاديت)"],
    ["Your Gridliners Awards Results — [Entry Title]", "نتائج جوائز غريدلاينرز — [عنوان المشاركة]"],
    [
      'Hi [Participant Name], the results are in for "[Entry Title]": [per entered group: [Sub-category] — [Tier] tier: [Gold Winner / Silver Winner / Bronze Winner / Did not place]]. [If any win:] Head to My Awards to collect your Badge, Award, and Certificate for each winning result, and to download your Winners Package.',
      "مرحبًا [اسم المشارك]، صدرت نتائج «[عنوان المشاركة]»: [لكل مجموعة دخلتها: [الفئة الفرعية] — مستوى [المستوى]: [فوز ذهبي / فوز فضي / فوز برونزي / لم تحصل على مركز]]. [في حال الفوز:] انتقل إلى «جوائزي» لاستلام الشارة والجائزة والشهادة لكل نتيجة فائزة، وتنزيل حزمة الفائزين.",
    ],
    { scheduleHint: "Replaces the superseded single-group winner email (NS §9.3)" },
  ),
  template(
    "voting-closed",
    "Addendum §4.9",
    "participant",
    "optional",
    ["Voting Window closes", "إغلاق باب التصويت"],
    ["Voting Has Closed", "أُغلق باب التصويت"],
    [
      'Hi [Participant Name], public voting has closed for this cycle. Thank you for sharing "[Entry Title]" — results will be announced on [Results Date].',
      "مرحبًا [اسم المشارك]، أُغلق التصويت العام لهذه الدورة. شكرًا لمشاركتك رابط «[عنوان المشاركة]» — ستُعلن النتائج في [تاريخ إعلان النتائج].",
    ],
    { optional: true },
  ),
  template(
    "entry-moved-category",
    "Addendum §4.10",
    "participant",
    "on_admin_action",
    ["Entry re-categorized during verification", "نقل المشاركة إلى فئة أخرى أثناء التوثيق"],
    ["Category Updated — [Entry Title]", "تحديث الفئة — [عنوان المشاركة]"],
    [
      'Hi [Participant Name], during review, "[Entry Title]" was moved to [New Sub-category] ([New Parent Category]) where it competes more fairly. [If applicable: your additional sub-category selections were re-mapped; any price difference is handled per the attached link / issued credit.] This ensures your work is judged against the right criteria.',
      "مرحبًا [اسم المشارك]، أثناء المراجعة، نُقلت «[عنوان المشاركة]» إلى [الفئة الفرعية الجديدة] ([الفئة الرئيسية الجديدة]) حيث تنافس بشكل أعدل. [عند اللزوم: أُعيد ربط اختياراتك من الفئات الفرعية الإضافية، ويُعالَج أي فرق في السعر عبر الرابط المرفق / الرصيد الصادر.] يضمن ذلك تقييم عملك وفق المعايير الصحيحة.",
    ],
  ),
];
