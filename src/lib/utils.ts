import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ellipsify(str: string, start = 4, end = 4) {
  return `${str.slice(0, start)}...${str.slice(-end)}`
}
