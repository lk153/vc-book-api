export class SendResetPassword {
  constructor(emailService) {
    this.emailService = emailService;
  }

  async execute(userEmail, resetUrl) {
    const content = `Nhấp vào liên kết để đặt lại mật khẩu của bạn: ${resetUrl}`
    return this.emailService.send({
      to: userEmail,
      subject: 'Yêu cầu đặt lại mật khẩu',
      htmlContent: `
        <h1>Yêu cầu đặt lại mật khẩu 🎉</h1>
        <p>Vui lòng nhấn vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
        <a href="${resetUrl}">Đặt lại mật khẩu</a>
      `,
      textContent: content
    });
  }
}
