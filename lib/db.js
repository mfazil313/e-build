/**
 * lib/db.js — Dual-mode database adapter
 *
 * LOCAL mode  (LOCAL_DB=true in .env.local):
 *   Uses local SQLite file: marketplace.db
 *   Great for offline/local development.
 *
 * CLOUD mode  (LOCAL_DB not set, or LOCAL_DB=false, or on Vercel):
 *   Uses Supabase PostgreSQL via DATABASE_URL.
 *
 * On Vercel (VERCEL=1), SQLite is NOT available — always uses PostgreSQL.
 */

import path from 'path';

// Force cloud mode on Vercel (better-sqlite3 doesn't work on serverless)
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
const USE_LOCAL = !IS_VERCEL && process.env.LOCAL_DB === 'true';

// Log which mode we're using (once on startup)
if (typeof globalThis.__dbModeLogged === 'undefined') {
    console.log(`[DB] Mode: ${USE_LOCAL ? 'LOCAL SQLite' : 'CLOUD PostgreSQL (Supabase)'}${IS_VERCEL ? ' (Vercel detected)' : ''}`);
    globalThis.__dbModeLogged = true;
}

/** Check if we're in local SQLite mode */
export const isLocal = () => USE_LOCAL;

// ---------- SQLite helpers (local mode) ----------
let _sqlite = null;
function getSQLite() {
    if (!_sqlite) {
        try {
            const Database = require('better-sqlite3');
            const dbPath = path.join(process.cwd(), 'marketplace.db');
            _sqlite = new Database(dbPath);
            _sqlite.pragma('journal_mode = WAL');
        } catch (err) {
            console.error('[DB] Failed to load better-sqlite3:', err.message);
            throw new Error('SQLite is not available in this environment. Set LOCAL_DB=false to use PostgreSQL.');
        }
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
        if (!process.env.DATABASE_URL) {
            throw new Error('[DB] DATABASE_URL is not set. Add it to your Vercel environment variables.');
        }
        const { Pool } = require('pg');
        _pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 5,
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
