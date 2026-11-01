import { Metadata } from "next";
import db from "@/lib/db/client";
import { CategoryManager, CategoryItem } from "./category-manager";
import { FolderTree } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Category & SEO Management | Admin Back-Office",
  description: "Create and edit business directory categories, permanent URL slugs, and SEO meta tags.",
};

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          listings: true,
          children: true,
        },
      },
    },
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">
            <FolderTree className="h-4 w-4" />
            <span>Taxonomy Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Category &amp; SEO Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage permanent category URL paths, parent hierarchies, Google search SERP snippets, and social sharing Open Graph cards.
          </p>
        </div>
      </div>

      {/* Interactive Category Manager */}
      <CategoryManager initialCategories={categories as CategoryItem[]} />
    </div>
  );
}

