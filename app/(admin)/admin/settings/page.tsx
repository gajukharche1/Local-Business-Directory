import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { SettingsService } from "@/lib/services/settings.service";
import db from "@/lib/db/client";
import { SettingsForm } from "./settings-form";
import Link from "next/link";
import { ChevronRight, Settings, ShieldCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  if (!user || !hasRole(user.role, UserRole.admin)) {
    redirect("/admin");
  }

  const [settings, rawUsers] = await Promise.all([
    SettingsService.getAll(),
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { listings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const initialUsers = rawUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground transition-colors font-medium">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-bold text-foreground">Settings & Governance</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Configuration Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-primary" />
            Dashboard & Website Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Customize directory name, logo badge initials, moderation policies, and communication channels.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4" />
          <span>Admin Role Authorized</span>
        </div>
      </div>

      {/* Main Settings Form */}
      <SettingsForm
        initialSettings={settings}
        initialUsers={initialUsers}
        currentUserId={user.id}
      />
    </div>
  );
}
