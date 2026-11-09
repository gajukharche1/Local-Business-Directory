import { Metadata } from "next";
import { MediaManager } from "@/components/media/media-manager";

export const metadata: Metadata = {
  title: "Media Library | Admin Console",
  description: "Global media asset management and file governance.",
};

export const dynamic = "force-dynamic";

export default function AdminMediaPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <MediaManager
        title="Admin Media Library"
        description="Global asset repository across all directory listings, categories, and site assets."
        isAdmin={true}
      />
    </div>
  );
}
