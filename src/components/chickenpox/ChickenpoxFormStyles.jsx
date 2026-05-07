import React from 'react';

// أنماط مشتركة لاستمارة الجديري المائي - مطابقة للنموذج الرسمي
export const A4_PAGE_STYLE = {
  width: '210mm',
  minHeight: '297mm',
  background: '#fff',
  padding: '10mm 8mm',
  fontFamily: "'Tajawal', 'Cairo', 'Arial', sans-serif",
  direction: 'rtl',
  color: '#000',
  position: 'relative',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  fontSize: '8.5pt',
};

// رأس الجدول الرمادي مع تموّج (بسيط بحدود)
export const SECTION_HEADER_STYLE = {
  background: 'repeating-linear-gradient(45deg, #D9D9D9, #D9D9D9 4px, #C9C9C9 4px, #C9C9C9 8px)',
  border: '1px solid #000',
  padding: '4px 8px',
  textAlign: 'center',
  fontSize: '10pt',
  fontWeight: 700,
};

// مربع تاريخ صغير - مربعات منفصلة لكل خانة (يوم/شهر/سنة)
export const DateBoxes = ({ d, m, y, onDChange, onMChange, onYChange, dCount = 2, mCount = 2, yCount = 4 }) => {
  const cellStyle = {
    width: '14px',
    height: '16px',
    border: '1px solid #000',
    textAlign: 'center',
    fontSize: '9pt',
    padding: 0,
    background: 'transparent',
    fontFamily: 'inherit',
    outline: 'none',
  };

  const renderCells = (count, value, onChange) => {
    const chars = (value || '').split('');
    return (
      <div style={{ display: 'flex' }}>
        {Array.from({ length: count }).map((_, i) => (
          <input
            key={i}
            value={chars[i] || ''}
            onChange={(e) => {
              const newChars = [...chars];
              newChars[i] = e.target.value.slice(-1);
              onChange?.(newChars.join('').slice(0, count));
            }}
            style={cellStyle}
            maxLength={1}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '6px', direction: 'ltr' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {renderCells(yCount, y, onYChange)}
        <span style={{ fontSize: '7pt' }}>سنة</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {renderCells(mCount, m, onMChange)}
        <span style={{ fontSize: '7pt' }}>شهر</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {renderCells(dCount, d, onDChange)}
        <span style={{ fontSize: '7pt' }}>يوم</span>
      </div>
    </div>
  );
};

// مربع رقم/خانة واحدة
export const SmallBox = ({ value, onChange, width = 26, height = 16 }) => (
  <input
    value={value || ''}
    onChange={(e) => onChange?.(e.target.value)}
    style={{
      width: `${width}px`,
      height: `${height}px`,
      border: '1px solid #000',
      textAlign: 'center',
      fontSize: '9pt',
      padding: 0,
      background: 'transparent',
      fontFamily: 'inherit',
      outline: 'none',
    }}
  />
);

// مربعات متعددة بجانب بعض (للهوية مثلا)
export const BoxesRow = ({ value = '', onChange, count = 10, width = 14 }) => {
  const chars = value.split('');
  return (
    <div style={{ display: 'inline-flex', direction: 'ltr' }}>
      {Array.from({ length: count }).map((_, i) => (
        <input
          key={i}
          value={chars[i] || ''}
          onChange={(e) => {
            const newChars = [...chars];
            newChars[i] = e.target.value.slice(-1);
            onChange?.(newChars.join('').slice(0, count));
          }}
          maxLength={1}
          style={{
            width: `${width}px`,
            height: '16px',
            border: '1px solid #000',
            textAlign: 'center',
            fontSize: '9pt',
            padding: 0,
            background: 'transparent',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
      ))}
    </div>
  );
};

export const InlineInput = ({ value, onChange, width = '100%', placeholder = '' }) => (
  <input
    value={value || ''}
    onChange={(e) => onChange?.(e.target.value)}
    placeholder={placeholder}
    style={{
      width,
      border: 'none',
      borderBottom: '1px dotted #555',
      fontSize: '9pt',
      padding: '1px 2px',
      background: 'transparent',
      fontFamily: 'inherit',
      outline: 'none',
    }}
  />
);

// شعار وزارة الصحة
export const MOH_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Ministry_of_Health_logo_%28Saudi_Arabia%29.svg/1200px-Ministry_of_Health_logo_%28Saudi_Arabia%29.svg.png';
export const MHC_LOGO_URL = 'https://media.base44.com/images/public/68af5003813e47bd07947b30/3d8c2d7f8_logoMHC.png';

export const PageHeader = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', padding: '0 4mm' }}>
    <img
      src={MOH_LOGO_URL}
      alt="وزارة الصحة"
      style={{ height: '55px', width: 'auto' }}
      crossOrigin="anonymous"
      onError={(e) => { e.target.style.display = 'none'; }}
    />
    <h2 style={{ fontSize: '13pt', fontWeight: 700, margin: 0, flex: 1, textAlign: 'center' }}>
      {title}
    </h2>
    <div style={{ width: '55px' }} />
  </div>
);

// خلية بحدود مزدوجة - للحقول المعنونة داخل الجدول
export const FieldCell = ({ label, children, width, align = 'right', style = {} }) => (
  <div style={{
    border: '1px solid #000',
    padding: '3px 5px',
    fontSize: '8.5pt',
    width,
    textAlign: align,
    position: 'relative',
    ...style,
  }}>
    {label && <div style={{ marginBottom: '2px', fontWeight: 600 }}>{label}</div>}
    {children}
  </div>
);