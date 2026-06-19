import nodemailer from 'nodemailer';
import { env } from '../config/env';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Invisible Algorithm</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e2e8f0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid #1e1e2e; }
    .logo { font-size: 20px; font-weight: 700; color: #6366f1; letter-spacing: -0.5px; }
    .logo span { color: #22d3ee; }
    .content { background: #111118; border: 1px solid #1e1e2e; border-radius: 12px; padding: 40px; margin-bottom: 30px; }
    h1 { font-size: 24px; font-weight: 700; color: #f1f5f9; margin-bottom: 16px; }
    p { color: #94a3b8; line-height: 1.7; margin-bottom: 16px; }
    .button { display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 20px 0; }
    .divider { border: none; border-top: 1px solid #1e1e2e; margin: 24px 0; }
    .footer { text-align: center; color: #475569; font-size: 12px; }
    .highlight { color: #6366f1; font-weight: 600; }
    .badge { display: inline-block; background: rgba(99,102,241,0.1); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">The Invisible <span>Algorithm</span></div>
    </div>
    ${content}
    <div class="footer">
      <p>The Invisible Algorithm — International Student Technology Non-Profit</p>
      <p style="margin-top: 8px;">© ${new Date().getFullYear()} The Invisible Algorithm. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendApplicationConfirmation = async (
  to: string,
  name: string
): Promise<void> => {
  if (!env.SMTP_USER) return;

  const transporter = createTransporter();
  const content = `
    <div class="content">
      <div class="badge">Application Received</div>
      <h1 style="margin-top: 20px;">Welcome, ${name}!</h1>
      <p>Thank you for applying to join <span class="highlight">The Invisible Algorithm</span>. We've received your membership application and our team will review it carefully.</p>
      <p>The review process typically takes <strong style="color: #e2e8f0;">5-10 business days</strong>. We'll notify you by email with our decision.</p>
      <hr class="divider">
      <p>In the meantime, explore our research publications, upcoming events, and learning resources on our platform.</p>
      <a href="${env.FRONTEND_URL}" class="button">Visit Our Platform</a>
      <p style="margin-top: 20px; font-size: 13px; color: #475569;">If you have any questions, contact us at contact@theinvisiblealgorithm.org</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
    to,
    subject: 'Application Received — The Invisible Algorithm',
    html: emailWrapper(content),
  });
};

export const sendApplicationStatusUpdate = async (
  to: string,
  name: string,
  status: string,
  notes?: string
): Promise<void> => {
  if (!env.SMTP_USER) return;

  const transporter = createTransporter();
  const isAccepted = status === 'accepted';
  const isRejected = status === 'rejected';

  const content = `
    <div class="content">
      <div class="badge">${isAccepted ? 'Accepted' : isRejected ? 'Application Update' : status.charAt(0).toUpperCase() + status.slice(1)}</div>
      <h1 style="margin-top: 20px;">Dear ${name},</h1>
      ${isAccepted ? `
        <p>We're thrilled to welcome you to <span class="highlight">The Invisible Algorithm</span>! Your application has been accepted, and you are now an official member of our international community.</p>
        <p>As a member, you'll have access to our research network, workshops, collaboration opportunities, and member-exclusive resources.</p>
        <a href="${env.FRONTEND_URL}/auth/login" class="button">Access Your Account</a>
      ` : isRejected ? `
        <p>Thank you for your interest in joining <span class="highlight">The Invisible Algorithm</span>. After careful review, we are unable to offer membership at this time.</p>
        <p>We encourage you to continue developing your skills and apply again in the future. Our community remains open for you to engage with our public content and events.</p>
        ${notes ? `<p style="background: #0d0d14; border: 1px solid #1e1e2e; border-radius: 8px; padding: 16px; margin-top: 16px;">${notes}</p>` : ''}
      ` : `
        <p>Your application status has been updated to: <span class="highlight">${status}</span>.</p>
        ${notes ? `<p>${notes}</p>` : ''}
      `}
    </div>
  `;

  await transporter.sendMail({
    from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
    to,
    subject: `Application Update — The Invisible Algorithm`,
    html: emailWrapper(content),
  });
};

export const sendContactConfirmation = async (
  to: string,
  name: string,
  subject: string
): Promise<void> => {
  if (!env.SMTP_USER) return;

  const transporter = createTransporter();
  const content = `
    <div class="content">
      <h1>Message Received</h1>
      <p>Hello ${name},</p>
      <p>Thank you for reaching out to <span class="highlight">The Invisible Algorithm</span>. We've received your message regarding <strong style="color: #e2e8f0;">"${subject}"</strong> and will respond within 2-3 business days.</p>
      <hr class="divider">
      <a href="${env.FRONTEND_URL}" class="button">Visit Our Platform</a>
    </div>
  `;

  await transporter.sendMail({
    from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
    to,
    subject: 'Message Received — The Invisible Algorithm',
    html: emailWrapper(content),
  });
};

export const sendPasswordReset = async (
  to: string,
  name: string,
  resetToken: string
): Promise<void> => {
  if (!env.SMTP_USER) return;

  const transporter = createTransporter();
  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  const content = `
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password for your Invisible Algorithm account. Click the button below to create a new password.</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <hr class="divider">
      <p style="font-size: 13px; color: #475569;">This link expires in <strong style="color: #e2e8f0;">1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
    to,
    subject: 'Password Reset — The Invisible Algorithm',
    html: emailWrapper(content),
  });
};
