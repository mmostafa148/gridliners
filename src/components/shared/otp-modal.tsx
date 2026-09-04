"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, LoaderCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Vote verification modal: email → 6-digit code → confirmed.
 *
 * No account is created — the OTP is the whole identity check (CD §2). The
 * mocked OtpService enforces ~10-minute expiry and the mock code, and
 * VotesService enforces one-vote-per-email plus the self-vote block, so this
 * component exercises the real failure paths rather than a happy path only.
 *
 * **Built in Phase 0.4 and unused until 1.8**, which is the first screen with
 * a vote to cast. Consumed until now only by `/dev/kitchen-sink`, so the four
 * accessibility gaps below were closed on the way in rather than being carried
 * into a screen that ships:
 *
 *  - **Errors were loose `<p>`s.** A message that appears after a submit is
 *    announced by nothing unless it is a live region, and it is not tied to the
 *    field that caused it. Each step's error is now `role="alert"` and is named
 *    by the input's `aria-describedby`.
 *  - **Focus stayed on the email field when the step advanced.** A keyboard
 *    reader was left on an input that had just been replaced. Focus moves to
 *    the code field, and to the close button on the confirmation.
 *  - **The confirmation only changed a `DialogTitle`.** A title swap inside an
 *    open dialog is not announced. `DialogDescription` is now the live region
 *    itself rather than gaining a second one beside it - Radix wants a
 *    description on every step, so one element does both jobs.
 *  - **The resend counter ticked silently.** It is `aria-live="off"` while it
 *    counts - a per-second announcement is worse than none - and the button
 *    states the wait in its own label.
 */

type Step = "email" | "code" | "done";

const emailSchema = z.object({ email: z.email() });
const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/) });

