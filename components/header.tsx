import UserAvatar from '@/components/user/avatar'
import Link from 'next/link'

export default function () {
  return (
    <header className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <img
            width={158}
            height={48}
            loading="lazy"
            alt="Neon Logo"
            decoding="async"
            className="h-[30px] w-auto dark:hidden"
            src="https://neon.tech/brand/neon-logo-light-color.svg"
          />
          <img
            width={158}
            height={48}
            loading="lazy"
            alt="Neon Logo"
            decoding="async"
            className="h-[30px] w-auto hidden dark:block"
            src="https://neon.tech/brand/neon-logo-dark-color.svg"
          />
        </Link>
        <span className="md:hidden">
          <UserAvatar />
        </span>
        <div className="hidden md:flex flex-row items-center gap-x-3">
          <UserAvatar />
          <a target="_blank" aria-label="Deploy to Cloudflare Pages" href="https://deploy.workers.cloudflare.com/?url=https://github.com/neondatabase-labs/hanno-dashboard">
            <img alt="Deploy to Cloudflare Pages" loading="lazy" decoding="async" src="https://deploy.workers.cloudflare.com/button" width="146.4" height="31.2" />
          </a>
          <a
            target="_blank"
            aria-label="Deploy to Vercel"
            href="https://vercel.com/new/clone?repository-url=https://github.com/neondatabase-labs/hanno-dashboard&env=DATABASE_URL,RESEND_API_KEY"
          >
            <img alt="Deploy to Vercel" loading="lazy" decoding="async" src="https://vercel.com/button" width="103" height="32" />
          </a>
          <a
            target="_blank"
            aria-label="Deploy to Netlify"
            href="https://app.netlify.com/start/deploy?repository=https://github.com/neondatabase-labs/hanno-dashboard#DATABASE_URL&RESEND_API_KEY"
          >
            <img alt="Deploy to Netlify" loading="lazy" decoding="async" src="https://www.netlify.com/img/deploy/button.svg" width="179" height="32" className="h-[30px] w-auto" />
          </a>
          <a aria-label="Deploy to Render" href="https://render.com/deploy?repo=https://github.com/neondatabase-labs/hanno-dashboard" target="_blank">
            <img
              width="153"
              height="40"
              loading="lazy"
              decoding="async"
              alt="Deploy to Render"
              className="h-[30px] w-auto rounded"
              src="https://render.com/images/deploy-to-render-button.svg"
            />
          </a>
        </div>
      </div>
    </header>
  )
}
