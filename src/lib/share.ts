export const INVITE_URL = 'https://legalgrads.com/join/';

export function downloadShareCard(name: string): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#FFF8F1';
  ctx.fillRect(0, 0, 1200, 630);
  const gradient = ctx.createLinearGradient(80, 180, 900, 180);
  gradient.addColorStop(0, '#7A00FF');
  gradient.addColorStop(0.6, '#FF008A');
  gradient.addColorStop(1, '#FF6B22');
  ctx.fillStyle = gradient;
  ctx.fillRect(80, 150, 420, 14);
  ctx.fillStyle = '#0B0B3B';
  ctx.font = '800 72px sans-serif';
  ctx.fillText("I'm on Legalgrads", 80, 280);
  ctx.font = '600 40px sans-serif';
  ctx.fillText(name, 80, 360);
  ctx.fillStyle = '#7A00FF';
  ctx.font = '700 32px sans-serif';
  ctx.fillText('Founding Member · California', 80, 440);
  ctx.fillStyle = '#4A4E72';
  ctx.font = '400 28px sans-serif';
  ctx.fillText('legalgrads.com', 80, 520);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'im-on-legalgrads.png';
  link.click();
}

export async function inviteClassmate(): Promise<string> {
  const text = `I'm joining Legalgrads. Apply here: ${INVITE_URL}`;
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: 'Legalgrads', text, url: INVITE_URL });
      return 'Share sheet opened.';
    } catch {
      return 'Link ready to copy.';
    }
  }
  try {
    await navigator.clipboard.writeText(INVITE_URL);
    return 'Link copied.';
  } catch {
    return 'Copy the link below.';
  }
}
