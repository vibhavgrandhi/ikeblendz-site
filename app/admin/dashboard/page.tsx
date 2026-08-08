"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppointmentsManager from "@/components/admin/AppointmentsManager";
import ServicesManager from "@/components/admin/ServicesManager";
import ReviewsManager from "@/components/admin/ReviewsManager";
import AvailabilityManager from "@/components/admin/AvailabilityManager";
import GalleryManager from "@/components/admin/GalleryManager";

type Tab = "appointments" | "services" | "gallery" | "reviews" | "availability";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("appointments");

  const api = useCallback(async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if (res.status === 401) {
      router.push("/admin/login");
      return null;
    }
    return res.json();
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "appointments", label: "Appointments" },
    { key: "services", label: "Services" },
    { key: "gallery", label: "Gallery" },
    { key: "reviews", label: "Reviews" },
    { key: "availability", label: "Availability" },
  ];

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-white">Dashboard</h1>
        <button onClick={logout} className="text-brand-muted text-sm hover:text-red-400 transition-colors">
          Sign Out
        </button>
      </div>

      <div className="flex gap-1 mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs tracking-widest uppercase whitespace-nowrap transition-colors ${
              tab === t.key ? "bg-brand-gold text-brand-black" : "bg-brand-charcoal text-brand-muted hover:text-brand-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "appointments" && <AppointmentsManager api={api} />}
      {tab === "services" && <ServicesManager api={api} />}
      {tab === "gallery" && <GalleryManager />}
      {tab === "reviews" && <ReviewsManager api={api} />}
      {tab === "availability" && <AvailabilityManager api={api} />}
    </div>
  );
}
