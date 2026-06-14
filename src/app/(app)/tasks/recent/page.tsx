import { LocationBanner } from "@/components/layout/GradientBackground";
import { ShipmentCard } from "@/components/shipment/ShipmentCard";
import { mockRecentShipments } from "@/lib/mock-data";

export default function RecentTasksPage() {
  return (
    <>
      <LocationBanner />
      <section className="px-4 pb-4">
        <h2 className="mb-3 text-base font-bold text-top-blue">
          รายการ Shipment
        </h2>
        <div className="space-y-3">
          {mockRecentShipments.map((shipment) => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              href={`/shipment/${shipment.id}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
