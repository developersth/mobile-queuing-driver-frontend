"use client";

import { useEffect, useState } from "react";
import { LocationBanner } from "@/components/layout/GradientBackground";
import { MobileShipmentCard } from "@/components/shipment/MobileShipmentCard";
import { useAuth } from "@/lib/auth-context";
import { mobileApi, type MobileShipmentDto } from "@/lib/api";
import type { CompanyCode } from "@/lib/types";

const companyMap: Record<string, CompanyCode> = {
  TOP: "TOP", PTG: "PTG", PTT: "OR", PTTOR: "OR", OR: "OR",
  SH: "Shell", SHELL: "Shell", SFL: "SFL",
};
const resolveCompany = (id: string): CompanyCode => companyMap[id?.toUpperCase()] ?? "TOP";

const POLL_INTERVAL = 30_000;

export default function RecentTasksPage() {
  const { session } = useAuth();
  const [shipments, setShipments] = useState<MobileShipmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.driverId) { setLoading(false); return; }
    const selectedCompany = (sessionStorage.getItem("selectedCompany") ?? "") as CompanyCode;

    const fetchShipments = () =>
      mobileApi.getShipments(session.driverId)
        .then((res) => {
          if (res.data) setShipments(res.data.filter((s) =>
            s.status !== null && s.status >= 13 && s.status !== 81 &&
            (!selectedCompany || resolveCompany(s.customerGroupId) === selectedCompany)
          ));
          setError("");
        })
        .catch((err) => setError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลได้"))
        .finally(() => setLoading(false));

    fetchShipments();
    const id = setInterval(fetchShipments, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [session?.driverId]);

  return (
    <>
      <LocationBanner />
      <section className="px-4 pb-4">
        <h2 className="mb-3 text-base font-bold text-top-blue">งานที่กำลังทำ</h2>
        {loading && <p className="text-center text-sm text-top-muted py-8">กำลังโหลด...</p>}
        {error && <p className="text-center text-sm text-red-500 py-4">{error}</p>}
        {!loading && !error && shipments.length === 0 && (
          <p className="text-center text-sm text-top-muted py-8">ไม่มีงานที่กำลังทำ</p>
        )}
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <MobileShipmentCard
              key={shipment.shipmentNo}
              shipment={shipment}
              href={`/shipment/${shipment.shipmentNo}`}
              showCountdown={shipment.status !== null && shipment.status < 20}
            />
          ))}
        </div>
      </section>
    </>
  );
}
