"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GradientBackground } from "@/components/layout/GradientBackground";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { mockUser } from "@/lib/mock-data";

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("8954");
  const [remember, setRemember] = useState(true);

  return (
    <GradientBackground>
      <main className="mobile-shell px-6 py-12">
        <div className="flex flex-1 flex-col">
          <h1 className="text-center text-2xl font-bold text-top-blue">
            ลงทะเบียนเครื่อง
          </h1>
          <p className="mt-4 text-center text-sm text-top-muted">
            ระบบได้ทำการส่งรหัส OTP ไปยัง
          </p>
          <p className="text-center text-base font-semibold text-top-blue">
            {mockUser.phoneMasked}
          </p>

          <div className="mt-10">
            <p className="mb-3 text-sm font-semibold text-top-blue">ระบุ OTP</p>
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-top-muted">ไม่ได้รหัส OTP?</span>
            <button className="font-medium text-top-primary underline">
              ส่งรหัสอีกครั้ง
            </button>
          </div>

          <label className="mt-8 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 accent-top-primary"
            />
            <span className="text-sm font-medium text-top-blue">
              จดจำการเข้าสู่ระบบ
            </span>
          </label>

          <div className="mt-auto flex gap-3 pt-10">
            <Button
              variant="outline"
              fullWidth
              onClick={() => router.back()}
            >
              ยกเลิก
            </Button>
            <Button
              fullWidth
              onClick={() => router.push("/select-company")}
              disabled={otp.length < 4}
            >
              ยืนยัน
            </Button>
          </div>
        </div>
      </main>
    </GradientBackground>
  );
}
