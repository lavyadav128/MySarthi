import { Resend } from "resend";

/* ---------------- ENV VARIABLES ----------------
   Render (and most free hosts) block outbound SMTP ports 587/465, so
   nodemailer + Gmail SMTP will ALWAYS time out there even with correct
   credentials. Resend sends over normal HTTPS (443), which is never
   blocked, so we use their HTTP API instead of raw SMTP.
------------------------------------------------- */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Fallback sender: Resend's shared test address works with zero setup,
// but can only send to the email you signed up to Resend with. For real
// users, set MAIL_FROM to an address on a domain you've verified in the
// Resend dashboard, e.g. MAIL_FROM="MySaarthi <noreply@yourdomain.com>"
const MAIL_FROM = process.env.FROM_EMAIL || process.env.MAIL_FROM || "MySaarthi <onboarding@resend.dev>";
if (!RESEND_API_KEY) {
  console.error(
    "⚠️  RESEND_API_KEY is not set. Verification emails will fail until this is configured in your environment variables (Render dashboard → Environment)."
  );
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

console.log(
  RESEND_API_KEY
    ? "✅ Resend email client ready"
    : "❌ Resend email client NOT configured (missing RESEND_API_KEY)"
);

/* ---------------- SEND OTP EMAIL ---------------- */

export const sendEmailOTP = async ({ to, otp }) => {
  try {
    if (!to || !otp) {
      throw new Error("Email or OTP missing");
    }

    if (!resend) {
      throw new Error(
        "Resend is not configured on this server (RESEND_API_KEY env var missing)."
      );
    }

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding:20px;">
          
          <h2 style="color:#333;">Email Verification</h2>

          <p>Your OTP code is:</p>

          <div
            style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:6px;
              background:#f4f4f4;
              padding:16px;
              text-align:center;
              border-radius:8px;
              margin:20px 0;
            "
          >
            ${otp}
          </div>

          <p>
            This OTP is valid for <b>5 minutes</b>.
          </p>

          <hr style="margin:24px 0;" />

          <p style="font-size:12px; color:#888;">
            If you did not request this email, you can safely ignore it.
          </p>

        </div>
      `;

    const { data, error: resendError } = await resend.emails.send({
      from: MAIL_FROM,
      to,
      subject: "Verify your email",
      html,
    });

    if (resendError) {
      // Resend returns errors as a data field instead of throwing
      throw new Error(resendError.message || JSON.stringify(resendError));
    }

    console.log("✅ OTP Email Sent");
    console.log("📩 Message ID:", data?.id);

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("❌ Failed to send OTP email");
    console.error("Message:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};