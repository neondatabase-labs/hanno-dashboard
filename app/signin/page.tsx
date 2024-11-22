import { CSRFInput } from '@/app/csrf'
import Provider from '@/app/provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/auth'
import config from '@/lib/config'
import providers from '@/lib/providers'
import { Metadata } from 'next'
import { unstable_noStore } from 'next/cache'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export async function generateMetadata(): Promise<Metadata> {
  const title = `Sign in - ${config.title}`
  return { title }
}

export default async function () {
  unstable_noStore()
  const session = await auth()
  if (session) redirect('/')
  return (
    <div className="w-full lg:grid lg:grid-cols-2">
      <div className="border md:border-white/10 flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-balance text-muted-foreground">Enter your email below to sign in to your account</p>
          </div>
          {providers
            .filter((provider) => provider({}).id !== 'credentials')
            .map((provider) => (
              <Provider prefix="Sign in" key={provider({}).name} provider={provider({})} />
            ))}
          <p className="text-gray-300 text-xs text-center">OR</p>
          <form method="POST" className="grid gap-4" action="/api/auth/callback/credentials">
            <div className="grid gap-2">
              <Label htmlFor="username">Email</Label>
              <Input name="username" id="username" type="text" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input name="password" id="password" type="password" required />
              <CSRFInput />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1678811116814-26372fcfef1b?q=80&w=3088&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          className="h-[98vh] w-full object-cover"
        />
      </div>
    </div>
  )
}
