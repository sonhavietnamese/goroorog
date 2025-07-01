import { PublicKey, Connection, Keypair, Transaction, SystemProgram, VersionedTransaction } from '@solana/web3.js'
import { AnchorProvider, Program, Wallet, BN } from '@coral-xyz/anchor'
import { Goroorog } from '../target/types/goroorog'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'

// Load IDL using require to avoid TypeScript module resolution issues
const idl = require('./goroorog.json')

// Program ID
const programId = new PublicKey('5MZ8ZN4VwEiC1XeoYaMmDcud9p5tsGtx2B1MDwmu2dz2')

const privateKey = process.env.PRIVATE_KEY
const keypair = Keypair.fromSecretKey(bs58.decode(privateKey))

// RPC endpoint - you can change this to your preferred RPC
const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

// PLAYER Stats configuration based on comments:
// - Health ID: 1, Health: 2_000_000_000, Level: 1
// - Attack ID: 2, Attack: 100_000_000, Level: 1
// - Defense ID: 3, Defense: 100_000_000, Level: 1
// - Speed ID: 4, Speed: 100_000_000, Level: 1
const PLAYER_STATS = [
  { id: 1, base: new BN(2_000_000_000), level: new BN(1) }, // Health
  { id: 2, base: new BN(100_000_000), level: new BN(1) }, // Attack
  { id: 3, base: new BN(100_000_000), level: new BN(1) }, // Defense
  { id: 4, base: new BN(100_000_000), level: new BN(1) }, // Speed
]

// PLAYER Skills configuration based on comments:
// - Skill ID: 1, Damage: 100_000_000, Level: 1
// - Skill ID: 2, Damage: 100_000_000, Level: 1
// - Skill ID: 3, Damage: 100_000_000, Level: 1
const PLAYER_SKILLS = [
  { id: 1, base: new BN(100_000_000), level: new BN(1) },
  { id: 2, base: new BN(100_000_000), level: new BN(1) },
  { id: 3, base: new BN(100_000_000), level: new BN(1) },
]

const RESOURCES = [
  { id: 1, amount: new BN(1) },
  { id: 2, amount: new BN(1) },
]

const createBossWithStatsAndSkills = async () => {
  try {
    // Load wallet - in a real script, you'd load from file or environment
    // For demo purposes, creating a new keypair
    const payer = keypair
    console.log('Payer public key:', payer.publicKey.toString())
    console.log('⚠️  Make sure this keypair has SOL for transaction fees!')

    // Create wallet and provider
    const wallet = new Wallet(payer)
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })

    // Load program from IDL
    const program = new Program(idl as Goroorog, provider)

    const owner = new Keypair().publicKey

    // Derive PDA for boss
    const playerPDA = PublicKey.findProgramAddressSync([Buffer.from('players'), owner.toBuffer()], programId)

    console.log('Player PDA:', playerPDA.toString())

    // Create main transaction
    const transaction = new Transaction()

    // 1. Create Boss instruction
    const createPlayerIx = await program.methods
      .createPlayer()
      .accounts({
        payer: payer.publicKey,
        player: playerPDA,
        owner,
        systemProgram: SystemProgram.programId,
      })
      .instruction()

    transaction.add(createPlayerIx)
    console.log('✓ Added create player instruction')

    // 2. Create 4 Stats instructions
    for (const stat of PLAYER_STATS) {
      const [statPda] = PublicKey.findProgramAddressSync([Buffer.from('stats'), Buffer.from([stat.id]), owner.toBuffer()], programId)

      const createStatIx = await program.methods
        .createStat(stat.id, [stat.base, stat.level])
        .accounts({
          payer: payer.publicKey,
          owner: owner,
          stat: statPda,
          systemProgram: SystemProgram.programId,
        })
        .instruction()

      transaction.add(createStatIx)
      console.log(`✓ Added create stat instruction for stat ID ${stat.id}`)
    }

    // 3. Create 3 Skills instructions
    for (const skill of PLAYER_SKILLS) {
      const [skillPda] = PublicKey.findProgramAddressSync([Buffer.from('skills'), Buffer.from([skill.id]), owner.toBuffer()], programId)

      const createSkillIx = await program.methods
        .createSkill(skill.id, [skill.base, skill.level])
        .accounts({
          payer: payer.publicKey,
          owner: owner,
          skill: skillPda,
          systemProgram: SystemProgram.programId,
        })
        .instruction()

      transaction.add(createSkillIx)
      console.log(`✓ Added create skill instruction for skill ID ${skill.id}`)
    }

    // 4. Create 2 Resources instructions
    for (const resource of RESOURCES) {
      const [resourcePda] = PublicKey.findProgramAddressSync([Buffer.from('resources'), Buffer.from([resource.id]), owner.toBuffer()], programId)

      const createResourceIx = await program.methods
        .createResource(resource.id, [resource.amount])
        .accounts({
          payer: payer.publicKey,
          owner: owner,
          resource: resourcePda,
          systemProgram: SystemProgram.programId,
        })
        .instruction()

      transaction.add(createResourceIx)
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
      console.log('Player created with stats and skills successfully!')
      console.log('Player address:', playerPDA.toString())
    }
  } catch (error) {
    console.error('Error creating player:', error)
  }
}

// Export the function for use in other scripts
export { createBossWithStatsAndSkills }

// Run the script if called directly
if (require.main === module) {
  createBossWithStatsAndSkills()
}
