export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  service_id: string;
  customer_name: string;
  customer_phone: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes: string | null;
  created_at: string;
  service?: Service;
}

export interface BusinessHours {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
  full_day: boolean;
}

export interface BlockedTimeRange {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  body: string;
  service_id: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  service?: Service;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}
