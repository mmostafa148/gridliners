"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  AwardBadge,
  DotyLockup,
  Logo,
  WinnerFrame,
  WinnerYear,
} from "@/components/brand/brand-assets";
import { PixelGrid } from "@/components/brand/pixel-grid";
import { BilingualField } from "@/components/shared/bilingual-field";
import { Countdown } from "@/components/shared/countdown";
import { MedalBadge } from "@/components/shared/medal-badge";
import { OtpModal } from "@/components/shared/otp-modal";
import { PricingSummary } from "@/components/shared/pricing-summary";
import { ProjectCard } from "@/components/shared/project-card";
import { StateChip, STATE_CHIP_VALUES } from "@/components/shared/state-chip";
import { SubCategoryFilter } from "@/components/shared/sub-category-filter";
import { TierTabs } from "@/components/shared/tier-tabs";
import {
  EmptyState,
  ErrorState,
  LoadingGrid,
} from "@/components/shared/status-patterns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cycles } from "@/lib/fixtures/cycles";
import { buildCoverage, coverageSummary } from "@/lib/fixtures/coverage";
import { entries } from "@/lib/fixtures/entries";
import { payments } from "@/lib/fixtures/payments";
import { groupResults } from "@/lib/fixtures/results";
import { parentCategories, subCategories } from "@/lib/fixtures/taxonomy";
import type { LocalizedText, Tier } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Kitchen sink body. Rendered twice by the page — once in the active locale
 * and once in the opposite one — so every token, component and fixture state
 * is visible in both directions on a single screen.
 */

