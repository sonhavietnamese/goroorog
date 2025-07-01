import { SEEDS } from '@/configs/seeds'
import type { Goroorog } from '@/idl/goroorog'
import idl from '@/idl/goroorog.json'
import { parseSecretKey } from '@/libs/utils'
import { useDelegate } from '@/stores/delegate'
import { usePlayer, type ResourceAccount, type SkillAccount, type StatAccount } from '@/stores/player'
import { AnchorProvider, Program, type Wallet } from '@coral-xyz/anchor'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'

export const useProgram = () => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()

  const { skills, stats, resources, setSkills, setStats, setResources } = usePlayer()
  const { keypair: localKeypair } = useDelegate()

  const provider = useMemo(() => new AnchorProvider(connection, wallet as Wallet, { commitment: 'finalized' }), [connection, wallet])

  const program = useMemo(() => new Program<Goroorog>(idl, provider), [provider])

  async function fetchPlayerData(publicKey: PublicKey) {
    if (!localKeypair?.publicKey || !localKeypair?.secretKey) return { skills: {}, stats: {}, resources: {} }

    const payer = parseSecretKey(localKeypair.secretKey)

    if (Object.keys(skills).length > 0 && Object.keys(stats).length > 0 && Object.keys(resources).length > 0) {
      return { skills, stats, resources }
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

    const [skillsResponse, statsResponse, resourcesResponse] = await Promise.all([skillsRequest, statsRequest, resourcesRequest])

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

    setSkills(computedSkills)

    setStats(computedStats)
    setResources(computedResources)

    return { skills: computedSkills, stats: computedStats, resources: computedResources }
  }

  return { program, fetchPlayerData }
}
