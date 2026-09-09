import type {
  Criterion,
  HonoraryDesignationOption,
  ParentCategory,
  SubCategory,
} from "@/lib/api/types";

/**
 * Frozen category taxonomy v2026.0 — Addendum Appendix A.
 *
 * Structure is frozen; label wording may still be polished before launch.
 * Every entry belongs to exactly one sub-category, plus optional paid
 * additions that must share the same parent.
 *
 * NOTE: "Commercial Ad" appears under BOTH Photography and Film. IDs are
 * therefore namespaced by parent.
 */

/**
 * PLACEHOLDER — the descriptions only.
 *
 * No governing document supplies a blurb per category: not the delta, not the
 * addendum, not the consolidated decisions. Each one is written from the
 * sub-categories that parent actually holds, so it is true of the taxonomy as
 * frozen rather than invented around it, and it must be replaced with the
 * client's own wording before launch. Names, ids, order and the structure itself
 * are Appendix A verbatim and are not placeholders.
 */
export const parentCategories: ParentCategory[] = [
  {
    id: "visual-identity",
    name: { en: "Visual Identity", ar: "الهوية البصرية" },
    description: {
      en: "Marks, systems, and the rules that hold them together. New identities and the redrawing of old ones.",
      ar: "شعارات وأنظمة بصرية والقواعد التي تحفظها. هويات جديدة وإعادة رسم هويات قائمة.",
    },
    order: 1,
  },
  {
    id: "packaging",
    name: { en: "Packaging", ar: "التغليف" },
    description: {
      en: "Work made to be picked up: structure, surface, and the shelf it has to survive.",
      ar: "عمل يُحمل باليد: البنية والسطح والرف الذي عليه أن يصمد فيه.",
    },
    order: 2,
  },
  {
    id: "type",
    name: { en: "Type", ar: "الطباعة والخطوط" },
    description: {
      en: "The letterform as the subject. Drawn typefaces and Arabic calligraphy.",
      ar: "الحرف نفسه هو الموضوع. خطوط مرسومة وخط عربي.",
    },
    order: 3,
  },
  {
    id: "photography",
    name: { en: "Photography", ar: "التصوير" },
    description: {
      en: "The still frame, made for a client. Campaign images, and studio work on the product itself.",
      ar: "الصورة الثابتة، مصنوعة لعميل. صور الحملات، وتصوير المنتج في الاستوديو.",
    },
    order: 4,
  },
  {
    id: "film",
    name: { en: "Film", ar: "الفيلم" },
    description: {
      en: "Work that runs in time: commercials, films that explain, and graphics that move.",
      ar: "عمل يجري في الزمن: إعلانات، وأفلام تشرح، ورسوم تتحرك.",
    },
    order: 5,
  },
  {
    id: "digital",
    name: { en: "Digital", ar: "ديجيتال" },
    description: {
      en: "The widest group here. Screens, generated work, dimension, data, and image making.",
      ar: "أوسع مجموعة هنا. الشاشات، والأعمال المولّدة، والأبعاد، والبيانات، وصناعة الصورة.",
    },
    order: 6,
  },
  {
    id: "layout",
    name: { en: "Layout", ar: "الإخراج الفني" },
    description: {
      en: "Pages and posters. Long-form composition, and the single sheet that has to work from across a room.",
      ar: "الصفحات والملصقات. تركيب المطبوعات الطويلة، والورقة الواحدة التي يجب أن تعمل من بعيد.",
    },
    order: 7,
  },
];

