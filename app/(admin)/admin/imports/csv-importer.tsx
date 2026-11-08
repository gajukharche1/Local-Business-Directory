"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileSpreadsheet,
  Store,
  FolderTree,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Sparkles,
  RotateCcw,
  Eye,
  Loader2,
  ExternalLink,
  Code2,
} from "lucide-react";
import {
  importListingsAction,
  importCategoriesAction,
  importLocationsAction,
  ImportListingInput,
  ImportCategoryInput,
  ImportLocationInput,
} from "@/actions/admin";
import { parseOpeningHoursInput, formatScheduleBrief } from "@/lib/utils/opening-hours-parser";

type ImportType = "listings" | "categories" | "locations";

// ==========================================
// SAMPLE CSV DATASETS & TEMPLATES
// ==========================================
const SAMPLES: Record<ImportType, { sample: string; filename: string }> = {
  listings: {
    filename: "listings-import-template.csv",
    sample: `title,categorySlug,locationSlug,phone,whatsapp,email,website,address,locality,openingHours,priceRange,description
Saudagar Fitness Hub,gyms-fitness,pimple-saudagar,9876543210,9876543210,contact@saudagarfit.in,https://saudagarfit.in,"Shop 14, Rainbow Plaza, Shivar Garden",Pimple Saudagar,"Mon-Sat: 06:00-22:00, Sun: 07:00-13:00",3,Premium 24x7 fitness center with personal trainers and CrossFit.
Kunal Sweets & Snacks,restaurants-cafes,kunal-icon-road,9823001122,,sweets@kunal.com,,"Shop 3, Kunal Icon Road",Kunal Icon Road,"Daily: 08:00-22:00",2,Authentic Maharashtrian sweets and hot snacks.
Dr. Smile Dental Care,healthcare,kokane-chowk,9922334455,,,https://drsmile.in,"Office 201, Vision 9 Mall",Kokane Chowk,"Mon-Sat: 09:30-20:30, Sun: Closed",2,Comprehensive root canal and cosmetic dentistry.
24x7 MedPlus Pharmacy,healthcare,shivar-chowk,9123456789,,,,Near Shivar Chowk,Shivar Chowk,24/7,1,All genuine medicines and emergency healthcare essentials.
Green Earth Plant Nursery,home-services,govind-garden-area,9123456788,,,,Govind Garden Chowk,Govind Garden Area,"09:00-19:00",2,Indoor plants pots organic soil and gardening tools.`,
  },
  categories: {
    filename: "categories-import-template.csv",
    sample: `name,slug,parentSlug,icon,sortOrder,featuredOnHome,description
Restaurants & Cafes,restaurants-cafes,,Utensils,1,true,Top dining restaurants cafes and bakeries across Pimple Saudagar.
Healthcare & Clinics,healthcare,,Stethoscope,2,true,Hospitals clinics pharmacies and doctors in Pimple Saudagar.
Dentists & Dental Care,dentists-dental-care,healthcare,Smile,1,false,Verified dental clinics orthodontists and implant specialists.
Gyms & Fitness,gyms-fitness,,Dumbbell,3,true,Fitness clubs CrossFit yoga studios and personal trainers.
Home Services & Repairs,home-services,,Wrench,4,false,Electricians plumbers AC repair and painters.
Education & Coaching,education,,GraduationCap,5,false,Schools preschools and competitive exam coaching centers.`,
  },
  locations: {
    filename: "locations-import-template.csv",
    sample: `name,slug,parentSlug,latitude,longitude,sortOrder,featured,description
Pimple Saudagar Central,pimple-saudagar,,18.5987,73.7978,1,true,Main central commercial and residential zone of Pimple Saudagar.
Kokane Chowk,kokane-chowk,pimple-saudagar,18.5954,73.7998,2,true,Key junction connecting Pimple Saudagar to Rahatani and Hinjawadi.
Kunal Icon Road,kunal-icon-road,pimple-saudagar,18.5992,73.7955,3,true,Prime food and lifestyle boulevard with top retail hubs.
Shivar Chowk,shivar-chowk,pimple-saudagar,18.5998,73.7925,4,true,Popular market square with restaurants banks and shopping complexes.
Govind Garden Area,govind-garden-area,pimple-saudagar,18.5971,73.8012,5,false,Residential neighborhood with family restaurants and parks.`,
  },
};