export function OtpModal({
  open,
  onOpenChange,
  entryId,
  projectTitle,
  onVoted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  projectTitle: string;
  onVoted?: () => void;
}) {
  const t = useTranslations("otp");
  const tCommon = useTranslations("common");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const codeInputRef = useRef<HTMLInputElement | null>(null);
  const doneRef = useRef<HTMLButtonElement | null>(null);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  // Registered once so the ref can be merged with the local one below.
  const codeRegister = codeForm.register("code");

  // Reset the whole flow whenever the dialog is reopened.
  useEffect(() => {
    if (!open) return;
    setStep("email");
    setError(null);
    setChallengeId(null);
    setResendIn(0);
    emailForm.reset();
    codeForm.reset();
  }, [open, emailForm, codeForm]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  /**
   * Focus follows the step.
   *
   * Each step replaces the form that had focus, so without this a keyboard
   * reader is left on a detached input and a screen reader announces nothing.
   * `code` takes the field it has to fill; `done` takes the only control left.
   */
  useEffect(() => {
    if (!open) return;
    if (step === "email") emailForm.setFocus("email");
    if (step === "code") codeInputRef.current?.focus();
    if (step === "done") doneRef.current?.focus();
  }, [open, step, emailForm]);

  async function requestCode(values: z.infer<typeof emailSchema>) {
    setError(null);
    try {
      const alreadyVoted = await api.votes.hasVoted(entryId, values.email);
      if (alreadyVoted) {
        setError(t("alreadyVoted"));
        return;
      }
      const challenge = await api.otp.request(entryId, values.email);
      setEmail(values.email);
      setChallengeId(challenge.challengeId);
      codeForm.reset();
      setStep("code");
      setResendIn(30);
    } catch {
      setError(t("invalid"));
    }
  }

  async function verifyCode(values: z.infer<typeof codeSchema>) {
    if (!challengeId) return;
    setError(null);

    const outcome = await api.otp.verify(challengeId, values.code);
    if (!outcome.ok) {
      setError(outcome.reason === "expired" ? t("expired") : t("invalid"));
      return;
    }

    try {
      await api.votes.record(entryId, email);
      setStep("done");
      onVoted?.();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "";
      setError(
        message === "SELF_VOTE_BLOCKED"
          ? t("selfVoteBlocked")
          : message === "ALREADY_VOTED"
            ? t("alreadyVoted")
            : t("invalid"),
      );
    }
  }

  function changeEmail() {
    setStep("email");
    setError(null);
    setChallengeId(null);
    codeForm.reset();
  }

  const emailError = emailForm.formState.errors.email
    ? t("emailInvalid")
    : step === "email"
      ? error
      : null;
  const codeError = codeForm.formState.errors.code
    ? t("codeInvalidFormat")
    : step === "code"
      ? error
      : null;
  const codeValue = codeForm.watch("code") ?? "";

  const primaryButton = cn(
    "relative h-13 w-full overflow-hidden rounded-none bg-navy-950 px-6",
    "font-display text-data-sm uppercase tracking-[0.08em] text-cream-50",
    "shadow-[0_10px_24px_rgba(8,24,55,0.16)] transition-colors",
    "after:absolute after:end-0 after:top-0 after:size-2 after:bg-gold",
    "hover:bg-blue-700 focus-visible:border-transparent focus-visible:ring-0",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-none bg-cream-50 p-0 text-navy-950 shadow-[0_28px_80px_rgba(0,10,35,0.28)] ring-1 ring-navy-950/12 sm:max-w-[36rem]"
      >
        <span aria-hidden className="absolute inset-x-0 top-0 z-10 flex h-1">
          <span className="w-24 bg-blue-700" />
          <span className="w-9 bg-gold" />
        </span>

        <DialogClose asChild>
          <button
            type="button"
            aria-label={tCommon("close")}
            className="absolute end-4 top-4 z-20 flex size-11 items-center justify-center text-navy-950 transition-colors hover:bg-navy-950/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:end-5 sm:top-5"
          >
            <X aria-hidden className="size-5" />
          </button>
        </DialogClose>

        <DialogHeader className="gap-0 border-b border-navy-950/10 bg-white px-6 pb-6 pe-17 pt-8 text-start sm:px-8 sm:pb-7 sm:pe-20 sm:pt-9">
          <div className="mb-3 flex items-center gap-3 font-display text-overline uppercase tracking-[0.18em] text-blue-700">
            <span>{t("eyebrow")}</span>
            {step !== "done" ? (
              <>
                <span aria-hidden className="h-px w-8 bg-blue-700/35" />
                <span className="font-data text-data-xs text-navy-600">
                  {step === "email" ? "01 / 02" : "02 / 02"}
                </span>
              </>
            ) : null}
          </div>
          <DialogTitle className="max-w-[28rem] font-display text-[clamp(1.65rem,5vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-navy-950">
            {step === "done" ? t("success") : t("title")}
          </DialogTitle>
          {/* The description IS the live region rather than a second one beside
              it. A title swap inside an already-open dialog is announced by
              nothing, and Radix wants a description present on every step, so
              the one element does both jobs. */}
          <DialogDescription
            aria-live="polite"
            className="mt-3 max-w-[30rem] text-body-md leading-relaxed text-navy-600"
          >
            {step === "done"
              ? t("successDescription", { project: projectTitle })
              : step === "email"
                ? t("description")
                : t("codeHint", { email })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 border-b border-navy-950/10 bg-mist/70 px-6 py-3.5 sm:px-8">
          <span className="shrink-0 font-display text-overline uppercase tracking-[0.14em] text-navy-500">
            {t("projectLabel")}
          </span>
          <span aria-hidden className="h-px min-w-4 flex-1 bg-navy-950/12" />
          <bdi className="min-w-0 truncate font-display text-body-sm font-semibold text-navy-950">
            {projectTitle}
          </bdi>
        </div>

        {step === "email" ? (
          <form onSubmit={emailForm.handleSubmit(requestCode)} className="space-y-5 p-6 sm:p-8">
            <div className="space-y-2.5">
              <Label htmlFor="otp-email" className="font-display text-body-sm font-semibold text-navy-950">
                {t("emailLabel")}
              </Label>
              <Input
                id="otp-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                dir="ltr"
                className="h-13 rounded-none border-navy-950/22 bg-white px-4 text-body-md text-navy-950 shadow-none focus-visible:border-blue-700 focus-visible:ring-0 aria-invalid:border-destructive aria-invalid:ring-0"
                {...emailForm.register("email")}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? "otp-email-error" : undefined}
              />
            </div>
            {/* `role="alert"` rather than a bare paragraph: the message appears
                after a submit, so nothing announces it unless it is a live
                region, and `aria-describedby` above ties it to the field that
                caused it. */}
            {emailError ? (
              <p id="otp-email-error" role="alert" className="border-s-2 border-destructive bg-destructive/6 px-3 py-2.5 text-body-sm text-destructive">
                {emailError}
              </p>
            ) : null}
            <Button type="submit" className={primaryButton} disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting ? (
                <LoaderCircle aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
              ) : null}
              {emailForm.formState.isSubmitting ? t("sending") : t("sendCode")}
            </Button>
          </form>
        ) : null}

        {step === "code" ? (
          <form onSubmit={codeForm.handleSubmit(verifyCode)} className="space-y-5 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="otp-code" className="font-display text-body-sm font-semibold text-navy-950">
                {t("codeLabel")}
              </Label>
              <button
                type="button"
                onClick={changeEmail}
                className="font-display text-body-sm text-blue-700 underline underline-offset-4 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                {t("changeEmail")}
              </button>
            </div>

            <div className="group relative" dir="ltr">
              <div aria-hidden className="grid grid-cols-6 gap-2 sm:gap-2.5">
                {Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "flex h-13 items-center justify-center border bg-white font-data text-h3 text-navy-950 transition-colors sm:h-14",
                      codeError
                        ? "border-destructive"
                        : "border-navy-950/22 group-focus-within:border-blue-700/45",
                      !codeError && codeValue.length === index && "border-blue-700 ring-1 ring-blue-700",
                    )}
                  >
                    {codeValue[index] ?? ""}
                  </span>
                ))}
              </div>
              <input
                id="otp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]*"
                dir="ltr"
                name={codeRegister.name}
                onBlur={codeRegister.onBlur}
                onChange={(event) => {
                  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6);
                  void codeRegister.onChange(event);
                }}
                ref={(element) => {
                  codeRegister.ref(element);
                  codeInputRef.current = element;
                }}
                aria-invalid={Boolean(codeError)}
                aria-describedby={codeError ? "otp-code-error" : undefined}
                className="absolute inset-0 z-10 size-full cursor-text opacity-0"
              />
            </div>
            {codeError ? (
              <p id="otp-code-error" role="alert" className="border-s-2 border-destructive bg-destructive/6 px-3 py-2.5 text-body-sm text-destructive">
                {codeError}
              </p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" className={cn(primaryButton, "sm:flex-1")} disabled={codeForm.formState.isSubmitting}>
                {codeForm.formState.isSubmitting ? (
                  <LoaderCircle aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
                ) : null}
                {codeForm.formState.isSubmitting ? t("verifying") : t("verify")}
              </Button>
              {/* `aria-live="off"`, deliberately: the label changes every
                  second while the cooldown runs, and a per-second announcement
                  is worse than silence. The button's own disabled state and its
                  label carry the wait when a reader lands on it. */}
              <Button
                type="button"
                variant="ghost"
                aria-live="off"
                disabled={resendIn > 0}
                onClick={() => emailForm.handleSubmit(requestCode)()}
                className="h-11 rounded-none px-4 font-display text-body-sm text-blue-700 hover:bg-blue-700/6 hover:text-navy-950 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:min-w-36"
              >
                {resendIn > 0 ? t("resendIn", { seconds: resendIn }) : t("resend")}
              </Button>
            </div>
          </form>
        ) : null}

        {step === "done" ? (
          <div className={cn("flex flex-col items-center gap-5 p-8 text-center sm:p-10")}>
            <span className="flex size-18 items-center justify-center bg-blue-700/8 text-blue-700">
              <CircleCheck className="size-9" aria-hidden />
            </span>
            <Button ref={doneRef} onClick={() => onOpenChange(false)} className={cn(primaryButton, "max-w-64")}>
              {tCommon("close")}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
