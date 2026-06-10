const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://postgres.yubcegnlawrgfjnycxdo:j%25hNB_iQnb5cfuG@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true', 
  ssl: { rejectUnauthorized: false } 
});
pool.query('SELECT b.id, b.status, b."streamCallId", b."startTime", b."endTime", u.name AS interviewer_name FROM "Booking" b JOIN "User" u ON b."interviewerId" = u.id ORDER BY b."createdAt" DESC LIMIT 5')
  .then(res => { console.log(JSON.stringify(res.rows, null, 2)); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
