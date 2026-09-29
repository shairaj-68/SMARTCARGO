import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"LCL Marketplace" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendBookingConfirmationEmail = async (to: string, bookingDetails: any) => {
  const subject = `Booking Requested - ${bookingDetails.bookingNumber}`;
  const html = `
    <h2>Booking Request Submitted</h2>
    <p>Your booking request for ${bookingDetails.requiredCBM} CBM has been successfully submitted to the carrier.</p>
    <p>Booking ID: ${bookingDetails.bookingNumber}</p>
    <p>We will notify you once the carrier accepts the request.</p>
  `;
  return sendEmail(to, subject, html);
};

export const sendPaymentSuccessEmail = async (to: string, paymentDetails: any) => {
  const subject = `Payment Successful - ${paymentDetails.bookingNumber}`;
  const html = `
    <h2>Payment Receipt</h2>
    <p>Your payment of $${paymentDetails.amount} for booking ${paymentDetails.bookingNumber} was successful.</p>
    <p>Your booking is now confirmed. You can coordinate further details with the carrier via the chat portal.</p>
  `;
  return sendEmail(to, subject, html);
};
