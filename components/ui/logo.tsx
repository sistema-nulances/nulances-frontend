import Image from "next/image";

type LogoVariant = "default" | "leilao" | "marketplace";

interface LogoProps {
  size?: number;
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
}

const logoMap: Record<LogoVariant, { src: string; alt: string }> = {
  default: {
    src: "/logo-nulance.png",
    alt: "Logo Nulance",
  },
  leilao: {
    src: "/logo-nulance-leilao.png",
    alt: "Logo Nulance Leilão",
  },
  marketplace: {
    src: "/logo-nulance-marketplace.png",
    alt: "Logo Nulance Marketplace",
  },
};

export function Logo({
  size = 140,
  variant = "default",
  className,
}: LogoProps) {
  const logo = logoMap[variant];

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={size}
      height={size}
      priority={true}
      className={className}
    />
  );
}
