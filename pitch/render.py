import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg=await b.new_page(viewport={'width':1600,'height':900},device_scale_factor=2)
        await pg.goto('file:///workspace/legalgrads/pitch/legalgrads-pitch.html'); await pg.wait_for_timeout(500)
        print(await pg.evaluate("[document.documentElement.scrollHeight, ...[...document.querySelectorAll('.grid>div')].map(e=>e.getBoundingClientRect().bottom), document.querySelector('.fine').getBoundingClientRect().top]"))
        await pg.screenshot(path='legalgrads-pitch.png')
        await pg.pdf(path='legalgrads-pitch.pdf',width='1600px',height='900px',print_background=True,prefer_css_page_size=True)
        await b.close()
asyncio.run(main())
