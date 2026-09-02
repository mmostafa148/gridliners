import { setRequestLocale } from "next-intl/server";

import { PhasePlaceholder } from "@/components/layout/phase-placeholder";

export default async function JuryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PhasePlaceholder
      phase="Phase 4.1"
      title="Jury dashboard"
      description="Shell only. Assigned categories, scoring progress and the deadline countdown arrive in Phase 4."
    />
  );
}
