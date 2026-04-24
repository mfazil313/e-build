const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(process.cwd(), 'marketplace.db'));

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', JSON.stringify(tables.map(t => t.name)));

try {
    const products = db.prepare('SELECT COUNT(*) as count FROM products').get();
    console.log('Products count:', products.count);
    const sample = db.prepare('SELECT id, name, category, price, "supplierId" FROM products LIMIT 2').all();
    console.log('Sample products:', JSON.stringify(sample, null, 2));
} catch(e) { console.log('Products error:', e.message); }

try {
    const customers = db.prepare('SELECT COUNT(*) as count FROM customers').get();
    console.log('Customers count:', customers.count);
} catch(e) { console.log('Customers table error:', e.message); }

try {
    const suppliers = db.prepare('SELECT COUNT(*) as count FROM suppliers').get();
    console.log('Suppliers count:', suppliers.count);
} catch(e) { console.log('Suppliers table error:', e.message); }

try {
    const cols = db.prepare("PRAGMA table_info(products)").all();
    console.log('Products columns:', cols.map(c => c.name));
} catch(e) { console.log('Schema error:', e.message); }

db.close();