export const subCategories: SubCategory[] = [
  // 1 — Visual Identity
  {
    id: "visual-identity-brand-identity-design",
    parentId: "visual-identity",
    name: { en: "Brand Identity Design", ar: "تصميم هوية بصرية" },
    additionalFeeUsd: 120,
    order: 1,
  },
  {
    id: "visual-identity-brand-identity-redesign",
    parentId: "visual-identity",
    name: { en: "Brand Identity Redesign", ar: "إعادة تصميم هوية بصرية" },
    additionalFeeUsd: 120,
    order: 2,
  },
  {
    id: "visual-identity-logo-design",
    parentId: "visual-identity",
    name: { en: "Logo Design", ar: "تصميم شعار" },
    additionalFeeUsd: 90,
    order: 3,
  },

  // 2 — Packaging
  {
    id: "packaging-packaging-design",
    parentId: "packaging",
    name: { en: "Packaging Design", ar: "تصميم تغليف" },
    additionalFeeUsd: 110,
    order: 1,
  },
  {
    id: "packaging-packaging-redesign",
    parentId: "packaging",
    name: { en: "Packaging Redesign", ar: "إعادة تصميم تغليف" },
    additionalFeeUsd: 110,
    order: 2,
  },

  // 3 — Type
  {
    id: "type-typeface-design",
    parentId: "type",
    name: { en: "Typeface Design", ar: "تصميم خطوط" },
    additionalFeeUsd: 130,
    order: 1,
  },
  {
    id: "type-calligraphy",
    parentId: "type",
    name: { en: "Calligraphy", ar: "الخط العربي" },
    additionalFeeUsd: 90,
    order: 2,
  },

  // 4 — Photography  (note: "Commercial Ad" also exists under Film)
  {
    id: "photography-commercial-ad",
    parentId: "photography",
    name: { en: "Commercial Ad", ar: "إعلان تجاري" },
    additionalFeeUsd: 100,
    order: 1,
  },
  {
    id: "photography-product-photography",
    parentId: "photography",
    name: { en: "Product Photography", ar: "تصوير منتجات" },
    additionalFeeUsd: 100,
    order: 2,
  },

  // 5 — Film  (note: "Commercial Ad" also exists under Photography)
  {
    id: "film-commercial-ad",
    parentId: "film",
    name: { en: "Commercial Ad", ar: "إعلان تجاري" },
    additionalFeeUsd: 140,
    order: 1,
  },
  {
    id: "film-presentational-film",
    parentId: "film",
    name: { en: "Presentational Film", ar: "فيلم تعريفي" },
    additionalFeeUsd: 140,
    order: 2,
  },
  {
    id: "film-motion-graphics-animation",
    parentId: "film",
    name: { en: "Motion Graphics & Animation", ar: "موشن جرافيك وأنيميشن" },
    additionalFeeUsd: 130,
    order: 3,
  },
  {
    id: "film-logo-animation",
    parentId: "film",
    name: { en: "Logo Animation", ar: "تحريك شعار" },
    additionalFeeUsd: 95,
    order: 4,
  },

  // 6 — Digital
  {
    id: "digital-ui-ux",
    parentId: "digital",
    name: { en: "UI/UX", ar: "واجهات وتجربة المستخدم" },
    additionalFeeUsd: 125,
    order: 1,
  },
  {
    id: "digital-ai-designs",
    parentId: "digital",
    name: { en: "AI Designs", ar: "تصاميم الذكاء الاصطناعي" },
    additionalFeeUsd: 100,
    order: 2,
  },
  {
    id: "digital-3d",
    parentId: "digital",
    name: { en: "3D", ar: "ثلاثي الأبعاد" },
    additionalFeeUsd: 115,
    order: 3,
  },
  {
    id: "digital-infographics",
    parentId: "digital",
    name: { en: "Infographics", ar: "إنفوجرافيك" },
    additionalFeeUsd: 85,
    order: 4,
  },
  {
    id: "digital-visual-art",
    parentId: "digital",
    name: { en: "Visual Art", ar: "فن بصري" },
    additionalFeeUsd: 90,
    order: 5,
  },
  {
    id: "digital-best-social-media-campaign",
    parentId: "digital",
    name: { en: "Best Social Media Campaign", ar: "أفضل حملة سوشيال ميديا" },
    additionalFeeUsd: 135,
    order: 6,
  },
  {
    id: "digital-illustrations",
    parentId: "digital",
    name: { en: "Illustrations", ar: "رسوم توضيحية" },
    additionalFeeUsd: 85,
    order: 7,
  },

  // 7 — Layout
  {
    id: "layout-book-design",
    parentId: "layout",
    name: { en: "Book Design", ar: "تصميم كتاب" },
    additionalFeeUsd: 105,
    order: 1,
  },
  {
    id: "layout-magazine-design",
    parentId: "layout",
    name: { en: "Magazine Design", ar: "تصميم مجلة" },
    additionalFeeUsd: 105,
    order: 2,
  },
  {
    id: "layout-poster-design",
    parentId: "layout",
    name: { en: "Poster Design", ar: "تصميم ملصق" },
    additionalFeeUsd: 80,
    order: 3,
  },
];