const COLOR_RAMPS = [
  { name: "navy", steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: "blue", steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: "cream", steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
];

const SINGLE_COLORS = [
  "gold",
  "gold-soft",
  "gold-deep",
  "silver",
  "silver-soft",
  "silver-deep",
  "bronze",
  "bronze-soft",
  "bronze-deep",
  "finalist",
  "honorary",
  "campaign-purple",
  "campaign-lime",
  "campaign-orange",
  "campaign-yellow",
  "campaign-teal",
];

// Class names are written out in full: Tailwind extracts classes statically,
// so a template literal like `text-${step}` would never be generated.
const TYPE_STEPS: { token: string; className: string }[] = [
  { token: "display-xl", className: "text-display-xl font-display" },
  { token: "display-lg", className: "text-display-lg font-display" },
  { token: "display-md", className: "text-display-md font-display" },
  { token: "h1", className: "text-h1 font-display" },
  { token: "h2", className: "text-h2 font-display" },
  { token: "h3", className: "text-h3 font-display" },
  { token: "h4", className: "text-h4 font-display" },
  { token: "body-lg", className: "text-body-lg" },
  { token: "body-md", className: "text-body-md" },
  { token: "body-sm", className: "text-body-sm" },
  { token: "caption", className: "text-caption" },
  { token: "overline", className: "text-overline uppercase" },
];

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-border pt-8">
      <div className="space-y-1">
        <h2 className="text-h2">{title}</h2>
        {/* Notes are English-authored dev copy; lang/dir keeps their
            punctuation correct when this panel renders inside the RTL preview. */}
        {note ? (
          <p lang="en" dir="ltr" className="text-body-sm text-muted-foreground text-start">
            {note}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function KitchenSinkContent() {
  const t = useTranslations("dev");
  const [tier, setTier] = useState<Tier | "all">("all");
  const [subCategory, setSubCategory] = useState("all");
  const [otpOpen, setOtpOpen] = useState(false);
  const [bilingual, setBilingual] = useState<LocalizedText>({
    en: "Brand Identity Design",
    ar: "تصميم هوية بصرية",
  });

  const coverage = buildCoverage();
  const summary = coverageSummary(coverage);

  const activeCycle = cycles[0];
  const snapshot = payments.find((p) => p.id === "pay-001")?.snapshot;
  const cardEntries = [
    entries.find((e) => e.id === "e-001"),
    entries.find((e) => e.id === "e-003"),
    entries.find((e) => e.id === "e-005"),
  ].filter(Boolean);
  const subById = new Map(subCategories.map((s) => [s.id, s]));
  const multiMedalResults = groupResults.filter((r) => r.entryId === "e-101");

  return (
    <div className="space-y-10 pb-20">
      {/* --- Fixture coverage ------------------------------------------- */}
      <Section
        title={t("fixtures")}
        note={`${summary.passed}/${summary.total} checks passing`}
      >
        <div
          className={cn(
            "rounded-md border p-4",
            summary.failed.length === 0
              ? "border-blue-200 bg-blue-50"
              : "border-destructive/40 bg-destructive/5",
          )}
        >
          <p className="text-body-sm font-medium">
            {summary.failed.length === 0
              ? `All ${summary.total} fixture invariants pass.`
              : `${summary.failed.length} fixture invariant(s) failing.`}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {coverage.map((section) => (
            <div key={section.title} className="rounded-md border border-border p-4">
              <h3 className="text-h4">
                {section.title}{" "}
                <span className="text-body-sm font-normal text-muted-foreground">
                  ({section.count})
                </span>
              </h3>
              <ul className="mt-3 space-y-2">
                {section.checks.map((c) => (
                  <li key={c.label} className="flex items-start gap-2 text-caption">
                    <span
                      className={cn(
                        "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                        c.ok ? "bg-blue-700" : "bg-destructive",
                      )}
                      aria-hidden
                    >
                      {c.ok ? "✓" : "!"}
                    </span>
                    <span>
                      <span className="font-medium">{c.label}</span>
                      <span className="block text-muted-foreground">{c.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* --- Colors ------------------------------------------------------ */}
      <Section title={t("colors")} note="Brand ramps generated in OKLCH around the exact brand hex.">
        {COLOR_RAMPS.map((ramp) => (
          <div key={ramp.name} className="space-y-1">
            <p className="text-overline uppercase text-muted-foreground">{ramp.name}</p>
            <div className="flex flex-wrap gap-1">
              {ramp.steps.map((step) => (
                <div key={step} className="w-16">
                  <div
                    className={cn("h-12 rounded-sm border border-border")}
                    style={{ backgroundColor: `var(--color-${ramp.name}-${step})` }}
                  />
                  <p className="mt-1 text-center text-caption tabular-nums">{step}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-1">
          <p className="text-overline uppercase text-muted-foreground">
            Metals, finalist, honorary & campaign accents
          </p>
          <div className="flex flex-wrap gap-1">
            {SINGLE_COLORS.map((name) => (
              <div key={name} className="w-24">
                <div
                  className="h-12 rounded-sm border border-border"
                  style={{ backgroundColor: `var(--color-${name})` }}
                />
                <p className="mt-1 text-center text-[10px] leading-tight">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* --- Typography -------------------------------------------------- */}
      <Section
        title={t("typography")}
        note="Presicav display (EN) / Noto Sans Arabic (AR) with the brand hierarchy."
      >
        <div className="space-y-3">
          {TYPE_STEPS.map((step) => (
            <div key={step.token} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <code className="w-32 shrink-0 text-caption text-muted-foreground">
                text-{step.token}
              </code>
              <span className={step.className}>Gridliners Awards · جوائز غريدلاينرز</span>
            </div>
          ))}
        </div>
      </Section>

      {/* --- Pixel motif -------------------------------------------------- */}
      <Section title={t("pixelMotif")} note="Deterministic; dissolves along logical start/end axes.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(["corner", "edge-band", "fade", "full-bleed"] as const).map((variant, i) => (
            <div key={variant} className="space-y-2">
              <p className="text-caption text-muted-foreground">{variant} · direction=end</p>
              <PixelGrid
                variant={variant}
                direction="end"
                seed={i + 1}
                cellClassName="bg-blue-700"
                className="border border-border"
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-caption text-muted-foreground">pixel-rule utility</p>
          <div className="pixel-rule text-navy-300" />
        </div>
      </Section>

      {/* --- Brand assets -------------------------------------------------- */}
      <Section title={t("brandAssets")} note="All 15 production SVGs, unmodified.">
        <div className="flex flex-wrap items-end gap-8 rounded-md border border-border p-6">
          <Logo variant="horizontal" height={36} />
          <Logo variant="vertical" height={64} />
          <Logo variant="icon" height={40} />
          <Logo variant="logotype" height={24} />
        </div>

        <div className="flex flex-wrap items-end gap-6">
          {(["gold", "silver", "bronze", "finalist", "honorary"] as const).map((colorway) => (
            <div key={colorway} className="flex flex-col items-center gap-2">
              <AwardBadge colorway={colorway} height={88} alt={`${colorway} badge`} />
              <span className="text-caption text-muted-foreground">{colorway}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-6">
          {(["gold", "silver", "bronze"] as const).map((level) => (
            <WinnerFrame key={level} level={level} height={120} alt={`${level} winner frame`} />
          ))}
          <WinnerYear height={56} alt="Winner year 2026" />
          {/* White artwork — the component owns its blue backdrop. */}
          <DotyLockup height={96} alt="Designer of the Year" padding="p-6" />
        </div>
      </Section>

      {/* --- State chips -------------------------------------------------- */}
      <Section
        title={t("entryStates")}
        note="Nine states from the §3.7 machine, plus the derived Winner summary."
      >
        <div className="flex flex-wrap gap-2">
          {STATE_CHIP_VALUES.map((state) => (
            <StateChip key={state} state={state} />
          ))}
        </div>
      </Section>

      {/* --- Award levels -------------------------------------------------- */}
      <Section title={t("awardLevels")} note="Includes the withheld (thin-group) rendering.">
        <div className="flex flex-wrap gap-2">
          {(["gold", "silver", "bronze", "did_not_place", "finalist", "honorary"] as const).map(
            (level) => (
              <MedalBadge key={level} level={level} />
            ),
          )}
          <MedalBadge level="gold" withheld />
        </div>

        <div className="rounded-md border border-border p-4">
          <p className="text-body-sm font-medium">
            Multi-medal: one entry, one vote pool, two groups
          </p>
          <ul className="mt-2 space-y-1 text-caption">
            {multiMedalResults.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <MedalBadge level={r.level} withheld={r.withheld} />
                <span className="text-muted-foreground">
                  {subById.get(r.subCategoryId)?.name.en} × {r.tier} · {r.votes} votes
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* --- Shared components -------------------------------------------- */}
      <Section title={t("components")}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-overline uppercase text-muted-foreground">Tier tabs</p>
            <TierTabs value={tier} onValueChange={setTier} includeAll />

            <p className="pt-4 text-overline uppercase text-muted-foreground">
              Sub-category filter
            </p>
            <SubCategoryFilter
              parents={parentCategories}
              subCategories={subCategories}
              value={subCategory}
              onValueChange={setSubCategory}
            />

            <p className="pt-4 text-overline uppercase text-muted-foreground">Countdown</p>
            <Countdown target={activeCycle.votingWindow.end} label="Voting closes in" />
            <Countdown target="2020-01-01T00:00:00Z" label="Already closed" />
          </div>

          <div className="space-y-3">
            <p className="text-overline uppercase text-muted-foreground">
              Pricing summary (frozen snapshot)
            </p>
            {snapshot ? <PricingSummary snapshot={snapshot} frozen /> : null}

            <p className="pt-4 text-overline uppercase text-muted-foreground">OTP modal</p>
            <Button variant="outline" onClick={() => setOtpOpen(true)}>
              Open OTP flow
            </Button>
            <OtpModal
              open={otpOpen}
              onOpenChange={setOtpOpen}
              entryId="e-002"
              projectTitle="Nakhla Coffee Packaging"
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-overline uppercase text-muted-foreground">
            Bilingual field (platform-authored content)
          </p>
          <BilingualField label="Sub-category name" value={bilingual} onChange={setBilingual} />
        </div>

        <div className="space-y-3">
          <p className="text-overline uppercase text-muted-foreground">Project cards</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cardEntries.map((entry, index) => (
              <ProjectCard
                key={entry!.id}
                entry={entry!}
                subCategory={subById.get(entry!.baseSubCategoryId)}
                variant={index === 2 ? "dashboard" : index === 1 ? "result" : "public"}
                votes={index === 2 ? undefined : [620, 145][index]}
                level={index === 0 ? "gold" : undefined}
                tier={entry!.declaredTier}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-overline uppercase text-muted-foreground">
            Empty / error / loading patterns
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <EmptyState />
            <ErrorState onRetry={() => undefined} />
          </div>
          <LoadingGrid count={3} />
        </div>
      </Section>

      {/* --- Primitives ---------------------------------------------------- */}
      <Section title={t("primitives")} note="shadcn components on brand tokens.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ks-input">Input</Label>
            <Input id="ks-input" placeholder="Type here" />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Checkbox id="ks-check" />
            <Label htmlFor="ks-check">Checkbox</Label>
          </div>
        </div>

        <Progress value={62} />

        <Alert>
          <AlertTitle>Jury scoring is in progress</AlertTitle>
          <AlertDescription>
            Three of six jurors have submitted scores for this cohort.
          </AlertDescription>
        </Alert>
      </Section>
    </div>
  );
}
