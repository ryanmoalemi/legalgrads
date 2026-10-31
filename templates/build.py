import json
CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Red Hat Display',system-ui,sans-serif;background:#FFF8F1;color:#0B0B3B;line-height:1.5}
a{color:#7A00FF}
.top{display:flex;justify-content:space-between;align-items:center;padding:14px 28px;background:#fff;border-bottom:1px solid #F3E9FF}
.top img{height:34px}.top nav a{margin-left:20px;font-weight:700;text-decoration:none;color:#0B0B3B;font-size:15px}
.top .join{background:#FF008A;color:#fff!important;padding:9px 16px;border-radius:999px}
.example{background:#0B0B3B;color:#fff;text-align:center;font-weight:800;font-size:13px;padding:6px;letter-spacing:.5px}
.wrap{max-width:1100px;margin:0 auto;padding:20px 24px 110px}
.crumbs{font-size:13px;color:#6b6b8f;margin-bottom:14px}.crumbs a{color:#6b6b8f;text-decoration:none}
.hero{position:relative;border-radius:28px;padding:30px;background:linear-gradient(120deg,#7A00FF 0%,#FF008A 60%,#FF6B22 100%);color:#fff;display:flex;gap:26px;align-items:center;overflow:hidden}
.hero:after{content:"";position:absolute;right:-40px;top:-40px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.12)}
.avatar{flex:none;width:150px;height:150px;border-radius:50%;border:5px solid #fff;object-fit:cover;background:#F3E9FF;color:#7A00FF;display:flex;align-items:center;justify-content:center;font-size:52px;font-weight:900;box-shadow:0 10px 30px rgba(0,0,0,.2);position:relative}
.tassel{position:absolute;right:-6px;top:-10px;font-size:40px;transform:rotate(15deg)}
.hero h1{font-size:40px;font-weight:900;line-height:1.1}
.hero .head{font-size:18px;font-weight:600;opacity:.95;margin:4px 0 12px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);padding:5px 12px;border-radius:999px;font-size:13px;font-weight:700}
.chip.solid{background:#fff;color:#7A00FF}.chip.mint{background:#00C5A2;border-color:#00C5A2;color:#fff}.chip.gold{background:#FFD23F;color:#0B0B3B;border-color:#FFD23F}
.grid{display:grid;grid-template-columns:1fr 340px;gap:22px;margin-top:22px}
.card{background:#fff;border-radius:22px;padding:24px;box-shadow:0 4px 18px rgba(122,0,255,.07);margin-bottom:22px}
.card h2{font-size:20px;font-weight:900;margin-bottom:12px}
.lic{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.lic div{background:#F4EEFF;border-radius:14px;padding:12px}.lic small{display:block;font-size:12px;color:#6b6b8f;font-weight:700;text-transform:uppercase;letter-spacing:.5px}.lic b{font-size:16px}
.ok{color:#00A889}
.verified{font-size:13px;color:#6b6b8f;margin-top:12px}
.svc{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.svc div{border:2px solid #F3E9FF;border-radius:16px;padding:14px}.svc b{display:block}.svc span{font-size:14px;color:#4a4a70}
.tags span{display:inline-block;background:#FFF1F8;color:#C2006A;font-weight:700;font-size:13px;border-radius:999px;padding:5px 12px;margin:0 6px 6px 0}
.note{font-size:13px;background:#FFF8F1;border-radius:12px;padding:10px 12px;margin-top:12px}
.cta{background:#0B0B3B;color:#fff}
.btn{display:block;text-align:center;font-weight:800;border-radius:999px;padding:14px;text-decoration:none;margin-top:12px}
.btn.pink{background:#FF008A;color:#fff}.btn.ghost{border:2px solid #fff;color:#fff}.btn.out{border:2px solid #7A00FF;color:#7A00FF}
.claim{background:linear-gradient(135deg,#FFD23F,#FF6B22);color:#0B0B3B}
.claim h2{font-size:22px}.claim ul{margin:10px 0 0 18px;font-size:14px}
.facts li{list-style:none;display:flex;justify-content:space-between;border-bottom:1px solid #F3E9FF;padding:9px 0;font-size:14px;gap:10px}.facts li span:first-child{color:#6b6b8f}.facts li span:last-child{font-weight:700;text-align:right}
.disc{font-size:12.5px;color:#55557a;background:#fff;border-radius:16px;padding:16px;border:1px dashed #d9c7ff}
.small{font-size:13px}
.sticky{display:none}
footer{text-align:center;font-size:12px;color:#6b6b8f;padding:20px}
@media(max-width:800px){
 .top nav a:not(.join){display:none}
 .hero{flex-direction:column;text-align:center;padding:26px 18px}.chips{justify-content:center}.hero h1{font-size:30px}
 .avatar{width:120px;height:120px;font-size:42px}
 .grid{grid-template-columns:1fr}.svc,.lic{grid-template-columns:1fr}
 .sticky{display:flex;gap:10px;position:fixed;left:0;right:0;bottom:0;background:#fff;padding:12px 16px;box-shadow:0 -6px 20px rgba(0,0,0,.1);z-index:9}
 .sticky a{flex:1;margin:0}
}
"""
DISC = """<div class="disc"><b>About this listing.</b> LegalGrads is a free directory of licensed attorneys. We are not a law firm and not a lawyer referral service. We don't recommend, rank, match or endorse any attorney, and we don't receive any part of an attorney's fees. You contact attorneys directly. Information on unclaimed profiles comes from public State Bar records; always confirm license status on the official State Bar website. Listing is not a guarantee of quality. Attorney advertising.</div>"""

def page(fname,title,desc,schema,body):
    html=f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}"><link rel="canonical" href="https://legalgrads.com/attorneys/ca/san-diego/jordan-example-000000/">
<meta name="robots" content="noindex"><!-- example template: remove noindex on real profiles -->
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<script type="application/ld+json">{json.dumps(schema,indent=1)}</script><style>{CSS}</style></head><body>
<div class="example">EXAMPLE PROFILE: fictional attorney, placeholder data</div>
<header class="top"><img src="assets/logo.svg" alt="LegalGrads"><nav><a href="#">Find a lawyer</a><a href="#">For attorneys</a><a href="#">How it works</a><a class="join" href="#">Join free</a></nav></header>
<main class="wrap"><div class="crumbs"><a href="#">Home</a> › <a href="#">California</a> › <a href="#">San Diego</a> › <a href="#">Business &amp; contracts</a> › Jordan Example</div>
{body}</main><footer>© 2026 LegalGrads · <a href="#">Terms</a> · <a href="#">Privacy</a> · <a href="#">Referral disclosure</a></footer></body></html>"""
    open(fname,"w").write(html)

BAR="https://apps.calbar.ca.gov/attorney/Licensee/Detail/000000"
person={"@type":"Person","name":"Jordan Example","jobTitle":"Attorney","address":{"@type":"PostalAddress","addressLocality":"San Diego","addressRegion":"CA","addressCountry":"US"},"alumniOf":{"@type":"CollegeOrUniversity","name":"Example School of Law"},"hasCredential":{"@type":"EducationalOccupationalCredential","credentialCategory":"license","name":"State Bar of California license #000000","recognizedBy":{"@type":"Organization","name":"The State Bar of California"},"url":BAR}}
crumbs={"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":i+1,"name":n} for i,n in enumerate(["Home","California","San Diego","Jordan Example"])]}

lic="""<div class="card"><h2>🎓 License (from the State Bar)</h2><div class="lic">
<div><small>State bar</small><b>California</b></div><div><small>Bar number</small><b><a href="{bar}" target="_blank" rel="nofollow">#000000 ↗</a></b></div>
<div><small>Admitted</small><b>Dec 2025</b></div><div><small>Status</small><b class="ok">● Active</b></div>
<div><small>Public discipline</small><b>None on record</b></div><div><small>Law school</small><b>Example School of Law</b></div></div>
<p class="verified">✓ Last verified from State Bar of California records on Oct 27, 2026. <a href="{bar}" target="_blank" rel="nofollow">Check the official profile</a></p></div>""".format(bar=BAR)

# UNCLAIMED
s1={"@context":"https://schema.org","@graph":[dict(person,**{"@id":"#p"}),crumbs]}
page("profile-unclaimed.html","Jordan Example, Attorney in San Diego, CA | LegalGrads","Jordan Example is a California attorney admitted in 2025. License info from State Bar records.",s1,f"""
<section class="hero"><div class="avatar" aria-label="No photo">JE<span class="tassel">🎓</span></div><div>
<h1>Jordan Example</h1><div class="head">Attorney · San Diego, CA</div>
<div class="chips"><span class="chip solid">Unclaimed profile</span><span class="chip">📍 San Diego, CA</span><span class="chip">🎓 Admitted 2025</span><span class="chip">● Active license</span></div></div></section>
<div class="grid"><div>{lic}
<div class="card"><h2>What we know</h2><p>This basic listing was created from public State Bar of California records. Jordan hasn't added a photo, services, or contact details yet. Contact details shown by the State Bar are available on the <a href="{BAR}" rel="nofollow">official profile</a>.</p></div>
{DISC}<p class="small" style="margin-top:12px">Are you Jordan and want this listing taken down? <a href="#">Request removal</a></p></div>
<aside><div class="card claim"><h2>Are you this attorney?<br>Claim your free profile 🎉</h2><ul><li>Add your photo, bio &amp; services</li><li>Get a verified bar badge</li><li>Become a Founding Member: always free</li></ul><a class="btn pink" href="#">Claim my free profile</a><p class="small" style="margin-top:8px">We confirm it's you with a code mailed to your State Bar address.</p></div>
<div class="card"><h2>Need a lawyer for your business?</h2><p class="small">Browse newly licensed attorneys who have set up their profiles and contact them directly.</p><a class="btn out" href="#">Browse the directory</a></div></aside></div>
<div class="sticky"><a class="btn pink" href="#">Claim this free profile</a></div>""")

# CLAIMED
svc=[("📝 Contract drafting","Vendor, client &amp; service agreements"),("🔍 Contract review","Plain-English redlines before you sign"),("✉️ Demand &amp; business letters","Collections, cease-and-desist, notices"),("🏢 Business formation","LLC / corporation setup &amp; operating agreements"),("💬 Legal advice sessions","Quick answers for owners, by video or phone"),("📄 Policies &amp; templates","Website terms, privacy, contractor forms")]
svch="".join(f"<div><b>{a}</b><span>{b}</span></div>" for a,b in svc)
s2={"@context":"https://schema.org","@graph":[dict(person,**{"@id":"#p","image":"assets/attorney-photo.jpg","knowsLanguage":["English","Spanish"],"knowsAbout":["Contracts","Business formation","Small business law"],"url":"https://example.com","worksFor":{"@id":"#svc"}}),
 {"@type":"LegalService","@id":"#svc","name":"Jordan Example, Attorney at Law","image":"assets/attorney-photo.jpg","areaServed":"California","address":{"@type":"PostalAddress","addressLocality":"San Diego","addressRegion":"CA"},"url":"https://example.com","employee":{"@id":"#p"}},crumbs]}
page("profile-claimed.html","Jordan Example, Business & Contracts Attorney in San Diego, CA | LegalGrads","Jordan Example helps small businesses with contracts, formation and advice. Licensed in California since 2025.",s2,f"""
<section class="hero"><div style="position:relative"><img class="avatar" src="assets/attorney-photo.jpg" alt="Jordan Example"><span class="tassel" style="position:absolute;right:-6px;top:-10px;font-size:40px">🎓</span></div><div>
<h1>Jordan Example</h1><div class="head">Business &amp; contracts attorney for small businesses · San Diego, CA</div>
<div class="chips"><span class="chip gold">⭐ Founding Member · Joined 2026</span><span class="chip mint">✓ Verified CA Bar #000000</span><span class="chip">🎓 Admitted 2025</span><span class="chip">🗣 English, Spanish</span><span class="chip">💻 Remote across California</span></div></div></section>
<div class="grid"><div>
<div class="card"><h2>👋 About Jordan</h2><p>I help small business owners get their paperwork right the first time: contracts, LLC setup and the letters that get you paid. Before law school I ran the books for my family's restaurant, so I know what a surprise legal bill feels like. I keep things plain-English and responsive.</p></div>
<div class="card"><h2>Services</h2><div class="svc">{svch}</div><p class="note">Outside-court work only. Jordan doesn't take court appearances or litigation through LegalGrads.</p></div>
<div class="card"><h2>Practice areas</h2><div class="tags"><span>Business &amp; corporate</span><span>Contracts</span><span>Small business</span><span>Employment basics</span><span>Intellectual property basics</span></div></div>
{lic}{DISC}</div>
<aside><div class="card cta"><h2>Talk to Jordan directly</h2><p class="small" style="opacity:.85">You reach Jordan directly. LegalGrads isn't part of the conversation and takes no fee.</p><a class="btn pink" href="#">✉️ Email Jordan</a><a class="btn ghost" href="#">🌐 Visit website</a><a class="btn ghost" href="#">📞 (619) 555-0100</a></div>
<div class="card"><h2>Quick facts</h2><ul class="facts"><li><span>Location</span><span>San Diego, CA</span></li><li><span>Licensed in</span><span>California</span></li><li><span>Admitted</span><span>Dec 2025</span></li><li><span>Law school</span><span>Example School of Law</span></li><li><span>Languages</span><span>English, Spanish</span></li><li><span>Meets</span><span>Video, phone, in person</span></li></ul></div>
<p class="small" style="text-align:center"><a href="#">Report this profile</a></p></aside></div>
<div class="sticky"><a class="btn pink" href="#">✉️ Email</a><a class="btn out" href="#">🌐 Website</a></div>""")
