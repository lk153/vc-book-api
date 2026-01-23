export class SendOrderStatusNotification {
  constructor(emailService) {
    this.emailService = emailService;
  }

  getStatusConfig(status, order) {
    const configs = {
      processing: {
        subject: `Order Confirmed - ${order.orderNumber}`,
        title: 'Your Order is Being Processed',
        message: 'Great news! Your order has been confirmed and is now being prepared for shipment.',
        color: '#2196F3',
        icon: '&#128230;'
      },
      shipped: {
        subject: `Order Shipped - ${order.orderNumber}`,
        title: 'Your Order is On Its Way',
        message: `Your order has been shipped and is on its way to you!${order.trackingNumber ? ` Tracking number: ${order.trackingNumber}` : ''}`,
        color: '#FF9800',
        icon: '&#128666;'
      },
      delivered: {
        subject: `Order Delivered - ${order.orderNumber}`,
        title: 'Your Order Has Been Delivered',
        message: 'Your order has been delivered. We hope you enjoy your purchase!',
        color: '#4CAF50',
        icon: '&#9989;'
      },
      cancelled: {
        subject: `Order Cancelled - ${order.orderNumber}`,
        title: 'Your Order Has Been Cancelled',
        message: `Your order has been cancelled.${order.cancelReason ? ` Reason: ${order.cancelReason}` : ''} If you have any questions, please contact our support team.`,
        color: '#f44336',
        icon: '&#10060;'
      },
      refunded: {
        subject: `Order Refunded - ${order.orderNumber}`,
        title: 'Your Order Has Been Refunded',
        message: 'Your refund has been processed. The amount will be returned to your original payment method within 5-10 business days.',
        color: '#9C27B0',
        icon: '&#128176;'
      }
    };

    return configs[status] || null;
  }

  async execute(userEmail, order, status) {
    const config = this.getStatusConfig(status, order);

    if (!config) {
      return null;
    }

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.subtotal}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${config.color}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-icon { font-size: 48px; margin-bottom: 10px; }
          .order-info { background: #fff; padding: 15px; margin: 20px 0; border: 1px solid #ddd; border-radius: 4px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .order-table th { background: #f5f5f5; padding: 8px; text-align: left; font-size: 12px; }
          .total-row { font-weight: bold; border-top: 2px solid #333; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .tracking { background: #e3f2fd; padding: 15px; margin: 15px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-icon">${config.icon}</div>
            <h1>${config.title}</h1>
          </div>
          <div class="content">
            <p>${config.message}</p>

            <div class="order-info">
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              ${status === 'shipped' && order.trackingNumber ? `
                <div class="tracking">
                  <strong>Tracking Number:</strong> ${order.trackingNumber}
                </div>
              ` : ''}
            </div>

            <h3>Order Summary</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="padding: 10px;"><strong>Total</strong></td>
                  <td style="padding: 10px; text-align: right;"><strong>$${order.summary.total}</strong></td>
                </tr>
              </tbody>
            </table>

            ${status !== 'cancelled' && status !== 'refunded' ? `
              <div class="order-info">
                <h4>Shipping Address</h4>
                <p>
                  ${order.shippingAddress.fullName}<br>
                  ${order.shippingAddress.address}<br>
                  ${order.shippingAddress.city}${order.shippingAddress.state ? ', ' + order.shippingAddress.state : ''} ${order.shippingAddress.postalCode}<br>
                  ${order.shippingAddress.country}
                </p>
              </div>
            ` : ''}
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
${config.title}

${config.message}

Order Number: ${order.orderNumber}
Order Date: ${new Date(order.createdAt).toLocaleDateString()}
${status === 'shipped' && order.trackingNumber ? `Tracking Number: ${order.trackingNumber}` : ''}

Order Summary:
${order.items.map(item => `- ${item.title} x${item.quantity}: $${item.subtotal}`).join('\n')}

Total: $${order.summary.total}

If you have any questions about your order, please contact us.
    `.trim();

    return this.emailService.send({
      to: userEmail,
      subject: config.subject,
      htmlContent,
      textContent
    });
  }
}
