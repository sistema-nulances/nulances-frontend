import React, { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallbackSrc?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "Avatar", fallbackSrc = "/logo-nulance-leilao.png", ...props }, ref) => {
    const [error, setError] = useState(false);

    // Quando a origem muda (ex.: nova URL assinada do backend), revalida a imagem.
    useEffect(() => {
      setError(false);
    }, [src]);

    const isFallback = error || !src;
    const imageSrc = isFallback ? fallbackSrc : src;
    const isNulanceLogo =
      imageSrc.includes("logo-nulance") || imageSrc.includes("NuLanceADMIN");

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-white",
          className
        )}
        {...props}
      >
        <img
          src={imageSrc}
          alt={alt}
          onError={() => setError(true)}
          className={cn(
            "h-full w-full",
            isNulanceLogo ? "object-contain p-2 h-12 w-12" : "object-cover"
          )}
        />
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
