"use client";

import { AlertTriangle, ChevronDown, ChevronUp, Loader2, UploadCloud, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";

import { FieldLabel } from "@/components/account/system";
import { cn } from "@/lib/utils";

/**
 * Step 4's file control.
 *
 * **It never claims a file was uploaded.** There is no storage in this build,
 * so the control validates the file, shows a short in-flight state, and then
 * holds the *name* - and the panel above it says so in as many words. A control
 * that showed a green tick over a file that went nowhere is the one thing the
 * brief rules out by name.
 *
 * Everything is reachable from a keyboard: the picker is a real
 * `<input type="file">` behind a label, and reordering is two buttons rather
 * than a drag handle, because a drag handle is a control a keyboard cannot use.
 */

export interface UploadState {
  name: string;
  status: "done" | "uploading" | "failed";
}

export function UploadField({
  label,
  hint,
  accept,
  multiple,
  maxMb,
  maxCount,
  files,
  onChange,
  error,
  fieldName,
}: {
  label: string;
  hint: string;
  accept: string;
  multiple?: boolean;
  maxMb: number;
  maxCount?: number;
  files: UploadState[];
  onChange: (next: UploadState[]) => void;
  error?: string | null;
  fieldName: string;
}) {
  const t = useTranslations("wizard.s4");
  const uid = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const accepted = accept.split(",").map((a) => a.trim().toLowerCase());

  async function take(list: FileList | null) {
    if (!list?.length) return;
    setLocalError(null);
    const incoming = Array.from(list);

    if (maxCount && files.length + incoming.length > maxCount) {
      setLocalError(t("tooMany", { n: maxCount }));
      return;
    }
    for (const file of incoming) {
      const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
      if (!accepted.includes(ext) && !accepted.includes(file.type)) {
        setLocalError(t("wrongType"));
        return;
      }
      if (file.size > maxMb * 1024 * 1024) {
        setLocalError(t("tooBig", { mb: maxMb }));
        return;
      }
    }

    // A visible in-flight state, because a real upload has one and the screen
    // has to be built against it. It resolves to "held", never to "stored".
    setBusy(true);
    const pending = incoming.map((f) => ({ name: f.name, status: "uploading" as const }));
    onChange(multiple ? [...files, ...pending] : pending);
    await new Promise((resolve) => setTimeout(resolve, 450));
    const done = incoming.map((f) => ({ name: f.name, status: "done" as const }));
    onChange(multiple ? [...files, ...done] : done);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, by: -1 | 1) {
    const next = [...files];
    const target = index + by;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  const message = error ?? localError;

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <p className="text-body-sm text-navy-600">{hint}</p>

      <div className="mt-1">
        <label
          htmlFor={uid}
          className={cn(
            "group flex min-h-36 w-full cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-navy-900/25 bg-mist/45 px-6 py-8 text-center",
            "text-body-md font-medium text-navy-900 transition-colors",
            "hover:border-blue-700/50 hover:bg-blue-700/[0.035]",
            "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-700",
          )}
        >
          <span className="grid size-12 place-items-center border border-blue-700/15 bg-white text-blue-700 transition-colors group-hover:border-blue-700/30">
            {busy ? (
              <Loader2 aria-hidden className="size-5 animate-spin motion-reduce:animate-none" />
            ) : (
              <UploadCloud aria-hidden className="size-5" strokeWidth={1.7} />
            )}
          </span>
          <span>{multiple ? t("add") : t("addCover")}</span>
          {files.length === 0 ? (
            <span className="text-caption font-normal text-navy-600">
              {multiple ? t("empty") : t("noCover")}
            </span>
          ) : null}
          <input
            ref={inputRef}
            id={uid}
            data-field={fieldName}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(event) => take(event.target.files)}
            className="sr-only"
          />
        </label>
      </div>

      {files.length ? (
        <ul className="mt-2 flex flex-col border border-navy-900/12">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 border-b border-navy-900/10 px-3 py-2.5 last:border-b-0"
            >
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0",
                  file.status === "done" && "bg-blue-700",
                  file.status === "uploading" && "bg-campaign-yellow",
                  file.status === "failed" && "bg-campaign-orange",
                )}
              />
              <span className="min-w-0 flex-1 truncate font-data text-data-sm text-navy-900">
                {file.name}
              </span>
              {file.status === "uploading" ? (
                <span className="text-caption text-navy-600" role="status">
                  {t("uploading")}
                </span>
              ) : null}
              {file.status === "failed" ? (
                <button
                  type="button"
                  onClick={() => {
                    const next = [...files];
                    next[index] = { ...file, status: "done" };
                    onChange(next);
                  }}
                  className="text-body-sm font-medium text-destructive-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  {t("retry")}
                </button>
              ) : null}

              {multiple && files.length > 1 ? (
                <span className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`${t("moveUp")}: ${file.name}`}
                    className="grid size-8 place-items-center text-navy-600 transition-colors hover:text-navy-900 disabled:opacity-30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <ChevronUp aria-hidden className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === files.length - 1}
                    aria-label={`${t("moveDown")}: ${file.name}`}
                    className="grid size-8 place-items-center text-navy-600 transition-colors hover:text-navy-900 disabled:opacity-30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <ChevronDown aria-hidden className="size-4" />
                  </button>
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                aria-label={`${t("remove")}: ${file.name}`}
                className="grid size-8 shrink-0 place-items-center text-navy-600 transition-colors hover:text-destructive focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700"
              >
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {message ? (
        <p role="alert" className="flex items-start gap-2 text-body-sm text-destructive-ink">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {message}
        </p>
      ) : null}
    </div>
  );
}
