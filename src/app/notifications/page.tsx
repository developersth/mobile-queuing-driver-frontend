"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { mockNotifications } from "@/lib/mock-data";

export default function NotificationsPage() {
  const router = useRouter();
  const today = mockNotifications.filter((n) => n.isToday);
  const others = mockNotifications.filter((n) => !n.isToday);

  return (
    <div className="mobile-shell bg-white">
      <header className="flex items-center gap-3 border-b px-4 py-4">
        <button onClick={() => router.back()} aria-label="กลับ">
          <ChevronLeft size={24} className="text-top-blue" />
        </button>
        <h1 className="text-lg font-bold text-top-blue">Notification Center</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <NotificationSection title="รายการแจ้งเตือนวันนี้" items={today} />
        <NotificationSection title="รายการแจ้งเตือนอื่นๆ" items={others} />
      </div>
    </div>
  );
}

function NotificationSection({
  title,
  items,
}: {
  title: string;
  items: typeof mockNotifications;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-sm font-semibold text-[#006699]">{title}</h2>
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <article key={item.id} className="flex gap-3 py-4">
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                item.isAlert ? "bg-red-500" : "bg-top-primary"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-top-blue">{item.title}</p>
              <p className="text-sm text-top-pink">{item.shipmentNo}</p>
              <div className="mt-1 flex justify-between text-xs text-top-muted">
                <span>{item.datetime}</span>
                <span>{item.relativeTime}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
