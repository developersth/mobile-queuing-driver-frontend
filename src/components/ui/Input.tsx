"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  note?: string;
  maskable?: boolean;
}

export function Input({
  label,
  note,
  maskable = false,
  className = "",
  type = "text",
  ...props
}: InputProps) {
  const [visible, setVisible] = useState(!maskable);
  const inputType = maskable ? (visible ? "text" : "password") : type;

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-top-blue">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={`w-full rounded-xl border border-[#b8d4f0] bg-white px-4 py-3 text-top-blue outline-none transition focus:border-top-primary focus:ring-2 focus:ring-top-primary/20 ${className}`}
          {...props}
        />
        {maskable && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-label={visible ? "ซ่อน" : "แสดง"}
          >
            {visible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {note && (
        <p className="mt-2 text-xs leading-relaxed text-top-muted">
          <span className="underline">หมายเหตุ</span> {note}
        </p>
      )}
    </div>
  );
}