/** Split CSV lines with support for quoted commas and escaped quotes */
function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export function CsvImporter() {
  const [activeType, setActiveType] = useState<ImportType>("listings");
  const [csvContent, setCsvContent] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showRawEditor, setShowRawEditor] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Parsed states
  const [parsedListings, setParsedListings] = useState<ImportListingInput[]>([]);
  const [parsedCategories, setParsedCategories] = useState<ImportCategoryInput[]>([]);
  const [parsedLocations, setParsedLocations] = useState<ImportLocationInput[]>([]);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    importedCount?: number;
    failedCount?: number;
    errors?: string[];
  } | null>(null);

  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse handler
  const handleParseContent = (content: string, type: ImportType = activeType) => {
    setCsvContent(content);
    setImportStatus(null);

    const lines = content.trim().split("\n");
    if (lines.length < 2) {
      setParsedListings([]);
      setParsedCategories([]);
      setParsedLocations([]);
      setValidationErrors(["CSV content must contain at least a header row and one valid data record."]);
      return;
    }

    const headers = parseCsvLine(lines[0] || "").map((h) => h.toLowerCase().replace(/[\s_-]+/g, ""));

    if (type === "listings") {
      const required = ["title", "address"];
      const missing = required.filter((req) => !headers.includes(req));
      if (missing.length > 0) {
        setValidationErrors([`Missing required headers for Listings: ${missing.join(", ")}`]);
        setParsedListings([]);
        return;
      }

      const rows: ImportListingInput[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;
        const vals = parseCsvLine(line);
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = vals[idx] || "";
        });

        if (!obj.title) {
          errors.push(`Row ${i + 1}: Title is missing.`);
        } else if (!obj.address) {
          errors.push(`Row ${i + 1}: Address is missing.`);
        } else {
          rows.push({
            title: obj.title,
            categorySlug: obj.categoryslug || obj.category || "",
            locationSlug: obj.locationslug || obj.location || "",
            phone: obj.phone || undefined,
            whatsapp: obj.whatsapp || undefined,
            email: obj.email || undefined,
            website: obj.website || undefined,
            address: obj.address,
            locality: obj.locality || "Pimple Saudagar",
            landmark: obj.landmark || undefined,
            description: obj.description || undefined,
            openingHours: obj.openinghours || obj.hours || undefined,
            priceRange: obj.pricerange ? Number(obj.pricerange) : undefined,
          });
        }
      }

      setParsedListings(rows);
      setValidationErrors(errors);
    } else if (type === "categories") {
      if (!headers.includes("name")) {
        setValidationErrors(["Missing required header for Categories: name"]);
        setParsedCategories([]);
        return;
      }

      const rows: ImportCategoryInput[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;
        const vals = parseCsvLine(line);
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = vals[idx] || "";
        });

        if (!obj.name) {
          errors.push(`Row ${i + 1}: Category name is missing.`);
        } else {
          rows.push({
            name: obj.name,
            slug: obj.slug || undefined,
            parentSlug: obj.parentslug || obj.parent || undefined,
            description: obj.description || undefined,
            icon: obj.icon || undefined,
            sortOrder: obj.sortorder ? Number(obj.sortorder) : 0,
            featuredOnHome: obj.featuredonhome === "true" || obj.featured === "true",
            seoTitle: obj.seotitle || undefined,
            seoDescription: obj.seodescription || undefined,
          });
        }
      }

      setParsedCategories(rows);
      setValidationErrors(errors);
    } else if (type === "locations") {
      if (!headers.includes("name")) {
        setValidationErrors(["Missing required header for Locations: name"]);
        setParsedLocations([]);
        return;
      }

      const rows: ImportLocationInput[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;
        const vals = parseCsvLine(line);
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = vals[idx] || "";
        });

        if (!obj.name) {
          errors.push(`Row ${i + 1}: Location name is missing.`);
        } else {
          rows.push({
            name: obj.name,
            slug: obj.slug || undefined,
            parentSlug: obj.parentslug || obj.parent || undefined,
            description: obj.description || undefined,
            latitude: obj.latitude || obj.lat || undefined,
            longitude: obj.longitude || obj.lng || undefined,
            sortOrder: obj.sortorder ? Number(obj.sortorder) : 0,
            featured: obj.featured === "true",
            seoTitle: obj.seotitle || undefined,
            seoDescription: obj.seodescription || undefined,
          });
        }
      }

      setParsedLocations(rows);
      setValidationErrors(errors);
    }
  };

  // Switch entity type
  const handleTypeChange = (newType: ImportType) => {
    setActiveType(newType);
    setCsvContent("");
    setUploadedFileName(null);
    setValidationErrors([]);
    setImportStatus(null);
    setParsedListings([]);
    setParsedCategories([]);
    setParsedLocations([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // File drop / upload
  const processUploadedFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setValidationErrors(["Please select a valid .csv file."]);
      return;
    }
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleParseContent(text, activeType);
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  // Sample CSV loader
  const handleLoadSample = () => {
    const sample = SAMPLES[activeType].sample;
    setUploadedFileName(SAMPLES[activeType].filename);
    handleParseContent(sample, activeType);
  };

  // Download template
  const handleDownloadTemplate = () => {
    const sampleData = SAMPLES[activeType];
    const blob = new Blob([sampleData.sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", sampleData.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset
  const handleReset = () => {
    setCsvContent("");
    setUploadedFileName(null);
    setParsedListings([]);
    setParsedCategories([]);
    setParsedLocations([]);
    setValidationErrors([]);
    setImportStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Execute Batch Import
  const handleExecuteImport = () => {
    startTransition(async () => {
      if (activeType === "listings") {
        if (parsedListings.length === 0) return;
        const res = await importListingsAction(parsedListings);
        setImportStatus(res);
      } else if (activeType === "categories") {
        if (parsedCategories.length === 0) return;
        const res = await importCategoriesAction(parsedCategories);
        setImportStatus(res);
      } else if (activeType === "locations") {
        if (parsedLocations.length === 0) return;
        const res = await importLocationsAction(parsedLocations);
        setImportStatus(res);
      }
    });
  };

  const currentCount =
    activeType === "listings"
      ? parsedListings.length
      : activeType === "categories"
      ? parsedCategories.length
      : parsedLocations.length;

  return (
    <div className="space-y-6">
      {/* Entity Selector (design-ux Krug consistency) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => handleTypeChange("listings")}
          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
            activeType === "listings"
              ? "bg-primary/10 border-primary shadow-xs ring-2 ring-primary/20"
              : "bg-card border-border/70 hover:border-border hover:bg-muted/40"
          }`}
        >
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              activeType === "listings" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            <Store className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
              <span>Business Listings</span>
              {activeType === "listings" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bulk seed storefronts with hours, contacts, categories &amp; addresses
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange("categories")}
          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
            activeType === "categories"
              ? "bg-primary/10 border-primary shadow-xs ring-2 ring-primary/20"
              : "bg-card border-border/70 hover:border-border hover:bg-muted/40"
          }`}
        >
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              activeType === "categories" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
              <span>Categories Taxonomy</span>
              {activeType === "categories" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Import parent &amp; child category hierarchies, Lucide icons &amp; SEO tags
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange("locations")}
          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
            activeType === "locations"
              ? "bg-primary/10 border-primary shadow-xs ring-2 ring-primary/20"
              : "bg-card border-border/70 hover:border-border hover:bg-muted/40"
          }`}
        >
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              activeType === "locations" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
              <span>Locations &amp; Hubs</span>
              {activeType === "locations" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Import locality hubs, GPS coordinates &amp; neighborhood landmarks
            </p>
          </div>
        </button>
      </div>

      {/* Upload Zone Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground capitalize">
              Import {activeType} CSV
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeType === "listings" &&
                "Headers: title*, address*, categorySlug, locationSlug, phone, whatsapp, email, website, openingHours, priceRange, description"}
              {activeType === "categories" &&
                "Headers: name*, slug, parentSlug, icon, sortOrder, featuredOnHome, description"}
              {activeType === "locations" &&
                "Headers: name*, slug, parentSlug, latitude, longitude, sortOrder, featured, description"}
            </p>
          </div>

          {/* Quick Action Helpers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/50 transition shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Load Sample CSV</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/50 transition shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>Download Template</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRawEditor(!showRawEditor)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition shadow-2xs ${
                showRawEditor
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{showRawEditor ? "Hide Raw CSV" : "Paste Raw CSV"}</span>
            </button>

            {csvContent && (
              <button
                type="button"
                onClick={handleReset}
                title="Clear current data"
                className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-background p-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragOver
              ? "border-primary bg-primary/10 scale-[0.99]"
              : uploadedFileName
              ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
              : "border-border/80 bg-muted/20 hover:border-primary/60 hover:bg-muted/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processUploadedFile(file);
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              className={`p-3 rounded-full ${
                uploadedFileName ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"
              }`}
            >
              {uploadedFileName ? <FileSpreadsheet className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
            </div>

            {uploadedFileName ? (
              <div>
                <p className="text-sm font-bold text-foreground">{uploadedFileName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click or drag another file to replace
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-foreground">
                  Click to select CSV file or drag and drop here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports UTF-8 formatted CSV spreadsheets up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Raw CSV Text Area (Progressive Disclosure) */}
        {showRawEditor && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-primary" />
                <span>Raw CSV Text Editor</span>
              </label>
              <span className="text-[10px] text-muted-foreground">
                Edits immediately re-parse into the preview table below
              </span>
            </div>
            <textarea
              value={csvContent}
              onChange={(e) => handleParseContent(e.target.value)}
              placeholder="Paste raw comma-separated values with headers here..."
              rows={7}
              className="w-full rounded-xl border border-border bg-background p-3.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </div>

      {/* Validation Warnings Alert */}
      {validationErrors.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Validation Checks ({validationErrors.length})</span>
          </div>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Import Execution Result Alert */}
      {importStatus && (
        <div
          className={`rounded-2xl border p-5 text-xs shadow-xs ${
            importStatus.success
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {importStatus.success ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {importStatus.success
                    ? `✓ Successfully imported ${importStatus.importedCount} ${activeType}!`
                    : "Import Batch Encountered Issues"}
                </h4>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Records have been synced and published to the live directory.
                </p>
              </div>
            </div>

            {/* Direct navigation CTA */}
            {importStatus.success && (
              <Link
                href={
                  activeType === "listings"
                    ? "/admin/listings"
                    : activeType === "categories"
                    ? "/admin/categories"
                    : "/admin/locations"
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition"
              >
                <span>View in {activeType}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {importStatus.failedCount && importStatus.failedCount > 0 ? (
            <div className="mt-3 pt-3 border-t border-emerald-500/20">
              <p className="font-semibold text-amber-700 dark:text-amber-400">
                {importStatus.failedCount} rows failed:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-amber-700 dark:text-amber-400">
                {importStatus.errors?.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {/* Interactive Data Preview Table */}
      {currentCount > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Verified Records Ready ({currentCount} {activeType})
              </h3>
            </div>

            <button
              onClick={handleExecuteImport}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing Records...</span>
                </>
              ) : (
                <span>Confirm &amp; Import {currentCount} Records</span>
              )}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="overflow-x-auto">
              {/* Listings Table Preview */}
              {activeType === "listings" && (
                <table className="w-full text-left text-xs text-foreground">
                  <thead className="border-b border-border/70 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Business Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Locality / Address</th>
                      <th className="px-4 py-3">Opening Hours</th>
                      <th className="px-4 py-3">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {parsedListings.map((row, idx) => {
                      const briefHours = formatScheduleBrief(
                        parseOpeningHoursInput(row.openingHours)
                      );

                      return (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-bold text-foreground">
                            {row.title}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              {row.categorySlug || "Uncategorized"}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">
                            <span className="font-medium text-foreground">{row.locality}: </span>
                            {row.address}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                              <Clock className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate max-w-[140px]">{briefHours}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">
                            {row.phone || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Categories Table Preview */}
              {activeType === "categories" && (
                <table className="w-full text-left text-xs text-foreground">
                  <thead className="border-b border-border/70 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Category Name</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">Parent Category</th>
                      <th className="px-4 py-3">Icon Key</th>
                      <th className="px-4 py-3">Homepage Spotlight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {parsedCategories.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                          {row.slug || "auto"}
                        </td>
                        <td className="px-4 py-3">
                          {row.parentSlug ? (
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">
                              {row.parentSlug}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">Top-Level</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-primary">
                          {row.icon || "Folder"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              row.featuredOnHome
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {row.featuredOnHome ? "Featured" : "Standard"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Locations Table Preview */}
              {activeType === "locations" && (
                <table className="w-full text-left text-xs text-foreground">
                  <thead className="border-b border-border/70 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Locality Name</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">GPS Coordinates (Lat, Lng)</th>
                      <th className="px-4 py-3">Parent Hub</th>
                      <th className="px-4 py-3">Spotlight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {parsedLocations.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                          {row.slug || "auto"}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          {row.latitude && row.longitude ? (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              {row.latitude}, {row.longitude}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Default Central</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.parentSlug ? (
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">
                              {row.parentSlug}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">Central Hub</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              row.featured
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {row.featured ? "Featured" : "Standard"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
