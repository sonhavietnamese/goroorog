import { Connection } from '@solana/web3.js'

export const GORBAGANA_RPC_URL = 'https://rpc.gorbagana.wtf'
export const GORBAGANA_CONNECTION = new Connection(GORBAGANA_RPC_URL, { commitment: 'finalized' })
