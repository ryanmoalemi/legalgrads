from playwright.sync_api import sync_playwright
pages=["/","/join/","/find-lawyer/","/for-attorneys/","/how-it-works/","/about/","/faq/","/specialties/"]
with sync_playwright() as p:
  b=p.chromium.launch()
  for name,vp in [("desktop",{"width":1366,"height":900}),("mobile",{"width":390,"height":844})]:
    c=b.new_context(viewport=vp); pg=c.new_page(); errs=[]
    pg.on("console",lambda m: m.type=="error" and errs.append(m.text))
    pg.on("pageerror",lambda e: errs.append(str(e)))
    pg.on("response",lambda r: r.status>=400 and errs.append(f"{r.status} {r.url}"))
    for u in pages:
      errs.clear(); pg.goto("https://legalgrads.com"+u,wait_until="networkidle")
      broken=pg.evaluate("[...document.images].filter(i=>!i.complete||i.naturalWidth==0).map(i=>i.src)")
      ow=pg.evaluate("document.documentElement.scrollWidth")
      fn=f"{name}{u.strip('/').replace('/','-') or '-home'}.png".replace(name,name+"-",1) if u!="/" else f"{name}-home.png"
      pg.screenshot(path=fn,full_page=True)
      print(name,u,"|",pg.title(),"| scrollW",ow,"| broken",broken,"| errs",errs[:5])
    if name=="desktop":
      pg.goto("https://legalgrads.com/join/",wait_until="networkidle")
      print("FIELDS",pg.evaluate("[...document.querySelectorAll('input,select,textarea')].map(e=>e.type+':'+(e.name||e.id)+(e.required?'*':''))"))
      btn=pg.locator("form button[type=submit], form button").last
      print("BTN",btn.inner_text())
      pg.evaluate("document.querySelector('form') && document.querySelector('form').addEventListener('submit',e=>{window.__sub=1},true)")
      btn.click(); pg.wait_for_timeout(1500)
      print("INVALID",pg.evaluate("[...document.querySelectorAll(':invalid,[aria-invalid=true]')].map(e=>e.name||e.id)"), "submitted?",pg.evaluate("window.__sub||0"), "url",pg.url)
      pg.screenshot(path="desktop-join-validation.png",full_page=True)
      pg.goto("https://legalgrads.com/find-lawyer/",wait_until="networkidle")
      print("FINDTEXT",pg.inner_text("main")[:1500])
      print("LINKS",pg.evaluate("[...document.querySelectorAll('main a')].map(a=>a.getAttribute('href'))"))
      pg.goto("https://legalgrads.com/",wait_until="networkidle")
      t=pg.inner_text("body"); import re
      print("SAMPLE",[l for l in t.split("\n") if re.search(r"sample|demo|illustrat|example",l,re.I)])
  b.close()
