import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

export const sendBookingConfirmation = async (to: string, bookingNumber: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1E40AF;">Booking Confirmed</h2>
      <p>Your booking <strong>${bookingNumber}</strong> has been confirmed.</p>
      <p>You can track your shipment in the dashboard.</p>
      <br/>
      <p>Best regards,<br/>LCL Marketplace Team</p>
    </div>
  `;
  await sendEmail(to, `Booking Confirmed - ${bookingNumber}`, html);
};

export const sendPaymentReceipt = async (to: string, amount: number, transactionId: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1E40AF;">Payment Received</h2>
      <p>We have received your payment of <strong>$${amount}</strong>.</p>
      <p>Transaction ID: <strong>${transactionId}</strong></p>
      <br/>
      <p>Best regards,<br/>LCL Marketplace Team</p>
    </div>
  `;
  await sendEmail(to, 'Payment Receipt', html);
};
