import VideoHero from "@/components/hero/VideoHero";
import FeaturedServices from "@/components/sections/FeaturedServices";
import About from "@/components/sections/About";
import GalleryPreview from "@/components/sections/GalleryPreview";
import ReviewsPreview from "@/components/sections/ReviewsPreview";
import BookingCTA from "@/components/sections/BookingCTA";
import Location from "@/components/sections/Location";

export default function Home() {
  return (
    <>
      <VideoHero />
      <FeaturedServices />
      <About />
      <GalleryPreview />
      <ReviewsPreview />
      <BookingCTA />
      <Location />
    </>
  );
}
