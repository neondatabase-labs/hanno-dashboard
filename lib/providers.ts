import { Client } from '@neondatabase/serverless'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { comparePassword, generateRandomString, hashPassword } from './credentials'

export default [
  Google,
  Credentials({
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
      const client = new Client({ connectionString: process.env.DATABASE_URL })
      if (!credentials.email || typeof credentials.email !== 'string' || !credentials.password || typeof credentials.password !== 'string') return null
      const randomizedPassword = generateRandomString(credentials.password)
      const { rows } = await client.query(`SELECT * FROM users where email = $1 from LIMIT 1`, [credentials.email])
      const userByEmail = rows[0]
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
        const { rows: userRow } = await client.query(`INSERT INTO users (name, email, image, password) VALUES ($1, $2, $3, $4) RETURNING name, email, image`, [
          null,
          credentials.email,
          null,
          randomizedPassword,
        ])
        return userRow[0]
      }
    },
  }),
]
