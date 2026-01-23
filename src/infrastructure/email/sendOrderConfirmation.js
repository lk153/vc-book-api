export class SendOrderConfirmation {
  constructor(emailService) {
    this.emailService = emailService;
  }

  async execute(userEmail, order) {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.subtotal}</td>
      </tr>
    `).join('');

    const itemsText = order.items.map(item =>
      `- ${item.title} x${item.quantity}: $${item.subtotal}`
    ).join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th { background: #f5f5f5; padding: 10px; text-align: left; }
          .summary { margin-top: 20px; padding: 15px; background: #fff; border: 1px solid #ddd; }
          .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; }
          .address { margin: 20px 0; padding: 15px; background: #fff; border: 1px solid #ddd; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <p>Thank you for your order!</p>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

            <h3>Order Details</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${order.summary.subtotal}</span>
              </div>
              <div class="summary-row">
                <span>Shipping:</span>
                <span>$${order.summary.shippingFee}</span>
              </div>
              <div class="summary-row">
                <span>Tax:</span>
                <span>$${order.summary.tax}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>$${order.summary.total}</span>
              </div>
            </div>

            <div class="address">
              <h3>Shipping Address</h3>
              <p>
                ${order.shippingAddress.fullName}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}${order.shippingAddress.state ? ', ' + order.shippingAddress.state : ''} ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}<br>
                Phone: ${order.shippingAddress.phone}
              </p>
            </div>
          </div>
          <div class="footer">
            <p>If you have any questions about your order, please contact us.</p>
            <p>&copy; BookStore</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Order Confirmation

Thank you for your order!

Order Number: ${order.orderNumber}
Payment Method: ${order.paymentMethod}

Order Details:
${itemsText}

Subtotal: $${order.summary.subtotal}
Shipping: $${order.summary.shippingFee}
Tax: $${order.summary.tax}
Total: $${order.summary.total}

Shipping Address:
${order.shippingAddress.fullName}
${order.shippingAddress.address}
${order.shippingAddress.city}${order.shippingAddress.state ? ', ' + order.shippingAddress.state : ''} ${order.shippingAddress.postalCode}
${order.shippingAddress.country}
Phone: ${order.shippingAddress.phone}

If you have any questions about your order, please contact us.
    `.trim();

    return this.emailService.send({
      to: userEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      htmlContent,
      textContent
    });
  }
}
