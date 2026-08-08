-- ============================================
-- IkeBlendz Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Services
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Business hours (0=Sunday, 6=Saturday)
CREATE TABLE business_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (day_of_week)
);

-- Blocked dates (holidays, days off)
CREATE TABLE blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  reason TEXT,
  full_day BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (date)
);

-- Blocked time ranges within a specific date
CREATE TABLE blocked_time_ranges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT
);

-- Appointments (no email — name + optional phone only)
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES services(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  start_at TIMESTAMP GENERATED ALWAYS AS (date + start_time) STORED,
  end_at TIMESTAMP GENERATED ALWAYS AS (date + end_time) STORED,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_date_time ON appointments(date, start_time, end_time)
  WHERE status IN ('pending', 'confirmed');

-- Database-level guarantee: no two pending/confirmed appointments can overlap in time.
-- This is the real backstop — the app also checks before inserting, but this is what
-- makes double-booking impossible even under concurrent requests.
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE appointments ADD CONSTRAINT no_overlapping_appointments
  EXCLUDE USING gist (tsrange(start_at, end_at) WITH &&)
  WHERE (status IN ('pending', 'confirmed'));

-- Reviews (auto-published — admin can only remove, not approve)
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL DEFAULT '',
  service_id UUID REFERENCES services(id),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gallery
CREATE TABLE gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site settings (key-value)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- ============================================
-- Storage bucket for admin-uploaded gallery photos
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view gallery bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read for active services
CREATE POLICY "Public can read active services" ON services
  FOR SELECT USING (is_active = true);

-- Public read business hours
CREATE POLICY "Public can read business hours" ON business_hours
  FOR SELECT USING (true);

-- Public read blocked dates
CREATE POLICY "Public can read blocked dates" ON blocked_dates
  FOR SELECT USING (true);

-- Public read blocked time ranges
CREATE POLICY "Public can read blocked ranges" ON blocked_time_ranges
  FOR SELECT USING (true);

-- Public read approved reviews
CREATE POLICY "Public can read approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

-- Public read active gallery items
CREATE POLICY "Public can read active gallery" ON gallery_items
  FOR SELECT USING (is_active = true);

-- Public read site settings
CREATE POLICY "Public can read settings" ON site_settings
  FOR SELECT USING (true);

-- NOTE: appointments has RLS enabled with NO policies at all — the public can't
-- read or write it directly. All appointment creation/reads go through Next.js
-- API routes using the service-role key (server-only), which validates everything
-- before touching the table. Same for review/gallery/service writes from admin.

-- ============================================
-- Seed Data
-- ============================================

-- Business hours
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
  (0, '09:00', '19:00', false),  -- Sunday
  (1, '16:00', '19:00', false),  -- Monday
  (2, '16:00', '19:00', false),  -- Tuesday
  (3, '16:00', '19:00', false),  -- Wednesday
  (4, '16:00', '19:00', false),  -- Thursday
  (5, '16:00', '19:00', false),  -- Friday
  (6, '09:00', '19:00', false);  -- Saturday

-- Real services
INSERT INTO services (name, description, price, duration_minutes, sort_order) VALUES
  ('Design & Haircut', 'Custom design work paired with a precision haircut', 15, 40, 1),
  ('Beard/Mustache & Haircut', 'Full haircut with beard and mustache shaping', 20, 30, 2),
  ('Beard', 'Beard shaping and lineup', 10, 10, 3);

-- Gallery — existing portfolio photos
INSERT INTO gallery_items (image_url, caption, sort_order) VALUES
  ('/images/gallery/761113087_967771969616032_8933778599770807281_n.jpg', 'Precision fade haircut', 1),
  ('/images/gallery/761291236_1797750121594943_7955193959117149068_n.jpg', 'Clean taper cut', 2),
  ('/images/gallery/761764457_888228683971706_8891978372442432804_n.jpg', 'Expert barber work', 3),
  ('/images/gallery/765068918_993193780417226_4988683669136937295_n.jpg', 'Fresh lineup', 4),
  ('/images/gallery/767755473_1535278967708008_3452721022105309924_n.jpg', 'Skin fade detail', 5),
  ('/images/gallery/768246432_1068270956153453_8000216306188599650_n.jpg', 'Beard and cut styling', 6);

-- Site settings
INSERT INTO site_settings (key, value) VALUES
  ('phone', '(510) 695-0297'),
  ('instagram', 'https://www.instagram.com/ike.blendz_/'),
  ('address', '4557 Lodovico Ct, Fremont, CA');
