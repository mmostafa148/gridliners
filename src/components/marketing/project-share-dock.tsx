"use client";

import { Check, Link2, Share2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { LinkedInIcon, XMarkIcon } from "@/components/brand/social-icons";
import { cn } from "@/lib/utils";

/**
 * Share, as a square that stays with the reader.
 *
 * **It replaces the closing band.** A full-width blue section at the foot asked
 * for the share at the one moment a reader has already decided to leave. A
 * docked square is there for the whole page, costs a corner, and is the only
 * thing on the screen that follows.
 *
 * **The targets unfold as one aligned column.** They were stepped, each square
 * a notch further from the edge than the last; the idea was the brand's pixel
 * boundary, but four squares on four different edges read as a misalignment
 * rather than as a motif, so they sit flush with the trigger and with each
 * other.
 *
 * **Cream fill, navy hairline - because no single fill works on every band.**
 * The dock floats over navy, white and mist on the same page. Cream alone
 * vanishes on the two light bands; the identity's blue was measured at 1.90:1
 * against the navy hero, which is worse. A cream tile with a navy edge is
 * defined by the fill on navy and by the edge on white, and it is the same
 * cream the page already uses for the vote.
 *
 * The native sheet is offered only where the browser has one, and it is offered
 * *first*: it reaches every app the reader actually has, which no list of
 * hand-picked networks can. The rest are the fallback, not the point.
 */
export function ProjectShareDock({ url, title }: { url: string; title: string }) {
  const t = useTranslations("project.share");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Read on the client only: `navigator.share` is absent during the server
  // render, and branching on it in markup would hydrate into a mismatch.
  useEffect(() => setCanShare(typeof navigator !== "undefined" && Boolean(navigator.share)), []);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(id);
  }, [copied]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pointerdown", onDown); };
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard permission can be refused outright. The URL is in the address
      // bar and the canonical link is in the document head; nothing is faked.
    }
  }

  async function native() {
    try {
      await navigator.share({ title, url });
    } catch {
      // A dismissed sheet throws. Falling through to the clipboard would copy a
      // link the reader just declined to send, so it stops here.
    }
    setOpen(false);
  }

  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);

  const tiles: { key: string; label: string; icon: React.ReactNode; onClick?: () => void; href?: string }[] = [
    ...(canShare ? [{ key: "native", label: t("action"), icon: <Share2 aria-hidden className="size-5" />, onClick: native }] : []),
    { key: "copy", label: copied ? t("copied") : t("copy"), icon: copied ? <Check aria-hidden className="size-5" /> : <Link2 aria-hidden className="size-5" />, onClick: copy },
    { key: "x", label: "X", icon: <XMarkIcon className="size-[1.05rem]" />, href: `https://x.com/intent/post?url=${link}&text=${text}` },
    { key: "linkedin", label: "LinkedIn", icon: <LinkedInIcon className="size-[1.15rem]" />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}` },
  ];

  const tile =
    "flex size-14 items-center justify-center border border-navy-950/70 bg-cream-50 text-navy-950 shadow-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

  return (
    <div
      ref={root}
      className="pointer-events-none fixed bottom-6 end-6 z-40 flex flex-col items-end gap-2.5"
    >
      <ul
        id="share-targets"
        className={cn("flex flex-col items-end gap-2.5", !open && "pointer-events-none")}
        aria-hidden={!open}
      >
        {tiles.map((item, i) => (
          <li
            key={item.key}
            style={{ transitionDelay: `${open ? i * 45 : (tiles.length - 1 - i) * 30}ms` }}
            className={cn(
              "pointer-events-auto transition-all duration-300 motion-reduce:transition-none",
              open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-90 opacity-0",
            )}
          >
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                tabIndex={open ? 0 : -1}
                className={tile}
                onClick={() => setOpen(false)}
              >
                {item.icon}
              </a>
            ) : (
              <button
                type="button"
                aria-label={item.label}
                tabIndex={open ? 0 : -1}
                className={tile}
                onClick={item.onClick}
              >
                {item.icon}
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* The outcome is announced rather than left to the icon swap. */}
      <span aria-live="polite" className="sr-only">
        {copied ? t("copied") : ""}
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="share-targets"
        aria-label={t("action")}
        className={cn(
          "pointer-events-auto flex size-14 items-center justify-center shadow-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
          // The trigger inverts to navy so "dismiss" is not another blue square
          // in the column, and keeps a hairline so it is still a control on a
          // navy page rather than an icon floating in nothing.
          open
            ? "border border-cream-100/60 bg-navy-950 text-cream-50 hover:bg-navy-900"
            : "border border-navy-950/70 bg-cream-50 text-navy-950 hover:bg-white",
        )}
      >
        {open ? <X aria-hidden className="size-5" /> : <Share2 aria-hidden className="size-5" />}
      </button>
    </div>
  );
}
