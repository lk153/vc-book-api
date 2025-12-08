import mongoose from 'mongoose';
import Book from '../models/Book.model.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const sampleBooks = [
  {
    title: "Tam Tự Kinh",
    author: "Chánh Kiến Việt Ngữ",
    price: 55000,
    stock: 30,
    category: "Tiểu đệ tử",
    image: "https://chanhkien.org/wp-content/uploads/2025/06/tam-tu-kinh.png",
    description: "Bản dịch Tam Tự Kinh chuẩn xác và dễ hiểu dành cho trẻ em Việt Nam."
  },
  {
    title: "Ấu học Quỳnh Lâm",
    author: "Chánh Kiến Việt Ngữ",
    price: 35000,
    stock: 30,
    category: "Tiểu đệ tử",
    image: "https://chanhkien.org/wp-content/uploads/2025/06/2008_9_18_yxql.jpg",
    description: "Bản dịch Ấu học Quỳnh Lâm giúp trẻ em học tập và rèn luyện đạo đức."
  },
  {
    title: "Đệ tử Quy",
    author: "Chánh Kiến Việt Ngữ",
    price: 45000,
    stock: 30,
    category: "Tiểu đệ tử",
    image: "https://chanhkien.org/wp-content/uploads/2025/06/dizigui.jpg",
    description: "Bản dịch Đệ tử Quy giúp trẻ em hiểu rõ về quy tắc ứng xử và lễ nghi."
  },
  {
    title: "Huyền Mộc Ký",
    author: "Chánh Kiến Việt Ngữ",
    price: 40000,
    stock: 30,
    category: "Tiểu đệ tử",
    image: "https://chanhkien.org/wp-content/uploads/2025/06/huyen-moc-ky.png",
    description: "Bản dịch Huyền Mộc Ký giúp trẻ em phát triển tư duy và trí tuệ."
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