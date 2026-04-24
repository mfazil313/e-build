// using native fetch

// Node 18+ has native fetch.
// let's assume user has Node 18+ since they are using Next.js 13+ likely.
// If not, this might fail.

const BASE_URL = 'http://localhost:3000';

async function testAuth() {
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Testing with email: ${email}`);

    // 1. Register
    console.log('1. Testing Registration...');
    try {
        const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                name: 'Test User',
                role: 'customer',
                details: { address: '123 Test St' }
            })
        });

        if (!regRes.ok) {
            const text = await regRes.text();
            console.error('Registration failed:', regRes.status, text);
            return;
        }
        const regData = await regRes.json();
        console.log('Registration success:', regData);
    } catch (e) {
        console.error('Registration fetch error:', e.message);
        return;
    }

    // 2. Login
    console.log('2. Testing Login...');
    try {
        const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                role: 'customer'
            })
        });

        if (!loginRes.ok) {
            const text = await loginRes.text();
            console.error('Login failed:', loginRes.status, text);
            return;
        }
        const loginData = await loginRes.json();
        console.log('Login success:', loginData);
    } catch (e) {
        console.error('Login fetch error:', e.message);
    }
}

testAuth();
