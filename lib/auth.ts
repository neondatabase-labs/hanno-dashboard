import NextAuth from 'next-auth'
import { getAdapter } from './adapter'
import providers from './providers'

export const { handlers, signIn, signOut, auth } = NextAuth(() => ({
  providers,
  adapter: getAdapter(),
}))
