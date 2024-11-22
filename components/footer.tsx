import config from '@/lib/config'
import { Icon } from '@iconify/react'
import Link from 'next/link'

export default function () {
  return (
    <footer className="mt-2 py-4 border-t border-white/10">
      <div className="flex flex-col sm:flex-row items-center sm:justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <img loading="lazy" decoding="async" src={config.logo} width={158} height={48} className="h-[30px] w-auto" alt="Neon Logo" />
        </Link>
        <a
          target="_blank"
          href="https://github.com/neondatabase-labs/hanno-blog"
          className="text-gray-400 hover:text-white fill-gray-400 hover:fill-white flex flex-row items-center gap-x-3"
        >
          <Icon fontSize={18} icon="mdi:github" />
          <span>View Source</span>
        </a>
      </div>
    </footer>
  )
}
