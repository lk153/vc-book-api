import mongoose from 'mongoose';
import Book from '../models/Book.model.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const sampleBooks = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    price: 24.99,
    stock: 30,
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    description: "A dazzling novel about all the choices that go into a life well lived."
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    price: 27.99,
    stock: 30,
    category: "Self-Help",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
    description: "An easy and proven way to build good habits and break bad ones."
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: 28.99,
    stock: 30,
    category: "Science Fiction",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
    description: "A lone astronaut must save the earth from disaster in this incredible new science-based thriller."
  },
  {
    title: "Educated",
    author: "Tara Westover",
    price: 26.99,
    category: "Biography",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    description: "A memoir about a young girl who leaves her survivalist family and goes on to earn a PhD."
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 22.99,
    stock: 30,
    category: "Business",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=600&fit=crop",
    description: "Timeless lessons on wealth, greed, and happiness."
  },
  {
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    price: 25.99,
    stock: 30,
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
    description: "A beautiful and haunting story of a girl raised in the marshes of North Carolina."
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