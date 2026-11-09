"use client";

import { useState } from "react";
import { Clock, Tag, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { ListingServiceItem } from "./types";
import { EnquiryModal } from "@/components/forms/enquiry-modal";

interface ListingServicesCatalogueProps {
  listingId: string;
  listingTitle: string;
  categoryName?: string;
  customServices?: ListingServiceItem[];
}

export function ListingServicesCatalogue({
  listingId,
  listingTitle,
  categoryName = "Services",
  customServices,
}: ListingServicesCatalogueProps) {
  // Curated benchmark services inspired by Justdial benchmark (Hair & Beauty Salon)
  const defaultServices: ListingServiceItem[] = [
    {
      id: "srv-1",
      title: "Signature Haircut & Styling",
      description: "Includes organic wash, scalp analysis, precision trim, and blowout styling.",
      price: 413,
      originalPrice: 550,
      duration: "45 mins",
      category: "Hair Care",
      popular: true,
    },
    {
      id: "srv-2",
      title: "Organic Botanical Hair Spa",
      description: "Deep conditioning with vegan argan essence, steam therapy, and head pressure points massage.",
      price: 1299,
      originalPrice: 1750,
      duration: "60 mins",
      category: "Hair Care",
      popular: true,
    },
    {
      id: "srv-3",
      title: "Detox & Radiance Herbal Facial",
      description: "Organic fruit-enzyme peel, pore extraction, cooling jade roller, and hydra-glow mask.",
      price: 899,
      originalPrice: 1200,
      duration: "60 mins",
      category: "Skin & Facials",
    },
    {
      id: "srv-4",
      title: "Ayurvedic Stress-Relief Head Massage",
      description: "Traditional herbal warm oil massage focused on neck, temples, and shoulders for tension relief.",
      price: 499,
      originalPrice: 650,
      duration: "30 mins",
      category: "Spa & Wellness",
    },
    {
      id: "srv-5",
      title: "Ammonia-Free Organic Global Hair Color",
      description: "100% cruelty-free, herbal micro-pigment coloration with post-color color-lock treatment.",
      price: 2499,
      originalPrice: 3200,
      duration: "90 mins",
      category: "Hair Care",
    },
    {
      id: "srv-6",
      title: "Deluxe Bridal & Occasion Makeover",
      description: "HD natural bridal or party styling, draped saree/attire assistance, and smudge-proof beauty setup.",
      price: 4999,
      originalPrice: 6500,
      duration: "120 mins",
      category: "Bridal & Styling",
    },
  ];

  const services = customServices && customServices.length > 0 ? customServices : defaultServices;

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(services.map((s) => s.category || "General")))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredServices =
    selectedCategory === "All"
      ? services
      : services.filter((s) => (s.category || "General") === selectedCategory);

  return (
    <section id="services" className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-6 scroll-mt-28">
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Tag className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Rate Card & Pricing
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Services & Popular Packages
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent pricing starting from ₹413. Special directory discounts applied.
          </p>
        </div>

        <div className="shrink-0">
          <EnquiryModal listingId={listingId} listingTitle={listingTitle} />
        </div>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((service) => {
          const discountPercent =
            service.originalPrice && service.originalPrice > service.price
              ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
              : null;

          return (
            <div
              key={service.id}
              className="flex flex-col justify-between p-5 rounded-2xl border border-border/70 bg-background/50 hover:bg-muted/30 transition hover:border-primary/40 group relative shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  {service.popular && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Sparkles className="h-2.5 w-2.5" />
                      Popular
                    </span>
                  )}
                </div>

                {service.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3 mt-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black text-foreground font-mono">
                      ₹{service.price.toLocaleString("en-IN")}
                    </span>
                    {service.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through font-mono">
                        ₹{service.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  {service.duration && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium mt-0.5">
                      <Clock className="h-3 w-3" />
                      {service.duration}
                    </span>
                  )}
                </div>

                <div className="shrink-0">
                  <EnquiryModal
                    listingId={listingId}
                    listingTitle={`${listingTitle} - ${service.title}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
