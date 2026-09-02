import {
  Award,
  Bell,
  CalendarCog,
  DollarSign,
  FileText,
  Files,
  LayoutDashboard,
  Scale,
  ScrollText,
  Tags,
  Users,
  Vote,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AppShell } from "@/components/layout/app-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("shell");

  return (
    <AppShell
      area={t("adminArea")}
      items={[
        { href: "/admin", label: t("admin.overview"), icon: <LayoutDashboard /> },
        { href: "/admin/cycle", label: t("admin.cycle"), icon: <CalendarCog /> },
        { href: "/admin/pricing", label: t("admin.pricing"), icon: <DollarSign /> },
        { href: "/admin/categories", label: t("admin.categories"), icon: <Tags /> },
        { href: "/admin/entries", label: t("admin.entries"), icon: <Files /> },
        { href: "/admin/settlements", label: t("admin.settlements"), icon: <Scale /> },
        { href: "/admin/jury", label: t("admin.juryManager"), icon: <Users /> },
        { href: "/admin/voting", label: t("admin.voting"), icon: <Vote /> },
        { href: "/admin/results", label: t("admin.results"), icon: <Award /> },
        { href: "/admin/notifications", label: t("admin.notifications"), icon: <Bell /> },
        { href: "/admin/content", label: t("admin.content"), icon: <FileText /> },
        { href: "/admin/participants", label: t("admin.participants"), icon: <Users /> },
        { href: "/admin/audit", label: t("admin.audit"), icon: <ScrollText /> },
      ]}
    >
      {children}
    </AppShell>
  );
}
