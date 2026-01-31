import PolishShell from "@/app/_client/PolishShell";
import AdminShellClient from "@/components/admin/AdminShellClient";

export const metadata = {
  title: "Dominat8 Admin",
  description: "Dominat8 admin console.",
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShellClient buildStamp="ADMIN_UI_CLEANUP_20260127_191419">{children}</AdminShellClient>;
}