import http from 'node:http';
const port=Number(process.env.QEVLI_ADMIN_PORT||3001);
const target=process.env.QEVLI_APP_URL||'http://localhost:3000';
http.createServer((req,res)=>{if(req.url==='/health'){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({service:'qevli-admin-host',target}));return;}res.writeHead(302,{Location:`${target}/admin`});res.end();}).listen(port,()=>console.log(`Qevli Admin Host running at http://localhost:${port} -> ${target}/admin`));
