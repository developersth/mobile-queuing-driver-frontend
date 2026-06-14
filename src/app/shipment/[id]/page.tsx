"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronLeft } from "lucide-react";
import { ShipmentCard } from "@/components/shipment/ShipmentCard";
import { Button } from "@/components/ui/Button";
import { LicensePlateInput } from "@/components/ui/LicensePlateInput";
import { Modal } from "@/components/ui/Modal";
import { mockShipments } from "@/lib/mock-data";

export default function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const shipment = mockShipments.find((s) => s.id === id) ?? mockShipments[0];
  const [showModal, setShowModal] = useState(false);
  const [headPlate, setHeadPlate] = useState("06");
  const [trailerPlate, setTrailerPlate] = useState("");

  return (
    <div className="mobile-shell">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} aria-label="กลับ">
            <ChevronLeft size={24} className="text-top-blue" />
          </button>
          <h1 className="text-base font-bold text-top-blue">
            รายละเอียด Shipment
          </h1>
        </div>
        <div className="relative text-top-blue">
          <Bell size={22} />
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            6
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <ShipmentCard shipment={shipment} />
      </div>

      <div className="border-t bg-white p-4">
        <Button fullWidth onClick={() => setShowModal(true)}>
          ตอบรับ Shipment
        </Button>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="กรุณากรอกข้อมูลทะเบียนรถเพื่อยืนยันข้อมูล"
        onConfirm={() => {
          setShowModal(false);
          router.push("/tasks/recent");
        }}
      >
        <LicensePlateInput
          label="ทะเบียนรถหัวลาก"
          required
          value={headPlate}
          onChange={setHeadPlate}
        />
        <LicensePlateInput
          label="ทะเบียนรถหางพ่วง"
          value={trailerPlate}
          onChange={setTrailerPlate}
        />
        <p className="text-xs text-top-muted">
          <span className="underline">หมายเหตุ</span> กรณีมีเลขทะเบียน 6 ตัว
          กรุณาระบุ 0 ที่ช่องแรก
        </p>
      </Modal>
    </div>
  );
}
