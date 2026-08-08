import type { Metadata } from "next";
import { Playfair_Display, Inter, Great_Vibes } from "next/font/google";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const script = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IkeBlendz — Premium Barber in Fremont, CA",
    template: "%s | IkeBlendz",
  },
  description: "Premium barbering in Fremont, CA. Precision cuts, clean fades, and expert grooming. Book your appointment with IkeBlendz today.",
  keywords: ["IkeBlendz", "barber", "Fremont", "haircut", "fade", "barbershop", "Fremont CA", "barber Fremont"],
  openGraph: {
    title: "IkeBlendz — Premium Barber in Fremont, CA",
    description: "Precision cuts, clean fades, and expert grooming. Book your appointment today.",
    type: "website",
    locale: "en_US",
    siteName: "IkeBlendz",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${script.variable}`}>
      <body className="font-body bg-brand-black text-brand-light antialiased">
        <Nav />
        <main className="min-h-screen pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileTabBar />
      </body>
    </html>
  );
}
