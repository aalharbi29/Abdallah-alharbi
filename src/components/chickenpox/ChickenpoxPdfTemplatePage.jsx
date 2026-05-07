import React from 'react';

export default function ChickenpoxPdfTemplatePage({ imageUrl, pageNumber, printable = true }) {
  return (
    <div
      className={printable ? 'a4-page pdf-template-page' : 'guidelines-page pdf-template-page'}
      style={{
        width: '210mm',
        height: '297mm',
        background: '#fff',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}
    >
      <img
        src={imageUrl}
        alt={`صفحة ${pageNumber}`}
        crossOrigin="anonymous"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          display: 'block',
        }}
      />
    </div>
  );
}