import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot be more than 100 characters']
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^(ISBN(?:-1[03])?:?\s*)?(?:\d[\d -]{8,16}[\dX])$/.test(v);
      },
      message: props => `${props.value} is not a valid ISBN!`
    }
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Programming', 'Business', 'History', 'Biography', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  publisher: {
    type: String,
    trim: true
  },
  publishedDate: {
    type: Date
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  language: {
    type: String,
    default: 'English'
  },
  coverImage: {
    type: String
  },
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1, price: 1 });
bookSchema.index({ createdAt: -1 });

// Virtual for availability status
bookSchema.virtual('isAvailable').get(function() {
  return this.stock > 0 && this.isActive;
});

// Method to check if stock is available
bookSchema.methods.hasStock = function(quantity) {
  return this.stock >= quantity;
};

// Method to reduce stock
bookSchema.methods.reduceStock = async function(quantity) {
  if (!this.hasStock(quantity)) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  await this.save();
};

// Method to increase stock
bookSchema.methods.increaseStock = async function(quantity) {
  this.stock += quantity;
  await this.save();
};

// Static method to find low stock books
bookSchema.statics.findLowStock = function(threshold = 10) {
  return this.find({ stock: { $lte: threshold }, isActive: true });
};

const Book = mongoose.model('Book', bookSchema);
export default Book;