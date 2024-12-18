'use client'

import { Input } from '@/components/ui/input'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function () {
  const { data: session, status, update } = useSession()
  const [userData, setUserData] = useState<{ [k: string]: string }>({})
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prevData) => ({ ...prevData, [name]: value }))
  }
  const handleUpdate = async (field: string) => {
    const response = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: userData[field] }),
    })
    if (response.ok) {
      fetch('/api/update').then(update)
    }
  }
  useEffect(() => {
    if (status !== 'loading') {
      setUserData({
        name: session?.user?.name || '',
        image: session?.user?.image || '',
      })
    }
  }, [status])
  return (
    <>
      {status === 'loading' ? (
        <span>Loading...</span>
      ) : session?.user?.email ? (
        <div>
          <div>
            <label htmlFor="name">Name</label>
            <Input type="text" id="name" name="name" value={userData.name} onChange={handleChange} />
            <button onClick={() => handleUpdate('name')}>Save</button>
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <Input disabled type="email" id="email" name="email" value={session.user.email} />
          </div>
          <div>
            <label htmlFor="image">Image</label>
            <Input type="text" id="image" name="image" value={userData.image} onChange={handleChange} />
            <button onClick={() => handleUpdate('image')}>Save</button>
          </div>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      ) : (
        <Link href="/signin">Sign in</Link>
      )}
    </>
  )
}
