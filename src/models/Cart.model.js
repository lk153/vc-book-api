import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  items: [cartItemSchema],
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastModified on save
cartSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

// Virtual for total items
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total price
cartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Method to add item
cartSchema.methods.addItem = async function(bookId, quantity, price) {
  const existingItem = this.items.find(item => item.book.toString() === bookId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ book: bookId, quantity, price });
  }
  
  await this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(bookId, quantity) {
  if (quantity === 0) {
    this.items = this.items.filter(item => item.book.toString() !== bookId.toString());
  } else {
    const item = this.items.find(item => item.book.toString() === bookId.toString());
    if (item) {
      item.quantity = quantity;
    }
  }
  
  await this.save();
};

// Method to remove item
cartSchema.methods.removeItem = async function(bookId) {
  this.items = this.items.filter(item => item.book.toString() !== bookId.toString());
  await this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  await this.save();
};

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;