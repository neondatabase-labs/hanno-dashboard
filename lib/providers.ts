import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { getAdapter } from './adapter'
import { comparePassword, generateRandomString, getPassword, hashPassword, setPassword } from './credentials'

export default [
  Google,
  Credentials({
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
      const adapter = getAdapter()
      if (!credentials.email || typeof credentials.email !== 'string') return null
      if (!credentials.password || typeof credentials.password !== 'string') return null
      // Add your own email validation logic
      const doesUserExist = await getPassword(credentials.email)
      // Sign In
      if (Boolean(doesUserExist)) {
        // Generate a randomized password based on the user's input password
        const randomizedPassword = generateRandomString(credentials.password)
        // // Hash the randomized password
        const hashedPassword = await hashPassword(randomizedPassword)
        // // Compare the hashed randomized password with the original password
        const isPasswordCorrect = await comparePassword(doesUserExist, hashedPassword)
        // If the passwords match, create a session cookie for the user
        if (isPasswordCorrect) return { email: credentials.email }
        return null
      }
      // Sign Up
      else {
        const ifEmailExists = await adapter.getUserByEmail?.(credentials.email)
        if (Boolean(ifEmailExists)) return null
        const randomizedPassword = generateRandomString(credentials.password)
        await Promise.all([
          setPassword(credentials.email, randomizedPassword),
          adapter.createUser?.({ email: credentials.email, id: performance.now().toString(), emailVerified: null }),
        ])
        return {
          email: credentials.email,
        }
      }
    },
  }),
]
