import Image from "next/image";
import type { CompanyCode } from "@/lib/types";

interface CompanyLogoProps {
  company: CompanyCode;
  size?: "sm" | "md" | "lg";
}

const companyConfig: Record<
  CompanyCode,
  { label: string; logoPath: string | null; fallbackText: string; accent: string }
> = {
  TOP:   { label: "Thaioil", logoPath: "/logos/TOP.png",   fallbackText: "TOP", accent: "text-top-pink" },
  OR:    { label: "OR",      logoPath: "/logos/OR.png",    fallbackText: "OR",  accent: "text-[#0066cc]" },
  PTG:   { label: "PTG",     logoPath: "/logos/PTG.png",   fallbackText: "PTG", accent: "text-[#e31b23]" },
  Shell: { label: "Shell",   logoPath: "/logos/Shell.png", fallbackText: "SH",  accent: "text-[#fbce07]" },
  SFL:   { label: "SFL",     logoPath: "/logos/SFL.png",   fallbackText: "SFL", accent: "text-[#003399]" },
};

const sizeClasses = {
  sm: { box: "h-8 w-8",   img: 32,  text: "text-[10px]" },
  md: { box: "h-10 w-10", img: 40,  text: "text-xs" },
  lg: { box: "h-16 w-16", img: 64,  text: "text-sm" },
};

export function CompanyLogo({ company, size = "md" }: CompanyLogoProps) {
  const config = companyConfig[company];
  const sz = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      <div className={`flex ${sz.box} items-center justify-center rounded-lg border border-gray-100 bg-white card-shadow overflow-hidden`}>
        {config.logoPath ? (
          <Image
            src={config.logoPath}
            alt={config.label}
            width={sz.img}
            height={sz.img}
            className="object-contain p-1"
          />
        ) : (
          <span className={`font-bold ${sz.text} ${config.accent}`}>{config.fallbackText}</span>
        )}
      </div>
      {size !== "sm" && (
        <span className="text-sm font-semibold text-top-blue">{config.label}</span>
      )}
    </div>
  );
}

export function CompanyCardLogo({ company }: { company: CompanyCode }) {
  const config = companyConfig[company];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-gray-100 bg-white card-shadow overflow-hidden">
        {config.logoPath ? (
          <Image
            src={config.logoPath}
            alt={config.label}
            width={80}
            height={80}
            className="object-contain p-2"
          />
        ) : (
          <span className={`text-lg font-bold ${config.accent}`}>{config.fallbackText}</span>
        )}
      </div>
      <span className="text-sm font-semibold text-top-blue">{config.label}</span>
    </div>
  );
}
