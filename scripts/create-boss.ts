import { PublicKey, Connection, Keypair, Transaction, SystemProgram, VersionedTransaction } from '@solana/web3.js'
import { AnchorProvider, Program, Wallet, BN } from '@coral-xyz/anchor'
import { Goroorog } from '../target/types/goroorog'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'

// Load IDL using require to avoid TypeScript module resolution issues
const idl = require('../target/idl/goroorog.json')

// Program ID
// const programId = new PublicKey('5MZ8ZN4VwEiC1XeoYaMmDcud9p5tsGtx2B1MDwmu2dz2')
const programId = new PublicKey('7FyBUa4ZCA2krXYmSkJW6jdfZGVUpF6wTbYNUE5jRFyq')

const privateKey = process.env.PRIVATE_KEY
const keypair = Keypair.fromSecretKey(bs58.decode(privateKey))

// RPC endpoint - you can change this to your preferred RPC
// const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
const connection = new Connection('https://rpc.gorbagana.wtf', 'confirmed')

// BOSS Stats configuration based on comments:
// - Health ID: 1, Health: 2_000_000_000, Level: 1
// - Attack ID: 2, Attack: 100_000_000, Level: 1
// - Defense ID: 3, Defense: 100_000_000, Level: 1
// - Speed ID: 4, Speed: 100_000_000, Level: 1
const BOSS_STATS = [
  { id: 1, base: new BN(2_000_000_000), level: new BN(1) }, // Health
  { id: 2, base: new BN(100_000_000), level: new BN(1) }, // Attack
  { id: 3, base: new BN(100_000_000), level: new BN(1) }, // Defense
  { id: 4, base: new BN(100_000_000), level: new BN(1) }, // Speed
]

// BOSS Skills configuration based on comments:
// - Skill ID: 1, Damage: 100_000_000, Level: 1
// - Skill ID: 2, Damage: 100_000_000, Level: 1
// - Skill ID: 3, Damage: 100_000_000, Level: 1
const BOSS_SKILLS = [
  { id: 1, base: new BN(100_000_000), level: new BN(1) },
  { id: 2, base: new BN(100_000_000), level: new BN(1) },
  { id: 3, base: new BN(100_000_000), level: new BN(1) },
]

const createBossWithStatsAndSkills = async () => {
  try {
    // Load wallet - in a real script, you'd load from file or environment
    // For demo purposes, creating a new keypair
    const payer = keypair
    console.log('Payer public key:', payer.publicKey.toString())

    // Create wallet and provider
    const wallet = new Wallet(payer)
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })

    // Load program from IDL
    const program = new Program(idl as Goroorog, provider)

    // Derive PDA for boss
    const bossPDA = PublicKey.findProgramAddressSync([Buffer.from('boss'), Buffer.from([1])], programId)

    console.log('Boss PDA:', bossPDA[0].toString())

    // Create main transaction
    const transaction = new Transaction()

    // 1. Create Boss instruction
    const createBossIx = await program.methods
      .createBoss(1)
      .accounts({
        payer: payer.publicKey,
        boss: bossPDA[0],
        systemProgram: SystemProgram.programId,
      })
      .instruction()

    transaction.add(createBossIx)
    console.log('✓ Added create boss instruction')

    // 2. Create 4 Stats instructions
    for (const stat of BOSS_STATS) {
      const [statPda] = PublicKey.findProgramAddressSync([Buffer.from('stats'), Buffer.from([stat.id]), bossPDA[0].toBuffer()], programId)

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

    // 3. Create 3 Skills instructions
    for (const skill of BOSS_SKILLS) {
      const [skillPda] = PublicKey.findProgramAddressSync([Buffer.from('skills'), Buffer.from([skill.id]), bossPDA[0].toBuffer()], programId)

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

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payer.publicKey

    // Sign and send transaction
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

// Export the function for use in other scripts
export { createBossWithStatsAndSkills }

// Run the script if called directly
if (require.main === module) {
  createBossWithStatsAndSkills()
}
