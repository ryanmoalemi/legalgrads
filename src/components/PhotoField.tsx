'use client';

import { useState } from 'react';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function PhotoField({
  photoDataUrl,
  error,
  onPhoto,
  onError,
}: {
  photoDataUrl: string;
  error?: string;
  onPhoto: (dataUrl: string, name: string) => void;
  onError: (message: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  function publish(img: HTMLImageElement, nextZoom: number) {
    onPhoto(crop(img, nextZoom), img.dataset.name || 'photo.jpg');
  }

  function onFile(file: File | null) {
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const typeOk = TYPES.includes(file.type) || ['jpg', 'jpeg', 'png', 'webp'].includes(extension);
    if (!typeOk) {
      onError('Use a JPG, PNG, or WebP photo.');
      return;
    }
    if (file.size >= 5 * 1024 * 1024) {
      onError('Use a photo under 5 MB.');
      return;
    }
    onError('');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      img.dataset.name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
      setImage(img);
      setZoom(1);
      publish(img, 1);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => onError('That file could not be read. Use a JPG, PNG, or WebP photo.');
    img.src = url;
  }

  const preview = image ? crop(image, zoom) : photoDataUrl;

  return (
    <div>
      <label className="text-sm font-medium text-navy" htmlFor="apply-photo">Photo, optional
        <input
          id="apply-photo"
          data-testid="apply-photo"
          className="mt-1 block w-full"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-invalid={error ? true : undefined}
          aria-describedby="hint-photo err-photo"
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <p id="hint-photo" className="mt-1 text-sm text-ink">Why we ask: clients recognize you on the listing. JPG, PNG, or WebP, under 5 MB. Drag the zoom to frame the circle.</p>
      {error ? <p id="err-photo" role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{error}</p> : <p id="err-photo" className="sr-only" />}
      {preview ? (
        <div className="mt-3 flex items-center gap-4">
          <img src={preview} alt="Cropped photo preview" className="h-28 w-28 rounded-full object-cover ring-2 ring-purple/30" data-testid="photo-preview" />
          <label className="text-sm font-medium text-navy">Zoom
            <input aria-label="Zoom photo" className="mt-1 block w-40" type="range" min={1} max={3} step={0.05} value={zoom} onChange={(event) => {
              const next = Number(event.target.value);
              setZoom(next);
              if (image) publish(image, next);
            }} />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function crop(image: HTMLImageElement, zoom: number): string {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#FFF8F1';
  ctx.fillRect(0, 0, size, size);
  const scale = Math.max(size / image.width, size / image.height) * zoom;
  const width = image.width * scale;
  const height = image.height * scale;
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.85);
}
