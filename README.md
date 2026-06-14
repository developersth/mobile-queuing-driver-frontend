# TOP Mobile Queuing - Driver PWA

Progressive Web App สำหรับพนักงานขับรถ ระบบ TOP Mobile Queuing

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- PWA (`@ducanh2912/next-pwa`)
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## หน้าจอในแอป

| Route | หน้าจอ |
|-------|--------|
| `/` | Splash Screen |
| `/login` | เข้าสู่ระบบ / ลงทะเบียน (รหัสบัตรประชาชน) |
| `/otp` | ลงทะเบียนเครื่อง (OTP) |
| `/select-company` | เลือกบริษัทกลุ่มลูกค้า |
| `/tasks/new` | รับงานใหม่ |
| `/tasks/recent` | งานที่กำลังทำ |
| `/tasks/history` | ประวัติงาน |
| `/notifications` | Notification Center |
| `/shipment/[id]` | รายละเอียด Shipment |

## PWA

- `public/manifest.json` — Web App Manifest
- `public/icons/icon-512.png` — App icon จาก UI design
- Service Worker สร้างอัตโนมัติตอน `npm run build` (ปิดใน dev mode)

## UI Reference

ออกแบบตามเอกสาร UI Driver ในโฟลเดอร์ `2-UI-Driver`
