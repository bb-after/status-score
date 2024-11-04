import mailgun from 'mailgun-js';

const mailgunApiKey = process.env.MAILGUN_API_KEY;
const mailgunDomain = process.env.MAILGUN_DOMAIN;

if (!mailgunApiKey || !mailgunDomain) {
  throw new Error('Missing Mailgun API key or domain in environment variables');
}

const mg = mailgun({ apiKey: mailgunApiKey, domain: mailgunDomain });

interface EmailOptions {
  to: string;
  from?: string; // Make this optional with a default value
  subject: string;
  text?: string;
  html?: string;
}

export default async function sendEmail({ to, from = 'no-reply@'+mailgunDomain, subject, text, html }: EmailOptions) {
  try {
    // Build the message object
    const msg = {
      from,
      to,
      subject,
      ...(text ? { text } : {}),
      ...(html ? { html } : {}),
    };

    // Send the email using Mailgun API
    await mg.messages().send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error('Unable to send email');
  }
}
