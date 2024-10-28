// utils/sendEmail.ts
import sgMail from '@sendgrid/mail';

// Set the API key from your SendGrid account
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export default async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    const msg = {
      to,
      from: 'no-reply@yourdomain.com', // Your verified sender address
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Unable to send email');
  }
}
