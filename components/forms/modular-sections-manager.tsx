"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Tag,
  ThumbsUp,
  CreditCard,
  Clock,
  MessageSquare,
  Zap,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import {
  ListingCustomSections,
  ListingSectionToggles,
  ListingServiceItem,
} from "@/components/listing/types";

interface ModularSectionsManagerProps {
  initialData?: ListingCustomSections | null;
}

const DEFAULT_TOGGLES: ListingSectionToggles = {
  services: true,
  insights: true,
  paymentModes: true,
  hours: true,
  amenities: true,
  reviews: true,
  leadSidebar: true,
};

const DEFAULT_SERVICES_TEMPLATE: ListingServiceItem[] = [
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
];

const DEFAULT_INSIGHTS_TEMPLATE = [
  "Certified 100% Organic, Ammonia-free & Vegan Formulations",
  "Courteous, master-trained and attentive hair & skin artists",
  "Calm, hygienic, and pristine spa sanctuary environment",
  "Ethical & cruelty-free standards with personalized consultations",
  "Transparent pricing with zero hidden add-on costs",
];

const STANDARD_PAYMENT_MODES = [
  "UPI (GPay / PhonePe / Paytm)",
  "Credit & Debit Cards (Visa / Master / RuPay)",
  "Net Banking",
  "Cash Accepted",
  "EMI Options Available",
];

