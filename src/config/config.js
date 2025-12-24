export default {
  env: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 3000,
  
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },
  
  order: {
    freeShippingThreshold: 50,
    shippingFee: 5.99,
    taxRate: 0.08
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