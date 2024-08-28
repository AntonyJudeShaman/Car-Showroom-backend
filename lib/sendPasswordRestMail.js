const nodemailer = require('nodemailer');
const logger = require('../config/winston');
const errorMessages = require('../config/errors');

module.exports = async (username, to, subject, token) => {
  try {
    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff; color: #000000;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                  <td style="padding: 20px 0; text-align: center;">
                      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                          <tr>
                              <td style="background-color: #ffffff; padding: 40px 30px; text-align: center; border: 1px solid #000000; border-radius: 15px;">
                                  <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #000000;">Password Reset for ${username}</h1>
                                  <p style="margin: 20px 0; font-size: 16px; line-height: 1.5; color: #000000;">Click the button below to reset your password:</p>
                                  <a href="http://localhost:4000/reset-password/${token}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 8px;">Reset Password</a>
                                  </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;
    const mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'antonyjudeshaman.24cs@licet.ac.in',
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailDetails = {
      from: 'AJS Car Showroom',
      to,
      subject,
      html: content,
    };

    const res = await mailTransporter.sendMail(mailDetails);
    logger.info(
      `Password Reset Email sent to ${to} successfully - ${new Date().toLocaleString()} - Message ID: ${
        res.messageId
      }`,
    );
    return { success: true };
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    return { success: false, error: errorMessages.FAILED_TO_SEND_EMAIL };
  }
};
