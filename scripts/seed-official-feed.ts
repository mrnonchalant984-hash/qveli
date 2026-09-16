import "dotenv/config";
import { prisma } from '@/lib/prisma';

const officialItems=[
  {
    id:'official-openai-astra-20260915',sourceName:'OpenAI',sourceHandle:'@OpenAI',sourceUrl:'https://openai.com/index/gpt-6-astra-next-generation-work/',
    title:'GPT-6 Astra: a new generation of intelligence',
    body:'OpenAI is highlighting GPT-6 Astra for demanding work including computer use, browsing, professional work, software engineering, cybersecurity and science.',
    category:'AI',publishedAt:new Date('2026-09-15T08:00:00Z')
  },
  {
    id:'official-chatgpt-data-20260911',sourceName:'ChatGPT',sourceHandle:'@ChatGPT',sourceUrl:'https://openai.com/index/scaling-storage-one-billion-users-part-one/',
    title:'Scaling ChatGPT storage for the next generation',
    body:'OpenAI has shared engineering work on globally distributed storage designed to support very large-scale ChatGPT usage.',
    category:'AI',publishedAt:new Date('2026-09-12T08:00:00Z')
  },
  {
    id:'official-nba-offseason-20260915',sourceName:'NBA',sourceHandle:'@NBA',sourceUrl:'https://www.nba.com/news/nba-offseason-deals-2026',
    title:'NBA 2026 offseason tracker is live',
    body:'NBA.com is tracking free-agent deals, extensions and trades across all 30 teams during the 2026 offseason.',
    category:'SPORTS',publishedAt:new Date('2026-09-15T05:00:00Z')
  },
  {
    id:'official-fifa-worldcup-20260708',sourceName:'FIFA World Cup',sourceHandle:'@FIFAWorldCup',sourceUrl:'https://www.fifa.com/en',
    title:'FIFA World Cup 2026 coverage',
    body:'Follow official FIFA tournament news, player stories and competition coverage from the 2026 World Cup and beyond.',
    category:'SPORTS',publishedAt:new Date('2026-07-08T12:00:00Z')
  },
  {
    id:'official-spain-rfef-20260914',sourceName:'Spain Football (RFEF)',sourceHandle:'@SEFutbol',sourceUrl:'https://rfef.es/en/noticias/Luis-de-la-Fuente-to-Announce-Squad-for-the-Start-of-the-UEFA-Nations-League-on-Friday-18-September',
    title:'Spain prepare for the next Nations League campaign',
    body:'RFEF says Luis de la Fuente will announce Spain’s squad on 18 September, with the world champions opening their Nations League campaign against England on 26 September.',
    category:'SPORTS',publishedAt:new Date('2026-09-14T11:32:00Z')
  },
  {
    id:'official-google-gemini-20260915',sourceName:'Google Gemini',sourceHandle:'@GoogleGemini',sourceUrl:'https://gemini.google.com/',
    title:'Google Gemini',body:'Follow the official Gemini product for AI announcements and updates. This Qevli card links directly to the official Gemini destination.',category:'AI',publishedAt:new Date('2026-09-15T07:00:00Z')
  },
  {
    id:'official-claude-20260915',sourceName:'Claude',sourceHandle:'@ClaudeAI',sourceUrl:'https://claude.ai/',
    title:'Claude',body:'Follow Claude’s official product destination for AI updates and releases.',category:'AI',publishedAt:new Date('2026-09-15T06:00:00Z')
  }
];

async function main(){
  for(const item of officialItems){await prisma.officialFeedItem.upsert({where:{id:item.id},create:item,update:item});}
  const qviews=await prisma.company.upsert({where:{slug:'qviews'},create:{slug:'qviews',name:'Qviews',description:'Official Qevli company updates.',category:'OFFICIAL',logoUrl:null},update:{name:'Qviews'}});
  await prisma.companyUpdate.upsert({where:{id:'qviews-welcome-feed'},create:{id:'qviews-welcome-feed',companyId:qviews.id,title:'Welcome to the Qviews feed',body:'Qviews is the official Qevli company page. Platform announcements and verified Qevli updates will appear directly in the home feed.',sourceName:'Qviews',sourceUrl:'/companies/qviews'},update:{title:'Welcome to the Qviews feed',body:'Qviews is the official Qevli company page. Platform announcements and verified Qevli updates will appear directly in the home feed.',sourceName:'Qviews',sourceUrl:'/companies/qviews'}});
  console.log(`Seeded ${officialItems.length} official-source feed items and Qviews.`);
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
