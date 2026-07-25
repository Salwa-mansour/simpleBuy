import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1', '8.8.8.8']); // Your working DNS override
import ROLES_LIST from '../config/rolesList.js';

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dotenv loads from server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('🌱 Connecting to database for seeding...');
  
  if (!process.env.DATABASE_URI) {
    throw new Error("DATABASE_URI is missing from environment variables.");
  }

  await mongoose.connect(process.env.DATABASE_URI);
  console.log('✅ Connected to MongoDB!');

  console.log('🧹 Cleaning up existing data...');
  // 1. Clean up existing tokens and users
  await RefreshToken.deleteMany({});
  await User.deleteMany({});

  // 2. Define and hash Admin password
  const plainTextPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!';
  const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

  // 3. Define and hash Guest password
  const guestPassword = 'gestUser@123';
  const guestHashedPassword = await bcrypt.hash(guestPassword, 10);

  // 4. Create Admin user
  const adminUser = await User.create({
    email: 'admin@example.com',
    name: 'Admin User',
    password: hashedPassword,
    roles: [ROLES_LIST.USER || ROLES_LIST.CUSTOMER, ROLES_LIST.ADMIN], // [2001, 5150]
  });

  // 5. Create Guest user
  const guestUser = await User.create({
    email: 'gestuser@gmail.com',
    name: 'Guest User',
    password: guestHashedPassword,
    roles: [ROLES_LIST.USER || ROLES_LIST.CUSTOMER], // [2001]
  });

  console.log('✅ Seeding complete!');
  console.log('-----------------------------------------------');
  console.log(`Admin User Email: ${adminUser.email}`);
  console.log(`Admin Password:   ${plainTextPassword}`);
  console.log('-----------------------------------------------');
  console.log(`Guest User Email: ${guestUser.email}`);
  console.log(`Guest Password:   ${guestPassword}`);
  console.log('-----------------------------------------------');
}

main()
  .then(async () => {
    await mongoose.disconnect();
    console.log('👋 Database connection closed.');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await mongoose.disconnect();
    process.exit(1);
  });