export function ModularSectionsManager({ initialData }: ModularSectionsManagerProps) {
  const [toggles, setToggles] = useState<ListingSectionToggles>({
    ...DEFAULT_TOGGLES,
    ...(initialData?.toggles || {}),
  });

  const [services, setServices] = useState<ListingServiceItem[]>(
    initialData?.services && initialData.services.length > 0
      ? initialData.services
      : DEFAULT_SERVICES_TEMPLATE
  );

  const [insights, setInsights] = useState<string[]>(
    initialData?.insights && initialData.insights.length > 0
      ? initialData.insights
      : DEFAULT_INSIGHTS_TEMPLATE
  );

  const [paymentModes, setPaymentModes] = useState<string[]>(
    initialData?.paymentModes && initialData.paymentModes.length > 0
      ? initialData.paymentModes
      : STANDARD_PAYMENT_MODES.slice(0, 4)
  );

  // New service input states
  const [newSrvTitle, setNewSrvTitle] = useState("");
  const [newSrvPrice, setNewSrvPrice] = useState("");
  const [newSrvOriginalPrice, setNewSrvOriginalPrice] = useState("");
  const [newSrvDuration, setNewSrvDuration] = useState("");
  const [newSrvCategory, setNewSrvCategory] = useState("");
  const [newSrvDesc, setNewSrvDesc] = useState("");
  const [newSrvPopular, setNewSrvPopular] = useState(false);

  // New insight input state
  const [newInsightText, setNewInsightText] = useState("");
  const [customPaymentInput, setCustomPaymentInput] = useState("");

  const handleToggle = (key: keyof ListingSectionToggles) => {
    setToggles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvTitle.trim() || !newSrvPrice) return;

    const newService: ListingServiceItem = {
      id: `srv-${Date.now()}`,
      title: newSrvTitle.trim(),
      price: Number(newSrvPrice),
      originalPrice: newSrvOriginalPrice ? Number(newSrvOriginalPrice) : undefined,
      duration: newSrvDuration.trim() || undefined,
      category: newSrvCategory.trim() || "General",
      description: newSrvDesc.trim() || undefined,
      popular: newSrvPopular,
    };

    setServices((prev) => [...prev, newService]);
    setNewSrvTitle("");
    setNewSrvPrice("");
    setNewSrvOriginalPrice("");
    setNewSrvDuration("");
    setNewSrvCategory("");
    setNewSrvDesc("");
    setNewSrvPopular(false);
  };

  const handleRemoveService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddInsight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsightText.trim()) return;
    setInsights((prev) => [...prev, newInsightText.trim()]);
    setNewInsightText("");
  };

  const handleRemoveInsight = (index: number) => {
    setInsights((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTogglePaymentMode = (mode: string) => {
    setPaymentModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleAddCustomPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPaymentInput.trim() || paymentModes.includes(customPaymentInput.trim())) return;
    setPaymentModes((prev) => [...prev, customPaymentInput.trim()]);
    setCustomPaymentInput("");
  };

  // Compile full JSON payload for hidden form field
  const sectionsPayload: ListingCustomSections = {
    toggles,
    services: toggles.services ? services : [],
    insights: toggles.insights ? insights : [],
    paymentModes: toggles.paymentModes ? paymentModes : [],
  };

  return (
    <div className="space-y-6">
      {/* Hidden input to transmit structured section configuration to Server Action */}
      <input
        type="hidden"
        name="customSections"
        value={JSON.stringify(sectionsPayload)}
      />

      {/* Master Section Toggle Controls */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                Modular Frontend Components & Sections
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Enable or disable sections on this listing detail page to match the business model.
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Switch Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Services Catalogue Toggle */}
          <div
            onClick={() => handleToggle("services")}
            className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
              toggles.services
                ? "bg-primary/5 border-primary/40 text-foreground"
                : "bg-muted/40 border-border/60 text-muted-foreground opacity-75"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Tag className="h-4 w-4 text-primary" />
              <div>
                <p className="font-bold">Services & Rate Card</p>
                <p className="text-[10px] text-muted-foreground">Pricing, duration & booking</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                toggles.services ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {toggles.services ? "Active" : "Hidden"}
            </span>
          </div>

          {/* Customer Insights Toggle */}
          <div
            onClick={() => handleToggle("insights")}
            className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
              toggles.insights
                ? "bg-primary/5 border-primary/40 text-foreground"
                : "bg-muted/40 border-border/60 text-muted-foreground opacity-75"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ThumbsUp className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="font-bold">Why Customers Love This</p>
                <p className="text-[10px] text-muted-foreground">Sentiment USPs & highlights</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                toggles.insights ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {toggles.insights ? "Active" : "Hidden"}
            </span>
          </div>

          {/* Payment Modes Toggle */}
          <div
            onClick={() => handleToggle("paymentModes")}
            className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
              toggles.paymentModes
                ? "bg-primary/5 border-primary/40 text-foreground"
                : "bg-muted/40 border-border/60 text-muted-foreground opacity-75"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-4 w-4 text-indigo-500" />
              <div>
                <p className="font-bold">Accepted Payment Modes</p>
                <p className="text-[10px] text-muted-foreground">UPI, Cards, Net Banking</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                toggles.paymentModes ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {toggles.paymentModes ? "Active" : "Hidden"}
            </span>
          </div>

          {/* Timings Schedule Toggle */}
          <div
            onClick={() => handleToggle("hours")}
            className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
              toggles.hours
                ? "bg-primary/5 border-primary/40 text-foreground"
                : "bg-muted/40 border-border/60 text-muted-foreground opacity-75"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-amber-500" />
              <div>
                <p className="font-bold">Operational Timetable</p>
                <p className="text-[10px] text-muted-foreground">Live open status & timetable</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                toggles.hours ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {toggles.hours ? "Active" : "Hidden"}
            </span>
          </div>

          {/* Reviews Hub Toggle */}
          <div
            onClick={() => handleToggle("reviews")}
            className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
              toggles.reviews
                ? "bg-primary/5 border-primary/40 text-foreground"
                : "bg-muted/40 border-border/60 text-muted-foreground opacity-75"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="font-bold">Customer Reviews Hub</p>
                <p className="text-[10px] text-muted-foreground">Ratings histogram & replies</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                toggles.reviews ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {toggles.reviews ? "Active" : "Hidden"}
            </span>
          </div>

          {/* Sticky Lead Sidebar Form Toggle */}
          <div
            onClick={() => handleToggle("leadSidebar")}
            className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
              toggles.leadSidebar
                ? "bg-primary/5 border-primary/40 text-foreground"
                : "bg-muted/40 border-border/60 text-muted-foreground opacity-75"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <div>
                <p className="font-bold">Fast-Response Lead Form</p>
                <p className="text-[10px] text-muted-foreground">Get Best Deal sidebar widget</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                toggles.leadSidebar ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {toggles.leadSidebar ? "Active" : "Hidden"}
            </span>
          </div>
        </div>
      </div>

      {/* Services & Rate Card Configuration (Only if Services is toggled ON) */}
      {toggles.services && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-primary" />
                <span>Rate Card & Services Catalogue ({services.length} items)</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Manage specific packages, starting prices, and service durations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setServices(DEFAULT_SERVICES_TEMPLATE)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted px-2.5 py-1 rounded-lg transition"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Template</span>
            </button>
          </div>

          {/* Current Services List */}
          <div className="space-y-2">
            {services.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 text-xs gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">{item.title}</span>
                    {item.popular && (
                      <span className="shrink-0 text-[10px] font-extrabold bg-amber-500/10 text-amber-600 px-1.5 py-0.2 rounded">
                        Popular
                      </span>
                    )}
                    {item.category && (
                      <span className="shrink-0 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="font-mono font-bold text-foreground">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                    {item.originalPrice && (
                      <span className="line-through font-mono">
                        ₹{item.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                    {item.duration && <span>• {item.duration}</span>}
                    {item.description && (
                      <span className="truncate hidden sm:inline">• {item.description}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveService(item.id)}
                  title="Remove this service"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Service Form */}
          <div className="p-4 rounded-xl border border-dashed border-border/80 bg-background/50 space-y-3">
            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-primary" />
              <span>Add Custom Service / Package</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={newSrvTitle}
                  onChange={(e) => setNewSrvTitle(e.target.value)}
                  placeholder="e.g. Keratin Hair Treatment"
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  value={newSrvPrice}
                  onChange={(e) => setNewSrvPrice(e.target.value)}
                  placeholder="e.g. 1499"
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Original MRP (₹) (Optional)
                </label>
                <input
                  type="number"
                  value={newSrvOriginalPrice}
                  onChange={(e) => setNewSrvOriginalPrice(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Duration (Optional)
                </label>
                <input
                  type="text"
                  value={newSrvDuration}
                  onChange={(e) => setNewSrvDuration(e.target.value)}
                  placeholder="e.g. 60 mins"
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Category Tag (Optional)
                </label>
                <input
                  type="text"
                  value={newSrvCategory}
                  onChange={(e) => setNewSrvCategory(e.target.value)}
                  placeholder="e.g. Hair Care, Skin, Spa"
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newSrvPopular}
                    onChange={(e) => setNewSrvPopular(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-foreground">Mark Popular</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Short Service Description (Optional)
              </label>
              <input
                type="text"
                value={newSrvDesc}
                onChange={(e) => setNewSrvDesc(e.target.value)}
                placeholder="e.g. Formaldehyde-free botanical formulation with restorative protein seal."
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="button"
              onClick={handleAddService}
              disabled={!newSrvTitle.trim() || !newSrvPrice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-600 text-primary-foreground font-bold text-xs transition disabled:opacity-40 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add to Rate Card</span>
            </button>
          </div>
        </div>
      )}

      {/* Customer Insights Configuration (Only if Insights is toggled ON) */}
      {toggles.insights && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <ThumbsUp className="h-4 w-4 text-emerald-600" />
                <span>"Why People Love This" Customer Sentiment Highlights</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Highlight key USPs, certifications, and verified customer feedback points.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setInsights(DEFAULT_INSIGHTS_TEMPLATE)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted px-2.5 py-1 rounded-lg transition"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Template</span>
            </button>
          </div>

          <div className="space-y-2">
            {insights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-foreground gap-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveInsight(idx)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom insight */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newInsightText}
              onChange={(e) => setNewInsightText(e.target.value)}
              placeholder="e.g. Valet parking available on weekends"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleAddInsight}
              disabled={!newInsightText.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition disabled:opacity-40 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Highlight</span>
            </button>
          </div>
        </div>
      )}

      {/* Payment Modes Configuration (Only if Payment Modes is toggled ON) */}
      {toggles.paymentModes && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4 animate-in fade-in-50 duration-200">
          <div>
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-indigo-500" />
              <span>Modes of Payment Accepted</span>
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Select all payment options accepted at this business location.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {STANDARD_PAYMENT_MODES.map((mode) => {
              const isSelected = paymentModes.includes(mode);
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleTogglePaymentMode(mode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    isSelected
                      ? "bg-foreground text-background shadow-xs font-bold"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  <span>{mode}</span>
                </button>
              );
            })}
          </div>

          {/* Add custom payment mode */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50 max-w-sm">
            <input
              type="text"
              value={customPaymentInput}
              onChange={(e) => setCustomPaymentInput(e.target.value)}
              placeholder="e.g. Sodexo / Meal Pass"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleAddCustomPayment}
              disabled={!customPaymentInput.trim()}
              className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition disabled:opacity-40 cursor-pointer"
            >
              Add Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
