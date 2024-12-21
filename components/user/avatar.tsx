'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function () {
  const { data, status } = useSession()
  return status === 'authenticated' && data?.user?.name ? (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {(data?.user?.name || data?.user?.image) && (
          <Avatar className="h-8 w-8">
            {data?.user?.image && <AvatarImage src={data.user.image} />}
            <AvatarFallback>
              {data.user.name
                .split(' ')
                .map((i) => i[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/">Home</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/users">Users</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ redirectTo: '/' })}>
          <button>Sign out</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button onClick={() => signIn()}>Sign in</Button>
  )
}
