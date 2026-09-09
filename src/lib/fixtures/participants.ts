import type { Participant, SessionUser } from "@/lib/api/types";

/** Accounts are general at signup — tier is chosen per entry, not per account. */
export const participants: Participant[] = [
  { id: "p-001", name: "Layla Haddad", email: "layla@mizan.studio", country: "AE", uiLanguage: "en", createdAt: "2024-09-02T09:14:00Z", lifetimeSubmissions: 6 },
  { id: "p-002", name: "Omar Fathi", email: "omar.fathi@example.com", country: "EG", uiLanguage: "ar", createdAt: "2025-10-11T13:02:00Z", lifetimeSubmissions: 3 },
  { id: "p-003", name: "نور الشمري", email: "noor.alshammari@example.com", country: "SA", uiLanguage: "ar", createdAt: "2025-11-18T08:45:00Z", lifetimeSubmissions: 1, jobTitle: "مصمّمة حروف", nationality: "SA", companyName: "استوديو نون", photoUrl: "/media/team-rana-khalil.webp" },
  { id: "p-004", name: "Yara Nassar", email: "yara@soukaloud.com", country: "JO", uiLanguage: "en", createdAt: "2025-12-01T16:30:00Z", lifetimeSubmissions: 0 },
  { id: "p-005", name: "Terra Atlas Agency", email: "studio@terraatlas.co", country: "AE", uiLanguage: "en", createdAt: "2025-11-20T10:05:00Z", lifetimeSubmissions: 2 },
  { id: "p-006", name: "Rami Kabbani", email: "rami@halcyon.tv", country: "LB", uiLanguage: "en", createdAt: "2025-11-25T19:22:00Z", lifetimeSubmissions: 4 },
  { id: "p-007", name: "Bayt AlNoor", email: "hello@baytalnoor.sa", country: "SA", uiLanguage: "ar", createdAt: "2025-12-04T07:10:00Z", lifetimeSubmissions: 1 },
  { id: "p-008", name: "Mira Sabbagh", email: "mira@mirastudio.design", country: "AE", uiLanguage: "en", createdAt: "2025-11-29T12:00:00Z", lifetimeSubmissions: 2 },
  { id: "p-009", name: "Karim Adel", email: "karim.adel@example.com", country: "EG", uiLanguage: "en", createdAt: "2025-12-09T14:48:00Z", lifetimeSubmissions: 3 },
  { id: "p-010", name: "Zaytoun Foods", email: "brand@zaytoun.com", country: "PS", uiLanguage: "ar", createdAt: "2025-12-12T09:35:00Z", lifetimeSubmissions: 1 },
  { id: "p-011", name: "Nour Creative", email: "team@nourcreative.co", country: "KW", uiLanguage: "en", createdAt: "2026-01-08T11:11:00Z", lifetimeSubmissions: 0 },
  { id: "p-012", name: "Vertex Labs", email: "ops@vertexlabs.io", country: "AE", uiLanguage: "en", createdAt: "2025-12-19T17:53:00Z", lifetimeSubmissions: 2 },
  { id: "p-013", name: "معرض الرياض", email: "design@riyadhexpo.sa", country: "SA", uiLanguage: "ar", createdAt: "2025-11-22T06:40:00Z", lifetimeSubmissions: 2 },
  { id: "p-014", name: "Anfa Press", email: "studio@anfapress.ma", country: "MA", uiLanguage: "en", createdAt: "2025-12-02T15:26:00Z", lifetimeSubmissions: 2 },
  { id: "p-015", name: "Lumen Motion", email: "hi@lumenmotion.co", country: "AE", uiLanguage: "en", createdAt: "2025-11-27T10:19:00Z", lifetimeSubmissions: 3 },
  { id: "p-016", name: "Qamar Studio", email: "studio@qamar.design", country: "AE", uiLanguage: "en", createdAt: "2023-08-14T08:00:00Z", lifetimeSubmissions: 8, jobTitle: "Founder & Creative Director", nationality: "AE", companyName: "Qamar Studio FZ-LLC", photoUrl: "/media/team-dina-saab.webp" },
  { id: "p-017", name: "Harbor Group", email: "brand@harborgroup.ae", country: "AE", uiLanguage: "en", createdAt: "2023-10-02T09:30:00Z", lifetimeSubmissions: 5 },
  { id: "p-018", name: "Salma Toukan", email: "salma@saltflats.photo", country: "JO", uiLanguage: "en", createdAt: "2023-09-19T13:45:00Z", lifetimeSubmissions: 4 },
  { id: "p-019", name: "Studio Meem", email: "hello@studiomeem.qa", country: "QA", uiLanguage: "en", createdAt: "2025-11-16T08:20:00Z", lifetimeSubmissions: 3 },
  { id: "p-020", name: "Dana Al Khalifa", email: "dana@alkhalifa.design", country: "BH", uiLanguage: "en", createdAt: "2025-11-19T11:05:00Z", lifetimeSubmissions: 2 },
  { id: "p-021", name: "حروف ستوديو", email: "studio@huroof.ae", country: "AE", uiLanguage: "ar", createdAt: "2025-11-21T09:40:00Z", lifetimeSubmissions: 4 },
  { id: "p-022", name: "Tarek Bensalem", email: "tarek@bensalem.tn", country: "TN", uiLanguage: "en", createdAt: "2025-11-24T15:12:00Z", lifetimeSubmissions: 1 },
  { id: "p-023", name: "Maison Zellige", email: "atelier@zellige.ma", country: "MA", uiLanguage: "en", createdAt: "2025-11-27T10:33:00Z", lifetimeSubmissions: 2 },
  { id: "p-024", name: "سلمى الحربي", email: "salma.alharbi@example.com", country: "SA", uiLanguage: "ar", createdAt: "2025-12-01T07:55:00Z", lifetimeSubmissions: 1 },
  { id: "p-025", name: "Northlight Agency", email: "work@northlight.jo", country: "JO", uiLanguage: "en", createdAt: "2025-12-03T13:18:00Z", lifetimeSubmissions: 5 },
  { id: "p-026", name: "Faisal Al Mutairi", email: "faisal@almutairi.kw", country: "KW", uiLanguage: "ar", createdAt: "2025-12-06T16:47:00Z", lifetimeSubmissions: 2 },
  { id: "p-027", name: "Cedar & Salt", email: "hello@cedarandsalt.lb", country: "LB", uiLanguage: "en", createdAt: "2025-12-08T12:09:00Z", lifetimeSubmissions: 3 },
  { id: "p-028", name: "Nadia Boukhari", email: "nadia@boukhari.dz", country: "DZ", uiLanguage: "en", createdAt: "2025-12-10T09:25:00Z", lifetimeSubmissions: 1 },
  { id: "p-029", name: "مختبر الرمل", email: "lab@ramlstudio.om", country: "OM", uiLanguage: "ar", createdAt: "2025-12-13T14:02:00Z", lifetimeSubmissions: 2 },
  { id: "p-030", name: "Hala Qassem", email: "hala@qassem.iq", country: "IQ", uiLanguage: "en", createdAt: "2025-12-16T11:44:00Z", lifetimeSubmissions: 1 },
  { id: "p-031", name: "Longform Press", email: "press@longform.eg", country: "EG", uiLanguage: "en", createdAt: "2025-12-18T08:31:00Z", lifetimeSubmissions: 4 },
  { id: "p-032", name: "Basma Ait Idir", email: "basma@aitidir.ma", country: "MA", uiLanguage: "ar", createdAt: "2025-12-21T17:06:00Z", lifetimeSubmissions: 1 },
  { id: "p-033", name: "Amal Chahine", email: "p33@example.com", country: "SD", uiLanguage: "ar", createdAt: "2025-12-06T09:00:00Z", lifetimeSubmissions: 6 },
  { id: "p-034", name: "Karim Sabbagh", email: "p34@example.com", country: "SY", uiLanguage: "en", createdAt: "2025-12-07T09:00:00Z", lifetimeSubmissions: 0 },
  { id: "p-035", name: "Anfa Type Foundry", email: "studio@anfa.example", country: "SA", uiLanguage: "en", createdAt: "2025-12-08T09:00:00Z", lifetimeSubmissions: 3 },
  { id: "p-036", name: "Rasha Ait Idir", email: "p36@example.com", country: "LY", uiLanguage: "ar", createdAt: "2025-12-09T09:00:00Z", lifetimeSubmissions: 2 },
  { id: "p-037", name: "Ziad Ghandour", email: "p37@example.com", country: "YE", uiLanguage: "en", createdAt: "2025-12-10T09:00:00Z", lifetimeSubmissions: 0 },
  { id: "p-038", name: "Hadi Merzouk", email: "p38@example.com", country: "DZ", uiLanguage: "en", createdAt: "2025-12-11T09:00:00Z", lifetimeSubmissions: 2 },
  { id: "p-039", name: "Hind Al Shammari", email: "p39@example.com", country: "QA", uiLanguage: "ar", createdAt: "2025-12-12T09:00:00Z", lifetimeSubmissions: 1 },
  { id: "p-040", name: "Cedar Works", email: "studio@cedar.example", country: "SD", uiLanguage: "en", createdAt: "2025-12-13T09:00:00Z", lifetimeSubmissions: 6 },
  { id: "p-041", name: "Bilal Toukan", email: "p41@example.com", country: "LY", uiLanguage: "en", createdAt: "2025-12-14T09:00:00Z", lifetimeSubmissions: 3 },
  { id: "p-042", name: "ريم الخالد", email: "p42@example.com", country: "AE", uiLanguage: "ar", createdAt: "2025-12-15T09:00:00Z", lifetimeSubmissions: 4 },
  { id: "p-043", name: "Faisal Adel", email: "p43@example.com", country: "BH", uiLanguage: "en", createdAt: "2025-12-16T09:00:00Z", lifetimeSubmissions: 4 },
  { id: "p-044", name: "Adel Al Fahad", email: "p44@example.com", country: "JO", uiLanguage: "en", createdAt: "2025-12-17T09:00:00Z", lifetimeSubmissions: 2 },
  { id: "p-045", name: "Sabil Type Foundry", email: "studio@sabil.example", country: "MA", uiLanguage: "ar", createdAt: "2025-12-18T09:00:00Z", lifetimeSubmissions: 3 },
  { id: "p-046", name: "Farah Trabelsi", email: "p46@example.com", country: "LY", uiLanguage: "en", createdAt: "2025-12-19T09:00:00Z", lifetimeSubmissions: 4 },
  { id: "p-047", name: "Youssef Toukan", email: "p47@example.com", country: "DZ", uiLanguage: "en", createdAt: "2025-12-20T09:00:00Z", lifetimeSubmissions: 4 },
  { id: "p-048", name: "Nour Khoury", email: "p48@example.com", country: "BH", uiLanguage: "ar", createdAt: "2025-12-21T09:00:00Z", lifetimeSubmissions: 6 },
  { id: "p-049", name: "نور الشمري", email: "p49@example.com", country: "LB", uiLanguage: "en", createdAt: "2025-12-22T09:00:00Z", lifetimeSubmissions: 0 },
  { id: "p-050", name: "Meem Lab", email: "studio@meem.example", country: "IQ", uiLanguage: "en", createdAt: "2025-12-23T09:00:00Z", lifetimeSubmissions: 2 },
  { id: "p-051", name: "Layla Fathi", email: "p51@example.com", country: "JO", uiLanguage: "ar", createdAt: "2025-12-24T09:00:00Z", lifetimeSubmissions: 0 },
  { id: "p-052", name: "Youssef Al Shammari", email: "p52@example.com", country: "LB", uiLanguage: "en", createdAt: "2025-12-25T09:00:00Z", lifetimeSubmissions: 6 },
  { id: "p-053", name: "Zeina Ghandour", email: "p53@example.com", country: "QA", uiLanguage: "en", createdAt: "2025-12-26T09:00:00Z", lifetimeSubmissions: 6 },
  { id: "p-054", name: "Khaled Al Fahad", email: "p54@example.com", country: "AE", uiLanguage: "ar", createdAt: "2025-12-27T09:00:00Z", lifetimeSubmissions: 4 },
  { id: "p-055", name: "Marsa Field", email: "studio@marsa.example", country: "SA", uiLanguage: "en", createdAt: "2025-12-28T09:00:00Z", lifetimeSubmissions: 0 },
  { id: "p-056", name: "زياد درويش", email: "p56@example.com", country: "TN", uiLanguage: "en", createdAt: "2025-12-01T09:00:00Z", lifetimeSubmissions: 3 },
  { id: "p-057", name: "Hind Nassar", email: "p57@example.com", country: "QA", uiLanguage: "ar", createdAt: "2025-12-02T09:00:00Z", lifetimeSubmissions: 3 },
  { id: "p-058", name: "Sara Al Amri", email: "p58@example.com", country: "YE", uiLanguage: "en", createdAt: "2025-12-03T09:00:00Z", lifetimeSubmissions: 0 },
  { id: "p-059", name: "Layla Haddad", email: "p59@example.com", country: "MA", uiLanguage: "en", createdAt: "2025-12-04T09:00:00Z", lifetimeSubmissions: 0 },
  { id: "p-060", name: "Zellige Studio", email: "studio@zellige.example", country: "SY", uiLanguage: "ar", createdAt: "2025-12-05T09:00:00Z", lifetimeSubmissions: 6 },
  { id: "p-061", name: "Waleed Al Khalifa", email: "p61@example.com", country: "TN", uiLanguage: "en", createdAt: "2025-12-06T09:00:00Z", lifetimeSubmissions: 4 },
  { id: "p-062", name: "Jad Al Amri", email: "p62@example.com", country: "PS", uiLanguage: "en", createdAt: "2025-12-07T09:00:00Z", lifetimeSubmissions: 0 },
  { id: "p-063", name: "ريم الخالد", email: "p63@example.com", country: "AE", uiLanguage: "ar", createdAt: "2025-12-08T09:00:00Z", lifetimeSubmissions: 2 },
  { id: "p-064", name: "Sami Fathi", email: "p64@example.com", country: "DZ", uiLanguage: "en", createdAt: "2025-12-09T09:00:00Z", lifetimeSubmissions: 6 },
  { id: "p-065", name: "Meem Collective", email: "studio@meem.example", country: "LB", uiLanguage: "en", createdAt: "2025-12-10T09:00:00Z", lifetimeSubmissions: 5 },
  { id: "p-066", name: "Dana Ghandour", email: "p66@example.com", country: "SA", uiLanguage: "ar", createdAt: "2025-12-11T09:00:00Z", lifetimeSubmissions: 3 },
  { id: "p-067", name: "Salma Fathi", email: "p67@example.com", country: "LY", uiLanguage: "en", createdAt: "2025-12-12T09:00:00Z", lifetimeSubmissions: 4 },
  { id: "p-068", name: "Idris Boukhari", email: "p68@example.com", country: "SA", uiLanguage: "en", createdAt: "2025-12-13T09:00:00Z", lifetimeSubmissions: 0 },
  { id: "p-069", name: "Reem Sabbagh", email: "p69@example.com", country: "IQ", uiLanguage: "ar", createdAt: "2025-12-14T09:00:00Z", lifetimeSubmissions: 6 },
  { id: "p-070", name: "Manara Field", email: "studio@manara.example", country: "BH", uiLanguage: "en", createdAt: "2025-12-15T09:00:00Z", lifetimeSubmissions: 4 },
  { id: "p-071", name: "Salma Ait Idir", email: "p71@example.com", country: "KW", uiLanguage: "en", createdAt: "2025-12-16T09:00:00Z", lifetimeSubmissions: 4 },
  { id: "p-072", name: "Tamer Fathi", email: "p72@example.com", country: "SY", uiLanguage: "ar", createdAt: "2025-12-17T09:00:00Z", lifetimeSubmissions: 0 },
  { id: "p-073", name: "Tarek Serhan", email: "p73@example.com", country: "BH", uiLanguage: "en", createdAt: "2025-12-18T09:00:00Z", lifetimeSubmissions: 4 },
  { id: "p-074", name: "Basma Haddad", email: "p74@example.com", country: "LB", uiLanguage: "en", createdAt: "2025-12-19T09:00:00Z", lifetimeSubmissions: 0 },
  { id: "p-075", name: "Sidr Type Foundry", email: "studio@sidr.example", country: "SA", uiLanguage: "ar", createdAt: "2025-12-20T09:00:00Z", lifetimeSubmissions: 3 },
  { id: "p-076", name: "Rana Ghandour", email: "p76@example.com", country: "BH", uiLanguage: "en", createdAt: "2025-12-21T09:00:00Z", lifetimeSubmissions: 1 },
  { id: "p-077", name: "سلمى الحربي", email: "p77@example.com", country: "SD", uiLanguage: "en", createdAt: "2025-12-22T09:00:00Z", lifetimeSubmissions: 6 },
  { id: "p-078", name: "Yara Toukan", email: "p78@example.com", country: "MA", uiLanguage: "ar", createdAt: "2025-12-23T09:00:00Z", lifetimeSubmissions: 4 },
  { id: "p-079", name: "Ziad Khoury", email: "p79@example.com", country: "DZ", uiLanguage: "en", createdAt: "2025-12-24T09:00:00Z", lifetimeSubmissions: 3 },
  { id: "p-080", name: "Sahel Atelier", email: "studio@sahel.example", country: "BH", uiLanguage: "en", createdAt: "2025-12-25T09:00:00Z", lifetimeSubmissions: 0 },
];

