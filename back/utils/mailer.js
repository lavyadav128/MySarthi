// import nodemailer from "nodemailer";

// /* ---------------- ENV VARIABLES ---------------- */

// const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
// const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
// const SMTP_USER = process.env.SMTP_USER;
// const SMTP_PASS = process.env.SMTP_PASS;

// if (!SMTP_USER || !SMTP_PASS) {
//   throw new Error("❌ SMTP credentials missing in .env");
// }

// /* ---------------- CREATE TRANSPORTER ---------------- */

// const transporter = nodemailer.createTransport({
//   host: SMTP_HOST,
//   port: SMTP_PORT,

//   // true ONLY for port 465
//   secure: SMTP_PORT === 465,

//   auth: {
//     user: SMTP_USER,
//     pass: SMTP_PASS,
//   },

//   tls: {
//     rejectUnauthorized: false,
//   },

//   connectionTimeout: 10000,
//   greetingTimeout: 10000,
//   socketTimeout: 10000,
// });

// /* ---------------- VERIFY SMTP CONNECTION ---------------- */

// (async () => {
//   try {
//     await transporter.verify();
//     console.log("✅ SMTP Server Ready");
//   } catch (error) {
//     console.error("❌ SMTP Verification Failed");
//     console.error(error);
//   }
// })();

// /* ---------------- SEND OTP EMAIL ---------------- */

// export const sendEmailOTP = async ({ to, otp }) => {
//   try {
//     if (!to || !otp) {
//       throw new Error("Email or OTP missing");
//     }

//     const mailOptions = {
//       from: `"MySaarthi" <${SMTP_USER}>`,
//       to,
//       subject: "Verify your email",

//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding:20px;">
          
//           <h2 style="color:#333;">Email Verification</h2>

//           <p>Your OTP code is:</p>

//           <div
//             style="
//               font-size:32px;
//               font-weight:bold;
//               letter-spacing:6px;
//               background:#f4f4f4;
//               padding:16px;
//               text-align:center;
//               border-radius:8px;
//               margin:20px 0;
//             "
//           >
//             ${otp}
//           </div>

//           <p>
//             This OTP is valid for <b>5 minutes</b>.
//           </p>

//           <hr style="margin:24px 0;" />

//           <p style="font-size:12px; color:#888;">
//             If you did not request this email, you can safely ignore it.
//           </p>

//         </div>
//       `,
//     };

//     const info = await transporter.sendMail(mailOptions);

//     console.log("✅ OTP Email Sent");
//     console.log("📩 Message ID:", info.messageId);

//     return {
//       success: true,
//       messageId: info.messageId,
//     };
//   } catch (error) {
//     console.error("❌ Failed to send OTP email");
//     console.error("Message:", error.message);

//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// };

import { Resend } from "resend";

/* ---------------- ENV VARIABLES ---------------- */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Use your verified domain once set up, e.g. "MySaarthi <otp@yourdomain.com>"
// Until you verify a domain in Resend, you can only send TO your own Resend account email
// using the shared test sender below.
const FROM_EMAIL = process.env.FROM_EMAIL || "MySaarthi <onboarding@resend.dev>";

if (!RESEND_API_KEY) {
  throw new Error("❌ RESEND_API_KEY missing in .env");
}

const resend = new Resend(RESEND_API_KEY);

/* ---------------- SEND OTP EMAIL ---------------- */

export const sendEmailOTP = async ({ to, otp }) => {
  try {
    if (!to || !otp) {
      throw new Error("Email or OTP missing");
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
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
    });

    if (error) {
      throw new Error(error.message || "Resend API error");
    }

    console.log("✅ OTP Email Sent");
    console.log("📩 Message ID:", data.id);

    return {
      success: true,
      messageId: data.id,
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