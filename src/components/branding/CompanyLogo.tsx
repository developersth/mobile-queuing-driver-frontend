import type { CompanyCode } from "@/lib/types";

interface CompanyLogoProps {
  company: CompanyCode;
  size?: "sm" | "md" | "lg";
}

const companyStyles: Record<
  CompanyCode,
  { bg: string; label: string; accent: string }
> = {
  TOP: { bg: "bg-white", label: "Thaioil", accent: "text-top-pink" },
  OR: { bg: "bg-white", label: "OR", accent: "text-[#0066cc]" },
  PTG: { bg: "bg-white", label: "PTG", accent: "text-[#e31b23]" },
  Shell: { bg: "bg-white", label: "Shell", accent: "text-[#fbce07]" },
  SFL: { bg: "bg-white", label: "SFL", accent: "text-[#003399]" },
};

const sizeClasses = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-16 w-16 text-sm",
};

export function CompanyLogo({ company, size = "md" }: CompanyLogoProps) {
  const style = companyStyles[company];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex ${sizeClasses[size]} items-center justify-center rounded-lg border border-gray-100 font-bold ${style.bg} ${style.accent} card-shadow`}
      >
        {company === "Shell" ? "🐚" : company.slice(0, 2)}
      </div>
      {size !== "sm" && (
        <span className="text-sm font-semibold text-top-blue">{style.label}</span>
      )}
    </div>
  );
}

export function CompanyCardLogo({ company }: { company: CompanyCode }) {
  const labels: Record<CompanyCode, { title: string; subtitle?: string }> = {
    TOP: { title: "Thaioil", subtitle: "TOP" },
    OR: { title: "OR" },
    PTG: { title: "PTG" },
    Shell: { title: "Shell" },
    SFL: { title: "SFL" },
  };

  const info = labels[company];

  return (
    <div className="flex flex-col items-center gap-2">
      <CompanyLogo company={company} size="lg" />
      {info.subtitle && (
        <span className="text-sm font-bold text-top-blue">{info.subtitle}</span>
      )}
    </div>
  );
}
