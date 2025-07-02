import { Keypair } from '@solana/web3.js'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as THREE from 'three'

export function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function formatWalletAddress(address: string, length = 6) {
  if (!address) {
    return 'Anonytrash'
  }

  if (address.length < length * 2 + 3) {
    return address
  }

  return address.slice(0, length) + '...' + address.slice(-length)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomSpawnPoint() {
  return new THREE.Vector3(randomInRange(-15, 15), 0, randomInRange(10, 20))
}

export function distance(a: [number, number, number], b: [number, number, number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
}

export function parseSecretKey(secretKey: string) {
  const parsedSecretKey = secretKey.split(',').map((num) => Number(num))
  return Keypair.fromSecretKey(Uint8Array.from(parsedSecretKey))
}

export function abbreviateNumber(n: number, decPlaces = 2, units: string[] = ['k', 'm', 'b', 't']): string | number {
  const isNegative = n < 0
  const abbreviatedNumber = _abbreviate(Math.abs(n), decPlaces, units)
  return isNegative ? `-${abbreviatedNumber}` : abbreviatedNumber
}

function _abbreviate(num: number, decimalPlaces: number, units: string[]): string | number {
  const factor = 10 ** decimalPlaces

  for (let i = units.length - 1; i >= 0; i--) {
    const size = 10 ** ((i + 1) * 3)

    if (size <= num) {
      let result = Math.round((num * factor) / size) / factor

      if (result === 1000 && i < units.length - 1) {
        result = 1
        i++
      }

      return `${result}${units[i]}`
    }
  }

  return num
}

export function generateResouceId() {
  const resourceIds = ['1', '2']
  return resourceIds[Math.floor(Math.random() * resourceIds.length)]
}
