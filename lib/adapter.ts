import { type Adapter } from '@auth/core/adapters'
import PostgresAdapter from '@auth/pg-adapter'
import { Pool, neonConfig } from '@neondatabase/serverless'

neonConfig.poolQueryViaFetch = true

export const getAdapter = (): Adapter => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
  return PostgresAdapter(pool)
}
