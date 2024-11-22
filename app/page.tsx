'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function () {
  const { data: session, status } = useSession()
  return (
    <>
      {JSON.stringify({ session, status })}
      <Link href="/signin">Sign in</Link>
      <Link href="/signup">Sign up</Link>
    </>
  )
}
