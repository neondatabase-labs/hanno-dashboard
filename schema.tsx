import { neon, neonConfig } from '@neondatabase/serverless'
import 'dotenv/config'

neonConfig.poolQueryViaFetch = true

const seedQueries = [
  'CREATE TABLE IF NOT EXISTS verification_token (identifier TEXT NOT NULL, expires TIMESTAMPTZ NOT NULL, token TEXT NOT NULL, PRIMARY KEY (identifier, token));',
  'CREATE TABLE IF NOT EXISTS accounts (id SERIAL, "userId" INTEGER NOT NULL, type VARCHAR(255) NOT NULL, provider VARCHAR(255) NOT NULL, "providerAccountId" VARCHAR(255) NOT NULL, refresh_token TEXT, access_token TEXT, expires_at BIGINT, id_token TEXT, scope TEXT, session_state TEXT, token_type TEXT, PRIMARY KEY (id));',
  'CREATE TABLE IF NOT EXISTS sessions (id SERIAL, "userId" INTEGER NOT NULL, expires TIMESTAMPTZ NOT NULL, "sessionToken" VARCHAR(255) NOT NULL, PRIMARY KEY (id));',
  'CREATE TABLE IF NOT EXISTS users (id SERIAL, name VARCHAR(255), email VARCHAR(255), "emailVerified" TIMESTAMPTZ, image TEXT, password TEXT, CITY TEXT, RPU BIGINT, PRIMARY KEY (id));',
  'CREATE TABLE IF NOT EXISTS sales (id SERIAL PRIMARY KEY, sale_date DATE NOT NULL, sale_amount NUMERIC NOT NULL, channel VARCHAR(50) NOT NULL, product_name VARCHAR(255) );',
  "CREATE TABLE IF NOT EXISTS customers (id SERIAL PRIMARY KEY, signup_date DATE NOT NULL, type VARCHAR(20) NOT NULL CHECK (type IN ('Free', 'Paying')) );",
  'CREATE TABLE IF NOT EXISTS traffic (id SERIAL PRIMARY KEY, date DATE NOT NULL, total_visits INTEGER NOT NULL, channel VARCHAR(50) NOT NULL );',
  "CREATE TABLE IF NOT EXISTS product_reviews (id SERIAL PRIMARY KEY, product_name VARCHAR(255) NOT NULL, customer_name VARCHAR(255) NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), review TEXT, status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );",
  `CREATE TABLE IF NOT EXISTS geographies (id SERIAL PRIMARY KEY, region VARCHAR(50) NOT NULL, revenue NUMERIC NOT NULL );`,
  `DO $$ BEGIN FOR i IN 1..50 LOOP INSERT INTO sales (sale_date, sale_amount, channel, product_name) VALUES ( CURRENT_DATE - FLOOR(random() * 30)::INT, ROUND((random() * (500 - 10) + 10)::numeric, 2), (ARRAY['Website', 'Mobile', 'In-store'])[FLOOR(random() * 3 + 1)::INT], (ARRAY['Smartwatch', 'Laptop', 'Headphones', 'Tablet', 'Camera'])[FLOOR(random() * 5 + 1)::INT] ); END LOOP; END $$;`,
  `INSERT INTO customers (signup_date, type) VALUES ('2023-12-01', 'Free'), ('2023-12-02', 'Paying'), ('2023-12-03', 'Free'), ('2023-12-04', 'Paying');`,
  `INSERT INTO traffic (date, total_visits, channel) VALUES ('2023-12-01', 500, 'Website'), ('2023-12-02', 600, 'Mobile'), ('2023-12-03', 550, 'Website');`,
  `INSERT INTO product_reviews (product_name, customer_name, rating, review, status) VALUES ('Smartwatch', 'Alice Johnson', 5, 'Great product!', 'Approved'), ('Laptop', 'John Smith', 4, 'Works well but could be faster.', 'Approved');`,
  `INSERT INTO geographies (region, revenue) VALUES ('North America', 15000.00), ('Europe', 12000.00), ('Asia', 10000.00);`,
  `CREATE INDEX IF NOT EXISTS idx_sales_sale_date_channel ON sales (sale_date, channel);`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);`,
  `CREATE INDEX IF NOT EXISTS idx_users_id_count ON users (id);`,
]

async function prepare() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL environment variable not found.')
  const sql = neon(process.env.DATABASE_URL)
  for (const line of seedQueries) await sql(line)
  console.log('Created schema successfully.')
}

prepare()
