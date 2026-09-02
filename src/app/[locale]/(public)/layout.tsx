import { SiteFrame } from "@/components/layout/site-frame";

/**
 * The public route group.
 *
 * Everything the frame does lives in `SiteFrame`, which the participant area
 * renders too — see build-state §47. This file exists to attach the frame to
 * this route group and nothing else.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteFrame>{children}</SiteFrame>;
}