/**
 * Mocked sessions. AuthService swaps between these so every shell can be
 * exercised before real authentication lands.
 */
export const sessionUsers: Record<string, SessionUser> = {
  participant: {
    id: "u-participant",
    name: "Layla Haddad",
    email: "layla@mizan.studio",
    role: "participant",
    uiLanguage: "en",
    participantId: "p-001",
  },
  jury: {
    id: "u-jury",
    name: "Dana Khoury",
    email: "dana.khoury@gridliners.com",
    role: "jury",
    uiLanguage: "en",
    jurorId: "j-001",
  },
  admin: {
    id: "u-admin",
    name: "Gridliners Admin",
    email: "admin@gridliners.com",
    role: "admin",
    uiLanguage: "en",
  },
};

/**
 * Sign-in credentials — a MOCK, and the only place a password lives.
 *
 * **Nothing here is authentication.** There is no hashing, no salt, no rate
 * limit and no token store worth the name: this exists so 2.1's forms have
 * something true to succeed and fail against, and it is replaced wholesale
 * when a real provider lands. Authentication is mocked behind the
 * `AuthService` interface for exactly this reason.
 *
 * The passwords are deliberately obvious. A demo account whose password has to
 * be looked up is a demo account nobody opens.
 */
export interface MockAccount {
  userId: string;
  participantId: string;
  email: string;
  password: string;
  name: string;
  uiLanguage: "en" | "ar";
}

/**
 * Three accounts, because the brief asks for three situations.
 *
 * - **Qamar Studio** is the fully populated English account: nine shortlisted
 *   projects, five medals across two cycles - including one project that took
 *   two different medals in two groups - and an entry in every lifecycle state.
 * - **نور الشمري** is the same thing in Arabic, with Arabic-authored entries
 *   and two medals, so the whole module can be read right-to-left against real
 *   content rather than against translated English.
 * - **Yara Nassar** has registered and done nothing else. Every list in the
 *   module has to have something to say to her, which is the empty state.
 */
export const mockAccounts: MockAccount[] = [
  {
    userId: "u-p-016",
    participantId: "p-016",
    email: "studio@qamar.design",
    password: "gridliners",
    name: "Qamar Studio",
    uiLanguage: "en",
  },
  {
    userId: "u-p-003",
    participantId: "p-003",
    email: "noor.alshammari@example.com",
    password: "gridliners",
    name: "نور الشمري",
    uiLanguage: "ar",
  },
  {
    userId: "u-p-004",
    participantId: "p-004",
    email: "yara@soukaloud.com",
    password: "gridliners",
    name: "Yara Nassar",
    uiLanguage: "en",
  },
];
