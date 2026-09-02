import { BookOpen, ClipboardList, Gauge } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AppShell } from "@/components/layout/app-shell";

export default async function JuryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("shell");

  return (
    <AppShell
      area={t("juryArea")}
      items={[
        { href: "/jury", label: t("jury.overview"), icon: <Gauge /> },
        { href: "/jury/queue", label: t("jury.queue"), icon: <ClipboardList /> },
        { href: "/jury/guidelines", label: t("jury.guidelines"), icon: <BookOpen /> },
      ]}
    >
      {children}
    </AppShell>
  );
}
