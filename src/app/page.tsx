"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopLogo } from "@/components/branding/TopLogo";
import { GradientBackground } from "@/components/layout/GradientBackground";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <GradientBackground>
      <main className="mobile-shell items-center justify-center">
        <TopLogo size="lg" />
      </main>
    </GradientBackground>
  );
}
