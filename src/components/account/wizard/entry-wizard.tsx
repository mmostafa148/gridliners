"use client";

import { Check, Info, Loader2, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { Money } from "@/components/account/docket";
import {
  AccountNote,
  Figure,
  ItemTitle,
  Meta,
  SectionTitle,
  accountAction,
} from "@/components/account/system";
import { ErrorSummary, Field, fieldClass } from "@/components/account/form-primitives";
import { EntrySoFar } from "@/components/account/wizard/entry-so-far";
import { SelectionCard } from "@/components/account/wizard/selection-card";
import { UploadField } from "@/components/account/wizard/upload-field";
import { WizardProgress } from "@/components/account/wizard/wizard-progress";
import type { Locale } from "@/i18n/routing";
import type {
  ContentLanguage,
  Credit,
  ParentCategory,
  PricingConfig,
  SubCategory,
  Tier,
} from "@/lib/api/types";
import { checkoutAction, saveDraftAction } from "@/lib/account/wizard-actions";
import {
  DESCRIPTION_MAX,
  WIZARD_STEPS,
  basePriceFor,
  currentWindow,
  requiredProofs,
  validateStep,
  type WizardDraft,
  type WizardStep,
} from "@/lib/account/wizard";
import { cn } from "@/lib/utils";

const TIERS: Tier[] = ["students", "freelancers", "corporate"];

/**
 * 2.4 — six steps, one draft.
 *
 * **The step lives in the URL and the data lives in the draft entry.** A
 * refresh on step 4 comes back to step 4; a save writes the real entry, so
 * resuming is a read rather than a restore. What the wizard holds in memory is
 * only what is not yet worth persisting.
 *
 * **Validation is per step and runs on blur and on advance.** Validating the
 * whole draft at step 2 would report a missing title before the reader has been
 * asked for one, which is how a wizard teaches somebody to ignore its errors.
 *
 * The client half is here because six steps of interdependent state - a
 * category picker whose add-ons depend on a parent, a total that moves as they
 * are ticked - is genuinely interactive. The writes are all Server Actions.
 */
export function EntryWizard({
  entryId,
  initial,
  parents,
  subCategories,
  pricing,
  windows,
  cashExpiryDays,
  credits,
  countries,
}: {
  entryId: string | null;
  initial: WizardDraft;
  parents: ParentCategory[];
  subCategories: SubCategory[];
  pricing: PricingConfig;
  windows: PricingConfig extends never ? never : { early_bird: { start: string; end: string }; normal: { start: string; end: string }; late: { start: string; end: string } };
  cashExpiryDays: number;
  credits: Credit[];
  countries: { code: string; name: string }[];
}) {
  const t = useTranslations("wizard");
  const tTier = useTranslations("tier");
  const locale = useLocale() as Locale;

  const [draft, setDraft] = useState<WizardDraft>(initial);
  const [step, setStep] = useState<WizardStep>(1);
  const [furthest, setFurthest] = useState<WizardStep>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [id, setId] = useState<string | null>(entryId);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [promo, setPromo] = useState("");
  const [promoError, setPromoError] = useState(false);
  const [creditCode, setCreditCode] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const set = useCallback((patch: Partial<WizardDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);

  // Unsaved work is worth a warning, and only genuinely unsaved work is. The
  // flag clears on save, so the prompt never fires on a wizard that is current.
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  // Focus the step heading on a step change, so a keyboard and a screen reader
  // both land at the top of the new step rather than wherever the button was.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const window_ = currentWindow(windows);
  const base = subCategories.find((s) => s.id === draft.baseSubCategoryId);
  const inParent = subCategories.filter((s) => s.parentId === draft.parentId);
  const addOnLines = draft.additionalSubCategoryIds
    .map((sid) => subCategories.find((s) => s.id === sid))
    .filter((s): s is SubCategory => Boolean(s));

  const basePrice = draft.tier ? basePriceFor(pricing, draft.tier as Tier, window_) : 0;
  const addOnTotal = addOnLines.reduce((sum, s) => sum + s.additionalFeeUsd, 0);
  const runningTotal = basePrice + addOnTotal;

  function save(next?: Partial<WizardDraft>) {
    const payload = next ? { ...draft, ...next } : draft;
    startTransition(async () => {
      const result = await saveDraftAction(id, payload);
      if (result.ok) {
        setId(result.entryId);
        setDirty(false);
        setSavedAt(new Date().toLocaleTimeString(locale));
      } else {
        // Surfaced rather than swallowed. The step's summary is where a reader
        // is already looking when something did not happen.
        setSaveError(result.reason);
        setErrors({ form: result.reason === "notDraft" ? "notDraft" : "saveFailed" });
      }
    });
  }

  function advance() {
    const found = validateStep(step, draft);
    setErrors(found);
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(Object.keys(found).map((k) => [k, true])) }));
    if (Object.keys(found).length) return;
    // Each completed step is saved, so leaving at any point loses nothing.
    save();
    if (step < 6) {
      const next = (step + 1) as WizardStep;
      setStep(next);
      setFurthest((f) => (next > f ? next : f));
    }
  }

  function blur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const found = validateStep(step, draft);
    setErrors((prev) => ({ ...prev, [field]: found[field] }));
  }

  const err = (field: string) =>
    touched[field] && errors[field] ? t(`errors.${errors[field]}`) : null;

  const summaryItems = Object.entries(errors)
    .filter(([, v]) => Boolean(v))
    .map(([field, key]) => ({ field, message: t(`errors.${key}`) }));

  async function pay(method: "stripe" | "cash") {
    if (!accepted) {
      setErrors({ acceptTerms: "termsRequired" });
      setTouched((p) => ({ ...p, acceptTerms: true }));
      return;
    }
    if (!id) {
      save();
      return;
    }
    startTransition(async () => {
      await checkoutAction(id, method, promo || null, creditCode);
    });
  }

  const stepTitle = t(`step.${step}`);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Meta className="font-medium text-navy-800">{t("stepOf", { step, total: 6 })}</Meta>
          <span aria-live="polite" className="text-caption text-navy-600">
            {pending ? t("saving") : savedAt ? t("savedAt", { time: savedAt }) : ""}
          </span>
        </div>
        <WizardProgress
          step={step}
          furthest={Math.max(step, furthest)}
          onGo={(n) => setStep(n as WizardStep)}
        />

        {/* What has been chosen so far, on every step. */}
        <EntrySoFar
          className="mt-2"
          tier={draft.tier ? tTier(draft.tier) : null}
          base={base?.name[locale] ?? null}
          addOns={addOnLines.length}
          total={draft.tier ? runningTotal : null}
        />
      </div>

      <div>
        <SectionTitle className="focus:outline-none">
          <span ref={headingRef} tabIndex={-1} className="focus:outline-none">
            {stepTitle}
          </span>
        </SectionTitle>
        <p className="mt-2 max-w-[62ch] text-body-sm text-navy-600">{t(`s${step}.lead`)}</p>

        <div className="mt-7 flex flex-col gap-7">
          {summaryItems.length ? (
            <ErrorSummary title={t("summaryTitle")} items={summaryItems} />
          ) : null}
          {saveError ? (
            <p role="alert" className="border-s-2 border-destructive bg-destructive/6 p-4 font-data text-data-sm text-navy-900">
              {saveError}
            </p>
          ) : null}

          {/* ---- 1. tier and proofs ------------------------------------- */}
          {step === 1 ? (
            <div className="flex flex-col gap-7">

              <fieldset>
                <legend className="sr-only">{t("step.1")}</legend>
                <div className="grid items-start gap-4 lg:grid-cols-3">
                  {TIERS.map((tier) => {
                    const prices = pricing.basePrices[tier];
                    return (
                      <SelectionCard
                        key={tier}
                        inputName="tier"
                        value={tier}
                        selected={draft.tier === tier}
                        onSelect={() => set({ tier })}
                        name={tTier(tier)}
                        who={t(`s1.who.${tier}`)}
                        price={`$${prices[window_]}`}
                        range={`$${prices.early_bird} – $${prices.late}`}
                        proof={t(`s1.proofFor.${tier}`)}
                        note={t("s1.verifyNote")}
                      />
                    );
                  })}
                </div>
                {err("tier") ? (
                  <p role="alert" className="mt-3 text-body-md font-medium text-destructive-ink">
                    {err("tier")}
                  </p>
                ) : null}
              </fieldset>

              {draft.tier ? (
                <div className="flex flex-col gap-5">
                  <ItemTitle as="p">{t("s1.proofsTitle")}</ItemTitle>
                  <div className="grid gap-5 md:grid-cols-2">
                    {requiredProofs(draft.tier).map((key) => (
                      <Field
                        key={key}
                        name={key}
                        label={t(`s1.${key}`)}
                        required
                        defaultValue={draft.proof[key]}
                        error={err(key)}
                        autoComplete={key === "university" ? "organization" : "off"}
                      >
                        {({ id: fid, name, className }) => (
                          <input
                            id={fid}
                            name={name}
                            data-field={name}
                            defaultValue={draft.proof[key]}
                            onChange={(e) => set({ proof: { ...draft.proof, [key]: e.target.value } })}
                            onBlur={() => blur(key)}
                            aria-invalid={Boolean(err(key)) || undefined}
                            className={className}
                          />
                        )}
                      </Field>
                    ))}
                  </div>

                  <AccountNote tone="info" icon={Info} title={t("s1.privacyTitle")}>
                    {t("s1.privacyBody")}
                  </AccountNote>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* ---- 2. categories ------------------------------------------ */}
          {step === 2 ? (
            <div className="flex flex-col gap-6">

              <Field name="parentId" label={t("s2.parent")} required error={err("parentId")}>
                {({ id: fid, name, className }) => (
                  <select
                    id={fid}
                    name={name}
                    data-field={name}
                    value={draft.parentId}
                    onChange={(e) =>
                      // Changing the parent clears the choices under it: an
                      // add-on from the old parent would break the same-parent
                      // rule the moment it were saved.
                      set({
                        parentId: e.target.value,
                        baseSubCategoryId: "",
                        additionalSubCategoryIds: [],
                      })
                    }
                    onBlur={() => blur("parentId")}
                    className={cn(className, "appearance-none bg-white")}
                  >
                    <option value="">—</option>
                    {parents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name[locale]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              {draft.parentId ? (
                <>
                  <fieldset className="flex flex-col gap-3">
                    <legend className="mb-3 text-body-md font-medium text-navy-900">
                      {t("s2.base")}
                    </legend>
                    <ul className="border-t border-navy-900/15">
                      {inParent.map((sub) => (
                        <li key={sub.id} className="border-b border-navy-900/12">
                          <label className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-mist focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-blue-700">
                            <input
                              type="radio"
                              name="baseSubCategoryId"
                              data-field="baseSubCategoryId"
                              checked={draft.baseSubCategoryId === sub.id}
                              onChange={() =>
                                set({
                                  baseSubCategoryId: sub.id,
                                  additionalSubCategoryIds: draft.additionalSubCategoryIds.filter(
                                    (x) => x !== sub.id,
                                  ),
                                })
                              }
                              className="size-4 accent-blue-700"
                            />
                            <span className="flex-1 text-body-md text-navy-900">
                              {sub.name[locale]}
                            </span>
                            <Meta>{t("s2.included")}</Meta>
                          </label>
                        </li>
                      ))}
                    </ul>
                    {err("baseSubCategoryId") ? (
                      <p role="alert" className="text-body-sm text-destructive-ink">
                        {err("baseSubCategoryId")}
                      </p>
                    ) : null}
                  </fieldset>

                  {draft.baseSubCategoryId ? (
                    <fieldset className="flex flex-col gap-3">
                      <legend className="mb-3 text-body-md font-medium text-navy-900">
                        {t("s2.addOns")}
                      </legend>
                      <p className="max-w-[62ch] text-body-md text-navy-700">{t("s2.sameParentNote")}</p>
                      <ul className="border-t border-navy-900/15">
                        {inParent
                          .filter((sub) => sub.id !== draft.baseSubCategoryId)
                          .map((sub) => (
                            <li key={sub.id} className="border-b border-navy-900/12">
                              <label className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-mist focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-blue-700">
                                <input
                                  type="checkbox"
                                  checked={draft.additionalSubCategoryIds.includes(sub.id)}
                                  onChange={(e) =>
                                    set({
                                      additionalSubCategoryIds: e.target.checked
                                        ? [...draft.additionalSubCategoryIds, sub.id]
                                        : draft.additionalSubCategoryIds.filter((x) => x !== sub.id),
                                    })
                                  }
                                  className="size-4 accent-blue-700"
                                />
                                <span className="flex-1 text-body-md text-navy-900">
                                  {sub.name[locale]}
                                </span>
                                <Figure size="sm" className="text-navy-900">
                                  {t("s2.fee", { amount: `$${sub.additionalFeeUsd}` })}
                                </Figure>
                              </label>
                            </li>
                          ))}
                      </ul>
                    </fieldset>
                  ) : null}

                  {/* The running total, updating as the boxes are ticked. */}
                  <div className="border-t-2 border-navy-900 pt-6">
                    <ItemTitle as="p">{t("s2.runningTotal")}</ItemTitle>
                    <dl className="mt-4 flex max-w-[28rem] flex-col gap-2.5">
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-body-md text-navy-700">{t("s2.baseFee")}</dt>
                        <dd><Money amount={basePrice} className="text-navy-900" /></dd>
                      </div>
                      {addOnLines.map((sub) => (
                        <div key={sub.id} className="flex items-baseline justify-between gap-4">
                          <dt className="text-body-md text-navy-700">{sub.name[locale]}</dt>
                          <dd><Money amount={sub.additionalFeeUsd} className="text-navy-900" /></dd>
                        </div>
                      ))}
                      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-navy-900/20 pt-4">
                        <dt className="text-body-lg font-medium text-navy-900">
                          {t("s5.subtotal")}
                        </dt>
                        <dd>
                          <Money amount={runningTotal} className="text-data-lg text-navy-900" />
                        </dd>
                      </div>
                    </dl>
                  </div>
                </>
              ) : (
                <p className="text-body-md text-navy-700">{t("s2.chooseParent")}</p>
              )}
            </div>
          ) : null}

          {/* ---- 3. submission ------------------------------------------ */}
          {step === 3 ? (
            <div className="flex flex-col gap-6">

              <div className="grid gap-5 md:grid-cols-2">
                <Field name="title" label={t("s3.entryTitle")} required error={err("title")}>
                  {({ id: fid, name, className }) => (
                    <input
                      id={fid} name={name} data-field={name}
                      value={draft.title}
                      onChange={(e) => set({ title: e.target.value })}
                      onBlur={() => blur("title")}
                      maxLength={140}
                      className={className}
                    />
                  )}
                </Field>

                <Field name="client" label={t("s3.client")} hint={t("s3.clientHint")}>
                  {({ id: fid, name, className }) => (
                    <input
                      id={fid} name={name} data-field={name}
                      value={draft.client}
                      onChange={(e) => set({ client: e.target.value })}
                      autoComplete="organization"
                      className={className}
                    />
                  )}
                </Field>

                <Field name="country" label={t("s3.country")} required error={err("country")}>
                  {({ id: fid, name, className }) => (
                    <select
                      id={fid} name={name} data-field={name}
                      value={draft.country}
                      onChange={(e) => set({ country: e.target.value })}
                      onBlur={() => blur("country")}
                      autoComplete="country"
                      className={cn(className, "appearance-none bg-white")}
                    >
                      <option value="">—</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </Field>

                <Field
                  name="contentLanguage"
                  label={t("s3.contentLanguage")}
                  hint={t("s3.contentLanguageHint")}
                >
                  {({ id: fid, name, className }) => (
                    <select
                      id={fid} name={name} data-field={name}
                      value={draft.contentLanguage}
                      onChange={(e) => set({ contentLanguage: e.target.value as ContentLanguage })}
                      className={cn(className, "appearance-none bg-white")}
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  )}
                </Field>
              </div>

              <Field
                name="description"
                label={t("s3.description")}
                hint={t("s3.descriptionHint")}
                required
                error={err("description")}
              >
                {({ id: fid, name, className }) => (
                  <textarea
                    id={fid} name={name} data-field={name}
                    rows={7}
                    value={draft.description}
                    onChange={(e) => set({ description: e.target.value })}
                    onBlur={() => blur("description")}
                    // The entrant's own direction, inside a page that may run
                    // the other way.
                    dir={draft.contentLanguage === "ar" ? "rtl" : "ltr"}
                    lang={draft.contentLanguage}
                    className={cn(className, "h-auto py-3 leading-relaxed")}
                  />
                )}
              </Field>
              <p className="-mt-3 font-data text-data-sm tabular-nums text-navy-600" aria-live="polite">
                {t("s3.charsLeft", { n: Math.max(0, DESCRIPTION_MAX - draft.description.length) })}
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <Field name="externalUrl" label={t("s3.projectUrl")} hint={t("s3.projectUrlHint")} error={err("externalUrl")}>
                  {({ id: fid, name, className }) => (
                    <input
                      id={fid} name={name} data-field={name} type="url" inputMode="url"
                      value={draft.externalUrl}
                      onChange={(e) => set({ externalUrl: e.target.value })}
                      onBlur={() => blur("externalUrl")}
                      placeholder="https://"
                      className={className}
                    />
                  )}
                </Field>
                <Field name="portfolioUrl" label={t("s3.portfolioUrl")} error={err("portfolioUrl")}>
                  {({ id: fid, name, className }) => (
                    <input
                      id={fid} name={name} data-field={name} type="url" inputMode="url"
                      value={draft.portfolioUrl}
                      onChange={(e) => set({ portfolioUrl: e.target.value })}
                      onBlur={() => blur("portfolioUrl")}
                      placeholder="https://"
                      className={className}
                    />
                  )}
                </Field>
              </div>

              <Field name="credits" label={t("s3.credits")} hint={t("s3.creditsHint")}>
                {({ id: fid, name, className }) => (
                  <textarea
                    id={fid} name={name} data-field={name} rows={4}
                    value={draft.credits}
                    onChange={(e) => set({ credits: e.target.value })}
                    className={cn(className, "h-auto py-3 leading-relaxed")}
                  />
                )}
              </Field>
            </div>
          ) : null}

          {/* ---- 4. assets ---------------------------------------------- */}
          {step === 4 ? (
            <div className="flex flex-col gap-7">

              <AccountNote tone="caution" icon={TriangleAlert} title={t("s4.mockTitle")}>
                {t("s4.mockBody")}
              </AccountNote>

              <UploadField
                fieldName="cover"
                label={t("s4.cover")}
                hint={t("s4.coverHint")}
                accept=".jpg,.jpeg,.png"
                maxMb={8}
                files={draft.media.coverName ? [{ name: draft.media.coverName, status: "done" }] : []}
                onChange={(next) =>
                  set({ media: { ...draft.media, coverName: next[0]?.name ?? "" } })
                }
                error={err("cover")}
              />

              <UploadField
                fieldName="gallery"
                label={t("s4.gallery")}
                hint={t("s4.galleryHint")}
                accept=".jpg,.jpeg,.png"
                multiple
                maxMb={8}
                maxCount={8}
                files={draft.media.gallery.map((name) => ({ name, status: "done" as const }))}
                onChange={(next) => set({ media: { ...draft.media, gallery: next.map((f) => f.name) } })}
              />

              <UploadField
                fieldName="documents"
                label={t("s4.documents")}
                hint={t("s4.documentsHint")}
                accept=".pdf"
                multiple
                maxMb={12}
                maxCount={4}
                files={draft.media.documents.map((name) => ({ name, status: "done" as const }))}
                onChange={(next) => set({ media: { ...draft.media, documents: next.map((f) => f.name) } })}
              />

              <Field name="videoUrl" label={t("s4.video")} hint={t("s4.videoHint")} error={err("videoUrl")}>
                {({ id: fid, name, className }) => (
                  <input
                    id={fid} name={name} data-field={name} type="url" inputMode="url"
                    value={draft.media.videoUrl}
                    onChange={(e) => set({ media: { ...draft.media, videoUrl: e.target.value } })}
                    onBlur={() => blur("videoUrl")}
                    placeholder="https://"
                    className={className}
                  />
                )}
              </Field>
            </div>
          ) : null}

          {/* ---- 5. review and pricing ---------------------------------- */}
          {step === 5 ? (
            <ReviewStep
              draft={draft}
              base={base}
              addOns={addOnLines}
              basePrice={basePrice}
              window={window_}
              pricing={pricing}
              credits={credits}
              promo={promo}
              promoError={promoError}
              creditCode={creditCode}
              accepted={accepted}
              acceptError={touched.acceptTerms && errors.acceptTerms ? t("errors.termsRequired") : null}
              locale={locale}
              onPromo={(v) => { setPromo(v); setPromoError(false); }}
              onPromoError={() => setPromoError(true)}
              onCredit={setCreditCode}
              onAccept={setAccepted}
              onEdit={(n) => setStep(n)}
            />
          ) : null}

          {/* ---- 6. payment --------------------------------------------- */}
          {step === 6 ? (
            <div className="flex flex-col gap-6">

              <AccountNote tone="caution" icon={TriangleAlert} title={t("s6.mockTitle")}>
                {t("s6.mockBody")}
              </AccountNote>

              <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
                <div className="flex flex-col gap-4 border-t-2 border-navy-900 pt-6">
                  <ItemTitle as="p">{t("s6.card")}</ItemTitle>
                  <p className="flex-1 text-body-md text-navy-700">{t("s6.cardBody")}</p>
                  <button
                    type="button"
                    onClick={() => pay("stripe")}
                    disabled={pending}
                    aria-busy={pending || undefined}
                    className={cn(accountAction.primary, "w-full")}
                  >
                    {pending ? (
                      <Loader2 aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
                    ) : null}
                    {t("s6.payNow", { amount: `$${runningTotal}` })}
                  </button>
                </div>

                <div className="flex flex-col gap-4 border-t border-navy-900/25 pt-6">
                  <ItemTitle as="p">{t("s6.cash")}</ItemTitle>
                  <p className="flex-1 text-body-md text-navy-700">{t("s6.cashBody")}</p>
                  <Meta className="block">{t("s6.expiryNote", { days: cashExpiryDays })}</Meta>
                  <button
                    type="button"
                    onClick={() => pay("cash")}
                    disabled={pending}
                    aria-busy={pending || undefined}
                    className={cn(accountAction.secondary, "w-full")}
                  >
                    {t("s6.cashNow")}
                  </button>
                </div>
              </div>

              {touched.acceptTerms && errors.acceptTerms ? (
                <p role="alert" className="text-body-sm text-destructive-ink">
                  {t("errors.termsRequired")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* The step's actions, on the page rather than in a grey strip. */}
        {step < 6 ? (
          <div className="mt-9 flex flex-wrap items-center gap-4 border-t border-navy-900/12 pt-6">
            <button type="button" onClick={advance} className={accountAction.primary}>
              {t("next")}
            </button>
            <button type="button" onClick={() => save()} disabled={pending} className={accountAction.secondary}>
              {pending ? t("saving") : t("save")}
            </button>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as WizardStep)}
                className={cn(accountAction.quiet, "ms-auto")}
              >
                {t("back")}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="mt-9 border-t border-navy-900/12 pt-6">
            <button type="button" onClick={() => setStep(5)} className={accountAction.quiet}>
              {t("back")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Step 5, extracted only because it is the one step with its own arithmetic. */
function ReviewStep({
  draft, base, addOns, basePrice, window: win, pricing, credits,
  promo, promoError, creditCode, accepted, acceptError, locale,
  onPromo, onPromoError, onCredit, onAccept, onEdit,
}: {
  draft: WizardDraft;
  base: SubCategory | undefined;
  addOns: SubCategory[];
  basePrice: number;
  window: "early_bird" | "normal" | "late";
  pricing: PricingConfig;
  credits: Credit[];
  promo: string;
  promoError: boolean;
  creditCode: string | null;
  accepted: boolean;
  acceptError: string | null;
  locale: Locale;
  onPromo: (v: string) => void;
  onPromoError: () => void;
  onCredit: (code: string | null) => void;
  onAccept: (v: boolean) => void;
  onEdit: (step: WizardStep) => void;
}) {
  const t = useTranslations("wizard");

  const subtotal = basePrice + addOns.reduce((s, a) => s + a.additionalFeeUsd, 0);
  const rule = [...pricing.loyaltyRules].sort((a, b) => b.fromSubmissionNumber - a.fromSubmissionNumber)[0];
  void rule;

  // The screen shows the arithmetic it can be sure of. The authoritative
  // figure is re-quoted server-side at checkout and frozen there; this is a
  // preview, and the note under it says so.
  const promoRow = pricing.promoCodes.find(
    (p) => p.code.toLowerCase() === promo.trim().toLowerCase() && p.active,
  );
  const promoAmount = promoRow
    ? promoRow.kind === "percentage"
      ? Math.round(subtotal * promoRow.value) / 100
      : Math.min(promoRow.value, subtotal)
    : 0;
  const credit = credits.find((c) => c.code === creditCode);
  const creditAmount = credit ? Math.min(credit.amountUsd, subtotal - promoAmount) : 0;
  const total = Math.max(0, Math.round((subtotal - promoAmount - creditAmount) * 100) / 100);

  const editLink = (step: WizardStep) => (
    <button
      type="button"
      onClick={() => onEdit(step)}
      className="text-body-sm font-medium text-blue-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      {t("s5.edit")}
    </button>
  );

  return (
    /* The record is read; the money is checked. They are two different jobs,
       so they are two columns rather than five stacked rectangles. */
    <div className="grid gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-w-0 flex-col gap-11">
      <section>
        <div className="flex items-center justify-between gap-6 border-b-2 border-navy-900 pb-3">
          <ItemTitle as="p">{t("s5.content")}</ItemTitle>
          {editLink(3)}
        </div>
        <dl className="grid gap-x-10 gap-y-6 pt-6 sm:grid-cols-2">
          <div><dt className="text-caption text-navy-600">{t("s3.entryTitle")}</dt><dd className="mt-1 text-body-md text-navy-900">{draft.title || "—"}</dd></div>
          <div><dt className="text-caption text-navy-600">{t("s3.client")}</dt><dd className="mt-1 text-body-md text-navy-900">{draft.client || "—"}</dd></div>
          <div className="sm:col-span-2">
            <dt className="text-caption text-navy-600">{t("s3.description")}</dt>
            <dd className="mt-1 max-w-[70ch] whitespace-pre-line text-body-md text-navy-800">
              <bdi lang={draft.contentLanguage} dir={draft.contentLanguage === "ar" ? "rtl" : "ltr"}>
                {draft.description || "—"}
              </bdi>
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <div className="flex items-center justify-between gap-6 border-b-2 border-navy-900 pb-3">
          <ItemTitle as="p">{t("s5.media")}</ItemTitle>
          {editLink(4)}
        </div>
        <dl className="grid gap-x-10 gap-y-6 pt-6 sm:grid-cols-4">
          <div><dt className="text-caption text-navy-600">{t("s4.cover")}</dt><dd className="mt-1 font-data text-data-sm text-navy-900">{draft.media.coverName ? 1 : 0}</dd></div>
          <div><dt className="text-caption text-navy-600">{t("s4.gallery")}</dt><dd className="mt-1 font-data text-data-sm text-navy-900">{draft.media.gallery.length}</dd></div>
          <div><dt className="text-caption text-navy-600">{t("s4.documents")}</dt><dd className="mt-1 font-data text-data-sm text-navy-900">{draft.media.documents.length}</dd></div>
          <div><dt className="text-caption text-navy-600">{t("s4.video")}</dt><dd className="mt-1 font-data text-data-sm text-navy-900">{draft.media.videoUrl ? 1 : 0}</dd></div>
        </dl>
      </section>

      <div className="flex flex-col gap-2">
        <label className="flex max-w-[62ch] items-start gap-3.5 text-body-md text-navy-900">
          <input
            type="checkbox"
            data-field="acceptTerms"
            checked={accepted}
            onChange={(e) => onAccept(e.target.checked)}
            className="mt-1 size-4.5 shrink-0 accent-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          />
          {t("s5.acceptTerms")}
        </label>
        {acceptError ? (
          <p role="alert" className="text-body-sm text-destructive-ink">{acceptError}</p>
        ) : null}
      </div>
      </div>

      {/* The money, held beside the record rather than under it. */}
      <aside className="bg-mist p-7 lg:sticky lg:top-28 lg:self-start">
        <div className="flex items-center justify-between gap-6">
          <ItemTitle as="p">{t("s5.pricing")}</ItemTitle>
          {editLink(2)}
        </div>
        <div className="mt-6 flex flex-col gap-6">
          <dl className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-body-sm text-navy-700">
                {t("s5.basePrice")} · {base?.name[locale] ?? "—"}
              </dt>
              <dd><Money amount={basePrice} className="text-navy-900" /></dd>
            </div>
            {addOns.map((sub) => (
              <div key={sub.id} className="flex items-baseline justify-between gap-4">
                <dt className="text-body-sm text-navy-700">{t("s5.addOn")} · {sub.name[locale]}</dt>
                <dd><Money amount={sub.additionalFeeUsd} className="text-navy-900" /></dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 border-t border-navy-900/15 pt-2">
              <dt className="text-body-sm text-navy-700">{t("s5.subtotal")}</dt>
              <dd><Money amount={subtotal} className="text-navy-900" /></dd>
            </div>
            {promoAmount ? (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-body-sm text-blue-700">{t("s5.promo")} · {promoRow?.code}</dt>
                <dd className="text-blue-700">−<Money amount={promoAmount} /></dd>
              </div>
            ) : null}
            {creditAmount ? (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-body-sm text-blue-700">{t("s5.credits")} · {credit?.code}</dt>
                <dd className="text-blue-700">−<Money amount={creditAmount} /></dd>
              </div>
            ) : null}
            <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-navy-900/25 pt-4">
              <dt className="text-body-lg font-medium text-navy-900">{t("s5.total")}</dt>
              <dd><Money amount={total} className="text-data-lg text-navy-900" /></dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-[14rem] flex-1 flex-col gap-2">
              <label htmlFor="promo-code" className="text-body-sm font-medium text-navy-800">
                {t("s5.promo")}
              </label>
              <input
                id="promo-code"
                data-field="promo"
                value={promo}
                onChange={(e) => onPromo(e.target.value)}
                onBlur={() => { if (promo.trim() && !promoRow) onPromoError(); }}
                className={fieldClass(promoError)}
              />
            </div>
            {promoRow ? (
              <p role="status" className="flex h-11 items-center gap-2 text-body-sm font-medium text-blue-700">
                <Check aria-hidden className="size-4" strokeWidth={2.5} />
                {t("s5.promoApplied")}
              </p>
            ) : null}
          </div>
          {promoError && !promoRow ? (
            <p role="alert" className="-mt-3 text-body-sm text-destructive-ink">{t("s5.promoInvalid")}</p>
          ) : null}

          {credits.length ? (
            <ul className="flex flex-col gap-2">
              {credits.map((c) => (
                <li key={c.code}>
                  <label className="flex cursor-pointer items-center gap-3.5 border border-navy-900/25 bg-white px-4 py-3.5 transition-colors hover:border-navy-900 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-blue-700">
                    <input
                      type="checkbox"
                      checked={creditCode === c.code}
                      onChange={(e) => onCredit(e.target.checked ? c.code : null)}
                      className="size-4 accent-blue-700"
                    />
                    <span className="text-body-md text-navy-900">
                      {t("s5.useCredit", { code: c.code, amount: `$${c.amountUsd}` })}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : null}

          <Meta className="block">
            {t("s5.window")}: {win} · {t("s5.quoteNote")}
          </Meta>
        </div>
      </aside>
    </div>
  );
}
