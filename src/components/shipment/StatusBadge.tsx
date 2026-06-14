import type { ShipmentStatus } from "@/lib/types";
import { CheckCircle, Hourglass, MinusCircle, Truck } from "lucide-react";

const statusConfig: Record<
  ShipmentStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "รอยืนยัน Shipment",
    className: "bg-top-yellow text-top-blue",
    icon: <Hourglass size={14} />,
  },
  "called-1": {
    label: "เรียกเข้าพื้นที่ ครั้งที่ 1",
    className: "bg-pink-100 text-top-pink",
    icon: <Truck size={14} />,
  },
  "called-2": {
    label: "เรียกเข้าพื้นที่ ครั้งที่ 2",
    className: "bg-pink-100 text-top-pink",
    icon: <Truck size={14} />,
  },
  confirmed: {
    label: "ยืนยัน Shipment แล้ว",
    className: "bg-green-100 text-green-700",
    icon: <CheckCircle size={14} />,
  },
  completed: {
    label: "งานเสร็จสิ้น",
    className: "bg-green-100 text-green-700",
    icon: <CheckCircle size={14} />,
  },
  "no-confirmation": {
    label: "ไม่มีการยืนยัน Shipment",
    className: "bg-red-100 text-red-600",
    icon: <MinusCircle size={14} />,
  },
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
