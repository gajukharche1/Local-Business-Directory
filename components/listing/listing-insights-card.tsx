"use client";

import { ThumbsUp, CreditCard, ShieldCheck, Sparkles, Check, HeartHandshake } from "lucide-react";

interface ListingInsightsCardProps {
  title: string;
  yearEstablished?: number | null;
  customInsights?: string[];
  paymentModes?: string[];
  showInsights?: boolean;
  showPaymentModes?: boolean;
}

export function ListingInsightsCard({
  title,
  yearEstablished,
  customInsights,
  paymentModes,
  showInsights = true,
  showPaymentModes = true,
}: ListingInsightsCardProps) {
  if (!showInsights && !showPaymentModes) return null;

  const defaultInsights = [
    "Certified 100% Organic, Ammonia-free & Vegan Formulations",
    "Courteous, master-trained and attentive hair & skin artists",
    "Calm, hygienic, and pristine spa sanctuary environment",
    "Ethical & cruelty-free standards with personalized consultations",
    "Transparent pricing with zero hidden add-on costs",
  ];

  const insights = customInsights && customInsights.length > 0 ? customInsights : defaultInsights;

  const defaultPayments = [
    "UPI (GPay / PhonePe / Paytm)",
    "Credit & Debit Cards (Visa / Master / RuPay)",
    "Net Banking",
    "Cash Accepted",
  ];

  const payments = paymentModes && paymentModes.length > 0 ? paymentModes : defaultPayments;

  return (
    <section id="insights" className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-6 scroll-mt-28">
      {/* Customer Insights Block */}
      {showInsights && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ThumbsUp className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Verified Customer Sentiment
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Why People Love {title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Synthesized from authentic customer reviews, verified visits, and business credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-foreground font-medium"
              >
                <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modes of Payment Accepted */}
      {showPaymentModes && (
        <div className={showInsights ? "pt-4 border-t border-border/60" : ""}>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Modes of Payment Accepted
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {payments.map((mode, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/60 text-xs font-semibold text-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{mode}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
