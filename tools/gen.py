def P(x,y,w=None,h=None):
    s=f"left:calc(var(--u)*{x});top:calc(var(--u)*{y});"
    if w:s+=f"width:calc(var(--u)*{w});"
    if h:s+=f"height:calc(var(--u)*{h});"
    return s
def U(n):return f"calc(var(--u)*{n})"
mail='<svg viewBox="0 0 24 24" fill="none" stroke="#0d0f3a" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>'
ft=[("More Affordable","Get quality legal help<br>at lower rates."),("Newly Licensed","Work with recent law grads<br>who are ready to build<br>their practices."),("Verified Attorneys","All attorneys are licensed<br>and background checked."),("Wide Range of Help","From business to real estate<br>to contracts and more.")]
ftm=[("More Affordable","Get quality legal<br>help at lower rates."),("Newly Licensed","Work with recent law<br>grads who are ready<br>to build their practices."),("Verified Attorneys","All attorneys are<br>licensed and<br>background checked."),("Wide Range of Help","From business to<br>real estate to<br>contracts and more.")]
# desktop
d=[]
d.append(f'<img src="img/d-logo.webp" alt="Legalgrads" style="{P(60,45,410,100)}">')
d.append(f'<img src="img/d-pill.webp" alt="Coming soon" style="{P(1235,28,233,60)}">')
d.append(f'<img src="img/d-art.webp" alt="Newly licensed attorney profiles: Maya R. and Jordan K." style="{P(795,120,741,670)}">')
d.append(f'<img src="img/d-spark.webp" alt="" style="{P(742,170,58,80)}">')
d.append(f'''<h1 class="h1" style="{P(73,270)}font-size:{U(69)};line-height:{U(71)};letter-spacing:-.015em;"><span class="ul" style="letter-spacing:-.03em">Fresh<i style="height:{U(9)};bottom:{U(-2)}"></i></span> <span style="letter-spacing:-.03em">out of law school.</span><br><span class="gt" style="letter-spacing:-.012em">Ready to work for you.</span></h1>''')
d.append(f'<p class="sub" style="{P(76,428)}font-size:{U(33.7)};line-height:{U(39)}">Hire newly licensed attorneys who are ready<br>to build their practices.</p>')
d.append(f'''<form class="sf" style="{P(76,540,694,80)}"><span class="mi" style="left:{U(30)};width:{U(30)}">{mail}</span><input type="email" name="email" aria-label="Email address" placeholder="Drop your email for early access" style="left:{U(86)};font-size:{U(21)};width:{U(360)}"><button style="right:{U(8)};top:{U(8)};bottom:{U(8)};width:{U(222)};font-size:{U(24)}">Join the list ✨</button></form>''')
d.append(f'<p class="ns" style="{P(77,637)}font-size:{U(19.4)}">Be the first to know when we launch. No <span class="nsu">spam.<i style="height:{U(4)};bottom:{U(-7)}"></i></span></p>')
d.append(f'<p class="err" style="{P(77,680)}font-size:{U(17)}"></p>')
for i,(cx,tx) in enumerate(zip((90,440,815,1195),(156,505,873,1258))):
    d.append(f'<img src="img/icon{i}.webp" alt="" style="{P(cx-45,800,90,90)}">')
    t,dd=ft[i];d.append(f'<div class="ft" style="{P(tx,808)}"><h3 style="font-size:{U(23.3)}">{t}</h3><p style="font-size:{U(18.4)};line-height:{U(24)};margin-top:{U(5)}">{dd}</p></div>')
for x in (367,742,1125):d.append(f'<span class="dv" style="{P(x,808,1.5,104)}"></span>')
d.append(f'<p class="cp" style="{P(76,990)}font-size:{U(13)}">© 2026 Legalgrads</p>')
# mobile
m=[]
m.append(f'<img src="img/m-logo.webp" alt="Legalgrads" style="{P(50,66,378,97)}">')
m.append(f'<img src="img/m-pill.webp" alt="Coming soon" style="{P(510,87,240,69)}">')
m.append(f'<button class="bg" aria-label="Menu" style="{P(782,95,58,50)}"><img src="img/m-burger.webp" alt="" style="width:100%;height:100%"></button>')
m.append(f'<img src="img/m-spark.webp" alt="" style="{P(705,185,95,105)}">')
m.append(f'''<h1 class="h1" style="{P(68,233)}font-size:{U(62.5)};line-height:{U(64)}"><span class="ul" style="letter-spacing:-.03em">Fresh out<i style="height:{U(6)};bottom:{U(-6)}"></i></span> <span style="letter-spacing:-.03em">of law school.</span><br><span class="gt">Ready to work for you.</span></h1>''')
m.append(f'<p class="sub" style="{P(71,380)}font-size:{U(34.3)};line-height:{U(42)}">Hire newly licensed attorneys who are ready<br>to build their practices.</p>')
m.append(f'''<form class="sf" style="{P(66,506,758,90)}"><span class="mi" style="left:{U(30)};width:{U(36)}">{mail}</span><input type="email" name="email" aria-label="Email address" placeholder="Drop your email for early access" style="left:{U(90)};font-size:{U(23)};width:{U(330)}"><button style="right:{U(10)};top:{U(10)};bottom:{U(10)};width:{U(282)};font-size:{U(26)}">Join the list ✨ →</button></form>''')
m.append(f'<p class="ns" style="{P(0,618,885)}font-size:{U(22)};text-align:center">Be the first to know when we launch. <span class="nsu" style="font-weight:700;color:#0d0f3a">No spam.<i style="height:{U(4)};bottom:{U(-8)}"></i></span></p>')
m.append(f'<p class="err" style="{P(0,660,885)}font-size:{U(19)};text-align:center"></p>')
m.append(f'<img src="img/m-art.webp" alt="Newly licensed attorney profiles: Maya R. and Jordan K." style="{P(8,690,869,720)}">')
for i,cx in enumerate((122,325,547,767)):
    m.append(f'<img src="img/icon{i}.webp" alt="" style="{P(cx-50,1428,100,100)}">')
    t,dd=ftm[i];m.append(f'<div class="ft c" style="{P(cx-110,1533,220)}"><h3 style="font-size:{U(21)}">{t}</h3><p style="font-size:{U(19.6)};line-height:{U(26)};margin-top:{U(6)}">{dd}</p></div>')
for x in (217,434,656):m.append(f'<span class="dv" style="{P(x,1425,1.5,240)}"></span>')
m.append(f'<p class="cp" style="{P(0,1730,885)}font-size:{U(18)};text-align:center">© 2026 Legalgrads</p>')
html=open('/workspace/legalgrads-build/tpl.html').read().replace('%%D%%','\n'.join(d)).replace('%%M%%','\n'.join(m))
open('/workspace/legalgrads/index.html','w').write(html)
