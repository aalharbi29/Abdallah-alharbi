import React from 'react';
import { A4_PAGE_STYLE, MHC_LOGO_URL, InlineInput } from './ChickenpoxFormStyles';

const ARABIC_NUMS = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠'];

const headerCellStyle = {
  border: '1px solid #000',
  padding: '8px 6px',
  textAlign: 'center',
  fontSize: '11pt',
  fontWeight: 700,
  background: '#fff',
};

const dataCellStyle = {
  border: '1px solid #000',
  padding: 0,
  height: '34px',
  background: '#fff',
};

const inputCellStyle = {
  width: '100%',
  height: '100%',
  border: 'none',
  outline: 'none',
  textAlign: 'center',
  fontSize: '10pt',
  fontFamily: 'inherit',
  background: 'transparent',
  padding: '4px',
};

export default function ChickenpoxContactsPage({ data, onChange, onUpdateRow }) {
  const upd = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="a4-page" style={{ ...A4_PAGE_STYLE, padding: '15mm 12mm' }}>
      {/* خلفية موجة زرقاء سفلية */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50mm',
        background: 'linear-gradient(180deg, transparent 0%, #E3F2FD 60%, #BBDEFB 100%)',
        clipPath: 'polygon(0 30%, 25% 50%, 50% 35%, 75% 55%, 100% 40%, 100% 100%, 0 100%)',
        opacity: 0.6,
        pointerEvents: 'none',
      }} />

      {/* رأس الصفحة - الشعار يمين العنوان */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
        <div style={{ flex: 1 }} />
        <h2 style={{ fontSize: '14pt', fontWeight: 700, margin: 0, textAlign: 'center', flex: 2 }}>
          استمارة مخالطين لحالة جديري مائي
        </h2>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <img
            src={MHC_LOGO_URL}
            alt="تجمع المدينة المنورة الصحي"
            style={{ height: '60px', width: 'auto' }}
            crossOrigin="anonymous"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>

      {/* جدول معلومات المريض */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20mm', position: 'relative', zIndex: 2 }}>
        <thead>
          <tr>
            <th style={headerCellStyle}>اسم المريض</th>
            <th style={headerCellStyle}>رقم التقصي</th>
            <th style={headerCellStyle}>اسم المركز</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={dataCellStyle}>
              <input value={data.patient_name || ''} onChange={(e) => upd('patient_name', e.target.value)} style={inputCellStyle} />
            </td>
            <td style={dataCellStyle}>
              <input value={data.investigation_number || ''} onChange={(e) => upd('investigation_number', e.target.value)} style={inputCellStyle} />
            </td>
            <td style={dataCellStyle}>
              <input value={data.center_name || ''} onChange={(e) => upd('center_name', e.target.value)} style={inputCellStyle} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* جدول المخالطين */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8mm', position: 'relative', zIndex: 2 }}>
        <thead>
          <tr>
            <th style={{ ...headerCellStyle, width: '6%' }}>ت</th>
            <th style={headerCellStyle}>اسم المخالط</th>
            <th style={{ ...headerCellStyle, width: '8%' }}>الجنس</th>
            <th style={{ ...headerCellStyle, width: '8%' }}>العمر</th>
            <th style={headerCellStyle}>رقم الهوية</th>
            <th style={headerCellStyle}>رقم الجوال</th>
            <th style={headerCellStyle}>صلة القرابة</th>
            <th style={headerCellStyle}>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, idx) => (
            <tr key={idx}>
              <td style={{ ...dataCellStyle, textAlign: 'center', fontSize: '10pt' }}>{ARABIC_NUMS[idx]}</td>
              <td style={dataCellStyle}>
                <input value={row.name} onChange={(e) => onUpdateRow(idx, 'name', e.target.value)} style={inputCellStyle} />
              </td>
              <td style={dataCellStyle}>
                <input value={row.gender} onChange={(e) => onUpdateRow(idx, 'gender', e.target.value)} style={inputCellStyle} />
              </td>
              <td style={dataCellStyle}>
                <input value={row.age} onChange={(e) => onUpdateRow(idx, 'age', e.target.value)} style={inputCellStyle} />
              </td>
              <td style={dataCellStyle}>
                <input value={row.national_id} onChange={(e) => onUpdateRow(idx, 'national_id', e.target.value)} style={inputCellStyle} />
              </td>
              <td style={dataCellStyle}>
                <input value={row.mobile} onChange={(e) => onUpdateRow(idx, 'mobile', e.target.value)} style={inputCellStyle} />
              </td>
              <td style={dataCellStyle}>
                <input value={row.relation} onChange={(e) => onUpdateRow(idx, 'relation', e.target.value)} style={inputCellStyle} />
              </td>
              <td style={dataCellStyle}>
                <input value={row.action} onChange={(e) => onUpdateRow(idx, 'action', e.target.value)} style={inputCellStyle} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* بيانات القائم بالعمل */}
      <div style={{ marginTop: '15mm', fontSize: '11pt', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: '8px' }}>
          اسم القائم بالعمل: <InlineInput value={data.investigator_name} onChange={(v) => upd('investigator_name', v)} width="40%" />
          {' '}رقم الجوال: <InlineInput value={data.investigator_mobile} onChange={(v) => upd('investigator_mobile', v)} width="30%" />
        </div>
        <div style={{ marginBottom: '8px' }}>
          التوقيع: <InlineInput value="" onChange={() => {}} width="40%" />
          {' '}التاريخ: <InlineInput value={data.signature_date} onChange={(v) => upd('signature_date', v)} width="20%" /> ٢٠م
        </div>
        <div style={{ textAlign: 'center', marginTop: '12mm' }}>ختم المركز</div>
      </div>

      {/* اسم التجمع في الأسفل */}
      <div style={{ position: 'absolute', bottom: '8mm', left: '12mm', textAlign: 'left', zIndex: 3 }}>
        <div style={{ fontSize: '14pt', fontWeight: 800, color: '#1976D2' }}>تجمع المدينة المنورة الصحي</div>
        <div style={{ fontSize: '10pt', fontWeight: 700, color: '#1976D2' }}>Madinah Health Cluster</div>
        <div style={{ fontSize: '7pt', color: '#1976D2' }}>Empowered by Health Holding co.</div>
      </div>
    </div>
  );
}