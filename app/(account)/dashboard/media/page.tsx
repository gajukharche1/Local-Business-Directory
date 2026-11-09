import { Metadata } from "next";
import { MediaManager } from "@/components/media/media-manager";

export const metadata: Metadata = {
  title: "Media Files | Merchant Dashboard",
  description: "Manage and organize your store photos, menus, and documents.",
};

export const dynamic = "force-dynamic";

export default function DashboardMediaPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <MediaManager
        title="My Media Files"
        description="Organize your business photos, storefront banners, and promotional media."
        isAdmin={false}
      />
    </div>
  );
}
