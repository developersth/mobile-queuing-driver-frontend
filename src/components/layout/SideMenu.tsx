"use client";

import Link from "next/link";
import { LogOut, X } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/Modal";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

export function SideMenu({ open, onClose }: SideMenuProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <span className="font-bold text-top-blue">เมนู</span>
          <button onClick={onClose} aria-label="ปิดเมนู">
            <X size={22} className="text-top-blue" />
          </button>
        </div>
        <nav className="p-4">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-top-blue hover:bg-gray-50"
          >
            <LogOut size={20} />
            <span className="font-medium">ออกจากระบบ</span>
          </button>
        </nav>
      </aside>

      <ConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onClose();
          window.location.href = "/login";
        }}
        message="คุณต้องการออกจากระบบใช่หรือไม่?"
      />
    </>
  );
}
