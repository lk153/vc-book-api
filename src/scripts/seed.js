import mongoose from 'mongoose';
import Book from '../models/Book.model.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "0743273565",
    description: "A classic American novel set in the Jazz Age",
    price: 12.99,
    stock: 50,
    category: "Fiction",
    publisher: "Scribner",
    pages: 180,
    language: "English"
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "0061120084",
    description: "A gripping tale of racial injustice and childhood innocence",
    price: 14.99,
    stock: 35,
    category: "Fiction",
    publisher: "Harper Perennial",
    pages: 324,
    language: "English"
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "0451524935",
    description: "A dystopian social science fiction novel",
    price: 13.99,
    stock: 40,
    category: "Science Fiction",
    publisher: "Signet Classic",
    pages: 328,
    language: "English"
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "0132350884",
    description: "A handbook of agile software craftsmanship",
    price: 42.99,
    stock: 25,
    category: "Programming",
    publisher: "Prentice Hall",
    pages: 464,
    language: "English"
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    isbn: "0135957059",
    description: "Your journey to mastery",
    price: 39.99,
    stock: 30,
    category: "Programming",
    publisher: "Addison-Wesley",
    pages: 352,
    language: "English"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore');
    logger.info('Connected to MongoDB');

    // Clear existing books
    await Book.deleteMany({});
    logger.info('Cleared existing books');

    // Insert sample books
    const books = await Book.insertMany(sampleBooks);
    logger.info(`Inserted ${books.length} sample books`);

    logger.info('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();