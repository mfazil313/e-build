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

// ---------- SQLite helpers (local mode) ----------
let _sqlite = null;
function getSQLite() {
    if (!_sqlite) {
        // Dynamic require so Next.js doesn't try to bundle it for the browser
        const Database = require('better-sqlite3');
        const dbPath = path.join(process.cwd(), 'marketplace.db');
        _sqlite = new Database(dbPath);
    }
    return _sqlite;
}

function sqliteQuery(text, params = []) {
    const db = getSQLite();
    try {
        const stmt = db.prepare(text);
        return stmt.all(...params);
    } catch (err) {
        console.error('[SQLite query error]', err.message);
        throw err;
    }
}

function sqliteRun(text, params = []) {
    const db = getSQLite();
    try {
        const stmt = db.prepare(text);
        const info = stmt.run(...params);
        return { changes: info.changes };
    } catch (err) {
        console.error('[SQLite run error]', err.message);
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
        });
    }
    return _pool;
}

async function pgQuery(text, params = []) {
    const pool = getPool();
    const client = await pool.connect();
    try {
        let pgText = text;
        if (pgText.includes('?')) {
            let i = 1;
            pgText = pgText.replace(/\?/g, () => `$${i++}`);
        }
        pgText = pgText.replace(/created_at DESC/g, '"created_at" DESC');
        const res = await client.query(pgText, params);
        return res.rows;
    } finally {
        client.release();
    }
}

async function pgRun(text, params = []) {
    const pool = getPool();
    const client = await pool.connect();
    try {
        let pgText = text;
        if (pgText.includes('?')) {
            let i = 1;
            pgText = pgText.replace(/\?/g, () => `$${i++}`);
        }
        const res = await client.query(pgText, params);
        return { changes: res.rowCount };
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

export default { query, get, run };
