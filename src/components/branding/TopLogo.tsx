import Image from "next/image";

interface TopLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizes = {
  sm: { icon: 48, text: "text-lg" },
  md: { icon: 72, text: "text-xl" },
  lg: { icon: 120, text: "text-2xl" },
};

export function TopLogo({ size = "md", showText = true }: TopLogoProps) {
  const config = sizes[size];

  return (
    <div className="flex flex-col items-center gap-3">
      <Image
        src="/icons/icon-512.png"
        alt="TOP Mobile Queuing"
        width={config.icon}
        height={config.icon}
        className="rounded-2xl"
        priority
      />
      {showText && (
        <h1 className={`${config.text} text-center font-bold leading-tight`}>
          <span className="text-top-pink">TOP</span>{" "}
          <span className="text-top-blue">Mobile Queuing</span>
        </h1>
      )}
    </div>
  );
}
