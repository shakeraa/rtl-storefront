/**
 * Email Service
 * Sends transactional emails using Shopify Email or external provider
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using configured provider
 * Currently supports: SMTP (via env vars), Shopify Email API (future)
 */
export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  const provider = process.env.EMAIL_PROVIDER || "mock";

  try {
    switch (provider) {
      case "smtp":
        return await sendViaSMTP(payload);
      case "sendgrid":
        return await sendViaSendGrid(payload);
      case "mock":
      default:
        return await sendMock(payload);
    }
  } catch (error) {
    console.error("Email send failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send via SMTP (nodemailer)
 */
async function sendViaSMTP(payload: EmailPayload): Promise<SendResult> {
  // Dynamic import to avoid bundling nodemailer if not needed
  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: payload.from || process.env.EMAIL_FROM || "noreply@rtl-storefront.app",
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  return {
    success: true,
    messageId: info.messageId,
  };
}

/**
 * Send via SendGrid
 */
async function sendViaSendGrid(payload: EmailPayload): Promise<SendResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY not configured");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: payload.to }] }],
      from: { email: payload.from || process.env.EMAIL_FROM || "noreply@rtl-storefront.app" },
      subject: payload.subject,
      content: [
        { type: "text/html", value: payload.html },
        payload.text ? { type: "text/plain", value: payload.text } : undefined,
      ].filter(Boolean),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }

  return {
    success: true,
    messageId: response.headers.get("X-Message-Id") || undefined,
  };
}

/**
 * Mock sender - logs to console (for development)
 */
async function sendMock(payload: EmailPayload): Promise<SendResult> {
  console.log("\n📧 MOCK EMAIL SENT:");
  console.log("To:", payload.to);
  console.log("Subject:", payload.subject);
  console.log("From:", payload.from || "noreply@rtl-storefront.app");
  console.log("-------------------");

  return {
    success: true,
    messageId: `mock_${Date.now()}`,
  };
}

/**
 * Send team invitation email
 */
export async function sendTeamInviteEmail(params: {
  email: string;
  shop: string;
  role: string;
  inviteUrl: string;
  invitedBy: string;
  expiresAt: Date;
}): Promise<SendResult> {
  const { email, shop, role, inviteUrl, invitedBy, expiresAt } = params;

  const formattedDate = expiresAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been invited to join RTL Storefront</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #5c6ac4; }
    .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
    .button { display: inline-block; background: #5c6ac4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .button:hover { background: #4f5ab6; }
    .details { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .detail-label { color: #666; }
    .detail-value { font-weight: 500; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .expiry { color: #c05717; font-weight: 500; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🌍 RTL Storefront</div>
  </div>
  
  <div class="content">
    <h2>You've been invited!</h2>
    <p><strong>${invitedBy}</strong> has invited you to join the team for <strong>${shop}</strong> on RTL Storefront.</p>
    
    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Store:</span>
        <span class="detail-value">${shop}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Role:</span>
        <span class="detail-value">${roleDisplay}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Expires:</span>
        <span class="detail-value expiry">${formattedDate}</span>
      </div>
    </div>
    
    <p>Click the button below to accept the invitation and join the team:</p>
    
    <center>
      <a href="${inviteUrl}" class="button">Accept Invitation</a>
    </center>
    
    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      Or copy and paste this link: <br>
      <code style="word-break: break-all;">${inviteUrl}</code>
    </p>
  </div>
  
  <div class="footer">
    <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    <p>RTL Storefront - Automatic RTL for Arabic, Hebrew & More</p>
  </div>
</body>
</html>
  `;

  const text = `
You've been invited to join RTL Storefront!

${invitedBy} has invited you to join the team for ${shop}.

Role: ${roleDisplay}
Expires: ${formattedDate}

Accept your invitation: ${inviteUrl}

If you didn't expect this invitation, you can safely ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: `Invitation to join RTL Storefront - ${shop}`,
    html,
    text,
  });
}

/**
 * Send invitation resent notification
 */
export async function sendInviteResentEmail(params: {
  email: string;
  shop: string;
  inviteUrl: string;
  expiresAt: Date;
}): Promise<SendResult> {
  const { email, shop, inviteUrl, expiresAt } = params;

  const formattedDate = expiresAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder: Your RTL Storefront Invitation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #5c6ac4; }
    .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
    .button { display: inline-block; background: #5c6ac4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .expiry { color: #c05717; font-weight: 500; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🌍 RTL Storefront</div>
  </div>
  
  <div class="content">
    <h2>Reminder: Your Invitation</h2>
    <p>This is a reminder that you have a pending invitation to join <strong>${shop}</strong>.</p>
    
    <p class="expiry">Your invitation expires on ${formattedDate}.</p>
    
    <center>
      <a href="${inviteUrl}" class="button">Accept Invitation</a>
    </center>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: `Reminder: Your RTL Storefront Invitation - ${shop}`,
    html,
    text: `Reminder: You have a pending invitation to join ${shop}. Accept here: ${inviteUrl}`,
  });
}
