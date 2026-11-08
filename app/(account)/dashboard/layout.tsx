import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      {/* Collapsible Sidebar Navigation */}
      <DashboardSidebar
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/70 bg-card px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Pimple Saudagar Merchant Console</span>
            <span className="sm:hidden font-bold text-foreground">Merchant Console</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/submit"
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition shadow-2xs"
            >
              + Add New Listing
            </Link>

            <DashboardUserMenu
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              }}
            />
          </div>
        </header>

        <main className="flex-1 p-6 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
