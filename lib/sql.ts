import { neon, neonConfig } from '@neondatabase/serverless'

neonConfig.poolQueryViaFetch = true

if (!process.env.DATABASE_URL) throw new Error(`DATABASE_URL environment variable is not found.`)
export default neon(process.env.DATABASE_URL)
