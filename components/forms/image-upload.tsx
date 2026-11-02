"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, Star } from "lucide-react";

export interface UploadedImage {
  url: string;
  name?: string;
  mediaId?: string;
}

interface ImageUploadProps {
  initialImages?: UploadedImage[];
  name?: string;
  maxPhotos?: number;
  label?: string;
  description?: string;
  onChange?: (images: UploadedImage[]) => void;
  onSetOgImage?: (url: string) => void;
}

export function ImageUpload({
  initialImages = [],
  name = "imageUrls",
  maxPhotos = 10,
  label = "Business Photos & Showcase",
  description = "Upload storefront, interior, product, or team photos. The first image will be your main cover photo.",
  onChange,
  onSetOgImage,
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlField, setShowUrlField] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateImages = (newImages: UploadedImage[]) => {
    setImages(newImages);
    if (onChange) onChange(newImages);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const availableSlots = maxPhotos - images.length;
    if (availableSlots <= 0) {
      setError(`Maximum photo limit of ${maxPhotos} reached.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    setUploading(true);

    try {
      const uploaded: UploadedImage[] = [];

      for (const file of filesToUpload) {
        if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
          setError(`"${file.name}" is not a supported format (JPG, PNG, WebP only).`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError(`"${file.name}" exceeds the 5MB size limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        let uploadedUrl = "";
        let uploadedMediaId: string | undefined = undefined;

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            uploadedUrl = data.url;
            uploadedMediaId = data.mediaId;
          }
        } catch (fetchErr) {
          console.warn("Server upload attempt failed, falling back to local file reader:", fetchErr);
        }

        // Guaranteed fallback: If server upload returned error or failed, read directly as Data URI
        if (!uploadedUrl) {
          uploadedUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        uploaded.push({
          url: uploadedUrl,
          name: file.name,
          mediaId: uploadedMediaId,
        });
      }

      if (uploaded.length > 0) {
        const nextImages = [...images, ...uploaded];
        updateImages(nextImages);
        if (onSetOgImage && !images[0] && nextImages[0]) {
          onSetOgImage(nextImages[0].url);
        }
      }
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/") && !trimmed.startsWith("data:")) {
      setError("Please enter a valid HTTP/HTTPS image URL.");
      return;
    }

    if (images.length >= maxPhotos) {
      setError(`Maximum photo limit of ${maxPhotos} reached.`);
      return;
    }

    const nextImages = [...images, { url: trimmed, name: "Remote Photo" }];
    updateImages(nextImages);
    if (onSetOgImage && !images[0] && nextImages[0]) {
      onSetOgImage(nextImages[0].url);
    }
    setUrlInput("");
    setShowUrlField(false);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    updateImages(updated);
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    if (!target) return;
    const remaining = images.filter((_, i) => i !== index);
    const reordered = [target, ...remaining];
    updateImages(reordered);
    if (onSetOgImage && target.url) {
      onSetOgImage(target.url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden inputs to pass data via standard server actions */}
      {images.map((img, i) => (
        <input key={i} type="hidden" name={name} value={img.url} />
      ))}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span>{label}</span>
            <span className="text-muted-foreground font-normal">
              ({images.length}/{maxPhotos})
            </span>
          </label>
          <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="text-xs font-semibold text-primary hover:underline self-start sm:self-auto flex items-center gap-1"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          <span>{showUrlField ? "Hide URL Input" : "Add via Image URL"}</span>
        </button>
      </div>

      {/* URL Input Bar */}
      {showUrlField && (
        <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl border border-border animate-in fade-in">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/photo-... or /uploads/..."
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition"
          >
            Add Image
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
          uploading
            ? "bg-muted/50 border-primary/40 cursor-wait"
            : "hover:bg-muted/30 border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          disabled={uploading || images.length >= maxPhotos}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-foreground">Processing images...</p>
              <p className="text-[11px] text-muted-foreground">Uploading and optimizing</p>
            </>
          ) : (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Click to select photos or drag &amp; drop files here
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Supports JPG, PNG, WebP up to 5MB each (up to {maxPhotos} photos)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}

      {/* Photo Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`group relative aspect-video sm:aspect-square rounded-xl overflow-hidden border bg-muted/40 shadow-sm ${
                idx === 0 ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
            >
              <Image
                src={img.url}
                alt={img.name || `Photo ${idx + 1}`}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />

              {/* Cover badge for primary photo */}
              {idx === 0 && (
                <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1 z-10">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  <span>Main Cover</span>
                </div>
              )}

              {/* Action Buttons overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 z-20">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleMakeCover(idx)}
                    title="Set as Main Cover Photo"
                    className="px-2 py-1 rounded bg-white text-slate-900 hover:bg-primary hover:text-white text-[11px] font-semibold shadow transition"
                  >
                    Set as Cover
                  </button>
                )}

                {onSetOgImage && (
                  <button
                    type="button"
                    onClick={() => onSetOgImage(img.url)}
                    title="Use this photo for Social / OpenGraph preview"
                    className="px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-semibold shadow transition"
                  >
                    Use as OG Banner
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  title="Remove Photo"
                  className="p-1 rounded bg-red-600 text-white hover:bg-red-700 shadow transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
