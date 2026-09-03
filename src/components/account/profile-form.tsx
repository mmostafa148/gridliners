"use client";

import { Camera, ChevronDown, Globe2, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import {
  AccountActionBar,
  ErrorSummary,
  Field,
  PasswordField,
  SubmitButton,
  SuccessNote,
} from "@/components/account/form-primitives";
import {
  AccountPanel,
  AccountStack,
  Eyebrow,
  SectionTitle,
  accountAction,
} from "@/components/account/system";
import type { Participant } from "@/lib/api/types";
import { changePasswordAction } from "@/lib/auth/actions";
import { emptyForm } from "@/lib/auth/form-state";
import { saveProfileAction } from "@/lib/account/profile-actions";
import { cn } from "@/lib/utils";

/**
 * 2.8 — the participant, and the account behind them.
 *
 * **The route Direction C exists for.** The portrait is not a thumbnail beside
 * a form: it leads a column that also carries the account's own facts — the
 * sign-in address, membership, lifetime submissions — while the editable
 * details fill the rest of the width in named groups. §51 recorded the previous
 * page as *"a narrow form stranded beside an unused empty half-page"*.
 *
 * **Three groups, one submission.** Who you are, where you are, and how the
 * interface behaves are different questions about the same record, so they are
 * named separately and saved together, with the action bar at the end of the
 * fields it affects.
 *
 * **The password is a different job and is a different form.** Changing it and
 * changing a job title fail for different reasons and succeed at different
 * moments; one form would mean a wrong current password discards an edited
 * profile.
 *
 * Nothing is discarded silently: the dirty flag warns before the page is left,
 * and a failed save returns every value that was typed.
 */
export function ProfileForm({
  participant,
  countries,
  facts,
}: {
  participant: Participant;
  countries: { code: string; name: string }[];
  /** Account facts the server has already formatted. */
  facts: { label: string; value: string }[];
}) {
  const t = useTranslations("profile");
  const [state, action] = useActionState(saveProfileAction, emptyForm);
  const [dirty, setDirty] = useState(false);
  const [photo, setPhoto] = useState<string | null>(participant.photoUrl ?? null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const err = (field: string) =>
    state.error && state.field === field ? t(`errors.${state.error}`) : null;
  const initial = (key: string, fallback: string) => state.values?.[key] ?? fallback;

  return (
    <>
      <form action={action} noValidate onChange={() => setDirty(true)}>
        <div className="account-shell pb-5 pt-6">
          <AccountStack>
            {/* The stable account identity is the cover of the dossier. */}
            <section
              aria-labelledby="profile-dossier-title"
              className="relative overflow-hidden bg-navy-950 text-cream-50"
            >
              <span aria-hidden className="absolute inset-x-0 top-0 flex h-1">
                <span className="w-24 bg-blue-700" />
                <span className="w-8 bg-gold" />
              </span>
              <span
                aria-hidden
                className="absolute end-0 top-0 hidden size-56 translate-x-1/3 -translate-y-1/3 border-[3rem] border-white/[0.035] lg:block"
              />

              <div className="grid min-w-0 lg:grid-cols-[15rem_minmax(0,1fr)]">
                <div className="relative min-h-60 bg-cream-100/6 p-6 sm:p-8 lg:min-h-full lg:border-e lg:border-cream-50/12">
                  <span className="relative block aspect-square w-36 overflow-hidden bg-cream-50 sm:w-44 lg:w-full">
                    {photo && !removePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-navy-600">
                        <UserRound aria-hidden className="size-12" strokeWidth={1.25} />
                        <span className="sr-only">{t("unset")}</span>
                      </span>
                    )}
                  </span>
                  <span aria-hidden className="absolute bottom-0 end-0 size-8 bg-gold" />
                </div>

                <div className="relative z-10 p-6 sm:p-8 lg:p-10">
                  <Eyebrow tone="goldOnNavy">{t("identityEyebrow")}</Eyebrow>
                  <h2
                    id="profile-dossier-title"
                    className="mt-4 max-w-[18ch] font-display text-account-title leading-[1.04] text-cream-50"
                  >
                    {participant.name}
                  </h2>
                  <p className="mt-2 max-w-[54ch] text-body-md text-cream-200/80">
                    {[participant.jobTitle, participant.companyName].filter(Boolean).join(" · ") ||
                      t("identityFallback")}
                  </p>

                  <dl className="mt-8 grid max-w-[46rem] gap-x-12 gap-y-5 border-t border-cream-50/15 pt-6 sm:grid-cols-2">
                    {facts.map((fact) => (
                      <div key={fact.label} className="min-w-0">
                        <dt className="text-caption text-cream-200/65">{fact.label}</dt>
                        <dd className="mt-1 font-data text-body-sm tabular-nums text-cream-50 [overflow-wrap:anywhere]">
                          {fact.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <input type="hidden" name="photoUrl" value={removePhoto ? "" : (photo ?? "")} />
                  <input type="hidden" name="removePhoto" value={removePhoto ? "1" : "0"} />
                  <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <label
                      className={cn(
                        accountAction.onNavy,
                        "cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cream-100",
                      )}
                    >
                      <Camera aria-hidden className="size-4" strokeWidth={1.75} />
                      {t("choosePhoto")}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.svg"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            setPhoto(String(reader.result));
                            setRemovePhoto(false);
                            setDirty(true);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {photo && !removePhoto ? (
                      <button
                        type="button"
                        onClick={() => {
                          setRemovePhoto(true);
                          setDirty(true);
                        }}
                        className={accountAction.onNavyQuiet}
                      >
                        {t("removePhoto")}
                      </button>
                    ) : null}
                    <span className="basis-full text-caption text-cream-200/65 sm:basis-auto">
                      {t("photoHint")}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ---- the editable record --------------------------------- */}
            <AccountPanel title={t("accountTitle")} lead={t("accountLead")} padded={false}>
              {state.error && !state.done ? (
                <div className="px-5 pt-6 sm:px-7">
                  <ErrorSummary
                    title={t("title")}
                    items={[{ field: state.field, message: t(`errors.${state.error}`) }]}
                  />
                </div>
              ) : null}
              {state.done ? (
                <div className="px-5 pt-6 sm:px-7">
                  <SuccessNote>{t("saved")}</SuccessNote>
                </div>
              ) : null}

              <div className="bg-mist/45 p-4 sm:p-6 lg:p-7">
                <section
                  aria-labelledby="profile-identity"
                  className="relative overflow-hidden border border-navy-900/12 bg-white pt-1"
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 flex h-1">
                    <span className="w-24 bg-blue-700" />
                    <span className="w-8 bg-gold" />
                  </span>
                  <div className="flex items-start gap-4 border-b border-navy-900/10 p-5 sm:p-6">
                    <span className="grid size-11 shrink-0 place-items-center bg-blue-700/8 text-blue-700">
                      <UserRound aria-hidden className="size-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <Eyebrow className="mb-1.5">{t("identityEyebrow")}</Eyebrow>
                      <SectionTitle as="h3" id="profile-identity" className="text-body-lg">
                        {t("identityTitle")}
                      </SectionTitle>
                      <p className="mt-1 max-w-[58ch] text-body-sm text-navy-600">
                        {t("identityLead")}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    <Field
                      name="name"
                      label={t("name")}
                      autoComplete="name"
                      required
                      defaultValue={initial("name", participant.name)}
                      error={err("name")}
                    />
                    <Field
                      name="email"
                      label={t("email")}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      hint={t("emailChanged")}
                      defaultValue={initial("email", participant.email)}
                      error={err("email")}
                    />
                    <Field
                      name="jobTitle"
                      label={t("jobTitle")}
                      autoComplete="organization-title"
                      defaultValue={initial("jobTitle", participant.jobTitle ?? "")}
                    />
                    <Field
                      name="companyName"
                      label={t("companyName")}
                      autoComplete="organization"
                      defaultValue={initial("companyName", participant.companyName ?? "")}
                    />
                  </div>
                </section>

                <div className="mt-5 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
                  <section
                    aria-labelledby="profile-place"
                    className="border border-navy-900/12 bg-white p-5 sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center bg-blue-700/8 text-blue-700">
                        <MapPin aria-hidden className="size-5" strokeWidth={1.75} />
                      </span>
                      <div>
                        <SectionTitle as="h3" id="profile-place" className="text-body-lg">
                          {t("placeTitle")}
                        </SectionTitle>
                        <p className="mt-1.5 text-body-sm text-navy-600">{t("placeLead")}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Field name="nationality" label={t("nationality")}>
                        {({ id, name, className, describedBy, invalid }) => (
                          <div className="relative">
                            <select
                              id={id}
                              name={name}
                              data-field={name}
                              aria-describedby={describedBy}
                              aria-invalid={invalid || undefined}
                              defaultValue={initial("nationality", participant.nationality ?? "")}
                              className={cn(className, "appearance-none bg-white pe-12")}
                            >
                              <option value="">{t("unset")}</option>
                              {countries.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              aria-hidden
                              className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-navy-600"
                              strokeWidth={1.75}
                            />
                          </div>
                        )}
                    </Field>
                    <Field name="country" label={t("country")}>
                        {({ id, name, className, describedBy, invalid }) => (
                          <div className="relative">
                            <select
                              id={id}
                              name={name}
                              data-field={name}
                              aria-describedby={describedBy}
                              aria-invalid={invalid || undefined}
                              autoComplete="country"
                              defaultValue={initial("country", participant.country)}
                              className={cn(className, "appearance-none bg-white pe-12")}
                            >
                              <option value="">{t("unset")}</option>
                              {countries.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              aria-hidden
                              className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-navy-600"
                              strokeWidth={1.75}
                            />
                          </div>
                        )}
                    </Field>
                  </div>
                  </section>

                  <section
                    aria-labelledby="profile-prefs"
                    className="relative overflow-hidden border border-navy-900/12 bg-white p-5 sm:p-6"
                  >
                    <span aria-hidden className="absolute inset-x-0 top-0 flex h-0.5">
                      <span className="w-20 bg-blue-700" />
                      <span className="w-6 bg-gold" />
                    </span>
                    <div className="flex items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center bg-blue-700/8 text-blue-700">
                        <Globe2 aria-hidden className="size-5" strokeWidth={1.75} />
                      </span>
                      <div>
                        <SectionTitle as="h3" id="profile-prefs" className="text-body-lg">
                          {t("prefsTitle")}
                        </SectionTitle>
                        <p className="mt-1.5 text-body-sm text-navy-600">{t("prefsLead")}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Field name="uiLanguage" label={t("language")}>
                        {({ id, name, className, describedBy, invalid }) => (
                          <div className="relative">
                            <select
                              id={id}
                              name={name}
                              data-field={name}
                              aria-describedby={describedBy}
                              aria-invalid={invalid || undefined}
                              defaultValue={initial("uiLanguage", participant.uiLanguage)}
                              className={cn(className, "appearance-none bg-white pe-12")}
                            >
                              <option value="en">English</option>
                              <option value="ar">العربية</option>
                            </select>
                            <ChevronDown
                              aria-hidden
                              className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-navy-600"
                              strokeWidth={1.75}
                            />
                          </div>
                        )}
                      </Field>
                    </div>
                  </section>
                </div>
              </div>

              {/* The save sits at the end of the fields it saves. */}
              <div className="px-5 pb-6 sm:px-7">
                <AccountActionBar note={dirty && !state.done ? t("unsaved") : t("saveLead")}>
                  <SubmitButton label={t("save")} pendingLabel={t("saving")} />
                </AccountActionBar>
              </div>
            </AccountPanel>
          </AccountStack>
        </div>
      </form>

      <PasswordPanel />
    </>
  );
}

/** The password change: its own task, its own ground, its own submission. */
function PasswordPanel() {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const [state, action] = useActionState(changePasswordAction, emptyForm);

  const err = (field: string) =>
    state.error && state.field === field ? tAuth(`errors.${state.error}`) : null;

  return (
    <form action={action} noValidate>
      <div className="account-shell pb-[var(--account-y)]">
        <AccountPanel title={t("passwordTitle")} lead={t("securityLead")} padded={false}>
          {state.error || state.done ? (
            <div className="px-5 pt-6 sm:px-7">
              {state.error ? (
                <ErrorSummary
                  title={t("passwordTitle")}
                  items={[{ field: state.field, message: tAuth(`errors.${state.error}`) }]}
                />
              ) : null}
              {state.done ? (
                <SuccessNote>{t("passwordChanged")}</SuccessNote>
              ) : null}
            </div>
          ) : null}

          <div className="bg-mist/45 p-4 sm:p-6 lg:p-7">
            <div className="mx-auto grid max-w-[76rem] items-stretch gap-5 lg:grid-cols-[minmax(18rem,0.78fr)_minmax(0,1.22fr)]">
              <section className="relative border border-navy-900/12 bg-white p-5 pt-7 sm:p-6 sm:pt-8">
                <span aria-hidden className="absolute inset-y-0 start-0 w-0.5 bg-blue-700" />
                <span className="grid size-11 place-items-center bg-blue-700/8 text-blue-700">
                  <ShieldCheck aria-hidden className="size-6" strokeWidth={1.5} />
                </span>
                <Eyebrow className="mt-6">{t("securityEyebrow")}</Eyebrow>
                <SectionTitle as="h3" className="mt-2 text-body-lg">
                  {t("confirmIdentityTitle")}
                </SectionTitle>
                <p className="mt-2 max-w-[42ch] text-body-sm text-navy-600">
                  {t("currentPasswordLead")}
                </p>
                <div className="mt-6">
                  <PasswordField
                    name="currentPassword"
                    label={tAuth("currentPassword")}
                    autoComplete="current-password"
                    required
                    error={err("currentPassword")}
                  />
                </div>
              </section>

              <section className="relative overflow-hidden border border-navy-900/12 bg-white p-5 pt-7 sm:p-6 sm:pt-8">
                <span aria-hidden className="absolute inset-x-0 top-0 flex h-1">
                  <span className="w-24 bg-blue-700" />
                  <span className="w-8 bg-gold" />
                </span>
                <Eyebrow>{t("newPasswordEyebrow")}</Eyebrow>
                <SectionTitle as="h3" className="mt-2 text-body-lg">
                  {t("newPasswordTitle")}
                </SectionTitle>
                <p className="mt-2 max-w-[54ch] text-body-sm text-navy-600">
                  {t("newPasswordLead")}
                </p>
                <div className="mt-6 grid items-start gap-5 sm:grid-cols-2">
                  <PasswordField
                    name="newPassword"
                    label={tAuth("newPassword")}
                    autoComplete="new-password"
                    hint={tAuth("passwordHint")}
                    required
                    error={err("newPassword")}
                  />
                  <PasswordField
                    name="confirmPassword"
                    label={tAuth("confirmPassword")}
                    autoComplete="new-password"
                    required
                    error={err("confirmPassword")}
                  />
                </div>

                <AccountActionBar>
                  <SubmitButton label={t("changePassword")} pendingLabel={t("changing")} />
                </AccountActionBar>
              </section>
            </div>
          </div>
        </AccountPanel>
      </div>
    </form>
  );
}
