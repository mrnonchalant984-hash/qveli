require('dotenv/config');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');
const connectionString=process.env.DATABASE_URL;if(!connectionString)throw new Error('DATABASE_URL is required');
const prisma = new PrismaClient({adapter:new PrismaPg({connectionString})});
(async()=>{const email=process.argv[2];const username=(process.argv[3]||'').toLowerCase();const password=process.argv[4];if(!email||!username||!password){console.error('Usage: node scripts/create-admin.js email username password');process.exit(1);}const hash=await bcrypt.hash(password,12);const existing=await prisma.user.findUnique({where:{email}});const user=existing?await prisma.user.update({where:{email},data:{role:'ADMIN',passwordHash:hash}}):await prisma.user.create({data:{email,username,name:username,passwordHash:hash,role:'ADMIN'}});console.log(`Admin ready: ${user.email} (@${user.username})`);await prisma.$disconnect();})().catch(async e=>{console.error(e);await prisma.$disconnect();process.exit(1);});