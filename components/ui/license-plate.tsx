import React from "react";
import { cn } from "@/lib/cn";

export interface LicensePlateProps extends React.HTMLAttributes<HTMLDivElement> {
  plate: string;
}

export const LicensePlate = React.forwardRef<HTMLDivElement, LicensePlateProps>(
  ({ className, plate, ...props }, ref) => {
    const cleanPlate = plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const isOldFormat = cleanPlate.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(cleanPlate);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full max-w-[250px] flex-col overflow-hidden rounded-[6px] border-[2px] border-zinc-950 bg-white font-sans sm:border-[3px]",
          "h-[58px] min-[400px]:h-[68px] sm:h-[72px] md:h-[80px]",
          className
        )}
        {...props}
      >
        <div className="flex h-4 w-full shrink-0 items-center justify-between bg-[#003399] px-1.5 text-white min-[400px]:h-5 sm:h-[22px] sm:px-2">
          <div className="flex w-5 flex-col items-start justify-center min-[400px]:w-6">
            <span className="text-[4px] font-bold leading-none tracking-tighter text-blue-200 min-[400px]:text-[5px]">
              MERCOSUL
            </span>
          </div>

          <span className="text-[8px] font-bold tracking-[0.15em] min-[400px]:text-[10px] sm:tracking-[0.2em]">
            BRASIL
          </span>

          <div className="flex h-2.5 w-4 items-center justify-center overflow-hidden rounded-[1px] bg-green-600 min-[400px]:h-3 min-[400px]:w-[18px]">
            <div
              className="flex h-[6px] w-3 items-center justify-center bg-yellow-400 min-[400px]:h-[8px] min-[400px]:w-[14px]"
              style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            >
              <div className="h-[3px] w-[3px] rounded-full bg-blue-800 min-[400px]:h-[4px] min-[400px]:w-[4px]" />
            </div>
          </div>
        </div>

        {/* Faixa branca: mobile = BR na faixa inferior; md+ = BR à esquerda, código na mesma linha. */}
        <div className="relative flex min-h-0 flex-1 flex-col bg-white md:flex-row md:items-end md:justify-start md:gap-1 md:pl-2 md:pr-2 md:pt-0.5">
          <div className="flex min-h-0 flex-1 items-center justify-center px-1 pt-0.5 min-[400px]:px-2 md:order-2 md:flex-1 md:justify-center md:px-0 md:pt-0">
            <span
              className={cn(
                "text-center font-bold leading-none tracking-[0.05em] text-zinc-900",
                "text-[22px] min-[400px]:text-[30px] sm:text-[34px] md:text-[36px] lg:text-[38px]"
              )}
            >
              {cleanPlate.slice(0, 3)}
              {isOldFormat ? "-" : ""}
              {cleanPlate.slice(3)}
            </span>
          </div>
          <div className="flex shrink-0 items-end px-1 pb-0.5 min-[400px]:px-2 min-[400px]:pb-1 md:order-1 md:w-auto md:shrink-0 md:items-end md:self-end md:px-0 md:pb-1">
            <span className="font-bold leading-none tracking-tighter text-zinc-900 text-[7px] min-[400px]:text-[8px] sm:text-[9px] md:text-[11px]">
              BR
            </span>
          </div>
        </div>
      </div>
    );
  }
);

LicensePlate.displayName = "LicensePlate";
