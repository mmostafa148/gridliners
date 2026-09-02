import { setRequestLocale } from "next-intl/server";

import { PhasePlaceholder } from "@/components/layout/phase-placeholder";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PhasePlaceholder
      phase="Phase 5.1"
      title="Admin dashboard"
      description="Shell only. Phase controls, queues, scoring gaps and voting stats arrive in Phase 5."
    />
  );
}
