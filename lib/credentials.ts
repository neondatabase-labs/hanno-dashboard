import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'crypto'

export function generateRandomToken() {
  return randomBytes(20).toString('hex')
}

export function generateRandomString(inputValue: string) {
  return createHash('sha256').update(String(inputValue)).digest('hex')
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}
