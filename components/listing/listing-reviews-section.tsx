"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ShieldCheck, CheckCircle2, MessageSquare, PenLine } from "lucide-react";
import { ListingReviewItem } from "./types";

interface ListingReviewsSectionProps {
  listingId: string;
  slug: string;
  title: string;
  averageRating: number;
  reviewCount: number;
  reviews?: ListingReviewItem[];
}

export function ListingReviewsSection({
  listingId: _listingId,
  slug,
  title,
  averageRating,
  reviewCount,
  reviews = [],
}: ListingReviewsSectionProps) {
  const [filterRating, setFilterRating] = useState<number | "all">("all");

  const displayedReviews = reviews || [];
  const count = reviewCount > 0 ? reviewCount : displayedReviews.length;
  const ratingNum =
    count > 0 && averageRating > 0
      ? averageRating
      : count > 0 && displayedReviews.length > 0
      ? displayedReviews.reduce((sum, r) => sum + r.rating, 0) / displayedReviews.length
      : 0;

  // Calculate histogram distribution from actual database reviews
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  displayedReviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  const totalReviews = displayedReviews.length > 0 ? displayedReviews.length : (count > 0 ? count : 1);
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const starCount = starCounts[stars] || 0;
    const pct = displayedReviews.length > 0 ? Math.round((starCount / totalReviews) * 100) : 0;
    return { stars, pct, count: starCount };
  });

  const filteredReviews =
    filterRating === "all"
      ? displayedReviews
      : displayedReviews.filter((r) => Math.round(r.rating) === filterRating);

  return (
    <section id="reviews" className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-8 scroll-mt-28">
      {/* Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Star className="h-4 w-4 fill-emerald-600" />
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Customer Feedback &amp; Reviews
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Ratings, Reviews &amp; Comments
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {count > 0
              ? `Based on ${count} verified customer ${count === 1 ? "rating" : "ratings"} and reviews.`
              : `Share your experience and be the first to review ${title}.`}
          </p>
        </div>

        <Link
          href={`/reviews/new?listing=${slug}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition hover:scale-101 active:scale-99 cursor-pointer"
        >
          <PenLine className="h-4 w-4" />
          <span>Write a Review / Comment</span>
        </Link>
      </div>

      {displayedReviews.length === 0 ? (
        /* Authentic Empty State - No fake reviews */
        <div className="text-center py-12 px-6 rounded-2xl bg-muted/20 border border-dashed border-border/80 space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <MessageSquare className="h-7 w-7 opacity-80" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-bold text-base text-foreground">
              No customer reviews yet
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Have you visited <strong className="text-foreground">{title}</strong>? Help other members of the community by sharing your genuine feedback.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/reviews/new?listing=${slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <PenLine className="h-4 w-4" />
              <span>Write the First Review</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Scorecard & Rating Histogram */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-muted/30 border border-border/60">
            {/* Score Display */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-border/60">
              <div className="text-5xl font-black text-foreground font-mono tracking-tight">
                {ratingNum > 0 ? ratingNum.toFixed(1) : "—"}
              </div>
              <div className="flex items-center gap-1 my-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(ratingNum)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-foreground">
                {count} {count === 1 ? "Total Rating" : "Total Ratings"}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                100% Verified Community Feedback
              </span>
            </div>

            {/* Progress Bar Histogram */}
            <div className="md:col-span-8 flex flex-col justify-center space-y-2">
              {distribution.map((row) => (
                <button
                  key={row.stars}
                  type="button"
                  onClick={() =>
                    setFilterRating(filterRating === row.stars ? "all" : row.stars)
                  }
                  className={`flex items-center gap-3 text-xs w-full group py-0.5 px-2 rounded-lg transition text-left cursor-pointer ${
                    filterRating === row.stars ? "bg-muted font-bold" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-1 w-12 font-mono text-muted-foreground group-hover:text-foreground">
                    <span>{row.stars}</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </div>

                  <div className="flex-1 h-2 rounded-full bg-muted-foreground/15 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>

                  <span className="w-12 text-right font-mono text-[11px] text-muted-foreground group-hover:text-foreground">
                    {row.pct}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-muted-foreground mr-1">Filter:</span>
            <button
              type="button"
              onClick={() => setFilterRating("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                filterRating === "all"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All Reviews
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterRating(s)}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                  filterRating === s
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{s}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </button>
            ))}
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border border-dashed border-border/80 text-muted-foreground text-xs">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-foreground">No reviews match this rating filter.</p>
                <button
                  onClick={() => setFilterRating("all")}
                  className="mt-2 text-primary font-bold underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl border border-border/70 bg-background/50 hover:bg-muted/20 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-extrabold text-sm flex items-center justify-center shrink-0">
                        {rev.reviewerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            {rev.reviewerName}
                          </span>
                          {rev.verifiedVisit && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Verified Visit
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {typeof rev.createdAt === "string"
                            ? rev.createdAt
                            : new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-emerald-600 text-white font-mono font-bold text-xs">
                      <span>{rev.rating}</span>
                      <Star className="h-3 w-3 fill-white text-white" />
                    </div>
                  </div>

                  {rev.title && (
                    <h4 className="font-bold text-sm text-foreground">
                      {rev.title}
                    </h4>
                  )}

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {rev.body}
                  </p>

                  {/* Owner Response Thread */}
                  {rev.ownerReply && (
                    <div className="mt-3 p-4 rounded-xl bg-muted/60 border-l-3 border-primary text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-foreground text-[11px]">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span>Response from Owner ({title})</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {rev.ownerReply}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
