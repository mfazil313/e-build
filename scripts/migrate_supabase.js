const { Client } = require('pg');

const client = new Client({
    // Using the session pooler URL format which is more reliable
    connectionString: 'postgresql://postgres.xukepglludlyjdctzchi:Mfazil65570%40@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
});

async function run() {
    try {
        await client.connect();

        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        unit TEXT NOT NULL,
        stock INTEGER NOT NULL,
        minOrder INTEGER,
        description TEXT,
        image TEXT,
        supplierId TEXT NOT NULL,
        supplierName TEXT NOT NULL,
        supplierLocation TEXT,
        rating REAL DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        ratingCount INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplierId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        supplierName TEXT,
        shopName TEXT,
        address TEXT,
        image TEXT,
        lastUpdated TEXT
      )
    `);

        await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        fullName TEXT,
        phone TEXT,
        image TEXT,
        lastUpdated TEXT
      )
    `);

        console.log('Tables created successfully in Postgres!');
    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        await client.end();
    }
}

run();
