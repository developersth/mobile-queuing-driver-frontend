"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, ChevronLeft, Menu } from "lucide-react";
import { CompanyLogo } from "@/components/branding/CompanyLogo";
import type { CompanyCode } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

interface AppHeaderProps {
  company?: CompanyCode;
  showMenu?: boolean;
  showBack?: boolean;
  title?: string;
  onMenuClick?: () => void;
  notificationCount?: number;
  carrierName?: string;
}

export function AppHeader({
  company = "OR",
  showMenu = true,
  showBack = false,
  title,
  onMenuClick,
  notificationCount = 0,
  carrierName,
}: AppHeaderProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="text-top-blue"
            aria-label="กลับ"
          >
            <ChevronLeft size={24} />
          </button>
        ) : showMenu ? (
          <button
            onClick={onMenuClick}
            className="text-top-blue"
            aria-label="เมนู"
          >
            <Menu size={24} />
          </button>
        ) : (
          <div className="w-6" />
        )}

        {title ? (
          <h1 className="text-base font-bold text-top-blue">{title}</h1>
        ) : (
          <CompanyLogo company={company} size="md" />
        )}

        <Link href="/notifications" className="relative text-top-blue">
          <Bell size={22} />
          {notificationCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </Link>
      </div>

      {!title && mounted && session && (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="font-bold text-top-blue">{session.fullName}</p>
          {carrierName && (
            <p className="text-sm text-top-blue/80">บริษัทสังกัด : {carrierName}</p>
          )}
        </div>
      )}
    </header>
  );
}
