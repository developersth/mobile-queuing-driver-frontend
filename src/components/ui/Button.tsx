import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-top-primary text-white hover:bg-[#3d7ec9]",
  secondary:
    "border border-top-blue bg-white text-top-blue hover:bg-blue-50",
  outline:
    "border border-gray-300 bg-white text-top-blue hover:bg-gray-50",
  ghost: "bg-transparent text-top-blue hover:bg-gray-100",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-4 py-3 text-base font-semibold transition-colors disabled:opacity-50 ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
