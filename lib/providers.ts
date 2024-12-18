import { neon, neonConfig } from '@neondatabase/serverless'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { comparePassword, generateRandomString, hashPassword } from './credentials'

neonConfig.poolQueryViaFetch = true

export default [
  Google,
  Credentials({
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
      if (!process.env.DATABASE_URL || !credentials.email || typeof credentials.email !== 'string' || !credentials.password || typeof credentials.password !== 'string') return null
      const randomizedPassword = generateRandomString(credentials.password)
      const sql = neon(process.env.DATABASE_URL)
      const [userByEmail] = await sql(`SELECT * FROM users where email = $1 LIMIT 1`, [credentials.email])
      if (userByEmail) {
        if (userByEmail.password) {
          const hashedPassword = await hashPassword(randomizedPassword)
          const isPasswordCorrect = await comparePassword(userByEmail.password, hashedPassword)
          if (isPasswordCorrect) {
            delete userByEmail['password']
            return userByEmail
          }
          throw new Error(`incorrect password for credentials.`)
        }
        throw new Error(`you are using some other authentication method already, but not credentials.`)
      } else {
        const [userRow] = await sql(`INSERT INTO users (name, email, image, password) VALUES ($1, $2, $3, $4) RETURNING name, email, image`, [
          null,
          credentials.email,
          null,
          randomizedPassword,
        ])
        return userRow
      }
    },
  }),
]
