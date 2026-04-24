/**
 * check_local_db.js
 * Prints a summary of all tables and row counts in localmarketplace.db
 */
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'marketplace.db'));

const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all();
console.log('\n📋 Tables in marketplace.db:\n');

for (const { name } of tables) {
    try {
        const count = db.prepare(`SELECT COUNT(*) as cnt FROM "${name}"`).get();
        const sample = db.prepare(`SELECT * FROM "${name}" LIMIT 2`).all();
        console.log(`  ✅ ${name}: ${count.cnt} rows`);
        if (sample.length > 0) {
            console.log(`     Sample: ${JSON.stringify(sample[0]).substring(0, 120)}`);
        }
    } catch (e) {
        console.log(`  ⚠️  ${name}: Error - ${e.message}`);
    }
}

db.close();
console.log('\nDone.');
