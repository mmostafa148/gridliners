"use client";

import { AlertTriangle, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { accountAction } from "@/components/account/system";
import { cn } from "@/lib/utils";

/**
 * The form parts every participant screen is built from.
 *
 * **One set, not one per screen.** Ten screens each writing their own label,
 * error wiring and pending state is ten chances for one of them to ship a
 * placeholder-only field or an error nothing announces. The rules the brief
 * sets — a visible label always, `aria-describedby` to the message, a
 * focusable summary after a failed submit, values preserved — are properties
 * of these components rather than of anyone's discipline.
 */

/**
 * A form label is a question, not a coordinate.
 *
 * It was `text-coord` — 11px tracked uppercase — on every field in the module,
 * which is the voice this system reserves for eyebrows. A label somebody has to
 * read before typing is body-sized and sentence case (build-state §49).
 */
const LABEL = "block text-[0.8125rem] font-semibold leading-5 text-navy-800";
const CONTROL = cn(
  "h-13 w-full border bg-[#fbfbfd] px-4 text-body-md text-navy-900 shadow-[inset_0_-1px_0_rgba(8,24,55,0.04)]",
  "placeholder:text-navy-500",
  "transition-[border-color,background-color,box-shadow] duration-200 hover:border-navy-900/40 hover:bg-white",
  "focus-visible:border-blue-700 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-700/10",
  "disabled:cursor-not-allowed disabled:border-navy-900/12 disabled:bg-mist disabled:text-navy-600",
);

export function fieldClass(invalid?: boolean) {
  return cn(CONTROL, invalid ? "border-campaign-orange" : "border-navy-900/25");
}

export interface FieldProps {
  name: string;
  label: string;
  /** One line under the control. Not a substitute for the label. */
  hint?: string;
  error?: string | null;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  /** Rendered instead of an input — a select, a textarea, a control of its own. */
  children?: (props: {
    id: string;
    name: string;
    invalid: boolean;
    describedBy: string | undefined;
    className: string;
  }) => React.ReactNode;
}

/**
 * A labelled control with its message wired to it.
 *
 * The id is minted, so two of these on one page never collide — which is the
 * defect the newsletter form shipped with in Phase 1 and had to be fixed for.
 */
export function Field({
  name,
  label,
  hint,
  error,
  required,
  type = "text",
  autoComplete,
  inputMode,
  defaultValue,
  placeholder,
  maxLength,
  disabled,
  children,
}: FieldProps) {
  const uid = useId();
  const id = `${name}-${uid}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const invalid = Boolean(error);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={LABEL}>
        {label}
        {required ? (
          <span className="ms-1 text-destructive-ink" aria-hidden>
            *
          </span>
        ) : null}
      </label>

      {children ? (
        children({ id, name, invalid, describedBy, className: fieldClass(invalid) })
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          defaultValue={defaultValue}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          // `data-field` is what the error summary's links look for.
          data-field={name}
          className={fieldClass(invalid)}
        />
      )}

      {hint ? (
        <p id={hintId} className="text-body-sm text-navy-700">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-2 text-body-sm font-medium text-destructive-ink">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A password field with a real show/hide control.
 *
 * **Paste is not blocked and nothing is retyped for its own sake.** A field
 * that fights a password manager gets weaker passwords, not stronger ones, and
 * the brief rules out security theatre explicitly. The toggle carries a name
 * that says what it will do, and it is a button so a keyboard reaches it.
 */
export function PasswordField({
  name,
  label,
  hint,
  error,
  required,
  autoComplete = "current-password",
}: Omit<FieldProps, "type" | "children">) {
  const t = useTranslations("auth");
  const [shown, setShown] = useState(false);
  const uid = useId();
  const id = `${name}-${uid}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const invalid = Boolean(error);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={LABEL}>
        {label}
        {required ? (
          <span className="ms-1 text-destructive-ink" aria-hidden>
            *
          </span>
        ) : null}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={shown ? "text" : "password"}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          data-field={name}
          className={cn(fieldClass(invalid), "pe-14")}
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          // The name says what pressing it does, not what state it is in.
          aria-label={shown ? t("hidePassword") : t("showPassword")}
          className={cn(
            "absolute inset-y-px end-px grid w-12 place-items-center border-s border-navy-900/8 bg-mist/55 text-navy-600",
            "transition-colors hover:bg-blue-700/8 hover:text-blue-700",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700",
          )}
        >
          {shown ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
        </button>
      </div>

      {hint ? (
        <p id={hintId} className="text-body-sm text-navy-700">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-2 text-body-sm font-medium text-destructive-ink">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * What went wrong, at the top of the form, focused.
 *
 * **It takes focus when it appears and not otherwise.** A submit that fails
 * silently leaves a screen-reader user at the button with no idea why nothing
 * happened; a summary that steals focus on every render fights anybody trying
 * to fix the field it names. So it moves focus once, keyed on the message.
 *
 * Each item links to its field, which is why the controls carry `data-field`.
 */
export function ErrorSummary({
  title,
  items,
}: {
  title: string;
  items: { field?: string; message: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const key = items.map((i) => `${i.field}:${i.message}`).join("|");

  useEffect(() => {
    if (items.length) ref.current?.focus();
  }, [key, items.length]);

  if (!items.length) return null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className={cn(
        "border-s-2 border-destructive bg-destructive/6 p-5",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
      )}
    >
      <p className="text-body-lg font-medium text-navy-900">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-body-md text-navy-800">
            {item.field ? (
              <a
                href={`#${item.field}`}
                onClick={(event) => {
                  // The ids are minted, so the anchor cannot be a real target.
                  // The field is found by its stable `data-field` instead.
                  event.preventDefault();
                  const el = document.querySelector<HTMLElement>(`[data-field="${item.field}"]`);
                  el?.focus();
                  el?.scrollIntoView({ block: "center", behavior: "smooth" });
                }}
                className="underline underline-offset-4 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                {item.message}
              </a>
            ) : (
              item.message
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A submit button that knows the form is in flight.
 *
 * `useFormStatus` rather than a prop, so the disabled state cannot drift out
 * of step with the action — and a double submit is prevented by the control
 * rather than by a guard somebody has to remember to write.
 */
export function SubmitButton({
  label,
  pendingLabel,
  className,
  variant = "primary",
}: {
  label: string;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "quiet";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className={cn(
        variant === "primary" ? accountAction.primary : accountAction.secondary,
        variant === "primary" && "relative h-12 overflow-hidden shadow-[0_8px_20px_rgba(8,24,55,0.14)] after:absolute after:end-0 after:top-0 after:size-2 after:bg-gold",
        "disabled:opacity-80",
        className,
      )}
    >
      {pending ? (
        <Loader2 aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
      ) : null}
      {pending && pendingLabel ? pendingLabel : label}
    </button>
  );
}

/** A completed action, announced without moving focus. */
export function SuccessNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="flex items-start gap-3 border-s-2 border-blue-700 bg-blue-700/6 p-5 text-body-md text-navy-900"
    >
      <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-blue-700" strokeWidth={2.5} />
      {children}
    </p>
  );
}

/**
 * Where a form's actions live.
 *
 * **A rule and space, not a tinted footer inside a card.** Every panel in this
 * module ended in the same grey strip, which is what made ten different jobs
 * look like one repeated object. The bar states what is unsaved on the start
 * edge and puts the submission on the end edge.
 */
export function AccountActionBar({
  note,
  children,
  className,
}: {
  /** Announced politely: "unsaved changes", a count, a warning. */
  note?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-navy-900/12 pt-6",
        className,
      )}
    >
      <span aria-live="polite" className="text-body-sm text-navy-700">
        {note}
      </span>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  );
}
