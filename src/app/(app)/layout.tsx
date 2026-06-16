"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { SideMenu } from "@/components/layout/SideMenu";
import type { CompanyCode } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { mobileApi } from "@/lib/api";
import { QueueNotificationBanner } from "@/components/layout/QueueNotificationBanner";
import { ShipmentAlertBanner } from "@/components/layout/ShipmentAlertBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [company, setCompany] = useState<CompanyCode>("OR");
  const [carrierName, setCarrierName] = useState("");
  const { session } = useAuth();

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedCompany") as CompanyCode | null;
    if (stored) setCompany(stored);
  }, []);

  useEffect(() => {
    if (!session?.driverId) return;
    mobileApi.getDriverProfile(session.driverId).then((res) => {
      if (res.data?.carrierName) setCarrierName(res.data.carrierName);
    }).catch(() => {});
  }, [session?.driverId]);

  return (
    <div className="mobile-shell">
      <AppHeader
        company={company}
        onMenuClick={() => setMenuOpen(true)}
        carrierName={carrierName}
      />
      <div className="flex-1 overflow-y-auto pb-2">{children}</div>
      <BottomNav />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      {session?.driverId && <QueueNotificationBanner driverId={session.driverId} />}
      {session?.driverId && <ShipmentAlertBanner driverId={session.driverId} />}
    </div>
  );
}
