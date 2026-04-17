"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type PaginationItem = number | "ellipsis";

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const items: PaginationItem[] = [];

  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  items.push(1);
  if (left > 2) items.push("ellipsis");

  for (let p = left; p <= right; p++) items.push(p);

  if (right < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);

  return items;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const safeCurrent = Math.min(Math.max(1, currentPage), totalPages);
  const pageItems = getPaginationItems(safeCurrent, totalPages);

  return (
    <nav className={cn("flex items-center justify-center gap-2 mt-10", className)} aria-label="Paginação">
      <Button
        type="button"
        variant="outline"
        onClick={() => onPageChange(Math.max(1, safeCurrent - 1))}
        disabled={safeCurrent === 1}
        className="h-9 w-9 rounded-full"
        aria-label="Página anterior"
      >
        {"<"}
      </Button>

      {pageItems.map((item, idx) => {
        if (item === "ellipsis") {
          return (
            <span key={`ellipsis-${idx}`} className="px-2 text-zinc-500">
              ...
            </span>
          );
        }

        const isActive = item === safeCurrent;
        return (
          <Button
            key={item}
            type="button"
            variant={isActive ? "default" : "outline"}
            onClick={() => onPageChange(item)}
            className={cn("h-9 rounded-full px-4", isActive && "pointer-events-none")}
            aria-current={isActive ? "page" : undefined}
          >
            {item}
          </Button>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, safeCurrent + 1))}
        disabled={safeCurrent === totalPages}
        className="h-9 w-9 rounded-full"
        aria-label="Próxima página"
      >
        {">"}
      </Button>
    </nav>
  );
}