/**
 * Honorary designations — an Admin designation menu, NOT enterable categories
 * (Addendum §1.4 / §3.9). Never paid; black asset colorway; the certificate
 * variant omits the Tier line.
 */
export const honoraryOptions: HonoraryDesignationOption[] = [
  { id: "student_of_the_year", name: { en: "Student of the Year", ar: "طالب العام" }, order: 1 },
  { id: "designer_of_the_year", name: { en: "Designer of the Year", ar: "مصمم العام" }, order: 2 },
  { id: "best_agency", name: { en: "Best Agency", ar: "أفضل وكالة" }, order: 3 },
  { id: "best_project", name: { en: "Best Project", ar: "أفضل مشروع" }, order: 4 },
  { id: "best_university", name: { en: "Best University", ar: "أفضل جامعة" }, order: 5 },
  { id: "audience_award", name: { en: "Audience Award", ar: "جائزة الجمهور" }, order: 6 },
  {
    id: "sustainability_innovation",
    name: { en: "Sustainability & Innovation", ar: "جائزة الاستدامة والابتكار" },
    order: 7,
  },
];

/**
 * Criteria and weights per parent category. Weights sum to 100 within each
 * parent. PLACEHOLDER VALUES — final criteria and weights are a known-open
 * config item (CD §6.2) and remain admin-configurable.
 */
function criterion(
  parentCategoryId: string,
  slug: string,
  en: string,
  ar: string,
  descEn: string,
  descAr: string,
  weight: number,
): Criterion {
  return {
    id: `${parentCategoryId}-${slug}`,
    parentCategoryId,
    name: { en, ar },
    description: { en: descEn, ar: descAr },
    weight,
  };
}

