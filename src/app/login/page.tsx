"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopLogo } from "@/components/branding/TopLogo";
import { GradientBackground } from "@/components/layout/GradientBackground";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [idCard, setIdCard] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(idCard);
      if (res.data) {
        setSession({
          driverId: res.data.driverId,
          fullName: res.data.fullName,
          phoneNumber: res.data.phoneNumber,
          driverCode: res.data.driverCode,
          carrierId: res.data.carrierId,
          license: res.data.license,
          licenseType: res.data.licenseType,
        });
        router.push("/select-company");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่พบข้อมูล กรุณาตรวจสอบรหัสบัตรประชาชน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <main className="mobile-shell">
        <div className="flex flex-1 flex-col items-center px-6 pt-16">
          <TopLogo size="md" />

          <div className="mt-10 w-full rounded-t-3xl bg-white px-6 pb-8 pt-8 card-shadow">
            <Input
              label="รหัสบัตรประชาชน"
              maskable
              value={idCard}
              onChange={(e) => setIdCard(e.target.value)}
              note="ระบุข้อมูลที่ท่านเคยลงทะเบียน ในระบบ Online Driver"
            />

            {error && (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            )}

            <div className="mt-8 space-y-3">
              <Button
                fullWidth
                onClick={handleSubmit}
                disabled={idCard.length < 13 || loading}
              >
                {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ / ลงทะเบียน"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </GradientBackground>
  );
}
