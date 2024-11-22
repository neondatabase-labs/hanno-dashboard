'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function () {
  const { data: session, status } = useSession()
  return (
    <>
      {JSON.stringify({ session, status })}
      {!session && <Link href="/signin">Sign in</Link>}
      {session && <Link href="/signup">Sign up</Link>}
      {session && <button onClick={() => signOut()}>Sign out</button>}
    </>
  )
}
