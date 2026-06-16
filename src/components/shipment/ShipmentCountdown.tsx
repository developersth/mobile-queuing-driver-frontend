"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Clock } from "lucide-react";
import type { MobileShipmentDto } from "@/lib/api";

// ── Web Audio beep ────────────────────────────────────────────────────────────
function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
    ctx.close();
  } catch { /* silently ignore if audio blocked */ }
}

// ── time helpers ──────────────────────────────────────────────────────────────
function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function formatMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

// ── types ─────────────────────────────────────────────────────────────────────
type Phase =
  | { kind: "before-1st"; startsAt: Date }
  | { kind: "calling-1st"; endsAt: Date; remaining: number }
  | { kind: "between"; startsAt: Date }
  | { kind: "calling-2nd"; endsAt: Date; remaining: number }
  | { kind: "expired" }
  | { kind: "no-schedule" };

function getPhase(s: MobileShipmentDto, now: Date): Phase {
  const s1 = parseDate(s.notify1stTimeStart);
  const e1 = parseDate(s.notify1stTimeEnd);
  const s2 = parseDate(s.notify2ndTimeStart);
  const e2 = parseDate(s.notify2ndTimeEnd);

  if (!s1 && !s2) return { kind: "no-schedule" };

  if (s1 && e1 && now >= s1 && now <= e1)
    return { kind: "calling-1st", endsAt: e1, remaining: Math.max(0, Math.floor((e1.getTime() - now.getTime()) / 1000)) };

  if (s2 && e2 && now >= s2 && now <= e2)
    return { kind: "calling-2nd", endsAt: e2, remaining: Math.max(0, Math.floor((e2.getTime() - now.getTime()) / 1000)) };

  if (s1 && now < s1)
    return { kind: "before-1st", startsAt: s1 };

  if (e1 && s2 && now > e1 && now < s2)
    return { kind: "between", startsAt: s2 };

  if ((e1 && now > e1 && !s2) || (e2 && now > e2))
    return { kind: "expired" };

  return { kind: "no-schedule" };
}

// ── main component ────────────────────────────────────────────────────────────
export function ShipmentCountdown({ shipment }: { shipment: MobileShipmentDto }) {
  const [phase, setPhase] = useState<Phase>(() => getPhase(shipment, new Date()));
  const alertedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const p = getPhase(shipment, now);
      setPhase(p);

      // เล่นเสียงครั้งแรกที่เข้าช่วงเรียกคิว
      if (p.kind === "calling-1st" && !alertedRef.current.has("1st")) {
        alertedRef.current.add("1st");
        playBeep();
      }
      if (p.kind === "calling-2nd" && !alertedRef.current.has("2nd")) {
        alertedRef.current.add("2nd");
        playBeep();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [shipment.shipmentNo]);

  if (phase.kind === "no-schedule") return null;

  // ── expired ──
  if (phase.kind === "expired")
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-500">
        <Clock size={14} />
        <span>หมดเวลาเรียกคิวแล้ว</span>
      </div>
    );

  // ── waiting before 1st call ──
  if (phase.kind === "before-1st")
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-top-blue">
        <Clock size={14} className="shrink-0" />
        <span>รอเรียกคิวครั้งที่ 1 เวลา <strong>{formatTime(phase.startsAt)}</strong></span>
      </div>
    );

  // ── waiting between 1st and 2nd ──
  if (phase.kind === "between")
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-top-blue">
        <Clock size={14} className="shrink-0" />
        <span>รอเรียกคิวครั้งที่ 2 เวลา <strong>{formatTime(phase.startsAt)}</strong></span>
      </div>
    );

  // ── active call window ──
  const callNo = phase.kind === "calling-1st" ? "1" : "2";
  const remaining = phase.remaining;
  const pct = (() => {
    const s = parseDate(phase.kind === "calling-1st" ? shipment.notify1stTimeStart : shipment.notify2ndTimeStart);
    const e = phase.endsAt;
    if (!s) return 0;
    const total = (e.getTime() - s.getTime()) / 1000;
    return total > 0 ? Math.round((remaining / total) * 100) : 0;
  })();

  const urgent = remaining <= 60;

  return (
    <div className={`mt-3 rounded-xl overflow-hidden border ${urgent ? "border-red-300 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
      {/* progress bar */}
      <div className="h-1 bg-gray-200">
        <div
          className={`h-1 transition-all duration-1000 ease-linear ${urgent ? "bg-red-500" : "bg-amber-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-3 py-2">
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${urgent ? "text-red-600" : "text-amber-700"}`}>
          <Bell size={14} className={urgent ? "animate-bounce" : ""} />
          <span>เรียกคิวครั้งที่ {callNo}</span>
        </div>
        <span className={`tabular-nums text-sm font-bold ${urgent ? "text-red-600" : "text-amber-700"}`}>
          {formatMMSS(remaining)}
        </span>
      </div>
    </div>
  );
}
