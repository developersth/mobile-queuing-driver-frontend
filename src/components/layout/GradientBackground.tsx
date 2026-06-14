import { MapPin } from "lucide-react";

export function LocationBanner() {
  return (
    <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#34d399] to-[#22c55e] px-4 py-3 text-white card-shadow">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-white/20">
        <MapPin size={20} className="text-white" fill="white" />
      </div>
      <p className="text-sm font-medium leading-snug">
        คุณอยู่ในรัศมีที่สามารถยืนยัน Shipment ได้
      </p>
    </div>
  );
}

export function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="gradient-bg min-h-dvh">{children}</div>
  );
}
