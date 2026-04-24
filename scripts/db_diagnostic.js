const { get, query } = require('./lib/db');

async function checkDb() {
    try {
        console.log('--- Table Schema ---');
        const schema = await get("SELECT sql FROM sqlite_master WHERE type='table' AND name='suppliers'");
        console.log(schema ? schema.sql : 'Table not found');

        console.log('\n--- Table Contents ---');
        const rows = await query("SELECT * FROM suppliers");
        rows.forEach(r => {
            console.log(`ID: "${r.id}" (length: ${r.id.length}), Image: "${r.image}", LastUpdated: ${r.lastUpdated}`);
        });
        console.log('\nFull JSON:', JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

checkDb();
