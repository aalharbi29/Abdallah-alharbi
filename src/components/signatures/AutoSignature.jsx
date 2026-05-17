import React, { useEffect, useMemo, useState } from 'react';

const SIGNATURES = [
  {
    name: 'عبدالله عبدالعزيز العوفي',
    imageUrl: 'https://media.base44.com/images/public/68af5003813e47bd07947b30/6085a6c5f_image.png',
  },
];

const normalizeArabicName = (value = '') => value
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/ـ/g, '')
  .replace(/[إأآا]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/\s+/g, ' ')
  .trim();

const findSignature = (name) => {
  const normalizedName = normalizeArabicName(name);
  return SIGNATURES.find((signature) => normalizedName.includes(normalizeArabicName(signature.name)));
};

function useCleanSignature(imageUrl) {
  const [cleanUrl, setCleanUrl] = useState(imageUrl);

  useEffect(() => {
    if (!imageUrl) return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.drawImage(image, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const brightness = (red + green + blue) / 3;

        if (brightness < 35) {
          pixels[index + 3] = 0;
        } else {
          const alpha = Math.min(255, Math.max(70, (brightness - 35) * 1.35));
          pixels[index] = 8;
          pixels[index + 1] = 24;
          pixels[index + 2] = 45;
          pixels[index + 3] = alpha;
        }
      }

      context.putImageData(imageData, 0, 0);
      setCleanUrl(canvas.toDataURL('image/png'));
    };
    image.src = imageUrl;
  }, [imageUrl]);

  return cleanUrl;
}

export default function AutoSignature({ name, className = '' }) {
  const signature = useMemo(() => findSignature(name), [name]);
  const cleanUrl = useCleanSignature(signature?.imageUrl);

  if (!signature) return null;

  return (
    <img
      src={cleanUrl}
      alt={`توقيع ${signature.name}`}
      className={`pointer-events-none absolute left-1/2 top-1/2 max-h-16 w-40 -translate-x-1/2 -translate-y-1/2 object-contain ${className}`}
    />
  );
}