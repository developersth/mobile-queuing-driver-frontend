"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { queueNotificationApi, type QueueNotificationDto } from "@/lib/api";

const POLL_INTERVAL  = 30_000; // poll ทุก 30 วินาที
const AUTO_DISMISS   = 30;     // นับถอยหลัง 30 วินาที

interface Props {
  driverId: number;
}

export function QueueNotificationBanner({ driverId }: Props) {
  const [notifications, setNotifications] = useState<QueueNotificationDto[]>([]);
  const [current, setCurrent] = useState<QueueNotificationDto | null>(null);
  const [countdown, setCountdown] = useState(AUTO_DISMISS);
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── fetch unread ──────────────────────────────────────────────────────────
  const fetchUnread = async () => {
    try {
      const res = await queueNotificationApi.getUnread(driverId);
      if (res.data && res.data.length > 0) {
        setNotifications(res.data);
        setCurrent((prev) => prev ?? res.data![0]);
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchUnread();
    pollRef.current = setInterval(fetchUnread, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [driverId]);

  // ── countdown — reset ทุกครั้งที่ current เปลี่ยน ────────────────────────
  useEffect(() => {
    if (!current) return;
    setCountdown(AUTO_DISMISS);
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          dismiss(current, "หมดเวลา ไม่ได้รับทราบ");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [current?.transactionId]);

  // ── dismiss ───────────────────────────────────────────────────────────────
  const dismiss = async (n: QueueNotificationDto, msgRead = "รับทราบแล้ว") => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    try { await queueNotificationApi.markRead(n.transactionId, msgRead); } catch { /* silent */ }
    setNotifications((prev) => {
      const remaining = prev.filter((x) => x.transactionId !== n.transactionId);
      setCurrent(remaining.length > 0 ? remaining[0] : null);
      return remaining;
    });
  };

  if (!current) return null;

  const pct = (countdown / AUTO_DISMISS) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-slide-up">
        {/* countdown bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-top-primary transition-all duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* header */}
        <div className="flex items-center justify-between bg-top-primary px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <Bell size={18} className="animate-bounce" />
            <span className="font-bold text-sm">เรียกคิว</span>
            {notifications.length > 1 && (
              <span className="rounded-full bg-white/30 px-2 py-0.5 text-xs">
                {notifications.length} รายการ
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-xs font-semibold tabular-nums">{countdown}s</span>
            <button onClick={() => dismiss(current, "ปิดการแจ้งเตือน")} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="p-4 space-y-3">
          <p className="text-base font-bold text-top-blue leading-snug">{current.callingMsg}</p>

          <div className="rounded-xl bg-blue-50 px-4 py-3 space-y-1.5 text-sm">
            <Row label="Shipment No." value={current.shipmentNo} bold />
            {current.tuId1 && <Row label="ทะเบียนหัวลาก" value={current.tuId1} />}
            {current.tuId2 && <Row label="ทะเบียนหางพ่วง" value={current.tuId2} />}
            {current.callingCount && (
              <Row label="ครั้งที่เรียก" value={`#${current.callingCount}`} />
            )}
            {current.datetime && <Row label="เวลา" value={current.datetime} />}
          </div>
        </div>

        {/* actions */}
        <div className="flex gap-3 px-4 pb-4">
          {notifications.length > 1 && (
            <button
              onClick={() => dismiss(current, "รับทราบแล้ว")}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600"
            >
              ถัดไป ({notifications.length - 1})
            </button>
          )}
          <button
            onClick={() => dismiss(current, "รับทราบแล้ว")}
            className="flex-1 rounded-xl bg-top-primary py-3 text-sm font-bold text-white"
          >
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-top-muted">{label}</span>
      <span className={`text-right text-top-blue ${bold ? "font-bold" : ""}`}>{value}</span>
    </div>
  );
}
