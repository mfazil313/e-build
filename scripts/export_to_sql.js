/**
 * export_to_sql.js
 *
 * Exports all local SQLite data as PostgreSQL-compatible INSERT statements.
 * Run this script, then copy the output SQL into the Supabase SQL Editor.
 *
 * Usage:
 *   node export_to_sql.js > supabase_data.sql
 *   (then open supabase_data.sql and paste into Supabase SQL Editor)
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'marketplace.db');
const OUT_PATH = path.join(__dirname, 'supabase_data.sql');

const sqlite = new Database(DB_PATH);

const tables = ['users', 'products', 'suppliers', 'customers', 'orders'];

let sql = `-- ============================================================
-- BuildMart Data Export
-- Paste this entire file into Supabase SQL Editor and click Run
-- ============================================================

`;

// Helper: escape single quotes in strings
function esc(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    return `'${String(val).replace(/'/g, "''")}'`;
}

for (const table of tables) {
    try {
        const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();
        if (rows.length === 0) {
            sql += `-- Table "${table}": no data\n\n`;
            continue;
        }

        sql += `-- ---- ${table} (${rows.length} rows) ----\n`;

        for (const row of rows) {
            const cols = Object.keys(row).map(c => `"${c}"`).join(', ');
            const vals = Object.values(row).map(v => esc(v)).join(', ');
            sql += `INSERT INTO ${table} (${cols}) VALUES (${vals}) ON CONFLICT (id) DO NOTHING;\n`;
        }

        sql += '\n';
        console.error(`✅ Exported ${rows.length} rows from "${table}"`);
    } catch (e) {
        sql += `-- Table "${table}": error - ${e.message}\n\n`;
        console.error(`⚠️  Error with table "${table}":`, e.message);
    }
}

fs.writeFileSync(OUT_PATH, sql, 'utf8');
console.error(`\n✅ Done! SQL file saved to: supabase_data.sql`);
console.error(`   Open that file, copy all text, paste into Supabase SQL Editor, and click Run.\n`);
