import { supabase } from "./supabase";
import type { Service, GalleryItem, Review } from "@/types";

export async function getActiveServices(): Promise<Service[]> {
  const { data } = await supabase.from("services").select("*").eq("is_active", true).order("sort_order");
  return data || [];
}

export async function getActiveGallery(): Promise<GalleryItem[]> {
  const { data } = await supabase.from("gallery_items").select("*").eq("is_active", true).order("sort_order");
  return data || [];
}

export async function getApprovedReviews(): Promise<Review[]> {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return data || [];
}

export function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
