'use client';

type Seg = { label: string; amount: number; fill: string };
type Bar = { name: string; note: string; parts: Seg[] };

const BARS: Bar[] = [
  {
    name: 'California, license $598',
    note: 'Jan to May oath',
    parts: [
      { label: 'Registration', amount: 155, fill: '#0B0B3B' },
      { label: 'MPRE', amount: 185, fill: '#7A00FF' },
      { label: 'Moral character', amount: 900, fill: '#FF4D8D' },
      { label: 'Bar exam', amount: 878, fill: '#3D5AFE' },
      { label: 'Laptop', amount: 153, fill: '#F5B942' },
      { label: 'First license', amount: 598, fill: '#12B886' },
    ],
  },
  {
    name: 'California, license $0',
    note: 'December oath',
    parts: [
      { label: 'Registration', amount: 155, fill: '#0B0B3B' },
      { label: 'MPRE', amount: 185, fill: '#7A00FF' },
      { label: 'Moral character', amount: 900, fill: '#FF4D8D' },
      { label: 'Bar exam', amount: 878, fill: '#3D5AFE' },
      { label: 'Laptop', amount: 153, fill: '#F5B942' },
    ],
  },
  {
    name: 'Illinois, timely first time',
    note: 'New-admittee ARDC is $0',
    parts: [
      { label: 'Character and fitness', amount: 450, fill: '#FF4D8D' },
      { label: 'Bar exam', amount: 1200, fill: '#3D5AFE' },
      { label: 'Laptop (NCBE chart)', amount: 135, fill: '#F5B942' },
      { label: 'MPRE', amount: 185, fill: '#7A00FF' },
    ],
  },
  {
    name: 'Texas, in-state FAQ path',
    note: 'FAQ fees plus $37 dues',
    parts: [
      { label: 'Declaration', amount: 190, fill: '#0B0B3B' },
      { label: 'Bar exam', amount: 450, fill: '#3D5AFE' },
      { label: 'Laptop', amount: 50, fill: '#F5B942' },
      { label: 'MPRE', amount: 185, fill: '#7A00FF' },
      { label: 'License + legal services', amount: 90, fill: '#12B886' },
      { label: 'Dues, low month', amount: 37, fill: '#5C6B8A' },
    ],
  },
  {
    name: 'New York, ABA J.D.',
    note: 'No separate C&F fee found',
    parts: [
      { label: 'Bar exam', amount: 250, fill: '#3D5AFE' },
      { label: 'Laptop', amount: 100, fill: '#F5B942' },
      { label: 'MPRE', amount: 185, fill: '#7A00FF' },
      { label: 'Attorney registration', amount: 375, fill: '#12B886' },
    ],
  },
];

const max = Math.max(...BARS.map((b) => b.parts.reduce((s, p) => s + p.amount, 0)));
const money = (n: number) => `$${n.toLocaleString('en-US')}`;

function summary() {
  return [
    'California official bill: $2,271 with a December oath, or $2,869 with a Jan to May oath (registration $155, MPRE $185, moral character $900, exam $878, laptop $153, first license $0 or $598).',
    'New York ABA path on this chart: $910 (exam $250, laptop $100, MPRE $185, registration $375). $2,271 is about 2.5 times $910. $2,869 is about 3.2 times $910.',
    'Illinois timely first-time path: $1,970. California is higher, not 2.5 times Illinois.',
    'Texas in-state FAQ path with $37 dues: $1,002. BLE has announced a $150 exam increase starting July 2026 that is not in the FAQ chart yet.',
  ].join(' ');
}

