import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function formatWalletAddress(address: string, length = 6) {
  return address.slice(0, length) + '...' + address.slice(-length)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
