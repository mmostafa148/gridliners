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
    "relative h-12 w-full overflow-hidden rounded-none bg-navy-950 px-6",
    "font-display text-body-sm font-semibold text-cream-50",
    "transition-colors after:absolute after:end-0 after:top-0 after:size-1.5 after:bg-gold",
    "hover:bg-blue-700 focus-visible:border-transparent focus-visible:ring-0",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          window.requestAnimationFrame(() => emailForm.setFocus("email"));
        }}
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-x-hidden overflow-y-auto rounded-none border border-navy-950/15 bg-white p-0 text-navy-950 shadow-[0_24px_64px_rgba(0,10,35,0.24)] sm:max-w-[30rem]"
      >
        <DialogClose asChild>
          <button
            type="button"
            aria-label={tCommon("close")}
            className="absolute end-3 top-3 z-20 flex size-11 items-center justify-center text-navy-950 transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <X aria-hidden className="size-5" />
          </button>
        </DialogClose>

        <DialogHeader className="min-w-0 gap-0 border-b border-navy-950/10 px-6 pb-5 pe-16 pt-7 text-start sm:px-7 sm:pe-16">
          <DialogTitle className="max-w-[24rem] font-display text-[clamp(1.45rem,5vw,1.875rem)] font-semibold leading-tight tracking-[-0.015em] text-navy-950">
            {step === "done" ? t("success") : step === "code" ? t("codeTitle") : t("title")}
          </DialogTitle>
          {/* The description IS the live region rather than a second one beside
              it. A title swap inside an already-open dialog is announced by
              nothing, and Radix wants a description present on every step, so
              the one element does both jobs. */}
          <DialogDescription
            aria-live="polite"
            className="mt-2 max-w-[25rem] break-words text-body-sm leading-relaxed text-navy-600"
          >
            {step === "done"
              ? t("successDescription", { project: projectTitle })
              : step === "email"
                ? t("description")
                : t("codeHint", { email })}
          </DialogDescription>
          {step === "code" ? (
            <button
              type="button"
              onClick={changeEmail}
              className="mt-2 w-fit font-display text-body-sm text-blue-700 underline underline-offset-4 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {t("changeEmail")}
            </button>
          ) : null}
          <div className="mt-4 flex min-w-0 items-center gap-2 border-t border-navy-950/10 pt-4">
            <span aria-hidden className="size-1.5 shrink-0 bg-gold" />
            <span className="shrink-0 font-display text-data-xs uppercase tracking-[0.08em] text-navy-500">
              {t("projectLabel")}
            </span>
            <bdi className="min-w-0 truncate font-display text-body-sm font-semibold text-navy-950">
              {projectTitle}
            </bdi>
          </div>
        </DialogHeader>

        {step === "email" ? (
          <form onSubmit={emailForm.handleSubmit(requestCode)} className="min-w-0 space-y-4 px-6 pb-7 pt-5 sm:px-7">
            <div className="space-y-2">
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
                className="h-12 rounded-none border-navy-950/22 bg-white px-4 text-body-md text-navy-950 shadow-none focus-visible:border-blue-700 focus-visible:ring-0 aria-invalid:border-destructive aria-invalid:ring-0"
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
          <form onSubmit={codeForm.handleSubmit(verifyCode)} className="min-w-0 space-y-4 px-6 pb-7 pt-5 sm:px-7">
            <Label htmlFor="otp-code" className="sr-only">
              {t("codeLabel")}
            </Label>

            <div className="group relative" dir="ltr">
              <div aria-hidden className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "flex h-12 items-center justify-center border bg-white font-data text-h3 text-navy-950 transition-colors sm:h-13",
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
            <div className="flex justify-center">
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
                className="h-9 rounded-none px-3 font-display text-body-sm text-blue-700 hover:bg-blue-700/6 hover:text-navy-950 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                {resendIn > 0 ? t("resendIn", { seconds: resendIn }) : t("resend")}
              </Button>
            </div>
            <Button type="submit" className={primaryButton} disabled={codeForm.formState.isSubmitting}>
              {codeForm.formState.isSubmitting ? (
                <LoaderCircle aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
              ) : null}
              {codeForm.formState.isSubmitting ? t("verifying") : t("verify")}
            </Button>
          </form>
        ) : null}

        {step === "done" ? (
          <div className="flex flex-col items-center gap-5 px-6 pb-7 pt-5 text-center sm:px-7">
            <span className="flex size-24 items-center justify-center border border-blue-700/20 bg-blue-700/6 text-blue-700">
              <CircleCheck className="size-14" strokeWidth={1.75} aria-hidden />
            </span>
            <Button ref={doneRef} onClick={() => onOpenChange(false)} className={primaryButton}>
              {tCommon("close")}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
