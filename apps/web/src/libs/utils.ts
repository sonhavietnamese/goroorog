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
