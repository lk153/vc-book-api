export class SendResetPassword {
  constructor(emailService) {
    this.emailService = emailService;
  }

  async execute(userEmail, resetUrl) {
    const currentYear = new Date().getFullYear();

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yêu cầu đặt lại mật khẩu</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <!-- Wrapper Table -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px 40px; background-color: #1a73e8; border-radius: 8px 8px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">Sách Hay</h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">Kho sách hay cho bạn</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Title -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #333333;">Yêu cầu đặt lại mật khẩu</h2>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 30px; font-size: 16px; line-height: 24px; color: #555555;">
                    <p style="margin: 0 0 16px 0;">Xin chào,</p>
                    <p style="margin: 0 0 16px 0;">Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="10%" stroke="f" fillcolor="#1a73e8">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Đặt lại mật khẩu</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; background-color: #1a73e8; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px; transition: background-color 0.3s;">Đặt lại mật khẩu</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 30px; font-size: 14px; line-height: 22px; color: #777777;">
                    <p style="margin: 0 0 8px 0;">Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
                    <p style="margin: 0; word-break: break-all;"><a href="${resetUrl}" style="color: #1a73e8; text-decoration: underline;">${resetUrl}</a></p>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 20px; background-color: #fff8e1; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 14px; line-height: 22px; color: #856404;">
                          <p style="margin: 0 0 8px 0; font-weight: bold;">Lưu ý bảo mật:</p>
                          <ul style="margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 4px;">Liên kết này sẽ hết hạn sau <strong>1 giờ</strong>.</li>
                            <li style="margin-bottom: 4px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</li>
                            <li style="margin-bottom: 0;">Không chia sẻ liên kết này với bất kỳ ai.</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 14px; line-height: 22px; color: #6c757d;">
                    <p style="margin: 0 0 8px 0; font-weight: bold; color: #495057;">Sách Hay</p>
                    <p style="margin: 0 0 8px 0;">Kho sách hay cho bạn đọc Việt Nam</p>
                    <p style="margin: 0 0 16px 0;">
                      <a href="mailto:support@sachhay.vn" style="color: #1a73e8; text-decoration: none;">support@sachhay.vn</a>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #adb5bd;">&copy; ${currentYear} Sách Hay. Tất cả quyền được bảo lưu.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Main Container -->
      </td>
    </tr>
  </table>
  <!-- End Wrapper Table -->
</body>
</html>
    `.trim();

    const textContent = `
Sách Hay - Yêu cầu đặt lại mật khẩu

Xin chào,

Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.

Vui lòng truy cập liên kết sau để đặt lại mật khẩu:
${resetUrl}

LƯU Ý BẢO MẬT:
- Liên kết này sẽ hết hạn sau 1 giờ.
- Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
- Không chia sẻ liên kết này với bất kỳ ai.

---
Sách Hay
Kho sách hay cho bạn đọc Việt Nam

(c) ${currentYear} Sách Hay. Tất cả quyền được bảo lưu.
    `.trim();

    return this.emailService.send({
      to: userEmail,
      subject: 'Sách Hay - Yêu cầu đặt lại mật khẩu',
      htmlContent,
      textContent
    });
  }
}
