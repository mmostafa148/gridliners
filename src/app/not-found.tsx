import Link from "next/link";

import { defaultLocale } from "@/i18n/routing";

/**
 * Unlocalized fallback — only reachable for paths outside /en and /ar (the
 * locale catch-all handles everything else). The root layout deliberately has
 * no <html>/<body>, so this page supplies its own.
 */
export default function RootNotFound() {
  return (
    <html lang={defaultLocale} dir="ltr">
      <body>
        <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-start justify-center gap-4 px-6">
          <h1 className="text-h1">Page not found</h1>
          <p className="text-body-md text-muted-foreground">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
          </p>
          <Link
            href={`/${defaultLocale}`}
            className="rounded-sm bg-primary px-3 py-2 text-body-sm text-primary-foreground"
          >
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
