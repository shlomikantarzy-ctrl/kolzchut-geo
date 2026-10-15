import { chromium } from "playwright"; import http from "node:http"; import { readFileSync, existsSync } from "node:fs"; import path from "node:path";
const root=process.cwd();
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const p=path.join(root,u==='/'?'index.html':u);if(!existsSync(p)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html; charset=utf-8':p.endsWith('.webp')?'image/webp':'application/octet-stream'});r.end(readFileSync(p))}).listen(4340);
const b=await chromium.launch();
for (const w of [320,360,414,526,600,700,800,900,1000,1100,1366]) {
  const pg=await (await b.newContext({viewport:{width:w,height:900}})).newPage(); await pg.goto('http://localhost:4340/');
  const bad=await pg.evaluate(()=>[...document.querySelectorAll('p,li,td,th,span,b,h3,dd,div.sdesc,div.stitle')].filter(e=>{const r=e.getBoundingClientRect();const t=(e.innerText||'').trim();return r.width>0&&r.width<150&&t.split(/\s+/).length>5}).map(e=>`${e.tagName}.${e.className}[${Math.round(e.getBoundingClientRect().width)}px] ${e.innerText.trim().slice(0,30).replace(/\n/g,' ')}`).slice(0,6));
  const ovf=await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  console.log(w, 'overflow', ovf, bad.length? '\n   '+bad.join('\n   '):'OK');
}
await b.close(); srv.close();