export function BillComparison() {
  async function copyText() {
    try { await navigator.clipboard.writeText(summary()); } catch { /* ignore */ }
  }
  function downloadPng() {
    const svg = document.getElementById('bill-chart-svg');
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1100;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#fff8f1';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'legalgrads-official-bill-comparison.png';
      a.click();
    };
    img.src = url;
  }
  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8" data-testid="bill-comparison">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Same kind of bill, four states</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy sm:text-3xl">California&apos;s $2,271 path is about 2.5 times New York</h2>
      <p className="mt-2 max-w-3xl text-ink">The bars add registration or declaration, the MPRE, character where a fee is published, the exam, a laptop fee, and the first license or registration. $2,271 divided by New York&apos;s $910 is about 2.5. The $2,869 California path is about 3.2 times that New York stack. Illinois lands at $1,970, so California is not 2.5 times Illinois.</p>
      <svg id="bill-chart-svg" viewBox="0 0 1100 640" role="img" aria-label="Stacked comparison of official bills in California, Illinois, Texas, and New York" className="mt-6 w-full">
        <rect width="1100" height="640" fill="#fff8f1" />
        <text x="32" y="42" fill="#0B0B3B" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">Official bill to a law license</text>
        {BARS.map((bar, i) => {
          const total = bar.parts.reduce((s, p) => s + p.amount, 0);
          const y = 80 + i * 100;
          let x = 280;
          const width = (total / max) * 760;
          return (
            <g key={bar.name}>
              <text x="24" y={y + 28} fill="#0B0B3B" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="700">{bar.name}</text>
              <text x="24" y={y + 50} fill="#4b5563" fontFamily="Arial, sans-serif" fontSize="13">{bar.note}</text>
              {bar.parts.map((p) => {
                const w = (p.amount / max) * 760;
                const node = <rect key={p.label} x={x} y={y} width={Math.max(w, 0)} height="64" fill={p.fill} />;
                x += w;
                return node;
              })}
              <text x={280 + width + 8} y={y + 38} fill="#0B0B3B" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="700">{money(total)}</text>
            </g>
          );
        })}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-3 text-xs text-ink">
        <li><span className="mr-1 inline-block h-3 w-3 rounded-sm" style={{ background: '#0B0B3B' }} />Registration or declaration</li>
        <li><span className="mr-1 inline-block h-3 w-3 rounded-sm" style={{ background: '#7A00FF' }} />MPRE $185</li>
        <li><span className="mr-1 inline-block h-3 w-3 rounded-sm" style={{ background: '#FF4D8D' }} />Character</li>
        <li><span className="mr-1 inline-block h-3 w-3 rounded-sm" style={{ background: '#3D5AFE' }} />Exam</li>
        <li><span className="mr-1 inline-block h-3 w-3 rounded-sm" style={{ background: '#F5B942' }} />Laptop</li>
        <li><span className="mr-1 inline-block h-3 w-3 rounded-sm" style={{ background: '#12B886' }} />License or registration</li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={copyText} className="min-h-11 rounded-full bg-navy px-5 font-display text-sm font-bold text-white" data-testid="copy-bill">Copy comparison</button>
        <button type="button" onClick={downloadPng} className="min-h-11 rounded-full bg-pink px-5 font-display text-sm font-bold text-white" data-testid="download-bill">Download PNG</button>
      </div>
      <p className="mt-3 text-xs text-ink/80">You can also right-click the chart and save the SVG. Illinois laptop ($135) is the NCBE fee chart, not a line we found on the Illinois Board page. Texas BLE&apos;s FAQ still lists a $450 in-state exam and a $50 laptop. A BLE news note says exam fees rise $150 starting with July 2026, so the Texas bar may be low. Texas dues run about $37 to $111 by admission month. This bar uses $37. New York: no separate character-and-fitness application fee turned up on the Board of Law Examiners fee list.</p>
      <ul className="mt-3 space-y-1 text-sm">
        <li><a className="text-purple underline" href="https://www.calbar.ca.gov/sites/default/files/2026-06/Rules_Appendix_A_Sched_Chgs-deadlines.pdf" target="_blank" rel="noopener noreferrer">CalBar Schedule of Charges</a></li>
        <li><a className="text-purple underline" href="https://www.ncbex.org/exams/mpre/registration" target="_blank" rel="noopener noreferrer">NCBE MPRE registration</a></li>
        <li><a className="text-purple underline" href="https://nybarexam.org/thebar/NYBarExamInformationGuide.pdf" target="_blank" rel="noopener noreferrer">New York UBE guide ($250 exam, $100 laptop)</a></li>
        <li><a className="text-purple underline" href="https://www.nycourts.gov/rules/part-118-registration-attorneys-house-counsel-and-foreign-legal-consultants" target="_blank" rel="noopener noreferrer">New York attorney registration</a></li>
        <li><a className="text-purple underline" href="https://www.ilbaradmissions.org/appinfo.action?id=1" target="_blank" rel="noopener noreferrer">Illinois exam fees</a></li>
        <li><a className="text-purple underline" href="https://registration.iardc.org/attyreg/Registration/Registration_Department/FAQs/Registration/regdept/2026_Fee_Schedule.aspx" target="_blank" rel="noopener noreferrer">Illinois ARDC 2026 fee schedule</a></li>
        <li><a className="text-purple underline" href="https://www.ncbex.org/jurisdictions/IL/chart/7" target="_blank" rel="noopener noreferrer">NCBE Illinois fee chart (laptop)</a></li>
        <li><a className="text-purple underline" href="https://ble.texas.gov/faq.action" target="_blank" rel="noopener noreferrer">Texas BLE fee FAQ</a></li>
        <li><a className="text-purple underline" href="https://www.texasbar.com/AM/Template.cfm?ContentID=29060&Section=New_Lawyer_Forms_and_Fees1&Template=%2FCM%2FContentDisplay.cfm" target="_blank" rel="noopener noreferrer">State Bar of Texas new lawyer fees</a></li>
      </ul>
    </section>
  );
}
