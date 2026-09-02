import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EmbedSnippet } from "@/components/account/embed-snippet";
import { embedSnippet } from "@/lib/account/files/badges";
import { cn } from "@/lib/utils";

/**
 * One award's files, behind one action.
 *
 * **The sitemap names this node "Collect my awards"**, with Award Certificate
 * and Winners Package beneath it. §51 recorded the built page as fifteen equal
 * download buttons across five awards; this is the one action the map asks
 * for, and the files are what it yields.
 *
 * **A file is an object, not a link.** Three underlined blue links is the
 * weakest treatment available for what is the payoff of winning an award, and
 * it tells a participant nothing about what they are about to get. Each file is
 * a row carrying its **format**, its name, and one line on what it is for —
 * taken from the archive's own readme, so the descriptions are true. The whole
 * row is the target, which is a 60px hit area rather than a word.
 *
 * A `<details>` rather than a menu: no JavaScript is required to open it, the
 * browser supplies the disclosure semantics and keyboard behaviour, and the
 * files stay in the page rather than in a layer that can be dismissed by
 * accident. Every download is the same real route as before — nothing about how
 * a certificate is generated has changed.
 */
const FORMAT_TONE: Record<string, string> = {
  PDF: "bg-destructive/10 text-destructive-ink",
  SVG: "bg-blue-700/10 text-blue-800",
  ZIP: "bg-navy-900/8 text-navy-700",
};

export async function CollectAward({
  resultId,
  entrySlug,
  level,
  cycleYear,
  locale,
}: {
  resultId: string;
  entrySlug: string;
  level: string;
  cycleYear: number;
  locale: string;
}) {
  const t = await getTranslations("awards");

  const snippet = embedSnippet({
    badgeUrl: `https://gridliners.example/badges/${resultId}.svg`,
    // The award page is the badge-embed target (screen map 3.1). Until it
    // existed the badge pointed at the project, which is the work rather than
    // the award — related, but not the same claim.
    linkUrl: `https://gridliners.example/${locale}/awards/${resultId}`,
    label: level.charAt(0).toUpperCase() + level.slice(1),
    year: cycleYear,
  });

  const files = [
    { kind: "certificate", format: "PDF", name: t("fileCertificate"), what: t("fileCertificateWhat") },
    { kind: "badge", format: "SVG", name: t("fileBadge"), what: t("fileBadgeWhat") },
    { kind: "package", format: "ZIP", name: t("filePackage"), what: t("filePackageWhat") },
  ];

  return (
    <details className="group w-full">
      <summary
        className={cn(
          "inline-flex h-11 w-fit cursor-pointer list-none items-center gap-2.5 px-5",
          "text-[0.875rem] font-medium transition-colors",
          "bg-navy-900 text-cream-50 hover:bg-blue-700",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
        )}
      >
        <Download aria-hidden className="size-4 group-open:hidden" />
        <span className="group-open:hidden">{t("collect")}</span>
        <span className="hidden group-open:inline">{t("collectClose")}</span>
      </summary>

      <div className="mt-5 grid gap-x-8 gap-y-7 lg:grid-cols-2">
        <div className="min-w-0">
          <p
            className="mb-2.5 text-caption font-semibold uppercase tracking-[0.06em] text-navy-600"
          >
            {t("filesTitle")}
          </p>

          <ul className="flex flex-col border border-navy-900/12">
            {files.map((file) => (
              <li
                key={file.kind}
                className="border-b border-navy-900/10 last:border-b-0"
              >
                <a
                  href={`/${locale}/downloads/${file.kind}/${resultId}`}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 transition-colors hover:bg-mist",
                    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700",
                  )}
                >
                  {/* The format is information, not decoration: it tells
                      somebody whether this opens, prints or unzips. */}
                  <span
                    aria-hidden
                    className={cn(
                      "grid h-7 w-11 shrink-0 place-items-center font-data text-[0.6875rem] font-bold tracking-[0.06em]",
                      FORMAT_TONE[file.format],
                    )}
                  >
                    {file.format}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className="block text-body-sm font-medium text-navy-900"
                    >
                      {file.name}
                      <span className="sr-only"> · {file.format}</span>
                    </span>
                    <span
                      className="mt-0.5 block text-caption text-navy-600"
                    >
                      {file.what}
                    </span>
                  </span>

                  <Download
                    aria-hidden
                    className="size-4 shrink-0 text-navy-500"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* The markup, beside the files rather than under them. */}
        <div className="min-w-0">
          <EmbedSnippet snippet={snippet} />
        </div>
      </div>
    </details>
  );
}
