import { transporter } from '../../../utils/mailer';

export const EmailService = {
  async send(to: string, subject: string, message: string): Promise<void> {
    const ticketUrl = `${process.env.FRONTEND_URL}/employee/view-tickets?id=`;

    const htmlTemplate = `
      <div style="background:#f6f9fc;padding:40px 0;font-family:Arial, sans-serif;">
        <div style="max-width:600px;margin:auto;background:#fff;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.08);overflow:hidden;">
          <div style="background:#1a73e8;padding:18px 25px;color:#fff;">
            <h2 style="margin:0;font-weight:500;">Ticket Management System</h2>
          </div>
          <div style="padding:25px 30px;">
            <h3 style="color:#202124;font-weight:500;">${subject}</h3>
            <p style="color:#5f6368;font-size:15px;line-height:1.6;">${message}</p>
            <a href=${ticketUrl}
              style="background:#1a73e8;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;display:inline-block;margin-top:20px;">
              View Ticket
            </a>
          </div>
          <div style="border-top:1px solid #e0e0e0;background:#fafafa;padding:15px;text-align:center;font-size:12px;color:#777;">
            © ${new Date().getFullYear()} Ticket App — All rights reserved.
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Ticket App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlTemplate,
    });
  },
};
