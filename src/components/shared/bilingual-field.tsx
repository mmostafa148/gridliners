"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LocalizedText } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Paired EN + AR input for platform-authored content.
 *
 * Both fields are required (§3.8): category and criteria names, site pages,
 * legal pages and every notification template are authored in both languages,
 * and the admin UI enforces it. This is deliberately NOT used for entry
 * content, which is submitted in one language and never translated.
 *
 * Each side sets its own `dir` and `lang`, so the Arabic input is RTL even on
 * an English admin page.
 */
export function BilingualField({
  label,
  value,
  onChange,
  multiline = false,
  required = true,
  hint,
  errors,
  className,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
  required?: boolean;
  hint?: string;
  errors?: Partial<Record<keyof LocalizedText, string>>;
  className?: string;
}) {
  const t = useTranslations("field");
  const id = useId();
  const Control = multiline ? Textarea : Input;

  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className="flex items-baseline gap-2">
        <span className="text-body-sm font-medium">{label}</span>
        <span className="text-caption text-muted-foreground">
          {required ? t("required") : t("optional")}
        </span>
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-en`} className="text-caption text-muted-foreground">
            {t("english")}
          </Label>
          <Control
            id={`${id}-en`}
            lang="en"
            dir="ltr"
            value={value.en}
            aria-invalid={Boolean(errors?.en)}
            onChange={(event) => onChange({ ...value, en: event.target.value })}
          />
          {errors?.en ? <p className="text-caption text-destructive">{errors.en}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-ar`} className="text-caption text-muted-foreground">
            {t("arabic")}
          </Label>
          <Control
            id={`${id}-ar`}
            lang="ar"
            dir="rtl"
            value={value.ar}
            aria-invalid={Boolean(errors?.ar)}
            onChange={(event) => onChange({ ...value, ar: event.target.value })}
          />
          {errors?.ar ? <p className="text-caption text-destructive">{errors.ar}</p> : null}
        </div>
      </div>

      <p className="text-caption text-muted-foreground">{hint ?? t("bilingualHint")}</p>
    </fieldset>
  );
}
