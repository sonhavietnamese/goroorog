import { Elysia, t } from 'elysia'
import { cron } from '@elysiajs/cron'
import { get, ref, set } from 'firebase/database'
import { database } from '@/libs/firebase'
import { generateResouceId, randomInRange } from '@/libs/utils'

const app = new Elysia({ prefix: '/api' })
  .use(
    cron({
      name: 'heartbeat',
      pattern: '*/10 * * * * *',
      run() {
        console.log('Heartbeat')
      },
    }),
  )
  .use(
    cron({
      name: 'spawn-resource',
      pattern: '*/10 * * * * *',
      async run() {
        const resourcesRef = ref(database, 'resources')
        const resourcesSnapshot = await get(resourcesRef)
        const resourcesCount = resourcesSnapshot.exists() ? Object.keys(resourcesSnapshot.val()).length : 0

        if (resourcesCount >= 10) {
          console.log('Max resources reached, skipping spawn')
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
      },
    }),
  )
  .get('/', () => 'hello Next')
  .post('/', ({ body }) => body, {
    body: t.Object({
      name: t.String(),
    }),
  })

export const GET = app.handle
export const POST = app.handle
