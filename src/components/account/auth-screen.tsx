import { getFormatter, getTranslations } from "next-intl/server";

import { PixelGrid } from "@/components/brand/pixel-grid";
import { cycles } from "@/lib/fixtures/cycles";

/**
 * The focused composition the four authentication screens share.
 *
 * **Inside the website's frame, not instead of it.** The header, the footer,
 * the language control and the site's identity are all still there; this is one
 * section of a page, the way every other section on this site is.
 *
 * On desktop the participant's place in the current cycle is composed as an
 * editorial poster beside the form sheet. On smaller screens that context
 * collapses into one concise navy band above the form. The form itself stays
 * focused and unchanged across sign-in, registration and password recovery.
 */
export async function AuthScreen({
  eyebrow,
  title,
  lead,
  aside,
  formPanelClassName = "bg-cream-50",
  fullDesktopHeight = false,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  /** One sentence on the navy side — what the account is for. */
  aside: string;
  formPanelClassName?: string;
  fullDesktopHeight?: boolean;
  children: React.ReactNode;
}) {
  const [tDashboard, tPhase, format] = await Promise.all([
    getTranslations("dashboard"),
    getTranslations("cyclePhase"),
    getFormatter(),
  ]);
  const cycle = cycles.find((item) => item.status === "active") ?? cycles[0];
  const date = (value: string) =>
    format.dateTime(new Date(value), { day: "numeric", month: "short", year: "numeric" });

  return (
    // The site's fixed navigation clearance, owned here for the same reason `PageHeader`
    // owns its own: `SiteFrame`'s <main> clears the announcement bar and no
    // more, and from md the rail sits under it.
    //
    // `data-account` marks these as part of the participant module: it carries
    // the module's single type face and its Arabic letter-spacing reset.
    <div
      data-account
      className={`grid md:pt-[4.5rem] lg:grid-cols-[minmax(30rem,5fr)_minmax(34rem,7fr)] ${
        fullDesktopHeight ? "lg:min-h-[calc(100dvh-var(--announce-h))]" : ""
      } ${formPanelClassName}`}
    >
      {/* A cycle poster on desktop; one compact context band on small screens. */}
      <section className="relative isolate overflow-hidden border-b border-cream-50/15 bg-navy-950 px-6 py-8 text-cream-50 sm:px-8 lg:flex lg:min-h-full lg:flex-col lg:border-b-0 lg:border-e lg:border-navy-900/10 lg:bg-navy-50 lg:px-0 lg:py-0 lg:text-navy-900">
        <div aria-hidden className="pointer-events-none absolute end-0 top-0 -z-10 opacity-70 lg:hidden">
          <PixelGrid
            direction="start"
            seed={7}
            cols={5}
            rows={4}
            density={0.3}
            cellSize="clamp(1.25rem, 7vw, 2rem)"
            cellClassName="bg-cream-200/12"
          />
        </div>

        <div aria-hidden className="absolute inset-y-0 start-0 hidden w-[clamp(4.75rem,6vw,6rem)] overflow-hidden bg-navy-950 lg:block">
          <div className="absolute start-0 top-0 opacity-90">
            <PixelGrid
              direction="end"
              seed={11}
              cols={3}
              rows={8}
              density={0.46}
              cellSize="clamp(1.3rem,1.9vw,1.85rem)"
              cellClassName="bg-cream-200/16"
            />
          </div>
          <span className="absolute inset-y-0 end-0 w-px bg-cream-50/14" />
          <span className="absolute bottom-[18%] end-0 h-24 w-1 bg-gold" />
          <span className="absolute bottom-9 start-1/2 -translate-x-1/2 font-data text-data-sm text-cream-100/55 [writing-mode:vertical-rl]">
            {cycle.year}
          </span>
        </div>

        <div className="relative lg:flex lg:min-h-full lg:flex-1 lg:flex-col lg:justify-between lg:py-14 lg:pe-10 lg:ps-[calc(clamp(4.75rem,6vw,6rem)+3rem)] xl:py-16 xl:pe-14 xl:ps-[calc(clamp(4.75rem,6vw,6rem)+3.5rem)]">
          <div>
            <p className="font-display text-overline uppercase text-cream-200/70 lg:text-blue-700">
              {eyebrow}
            </p>
            <p className="mt-4 max-w-[27ch] font-display text-account-section leading-tight text-cream-100 lg:text-navy-900">
              {aside}
            </p>
          </div>

          <div className="mt-6 flex items-end gap-4 border-t border-cream-50/20 pt-4 lg:hidden">
            <span className="font-data text-[2.25rem] leading-none text-cream-100">{cycle.year}</span>
            <span className="pb-0.5 text-body-sm text-cream-200/70">{tPhase(cycle.phase)}</span>
          </div>

          <div className="relative my-12 hidden lg:block">
            <span aria-hidden className="pointer-events-none absolute -end-3 top-1/2 -z-10 -translate-y-1/2 font-data text-[clamp(8rem,13vw,13rem)] leading-none text-navy-900/[0.035]">
              {cycle.year}
            </span>
            <p className="font-display text-overline uppercase text-navy-500">
              {tDashboard("cycleTitle")} · {cycle.year}
            </p>
            <p className="mt-4 max-w-[8ch] font-display text-[clamp(2.8rem,4vw,4.75rem)] font-semibold leading-[0.9] tracking-[-0.045em] text-navy-950">
              {tPhase(cycle.phase)}
            </p>
            <span aria-hidden className="mt-7 block h-1 w-14 bg-gold" />
          </div>

          <dl className="relative hidden grid-cols-2 gap-8 border-t border-navy-900/20 pt-6 lg:grid">
            <span aria-hidden className="absolute -top-1 start-0 size-2 bg-gold" />
            <span aria-hidden className="absolute -top-1 end-0 size-2 border border-navy-900/35 bg-navy-50" />
            <div>
              <dt className="font-display text-overline uppercase text-navy-500">
                {tDashboard("votingCloses")}
              </dt>
              <dd className="mt-2 font-data text-data-sm text-navy-900">
                {date(cycle.votingWindow.end)}
              </dd>
            </div>
            <div className="text-end">
              <dt className="font-display text-overline uppercase text-navy-500">
                {tDashboard("resultsAt")}
              </dt>
              <dd className="mt-2 font-data text-data-sm text-navy-900">
                {date(cycle.resultsAnnouncementAt)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* The form remains the sheet the user approved. */}
      <div className="flex items-start justify-center px-5 py-10 sm:px-8 sm:py-14 lg:items-center lg:px-10 lg:py-16 xl:px-14">
        <div className="relative isolate w-full max-w-[34rem] overflow-hidden border border-navy-900/10 bg-white/90 px-6 py-8 shadow-[0_24px_80px_rgba(8,24,55,0.09)] sm:px-9 sm:py-10">
          <div aria-hidden className="absolute inset-x-0 top-0 flex h-1">
            <span className="w-20 bg-blue-700" />
            <span className="w-6 bg-gold" />
            <span className="flex-1 bg-navy-900/8" />
          </div>
          <span
            aria-hidden
            className="absolute end-5 top-5 size-2 border border-navy-900/20 bg-[#f3f3f9]"
          />

          <h1 className="max-w-[15ch] font-display text-account-title text-navy-900">{title}</h1>
          <p className="mt-3 max-w-[36ch] text-body-lg leading-relaxed text-navy-700">{lead}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
