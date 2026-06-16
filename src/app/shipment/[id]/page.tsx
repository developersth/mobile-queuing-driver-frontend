"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronLeft, User, CreditCard, Calendar, MapPin, Droplets, MapPinOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { CompanyLogo } from "@/components/branding/CompanyLogo";
import { LicensePlateInput } from "@/components/ui/LicensePlateInput";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { mobileApi, geofenceApi, acknowledgeApi, type MobileShipmentDto, type MobileShipmentLineDto } from "@/lib/api";
import type { CompanyCode } from "@/lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────

function resolveCompany(customerGroupId: string): CompanyCode {
  const map: Record<string, CompanyCode> = {
    TOP: "TOP", PTG: "PTG", PTT: "OR", PTTOR: "OR", OR: "OR",
    SH: "Shell", SHELL: "Shell", SFL: "SFL",
  };
  return map[customerGroupId?.toUpperCase()] ?? "TOP";
}

function formatDate(d: string | null) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function statusStyle(status: number | null) {
  if (status === null) return "bg-gray-100 text-gray-500 border-gray-200";
  if (status >= 10 && status <= 18) return "bg-amber-100 text-amber-700 border-amber-200";
  if (status >= 20 && status <= 29) return "bg-sky-100 text-sky-700 border-sky-200";
  if (status >= 30 && status <= 33) return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (status >= 51 && status <= 55) return "bg-violet-100 text-violet-700 border-violet-200";
  if (status === 56) return "bg-red-100 text-red-600 border-red-200";
  if (status >= 61 && status <= 62) return "bg-teal-100 text-teal-700 border-teal-200";
  if (status >= 71 && status <= 72) return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === 81) return "bg-green-100 text-green-700 border-green-200";
  if (status === 82) return "bg-orange-100 text-orange-600 border-orange-200";
  return "bg-gray-100 text-gray-500 border-gray-200";
}

function statusIcon(status: number | null) {
  if (status === null) return "📋";
  if (status >= 10 && status <= 18) return "⏳";
  if (status >= 20 && status <= 29) return "🚦";
  if (status >= 30 && status <= 33) return "🚪";
  if (status >= 51 && status <= 55) return "⛽";
  if (status === 56) return "❌";
  if (status >= 61 && status <= 62) return "🔒";
  if (status >= 71 && status <= 72) return "⚖️";
  if (status === 81) return "✅";
  if (status === 82) return "⏰";
  return "📋";
}

// แสดงแยกตาม compartment
function summarizeProducts(lines: MobileShipmentLineDto[]) {
  return lines.map((l) => ({
    name: l.saleProductName || l.productName || l.product,
    volume: l.compartmentVolume ?? 0,
    compartmentNo: l.compartmentNo,
  }));
}

// ── geofence strip ────────────────────────────────────────────────────────────

type GeoState = "checking" | "in-zone" | "out-zone" | "denied" | "error";

