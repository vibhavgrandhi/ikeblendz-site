"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  is_active: boolean;
}

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/gallery");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/gallery", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Upload failed");
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    load();
  };

  const toggleActive = async (item: GalleryItem) => {
    await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
    });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full py-8 mb-6 border-2 border-dashed border-white/15 text-brand-muted hover:border-brand-gold/40 hover:text-brand-gold transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        <span className="text-sm">{uploading ? "Uploading..." : "Tap to add photos from your device"}</span>
      </button>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {items.length === 0 ? (
        <p className="text-brand-muted py-8 text-center text-sm">No photos yet. Add some above.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="relative aspect-square group">
              <Image
                src={item.image_url}
                alt={item.caption || "Gallery photo"}
                fill
                className={`object-cover ${!item.is_active ? "opacity-30" : ""}`}
                sizes="25vw"
              />
              <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/60 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => toggleActive(item)} className="px-2 py-1 text-[10px] uppercase bg-brand-gray text-white hover:bg-brand-gold hover:text-brand-black transition-colors">
                  {item.is_active ? "Hide" : "Show"}
                </button>
                <button onClick={() => remove(item.id)} className="px-2 py-1 text-[10px] uppercase bg-red-500/70 text-white hover:bg-red-500 transition-colors">
                  Delete
                </button>
              </div>
              {!item.is_active && (
                <span className="absolute top-1 left-1 text-[9px] uppercase bg-brand-black/80 text-red-400 px-1.5 py-0.5">Hidden</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