export const criteria: Criterion[] = [
  // Visual Identity
  criterion("visual-identity", "concept", "Concept & Strategy", "الفكرة والاستراتيجية", "Strength of the idea and its fit with the brand's positioning.", "قوة الفكرة ومدى ملاءمتها لموقع العلامة التجارية.", 25),
  criterion("visual-identity", "craft", "Craft & Execution", "الحرفية والتنفيذ", "Quality of the drawing, typography and detailing.", "جودة الرسم والطباعة والتفاصيل.", 25),
  criterion("visual-identity", "system", "Consistency & System", "الاتساق والنظام", "How well the identity holds together as a usable system.", "مدى تماسك الهوية كنظام قابل للتطبيق.", 20),
  criterion("visual-identity", "distinctiveness", "Distinctiveness", "التميّز", "Memorability and separation from category conventions.", "قابلية التذكّر والتميّز عن السائد في الفئة.", 15),
  criterion("visual-identity", "applicability", "Applicability", "قابلية التطبيق", "Performance across the real touchpoints shown.", "الأداء عبر نقاط التطبيق الفعلية المعروضة.", 15),

  // Packaging
  criterion("packaging", "concept", "Concept", "الفكرة", "Clarity and originality of the packaging idea.", "وضوح فكرة التغليف وأصالتها.", 20),
  criterion("packaging", "structure", "Structural Design", "التصميم الإنشائي", "Form, ergonomics and material choices.", "الشكل وسهولة الاستخدام واختيار المواد.", 20),
  criterion("packaging", "craft", "Craft & Finish", "الحرفية والتشطيب", "Print quality, finishing and attention to detail.", "جودة الطباعة والتشطيب والاهتمام بالتفاصيل.", 20),
  criterion("packaging", "shelf-impact", "Shelf Impact", "الحضور على الرف", "Standout and legibility in a retail context.", "البروز والوضوح في بيئة البيع.", 20),
  criterion("packaging", "sustainability", "Sustainability", "الاستدامة", "Material efficiency and end-of-life thinking.", "كفاءة المواد والتفكير في دورة الحياة.", 20),

  // Type
  criterion("type", "concept", "Concept", "الفكرة", "Rationale behind the letterform direction.", "المنطق وراء اتجاه تصميم الحروف.", 20),
  criterion("type", "letterforms", "Letterform Quality", "جودة الحروف", "Drawing quality, consistency and optical balance.", "جودة الرسم والاتساق والتوازن البصري.", 30),
  criterion("type", "rhythm", "Legibility & Rhythm", "الوضوح والإيقاع", "Spacing, rhythm and reading performance.", "التباعد والإيقاع وأداء القراءة.", 25),
  criterion("type", "technical", "Technical Execution", "التنفيذ التقني", "Font engineering, coverage and hinting.", "هندسة الخط وتغطيته وضبطه.", 15),
  criterion("type", "range", "Range & Versatility", "المدى والمرونة", "Weights, styles and range of use.", "الأوزان والأنماط ومدى الاستخدام.", 10),

  // Photography
  criterion("photography", "concept", "Concept", "الفكرة", "Strength of the visual idea.", "قوة الفكرة البصرية.", 25),
  criterion("photography", "composition", "Composition", "التكوين", "Framing, balance and visual hierarchy.", "التأطير والتوازن والتسلسل البصري.", 25),
  criterion("photography", "technique", "Lighting & Technique", "الإضاءة والتقنية", "Lighting control and technical command.", "التحكم في الإضاءة والإتقان التقني.", 25),
  criterion("photography", "post", "Post-production", "المعالجة اللاحقة", "Retouching and colour treatment.", "التنقيح ومعالجة الألوان.", 15),
  criterion("photography", "effectiveness", "Commercial Effectiveness", "الفاعلية التجارية", "Fit with the commercial objective.", "الملاءمة للهدف التجاري.", 10),

  // Film
  criterion("film", "story", "Concept & Storytelling", "الفكرة والسرد", "Narrative clarity and emotional pull.", "وضوح السرد وقدرته على التأثير.", 25),
  criterion("film", "direction", "Direction", "الإخراج", "Directorial choices and performance.", "الخيارات الإخراجية والأداء.", 20),
  criterion("film", "cinematography", "Cinematography", "التصوير السينمائي", "Camera, lighting and visual language.", "الكاميرا والإضاءة واللغة البصرية.", 20),
  criterion("film", "edit", "Editing & Sound", "المونتاج والصوت", "Pacing, cut and sound design.", "الإيقاع والقطع وتصميم الصوت.", 20),
  criterion("film", "impact", "Impact", "الأثر", "Overall effect on the intended audience.", "الأثر العام على الجمهور المستهدف.", 15),

  // Digital
  criterion("digital", "concept", "Concept", "الفكرة", "Originality of the idea and its framing.", "أصالة الفكرة وطريقة طرحها.", 20),
  criterion("digital", "ux", "User Experience", "تجربة المستخدم", "Flow, clarity and accessibility.", "انسيابية التجربة ووضوحها وسهولة الوصول.", 25),
  criterion("digital", "visual", "Visual Design", "التصميم البصري", "Craft of the interface and visual system.", "حرفية الواجهة والنظام البصري.", 25),
  criterion("digital", "technical", "Technical Execution", "التنفيذ التقني", "Build quality and performance.", "جودة التنفيذ والأداء.", 15),
  criterion("digital", "innovation", "Innovation", "الابتكار", "New thinking in approach or technology.", "التفكير الجديد في المقاربة أو التقنية.", 15),

  // Layout
  criterion("layout", "concept", "Concept", "الفكرة", "Editorial idea and its expression.", "الفكرة التحريرية وطريقة التعبير عنها.", 20),
  criterion("layout", "typography", "Typography", "الطباعة", "Type choices, hierarchy and detail.", "اختيار الخطوط والتسلسل والتفاصيل.", 25),
  criterion("layout", "grid", "Grid & Composition", "الشبكة والتكوين", "Structure, pacing and page architecture.", "البنية والإيقاع ومعمار الصفحة.", 25),
  criterion("layout", "production", "Production Quality", "جودة الإنتاج", "Print, stock and finishing decisions.", "قرارات الطباعة والورق والتشطيب.", 15),
  criterion("layout", "coherence", "Coherence", "التماسك", "Consistency across the full piece.", "الاتساق عبر العمل بالكامل.", 15),
];

export function subCategoriesByParent(parentId: string): SubCategory[] {
  return subCategories.filter((sub) => sub.parentId === parentId);
}

export function criteriaByParent(parentId: string): Criterion[] {
  return criteria.filter((item) => item.parentCategoryId === parentId);
}
