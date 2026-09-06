import type { Locale } from "@/i18n/routing";
import {
  createSiteShareImage,
  SITE_SHARE_IMAGE_SIZE,
  SITE_SHARE_IMAGE_TYPE,
} from "@/lib/social/site-share-image";

export const alt = "Gridliners Awards — celebrating the region's best design work";
export const size = SITE_SHARE_IMAGE_SIZE;
export const contentType = SITE_SHARE_IMAGE_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return createSiteShareImage(locale);
}
