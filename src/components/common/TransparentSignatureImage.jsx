import React, { useEffect, useState } from 'react';

export default function TransparentSignatureImage({ src, alt, className = '', style = {} }) {
  const [processedSrc, setProcessedSrc] = useState(src);

  useEffect(() => {
    if (!src) return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        setProcessedSrc(canvas.toDataURL('image/png'));
      } catch {
        setProcessedSrc(src);
      }
    };
    image.onerror = () => setProcessedSrc(src);
    image.src = src;
  }, [src]);

  return (
    <img
      src={processedSrc}
      alt={alt}
      className={className}
      style={{ background: 'transparent', mixBlendMode: processedSrc === src ? 'multiply' : 'normal', ...style }}
      crossOrigin="anonymous"
    />
  );
}