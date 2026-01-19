import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';

dotenv.config();

const args = process.argv.slice(2);

function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      if (args[i + 1] && !args[i + 1].startsWith('--')) {
        result[key] = args[i + 1];
        i++;
      } else {
        result[key] = true;
      }
    }
  }
  return result;
}

const options = parseArgs(args);

if (!options.username || !options.password) {
  console.error('\x1b[31mError: --username and --password are required\x1b[0m');
  console.log('\nUsage:');
  console.log('  node src/scripts/admin.js --username <username> --password <password>');
  console.log('\nOptions:');
  console.log('  --username    Admin username (required)');
  console.log('  --password    Admin password (required)');
  console.log('  --update      Update existing admin password');
  console.log('  --name        Admin display name (optional)');
  console.log('\nExamples:');
  console.log('  node src/scripts/admin.js --username admin --password secretpass123');
  console.log('  node src/scripts/admin.js --username admin --password newpass --update');
  process.exit(1);
}

async function createAdmin(options) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore');
    console.log('Connected to database');

    const { username, password, name, update } = options;

    if (update) {
      // Update existing admin
      const admin = await Admin.findOne({ username }).select('+password');

      if (!admin) {
        console.error('\x1b[31mAdmin not found:', username, '\x1b[0m');
        process.exit(1);
      }

      admin.password = password; // Will be hashed by pre-save hook
      admin.name = name || admin.name || username;
      await admin.save();

      console.log('\x1b[32mAdmin password updated successfully!\x1b[0m');
      console.log('Username:', username);
    } else {
      // Check if admin exists
      const existing = await Admin.findOne({ username });
      if (existing) {
        console.error('\x1b[31mAdmin already exists. Use --update to change password.\x1b[0m');
        process.exit(1);
      }

      // Create new admin (password will be hashed by pre-save hook)
      const admin = new Admin({
        username,
        password,
        name: name || username,
      });

      await admin.save();
      console.log('\x1b[32mAdmin created successfully!\x1b[0m');
      console.log('Username:', username);
      console.log('Name:', name || username);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31mError:', error.message, '\x1b[0m');
    process.exit(1);
  }
}

createAdmin(options);
