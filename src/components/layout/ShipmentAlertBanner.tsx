"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { mobileApi, type MobileShipmentDto } from "@/lib/api";
import type { CompanyCode } from "@/lib/types";

// ── helpers ───────────────────────────────────────────────────────────────────

const companyMap: Record<string, CompanyCode> = {
  TOP: "TOP", PTG: "PTG", PTT: "OR", PTTOR: "OR", OR: "OR",
  SH: "Shell", SHELL: "Shell", SFL: "SFL",
};

function playBeep(freq = 880) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
    ctx.close();
  } catch { /* silent */ }
}

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

// ── alert types ───────────────────────────────────────────────────────────────

type AlertKind = "call-1st" | "call-2nd";

interface ShipmentAlert {
  id: string;           // unique key to deduplicate
  kind: AlertKind;
  shipmentNo: string;
  message: string;
  endsAt: Date | null;  // for call alerts: countdown target
}

const AUTO_DISMISS = 30;

// ── main component ────────────────────────────────────────────────────────────

interface Props {
  driverId: number;
}

export function ShipmentAlertBanner({ driverId }: Props) {
  const [queue, setQueue] = useState<ShipmentAlert[]>([]);
  const [current, setCurrent] = useState<ShipmentAlert | null>(null);
  const [countdown, setCountdown] = useState(AUTO_DISMISS);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const STORAGE_KEY = `shipment_alerts_shown_${driverId}`;

  const isShown = (id: string): boolean => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
      return stored.includes(id);
    } catch { return false; }
  };

  const markShown = (id: string) => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
      if (!stored.includes(id)) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...stored, id]));
      }
    } catch { /* silent */ }
  };

  // ── push alert ──────────────────────────────────────────────────────────────
  const pushAlert = (alert: ShipmentAlert) => {
    if (isShown(alert.id)) return;
    markShown(alert.id);
    setQueue((prev) => [...prev, alert]);
  };

  // ── process shipments → detect call windows ──────────────────────────────
  const processShipments = (shipments: MobileShipmentDto[]) => {
    const selectedCompany = (sessionStorage.getItem("selectedCompany") ?? "") as CompanyCode;
    const now = new Date();

    shipments.forEach((s) => {
      const company = companyMap[s.customerGroupId?.toUpperCase()] ?? "TOP";
      if (selectedCompany && company !== selectedCompany) return;

      // ── call time windows (status 13-19, not 81) ──
      if (s.status !== null && s.status >= 13 && s.status < 20 && s.status !== 81) {
        const s1 = parseDate(s.notify1stTimeStart);
        const e1 = parseDate(s.notify1stTimeEnd);
        const s2 = parseDate(s.notify2ndTimeStart);
        const e2 = parseDate(s.notify2ndTimeEnd);

        // call-1: push เสมอถ้า window เริ่มแล้ว (แม้ผ่านไปแล้ว) เพื่อให้แสดงก่อน call-2
        if (s1 && now >= s1) {
          pushAlert({
            id: `${s.shipmentNo}-call-1`,
            kind: "call-1st",
            shipmentNo: s.shipmentNo,
            message: e1
              ? `เรียกเข้าพื้นที่ครั้งที่ 1  (ถึง ${formatTime(e1)})`
              : "เรียกเข้าพื้นที่ครั้งที่ 1",
            endsAt: e1,
          });
        }
        // call-2: push เฉพาะเมื่ออยู่ใน window (หลัง call-1 ถูก push แล้ว)
        if (s2 && e2 && now >= s2 && now <= e2) {
          pushAlert({
            id: `${s.shipmentNo}-call-2`,
            kind: "call-2nd",
            shipmentNo: s.shipmentNo,
            message: `เรียกเข้าพื้นที่ครั้งที่ 2  (ถึง ${formatTime(e2)})`,
            endsAt: e2,
          });
        }
      }
    });
  };

  // ── poll ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await mobileApi.getShipments(driverId);
        if (!res.data) return;
        processShipments(res.data);
      } catch { /* silent */ }
    };

    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, [driverId]);

  // ── show next item in queue ────────────────────────────────────────────────
  useEffect(() => {
    if (current || queue.length === 0) return;
    const next = queue[0];
    setCurrent(next);
    setQueue((prev) => prev.slice(1));

    // play sound for call alerts
    if (next.kind === "call-1st") playBeep(880);
    if (next.kind === "call-2nd") playBeep(1100);
  }, [queue, current]);

  // ── countdown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!current) return;
    setCountdown(AUTO_DISMISS);
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          setCurrent(null);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [current?.id]);

  const dismiss = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCurrent(null);
  };

  if (!current) return null;

  const pct = (countdown / AUTO_DISMISS) * 100;
  const headerColor = current.kind === "call-2nd" ? "bg-red-600" : "bg-amber-500";
  const barColor    = current.kind === "call-2nd" ? "bg-red-300" : "bg-amber-300";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-slide-up">
        {/* countdown bar */}
        <div className="h-1 bg-gray-100">
          <div className={`h-1 ${barColor} transition-all duration-1000 ease-linear`} style={{ width: `${pct}%` }} />
        </div>

        {/* header */}
        <div className={`flex items-center justify-between px-4 py-3 ${headerColor}`}>
          <div className="flex items-center gap-2 text-white">
            <Bell size={18} className="animate-bounce" />
            <span className="font-bold text-sm">
              {current.kind === "call-1st" ? "เรียกคิวครั้งที่ 1" : "เรียกคิวครั้งที่ 2"}
            </span>
            {queue.length > 0 && (
              <span className="rounded-full bg-white/30 px-2 py-0.5 text-xs">{queue.length + 1} รายการ</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-xs font-semibold tabular-nums">{countdown}s</span>
            <button onClick={dismiss} className="text-white/80 hover:text-white"><X size={20} /></button>
          </div>
        </div>

        {/* body */}
        <div className="p-4 space-y-3">
          <p className="text-base font-bold text-top-blue">{current.message}</p>
          <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-top-muted">Shipment No.</span>
              <span className="font-bold text-top-pink">{current.shipmentNo}</span>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="flex gap-3 px-4 pb-4">
          {queue.length > 0 && (
            <button
              onClick={dismiss}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600"
            >
              ถัดไป ({queue.length})
            </button>
          )}
          <button
            onClick={dismiss}
            className={`flex-1 rounded-xl py-3 text-sm font-bold text-white ${headerColor}`}
          >
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
}
