import React from 'react';

// أنماط مشتركة لاستمارة الجديري المائي - مطابقة للنموذج الرسمي
export const A4_PAGE_STYLE = {
  width: '210mm',
  minHeight: '297mm',
  background: '#fff',
  padding: '12mm 10mm',
  fontFamily: "'Tajawal', 'Cairo', 'Arial', sans-serif",
  direction: 'rtl',
  color: '#000',
  position: 'relative',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

export const SECTION_HEADER_STYLE = {
  background: '#D9D9D9',
  border: '1px solid #000',
  padding: '4px 8px',
  textAlign: 'center',
  fontSize: '11pt',
  fontWeight: 700,
  marginTop: '4px',
};

export const FIELD_BOX_STYLE = {
  border: '1px solid #000',
  padding: '8px 6px',
  fontSize: '9pt',
  position: 'relative',
};

// خانة رقم/تاريخ - عبارة عن مربعات صغيرة
export const DateBoxes = ({ d, m, y, onDChange, onMChange, onYChange, dLen = 2, mLen = 2, yLen = 4 }) => {
  const inputStyle = {
    width: '14px',
    height: '18px',
    border: '1px solid #000',
    textAlign: 'center',
    fontSize: '9pt',
    padding: 0,
    background: 'transparent',
    fontFamily: 'inherit',
  };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', direction: 'ltr' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input
          maxLength={yLen}
          value={y || ''}
          onChange={(e) => onYChange?.(e.target.value)}
          style={{ ...inputStyle, width: `${yLen * 12}px` }}
        />
        <span style={{ fontSize: '7pt' }}>سنة</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input
          maxLength={mLen}
          value={m || ''}
          onChange={(e) => onMChange?.(e.target.value)}
          style={{ ...inputStyle, width: `${mLen * 12}px` }}
        />
        <span style={{ fontSize: '7pt' }}>شهر</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input
          maxLength={dLen}
          value={d || ''}
          onChange={(e) => onDChange?.(e.target.value)}
          style={{ ...inputStyle, width: `${dLen * 12}px` }}
        />
        <span style={{ fontSize: '7pt' }}>يوم</span>
      </div>
    </div>
  );
};

export const SmallBox = ({ value, onChange, width = 30 }) => (
  <input
    value={value || ''}
    onChange={(e) => onChange?.(e.target.value)}
    style={{
      width: `${width}px`,
      height: '18px',
      border: '1px solid #000',
      textAlign: 'center',
      fontSize: '9pt',
      padding: 0,
      background: 'transparent',
      fontFamily: 'inherit',
    }}
  />
);

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

export const MOH_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Ministry_of_Health_logo_%28Saudi_Arabia%29.svg/1200px-Ministry_of_Health_logo_%28Saudi_Arabia%29.svg.png';
export const MHC_LOGO_URL = 'https://media.base44.com/images/public/68af5003813e47bd07947b30/3d8c2d7f8_logoMHC.png';

export const PageHeader = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
    <img
      src={MOH_LOGO_URL}
      alt="وزارة الصحة"
      style={{ height: '60px', width: 'auto' }}
      crossOrigin="anonymous"
      onError={(e) => { e.target.style.display = 'none'; }}
    />
    <h2 style={{ fontSize: '14pt', fontWeight: 700, margin: 0, flex: 1, textAlign: 'center' }}>
      {title}
    </h2>
    <div style={{ width: '60px' }} />
  </div>
);