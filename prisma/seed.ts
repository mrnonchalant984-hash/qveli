import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
const connectionString=process.env.DATABASE_URL;if(!connectionString)throw new Error("DATABASE_URL is required");
const db=new PrismaClient({adapter:new PrismaPg({connectionString})});
async function main(){await db.company.upsert({where:{slug:"qviews"},update:{name:"Qviews",category:"Official Qevli company",description:"Qviews is the official Qevli company page for product updates, announcements, launches and community news."},create:{slug:"qviews",name:"Qviews",category:"Official Qevli company",description:"Qviews is the official Qevli company page for product updates, announcements, launches and community news."}});console.log("Qevli seed complete: no demo users are created.");}
main().catch(console.error).finally(()=>db.$disconnect());
