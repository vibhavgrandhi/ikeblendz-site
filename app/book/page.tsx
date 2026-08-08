import BookingFlow from "@/components/booking/BookingFlow";
import { getActiveServices } from "@/lib/data";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const services = await getActiveServices();
  const { service } = await searchParams;

  return <BookingFlow services={services} preselected={service || ""} />;
}
