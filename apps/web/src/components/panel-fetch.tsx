import { SEEDS } from '@/configs/seeds'
import { useProgram } from '@/hooks/use-program'
import { GORBAGANA_CONNECTION } from '@/libs/gorbagana'
import { parseSecretKey } from '@/libs/utils'
import { useDelegate } from '@/stores/delegate'
import { useOnboarding } from '@/stores/onboarding'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { useEffect } from 'react'

const PLAYER_STATS = [
  { id: 1, base: new BN(2_000_000_000), level: new BN(1) }, // Health
  { id: 2, base: new BN(100_000_000), level: new BN(1) }, // Attack
  { id: 3, base: new BN(100_000_000), level: new BN(1) }, // Defense
  { id: 4, base: new BN(100_000_000), level: new BN(1) }, // Speed
]

const PLAYER_SKILLS = [
  { id: 1, base: new BN(100_000_000), level: new BN(1) },
  { id: 2, base: new BN(100_000_000), level: new BN(1) },
  { id: 3, base: new BN(100_000_000), level: new BN(1) },
]

const RESOURCES = [
  { id: 1, amount: new BN(1) },
  { id: 2, amount: new BN(1) },
]

export default function PanelFetch() {
  const { program, fetchPlayerData } = useProgram()
  const { keypair: localKeypair } = useDelegate()
  const { publicKey } = useWallet()
  const { setStep } = useOnboarding()

  const createPlayer = async () => {
    if (!publicKey || !localKeypair) return

    const payer = parseSecretKey(localKeypair.secretKey)

    const transaction = new Transaction()

    const [playerPDA] = PublicKey.findProgramAddressSync([SEEDS.PLAYERS, publicKey.toBuffer(), payer.publicKey.toBuffer()], program.programId)

    // 1. Create Player instruction
    const createPlayerIx = await program.methods
      .createPlayer()
      .accounts({
        payer: payer.publicKey,
        owner: publicKey,
      })
      .instruction()

    transaction.add(createPlayerIx)
    console.log('✓ Added create player instruction')

    // 2. Create 4 Stats instructions
    for (const stat of PLAYER_STATS) {
      const createStatIx = await program.methods
        .createStat(stat.id, [stat.base, stat.level])
        .accounts({
          payer: payer.publicKey,
          owner: playerPDA,
        })
        .instruction()

      transaction.add(createStatIx)
      console.log(`✓ Added create stat instruction for stat ID ${stat.id}`)
    }

    // 3. Create 3 Skills instructions
    for (const skill of PLAYER_SKILLS) {
      const createSkillIx = await program.methods
        .createSkill(skill.id, [skill.base, skill.level])
        .accounts({
          payer: payer.publicKey,
          owner: playerPDA,
        })
        .instruction()

      transaction.add(createSkillIx)
      console.log(`✓ Added create skill instruction for skill ID ${skill.id}`)
    }

    // 4. Create 2 Resources instructions
    for (const resource of RESOURCES) {
      const createResourceIx = await program.methods
        .createResource(resource.id, [resource.amount])
        .accounts({
          payer: payer.publicKey,
          owner: playerPDA,
        })
        .instruction()

      transaction.add(createResourceIx)
      console.log(`✓ Added create resource instruction for resource ID ${resource.id}`)
    }

    console.log('\n📦 Transaction Summary:')
    console.log(`- 1 create player instruction`)
    console.log(`- 4 create stats instructions`)
    console.log(`- 3 create skills instructions`)
    console.log(`- Total instructions: ${transaction.instructions.length}`)

    // Get recent blockhash and its last valid height
    const { blockhash, lastValidBlockHeight } = await GORBAGANA_CONNECTION.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payer.publicKey

    // Sign and send transaction
    console.log('\n🚀 Sending transaction...')
    const message = transaction.compileMessage()
    const versionedTransaction = new VersionedTransaction(message)
    versionedTransaction.sign([payer])
    const signature = await GORBAGANA_CONNECTION.sendTransaction(versionedTransaction)
    console.log('Transaction signature:', signature)

    // Wait for confirmation
    const confirmation = await GORBAGANA_CONNECTION.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'finalized')
    console.log('Confirmation result:', confirmation)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey || !localKeypair) return

      try {
        const payer = parseSecretKey(localKeypair.secretKey)
        const playerPDA = PublicKey.findProgramAddressSync([SEEDS.PLAYERS, publicKey.toBuffer(), payer.publicKey.toBuffer()], program.programId)[0]

        const player = await program.account.players.fetch(playerPDA)
        const { skills, stats, resources } = await fetchPlayerData(publicKey)

        console.log(player.authority.toString())
        console.log(skills)
        console.log(stats)
        console.log(resources)
        setStep('start')
      } catch (error) {
        if (error instanceof Error && error.message.includes('Account does not exist')) {
          await createPlayer()
          const { skills, stats, resources } = await fetchPlayerData(publicKey)

          console.log(skills)
          console.log(stats)
          console.log(resources)
          setStep('start')
          return
        } else {
          console.error(error)
        }
      }
    }

    fetchData()
  }, [program, publicKey, localKeypair])

  return <span className='text-white text-[32px] text-player-panel'>Fetching...</span>
}
