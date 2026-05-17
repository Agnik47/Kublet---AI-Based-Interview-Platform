import { Resend } from "resend";

// Resend initialization - using process.env.RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

export const ADMIN_EMAIL = "realagnik.roni.2004@gmail.com";

// Helper to format date and time beautifully in emails
const formatDateTime = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
};

/**
 * Send Booking Confirmation Emails to Interviewee and Admin
 */
export async function sendBookingEmails({ booking, interviewee, interviewer }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY is not set in environment variables. Email sending skipped.");
    return;
  }

  const sessionTime = formatDateTime(booking.startTime);
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/call/${booking.streamCallId}`;

  // 1. Email to the Interviewee (Booking Confirmation)
  try {
    await resend.emails.send({
      from: "Kublet <onboarding@resend.dev>",
      to: interviewee.email,
      subject: `Confirmed: Interview Session with ${interviewer.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmed</title>
        </head>
        <body style="background-color: #000000; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f11; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);">
            
            <!-- Logo Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 0.1em; color: #fbbf24; background: linear-gradient(to right, #fbbf24, #ffedd5); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">KUBLET</span>
              <div style="font-size: 11px; text-transform: uppercase; tracking: 0.2em; color: #6b7280; margin-top: 5px;">AI-Powered Interview Preparation</div>
            </div>

            <!-- Main Heading -->
            <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; text-align: center; margin-top: 0;">Your Interview is Confirmed!</h2>
            <p style="font-size: 14px; color: #94a3b8; text-align: center; line-height: 1.6; margin-bottom: 30px;">
              You have successfully booked an expert mock interview session. Here are the details of your booking:
            </p>

            <!-- Details Card -->
            <div style="background-color: #141417; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin-bottom: 30px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; width: 30%;">Expert</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #f1f5f9; font-weight: 500;">
                    <strong>${interviewer.name}</strong><br/>
                    <span style="font-size: 12px; color: #94a3b8;">${interviewer.title || "Senior Software Engineer"} @ ${interviewer.company || "Top Tech"}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Date & Time</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #f1f5f9; font-weight: 500;">${sessionTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Duration</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #f1f5f9;">60 minutes</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Rate</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #fbbf24; font-weight: 600;">${booking.creditsCharged} Credits</td>
                </tr>
              </table>
            </div>

            <!-- Join Action Call -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${joinUrl}" target="_blank" style="display: inline-block; background-color: #fbbf24; color: #000000; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 32px; border-radius: 8px; transition: background-color 0.2s;">
                Join Video Call
              </a>
              <div style="font-size: 11px; color: #6b7280; margin-top: 10px;">
                You can join this link up to 10 minutes prior to your scheduled time.
              </div>
            </div>

            <!-- Footer Notes -->
            <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; font-size: 12px; color: #6b7280; text-align: center; line-height: 1.5;">
              Have questions or need to reschedule? Visit your <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/appointments" style="color: #fbbf24; text-decoration: none;">Appointments Panel</a>.<br/>
              Thank you for preparing with Kublet!
            </div>
            
          </div>
        </body>
        </html>
      `,
    });
    console.log(`✅ Booking confirmation email sent successfully to interviewee: ${interviewee.email}`);
  } catch (err) {
    console.error("❌ Failed to send booking confirmation email to interviewee:", err);
  }

  // 2. Email to the Admin (Booking Alert)
  try {
    await resend.emails.send({
      from: "Kublet Alerts <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `New Booking Alert: ${interviewee.name} ➜ ${interviewer.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Booking Alert</title>
        </head>
        <body style="background-color: #000000; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f11; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 20px; font-weight: bold; letter-spacing: 0.1em; color: #fbbf24;">KUBLET SYSTEM REPORT</span>
            </div>

            <h3 style="font-size: 16px; color: #ffffff; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
              📅 New Mock Interview Booked
            </h3>

            <div style="background-color: #141417; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px; font-size: 14px; line-height: 1.6;">
              <p style="margin: 6px 0;"><strong>Interviewee:</strong> ${interviewee.name} (${interviewee.email})</p>
              <p style="margin: 6px 0;"><strong>Interviewer:</strong> ${interviewer.name} (${interviewer.email})</p>
              <p style="margin: 6px 0;"><strong>Time Slot:</strong> ${sessionTime}</p>
              <p style="margin: 6px 0;"><strong>Credits Charged:</strong> ${booking.creditsCharged} Credits</p>
              <p style="margin: 6px 0;"><strong>Stream Call ID:</strong> <code>${booking.streamCallId}</code></p>
            </div>

            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              This is an automated system event notification from your Kublet deployment.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`✅ Admin booking alert email sent successfully to: ${ADMIN_EMAIL}`);
  } catch (err) {
    console.error("❌ Failed to send admin booking alert email:", err);
  }
}

/**
 * Send Withdrawal Request Email to Admin
 */
export async function sendWithdrawalEmail({
  interviewerName,
  interviewerEmail,
  credits,
  platformFee,
  netAmount,
  paymentMethod,
  paymentDetail,
  payoutId,
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY is not set in environment variables. Email sending skipped.");
    return;
  }

  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payout/${payoutId}`;

  try {
    await resend.emails.send({
      from: "Kublet Payouts <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `Withdrawal Request: ${interviewerName} — ${credits} Credits`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Withdrawal Request</title>
        </head>
        <body style="background-color: #000000; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f11; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 20px; font-weight: bold; letter-spacing: 0.1em; color: #ef4444;">PAYOUT REQUEST</span>
            </div>

            <h3 style="font-size: 16px; color: #ffffff; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
              💸 Payout Request Submitted
            </h3>

            <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
              Interviewer <strong>${interviewerName}</strong> (${interviewerEmail}) has submitted a request to withdraw their earned credits balance.
            </p>

            <div style="background-color: #141417; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px; font-size: 14px; line-height: 1.6;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; width: 40%;">Credits Withdrawn</td>
                  <td style="padding: 6px 0; color: #f1f5f9; font-weight: 500;">${credits} Credits ($${(credits * 5).toFixed(2)})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Platform Fee (20%)</td>
                  <td style="padding: 6px 0; color: #ef4444;">$${platformFee.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 1px solid rgba(255,255,255,0.08);">
                  <td style="padding: 8px 0; color: #fbbf24; font-weight: 600;">Net Payout Amount</td>
                  <td style="padding: 8px 0; color: #fbbf24; font-weight: 600; font-size: 16px;">$${netAmount.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 1px solid rgba(255,255,255,0.08);">
                  <td style="padding: 8px 0; color: #6b7280;">Payment Method</td>
                  <td style="padding: 8px 0; color: #f1f5f9; font-weight: 500;">${paymentMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Details</td>
                  <td style="padding: 6px 0; color: #f1f5f9; font-family: monospace;">${paymentDetail}</td>
                </tr>
              </table>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${reviewUrl}" target="_blank" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 32px; border-radius: 8px; transition: background-color 0.2s;">
                Review and Authorize Payout
              </a>
            </div>

            <p style="font-size: 11px; color: #6b7280; text-align: center; margin: 0;">
              This is a secure billing trigger notification. Please review the details carefully before releasing funds.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`✅ Withdrawal request alert email sent successfully to admin: ${ADMIN_EMAIL}`);
  } catch (err) {
    console.error("❌ Failed to send withdrawal request email:", err);
  }
}
