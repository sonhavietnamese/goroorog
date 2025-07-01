import { PublicKey, Connection, Keypair, Transaction, SystemProgram, VersionedTransaction } from '@solana/web3.js'
import { AnchorProvider, Program, Wallet, BN } from '@coral-xyz/anchor'
import { Goroorog } from '../target/types/goroorog'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'

const idl = require('../target/idl/goroorog.json')

const programId = new PublicKey('7FyBUa4ZCA2krXYmSkJW6jdfZGVUpF6wTbYNUE5jRFyq')

const privateKey = process.env.PRIVATE_KEY
const keypair = Keypair.fromSecretKey(bs58.decode(privateKey))

const connection = new Connection('https://rpc.gorbagana.wtf', 'confirmed')

export const BOSS_STATS = [
  { id: 1, base: new BN(10_000_000_000), level: new BN(1) }, // Health
  { id: 2, base: new BN(1_000), level: new BN(1) }, // Damage
  { id: 3, base: new BN(1_000), level: new BN(1) }, // Speed
]

export const BOSS_SKILLS = [
  { id: 1, base: new BN(2_000), level: new BN(1) }, // Swipe
  { id: 2, base: new BN(5_000), level: new BN(1) }, // Jump
  { id: 3, base: new BN(1_000), level: new BN(1) }, // Scream
]

const createBossWithStatsAndSkills = async () => {
  try {
    const payer = keypair
    console.log('Payer public key:', payer.publicKey.toString())

    const wallet = new Wallet(payer)
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })

    const program = new Program(idl as Goroorog, provider)

    const bossPDA = PublicKey.findProgramAddressSync([Buffer.from('boss'), Buffer.from([3])], programId)

    console.log('Boss PDA:', bossPDA[0].toString())

    const transaction = new Transaction()

    const createBossIx = await program.methods
      .createBoss(3)
      .accounts({
        payer: payer.publicKey,
        boss: bossPDA[0],
        systemProgram: SystemProgram.programId,
      })
      .instruction()

    transaction.add(createBossIx)
    console.log('✓ Added create boss instruction')

    for (const stat of BOSS_STATS) {
      const [statPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('stats'), Buffer.from([stat.id]), bossPDA[0].toBuffer(), payer.publicKey.toBuffer()],
        programId,
      )

      const createStatIx = await program.methods
        .createStat(stat.id, [stat.base, stat.level])
        .accounts({
          payer: payer.publicKey,
          owner: bossPDA[0],
          stat: statPda,
          systemProgram: SystemProgram.programId,
        })
        .instruction()

      transaction.add(createStatIx)
      console.log(`✓ Added create stat instruction for stat ID ${stat.id}`)
    }

    for (const skill of BOSS_SKILLS) {
      const [skillPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('skills'), Buffer.from([skill.id]), bossPDA[0].toBuffer(), payer.publicKey.toBuffer()],
        programId,
      )

      const createSkillIx = await program.methods
        .createSkill(skill.id, [skill.base, skill.level])
        .accounts({
          payer: payer.publicKey,
          owner: bossPDA[0],
          skill: skillPda,
          systemProgram: SystemProgram.programId,
        })
        .instruction()

      transaction.add(createSkillIx)
      console.log(`✓ Added create skill instruction for skill ID ${skill.id}`)
    }

    console.log('\n📦 Transaction Summary:')
    console.log(`- 1 create boss instruction`)
    console.log(`- 4 create stats instructions`)
    console.log(`- 3 create skills instructions`)
    console.log(`- Total instructions: ${transaction.instructions.length}`)

    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payer.publicKey

    console.log('\n🚀 Sending transaction...')
    const message = transaction.compileMessage()
    const versionedTransaction = new VersionedTransaction(message)
    versionedTransaction.sign([payer])
    const signature = await connection.sendTransaction(versionedTransaction)
    console.log('Transaction signature:', signature)

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed')
    console.log('Confirmation result:', confirmation)

    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err)
    } else {
      console.log('✅ Transaction confirmed!')
      console.log('Boss created with stats and skills successfully!')
      console.log('Boss address:', bossPDA[0].toString())
    }
  } catch (error) {
    console.error('Error creating boss:', error)
  }
}

export { createBossWithStatsAndSkills }

if (require.main === module) {
  createBossWithStatsAndSkills()
}
