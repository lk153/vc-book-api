export class SendWelcomeEmail {
  constructor(emailService) {
    this.emailService = emailService;
  }

  async execute(userEmail) {
    return this.emailService.send({
      to: userEmail,
      subject: `BookStore - Xin chào!`,
      htmlContent: `
        <h1>Xin chào 👋 🎉 ${userEmail}</h1>
        <p>Tài khoản của bạn đã được tạo thành công.</p>
      `,
      textContent: `Xin chào ${userEmail}! Tài khoản của bạn đã được tạo thành công.`
    });
  }
}
