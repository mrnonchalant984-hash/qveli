import "dotenv/config";
import { prisma } from '@/lib/prisma';

type Source={slug:string;name:string;handle?:string;feedUrl:string;websiteUrl:string;category:string;country?:string;sourceType?:string;logoUrl?:string};

// Prefer public RSS/Atom feeds. HTML sources are a controlled fallback and only store
// short attributed summaries plus a link back to the original publisher.
const sources:Source[]=[
 {slug:'openai',name:'OpenAI',handle:'@OpenAI',feedUrl:'https://openai.com/news/rss.xml',websiteUrl:'https://openai.com/news/',category:'AI',country:'US'},
 {slug:'google',name:'Google',handle:'@Google',feedUrl:'https://blog.google/rss/',websiteUrl:'https://blog.google/',category:'TECHNOLOGY',country:'US'},
 {slug:'apple',name:'Apple Newsroom',handle:'@Apple',feedUrl:'https://www.apple.com/newsroom/rss-feed.rss',websiteUrl:'https://www.apple.com/newsroom/',category:'TECHNOLOGY',country:'US'},
 {slug:'microsoft',name:'Microsoft',handle:'@Microsoft',feedUrl:'https://blogs.microsoft.com/feed/',websiteUrl:'https://blogs.microsoft.com/',category:'TECHNOLOGY',country:'US'},
 {slug:'meta',name:'Meta Newsroom',handle:'@Meta',feedUrl:'https://about.fb.com/news/feed/',websiteUrl:'https://about.fb.com/news/',category:'TECHNOLOGY',country:'US'},
 {slug:'nvidia',name:'NVIDIA News',handle:'@NVIDIA',feedUrl:'https://nvidianews.nvidia.com/rss',websiteUrl:'https://nvidianews.nvidia.com/',category:'AI & CHIPS',country:'US'},
 {slug:'github',name:'GitHub Blog',handle:'@GitHub',feedUrl:'https://github.blog/feed/',websiteUrl:'https://github.blog/',category:'DEVELOPERS',country:'US'},
 {slug:'mozilla',name:'Mozilla',handle:'@Mozilla',feedUrl:'https://blog.mozilla.org/feed/',websiteUrl:'https://blog.mozilla.org/',category:'TECHNOLOGY',country:'US'},
 {slug:'python',name:'Python',handle:'@Python',feedUrl:'https://blog.python.org/feeds/posts/default',websiteUrl:'https://www.python.org/blogs/',category:'DEVELOPERS',country:'US'},
 {slug:'nodejs',name:'Node.js',handle:'@nodejs',feedUrl:'https://nodejs.org/en/feed/blog.xml',websiteUrl:'https://nodejs.org/en/blog/',category:'DEVELOPERS',country:'US'},
 {slug:'kubernetes',name:'Kubernetes',handle:'@Kubernetesio',feedUrl:'https://kubernetes.io/feed.xml',websiteUrl:'https://kubernetes.io/blog/',category:'DEVELOPERS',country:'US'},
 {slug:'nasa',name:'NASA',handle:'@NASA',feedUrl:'https://www.nasa.gov/rss/dyn/breaking_news.rss',websiteUrl:'https://www.nasa.gov/news/',category:'SCIENCE & SPACE',country:'US'},
 {slug:'cern',name:'CERN',handle:'@CERN',feedUrl:'https://home.cern/rss.xml',websiteUrl:'https://home.cern/news',category:'SCIENCE',country:'CH'},
 {slug:'who',name:'World Health Organization',handle:'@WHO',feedUrl:'https://www.who.int/rss-feeds/news-english.xml',websiteUrl:'https://www.who.int/news',category:'HEALTH',country:'CH'},
 {slug:'un-news',name:'UN News',handle:'@UNNews',feedUrl:'https://news.un.org/feed/subscribe/en/news/all/rss.xml',websiteUrl:'https://news.un.org/',category:'WORLD',country:'US'},
 {slug:'bbc-world',name:'BBC News',handle:'@BBCWorld',feedUrl:'https://feeds.bbci.co.uk/news/world/rss.xml',websiteUrl:'https://www.bbc.com/news',category:'WORLD',country:'GB'},
 {slug:'bbc-tech',name:'BBC Technology',handle:'@BBC',feedUrl:'https://feeds.bbci.co.uk/news/technology/rss.xml',websiteUrl:'https://www.bbc.com/news/technology',category:'TECHNOLOGY',country:'GB'},
 {slug:'al-jazeera',name:'Al Jazeera',handle:'@AJEnglish',feedUrl:'https://www.aljazeera.com/xml/rss/all.xml',websiteUrl:'https://www.aljazeera.com/',category:'WORLD',country:'QA'},
 {slug:'techcrunch',name:'TechCrunch',handle:'@TechCrunch',feedUrl:'https://techcrunch.com/feed/',websiteUrl:'https://techcrunch.com/',category:'STARTUPS',country:'US'},
 {slug:'engadget',name:'Engadget',handle:'@Engadget',feedUrl:'https://www.engadget.com/rss.xml',websiteUrl:'https://www.engadget.com/',category:'GADGETS',country:'US'},
 {slug:'playstation',name:'PlayStation Blog',handle:'@PlayStation',feedUrl:'https://blog.playstation.com/feed/',websiteUrl:'https://blog.playstation.com/',category:'GAMING',country:'US'},
 {slug:'xbox',name:'Xbox Wire',handle:'@Xbox',feedUrl:'https://news.xbox.com/en-us/feed/',websiteUrl:'https://news.xbox.com/',category:'GAMING',country:'US'},
 {slug:'f1',name:'Formula 1',handle:'@F1',feedUrl:'https://www.formula1.com/en/latest/all.xml',websiteUrl:'https://www.formula1.com/',category:'MOTORSPORT',country:'GB'},
 {slug:'espn',name:'ESPN',handle:'@ESPN',feedUrl:'https://www.espn.com/espn/rss/news',websiteUrl:'https://www.espn.com/',category:'SPORTS',country:'US'},
 {slug:'nba',name:'NBA',handle:'@NBA',feedUrl:'https://www.nba.com/news',websiteUrl:'https://www.nba.com/news',category:'BASKETBALL',country:'US',sourceType:'HTML'},
 {slug:'fifa',name:'FIFA',handle:'@FIFAcom',feedUrl:'https://www.fifa.com/news',websiteUrl:'https://www.fifa.com/news/',category:'FOOTBALL',country:'CH',sourceType:'HTML'},
 {slug:'rfef',name:'Spain Football (RFEF)',handle:'@rfef',feedUrl:'https://rfef.es/en/noticias',websiteUrl:'https://rfef.es/en/noticias',category:'FOOTBALL',country:'ES',sourceType:'HTML'},
 {slug:'premier-league',name:'Premier League',handle:'@premierleague',feedUrl:'https://www.premierleague.com/news',websiteUrl:'https://www.premierleague.com/news',category:'FOOTBALL',country:'GB',sourceType:'HTML'},
 {slug:'uefa',name:'UEFA',handle:'@UEFA',feedUrl:'https://www.uefa.com/news/',websiteUrl:'https://www.uefa.com/news/',category:'FOOTBALL',country:'CH',sourceType:'HTML'},
 {slug:'nairametrics',name:'Nairametrics',handle:'@Nairametrics',feedUrl:'https://nairametrics.com/feed/',websiteUrl:'https://nairametrics.com/',category:'NIGERIA & BUSINESS',country:'NG'},
 {slug:'channels-tv',name:'Channels Television',handle:'@channelstv',feedUrl:'https://www.channelstv.com/feed/',websiteUrl:'https://www.channelstv.com/',category:'NIGERIA',country:'NG'},
 {slug:'premium-times',name:'Premium Times',handle:'@PremiumTimesng',feedUrl:'https://www.premiumtimesng.com/feed',websiteUrl:'https://www.premiumtimesng.com/',category:'NIGERIA',country:'NG'},
 {slug:'who-africa',name:'WHO Africa',handle:'@WHOAFRO',feedUrl:'https://www.afro.who.int/rss.xml',websiteUrl:'https://www.afro.who.int/news',category:'AFRICA & HEALTH',country:'NG'},
 {slug:'world-bank',name:'World Bank',handle:'@WorldBank',feedUrl:'https://www.worldbank.org/en/news/all?format=rss',websiteUrl:'https://www.worldbank.org/en/news',category:'ECONOMICS',country:'US'},
 {slug:'imf',name:'IMF',handle:'@IMFNews',feedUrl:'https://www.imf.org/en/News/RSS',websiteUrl:'https://www.imf.org/en/News',category:'ECONOMICS',country:'US'},
 {slug:'yc',name:'Y Combinator',handle:'@ycombinator',feedUrl:'https://www.ycombinator.com/blog/rss',websiteUrl:'https://www.ycombinator.com/blog',category:'STARTUPS',country:'US'},
];

async function main(){
 for(const s of sources){await prisma.officialFeedSource.upsert({where:{slug:s.slug},create:{...s,sourceType:s.sourceType||'RSS'},update:{name:s.name,handle:s.handle,feedUrl:s.feedUrl,websiteUrl:s.websiteUrl,category:s.category,country:s.country,sourceType:s.sourceType||'RSS',enabled:true}});}
 console.log(`Seeded ${sources.length} official sources.`);
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
