/**
 * push_to_supabase.js
 *
 * Reads ALL data from local marketplace.db (SQLite)
 * and uploads it to Supabase (PostgreSQL), so your
 * Vercel deployment shows the same products/users.
 *
 * Usage:
 *   node push_to_supabase.js
 */

const { Client } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');

const SUPABASE_URL = 'postgresql://postgres:Mfazil65570@db.xukepglludlyjdctzchi.supabase.co:5432/postgres';
const DB_PATH = path.join(__dirname, 'marketplace.db');

async function pushToSupabase() {
    const sqlite = new Database(DB_PATH);
    const pg = new Client({
        connectionString: SUPABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔌 Connecting to Supabase...');
        await pg.connect();
        console.log('✅ Connected!\n');

        // Ensure tables exist in Supabase
        console.log('📦 Creating tables if not exist...');
        await pg.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pg.query(`
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price REAL NOT NULL,
                unit TEXT NOT NULL,
                stock INTEGER NOT NULL,
                "minOrder" INTEGER,
                description TEXT,
                image TEXT,
                "supplierId" TEXT NOT NULL,
                "supplierName" TEXT NOT NULL,
                "supplierLocation" TEXT,
                rating REAL DEFAULT 0,
                reviews INTEGER DEFAULT 0,
                "ratingCount" INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pg.query(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id TEXT PRIMARY KEY,
                "supplierName" TEXT,
                "shopName" TEXT,
                address TEXT,
                image TEXT,
                "lastUpdated" TEXT
            );
        `);
        await pg.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                "fullName" TEXT,
                phone TEXT,
                image TEXT,
                "lastUpdated" TEXT
            );
        `);
        await pg.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                "customerId" TEXT,
                "supplierId" TEXT,
                items TEXT,
                total REAL,
                status TEXT,
                created_at TEXT
            );
        `);
        console.log('✅ Tables ready.\n');

        // Tables and their column configurations
        const tableDefs = {
            users: ['id', 'email', 'password', 'name', 'role', 'details', 'created_at'],
            products: ['id', 'name', 'category', 'price', 'unit', 'stock', 'minOrder', 'description', 'image', 'supplierId', 'supplierName', 'supplierLocation', 'rating', 'reviews', 'ratingCount', 'created_at'],
            suppliers: ['id', 'supplierName', 'shopName', 'address', 'image', 'lastUpdated'],
            customers: ['id', 'fullName', 'phone', 'image', 'lastUpdated'],
            orders: ['id', 'customerId', 'supplierId', 'items', 'total', 'status', 'created_at'],
        };

        for (const [table, cols] of Object.entries(tableDefs)) {
            try {
                const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
                if (rows.length === 0) {
                    console.log(`⚠️  ${table}: 0 rows, skipping.`);
                    continue;
                }

                console.log(`⬆️  Uploading ${rows.length} rows to "${table}"...`);
                let success = 0;
                let skipped = 0;

                for (const row of rows) {
                    // Build quoted column names for Postgres
                    const actualCols = Object.keys(row);
                    const quotedCols = actualCols.map(c => `"${c}"`).join(', ');
                    const placeholders = actualCols.map((_, i) => `$${i + 1}`).join(', ');
                    const values = actualCols.map(c => {
                        const v = row[c];
                        if (v === null || v === undefined) return null;
                        return v;
                    });

                    const sql = `INSERT INTO ${table} (${quotedCols}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;

                    try {
                        await pg.query(sql, values);
                        success++;
                    } catch (rowErr) {
                        skipped++;
                        // Uncomment below to debug individual row errors:
                        // console.error(`   Row error in ${table}:`, rowErr.message);
                    }
                }

                console.log(`   ✅ Inserted: ${success}, Skipped/Duplicate: ${skipped}`);
            } catch (tableErr) {
                if (tableErr.message.includes('no such table')) {
                    console.log(`   ⚠️  Local table "${table}" doesn't exist, skipping.`);
                } else {
                    console.error(`   ❌ Error with ${table}:`, tableErr.message);
                }
            }
        }

        console.log('\n🎉 Done! Your Supabase database now has all local data.');
        console.log('   Refresh your Vercel app — products should now appear!\n');

    } catch (err) {
        console.error('❌ Fatal error:', err.message);
        console.log('\n💡 Tip: If you see a connection error, check your internet connection.');
    } finally {
        await pg.end();
        sqlite.close();
    }
}

pushToSupabase();
