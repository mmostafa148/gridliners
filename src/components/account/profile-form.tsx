"use client";

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
  Meta,
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
            {/* ---- who this account belongs to ------------------------- */}
            <AccountPanel>
              <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-9">
                {/* The preview is the control's feedback. A file picker with no
                    preview asks somebody to trust the right file was chosen. */}
                <span className="relative block size-28 shrink-0 overflow-hidden bg-navy-900/8">
                  {photo && !removePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center">
                      <Meta>{t("unset")}</Meta>
                    </span>
                  )}
                </span>

                <input type="hidden" name="photoUrl" value={removePhoto ? "" : (photo ?? "")} />
                <input type="hidden" name="removePhoto" value={removePhoto ? "1" : "0"} />

                <div className="flex min-w-0 flex-1 flex-col gap-5">
                  <div className="min-w-0">
                    <p className="font-display text-account-section text-navy-900">
                      {participant.name}
                    </p>
                    <p className="mt-1 text-body-sm text-navy-600">
                      {[participant.jobTitle, participant.companyName].filter(Boolean).join(", ")}
                    </p>
                  </div>

                  {/* Facts the participant does not edit here, beside the
                      picture rather than stranded in a column of their own. */}
                  <dl className="flex flex-wrap gap-x-12 gap-y-4">
                    {facts.map((f) => (
                      <div key={f.label} className="flex flex-col gap-1">
                        <dt className="text-caption text-navy-600">{f.label}</dt>
                        <dd className="font-data text-body-sm tabular-nums text-navy-900">
                          {f.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    <label
                      className={cn(
                        accountAction.secondary,
                        "cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-700",
                      )}
                    >
                      {t("choosePhoto")}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.svg"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          // Held as a data URL in this browser: there is no file
                          // storage in this build and the panel does not pretend
                          // otherwise. It previews, and it saves the reference.
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
                        className={accountAction.quiet}
                      >
                        {t("removePhoto")}
                      </button>
                    ) : null}
                    <Meta>{t("photoHint")}</Meta>
                  </div>
                </div>
              </div>
            </AccountPanel>

            {/* ---- the editable record --------------------------------- */}
            <AccountPanel title={t("accountTitle")}>
              {state.error && !state.done ? (
                <div className="mb-7">
                  <ErrorSummary
                    title={t("title")}
                    items={[{ field: state.field, message: t(`errors.${state.error}`) }]}
                  />
                </div>
              ) : null}
              {state.done ? (
                <div className="mb-7">
                  <SuccessNote>{t("saved")}</SuccessNote>
                </div>
              ) : null}

              {/* Two columns of groups, not one column of very wide fields.
                  A name input at 750px is not a form, and a lone language
                  select in a row of its own reads as a missing pair. */}
              <div className="grid gap-x-14 gap-y-10 lg:grid-cols-2">
                <section aria-labelledby="profile-identity" className="min-w-0">
                  <SectionTitle as="h3" id="profile-identity" className="text-body-lg">
                    {t("identityTitle")}
                  </SectionTitle>
                  <p className="mt-1.5 max-w-[46ch] text-body-sm text-navy-600">
                    {t("identityLead")}
                  </p>
                  <div className="mt-6 flex max-w-[30rem] flex-col gap-5">
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

                <div className="flex min-w-0 flex-col gap-10">
                  <section aria-labelledby="profile-place" className="min-w-0">
                    <SectionTitle as="h3" id="profile-place" className="text-body-lg">
                      {t("placeTitle")}
                    </SectionTitle>
                    <div className="mt-6 flex max-w-[30rem] flex-col gap-5">
                      <Field name="nationality" label={t("nationality")}>
                        {({ id, name, className }) => (
                          <select
                            id={id}
                            name={name}
                            data-field={name}
                            defaultValue={initial("nationality", participant.nationality ?? "")}
                            className={cn(className, "appearance-none bg-white")}
                          >
                            <option value="">{t("unset")}</option>
                            {countries.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </Field>
                      <Field name="country" label={t("country")}>
                        {({ id, name, className }) => (
                          <select
                            id={id}
                            name={name}
                            data-field={name}
                            autoComplete="country"
                            defaultValue={initial("country", participant.country)}
                            className={cn(className, "appearance-none bg-white")}
                          >
                            <option value="">{t("unset")}</option>
                            {countries.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </Field>
                    </div>
                  </section>

                  <section
                    aria-labelledby="profile-prefs"
                    className="min-w-0 border-t border-navy-900/10 pt-9"
                  >
                    <SectionTitle as="h3" id="profile-prefs" className="text-body-lg">
                      {t("prefsTitle")}
                    </SectionTitle>
                    <div className="mt-6 max-w-[30rem]">
                      <Field name="uiLanguage" label={t("language")}>
                        {({ id, name, className }) => (
                          <select
                            id={id}
                            name={name}
                            data-field={name}
                            defaultValue={initial("uiLanguage", participant.uiLanguage)}
                            className={cn(className, "appearance-none bg-white")}
                          >
                            <option value="en">English</option>
                            <option value="ar">العربية</option>
                          </select>
                        )}
                      </Field>
                    </div>
                  </section>
                </div>
              </div>

              {/* The save sits at the end of the fields it saves. */}
              <AccountActionBar note={dirty && !state.done ? t("unsaved") : ""}>
                <SubmitButton label={t("save")} pendingLabel={t("saving")} />
              </AccountActionBar>
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
        <AccountPanel title={t("passwordTitle")} lead={t("securityLead")}>
          <div>

            {state.error ? (
              <div className="mb-7">
                <ErrorSummary
                  title={t("passwordTitle")}
                  items={[{ field: state.field, message: tAuth(`errors.${state.error}`) }]}
                />
              </div>
            ) : null}
            {state.done ? (
              <div className="mb-7">
                <SuccessNote>{t("passwordChanged")}</SuccessNote>
              </div>
            ) : null}

            {/* Three columns across the panel, so the security task has the
                same width as the details above it rather than hugging a third
                of the panel and leaving the rest empty. */}
            <div className="grid max-w-[62rem] gap-x-10 gap-y-6 md:grid-cols-3">
              <PasswordField
                name="currentPassword"
                label={tAuth("currentPassword")}
                autoComplete="current-password"
                required
                error={err("currentPassword")}
              />
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
          </div>
        </AccountPanel>
      </div>
    </form>
  );
}
