import { LocationBanner } from "@/components/layout/GradientBackground";
import { ShipmentCard } from "@/components/shipment/ShipmentCard";
import { mockHistoryShipments } from "@/lib/mock-data";

export default function HistoryTasksPage() {
  return (
    <>
      <LocationBanner />
      <section className="px-4 pb-4">
        <h2 className="mb-3 text-base font-bold text-top-blue">
          รายการ Shipment
        </h2>
        <div className="space-y-3">
          {mockHistoryShipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      </section>
    </>
  );
}
