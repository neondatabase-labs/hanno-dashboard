import PostgresAdapter from '@auth/pg-adapter'
import { Pool } from '@neondatabase/serverless'
import NextAuth from 'next-auth'
import providers from './providers'

export const { handlers, signIn, signOut, auth } = NextAuth(() => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return {
    providers,
    adapter: PostgresAdapter(pool),
  }
})
