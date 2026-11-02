"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  Compass,
  Sparkles,
  Share2,
} from "lucide-react";
import {
  createLocationAdminAction,
  updateLocationAdminAction,
  deleteLocationAdminAction,
} from "@/actions/taxonomy";

export interface LocationItem {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  coverImage: string | null;
  sortOrder: number;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    listings: number;
    children: number;
  };
}

interface LocationManagerProps {
  initialLocations: LocationItem[];
}

const LOCALITY_PRESETS = [
  { name: "Kunal Icon Road", lat: 18.5987, lng: 73.7898 },
  { name: "Kokane Chowk", lat: 18.5992, lng: 73.7925 },
  { name: "Roseland Residency", lat: 18.6015, lng: 73.7952 },
  { name: "Planet Millennium", lat: 18.5974, lng: 73.7912 },
  { name: "Govind Garden", lat: 18.6031, lng: 73.7944 },
  { name: "Shivar Chowk", lat: 18.5965, lng: 73.7881 },
  { name: "Linear Garden", lat: 18.6002, lng: 73.7938 },
];

export function LocationManager({ initialLocations }: LocationManagerProps) {
  const [locations, setLocations] = useState<LocationItem[]>(initialLocations);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: "",
    description: "",
    latitude: "18.5987",
    longitude: "73.7898",
    coverImage: "",
    sortOrder: 0,
    featured: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Auto-slug generator
  const handleNameChange = (newName: string) => {
    setFormData((prev) => {
      const updated = { ...prev, name: newName };
      if (!slugManuallyEdited && !editingLocation) {
        updated.slug = newName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updated;
    });
  };

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormData({
      name: "",
      slug: "",
      parentId: "",
      description: "",
      latitude: "18.5987",
      longitude: "73.7898",
      coverImage: "",
      sortOrder: 0,
      featured: false,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    });
    setSlugManuallyEdited(false);
    setFormError(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEditModal = (loc: LocationItem) => {
    setEditingLocation(loc);
    setFormData({
      name: loc.name,
      slug: loc.slug,
      parentId: loc.parentId || "",
      description: loc.description || "",
      latitude: loc.latitude !== null ? loc.latitude.toString() : "",
      longitude: loc.longitude !== null ? loc.longitude.toString() : "",
      coverImage: loc.coverImage || "",
      sortOrder: loc.sortOrder,
      featured: loc.featured,
      seoTitle: loc.seoTitle || "",
      seoDescription: loc.seoDescription || "",
      seoKeywords: loc.seoKeywords || "",
    });
    setSlugManuallyEdited(true);
    setFormError(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const body = new FormData();
    body.append("name", formData.name);
    body.append("slug", formData.slug);
    body.append("parentId", formData.parentId);
    body.append("description", formData.description);
    body.append("latitude", formData.latitude);
    body.append("longitude", formData.longitude);
    body.append("coverImage", formData.coverImage);
    body.append("sortOrder", formData.sortOrder.toString());
    body.append("featured", formData.featured ? "true" : "false");
    body.append("seoTitle", formData.seoTitle);
    body.append("seoDescription", formData.seoDescription);
    body.append("seoKeywords", formData.seoKeywords);

    if (editingLocation) {
      body.append("locationId", editingLocation.id);
    }

    startTransition(async () => {
      const res = editingLocation
        ? await updateLocationAdminAction(null, body)
        : await createLocationAdminAction(null, body);

      if (res.error) {
        setFormError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        return;
      }

      if (res.success) {
        const effectiveSlug = formData.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
        const parentObj = formData.parentId
          ? locations.find((l) => l.id === formData.parentId)
          : null;

        if (editingLocation) {
          setLocations((prev) =>
            prev.map((l) =>
              l.id === editingLocation.id
                ? {
                    ...l,
                    name: formData.name,
                    slug: effectiveSlug,
                    parentId: formData.parentId || null,
                    description: formData.description || null,
                    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                    coverImage: formData.coverImage || null,
                    sortOrder: Number(formData.sortOrder),
                    featured: formData.featured,
                    seoTitle: formData.seoTitle || null,
                    seoDescription: formData.seoDescription || null,
                    seoKeywords: formData.seoKeywords || null,
                    parent: parentObj
                      ? { id: parentObj.id, name: parentObj.name, slug: parentObj.slug }
                      : null,
                  }
                : l
            )
          );
        } else if (res.recordId) {
          const newLoc: LocationItem = {
            id: res.recordId,
            name: formData.name,
            slug: effectiveSlug,
            parentId: formData.parentId || null,
            description: formData.description || null,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            coverImage: formData.coverImage || null,
            sortOrder: Number(formData.sortOrder),
            featured: formData.featured,
            seoTitle: formData.seoTitle || null,
            seoDescription: formData.seoDescription || null,
            seoKeywords: formData.seoKeywords || null,
            parent: parentObj
              ? { id: parentObj.id, name: parentObj.name, slug: parentObj.slug }
              : null,
            _count: { listings: 0, children: 0 },
          };
          setLocations((prev) => [...prev, newLoc]);
        }
        setModalOpen(false);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete location "${name}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteLocationAdminAction(id);
      setDeletingId(null);
      if (res.error) {
        alert(res.error);
      } else {
        setLocations((prev) => prev.filter((l) => l.id !== id));
      }
    });
  };

  const filteredLocations = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search locations by area name or URL slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/30 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Location &amp; URL</th>
                <th className="py-3 px-4">GPS Coordinates</th>
                <th className="py-3 px-4 text-center">Listings</th>
                <th className="py-3 px-4 text-center">Featured</th>
                <th className="py-3 px-4">SEO &amp; Metadata</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No locations found matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => {
                  const hasSeo = Boolean(loc.seoTitle && loc.seoDescription && loc.seoKeywords);
                  const partialSeo = Boolean(loc.seoTitle || loc.seoDescription || loc.seoKeywords);

                  return (
                    <tr key={loc.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                              {loc.name}
                              <Link
                                href={`/location/${loc.slug}`}
                                target="_blank"
                                className="text-muted-foreground hover:text-emerald-600 transition"
                                title="View public location directory"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              /location/{loc.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {loc.latitude && loc.longitude ? (
                          <div className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                            <Compass className="h-3 w-3 text-emerald-600" />
                            <span>{Number(loc.latitude).toFixed(4)}, {Number(loc.longitude).toFixed(4)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px] italic">Not set</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                          {loc._count.listings} listings
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {loc.featured ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                            Featured
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {hasSeo ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Full Meta & OG
                          </span>
                        ) : partialSeo ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Partial SEO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                            Default auto-tags
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(loc)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition"
                            title="Edit Location & SEO"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(loc.id, loc.name)}
                            disabled={deletingId === loc.id}
                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition disabled:opacity-50"
                            title="Delete Location"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-card border rounded-2xl shadow-2xl my-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-base text-foreground">
                  {editingLocation ? `Edit Locality: ${editingLocation.name}` : "Create New Locality"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Locality & Permanent URL
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Locality / Area Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Kokane Chowk, Kunal Icon Road"
                      className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    {fieldErrors.name && (
                      <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Permanent URL Slug <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground bg-muted px-2.5 py-2 border border-r-0 rounded-l-lg select-none">
                        /location/
                      </span>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => {
                          setSlugManuallyEdited(true);
                          setFormData({ ...formData, slug: e.target.value });
                        }}
                        placeholder="kokane-chowk"
                        className="w-full px-3 py-2 text-sm font-mono bg-background border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Permanent indexing URL. Lowercase letters, numbers, and dashes.
                    </p>
                  </div>
                </div>

                {/* GPS Coordinates & Presets */}
                <div className="space-y-2 p-3 bg-muted/30 border rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 text-emerald-600" />
                      GPS Coordinates (Latitude &amp; Longitude)
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-muted-foreground block mb-1">Latitude</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="18.5987"
                        className="w-full px-3 py-2 text-sm font-mono bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block mb-1">Longitude</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        placeholder="73.7898"
                        className="w-full px-3 py-2 text-sm font-mono bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="pt-2 border-t">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1.5">
                      Quick Locality Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {LOCALITY_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              latitude: p.lat.toString(),
                              longitude: p.lng.toString(),
                            }));
                          }}
                          className="px-2 py-0.5 rounded bg-card border hover:border-emerald-500 hover:text-emerald-600 text-[10px] font-medium transition"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Parent Location</label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="">None (Top-Level Locality)</option>
                      {locations
                        .filter((l) => !editingLocation || l.id !== editingLocation.id)
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this locality, nearby landmarks, connectivity..."
                    className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/... or /uploads/..."
                    className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="featured" className="text-xs font-semibold cursor-pointer">
                    Mark as Featured Locality (Highlighted in search and homepage)
                  </label>
                </div>
              </div>

              {/* SEO & Meta Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    2. SEO Meta Tags & Open Graph
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Permanent Search Visibility</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold">SEO Meta Title</label>
                    <span
                      className={`text-[10px] font-mono ${
                        formData.seoTitle.length > 60 ? "text-amber-600 font-bold" : "text-muted-foreground"
                      }`}
                    >
                      {formData.seoTitle.length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder={`Businesses in ${formData.name || "Locality"}, Pimple Saudagar | Directory`}
                    className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold">SEO Meta Description</label>
                    <span
                      className={`text-[10px] font-mono ${
                        formData.seoDescription.length > 160 ? "text-amber-600 font-bold" : "text-muted-foreground"
                      }`}
                    >
                      {formData.seoDescription.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder={`Explore verified businesses, shops, and clinics in ${formData.name || "Pimple Saudagar"}. Full phone numbers, maps, and directions.`}
                    className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    SEO Meta Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    placeholder="pimple saudagar shops, kokane chowk directory, kunal icon road services"
                    className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Google SERP Snippet Preview */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    <Globe className="h-3 w-3 text-emerald-500" />
                    Google Search Preview
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono truncate">
                    https://pimplesaudagar.in › location › {formData.slug || "example-location"}
                  </div>
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer truncate">
                    {formData.seoTitle ||
                      `Directory of Businesses in ${formData.name || "Locality"}, Pimple Saudagar`}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {formData.seoDescription ||
                      formData.description ||
                      `Find local services, doctors, restaurants, and shops in ${formData.name || "Pimple Saudagar"}. Complete contact details and GPS navigation.`}
                  </div>
                </div>

                {/* Social Open Graph Preview */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    <Share2 className="h-3 w-3 text-emerald-500" />
                    Social Share (Open Graph / WhatsApp / Twitter) Preview
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-card text-left max-w-sm">
                    {formData.coverImage ? (
                      <div
                        className="h-28 bg-cover bg-center border-b"
                        style={{ backgroundImage: `url(${formData.coverImage})` }}
                      />
                    ) : (
                      <div className="h-20 bg-muted/50 border-b flex items-center justify-center text-xs text-muted-foreground">
                        Default Locality Photo
                      </div>
                    )}
                    <div className="p-2.5">
                      <p className="font-bold text-xs truncate">
                        {formData.seoTitle || `${formData.name || "Locality"} — Pimple Saudagar Directory`}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {formData.seoDescription ||
                          "Browse verified businesses and points of interest in this area."}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 uppercase mt-1 block">
                        pimplesaudagar.in
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-sm transition disabled:opacity-50"
                >
                  {isPending ? "Saving..." : editingLocation ? "Update Location" : "Create Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

