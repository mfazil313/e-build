const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(process.cwd(), 'marketplace.db'));

const products = db.prepare('SELECT * FROM products').all();
const suppliers = db.prepare('SELECT * FROM suppliers').all();
const customers = db.prepare('SELECT * FROM customers').all();

let sql = '-- BuildMart Data Export\n-- Paste this in Supabase SQL Editor and click Run\n\n';

// Products
sql += '-- PRODUCTS (' + products.length + ' rows)\n';
for (const p of products) {
    const vals = [
        p.id, p.name, p.category, p.price, p.unit, p.stock,
        p.minOrder || 1, p.description || '', p.image || '',
        p.supplierId, p.supplierName || '', p.supplierLocation || '',
        p.rating || 0, p.reviews || 0, p.ratingCount || 0, p.created_at
    ].map(v => typeof v === 'string' ? "'" + v.replace(/'/g, "''") + "'" : v);
    
    sql += `INSERT INTO products (id, name, category, price, unit, stock, "minOrder", description, image, "supplierId", "supplierName", "supplierLocation", rating, reviews, "ratingCount", created_at) VALUES (${vals.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
}

// Suppliers
if (suppliers.length > 0) {
    sql += '\n-- SUPPLIERS (' + suppliers.length + ' rows)\n';
    for (const s of suppliers) {
        const vals = [
            s.id, s.supplierName || '', s.shopName || '', s.address || '', s.image || '', s.lastUpdated || ''
        ].map(v => typeof v === 'string' ? "'" + v.replace(/'/g, "''") + "'" : v);
        sql += `INSERT INTO suppliers (id, "supplierName", "shopName", address, image, "lastUpdated") VALUES (${vals.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
    }
}

// Customers
if (customers.length > 0) {
    sql += '\n-- CUSTOMERS (' + customers.length + ' rows)\n';
    for (const c of customers) {
        const vals = [
            c.id, c.fullName || '', c.phone || '', c.image || '', c.lastUpdated || ''
        ].map(v => typeof v === 'string' ? "'" + v.replace(/'/g, "''") + "'" : v);
        sql += `INSERT INTO customers (id, "fullName", phone, image, "lastUpdated") VALUES (${vals.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
    }
}

const fs = require('fs');
const outPath = path.join(process.cwd(), 'scripts', 'supabase_data.sql');
fs.writeFileSync(outPath, sql);
console.log('Exported ' + products.length + ' products, ' + suppliers.length + ' suppliers, ' + customers.length + ' customers');
console.log('File saved to: scripts/supabase_data.sql');
console.log('\nCopy the contents of that file and paste it in Supabase SQL Editor!');

db.close();
