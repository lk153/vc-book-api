import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book Order API Documentation',
      version: '1.0.0',
      description: 'Enterprise-grade RESTful API for book ordering system with MongoDB',
      contact: {
        name: 'API Support',
        email: 'support@bookstore.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://vc-book-api.onrender.com/api/v1',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Books',
        description: 'Book management endpoints'
      },
      {
        name: 'Cart',
        description: 'Shopping cart operations'
      },
      {
        name: 'Orders',
        description: 'Order processing and management'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Book: {
          type: 'object',
          required: ['title', 'author', 'price', 'stock', 'category'],
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              description: 'Book title',
              example: 'Clean Code'
            },
            author: {
              type: 'string',
              description: 'Author name',
              example: 'Robert C. Martin'
            },
            isbn: {
              type: 'string',
              description: 'ISBN number',
              example: '978-0132350884'
            },
            description: {
              type: 'string',
              description: 'Book description',
              example: 'A handbook of agile software craftsmanship'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Book price',
              example: 42.99
            },
            stock: {
              type: 'integer',
              description: 'Available stock quantity',
              example: 25
            },
            category: {
              type: 'string',
              enum: ['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Programming', 'Business', 'History', 'Biography', 'Other'],
              description: 'Book category',
              example: 'Programming'
            },
            publisher: {
              type: 'string',
              example: 'Prentice Hall'
            },
            pages: {
              type: 'integer',
              example: 464
            },
            language: {
              type: 'string',
              example: 'English'
            },
            image: {
              type: 'string',
              description: 'URL to book cover image'
            },
            ratings: {
              type: 'object',
              properties: {
                average: {
                  type: 'number',
                  example: 4.5
                },
                count: {
                  type: 'integer',
                  example: 150
                }
              }
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        CartItem: {
          type: 'object',
          properties: {
            book: {
              type: 'string',
              description: 'Book ObjectId',
              example: '507f1f77bcf86cd799439011'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              example: 2
            },
            price: {
              type: 'number',
              example: 42.99
            }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            userId: {
              type: 'string',
              example: 'user123'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItem'
              }
            },
            totalItems: {
              type: 'integer',
              example: 3
            },
            totalPrice: {
              type: 'number',
              example: 99.97
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ShippingAddress: {
          type: 'object',
          required: ['fullName', 'address', 'city', 'postalCode', 'phone'],
          properties: {
            fullName: {
              type: 'string',
              example: 'John Doe'
            },
            address: {
              type: 'string',
              example: '123 Main Street'
            },
            city: {
              type: 'string',
              example: 'New York'
            },
            state: {
              type: 'string',
              example: 'NY'
            },
            postalCode: {
              type: 'string',
              example: '10001'
            },
            country: {
              type: 'string',
              example: 'USA'
            },
            phone: {
              type: 'string',
              example: '+1234567890'
            }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            book: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'Clean Code'
            },
            author: {
              type: 'string',
              example: 'Robert C. Martin'
            },
            price: {
              type: 'number',
              example: 42.99
            },
            quantity: {
              type: 'integer',
              example: 2
            },
            subtotal: {
              type: 'number',
              example: 85.98
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            orderNumber: {
              type: 'string',
              example: 'ORD-20241117-0001'
            },
            userId: {
              type: 'string',
              example: 'user123'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem'
              }
            },
            shippingAddress: {
              $ref: '#/components/schemas/ShippingAddress'
            },
            paymentMethod: {
              type: 'string',
              enum: ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'],
              example: 'Credit Card'
            },
            summary: {
              type: 'object',
              properties: {
                subtotal: {
                  type: 'number',
                  example: 85.98
                },
                shippingFee: {
                  type: 'number',
                  example: 5.99
                },
                tax: {
                  type: 'number',
                  example: 6.88
                },
                total: {
                  type: 'number',
                  example: 98.85
                }
              }
            },
            status: {
              type: 'string',
              enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
              example: 'Pending'
            },
            statusHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string'
                  },
                  timestamp: {
                    type: 'string',
                    format: 'date-time'
                  },
                  note: {
                    type: 'string'
                  }
                }
              }
            },
            trackingNumber: {
              type: 'string',
              example: 'TRACK123456789'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              example: 'john@example.com'
            },
            phone: {
              type: 'string',
              example: '+1234567890'
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              example: 'customer'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Invalid input data'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Resource not found'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Internal server error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;