const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root=process.cwd();
http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)) {res.writeHead(403);res.end();return;}
  try {const data=fs.readFileSync(file);res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')||file.endsWith('.jsx')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(data);}
  catch {res.writeHead(404);res.end();}
}).listen(Number(process.env.PORT||8766),'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:'+(process.env.PORT||8766)));
