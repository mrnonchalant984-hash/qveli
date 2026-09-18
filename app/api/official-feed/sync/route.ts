import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function strip(v:string){return v.replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim()}
function tag(block:string,name:string){const re=new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i');return strip(block.match(re)?.[1]||'')}
function rawTag(block:string,name:string){const re=new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i');return block.match(re)?.[1]?.trim()||''}
function firstLink(block:string){const rss=rawTag(block,'link');if(rss)return strip(rss);const atom=block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];return atom||''}
function absolute(link:string,base:string){try{return new URL(link,base).toString()}catch{return base}}
function usableImage(url:string|null){if(!url)return null;try{const u=new URL(url);if(!/^https?:$/.test(u.protocol))return null;const path=u.pathname.toLowerCase();return /\.(jpe?g|png|gif|webp|avif|svg)(?:$|[?#])/.test(path)||/[?&](?:format|fm)=(?:jpe?g|png|gif|webp|avif)/i.test(u.search)?u.toString():null}catch{return null}}
function htmlImage(block:string,base:string){const src=block.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/i)?.[1]||null;return usableImage(src?absolute(src,base):null)}
async function fetchText(url:string){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(url,{headers:{'user-agent':'QevliOfficialFeed/2.1 (+https://qevli.com)','accept':'application/rss+xml, application/atom+xml, text/xml, text/html;q=0.9,*/*;q=0.5'},cache:'no-store',signal:controller.signal});if(!r.ok)throw new Error(`HTTP ${r.status}`);return {text:await r.text(),contentType:r.headers.get('content-type')||''};}finally{clearTimeout(timer)}}
function parseFeed(text:string,source:any){const blocks=[...text.matchAll(/<(item|entry)\b[\s\S]*?<\/(item|entry)>/gi)].map(m=>m[0]).slice(0,12);return blocks.map(block=>{const title=tag(block,'title')||'Official update';const link=absolute(firstLink(block)||source.websiteUrl,source.websiteUrl);const body=(tag(block,'description')||tag(block,'summary')||tag(block,'content')||'').slice(0,1800);const externalId=tag(block,'guid')||tag(block,'id')||link;const pub=tag(block,'pubDate')||tag(block,'published')||tag(block,'updated');const publishedAt=pub&&Number.isFinite(Date.parse(pub))?new Date(pub):new Date();const enclosure=block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i)?.[1]||block.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["'][^>]*>/i)?.[1]||null;const mediaUrl=usableImage(enclosure?absolute(enclosure,source.websiteUrl):null)||htmlImage(block,source.websiteUrl);return {title,link,body:body||`Official ${source.category.toLowerCase()} update from ${source.name}.`,externalId,publishedAt,mediaUrl};}).filter(x=>x.link)}
async function parseHtml(text:string,source:any){const blocks=[...text.matchAll(/<article\b[\s\S]*?<\/article>/gi)].map(m=>m[0]).slice(0,10);return blocks.map(block=>{const title=strip(block.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i)?.[1]||'Official update');const href=block.match(/href=["']([^"']+)["']/i)?.[1];const link=absolute(href||source.websiteUrl,source.websiteUrl);const body=strip(block.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1]||'').slice(0,1800);const mediaUrl=htmlImage(block,source.websiteUrl);return {title,link,body:body||`Official ${source.category.toLowerCase()} update from ${source.name}.`,externalId:link,publishedAt:new Date(),mediaUrl};}).filter(x=>x.title!=='Official update'&&x.link)}

async function syncOne(source:any){
 const {text,contentType}=await fetchText(source.feedUrl);
 const items=source.sourceType==='HTML'||(!contentType.includes('xml')&&!/<(?:rss|feed|channel|entry|item)\b/i.test(text))?await parseHtml(text,source):parseFeed(text,source);
 let inserted=0,updated=0,count=0;
 for(const item of items.slice(0,8)){
   const id=`official-${source.slug}-${Buffer.from(item.externalId).toString('base64url').slice(0,55)}`;
   const existing=await prisma.officialFeedItem.findUnique({where:{id},select:{id:true}});
   await prisma.officialFeedItem.upsert({where:{id},create:{id,sourceId:source.id,externalId:item.externalId,sourceName:source.name,sourceHandle:source.handle,sourceUrl:item.link,logoUrl:source.logoUrl,title:item.title,body:item.body,mediaUrl:item.mediaUrl,category:source.category,publishedAt:item.publishedAt},update:{sourceId:source.id,sourceName:source.name,sourceHandle:source.handle,sourceUrl:item.link,logoUrl:source.logoUrl,title:item.title,body:item.body,mediaUrl:item.mediaUrl,category:source.category,publishedAt:item.publishedAt}});
   existing?updated++:inserted++;count++;
 }
 await prisma.officialFeedSource.update({where:{id:source.id},data:{lastSyncedAt:new Date(),lastSuccessAt:new Date(),lastError:null}});
 return {source:source.name,items:count,ok:true,inserted,updated};
}
export async function POST(req:NextRequest){
 try{
  const secret=process.env.CRON_SECRET||process.env.QEVLI_CRON_SECRET;const key=req.headers.get('x-qevli-cron')||req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');const adminUser=await getCurrentUser();const authorizedAdmin=Boolean(adminUser&&adminUser.role==='ADMIN');
  if((secret && key!==secret && !authorizedAdmin) || (!secret && !authorizedAdmin))return Response.json({error:'Unauthorized'},{status:401});
  const sourceId=new URL(req.url).searchParams.get('sourceId');
  const sources=await prisma.officialFeedSource.findMany({where:{enabled:true,...(sourceId?{id:sourceId}:{})},orderBy:{name:'asc'}});
  if(sourceId&&sources.length===0)return Response.json({error:'Source not found or disabled.'},{status:404});
  const results:any[]=[];let inserted=0,updated=0;
  // Individual sync stays simple; Send/Sync all uses bounded concurrency so 35+ sources don't serialize into a serverless timeout.
  if(sourceId){
    try{const r=await syncOne(sources[0]);inserted+=r.inserted;updated+=r.updated;results.push(r)}catch(e){await prisma.officialFeedSource.update({where:{id:sources[0].id},data:{lastSyncedAt:new Date(),lastError:String(e).slice(0,1000)}}).catch(()=>{});results.push({source:sources[0].name,items:0,ok:false,error:String(e)})}
  }else{
    const queue=[...sources];const workers=Array.from({length:Math.min(6,queue.length)},async()=>{while(queue.length){const source=queue.shift();if(!source)break;try{const r=await syncOne(source);inserted+=r.inserted;updated+=r.updated;results.push(r)}catch(e){await prisma.officialFeedSource.update({where:{id:source.id},data:{lastSyncedAt:new Date(),lastError:String(e).slice(0,1000)}}).catch(()=>{});results.push({source:source.name,items:0,ok:false,error:String(e)})}}});await Promise.all(workers);
  }
  results.sort((a,b)=>String(a.source).localeCompare(String(b.source)));
  return Response.json({ok:true,sources:sources.length,inserted,updated,results,finishedAt:new Date().toISOString()});
 }catch(e){console.error(e);return Response.json({error:'Official feed sync failed',details:String(e)}, {status:500});}
}
export async function GET(req:NextRequest){return POST(req)}
