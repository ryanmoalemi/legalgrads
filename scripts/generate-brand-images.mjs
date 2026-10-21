import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

mkdirSync('public/icons', { recursive: true });

const mark = readFileSync('public/logos/legalgrads_mark.svg', 'utf8');

function png(svg, file, width) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
  writeFileSync(file, resvg.render().asPng());
  console.log(file);
}

const icon = (size) => `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#FFF8F1"/>
  <g transform="translate(${size * 0.16} ${size * 0.16}) scale(${(size * 0.68) / 96})">
    ${mark.replace(/<svg[^>]*>/, '').replace('</svg>', '')}
  </g>
</svg>`;

png(icon(512), 'public/icons/icon-512.png', 512);
png(icon(192), 'public/icons/icon-192.png', 192);
png(icon(180), 'public/icons/apple-touch-icon.png', 180);

const og = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FFF8F1"/>
  <circle cx="980" cy="140" r="180" fill="#7A00FF" fill-opacity="0.12"/>
  <circle cx="180" cy="520" r="160" fill="#FF008A" fill-opacity="0.12"/>
  <g transform="translate(80 70) scale(1.3)">
    ${mark.replace(/<svg[^>]*>/, '').replace('</svg>', '')}
  </g>
  <text x="230" y="150" font-family="Arial, sans-serif" font-size="72" font-weight="700" fill="#0B0B3B">Legalgrads</text>
  <text x="80" y="320" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="#0B0B3B">Fresh out of law school.</text>
  <text x="80" y="400" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="#FF008A">Ready to work for you.</text>
  <text x="80" y="490" font-family="Arial, sans-serif" font-size="28" fill="#4A4E72">Interactive demo with fictional attorney profiles.</text>
</svg>`;
png(og, 'public/og-image.png', 1200);
png(icon(96), 'public/icons/social-avatar.png', 96);
