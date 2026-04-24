const { query } = require('./lib/db');
async function run() {
    try {
        const tables = await query("SELECT name, sql FROM sqlite_master WHERE type='table'");
        console.log(JSON.stringify(tables, null, 2));
    } catch (e) { console.error(e); }
}
run();
