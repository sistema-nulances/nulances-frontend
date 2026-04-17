"use client";

import { useEffect } from "react";

/**
 * Garante que o shell do admin tenha apenas o scroll interno do painel,
 * evitando um segundo scroll no documento (`html/body`).
 */
export function AdminScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.height = "100vh";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
    };
  }, []);

  return null;
}
