import { Resend } from "resend";
import serverConfig from "../config/server.config";

const resend = new Resend(serverConfig.RESEND_API_KEY);

class EmailService {
  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${serverConfig.APP_URL}/verify-email?token=${token}`;
    const html = `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `;

    const { data, error } = await resend.emails.send({
      from: serverConfig.EMAIL_FROM!,
      to: email,
      subject: "Verify your email address ",
      html,
    });

    if (error) {
      throw error;
    }
  }
}

export const emailService = new EmailService();
