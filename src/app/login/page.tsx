"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopLogo } from "@/components/branding/TopLogo";
import { GradientBackground } from "@/components/layout/GradientBackground";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [idCard, setIdCard] = useState("1629900150999");

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

            <div className="mt-8 space-y-3">
              <Button
                fullWidth
                onClick={() => router.push("/otp")}
                disabled={idCard.length < 13}
              >
                เข้าสู่ระบบ / ลงทะเบียน
              </Button>
 
            </div>
          </div>
        </div>
      </main>
    </GradientBackground>
  );
}
