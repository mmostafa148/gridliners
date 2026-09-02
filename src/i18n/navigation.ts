import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware navigation. Always import Link/useRouter/usePathname from here
 * rather than from `next/link` or `next/navigation`, so internal links keep
 * the active locale prefix.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
