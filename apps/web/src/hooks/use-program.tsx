import { PLAYER_SKILLS, PLAYER_STATS, RESOURCES } from '@/configs/base-stats'
import { BOSS_PUBLIC_KEY } from '@/configs/boss'
import { SEEDS } from '@/configs/seeds'
import type { Goroorog } from '@/idl/goroorog'
import idl from '@/idl/goroorog.json'
import { GORBAGANA_CONNECTION } from '@/libs/gorbagana'
import { parseSecretKey } from '@/libs/utils'
import { useBoss } from '@/stores/boss'
import { useDelegate } from '@/stores/delegate'
import { usePlayer, type HistoryAccount, type ResourceAccount, type SkillAccount, type StatAccount } from '@/stores/player'
import { AnchorProvider, BN, Program, type Wallet } from '@coral-xyz/anchor'
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { useMemo } from 'react'

export const useProgram = () => {
  const wallet = useAnchorWallet()
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  const { skills, stats, resources, history, setSkills, setStats, setResources, setHistory } = usePlayer()
  const { skills: bossSkills, stats: bossStats, setSkills: setBossSkills, setStats: setBossStats } = useBoss()
  const { keypair: localKeypair } = useDelegate()

  const provider = useMemo(() => new AnchorProvider(connection, wallet as Wallet, { commitment: 'finalized' }), [connection, wallet])
  const program = useMemo(() => new Program<Goroorog>(idl, provider), [provider])

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

    const createHistoryIx = await program.methods
      .createHistory(new BN(0))
      .accounts({
        payer: payer.publicKey,
        from: playerPDA,
        to: BOSS_PUBLIC_KEY,
      })
      .instruction()

    transaction.add(createHistoryIx)
    console.log('✓ Added create history instruction')

    console.log(`- Total instructions: ${transaction.instructions.length}`)

    // Get recent blockhash and its last valid height
    const { blockhash, lastValidBlockHeight } = await GORBAGANA_CONNECTION.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payer.publicKey

    // Sign and send transaction
    const message = transaction.compileMessage()
    const versionedTransaction = new VersionedTransaction(message)
    versionedTransaction.sign([payer])
    const signature = await GORBAGANA_CONNECTION.sendTransaction(versionedTransaction)
    console.log('Transaction signature:', signature)

    // Wait for confirmation
    const confirmation = await GORBAGANA_CONNECTION.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'finalized')
    console.log('Confirmation result:', confirmation)
  }

  async function fetchPlayerData() {
    if (!publicKey || !localKeypair?.secretKey) return { skills: {}, stats: {}, resources: {}, history: {} }

    const payer = parseSecretKey(localKeypair.secretKey)

    if (Object.keys(skills).length > 0 && Object.keys(stats).length > 0 && Object.keys(resources).length > 0 && Object.keys(history).length > 0) {
      return { skills, stats, resources, history }
    }

    const [playerPDA] = PublicKey.findProgramAddressSync([SEEDS.PLAYERS, publicKey.toBuffer(), payer.publicKey.toBuffer()], program.programId)

    const skillsRequest = program.account.skills.all([
      {
        memcmp: {
          offset: 8, // discriminator (8 bytes)
          bytes: playerPDA.toBase58(), // authority
        },
      },
    ])
    console.log(skillsRequest)
    const statsRequest = program.account.stats.all([
      {
        memcmp: {
          offset: 8, // discriminator (8 bytes)
          bytes: playerPDA.toBase58(), // authority
        },
      },
    ])
    console.log(statsRequest)
    const resourcesRequest = program.account.resources.all([
      {
        memcmp: {
          offset: 8, // discriminator (8 bytes)
          bytes: playerPDA.toBase58(), // authority
        },
      },
    ])
    const historyRequest = program.account.history.all([
      {
        memcmp: {
          offset: 8, // discriminator (8 bytes)
          bytes: playerPDA.toBase58(), // authority
        },
      },
    ])

    const [skillsResponse, statsResponse, resourcesResponse, historyResponse] = await Promise.all([
      skillsRequest,
      statsRequest,
      resourcesRequest,
      historyRequest,
    ])

    const computedSkills = skillsResponse.reduce(
      (acc, skill) => {
        acc[skill.account.skillId] = skill.account
        return acc
      },
      {} as Record<string, SkillAccount>,
    )

    const computedStats = statsResponse.reduce(
      (acc, stat) => {
        acc[stat.account.statId] = stat.account
        return acc
      },
      {} as Record<string, StatAccount>,
    )

    const computedResources = resourcesResponse.reduce(
      (acc, resource) => {
        acc[resource.account.resourceId] = resource.account
        return acc
      },
      {} as Record<string, ResourceAccount>,
    )

    const computedHistory = historyResponse.reduce(
      (acc, history) => {
        acc[1] = history.account
        return acc
      },
      {} as Record<string, HistoryAccount>,
    )

    setSkills(computedSkills)
    setStats(computedStats)
    setResources(computedResources)
    setHistory(computedHistory)

    return { skills: computedSkills, stats: computedStats, resources: computedResources }
  }

  async function fetchBossData() {
    if (Object.keys(bossSkills).length > 0 && Object.keys(bossStats).length > 0) {
      return { skills: bossSkills, stats: bossStats }
    }

    const skillsRequest = program.account.skills.all([
      {
        memcmp: {
          offset: 8, // discriminator (8 bytes)
          bytes: BOSS_PUBLIC_KEY.toBase58(), // authority
        },
      },
    ])
    const statsRequest = program.account.stats.all([
      {
        memcmp: {
          offset: 8, // discriminator (8 bytes)
          bytes: BOSS_PUBLIC_KEY.toBase58(), // authority
        },
      },
    ])

    const [skillsResponse, statsResponse] = await Promise.all([skillsRequest, statsRequest])

    const computedSkills = skillsResponse.reduce(
      (acc, skill) => {
        acc[skill.account.skillId] = skill.account
        return acc
      },
      {} as Record<string, SkillAccount>,
    )

    const computedStats = statsResponse.reduce(
      (acc, stat) => {
        acc[stat.account.statId] = stat.account
        return acc
      },
      {} as Record<string, StatAccount>,
    )

    setBossSkills(computedSkills)
    setBossStats(computedStats)

    return { skills: computedSkills, stats: computedStats }
  }

  async function updateHistory() {
    if (!publicKey || !localKeypair?.secretKey) return

    const payer = parseSecretKey(localKeypair.secretKey)

    const [playerPDA] = PublicKey.findProgramAddressSync([SEEDS.PLAYERS, publicKey.toBuffer(), payer.publicKey.toBuffer()], program.programId)
    const [historyPDA] = PublicKey.findProgramAddressSync([SEEDS.HISTORY, playerPDA.toBuffer(), BOSS_PUBLIC_KEY.toBuffer()], program.programId)

    const transaction = new Transaction()

    const updateHistoryIx = await program.methods
      .updateHistory([new BN(1000)])
      .accounts({
        payer: payer.publicKey,
        owner: playerPDA,
        history: historyPDA,
      })
      .instruction()

    transaction.add(updateHistoryIx)

    const { blockhash } = await GORBAGANA_CONNECTION.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payer.publicKey

    const message = transaction.compileMessage()
    const versionedTransaction = new VersionedTransaction(message)
    versionedTransaction.sign([payer])
    const signature = await GORBAGANA_CONNECTION.sendTransaction(versionedTransaction)
    console.log('Transaction signature:', signature)
  }

  async function getHistory() {
    if (!publicKey || !localKeypair?.secretKey) return

    const payer = parseSecretKey(localKeypair.secretKey)

    const [playerPDA] = PublicKey.findProgramAddressSync([SEEDS.PLAYERS, publicKey.toBuffer(), payer.publicKey.toBuffer()], program.programId)

    const historyRequest = program.account.history.all([
      {
        memcmp: {
          offset: 8, // discriminator (8 bytes)
          bytes: playerPDA.toBase58(), // authority
        },
      },
    ])

    const [historyResponse] = await Promise.all([historyRequest])

    const computedHistory = historyResponse.reduce(
      (acc, history) => {
        acc[1] = history.account
        return acc
      },
      {} as Record<string, HistoryAccount>,
    )

    setHistory(computedHistory)

    return computedHistory
  }

  function getPlayerPDA() {
    if (!publicKey || !localKeypair?.secretKey) return

    const payer = parseSecretKey(localKeypair.secretKey)

    const [playerPDA] = PublicKey.findProgramAddressSync([SEEDS.PLAYERS, publicKey.toBuffer(), payer.publicKey.toBuffer()], program.programId)

    return playerPDA
  }

  async function getLeaderboard() {
    const historyRequest = program.account.history.all([
      {
        memcmp: {
          offset: 8 + 32 + 32, // discriminator (8 bytes)
          bytes: BOSS_PUBLIC_KEY.toBase58(), // authority
        },
      },
    ])

    const [historyResponse] = await Promise.all([historyRequest])
    return historyResponse.map((history) => ({
      address: history.account.from.toBase58(),
      value: history.account.value,
    }))
  }

  return { program, fetchPlayerData, fetchBossData, createPlayer, updateHistory, getHistory, getLeaderboard, getPlayerPDA }
}
