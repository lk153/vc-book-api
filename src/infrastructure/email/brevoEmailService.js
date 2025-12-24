import { brevoClient } from './brevoClient.js';

export class BrevoEmailService {
  /**
   * @param {Object} params
   * @param {string} params.to
   * @param {string} params.subject
   * @param {string} params.htmlContent
   * @param {string} [params.textContent]
   * @param {Array}  [params.attachments]
   */
  async send({
    to,
    subject,
    htmlContent,
    textContent,
    attachments = []
  }) {
    const payload = {
      sender: {
        email: process.env.BREVO_EMAIL,
        name: "BookStore"
      },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent,
      attachments
    };

    const response = await brevoClient.post('/smtp/email', payload);
    return response.data;
  }
}