function useGeofence() {
  const [state, setState] = useState<GeoState>("checking");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) { setState("error"); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await geofenceApi.check(pos.coords.latitude, pos.coords.longitude);
          if (res.data) {
            setDistanceKm(res.data.distanceKm);
            setState(res.data.inZone ? "in-zone" : "out-zone");
          }
        } catch { setState("error"); }
      },
      (err) => setState(err.code === err.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { state, distanceKm };
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { session } = useAuth();

  const [shipment, setShipment] = useState<MobileShipmentDto | null>(null);
  const [lines, setLines] = useState<MobileShipmentLineDto[]>([]);
  const [loading, setLoading] = useState(true);

  const { state: geoState, distanceKm } = useGeofence();
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [headPlate, setHeadPlate] = useState("");
  const [trailerPlate, setTrailerPlate] = useState("");
  const [plateError, setPlateError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!session?.driverId) return;
    Promise.all([
      mobileApi.getShipments(session.driverId),
      mobileApi.getShipmentLines(id),
    ]).then(([shipmentsRes, linesRes]) => {
      const found = shipmentsRes.data?.find((s) => s.shipmentNo === id) ?? null;
      setShipment(found);
      setLines(linesRes.data ?? []);
    }).finally(() => setLoading(false));
  }, [id, session?.driverId]);

  const inZone = geoState === "in-zone";
  const products = summarizeProducts(lines);
  const company = resolveCompany(shipment?.customerGroupId ?? "");

  const handleConfirm = async () => {
    // เปรียบเทียบเฉพาะตัวเลข ตัดอักษรไทย/พิเศษออก และตัด leading zero
    const digitsOnly = (s: string) => s.replace(/\D/g, "").replace(/^0+/, "");
    const head = headPlate.replace(/\s/g, "");
    if (!head || digitsOnly(head) === "") { setPlateError("กรุณากรอกทะเบียนรถหัวลาก"); return; }

    const expected = shipment?.licensePlates ?? [];
    const entered = [head, trailerPlate.replace(/\s/g, "")].filter((p) => digitsOnly(p) !== "");
    const ok = entered.every((p) =>
      expected.some((e) => digitsOnly(e) === digitsOnly(p))
    );
    if (!ok) { setPlateError("ข้อมูลทะเบียนที่ระบุไม่ถูกต้อง"); return; }
    setPlateError("");
    setConfirming(true);
    setConfirmError("");
    try {
      const res = await acknowledgeApi.acknowledge(id, shipment?.customerGroupId ?? "", session?.driverId ?? 0);
      setShowModal(false);
      if (res.message) {
        setSuccessMessage(res.message);
      } else {
        router.push("/tasks/recent");
      }
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="mobile-shell flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-top-primary" />
      </div>
    );
  }

  return (
    <div className="mobile-shell">
      {/* header */}
      <header className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} aria-label="กลับ">
            <ChevronLeft size={24} className="text-top-blue" />
          </button>
          <h1 className="text-base font-bold text-top-blue">รายละเอียด Shipment</h1>
        </div>
        <Link href="/notifications" className="relative text-top-blue">
          <Bell size={22} />
        </Link>
      </header>

      {/* scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* card */}
        <div className="rounded-2xl bg-white p-5 card-shadow">
          {/* logo + status */}
          <div className="mb-4 flex items-start justify-between gap-2">
            <CompanyLogo company={company} size="md" />
            {shipment && (
              <span className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle(shipment.status)}`}>
                {statusIcon(shipment.status)} {shipment.statusName || shipment.shipmentStatus}
              </span>
            )}
          </div>

          {/* shipment no */}
          <p className="mb-1 text-xs text-top-muted">Shipment No.</p>
          <p className="mb-4 text-lg font-bold text-top-pink">{id}</p>

          {/* driver name */}
          {session?.fullName && (
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <User size={18} className="text-top-primary" />
              </div>
              <div>
                <p className="text-xs text-top-muted">ชื่อพนักงาน</p>
                <p className="font-bold text-top-blue">{session.fullName}</p>
              </div>
            </div>
          )}

          {/* license plates */}
          {shipment && shipment.licensePlates.length > 0 && (
            <div className="mb-3 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <CreditCard size={18} className="text-top-primary" />
              </div>
              <div>
                <p className="text-xs text-top-muted">ทะเบียนรถ</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {shipment.licensePlates.map((p) => (
                    <span key={p} className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-top-blue">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* date + destination */}
          {shipment && (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="shrink-0 text-top-primary" />
                <div>
                  <p className="text-xs text-top-muted">Shipment Date</p>
                  <p className="font-bold text-top-blue">{formatDate(shipment.shipmentDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="shrink-0 text-top-primary" />
                <div>
                  <p className="text-xs text-top-muted">ปลายทาง</p>
                  <p className="font-bold text-top-blue text-sm leading-tight">{shipment.destName || "-"}</p>
                </div>
              </div>
            </div>
          )}

          {/* product lines */}
          {products.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Droplets size={16} className="text-top-primary" />
                <p className="text-sm font-semibold text-top-blue">นำรถเข้ารับผลิตภัณฑ์</p>
              </div>
              <div className="rounded-xl bg-blue-50 px-4 py-3 space-y-2">
                {products.map((p) => (
                  <div key={p.compartmentNo} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-top-primary text-xs font-bold text-white">
                        {p.compartmentNo}
                      </span>
                      <span className="text-sm font-semibold text-top-blue">{p.name}</span>
                    </div>
                    <span className="text-sm text-top-blue">
                      {p.volume.toLocaleString("th-TH")} ลิตร
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* geofence warning (out-zone / error) */}
        {(geoState === "out-zone") && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-3">
            <MapPinOff size={20} className="shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-600">คุณไม่อยู่ในระยะรัศมีที่กำหนด</p>
              {distanceKm !== null && (
                <p className="text-xs text-red-500 mt-0.5">
                  จะถึงรัศมีที่กำหนดในอีก {distanceKm.toFixed(1)} กิโลเมตร
                </p>
              )}
            </div>
          </div>
        )}
        {(geoState === "denied" || geoState === "error") && (
          <div className="flex items-center gap-3 rounded-2xl bg-gray-100 px-4 py-3">
            <MapPinOff size={20} className="shrink-0 text-gray-500" />
            <p className="text-sm text-gray-600">ไม่สามารถตรวจสอบตำแหน่งได้</p>
          </div>
        )}
        {geoState === "checking" && (
          <div className="flex items-center gap-3 rounded-2xl bg-gray-100 px-4 py-3">
            <Loader2 size={18} className="shrink-0 animate-spin text-gray-500" />
            <p className="text-sm text-gray-600">กำลังตรวจสอบตำแหน่ง...</p>
          </div>
        )}
      </div>

      {/* bottom button — แสดงเฉพาะสถานะ 10, 11 */}
      {(shipment?.status === 10 || shipment?.status === 11) && (
        <div className="border-t bg-white p-4">
          <Button
            fullWidth
            disabled={!inZone}
            onClick={() => {
              setHeadPlate("");
              setTrailerPlate("");
              setPlateError("");
              setShowModal(true);
            }}
          >
            ตอบรับ Shipment
          </Button>
        </div>
      )}

      {/* license plate modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="กรุณากรอกข้อมูลทะเบียนรถเพื่อยืนยันข้อมูล"
        onConfirm={handleConfirm}
      >
        <LicensePlateInput
          label="ทะเบียนรถหัวลาก"
          required
          value={headPlate}
          onChange={(v) => { setHeadPlate(v); setPlateError(""); }}
        />
        <LicensePlateInput
          label="ทะเบียนรถหางพ่วง"
          value={trailerPlate}
          onChange={(v) => { setTrailerPlate(v); setPlateError(""); }}
          error={!!plateError}
        />
        {plateError && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <span>ⓘ</span> {plateError}
          </p>
        )}
        {confirmError && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <span>ⓘ</span> {confirmError}
          </p>
        )}
        <p className="mt-3 text-xs text-top-muted">
          <span className="underline">หมายเหตุ</span> กรณีมีเลขทะเบียน 6 ตัว กรุณาระบุ 0 ที่ช่องแรก
        </p>
      </Modal>

      {/* acknowledge success modal */}
      <Modal
        open={!!successMessage}
        onClose={() => { setSuccessMessage(""); router.push("/tasks/recent"); }}
        title="แจ้งเตือน"
      >
        <p className="text-center text-sm text-top-blue">{successMessage}</p>
        <Button
          fullWidth
          className="mt-6"
          onClick={() => { setSuccessMessage(""); router.push("/tasks/recent"); }}
        >
          ตกลง
        </Button>
      </Modal>
    </div>
  );
}
