import { Metadata } from "next";
import Link from "next/link";
import db from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { ArrowLeft, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { SubmitListingForm } from "./submit-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "List Your Business | Local Business Directory",
  description:
    "Register your local store, clinic, salon, or service in the official local business directory. Reach thousands of local residents.",
};

export default async function SubmitListingPage() {
  const currentUser = await getCurrentUser();

  const [categories, locations, plans] = await Promise.all([
    db.category.findMany({
      select: { id: true, name: true, parentId: true },
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
    db.location.findMany({
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.pricingPlan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        priceMinor: true,
        description: true,
        maxPhotos: true,
        badgeVisible: true,
        searchPriority: true,
      },
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base shadow-sm">
              PS
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm text-foreground block leading-none">
                Pimple Saudagar
              </span>
              <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">
                Local Business Directory
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Directory</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl py-10 flex-1 space-y-8">
        {/* Hero Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Official Community Listing Portal</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            List Your Business in Pimple Saudagar
          </h1>

          <p className="text-sm text-muted-foreground">
            Connect directly with residents looking for verified services across Kunal Icon Road,
            Kokane Chowk, Shivar Chowk, and Govind Garden.
          </p>
        </div>

        {/* Submission Form */}
        <SubmitListingForm
          categories={categories}
          locations={locations}
          plans={plans}
          currentUser={
            currentUser
              ? {
                  id: currentUser.id,
                  name: currentUser.name,
                  email: currentUser.email,
                  role: currentUser.role,
                }
              : null
          }
        />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground bg-muted/20">
        <p>© 2026 Local Business Directory. Built for the community.</p>
      </footer>
    </div>
  );
}

