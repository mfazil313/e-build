const { Pool } = require('pg');

const regions = [
    'ap-south-1',
    'ap-southeast-1', 
    'us-east-1',
    'us-west-1',
    'eu-west-1',
    'eu-central-1',
    'eu-west-2',
    'ap-northeast-1',
    'ap-southeast-2',
    'sa-east-1',
    'ca-central-1',
    'eu-north-1',
    'us-east-2',
    'us-west-2',
];

async function tryRegion(region) {
    const url = `postgresql://postgres.xukepglludlyjdctzchi:Mfazil65570@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    const pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
    });
    try {
        const res = await pool.query('SELECT 1 as ok');
        console.log(`✅ Region ${region} WORKS!`);
        console.log(`\n🎯 USE THIS DATABASE_URL:`);
        console.log(`   ${url}\n`);
        await pool.end();
        return true;
    } catch (err) {
        const short = err.message.includes('ENOTFOUND') ? 'DNS fail' : err.message.substring(0, 40);
        console.log(`❌ ${region}: ${short}`);
        await pool.end();
        return false;
    }
}

(async () => {
    console.log('Testing all Supabase regions for project xukepglludlyjdctzchi...\n');
    for (const region of regions) {
        const ok = await tryRegion(region);
        if (ok) return;
    }
    console.log('\n⚠️  No region worked. Your Supabase project may be PAUSED.');
    console.log('   Go to https://supabase.com/dashboard and check if your project is paused.');
    console.log('   Free tier projects pause after 7 days of inactivity.');
})();
