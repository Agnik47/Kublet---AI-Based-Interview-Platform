const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// 1. Parse .env file manually to load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index === -1) return;
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    });
    console.log('✓ Environment variables successfully loaded from .env');
  } else {
    console.warn('⚠️ No .env file found in project root!');
  }
}

loadEnv();

const targetHost = process.argv[2] || 'http://localhost:3000';
console.log(`\n🚀 Target Webhook Host: \x1b[36m${targetHost}\x1b[0m`);

async function runTest() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is missing!');
    process.exit(1);
  }

  // Connect to DB via pg client
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase in many environments
  });

  try {
    console.log('🔍 Fetching the most recent booking from database...');
    const bookingQuery = `
      SELECT b.id, b.status, b."streamCallId", b."creditsCharged", 
             u_er.id AS "interviewerId", u_er."clerkUserId" AS "interviewerClerkId", u_er.name AS "interviewerName",
             u_ee.id AS "intervieweeId", u_ee."clerkUserId" AS "intervieweeClerkId", u_ee.name AS "intervieweeName"
      FROM "Booking" b
      JOIN "User" u_er ON b."interviewerId" = u_er.id
      JOIN "User" u_ee ON b."intervieweeId" = u_ee.id
      ORDER BY b."createdAt" DESC
      LIMIT 1;
    `;

    const res = await pool.query(bookingQuery);
    if (res.rows.length === 0) {
      console.log('\n❌ No bookings found in the database.');
      console.log('Please schedule a mock interview in the application first, then re-run this script.');
      process.exit(0);
    }

    let booking = res.rows[0];
    console.log(`\n🎉 Found booking:`);
    console.log(`   - ID: \x1b[33m${booking.id}\x1b[0m`);
    console.log(`   - Current Status: \x1b[33m${booking.status}\x1b[0m`);
    console.log(`   - streamCallId: \x1b[33m${booking.streamCallId || 'None (Needs update)'}\x1b[0m`);
    console.log(`   - Interviewer: ${booking.interviewerName} (${booking.interviewerClerkId})`);
    console.log(`   - Interviewee: ${booking.intervieweeName} (${booking.intervieweeClerkId})`);

    // If booking doesn't have a streamCallId, let's create a mock one for testing!
    if (!booking.streamCallId) {
      const mockStreamCallId = `test-call-${Math.random().toString(36).substring(2, 9)}`;
      console.log(`\n🛠️ Booking doesn't have a streamCallId. Generating mock id: \x1b[32m${mockStreamCallId}\x1b[0m...`);
      await pool.query(
        `UPDATE "Booking" SET "streamCallId" = $1 WHERE id = $2`,
        [mockStreamCallId, booking.id]
      );
      booking.streamCallId = mockStreamCallId;
      console.log('✓ Database updated with mock streamCallId.');
    }

    const webhookEndpoint = `${targetHost.replace(/\/$/, '')}/api/webhooks/strems`;
    console.log(`📬 Posting to endpoint: \x1b[36m${webhookEndpoint}\x1b[0m`);

    // ==========================================
    // 1. TEST RECORDING READY WEBHOOK
    // ==========================================
    console.log('\n----------------------------------------');
    console.log('📹 TESTING EVENT 1: call.recording_ready');
    console.log('----------------------------------------');

    const testRecordingUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    const recordingPayload = {
      type: 'call.recording_ready',
      call_cid: `default:${booking.streamCallId}`,
      call_recording: {
        url: testRecordingUrl
      }
    };

    console.log('Sending recording payload...');
    const recordingRes = await fetch(webhookEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recordingPayload)
    });

    console.log(`Response Status: ${recordingRes.status} ${recordingRes.statusText}`);
    const recordingText = await recordingRes.text();
    console.log(`Response Body: ${recordingText}`);

    // Verify in database
    const verifyRecordingRes = await pool.query(
      `SELECT "recordingUrl" FROM "Booking" WHERE id = $1`,
      [booking.id]
    );
    const dbRecordingUrl = verifyRecordingRes.rows[0]?.recordingUrl;
    if (dbRecordingUrl === testRecordingUrl) {
      console.log('\x1b[32m✓ SUCCESS: recordingUrl correctly saved in the database!\x1b[0m');
    } else {
      console.log(`\x1b[31m❌ FAILURE: recordingUrl in database is "${dbRecordingUrl}", expected "${testRecordingUrl}"\x1b[0m`);
    }

    // ==========================================
    // 2. TEST TRANSCRIPTION READY WEBHOOK
    // ==========================================
    console.log('\n---------------------------------------------');
    console.log('📝 TESTING EVENT 2: call.transcription_ready');
    console.log('---------------------------------------------');

    // The transcription file hosted on Next.js public folder
    const transcriptUrl = `${targetHost.replace(/\/$/, '')}/mock-transcript.jsonl`;
    console.log(`Using mock transcript URL: \x1b[35m${transcriptUrl}\x1b[0m`);

    const transcriptionPayload = {
      type: 'call.transcription_ready',
      call_cid: `default:${booking.streamCallId}`,
      call_transcription: {
        url: transcriptUrl
      }
    };

    // Ensure they have clean state (remove feedback so it doesn't trigger skip condition)
    await pool.query(`DELETE FROM "Feedback" WHERE "bookingId" = $1`, [booking.id]);
    console.log('🧹 Cleaned existing feedback for this booking to prevent deduplication skip.');

    console.log('Sending transcription payload (this invokes Gemini - may take a few seconds)...');
    const startTime = Date.now();
    const transcriptionRes = await fetch(webhookEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transcriptionPayload)
    });

    console.log(`Response Status: ${transcriptionRes.status} ${transcriptionRes.statusText}`);
    const transcriptionText = await transcriptionRes.text();
    console.log(`Response Body: ${transcriptionText}`);
    console.log(`Time taken: ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

    // Verify in database
    const verifyBookingRes = await pool.query(
      `SELECT status FROM "Booking" WHERE id = $1`,
      [booking.id]
    );
    const verifyFeedbackRes = await pool.query(
      `SELECT * FROM "Feedback" WHERE "bookingId" = $1`,
      [booking.id]
    );
    const verifyTransactionRes = await pool.query(
      `SELECT * FROM "CreditTransaction" WHERE "bookingId" = $1 AND type = 'BOOKING_EARNING'`,
      [booking.id]
    );

    const updatedStatus = verifyBookingRes.rows[0]?.status;
    const hasFeedback = verifyFeedbackRes.rows.length > 0;
    const hasEarnings = verifyTransactionRes.rows.length > 0;

    console.log('\n----------------------------------------');
    console.log('📊 WEBHOOK INTEGRATION RESULTS:');
    console.log('----------------------------------------');
    
    if (updatedStatus === 'COMPLETED') {
      console.log('\x1b[32m✓ Booking status updated to COMPLETED!\x1b[0m');
    } else {
      console.log(`\x1b[31m❌ Booking status is ${updatedStatus}, expected COMPLETED\x1b[0m`);
    }

    if (hasFeedback) {
      console.log('\x1b[32m✓ Feedback record generated in database!\x1b[0m');
      console.log(`  - Overall Rating: ${verifyFeedbackRes.rows[0].overallRating}`);
      console.log(`  - Recommendation: ${verifyFeedbackRes.rows[0].recommendation}`);
      console.log(`  - Summary: ${verifyFeedbackRes.rows[0].summary}`);
    } else {
      console.log('\x1b[31m❌ Feedback record was NOT created in database.\x1b[0m');
    }

    if (hasEarnings) {
      console.log(`\x1b[32m✓ Earning transaction of +${booking.creditsCharged} credits created for interviewer!\x1b[0m`);
    } else {
      console.log('\x1b[31m❌ Earning transaction was NOT created for interviewer.\x1b[0m');
    }

    if (updatedStatus === 'COMPLETED' && hasFeedback && hasEarnings) {
      console.log('\n\x1b[32m🎉 CONGRATULATIONS! Your entire AI Feedback & Recording webhook system is working perfectly! 🚀\x1b[0m');
    } else {
      console.log('\n\x1b[31m⚠️ Some checks failed. Please check the Next.js server console logs to see what went wrong.\x1b[0m');
    }

  } catch (err) {
    console.error('❌ Connection or processing error occurred:', err);
  } finally {
    await pool.end();
  }
}

runTest();
