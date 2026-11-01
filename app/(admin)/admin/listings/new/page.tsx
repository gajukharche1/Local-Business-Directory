import { Metadata } from "next";
import Link from "next/link";
import db from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { AdminListingForm } from "./admin-listing-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add New Business Listing | Admin Console",
  description: "Create and publish a verified local business listing in Pimple Saudagar.",
};

export default async function AdminNewListingPage() {
  const user = await getCurrentUser();
  if (!user || !hasRole(user.role, UserRole.moderator)) {
    redirect("/login?redirectTo=/admin/listings/new");
  }

  const [categories, locations, plans, users] = await Promise.all([
    db.category.findMany({
      select: { id: true, name: true, parentId: true },
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
    db.location.findMany({
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.pricingPlan.findMany({
      select: { id: true, name: true, priceMinor: true },
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    db.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/listings"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Directory</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-red-600" />
            <span>Create New Business Listing</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add a new business profile with verified status, category taxonomy, and operational details.
          </p>
        </div>
      </div>

      <AdminListingForm
        categories={categories}
        locations={locations}
        plans={plans}
        users={users}
      />
    </div>
  );
}

