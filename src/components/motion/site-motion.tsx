"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Motion that belongs to the site around the Home hero.
 *
 * The Home hero already owns a bespoke, scrubbed GSAP timeline that moves the
 * navigation rail, the lockup and every headline line. This orchestrator never
 * enters any of its desktop or mobile roots. That boundary is selector-based,
 * so a new section reveal cannot accidentally inherit or overwrite the hero's
 * transforms later.
 */
const PROTECTED_MOTION = [
  "[data-hero-runway]",
  "[data-hero-stage]",
  "[data-mobile-hero]",
  "[data-hero-lockup]",
  "[data-hero-headline]",
  "[data-hero-copy]",
  "[data-hero-standin]",
  "[data-no-site-motion]",
].join(",");

const EASE = "power2.out";

function isProtected(element: Element) {
  return element.matches(PROTECTED_MOTION) || Boolean(element.closest(PROTECTED_MOTION));
}

function motionElements(root: HTMLElement, selector: string) {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !isProtected(element),
  );
}

export function SiteMotion() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-site-motion-root]");
    if (!root) return;

    let revert: (() => void) | undefined;
    const frame = window.requestAnimationFrame(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const context = gsap.context(() => {
          // Inner-page openings get one composed entrance. The Home hero is
          // excluded above and keeps its own scroll choreography untouched.
          for (const group of motionElements(root, "[data-motion-intro]")) {
            const parts = Array.from(group.children).slice(0, 7);
            if (!parts.length) continue;

            gsap.fromTo(
              parts,
              { autoAlpha: 0, y: 10 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.68,
                stagger: 0.065,
                ease: EASE,
                clearProps: "opacity,visibility,transform",
              },
            );
          }

          // A heading arrives as one thought, with its label, title and action
          // separated by only a few hundredths of a second.
          for (const heading of motionElements(root, "[data-motion-heading]")) {
            const parts = Array.from(heading.children).slice(0, 6);
            if (!parts.length) continue;

            gsap.fromTo(
              parts,
              { autoAlpha: 0, y: 8 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.52,
                stagger: 0.055,
                ease: EASE,
                clearProps: "opacity,visibility,transform",
                scrollTrigger: {
                  trigger: heading,
                  start: "top 90%",
                  once: true,
                },
              },
            );
          }

          // Tracks stagger their visible row as a unit. Four cards take less
          // than two tenths of a second to resolve, so the sequence never makes
          // somebody wait for the last card.
          for (const track of motionElements(root, "[data-motion-track]")) {
            const cards = Array.from(track.children).filter(
              (element): element is HTMLElement =>
                element instanceof HTMLElement && !isProtected(element),
            );
            if (!cards.length) continue;

            gsap.fromTo(
              cards,
              { autoAlpha: 0, y: 14 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.56,
                stagger: 0.055,
                ease: EASE,
                clearProps: "opacity,visibility,transform",
                scrollTrigger: {
                  trigger: track,
                  start: "top 91%",
                  once: true,
                },
              },
            );
          }

          // Cards outside a track enter independently. The index-based delay is
          // deliberately capped: it suggests a row without creating a wave.
          const cards = motionElements(root, "[data-motion-card]").filter(
            (card) => !card.closest("[data-motion-track]"),
          );
          cards.forEach((card, index) => {
            gsap.fromTo(
              card,
              { autoAlpha: 0, y: 14 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.54,
                delay: Math.min(index % 4, 3) * 0.045,
                ease: EASE,
                clearProps: "opacity,visibility,transform",
                scrollTrigger: {
                  trigger: card,
                  start: "top 91%",
                  once: true,
                },
              },
            );
          });

          // Account panels are operational surfaces, so they move less than
          // editorial cards and settle faster.
          for (const panel of motionElements(root, "[data-motion-panel]")) {
            gsap.fromTo(
              panel,
              { autoAlpha: 0, y: 9 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.46,
                ease: EASE,
                clearProps: "opacity,visibility,transform",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 92%",
                  once: true,
                },
              },
            );
          }

          // Top-level sections without a more specific motion role get one
          // restrained reveal. Nested sections are left to their parent so a
          // long page never turns into a stack of competing entrances.
          const sections = motionElements(root, "section").filter((section) => {
            if (
              section.matches("[data-motion-panel]") ||
              section.querySelector("[data-motion-intro]") ||
              section.querySelector("[data-motion-heading]") ||
              section.querySelector("[data-motion-track]") ||
              section.querySelector("[data-motion-card]")
            ) {
              return false;
            }

            const parentSection = section.parentElement?.closest("section");
            return !parentSection || isProtected(parentSection);
          });

          for (const section of sections) {
            gsap.fromTo(
              section,
              { autoAlpha: 0, y: 12 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.58,
                ease: EASE,
                clearProps: "opacity,visibility,transform",
                scrollTrigger: {
                  trigger: section,
                  start: "top 90%",
                  once: true,
                },
              },
            );
          }

          // Photography gets the site's signature: a shallow bottom curtain
          // and a 2.5% settle. It is vertical, so it needs no RTL mirror, and
          // inline transforms are cleared so existing hover zooms still work.
          for (const frameElement of motionElements(root, "[data-motion-media]")) {
            const visual = frameElement.querySelector<HTMLElement>("img, video");
            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: frameElement,
                start: "top 91%",
                once: true,
              },
            });

            timeline.fromTo(
              frameElement,
              { clipPath: "inset(0 0 14% 0)" },
              {
                clipPath: "inset(0 0 0% 0)",
                duration: 0.72,
                ease: EASE,
                clearProps: "clipPath",
              },
            );

            if (visual) {
              timeline.fromTo(
                visual,
                { scale: 1.025 },
                {
                  scale: 1,
                  duration: 0.86,
                  ease: EASE,
                  clearProps: "transform",
                },
                0,
              );
            }
          }
        }, root);

        const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 120);
        return () => {
          window.clearTimeout(refresh);
          context.revert();
        };
      });

      revert = () => media.revert();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      revert?.();
    };
  }, [pathname]);

  return null;
}
