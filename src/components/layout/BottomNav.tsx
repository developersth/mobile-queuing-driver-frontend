"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Truck } from "lucide-react";

const navItems = [
  {
    href: "/tasks/new",
    label: "รับงานใหม่",
    icon: Truck,
    activeClass: "text-top-pink",
  },
  {
    href: "/tasks/recent",
    label: "งานที่กำลังทำ",
    icon: Truck,
    activeClass: "text-top-pink",
  },
  {
    href: "/tasks/history",
    label: "ประวัติงาน",
    icon: Clock,
    activeClass: "text-top-pink",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 border-t border-gray-200 bg-white">
      <div className="flex">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition ${
                isActive ? item.activeClass : "text-gray-400"
              }`}
            >
              <Icon
                size={22}
                className={index === 0 && isActive ? "text-top-pink" : ""}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-12 rounded-full bg-top-pink" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
