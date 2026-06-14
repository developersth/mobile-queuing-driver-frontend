"use client";

import { useRouter } from "next/navigation";
import { TopLogo } from "@/components/branding/TopLogo";
import { CompanyCardLogo } from "@/components/branding/CompanyLogo";
import { GradientBackground } from "@/components/layout/GradientBackground";
import { companies } from "@/lib/mock-data";
import type { CompanyCode } from "@/lib/types";

export default function SelectCompanyPage() {
  const router = useRouter();
  const featured = companies.find((c) => c.featured)!;
  const others = companies.filter((c) => !c.featured);

  const handleSelect = (code: CompanyCode) => {
    sessionStorage.setItem("selectedCompany", code);
    router.push("/tasks/new");
  };

  return (
    <GradientBackground>
      <main className="mobile-shell px-6 py-10">
        <div className="mb-8 flex justify-center">
          <TopLogo size="sm" />
        </div>

        <h1 className="mb-8 text-center text-xl font-bold text-top-blue">
          เลือกบริษัทกลุ่มลูกค้า
        </h1>

        <button
          onClick={() => handleSelect(featured.code)}
          className="mb-4 w-full rounded-2xl bg-white p-6 transition hover:shadow-md card-shadow"
        >
          <CompanyCardLogo company={featured.code} />
        </button>

        <div className="grid grid-cols-2 gap-4">
          {others.map((company) => (
            <button
              key={company.code}
              onClick={() => handleSelect(company.code)}
              className="rounded-2xl bg-white p-6 transition hover:shadow-md card-shadow"
            >
              <CompanyCardLogo company={company.code} />
            </button>
          ))}
        </div>
      </main>
    </GradientBackground>
  );
}
