import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

const dbUrl = process.env.DATABASE_URL;
const options = {
  log: ['error']
};

if (dbUrl) {
  console.log('Setting accelerateUrl...');
  options.accelerateUrl = dbUrl;
}

console.log('Instantiating PrismaClient with options:', Object.keys(options));

try {
    const prisma = new PrismaClient(options);
    console.log('Prisma 7 loaded successfully!');
} catch (e) {
    console.error('FAILED to load Prisma 7:', e.message);
}
process.exit(0);
