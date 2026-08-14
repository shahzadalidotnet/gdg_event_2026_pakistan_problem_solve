const nodemailer = require('nodemailer');

function createMailer(config) {
  const smtpReady = Boolean(config.smtp.host && config.smtp.user && config.smtp.pass && config.adminEmail);
  const transporter = smtpReady
    ? nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      })
    : null;

  async function sendReportAlert(report) {
    const text = [
      'A citizen submitted an outdated-guide report.',
      `Guide: ${report.guideSlug}`,
      `Message: ${report.message}`,
      `Visited on: ${report.visitedOn || 'Not supplied'}`,
      `City: ${report.city || 'Not supplied'}`,
      `Reporter email: ${report.reporterEmail || 'Not supplied'}`,
    ].join('\n');

    if (!transporter) {
      console.log(`[email fallback]\n${text}`);
      return;
    }

    await transporter.sendMail({
      from: config.smtp.from,
      to: config.adminEmail,
      replyTo: report.reporterEmail || undefined,
      subject: `[Sahi Tareeqa] New report for ${report.guideSlug}`,
      text,
    });
  }

  return { sendReportAlert };
}

module.exports = { createMailer };
