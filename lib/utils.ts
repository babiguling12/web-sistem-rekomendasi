import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryByElevation(elevation: number): string {
  if (elevation > 700) return 'Dataran Tinggi';
  if (elevation < 100) return 'Perairan';
  return 'Dataran Rendah';
}

export function mapWeatherCodeToDescription(code: number): 'Cerah' | 'Mendung' | 'Hujan' {
  if ([0, 1].includes(code)) return 'Cerah';
  if ([2, 3].includes(code)) return 'Mendung';
  return 'Hujan';
}
