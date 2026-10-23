import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "dark" | "white";
  height?: number;
  className?: string;
  showBadge?: boolean;
  badgeText?: string;
  asLink?: boolean;
  href?: string;
}

export default function Logo({
  variant = "dark",
  height = 28,
  className = "",
  showBadge = false,
  badgeText = "Voice Platform",
  asLink = false,
  href = "/",
}: LogoProps) {
  // Original aspect ratio is 453 / 208 = ~2.18
  const width = Math.round(height * 2.18);
  const src = variant === "white" ? "/logo-white.png" : "/logo.png";

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center transition-transform hover:scale-[1.02]">
        <Image
          src={src}
          alt="TUTO Logo"
          width={width}
          height={height}
          priority
          className="h-auto w-auto object-contain"
          style={{ height: `${height}px`, width: "auto" }}
        />
      </div>
      {showBadge && (
        <span className="hidden sm:inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200/80 shadow-2xs">
          {badgeText}
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href={href} className="group inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
