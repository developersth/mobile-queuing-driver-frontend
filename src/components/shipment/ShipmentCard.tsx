import Link from "next/link";
import type { Shipment } from "@/lib/types";
import { Calendar, MapPin, CreditCard } from "lucide-react";
import { CompanyLogo } from "@/components/branding/CompanyLogo";
import { StatusBadge } from "./StatusBadge";

interface ShipmentCardProps {
  shipment: Shipment;
  href?: string;
}

export function ShipmentCard({ shipment, href }: ShipmentCardProps) {
  const content = (
    <div className="rounded-2xl bg-white p-4 card-shadow">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <CompanyLogo company={shipment.company} size="sm" />
          <span className="text-sm font-bold text-top-pink">{shipment.id}</span>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="shrink-0 text-top-primary" />
          <span className="text-top-muted">Shipment Date</span>
          <span className="font-bold text-top-blue">{shipment.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="shrink-0 text-top-primary" />
          <span className="text-top-muted">ปลายทาง</span>
          <span className="font-bold text-top-blue">{shipment.destination}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <CreditCard size={16} className="mt-0.5 shrink-0 text-top-primary" />
          <span className="text-top-muted">ทะเบียนรถ</span>
          <div className="flex flex-wrap gap-1.5">
            {shipment.licensePlates.map((plate) => (
              <span
                key={plate}
                className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-top-blue"
              >
                {plate}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
