import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendBookingConfirmation({
  to, name, service, date, time,
}: {
  to: string; name: string; service: string; date: string; time: string;
}) {
  const t = getTransporter();
  await t.sendMail({
    from: `IkeBlendz <${process.env.SMTP_USER}>`,
    to,
    subject: "Your IkeBlendz Appointment is Confirmed",
    text: [
      `Hey ${name},`,
      ``,
      `Your appointment is confirmed!`,
      ``,
      `Service: ${service}`,
      `Date: ${date}`,
      `Time: ${time}`,
      ``,
      `Payment is due in person. If you're 10+ minutes late, an additional $10 will be charged.`,
      `To cancel, please do so at least 24 hours before your appointment.`,
      ``,
      `See you soon,`,
      `IkeBlendz`,
    ].join("\n"),
  });
}

export async function sendCancellationNotice({
  to, name, service, date, time,
}: {
  to: string; name: string; service: string; date: string; time: string;
}) {
  const t = getTransporter();
  await t.sendMail({
    from: `IkeBlendz <${process.env.SMTP_USER}>`,
    to,
    subject: "Your IkeBlendz Appointment Has Been Cancelled",
    text: [
      `Hey ${name},`,
      ``,
      `Your appointment has been cancelled by IkeBlendz.`,
      ``,
      `Service: ${service}`,
      `Date: ${date}`,
      `Time: ${time}`,
      ``,
      `To rebook, visit ikeblendz.com/book`,
      ``,
      `IkeBlendz`,
    ].join("\n"),
  });
}
