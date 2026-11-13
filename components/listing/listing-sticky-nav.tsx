"use client";

import { useEffect, useState } from "react";

interface ListingStickyNavProps {
  photoCount?: number;
  reviewCount?: number;
  hasServices?: boolean;
  hasInsights?: boolean;
  hasTimings?: boolean;
  hasReviews?: boolean;
  hasAmenities?: boolean;
  hasFaqs?: boolean;
}

export function ListingStickyNav({
  photoCount = 0,
  reviewCount = 0,
  hasServices = true,
  hasInsights = true,
  hasTimings = true,
  hasReviews = true,
  hasAmenities = true,
  hasFaqs = false,
}: ListingStickyNavProps) {
  const [activeSection, setActiveSection] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview" },
    ...(hasServices ? [{ id: "services", label: "Services & Prices" }] : []),
    ...(hasInsights ? [{ id: "insights", label: "Why Customers Love This" }] : []),
    ...(photoCount > 0 ? [{ id: "photos", label: `Photos (${photoCount})` }] : []),
    ...(hasTimings ? [{ id: "timings", label: "Timings & Map" }] : []),
    ...(hasAmenities ? [{ id: "amenities", label: "Amenities" }] : []),
    ...(hasFaqs ? [{ id: "faqs", label: "FAQ" }] : []),
    ...(hasReviews ? [{ id: "reviews", label: reviewCount > 0 ? `Reviews (${reviewCount})` : "Reviews" }] : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = navItems
        .map((item) => ({ id: item.id, el: document.getElementById(item.id) }))
        .filter((item): item is { id: string; el: HTMLElement } => Boolean(item.el));

      const scrollPosition = window.scrollY + 140;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const item = sectionElements[i];
        if (item && item.el.offsetTop <= scrollPosition) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="sticky top-14 z-30 w-full bg-background/90 backdrop-blur-md border-b border-border/70 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto px-4">
        <nav
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1"
          aria-label="Listing navigation tabs"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
