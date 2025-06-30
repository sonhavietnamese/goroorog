import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Goroorog } from '../target/types/goroorog'
import { BN } from '@coral-xyz/anchor'

describe('test-2', () => {
  // Configure the client to use the custom RPC endpoint
  const connection = new anchor.web3.Connection('https://rpc.gorbagana.wtf', 'confirmed')
  const wallet = anchor.AnchorProvider.env().wallet
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  })
  anchor.setProvider(provider)

  const program = anchor.workspace.goroorog as Program<Goroorog>

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.methods.createBoss(new BN(100), new BN(10)).rpc()
    console.log('Your transaction signature', tx)
  })
})
