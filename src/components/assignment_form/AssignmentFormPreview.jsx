import React from 'react';

// تحويل الأرقام اللاتينية إلى عربية هندية
const toArabicDigits = (str) => {
  if (str === null || str === undefined || str === '') return '';
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[0-9]/g, (d) => map[+d]);
};

// الزخرفة الجانبية اليسرى (تطابق النموذج الأصلي)
const SideDecoration = () => {
  const lines = Array.from({ length: 38 }, (_, i) =>
    i % 2 === 0
      ? <div key={i} style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}><span>ج</span><span style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>ج</span></div>
      : <div key={i} style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '-2px' }}><span>∧</span><span>∧</span></div>
  );
  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, bottom: 0, width: '34px',
      fontFamily: "'Tajawal','Cairo',serif",
      fontSize: '13px', color: '#1a5276',
      lineHeight: '17px', paddingTop: '10px',
      userSelect: 'none', overflow: 'hidden',
    }}>
      {lines}
    </div>
  );
};

// رأس النموذج
const FormHeader = () => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '18px 46px 0 46px', gap: '12px' }}>
    {/* النص يسار الشعار */}
    <div style={{ textAlign: 'right', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0', lineHeight: 1.3 }}>
        <span style={{ fontSize: '17pt', fontWeight: 900, color: '#0F7884' }}>تجمع المدينة المنورة الصحي</span>
        <span style={{ borderRight: '2.5px solid #0F7884', margin: '0 10px', paddingRight: '10px', fontSize: '13pt', fontWeight: 800, color: '#0F7884' }}>
          إدارة رأس المال البشري
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0', marginTop: '3px' }}>
        <span style={{ fontSize: '10.5pt', fontWeight: 700, color: '#7DC242' }}>Human capital management</span>
        <span style={{ borderRight: '2.5px solid #7DC242', margin: '0 10px', paddingRight: '10px', fontSize: '10.5pt', fontWeight: 700, color: '#0F7884' }}>
          Madinah Health Cluster
        </span>
      </div>
    </div>
    {/* الشعار */}
    <img
      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2c0d9aff5_image.png"
      alt="شعار"
      style={{ width: '80px', height: 'auto', flexShrink: 0 }}
      crossOrigin="anonymous"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  </div>
);

// تذييل النموذج
const FormFooter = () => (
  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
    <div style={{ padding: '4px 46px 4px 46px', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '17pt', fontWeight: 900, color: '#0F7884', borderBottom: '2px solid #7DC242', paddingBottom: '1px' }}>صحتكم</span>
      <span style={{ fontSize: '13pt', color: '#0F7884', margin: '0 2px', fontWeight: 700 }}>...</span>
      <span style={{ fontSize: '17pt', fontWeight: 900, color: '#0F7884', borderBottom: '2px solid #7DC242', paddingBottom: '1px' }}>غايتنا</span>
    </div>
    <div style={{ background: '#0F7884', color: '#fff', padding: '9px 46px', display: 'flex', justifyContent: 'center', gap: '28px', fontSize: '9.5pt', fontWeight: 600 }}>
      <span>📘 Madinah.Cluster</span>
      <span>📷 Med_Cluster</span>
      <span>✉ Med-Cluster@moh.gov.sa</span>
    </div>
  </div>
);

// خط نقاط للأسباب
const DottedLine = ({ text }) => (
  <div style={{
    width: '100%',
    minHeight: '26px',
    paddingBottom: '3px',
    marginBottom: '8px',
    borderBottom: '1.2px dotted #333',
    fontSize: '10.5pt',
    lineHeight: 1.5,
    color: '#000',
  }}>
    {text || '\u00A0'}
  </div>
);

export default function AssignmentFormPreview({ printRef, scalerRef, previewScale, data }) {
  const {
    selectedEmployee, grade, assignmentEntity, assignmentValue, duration, assignmentDate,
    reasons, supervisorSignatureUrl,
    certifyingAdministration, employeeNameInCertificate,
    fromDay, fromMonth, fromYear, toDay, toMonth, toYear,
    certifierName, certifierSignatureUrl, stampUrl,
  } = data;

  const reasonLines = (reasons || '').split('\n');

  const thStyle = {
    border: '1.2px solid #000',
    padding: '5px 3px',
    fontSize: '9.5pt',
    fontWeight: 700,
    textAlign: 'center',
    background: '#fff',
    color: '#000',
  };
  const tdStyle = {
    border: '1.2px solid #000',
    padding: '8px 3px',
    fontSize: '9.5pt',
    fontWeight: 600,
    textAlign: 'center',
    background: '#fff',
    color: '#000',
    height: '36px',
  };

  return (
    <div className="print-area" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="preview-scaler" ref={scalerRef} style={{ width: '100%', aspectRatio: '210 / 297', position: 'relative', overflow: 'hidden' }}>
        <div
          ref={printRef}
          className="preview-page"
          style={{
            fontFamily: "'Tajawal','Cairo','Arial',sans-serif",
            direction: 'rtl',
            width: '210mm',
            height: '297mm',
            position: 'absolute',
            top: 0,
            right: 0,
            transform: `scale(${previewScale})`,
            transformOrigin: 'top right',
            background: '#fff',
            overflow: 'hidden',
            color: '#000',
            boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
          }}
        >
          {/* الزخرفة الجانبية */}
          <SideDecoration />

          {/* رأس النموذج */}
          <FormHeader />

          {/* العنوان */}
          <div style={{
            textAlign: 'center',
            marginTop: '22px',
            fontSize: '14pt',
            fontWeight: 900,
            color: '#000',
            letterSpacing: '0.5px',
          }}>
            نموذج تكليف مهمه رسمية
          </div>

          {/* الجدول الرئيسي */}
          <div style={{ padding: '0 46px', marginTop: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '13%' }} />
                <col style={{ width: '21%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '18%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={thStyle}>رقم الموظف</th>
                  <th style={thStyle}>الاسـم</th>
                  <th style={thStyle}>م/ت الدرجة</th>
                  <th style={thStyle}>جهة الانتداب</th>
                  <th style={thStyle}>قيمة الانتداب</th>
                  <th style={thStyle}>مدة الانتداب</th>
                  <th style={thStyle}>تاريخ الانتداب</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>{toArabicDigits(selectedEmployee?.['رقم_الموظف']) || ''}</td>
                  <td style={{ ...tdStyle, fontSize: '9pt' }}>{selectedEmployee?.full_name_arabic || ''}</td>
                  <td style={tdStyle}>{toArabicDigits(grade)}</td>
                  <td style={{ ...tdStyle, fontSize: '8.5pt' }}>{assignmentEntity}</td>
                  <td style={tdStyle}>{toArabicDigits(assignmentValue)}</td>
                  <td style={tdStyle}>{toArabicDigits(duration)}</td>
                  <td style={tdStyle}>{toArabicDigits(assignmentDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* شرح أسباب التكليف */}
          <div style={{ padding: '0 46px', marginTop: '20px' }}>
            <div style={{ fontSize: '10.5pt', fontWeight: 700, marginBottom: '10px' }}>شرح أسباب التكليف :</div>
            <DottedLine text={reasonLines[0]} />
            <DottedLine text={reasonLines[1]} />
            <DottedLine text={reasonLines[2]} />
          </div>

          {/* فقرة الإقرار */}
          <div style={{ padding: '0 46px', marginTop: '18px', fontSize: '10.5pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '10.5pt', fontWeight: 600 }}>)  وعلي</span>
              <span style={{ fontSize: '10.5pt' }}>
                علماً بان الانتدابات المذكور لم تتجاوز ( {toArabicDigits('60')} ) ستون يوما في السنة المالية الحالية (
              </span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '10.5pt' }}>
              مسئوليتنا.
            </div>
          </div>

          {/* توقيع الرئيس المباشر */}
          <div style={{ padding: '0 46px', marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '11pt', fontWeight: 700 }}>
            {/* الرئيس المباشر - اليمين */}
            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              <div style={{ marginBottom: '8px' }}>التوقيع :</div>
              <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {supervisorSignatureUrl && (
                  <img src={supervisorSignatureUrl} alt="توقيع" style={{ maxHeight: '52px', maxWidth: '150px' }} crossOrigin="anonymous" />
                )}
              </div>
            </div>
            {/* التوقيع - اليسار */}
            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              <div>الرئيس المباشر</div>
            </div>
          </div>

          {/* صندوق شهادة جهة التكليف */}
          <div style={{ padding: '0 46px', marginTop: '36px' }}>
            <div style={{ border: '1.5px solid #000' }}>
              {/* عنوان الصندوق */}
              <div style={{
                borderBottom: '1.5px solid #000',
                textAlign: 'center',
                padding: '7px',
                fontSize: '12pt',
                fontWeight: 900,
                background: '#fff',
              }}>
                شهادة جهة التكليف
              </div>

              {/* محتوى الشهادة */}
              <div style={{ padding: '12px 16px', fontSize: '10.5pt', lineHeight: 2 }}>
                {/* السطر الأول */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '5px' }}>
                  <span style={{ fontWeight: 700 }}>تشهد ادارة</span>
                  <span style={{
                    borderBottom: '1px solid #555',
                    minWidth: '130px',
                    display: 'inline-block',
                    textAlign: 'center',
                    fontWeight: 700,
                    paddingBottom: '1px',
                  }}>
                    {certifyingAdministration}
                  </span>
                  <span>بأن الموضح أسمة بعالية قد انجز المهمة المكلف بها</span>
                </div>

                {/* السطر الثاني - التواريخ */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                  <span style={{ fontWeight: 700 }}>من تاريخ</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '28px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(fromDay)}</span>
                  <span>/</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '28px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(fromMonth)}</span>
                  <span>/</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '36px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(fromYear)}</span>
                  <span>هـ</span>
                  <span style={{ marginRight: '16px', fontWeight: 700 }}>وغادر بتاريخ</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '28px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(toDay)}</span>
                  <span>/</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '28px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(toMonth)}</span>
                  <span>/</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '36px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(toYear)}</span>
                  <span>هـ</span>
                </div>

                {/* الاسم - التوقيع - الختم */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>الاسـم :</div>
                    <div style={{ borderBottom: '1px solid #000', minHeight: '28px', marginTop: '4px', textAlign: 'center', fontWeight: 700, paddingBottom: '2px' }}>
                      {certifierName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>التوقيع</div>
                    <div style={{ borderBottom: '1px solid #000', minHeight: '44px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {certifierSignatureUrl && (
                        <img src={certifierSignatureUrl} alt="توقيع" style={{ maxHeight: '40px', maxWidth: '120px' }} crossOrigin="anonymous" />
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>الختم</div>
                    <div style={{ borderBottom: '1px solid #000', minHeight: '44px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {stampUrl && (
                        <img src={stampUrl} alt="ختم" style={{ maxHeight: '40px', maxWidth: '80px' }} crossOrigin="anonymous" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* التذييل */}
          <FormFooter />
        </div>
      </div>
    </div>
  );
}