import { Skeleton } from "@/components/ui/skeleton";

export default function AdminListingsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Filter Tabs & Search Bar Skeleton */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-8 w-12 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-48 sm:w-60 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>

      {/* Listings Table Skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-4">Business & Category</th>
                <th scope="col" className="px-5 py-4">Locality</th>
                <th scope="col" className="px-5 py-4">Rating</th>
                <th scope="col" className="px-5 py-4">Status</th>
                <th scope="col" className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                      <div className="space-y-1.5 min-w-0">
                        <Skeleton className="h-4 w-44 rounded-md" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-20 rounded" />
                          <Skeleton className="h-3 w-24 rounded" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-3 w-40 rounded" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-10 rounded-md" />
                      <Skeleton className="h-3 w-8 rounded" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-7 w-28 rounded-lg" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-7 w-12 rounded-lg" />
                      <Skeleton className="h-7 w-14 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

