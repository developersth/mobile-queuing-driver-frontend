import type { NotificationItem, Shipment } from "./types";

export const mockUser = {
  name: "นายสมัคร ธรรมสัตย์",
  company: "บ.ศรีไทย อินเตอร์ไพรส์ จก.",
  phoneMasked: "xxx-xxx-111",
};

export const mockShipments: Shipment[] = [
  {
    id: "77000000087",
    company: "OR",
    date: "19/06/2567",
    destination: "PTT SS BANGSAI",
    licensePlates: ["กก.61-5512", "กก.61-5112"],
    status: "pending",
  },
  {
    id: "77000000088",
    company: "OR",
    date: "19/06/2567",
    destination: "PTT SS BANGSAI",
    licensePlates: ["กก.61-5512", "กก.61-5112"],
    status: "pending",
  },
];

export const mockRecentShipments: Shipment[] = [
  {
    id: "77000000087",
    company: "OR",
    date: "19/06/2567",
    destination: "PTT SS BANGSAI",
    licensePlates: ["กก.61-5512", "กก.61-5112"],
    status: "called-1",
  },
];

export const mockHistoryShipments: Shipment[] = [
  {
    id: "77000000087",
    company: "OR",
    date: "19/06/2567",
    destination: "PTT SS BANGSAI",
    licensePlates: ["กก.61-5512", "กก.61-5112"],
    status: "completed",
  },
  {
    id: "77000000082",
    company: "OR",
    date: "19/06/2567",
    destination: "PTT SS BANGSAI",
    licensePlates: ["กก.61-5512", "กก.61-5112"],
    status: "no-confirmation",
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "การแจ้งเตือน : เรียกเข้าพื้นที่ครั้งที่ 2",
    shipmentNo: "7700000000xx",
    datetime: "19/06/2567 (11:20)",
    relativeTime: "20 seconds ago",
    isToday: true,
  },
  {
    id: "2",
    title: "การแจ้งเตือน : เรียกเข้าพื้นที่ครั้งที่ 1",
    shipmentNo: "7700000000xx",
    datetime: "19/06/2567 (10:00)",
    relativeTime: "1 hours ago",
    isToday: true,
  },
  {
    id: "3",
    title: "คุณได้รับรายการ Shipment ใหม่",
    shipmentNo: "7700000000xx",
    datetime: "19/06/2567 (10:00)",
    relativeTime: "2 hours ago",
    isToday: true,
  },
  {
    id: "4",
    title: "เชิญหมายเลขทะเบียน กท.61-5522 เข้าลานรอรับผลิตภัณฑ์",
    shipmentNo: "7700000000xx",
    datetime: "18/06/2567 (10:00)",
    relativeTime: "1 day ago",
    isToday: false,
  },
  {
    id: "5",
    title: "การแจ้งเตือน : หมดเวลาการเข้าพื้นที่",
    shipmentNo: "770000000082",
    datetime: "18/06/2567 (11:20)",
    relativeTime: "1 day ago",
    isToday: false,
    isAlert: true,
  },
  {
    id: "6",
    title: "การแจ้งเตือน : เรียกเข้าพื้นที่ครั้งที่ 2",
    shipmentNo: "770000000082",
    datetime: "18/06/2567 (11:20)",
    relativeTime: "1 day ago",
    isToday: false,
  },
];

export const companies = [
  { code: "TOP" as const, name: "TOP", featured: true },
  { code: "OR" as const, name: "OR", featured: false },
  { code: "PTG" as const, name: "PTG", featured: false },
  { code: "Shell" as const, name: "Shell", featured: false },
  { code: "SFL" as const, name: "SFL", featured: false },
];
