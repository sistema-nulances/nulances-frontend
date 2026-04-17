"use client";

import * as React from "react";

const QUERY = "(max-width: 767px)";

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** true em viewports &lt; md (mobile / app). */
export function useIsMobileMaxMd() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
