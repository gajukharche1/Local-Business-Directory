import { Skeleton } from "@/components/ui/skeleton";

export default function AdminNewListingLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Back button & Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-8 w-60 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Form sections grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Core Information Card */}
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs space-y-5">
            <div className="space-y-1.5 border-b border-border/60 pb-3">
              <Skeleton className="h-5 w-44 rounded-lg" />
              <Skeleton className="h-3.5 w-64 rounded-md" />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Location & Address Card */}
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs space-y-5">
            <div className="space-y-1.5 border-b border-border/60 pb-3">
              <Skeleton className="h-5 w-36 rounded-lg" />
              <Skeleton className="h-3.5 w-52 rounded-md" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Taxonomy, Plan & Action Card */}
        <div className="space-y-6">
          {/* Category Picker Card */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-full rounded-xl" />
              <div className="flex flex-wrap gap-1.5 pt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>

          {/* Pricing Plan Card */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
            <Skeleton className="h-5 w-28 rounded-lg" />
            <div className="space-y-2.5">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>

          {/* Submit Action Card */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

