"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { ListingFaqItem } from "./types";

interface ListingFaqSectionProps {
  title: string;
  faqs: ListingFaqItem[];
}

export function ListingFaqSection({ title, faqs }: ListingFaqSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  // Initialize with the first item expanded by default
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleItem = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Structured schema for search engine rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section
      id="faqs"
      className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-6 scroll-mt-28"
    >
      {/* Schema.org FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <div className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <HelpCircle className="h-4 w-4" />
          </span>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Help &amp; Answers
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Common queries answered directly for {title}.
        </p>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div
              key={faq.id || idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-sky-500/40 bg-sky-50/20 dark:bg-sky-950/10 shadow-xs"
                  : "border-border/70 bg-background/50 hover:bg-muted/30"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                className="w-full flex items-center justify-between gap-4 p-4 text-left cursor-pointer transition select-none"
                aria-expanded={isOpen}
              >
                <span className="font-bold text-sm text-foreground">
                  {faq.question}
                </span>
                <span
                  className={`p-1 rounded-lg text-muted-foreground transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-sky-600" : ""
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in-50 duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
