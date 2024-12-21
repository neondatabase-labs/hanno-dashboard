'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function () {
  const { data: session, status, update } = useSession()
  const [userData, setUserData] = useState<{ [k: string]: string }>({ name: '', image: '' })
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prevData) => ({ ...prevData, [name]: value }))
  }
  const handleUpdate = (field: string) => {
    fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: userData[field] }),
    }).then((res) => {
      if (res.ok) fetch('/api/update').then(update)
    })
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
        <div className="flex flex-col gap-y-3">
          <div className="w-max flex flex-col gap-y-3">
            <label htmlFor="name">Name</label>
            <Input type="text" id="name" name="name" value={userData.name} onChange={handleChange} />
            <Button className="mt-3" onClick={() => handleUpdate('name')}>
              Save
            </Button>
          </div>
          <div className="w-max flex flex-col gap-y-3">
            <label htmlFor="email">Email</label>
            <Input disabled type="email" id="email" name="email" value={session.user.email} />
          </div>
          <div className="w-max flex flex-col gap-y-3">
            <label htmlFor="image">Image</label>
            <Avatar>
              <AvatarImage src={userData.image} />
              <AvatarFallback>
                {userData.name
                  .split(' ')
                  .map((i) => i[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <Input type="text" id="image" name="image" value={userData.image} onChange={handleChange} />
            <Button className="mt-3" onClick={() => handleUpdate('image')}>
              Save
            </Button>
          </div>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      ) : (
        <button onClick={() => signIn()}>Sign in</button>
      )}
    </>
  )
}
