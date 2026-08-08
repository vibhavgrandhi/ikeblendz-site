export const SITE = {
  name: "IkeBlendz",
  tagline: "Fremont's Premier Barber",
  description: "Premium barbering in Fremont, CA. Precision cuts, clean fades, and expert grooming by IkeBlendz.",
  address: "4557 Lodovico Ct",
  city: "Fremont",
  state: "CA",
  zip: "94555",
  phone: "(510) 695-0297",
  phoneRaw: "+15106950297",
  instagram: "https://www.instagram.com/ike.blendz_/",
  instagramHandle: "@ike.blendz_",
  email: "",
  mapQuery: "4557+Lodovico+Ct+Fremont+CA",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Reviews", href: "/reviews" },
  { label: "Book", href: "/book" },
  { label: "Contact", href: "/contact" },
] as const;

export const SLOT_INTERVAL_MINUTES = 30;
