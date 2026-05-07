import React from 'react';

export default function FillablePdfTemplatePage({
  imageUrl,
  pageNumber,
  printable = true,
  items = [],
  onItemsChange,
  activeTool,
  onToolUsed,
}) {
  const addItem = (e) => {
    if (!activeTool || !printable) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newItem = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: activeTool,
      x,
      y,
      value: activeTool === 'check' ? '✓' : '',
    };
    onItemsChange?.([...items, newItem]);
    onToolUsed?.();
  };

  const updateItem = (id, value) => {
    onItemsChange?.(items.map((item) => item.id === id ? { ...item, value } : item));
  };

  const removeItem = (id) => {
    onItemsChange?.(items.filter((item) => item.id !== id));
  };

  return (
    <div
      className={printable ? 'a4-page pdf-template-page' : 'guidelines-page pdf-template-page'}
      onClick={addItem}
      style={{
        width: '210mm',
        height: '297mm',
        background: '#fff',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        cursor: activeTool && printable ? 'crosshair' : 'default',
      }}
    >
      <img
        src={imageUrl}
        alt={`صفحة ${pageNumber}`}
        crossOrigin="anonymous"
        style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }}
      />

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            right: `${100 - item.x}%`,
            top: `${item.y}%`,
            transform: 'translate(50%, -50%)',
            zIndex: 5,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {item.type === 'check' ? (
            <button
              type="button"
              onClick={() => updateItem(item.id, item.value ? '' : '✓')}
              style={{
                width: '18px',
                height: '18px',
                border: 'none',
                background: 'transparent',
                color: '#000',
                fontSize: '14pt',
                fontWeight: 800,
                lineHeight: '18px',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              {item.value}
            </button>
          ) : (
            <input
              value={item.value}
              onChange={(e) => updateItem(item.id, e.target.value)}
              autoFocus={!item.value}
              style={{
                width: '120px',
                height: '20px',
                border: '1px dashed rgba(0,0,0,0.25)',
                background: 'rgba(255,255,255,0.35)',
                fontFamily: "'Tajawal','Cairo',Arial,sans-serif",
                fontSize: '10pt',
                fontWeight: 600,
                color: '#000',
                padding: '0 3px',
                textAlign: 'center',
                outline: 'none',
              }}
            />
          )}
          <button
            type="button"
            className="no-print"
            onClick={() => removeItem(item.id)}
            style={{
              position: 'absolute',
              top: '-13px',
              left: '-13px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              fontSize: '10px',
              lineHeight: '14px',
              padding: 0,
              cursor: 'pointer',
            }}
          >×</button>
        </div>
      ))}
    </div>
  );
}