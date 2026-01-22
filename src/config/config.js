export default {
  env: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 3000,

  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },

  book: {
    categories: (process.env.BOOK_CATEGORIES || 'Tiểu đệ tử,Văn học,Kinh tế,Khoa học,Kỹ năng sống,Thiếu nhi,Giáo dục,Tâm lý,Lịch sử,Ngoại ngữ').split(',').map(c => c.trim())
  },
  
  order: {
    freeShippingThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD) || 1000000,
    shippingFee: Number(process.env.SHIPPING_FEE) || 0,
    taxRate: Number(process.env.TAX_RATE) || 0
  },
  
  jwt: {
    secret: process.env.JWT_SECRET ?? 'your-secret-key',
    expiresIn: '24h'
  },

  web_path: process.env.WEB_PATH ?? 'http://localhost:8000',
  email: {
    smtpHost: process.env.SMTP_HOST ?? 'smtp-relay.brevo.com',
    smtpPort: process.env.SMTP_PORT ?? 587,
    smtpUser: process.env.SMTP_USER ?? '',
    smtpPass: process.env.SMTP_PASS ?? '',
    apiKey: process.env.BREVO_API_KEY ?? ''
  }
};