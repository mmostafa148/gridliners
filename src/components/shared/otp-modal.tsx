"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
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
    if (step === "code") codeInputRef.current?.focus();
    if (step === "done") doneRef.current?.focus();
  }, [step]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{step === "done" ? t("success") : t("title")}</DialogTitle>
          {/* The description IS the live region rather than a second one beside
              it. A title swap inside an already-open dialog is announced by
              nothing, and Radix wants a description present on every step, so
              the one element does both jobs. */}
          <DialogDescription aria-live="polite">
            {step === "done"
              ? t("successDescription", { project: projectTitle })
              : step === "email"
                ? t("description", { project: projectTitle })
                : t("codeHint", { email })}
          </DialogDescription>
        </DialogHeader>

        {step === "email" ? (
          <form onSubmit={emailForm.handleSubmit(requestCode)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp-email">{t("emailLabel")}</Label>
              <Input
                id="otp-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                dir="ltr"
                {...emailForm.register("email")}
                aria-invalid={Boolean(emailForm.formState.errors.email) || Boolean(error)}
                aria-describedby={error ? "otp-email-error" : undefined}
              />
            </div>
            {/* `role="alert"` rather than a bare paragraph: the message appears
                after a submit, so nothing announces it unless it is a live
                region, and `aria-describedby` above ties it to the field that
                caused it. */}
            {error ? (
              <p id="otp-email-error" role="alert" className="text-body-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
              {t("sendCode")}
            </Button>
          </form>
        ) : null}

        {step === "code" ? (
          <form onSubmit={codeForm.handleSubmit(verifyCode)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp-code">{t("codeLabel")}</Label>
              <Input
                id="otp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                dir="ltr"
                className="text-center font-mono text-h3 tracking-[0.5em]"
                {...codeRegister}
                // The spread carries react-hook-form's own ref, so it is called
                // first and then the local one is set. Overriding `ref` without
                // forwarding it would detach the field from the form.
                ref={(el) => {
                  codeRegister.ref(el);
                  codeInputRef.current = el;
                }}
                aria-invalid={Boolean(codeForm.formState.errors.code) || Boolean(error)}
                aria-describedby={error ? "otp-code-error" : undefined}
              />
            </div>
            {error ? (
              <p id="otp-code-error" role="alert" className="text-body-sm text-destructive">
                {error}
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              <Button type="submit" className="flex-1" disabled={codeForm.formState.isSubmitting}>
                {t("verify")}
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
              >
                {resendIn > 0 ? t("resendIn", { seconds: resendIn }) : t("resend")}
              </Button>
            </div>
          </form>
        ) : null}

        {step === "done" ? (
          <div className={cn("flex flex-col items-center gap-3 py-4")}>
            <CircleCheck className="size-10 text-blue-700" aria-hidden />
            <Button ref={doneRef} onClick={() => onOpenChange(false)}>
              {tCommon("close")}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
