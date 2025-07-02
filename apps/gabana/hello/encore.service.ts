import { api } from 'encore.dev/api'
import { secret } from 'encore.dev/config'
import { CronJob } from 'encore.dev/cron'
import { Service } from 'encore.dev/service'
import { initializeApp } from 'firebase/app'
import { get, getDatabase, ref, set } from 'firebase/database'

const FIREBASE_API_KEY = secret('FIREBASE_API_KEY')
const FIREBASE_AUTH_DOMAIN = secret('FIREBASE_AUTH_DOMAIN')
const FIREBASE_DATABASE_URL = secret('FIREBASE_DATABASE_URL')
const FIREBASE_PROJECT_ID = secret('FIREBASE_PROJECT_ID')
const FIREBASE_STORAGE_BUCKET = secret('FIREBASE_STORAGE_BUCKET')
const FIREBASE_MESSAGING_SENDER_ID = secret('FIREBASE_MESSAGING_SENDER_ID')
const FIREBASE_APP_ID = secret('FIREBASE_APP_ID')

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY(),
  authDomain: FIREBASE_AUTH_DOMAIN(),
  databaseURL: FIREBASE_DATABASE_URL(),
  projectId: FIREBASE_PROJECT_ID(),
  storageBucket: FIREBASE_STORAGE_BUCKET(),
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID(),
  appId: FIREBASE_APP_ID(),
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export function generateResouceId() {
  const resourceIds = ['1', '2']
  return resourceIds[Math.floor(Math.random() * resourceIds.length)]
}

export function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export const spawnResource = api({}, async () => {
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
})

const _ = new CronJob('spawn-resource', {
  title: 'Spawn resource',
  every: '10s',
  endpoint: spawnResource,
})

export default new Service('hello')
