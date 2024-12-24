import 'dotenv/config'
import sql from './lib/sql'

const seedQueries = [
  'CREATE TABLE IF NOT EXISTS verification_token (identifier TEXT NOT NULL, expires TIMESTAMPTZ NOT NULL, token TEXT NOT NULL, PRIMARY KEY (identifier, token));',
  'CREATE TABLE IF NOT EXISTS accounts (id SERIAL, "userId" INTEGER NOT NULL, type VARCHAR(255) NOT NULL, provider VARCHAR(255) NOT NULL, "providerAccountId" VARCHAR(255) NOT NULL, refresh_token TEXT, access_token TEXT, expires_at BIGINT, id_token TEXT, scope TEXT, session_state TEXT, token_type TEXT, PRIMARY KEY (id));',
  'CREATE TABLE IF NOT EXISTS sessions (id SERIAL, "userId" INTEGER NOT NULL, expires TIMESTAMPTZ NOT NULL, "sessionToken" VARCHAR(255) NOT NULL, PRIMARY KEY (id));',
  'CREATE TABLE IF NOT EXISTS users (id SERIAL, name VARCHAR(255), email VARCHAR(255), "emailVerified" TIMESTAMPTZ, image TEXT, password TEXT, CITY TEXT, RPU BIGINT, PRIMARY KEY (id));',
  'CREATE TABLE IF NOT EXISTS sales (id SERIAL PRIMARY KEY, sale_date DATE NOT NULL, sale_amount NUMERIC NOT NULL, channel VARCHAR(50) NOT NULL, product_name VARCHAR(255), customer_id INTEGER);',
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
  `ALTER TABLE sales ADD CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE;`,
  `CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales (customer_id);`,
  `CREATE INDEX IF NOT EXISTS idx_sales_sale_date_customer_id ON sales (sale_date, customer_id);`,
]

async function prepare() {
  for (const line of seedQueries) await sql(line)
  console.log('Created schema successfully.')
}

async function populateRandomData() {
  const randomDate = (start: Date, end: Date) => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    return date.toISOString().split('T')[0]
  }
  const queries = [
    // Insert random customers
    ...Array(30)
      .fill(0)
      .map(
        () =>
          `INSERT INTO customers (signup_date, type) VALUES (
        '${randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31))}', 
        '${['Free', 'Paying'][Math.floor(Math.random() * 2)]}'
      );`,
      ),
    // Insert random sales
    ...Array(30)
      .fill(0)
      .map(
        () =>
          `INSERT INTO sales (sale_date, sale_amount, channel, product_name, customer_id) VALUES (
        '${randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31))}',
        ${(Math.random() * 490 + 10).toFixed(2)}, 
        '${['Website', 'Mobile', 'In-store'][Math.floor(Math.random() * 3)]}',
        '${['Smartwatch', 'Laptop', 'Headphones', 'Tablet', 'Camera'][Math.floor(Math.random() * 5)]}', 
        ${Math.ceil(Math.random() * 30)} -- assumes customer IDs 1-30 exist
      );`,
      ),
    // Insert random traffic
    ...Array(30)
      .fill(0)
      .map(
        () =>
          `INSERT INTO traffic (date, total_visits, channel) VALUES (
        '${randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31))}',
        ${Math.floor(Math.random() * 1000 + 100)}, 
        '${['Website', 'Mobile', 'In-store'][Math.floor(Math.random() * 3)]}'
      );`,
      ),
    // Insert random product reviews
    ...Array(30)
      .fill(0)
      .map(
        () =>
          `INSERT INTO product_reviews (product_name, customer_name, rating, review, status) VALUES (
        '${['Smartwatch', 'Laptop', 'Headphones', 'Tablet', 'Camera'][Math.floor(Math.random() * 5)]}',
        '${['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Edward Norton'][Math.floor(Math.random() * 5)]}', 
        ${Math.ceil(Math.random() * 5)}, 
        '${['Great product!', 'Good value for money.', 'Not satisfied.', 'Exceeded expectations.', 'Average performance.'][Math.floor(Math.random() * 5)]}', 
        '${['Pending', 'Approved', 'Rejected'][Math.floor(Math.random() * 3)]}'
      );`,
      ),
    // Insert random geographies
    ...Array(30)
      .fill(0)
      .map(
        () =>
          `INSERT INTO geographies (region, revenue) VALUES (
        '${['North America', 'Europe', 'Asia', 'South America', 'Africa'][Math.floor(Math.random() * 5)]}', 
        ${(Math.random() * 50000 + 5000).toFixed(2)}
      );`,
      ),
    // Insert random users
    ...Array(30)
      .fill(0)
      .map(
        () =>
          `INSERT INTO users (name, email, "emailVerified", image, password, CITY, RPU) VALUES (
        '${['Alice', 'Bob', 'Charlie', 'Diana', 'Edward'][Math.floor(Math.random() * 5)]} ${['Smith', 'Brown', 'Johnson', 'Davis', 'Taylor'][Math.floor(Math.random() * 5)]}', 
        '${Math.random().toString(36).substring(2, 8)}@example.com',
        '${randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31))}T${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}:00Z', 
        'https://example.com/image/${Math.floor(Math.random() * 1000)}.jpg', 
        'password${Math.floor(Math.random() * 1000)}',
        '${['New York', 'London', 'Paris', 'Tokyo', 'Berlin'][Math.floor(Math.random() * 5)]}', 
        ${Math.floor(Math.random() * 1000 + 100)}
      );`,
      ),
  ]
  for (const query of queries) await sql(query)
  console.log('Data inserted successfully.')
}

prepare()
// populateRandomData()
