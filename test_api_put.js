const fetch = require('node-fetch');

async function testPut() {
    const supplierId = '699832591db480102d5';
    const payload = {
        supplierName: 'Test Supplier',
        shopName: 'Test Shop',
        address: 'Test Address',
        image: 'https://example.com/photo.jpg'
    };

    try {
        const res = await fetch(`http://localhost:3000/api/supplier/profile?supplierId=${supplierId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log('API Response:', data);

        // Check DB again
        const { get } = require('./lib/db');
        const row = await get('SELECT * FROM suppliers WHERE id = ?', [supplierId]);
        console.log('DB Content after PUT:', row);
    } catch (err) {
        console.error('Error:', err);
    }
}

testPut();
