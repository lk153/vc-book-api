import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
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

// Case-insensitive unique index for name
categorySchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }
  }
);

// Index for sorting
categorySchema.index({ createdAt: -1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;
