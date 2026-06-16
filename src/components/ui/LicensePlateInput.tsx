"use client";

import { useRef } from "react";
import { Truck } from "lucide-react";

interface LicensePlateInputProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function LicensePlateInput({
  label,
  required = false,
  value,
  onChange,
  error = false,
}: LicensePlateInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.padEnd(7, " ").split("").slice(0, 7);

  const updateChar = (index: number, char: string) => {
    const digit = char.slice(-1).replace(/\D/g, "");
    const next = [...chars];
    next[index] = digit || " ";
    onChange(next.join("").trimEnd());
    if (digit && index < 6) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !chars[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="mb-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-top-primary">
          <Truck size={20} />
        </div>
        <span className="text-sm font-semibold text-top-primary">
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      </div>
      <div className="flex items-center justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={chars[i]?.trim() ?? ""}
            onChange={(e) => updateChar(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`h-11 w-10 rounded-lg border bg-white text-center text-lg font-semibold text-top-blue outline-none focus:border-top-primary ${error ? "border-red-400" : "border-[#b8d4f0]"}`}
          />
        ))}
        <span className="mx-1 text-xl font-bold text-top-blue">-</span>
        {[3, 4, 5, 6].map((i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={chars[i]?.trim() ?? ""}
            onChange={(e) => updateChar(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`h-11 w-10 rounded-lg border bg-white text-center text-lg font-semibold text-top-blue outline-none focus:border-top-primary ${error ? "border-red-400" : "border-[#b8d4f0]"}`}
          />
        ))}
      </div>
    </div>
  );
}
