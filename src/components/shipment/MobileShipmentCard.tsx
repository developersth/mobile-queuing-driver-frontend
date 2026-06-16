import Link from "next/link";
import { Calendar, MapPin, CreditCard, Building2 } from "lucide-react";
import { CompanyLogo } from "@/components/branding/CompanyLogo";
import { ShipmentCountdown } from "@/components/shipment/ShipmentCountdown";
import type { MobileShipmentDto } from "@/lib/api";
import type { CompanyCode } from "@/lib/types";

// LOAD_STATUS number → color class
function statusStyle(status: number | null): string {
  if (status === null) return "bg-gray-100 text-gray-500 border-gray-200";
  if (status >= 10 && status <= 18) return "bg-amber-100 text-amber-700 border-amber-200";   // รอยืนยัน
  if (status >= 20 && status <= 29) return "bg-sky-100 text-sky-700 border-sky-200";          // รอเข้าพื้นที่
  if (status >= 30 && status <= 33) return "bg-indigo-100 text-indigo-700 border-indigo-200"; // ผ่าน Gate in / Drain
  if (status >= 51 && status <= 55) return "bg-violet-100 text-violet-700 border-violet-200"; // กำลังเติม
  if (status === 56)                return "bg-red-100 text-red-600 border-red-200";           // TAS ยกเลิก
  if (status >= 61 && status <= 62) return "bg-teal-100 text-teal-700 border-teal-200";       // Seal house
  if (status >= 71 && status <= 72) return "bg-blue-100 text-blue-700 border-blue-200";       // Weight
  if (status === 81)                return "bg-green-100 text-green-700 border-green-200";     // Gate out ✅
  if (status === 82)                return "bg-orange-100 text-orange-600 border-orange-200";  // หมดเวลา Gate out
  return "bg-gray-100 text-gray-500 border-gray-200";
}

function statusIcon(status: number | null): string {
  if (status === null) return "📋";
  if (status >= 10 && status <= 18) return "⏳";
  if (status >= 20 && status <= 29) return "🚦";
  if (status >= 30 && status <= 33) return "🚪";
  if (status >= 51 && status <= 55) return "⛽";
  if (status === 56)                return "❌";
  if (status >= 61 && status <= 62) return "🔒";
  if (status >= 71 && status <= 72) return "⚖️";
  if (status === 81)                return "✅";
  if (status === 82)                return "⏰";
  return "📋";
}

function resolveCompanyCode(customerGroupId: string): CompanyCode {
  const map: Record<string, CompanyCode> = {
    TOP: "TOP", PTG: "PTG", PTT: "OR", PTTOR: "OR", OR: "OR",
    SH: "Shell", SHELL: "Shell", SFL: "SFL",
  };
  return map[customerGroupId?.toUpperCase()] ?? "TOP";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface Props {
  shipment: MobileShipmentDto;
  href?: string;
  showCountdown?: boolean;
}

export function MobileShipmentCard({ shipment, href, showCountdown }: Props) {
  const company = resolveCompanyCode(shipment.customerGroupId);
  const badgeColor = statusStyle(shipment.status);
  const badgeIcon  = statusIcon(shipment.status);
  const statusLabel = shipment.statusName || "-";

  const content = (
    <div className="rounded-2xl bg-white p-4 card-shadow">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <CompanyLogo company={company} size="sm" />
          <span className="text-sm font-bold text-top-pink">{shipment.shipmentNo}</span>
        </div>
        <span className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${badgeColor}`}>
          {badgeIcon} {statusLabel}
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="shrink-0 text-top-primary" />
          <span className="text-top-muted">Shipment Date</span>
          <span className="font-bold text-top-blue">{formatDate(shipment.shipmentDate)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="shrink-0 text-top-primary" />
          <span className="text-top-muted">ปลายทาง</span>
          <span className="font-bold text-top-blue">{shipment.destName || "-"}</span>
        </div>

        {shipment.licensePlates.length > 0 && (
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
        )}

        {shipment.carrierName && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 size={16} className="shrink-0 text-top-primary" />
            <span className="text-top-muted">ผู้ขนส่ง</span>
            <span className="font-semibold text-top-blue">{shipment.carrierName}</span>
          </div>
        )}
      </div>

      {showCountdown && <ShipmentCountdown shipment={shipment} />}
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
