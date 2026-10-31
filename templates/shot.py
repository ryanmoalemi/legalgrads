import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for n in ['profile-unclaimed','profile-claimed']:
      for tag,vp,s in [('desktop',{'width':1280,'height':900},1),('mobile',{'width':390,'height':844},2)]:
        pg=await b.new_page(viewport=vp,device_scale_factor=s)
        await pg.goto(f'file:///workspace/legalgrads/templates/{n}.html'); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=f'{n}-{tag}.png',full_page=True); await pg.close()
    await b.close()
asyncio.run(main())
