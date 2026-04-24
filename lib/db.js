/**
 * lib/db.js — Dual-mode database adapter
 *
 * LOCAL mode  (LOCAL_DB=true in .env.local):
 *   Uses local SQLite file: marketplace.db
 *   Great for offline/local development.
 *
 * CLOUD mode  (LOCAL_DB not set, or LOCAL_DB=false):
 *   Uses Supabase PostgreSQL via DATABASE_URL.
 *
 * To switch modes, set LOCAL_DB=true or LOCAL_DB=false in your .env.local file.
 */

import path from 'path';

const USE_LOCAL = process.env.LOCAL_DB === 'true';

// Log which mode we're using (once on startup)
if (typeof globalThis.__dbModeLogged === 'undefined') {
    console.log(`[DB] Mode: ${USE_LOCAL ? 'LOCAL SQLite' : 'CLOUD PostgreSQL (Supabase)'}`);
    globalThis.__dbModeLogged = true;
}

/** Check if we're in local SQLite mode */
export const isLocal = () => USE_LOCAL;

// ---------- SQLite helpers (local mode) ----------
let _sqlite = null;
function getSQLite() {
    if (!_sqlite) {
        const Database = require('better-sqlite3');
        const dbPath = path.join(process.cwd(), 'marketplace.db');
        _sqlite = new Database(dbPath);
        // Enable WAL mode for better concurrent read performance
        _sqlite.pragma('journal_mode = WAL');
    }
    return _sqlite;
}

function sqliteQuery(text, params = []) {
    const db = getSQLite();
    try {
        const stmt = db.prepare(text);
        return stmt.all(...params);
    } catch (err) {
        console.error('[SQLite query error]', err.message, '\nSQL:', text);
        throw err;
    }
}

function sqliteRun(text, params = []) {
    const db = getSQLite();
    try {
        const stmt = db.prepare(text);
        const info = stmt.run(...params);
        return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
    } catch (err) {
        console.error('[SQLite run error]', err.message, '\nSQL:', text);
        throw err;
    }
}

// ---------- PostgreSQL helpers (Supabase / cloud mode) ----------
let _pool = null;
function getPool() {
    if (!_pool) {
        const { Pool } = require('pg');
        _pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 5,              // limit pool size for serverless
            idleTimeoutMillis: 10000,
        });
        _pool.on('error', (err) => {
            console.error('[PG Pool] Unexpected error:', err.message);
        });
    }
    return _pool;
}

/**
 * Convert SQLite-style `?` placeholders to PostgreSQL-style `$1, $2, ...`
 * Only converts `?` that are NOT inside single-quoted strings.
 */
function convertPlaceholders(sql) {
    let idx = 1;
    let result = '';
    let inString = false;

    for (let i = 0; i < sql.length; i++) {
        const ch = sql[i];

        if (ch === "'" && (i === 0 || sql[i - 1] !== '\\')) {
            inString = !inString;
            result += ch;
        } else if (ch === '?' && !inString) {
            result += `$${idx++}`;
        } else {
            result += ch;
        }
    }

    return result;
}

async function pgQuery(text, params = []) {
    const pool = getPool();
    const client = await pool.connect();
    try {
        const pgText = convertPlaceholders(text);
        const res = await client.query(pgText, params);
        return res.rows;
    } catch (err) {
        console.error('[PG query error]', err.message, '\nSQL:', text);
        throw err;
    } finally {
        client.release();
    }
}

async function pgRun(text, params = []) {
    const pool = getPool();
    const client = await pool.connect();
    try {
        const pgText = convertPlaceholders(text);
        const res = await client.query(pgText, params);
        return { changes: res.rowCount };
    } catch (err) {
        console.error('[PG run error]', err.message, '\nSQL:', text);
        throw err;
    } finally {
        client.release();
    }
}

// ---------- Unified public API ----------
export const query = async (text, params = []) => {
    if (USE_LOCAL) return sqliteQuery(text, params);
    return pgQuery(text, params);
};

export const get = async (text, params = []) => {
    const rows = await query(text, params);
    return rows[0];
};

export const run = async (text, params = []) => {
    if (USE_LOCAL) return sqliteRun(text, params);
    return pgRun(text, params);
};

export default { query, get, run, isLocal };
