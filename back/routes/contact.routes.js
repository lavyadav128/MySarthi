// import express from "express";
// import nodemailer from "nodemailer";
// import Joi from "joi";
// import xss from "xss";
// import rateLimit from "express-rate-limit";

// const router = express.Router();

// /* -------------------- RATE LIMIT -------------------- */
// const contactLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Too many requests. Please try again later.",
//   },
// });

// /* -------------------- VALIDATION -------------------- */
// const contactSchema = Joi.object({
//   name: Joi.string()
//     .trim()
//     .min(2)
//     .max(50)
//     .pattern(/^[a-zA-Z\s]+$/)
//     .required(),

//   email: Joi.string()
//     .trim()
//     .email({ tlds: { allow: false } })
//     .required(),

//   message: Joi.string()
//     .trim()
//     .min(10)
//     .max(500)
//     .required(),
// });

// /* -------------------- SMTP TRANSPORT (ONCE) -------------------- */
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST, // smtpout.secureserver.net
//   port: Number(process.env.SMTP_PORT), // 465 or 587
//   secure: process.env.SMTP_PORT === "465",
//   auth: {
//     user: process.env.SMTP_USER, // contactus@mysaarthi.co
//     pass: process.env.SMTP_PASS,
//   },
// });

// /* -------------------- ROUTE -------------------- */
// router.post("/contact", contactLimiter, async (req, res) => {
//   const { error, value } = contactSchema.validate(req.body, {
//     abortEarly: true,
//   });

//   if (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.details[0].message,
//     });
//   }

//   // XSS sanitize
//   const name = xss(value.name);
//   const email = xss(value.email);
//   const message = xss(value.message);

//   try {
//     await transporter.sendMail({
//       from: `"MySaarthi Contact" <contactus@mysaarthi.co>`,
//       to: "contactus@mysaarthi.co",
//       replyTo: email,
//       subject: `New Contact Message from ${name}`,
//       html: `
//         <div style="font-family:Arial,sans-serif;max-width:600px">
//           <h2>New Website Contact</h2>
//           <p><strong>Name:</strong> ${name}</p>
//           <p><strong>Email:</strong> ${email}</p>
//           <hr />
//           <p style="white-space:pre-line">${message}</p>
//         </div>
//       `,
//     });

//     return res.json({
//       success: true,
//       message: "Message sent successfully!",
//     });
//   } catch (err) {
//     console.error("Contact Email Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to send message. Please try again later.",
//     });
//   }
// });

// export default router;


import express from "express";
import { Resend } from "resend";
import Joi from "joi";
import xss from "xss";
import rateLimit from "express-rate-limit";

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_FROM = process.env.FROM_EMAIL || "MySaarthi <onboarding@resend.dev>";
const CONTACT_TO = process.env.CONTACT_TO_EMAIL || "contactus@mysaarthi.co";

/* -------------------- RATE LIMIT -------------------- */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/* -------------------- VALIDATION -------------------- */
const contactSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required(),

  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required(),

  message: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required(),
});

/* -------------------- ROUTE -------------------- */
router.post("/contact", contactLimiter, async (req, res) => {
  const { error, value } = contactSchema.validate(req.body, {
    abortEarly: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  // XSS sanitize
  const name = xss(value.name);
  const email = xss(value.email);
  const message = xss(value.message);

  try {
    const { error: sendError } = await resend.emails.send({
      from: CONTACT_FROM,
      to: CONTACT_TO,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px">
          <h2>New Website Contact</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr />
          <p style="white-space:pre-line">${message}</p>
        </div>
      `,
    });

    if (sendError) {
      throw new Error(sendError.message || "Resend API error");
    }

    return res.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (err) {
    console.error("Contact Email Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
});

export default router;
