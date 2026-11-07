import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { SettingsService } from "@/lib/services/settings.service";
import { SettingsForm } from "./settings-form";
import Link from "next/link";
import { ChevronRight, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  if (!user || !hasRole(user.role, UserRole.admin)) {
    redirect("/admin");
  }

  const settings = await SettingsService.getAll();

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground transition">
          Admin
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-foreground">Settings</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-primary" />
            Dashboard & Website Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your directory name, admin console branding, moderation rules, and minor operational functions.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <SettingsForm initialSettings={settings} />
    </div>
  );
}

