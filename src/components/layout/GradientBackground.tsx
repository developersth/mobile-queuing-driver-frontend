"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2, MapPinOff } from "lucide-react";
import { geofenceApi } from "@/lib/api";

type LocationState = "checking" | "in-zone" | "out-zone" | "denied" | "error";

export function LocationBanner() {
  const [state, setState] = useState<LocationState>("checking");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await geofenceApi.check(
            pos.coords.latitude,
            pos.coords.longitude
          );
          if (res.data) {
            setDistanceKm(res.data.distanceKm);
            setState(res.data.inZone ? "in-zone" : "out-zone");
          }
        } catch {
          setState("error");
        }
      },
      (err) => {
        setState(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  if (state === "checking") {
    return (
      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-gray-100 px-4 py-3 text-gray-500">
        <Loader2 size={20} className="animate-spin shrink-0" />
        <p className="text-sm font-medium">กำลังตรวจสอบตำแหน่ง...</p>
      </div>
    );
  }

  if (state === "in-zone") {
    return (
      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#34d399] to-[#22c55e] px-4 py-3 text-white card-shadow">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-white/20">
          <MapPin size={20} className="text-white" fill="white" />
        </div>
        <div>
          <p className="text-sm font-medium leading-snug">คุณอยู่ในรัศมีที่สามารถยืนยัน Shipment ได้</p>
          {distanceKm !== null && (
            <p className="text-xs text-white/80 mt-0.5">ระยะห่าง {distanceKm.toFixed(1)} กิโลเมตร</p>
          )}
        </div>
      </div>
    );
  }

  if (state === "out-zone") {
    return (
      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-3 text-white card-shadow">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-white/20">
          <MapPinOff size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium leading-snug">คุณอยู่นอกรัศมี ไม่สามารถยืนยัน Shipment ได้</p>
          {distanceKm !== null && (
            <p className="text-xs text-white/80 mt-0.5">ระยะห่าง {distanceKm.toFixed(1)} กิโลเมตร</p>
          )}
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-gray-200 px-4 py-3 text-gray-600">
        <MapPinOff size={20} className="shrink-0" />
        <p className="text-sm font-medium">ไม่ได้รับอนุญาตให้เข้าถึง GPS กรุณาเปิดสิทธิ์ Location</p>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-gray-200 px-4 py-3 text-gray-600">
      <MapPin size={20} className="shrink-0" />
      <p className="text-sm font-medium">ไม่สามารถตรวจสอบตำแหน่งได้</p>
    </div>
  );
}

export function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="gradient-bg min-h-dvh">{children}</div>
  );
}
