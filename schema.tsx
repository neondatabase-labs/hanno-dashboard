import { neon, neonConfig } from '@neondatabase/serverless'
import 'dotenv/config'

neonConfig.poolQueryViaFetch = true

async function prepare() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL environment variable not found.')
  const sql = neon(process.env.DATABASE_URL)
  await Promise.all([
    sql`CREATE TABLE IF NOT EXISTS verification_token (identifier TEXT NOT NULL, expires TIMESTAMPTZ NOT NULL, token TEXT NOT NULL, PRIMARY KEY (identifier, token));`,
    sql`CREATE TABLE IF NOT EXISTS accounts (id SERIAL, "userId" INTEGER NOT NULL, type VARCHAR(255) NOT NULL, provider VARCHAR(255) NOT NULL, "providerAccountId" VARCHAR(255) NOT NULL, refresh_token TEXT, access_token TEXT, expires_at BIGINT, id_token TEXT, scope TEXT, session_state TEXT, token_type TEXT, PRIMARY KEY (id));`,
    sql`CREATE TABLE IF NOT EXISTS sessions (id SERIAL, "userId" INTEGER NOT NULL, expires TIMESTAMPTZ NOT NULL, "sessionToken" VARCHAR(255) NOT NULL, PRIMARY KEY (id));`,
    sql`CREATE TABLE IF NOT EXISTS users (id SERIAL, name VARCHAR(255), email VARCHAR(255), "emailVerified" TIMESTAMPTZ, image TEXT, password TEXT, PRIMARY KEY (id));`,
  ])
  console.log('Created schema succesfully.')
}

prepare()
