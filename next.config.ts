import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'
import type { NextConfig } from 'next'

if (process.env.NODE_ENV === 'development') await setupDevPlatform()

export default {} as NextConfig
