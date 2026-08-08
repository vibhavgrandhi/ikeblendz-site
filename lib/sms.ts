import nodemailer from "nodemailer";

export async function sendSms(body: string): Promise<void> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.IKE_SMS_EMAIL; // e.g. 5106950297@vtext.com

  if (!user || !pass || !to) return;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: user,
    to,
    subject: "",
    text: body,
  });
}
