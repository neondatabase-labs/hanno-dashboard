import { Client } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'crypto'

const client = new Client({ connectionString: process.env.DATABASE_URL })

// Generate a random token
export function generateRandomToken() {
  return randomBytes(20).toString('hex')
}

// Generate a random string based on an input value
export function generateRandomString(inputValue: string) {
  return createHash('sha256').update(String(inputValue)).digest('hex')
}

// Hash a password using bcrypt
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

// Compare a password with its hash using bcrypt
export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}

export async function setPassword(email: any, password: any) {
  try {
    await client.connect()
  } catch (e) {}
  return await client.query({
    text: 'INSERT INTO id_pass (email, password) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET password = $2',
    values: [email, password],
  })
}

export async function getPassword(email: string) {
  try {
    await client.connect()
  } catch (e) {}
  const { rows } = await client.query({
    text: 'SELECT password FROM id_pass WHERE email = $1',
    values: [email],
  })
  return rows[0]?.['password']
}
