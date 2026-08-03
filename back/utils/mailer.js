import nodemailer from "nodemailer";

/* ---------------- ENV VARIABLES ---------------- */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_USER || !SMTP_PASS) {
  // Don't crash the whole server on boot — log loudly instead so the rest
  // of the app (login, profiles, etc.) still works even if email is broken.
  console.error(
    "⚠️  SMTP_USER / SMTP_PASS are not set. Verification emails will fail until these are configured in your environment variables (e.g. Render/Railway dashboard, not just a local .env file)."
  );
}

/* ---------------- CREATE TRANSPORTER ---------------- */

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,

  // true ONLY for port 465
  secure: SMTP_PORT === 465,

  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

/* ---------------- VERIFY SMTP CONNECTION ---------------- */

(async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP Server Ready");
  } catch (error) {
    console.error("❌ SMTP Verification Failed");
    console.error(error);
  }
})();

/* ---------------- SEND OTP EMAIL ---------------- */

export const sendEmailOTP = async ({ to, otp }) => {
  try {
    if (!to || !otp) {
      throw new Error("Email or OTP missing");
    }

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error(
        "SMTP credentials are not configured on this server (SMTP_USER/SMTP_PASS env vars missing)."
      );
    }

    const mailOptions = {
      from: `"MySaarthi" <${SMTP_USER}>`,
      to,
      subject: "Verify your email",

      html: `
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
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ OTP Email Sent");
    console.log("📩 Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
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