/**
 * sync_from_supabase.js
 * 
 * Downloads ALL data from Supabase (PostgreSQL) and saves it into
 * the local SQLite file (marketplace.db), so the app can run fully offline.
 *
 * Usage:
 *   node sync_from_supabase.js
 */

const { Client } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');

// Use the direct Supabase URL (not the pooler)
const SUPABASE_URL = 'postgresql://postgres:Mfazil65570@db.xukepglludlyjdctzchi.supabase.co:5432/postgres';
const DB_PATH = path.join(__dirname, 'marketplace.db');

async function syncFromSupabase() {
    const pg = new Client({
        connectionString: SUPABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    const sqlite = new Database(DB_PATH);

    try {
        console.log('🔌 Connecting to Supabase...');
        await pg.connect();
        console.log('✅ Connected to Supabase.');

        // --- Recreate local SQLite tables ---
        console.log('\n📦 Setting up local SQLite tables...');
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (supplierId) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS suppliers (
                id TEXT PRIMARY KEY,
                supplierName TEXT,
                shopName TEXT,
                address TEXT,
                image TEXT,
                lastUpdated TEXT
            );

            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                fullName TEXT,
                phone TEXT,
                image TEXT,
                lastUpdated TEXT
            );

            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                customerId TEXT,
                supplierId TEXT,
                items TEXT,
                total REAL,
                status TEXT,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS drivers (
                id TEXT PRIMARY KEY,
                name TEXT,
                phone TEXT,
                vehicle TEXT,
                image TEXT,
                lastUpdated TEXT
            );

            CREATE TABLE IF NOT EXISTS deliveries (
                id TEXT PRIMARY KEY,
                orderId TEXT,
                driverId TEXT,
                status TEXT,
                created_at TEXT
            );
        `);
        console.log('✅ Tables ready.');

        const tables = ['users', 'products', 'suppliers', 'customers', 'orders', 'drivers', 'deliveries'];

        for (const table of tables) {
            try {
                console.log(`\n⬇️  Syncing table: ${table}...`);
                const result = await pg.query(`SELECT * FROM ${table}`);
                const rows = result.rows;

                if (rows.length === 0) {
                    console.log(`   ⚠️  No data in ${table}, skipping.`);
                    continue;
                }

                // Clear existing local data for this table
                sqlite.prepare(`DELETE FROM ${table}`).run();

                // Build insert statement from the first row's keys
                const cols = Object.keys(rows[0]);
                const placeholders = cols.map(() => '?').join(', ');
                const insertSQL = `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`;
                const insertStmt = sqlite.prepare(insertSQL);

                const insertMany = sqlite.transaction((rows) => {
                    for (const row of rows) {
                        insertStmt.run(cols.map(c => {
                            const v = row[c];
                            if (v === null || v === undefined) return null;
                            if (typeof v === 'object') return JSON.stringify(v);
                            return v;
                        }));
                    }
                });

                insertMany(rows);
                console.log(`   ✅ Synced ${rows.length} rows into ${table}.`);
            } catch (tableErr) {
                // Table might not exist in Supabase yet — skip gracefully
                if (tableErr.message && tableErr.message.includes('does not exist')) {
                    console.log(`   ⚠️  Table "${table}" not found in Supabase, skipping.`);
                } else {
                    console.error(`   ❌ Error syncing ${table}:`, tableErr.message);
                }
            }
        }

        console.log('\n🎉 Sync complete! Your local marketplace.db is up to date.');
        console.log('   You can now run the app with LOCAL_DB=true in .env.local\n');

    } catch (err) {
        console.error('❌ Fatal error:', err.message);
    } finally {
        await pg.end();
        sqlite.close();
    }
}

syncFromSupabase();
