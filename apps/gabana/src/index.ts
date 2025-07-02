import cron from '@elysiajs/cron'
import { Elysia } from 'elysia'
import { get, ref, set, update } from 'firebase/database'
import { database } from './libs/firebase'
import { generatePlayerSkill, generateResouceId, generateSkillId, randomInRange } from './libs/utils'

const app = new Elysia()
  .use(
    cron({
      name: 'spawn-resource',
      pattern: '*/10 * * * * *',
      async run() {
        console.log('[GABANA] Spawning resource')
        const resourcesRef = ref(database, 'resources')
        const resourcesSnapshot = await get(resourcesRef)
        const resourcesCount = resourcesSnapshot.exists() ? Object.keys(resourcesSnapshot.val()).length : 0

        if (resourcesCount >= 50) {
          console.log('[GABANA][XX] Max resources reached, skipping spawn')
          return
        }

        set(ref(database, 'resources/' + Date.now()), {
          id: generateResouceId(),
          createdAt: new Date().toISOString(),
          position: {
            x: randomInRange(-50, 50),
            y: 0,
            z: randomInRange(-50, 50),
          },
        })

        console.log('[GABANA][OO] Spawned resource')
      },
    }),
  )
  .use(
    cron({
      name: 'boss-skill',
      pattern: '*/5 * * * * *',
      async run() {
        console.log('[BOSS] Skill')

        const skill = generateSkillId()

        set(ref(database, 'boss'), {
          skill,
        })

        console.log('[BOSS][OO] Updated skill')
      },
    }),
  )
  .use(
    cron({
      name: 'player-skill',
      pattern: '*/4 * * * * *',
      async run() {
        console.log('[PLAYER] Skill')

        const skill = generatePlayerSkill()

        // delete all skills with key is timestamp less than 10 seconds
        const skillsRef = ref(database, 'skills')
        const skillsSnapshot = await get(skillsRef)
        const skills = skillsSnapshot.val()
        const keysToRemove = Object.keys(skills).filter((key) => Date.now() - Number(key) < 5000)
        if (keysToRemove.length > 0) {
          const updates: Record<string, any> = {}
          keysToRemove.forEach((key) => {
            updates[`skills/${key}`] = null
          })
          update(ref(database), updates)
        }

        const timestamp = Date.now()

        set(ref(database, 'skills/' + timestamp), {
          ...skill,
          id: `${skill.id}-${timestamp}-bot`,
          position: {
            x: randomInRange(-10, 10),
            y: 0,
            z: randomInRange(-10, 10),
          },
          timestamp,
        })

        console.log('[PLAYER][OO] Spawned skill')
      },
    }),
  )
  .get('/', () => 'Hello Elysia')
  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
