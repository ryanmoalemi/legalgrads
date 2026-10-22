import { chromium } from '@playwright/test';
const base='http://127.0.0.1:4174';
const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const seen=new Set(['/']), q=['/'], bad=[];
while(q.length){const u=q.shift(); const r=await p.goto(base+u).catch(()=>null); if(!r||r.status()>=400){bad.push(u);continue;}
 const info=await p.evaluate(()=>({links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),
  noalt:[...document.images].filter(i=>!i.hasAttribute('alt')).length,
  unlabeled:[...document.querySelectorAll('input,select,textarea')].filter(e=>e.type!=='hidden'&&!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>e.name||e.id),
  h1:document.querySelectorAll('h1').length, ov:document.documentElement.scrollWidth>innerWidth, title:document.title}));
 if(info.noalt||info.unlabeled.length||info.h1!==1||info.ov) console.log(u,JSON.stringify({...info,links:undefined}));
 for(const l of info.links){ if(l.startsWith('/')&&!l.startsWith('//')){const c=l.split('#')[0].split('?')[0]; if(c&&!seen.has(c)){seen.add(c);q.push(c);}}}
}
console.log('pages',seen.size,'broken',bad);
await b.close();
