/**
 * The countries an entrant may select.
 *
 * **The programme's own region, not every country on earth.** Every one of the
 * 401 fixture entries sits in one of these twenty-two, the addendum scopes the
 * awards to the Arab world, and a 250-row select is a control nobody reads to
 * the end of. `countryName` resolves each code through `Intl.DisplayNames`, so
 * the list is codes here and localized names at the point of use.
 *
 * A country missing from this list is a content decision for the client, not a
 * defect in the picker: adding one is a line.
 */
export const COUNTRY_CODES = [
  "AE", "BH", "DZ", "EG", "IQ", "JO", "KW", "LB", "LY", "MA", "MR",
  "OM", "PS", "QA", "SA", "SD", "SO", "SY", "TN", "YE", "KM", "DJ",
] as const;
