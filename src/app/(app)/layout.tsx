"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { SideMenu } from "@/components/layout/SideMenu";
import type { CompanyCode } from "@/lib/types";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [company, setCompany] = useState<CompanyCode>("OR");

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedCompany") as CompanyCode | null;
    if (stored) setCompany(stored);
  }, []);

  return (
    <div className="mobile-shell">
      <AppHeader
        company={company}
        onMenuClick={() => setMenuOpen(true)}
      />
      <div className="flex-1 overflow-y-auto pb-2">{children}</div>
      <BottomNav />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
