"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { queueNotificationApi, mobileApi, type QueueNotificationDto, type MobileShipmentDto } from "@/lib/api";
import type { CompanyCode } from "@/lib/types";

// ── unified notification item ─────────────────────────────────────────────────

interface NotifItem {
  id: string;
  title: string;
  shipmentNo: string;
  dateIso: string | null;   // ISO string for sorting & relative time
  isRead: boolean;
}

// ── helpers ───────────────────────────────────────────────────────────────────

const companyMap: Record<string, CompanyCode> = {
  TOP: "TOP", PTG: "PTG", PTT: "OR", PTTOR: "OR", OR: "OR",
  SH: "Shell", SHELL: "Shell", SFL: "SFL",
};

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60)  return `${diffSec} seconds ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60)  return `${diffMin} minutes ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)   return `${diffHr} hours ago`;
  return `${Math.floor(diffHr / 24)} days ago`;
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth()    === now.getMonth() &&
         d.getDate()     === now.getDate();
}

function formatThaiDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd   = String(d.getDate()).padStart(2, "0");
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear() + 543;
  const hh   = String(d.getHours()).padStart(2, "0");
  const min  = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} (${hh}:${min})`;
}

// ── convert sources → NotifItem ───────────────────────────────────────────────

function fromQueueNotif(n: QueueNotificationDto): NotifItem {
  return {
    id:         `q-${n.transactionId}`,
    title:      n.callingMsg || "การแจ้งเตือน",
    shipmentNo: n.shipmentNo,
    dateIso:    n.creationDate ?? n.datetime,
    isRead:     n.flagRead === "Y",
  };
}

function fromShipment(s: MobileShipmentDto): NotifItem {
  return {
    id:         `s-${s.shipmentNo}`,
    title:      "คุณได้รับรายการ Shipment ใหม่",
    shipmentNo: s.shipmentNo,
    dateIso:    s.shipmentDate,
    isRead:     false,
  };
}

function fromShipment2ndCall(s: MobileShipmentDto): NotifItem {
  return {
    id:         `s2-${s.shipmentNo}`,
    title:      "เรียกคิวเข้าพื้นที่ลานรอรับผลิตภัณฑ์ ครั้งที่ #2",
    shipmentNo: s.shipmentNo,
    dateIso:    s.notify2ndTimeStart,
    isRead:     false,
  };
}

// ── components ────────────────────────────────────────────────────────────────

function NotifRow({ item }: { item: NotifItem }) {
  return (
    <article className="flex gap-3 py-4">
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.isRead ? "bg-red-500" : "bg-top-primary"}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-top-blue leading-snug">{item.title}</p>
        <p className="mt-0.5 text-sm text-top-pink">{item.shipmentNo}</p>
        <div className="mt-1 flex justify-between text-xs text-top-muted">
          <span>{formatThaiDate(item.dateIso)}</span>
          <span>{relativeTime(item.dateIso)}</span>
        </div>
      </div>
    </article>
  );
}

function Section({ title, items }: { title: string; items: NotifItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-6">
      <h2 className="mb-1 text-sm font-semibold text-[#006699]">{title}</h2>
      <div className="divide-y divide-gray-100">
        {items.map((item) => <NotifRow key={item.id} item={item} />)}
      </div>
    </section>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [items, setItems]     = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.driverId) { setLoading(false); return; }

    const selectedCompany = (sessionStorage.getItem("selectedCompany") ?? "") as CompanyCode;

    Promise.all([
      queueNotificationApi.getAll(session.driverId).catch(() => ({ data: [] as QueueNotificationDto[] })),
      mobileApi.getShipments(session.driverId).catch(() => ({ data: [] as MobileShipmentDto[] })),
    ]).then(([notiRes, shipRes]) => {
      const notifItems  = (notiRes.data ?? []).map(fromQueueNotif);

      const filtered = (shipRes.data ?? []).filter((s) =>
        !selectedCompany || (companyMap[s.customerGroupId?.toUpperCase()] ?? "TOP") === selectedCompany
      );

      // shipment ใหม่ (status 11)
      const shipItems = filtered
        .filter((s) => s.status === 11)
        .map(fromShipment);

      // เรียกคิวครั้งที่ 2 — shipment ที่มี notify2ndTimeStart กำหนดไว้ (status >= 13, ไม่ใช่ 81)
      const call2Items = filtered
        .filter((s) => s.status !== null && s.status >= 13 && s.status !== 81 && s.notify2ndTimeStart)
        .map(fromShipment2ndCall);

      // รวมและ sort ใหม่สุดขึ้นก่อน
      const all = [...notifItems, ...shipItems, ...call2Items].sort((a, b) => {
        const da = a.dateIso ? new Date(a.dateIso).getTime() : 0;
        const db = b.dateIso ? new Date(b.dateIso).getTime() : 0;
        return db - da;
      });

      setItems(all);
    }).finally(() => setLoading(false));
  }, [session?.driverId]);

  const todayList = items.filter((n) => isToday(n.dateIso));
  const otherList = items.filter((n) => !isToday(n.dateIso));

  return (
    <div className="mobile-shell bg-white">
      <header className="flex items-center gap-3 border-b px-4 py-4">
        <button onClick={() => router.back()} aria-label="กลับ">
          <ChevronLeft size={24} className="text-top-blue" />
        </button>
        <h1 className="text-lg font-bold text-top-blue">Notification Center</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && <p className="py-12 text-center text-sm text-top-muted">กำลังโหลด...</p>}
        {!loading && items.length === 0 && (
          <p className="py-12 text-center text-sm text-top-muted">ไม่มีการแจ้งเตือน</p>
        )}
        {!loading && (
          <>
            <Section title="รายการแจ้งเตือนวันนี้" items={todayList} />
            <Section title="รายการแจ้งเตือนอื่นๆ"  items={otherList} />
          </>
        )}
      </div>
    </div>
  );
}
