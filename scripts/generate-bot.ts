import { Keypair } from '@solana/web3.js'
import fs from 'fs'

const bots = []

for (let i = 0; i < 10; i++) {
  const keypair = Keypair.generate()
  bots.push({
    id: `bot-${i}`,
    privateKey: keypair.secretKey.toString(),
  })
}

console.log(bots)

fs.writeFileSync('bots.json', JSON.stringify(bots, null, 2))
