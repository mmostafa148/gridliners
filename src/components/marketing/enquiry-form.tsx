"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * The two public forms, from one component.
 *
 * Contact and Become a Partner ask for different fields and post to different
 * inboxes, but they are the same object: labelled controls, inline validation,
 * a pending state that disables the control, a confirmation that replaces the
 * form, and a failure that keeps what was typed. Building them twice would be
 * building two chances to get the states wrong.
 *
 * **Every field has a real `<label>`**, not a placeholder standing in for one -
 * a placeholder disappears the moment somebody types, which is exactly when a
 * screen reader user needs it. Errors are `role="alert"` and wired with
 * `aria-describedby`, so the message is announced rather than merely coloured.
 *
 * **A failure never clears the form.** Somebody who has written six lines and
 * hit a network error should not have to write them again.
 */

type Variant = "contact" | "partner";

interface FieldDef {
  name: string;
  labelKey: string;
  placeholderKey?: string;
  type?: "text" | "email" | "tel";
  multiline?: boolean;
  autoComplete?: string;
}

const FIELDS: Record<Variant, FieldDef[]> = {
  contact: [
    { name: "name", labelKey: "name", autoComplete: "name" },
    { name: "email", labelKey: "email", type: "email", autoComplete: "email" },
    { name: "subject", labelKey: "subject", placeholderKey: "subjectPlaceholder" },
    { name: "message", labelKey: "message", placeholderKey: "messagePlaceholder", multiline: true },
  ],
  partner: [
    { name: "organisation", labelKey: "organisation", placeholderKey: "organisationPlaceholder", autoComplete: "organization" },
    { name: "contactPerson", labelKey: "contactPerson", placeholderKey: "contactPersonPlaceholder", autoComplete: "name" },
    { name: "email", labelKey: "email", type: "email", autoComplete: "email" },
    { name: "phone", labelKey: "phoneOptional", placeholderKey: "phonePlaceholder", type: "tel", autoComplete: "tel" },
    { name: "message", labelKey: "message", placeholderKey: "messagePlaceholder", multiline: true },
  ],
};

export function EnquiryForm({ variant }: { variant: Variant }) {
  const t = useTranslations(variant === "contact" ? "contact" : "partnerForm");
  const tv = useTranslations("validation");
  const locale = useLocale();
  const [state, setState] = useState<"idle" | "sent" | "failed">("idle");
  const [reference, setReference] = useState<string | null>(null);

  // Shape only. A stricter address pattern rejects mail that delivers, and the
  // real check is whether the reply arrives.
  const email = z.string().regex(/^[^@\s]+@[^@\s.]+\.[^@\s]+$/, { message: tv("email") });
  const required = (min = 2) => z.string().trim().min(min, { message: tv("required") });

  const schema =
    variant === "contact"
      ? z.object({
          name: required(),
          email,
          subject: required(),
          message: required(10),
        })
      : z.object({
          organisation: required(),
          contactPerson: required(),
          email,
          phone: z.string().trim(),
          message: required(10),
        });

  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: Object.fromEntries(
      FIELDS[variant].map((f) => [f.name, ""]),
    ) as unknown as Values,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setState("idle");
    try {
      const payload = { ...(values as Record<string, string>), locale };
      const result =
        variant === "contact"
          ? await api.inbox.contact(payload as Parameters<typeof api.inbox.contact>[0])
          : await api.inbox.partner(payload as Parameters<typeof api.inbox.partner>[0]);
      if (!result.ok) {
        setState("failed");
        return;
      }
      setReference(result.reference);
      setState("sent");
      form.reset();
    } catch {
      setState("failed");
    }
  });

  if (state === "sent") {
    return (
      <div className="border border-navy-900/15 bg-white p-8 lg:p-10">
        <p className="flex size-12 items-center justify-center bg-campaign-lime text-navy-950">
          <Check aria-hidden className="size-6" />
        </p>
        <h3 className="mt-6 text-h3 text-navy-900">{t("successTitle")}</h3>
        <p className="mt-3 max-w-[52ch] text-body-md text-navy-600">{t("successBody")}</p>
        {reference ? (
          <p className="mt-4 font-data text-data-sm tabular-nums text-navy-900">{reference}</p>
        ) : null}
        <button
          type="button"
          onClick={() => { setState("idle"); setReference(null); }}
          className="mt-8 inline-flex h-11 items-center border border-navy-900 px-6 font-display text-coord uppercase text-navy-900 transition-colors hover:bg-navy-900 hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {t("successAgain")}
        </button>
      </div>
    );
  }

  const busy = form.formState.isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {state === "failed" ? (
        <div role="alert" className="flex gap-4 border border-destructive/40 bg-destructive/5 p-5">
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="font-display text-coord uppercase text-destructive">{t("errorTitle")}</p>
            <p className="mt-2 text-body-sm text-navy-600">{t("errorBody")}</p>
          </div>
        </div>
      ) : null}

      <div className={cn("grid gap-6", variant === "partner" && "sm:grid-cols-2")}>
        {FIELDS[variant].map((field) => {
          const error = (form.formState.errors as Record<string, { message?: string } | undefined>)[field.name];
          const id = `${variant}-${field.name}`;
          return (
            <div
              key={field.name}
              className={cn(
                "flex flex-col gap-2",
                variant === "partner" && field.multiline && "sm:col-span-2",
              )}
            >
              <label htmlFor={id} className="font-display text-coord uppercase text-navy-600">
                {t(field.labelKey)}
              </label>
              {field.multiline ? (
                <textarea
                  id={id}
                  rows={5}
                  disabled={busy}
                  placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  {...form.register(field.name as never)}
                  className={cn(
                    "border bg-white px-4 py-3 text-body-md text-navy-900 outline-none transition-colors placeholder:text-navy-900/40 focus-visible:border-blue-700 disabled:opacity-60",
                    error ? "border-destructive" : "border-navy-900/25",
                  )}
                />
              ) : (
                <input
                  id={id}
                  type={field.type ?? "text"}
                  disabled={busy}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  {...form.register(field.name as never)}
                  className={cn(
                    "h-12 border bg-white px-4 text-body-md text-navy-900 outline-none transition-colors placeholder:text-navy-900/40 focus-visible:border-blue-700 disabled:opacity-60",
                    error ? "border-destructive" : "border-navy-900/25",
                  )}
                />
              )}
              {error?.message ? (
                <p id={`${id}-error`} role="alert" className="text-body-sm text-destructive">
                  {error.message}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {variant === "partner" ? (
        <p className="text-body-sm text-navy-600">{t("responseNote")}</p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={busy}
          className={cn(
            "inline-flex h-12 items-center justify-center gap-3 bg-navy-900 px-7 font-display text-data-sm uppercase tracking-[0.1em] text-cream-50 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-70",
            variant === "partner" && "w-full",
          )}
        >
          {busy ? <Loader2 aria-hidden className="size-4 animate-spin motion-reduce:animate-none" /> : null}
          {busy ? t("sending") : t("submit")}
        </button>
      </div>
    </form>
  );
}
