import { twMerge } from "tailwind-merge";

export function cn(...classes: Array<string | false | null | undefined>) {
  const list = classes.filter(Boolean) as string[];
  return list.length ? twMerge(...list) : "";
}
