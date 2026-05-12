import nodemailer from 'nodemailer'
import { config } from '../config.js'

const smtpTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: config.mailFrom,
    pass: config.mailPassword,
  },
})

/**
 * Sends email via MailTrap API (primary) with SMTP as fallback.
 * Mirrors the logic from MailTrapClient.java + EmailService.java.
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  isHtml: boolean,
): Promise<void> {
  const payload: Record<string, unknown> = {
    from: { email: 'no-reply@diet-dash.com' },
    to: [{ email: to }],
    subject,
  }

  if (isHtml) {
    payload.html = body
  } else {
    payload.text = body
  }

  try {
    const res = await fetch(config.mailtrapEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.mailtrapApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('MailTrap error:', res.status, text)
      throw new Error(`MailTrap API returned ${res.status}`)
    }
  } catch (err) {
    // SMTP fallback (mirrors Spring's EmailService)
    console.warn('MailTrap failed, falling back to SMTP:', err)
    await smtpTransport.sendMail({
      from: config.mailFrom,
      to,
      subject,
      [isHtml ? 'html' : 'text']: body,
    })
  }
}

export function buildConfirmationEmailHtml(token: string, type: string, buttonText: string, domain: string): string {
  return `<html>
<body style='font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;'>
<div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);'>
<h2 style='color: #333333; text-align: center;'>Diet dash instructions. </h2>
<p style='font-size: 16px; color: #666666;'>Dear customer,</p>
<p style='font-size: 16px; color: #666666;'>Please click the button below and follow instructions: </p>
<div style='text-align: center; margin: 20px;'>
<a href='https://${domain}/${type}?token=${token}' style='font-size: 18px; color: #ffffff; background-color: #4CAF50; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;'>${buttonText}</a>
</div>
<p style='font-size: 14px; color: #666666;'>Thank you,<br>The Diet Dash Team</p>
</div>
</body>
</html>`
}
