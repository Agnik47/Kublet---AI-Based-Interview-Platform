const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://postgres.yubcegnlawrgfjnycxdo:j%25hNB_iQnb5cfuG@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true', 
  ssl: { rejectUnauthorized: false } 
});
pool.query('SELECT id, status, "streamCallId", "recordingUrl" FROM "Booking" ORDER BY "createdAt" DESC LIMIT 1')
  .then(res => { console.log(res.rows[0]); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
