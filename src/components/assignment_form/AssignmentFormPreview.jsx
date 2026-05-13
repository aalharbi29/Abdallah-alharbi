import React from 'react';

// تحويل الأرقام اللاتينية إلى عربية هندية
const toArabicDigits = (str) => {
  if (str === null || str === undefined || str === '') return '';
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[0-9]/g, (d) => map[+d]);
};

// شارة الزخرفة الجانبية (نقش يميني)
const SideDecoration = () => {
  // نمط متكرر يحاكي الزخرفة العربية في النموذج الأصلي
  const pattern = 'ج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج\nچ چ\nج ج';
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '38px',
        fontFamily: "'Tajawal', 'Cairo', serif",
        fontSize: '14px',
        color: '#0A3D5A',
        lineHeight: '20px',
        whiteSpace: 'pre',
        textAlign: 'center',
        paddingTop: '8px',
        userSelect: 'none',
        letterSpacing: '1px',
      }}
    >
      {pattern}
    </div>
  );
};

// رأس النموذج: الشعار + اسم التجمع
const FormHeader = () => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '20px 50px 0 50px', gap: '14px' }}>
    <div style={{ textAlign: 'right', marginTop: '20px' }}>
      <div style={{ fontSize: '18pt', fontWeight: 900, color: '#0F7884', lineHeight: 1.2 }}>
        تجمع المدينة المنورة الصحي
        <span style={{ borderRight: '2px solid #0F7884', margin: '0 10px', paddingRight: '10px', fontSize: '14pt', fontWeight: 700 }}>
          إدارة رأس المال البشري
        </span>
      </div>
      <div style={{ fontSize: '11pt', fontWeight: 700, color: '#7DC242', lineHeight: 1.2, marginTop: '4px' }}>
        Human capital management
        <span style={{ borderRight: '2px solid #7DC242', margin: '0 10px', paddingRight: '10px', color: '#0F7884' }}>
          Madinah Health Cluster
        </span>
      </div>
    </div>
    <img
      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2c0d9aff5_image.png"
      alt="شعار"
      style={{ width: '85px', height: 'auto' }}
      crossOrigin="anonymous"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  </div>
);

// تذييل النموذج
const FormFooter = () => (
  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
    <div style={{ padding: '0 50px 6px 50px', textAlign: 'right' }}>
      <span style={{ fontSize: '16pt', fontWeight: 800, color: '#0F7884', borderBottom: '2px solid #7DC242', paddingBottom: '2px' }}>
        صحتكم
      </span>
      <span style={{ fontSize: '12pt', color: '#0F7884', margin: '0 6px' }}>...</span>
      <span style={{ fontSize: '16pt', fontWeight: 800, color: '#0F7884', borderBottom: '2px solid #7DC242', paddingBottom: '2px' }}>
        غايتنا
      </span>
    </div>
    <div style={{ background: '#0F7884', color: '#fff', padding: '10px 50px', display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '10pt', fontWeight: 600 }}>
      <span>📘 Madinah.Cluster</span>
      <span>📷 Med_Cluster</span>
      <span>✉ Med-Cluster@moh.gov.sa</span>
    </div>
  </div>
);

export default function AssignmentFormPreview({
  printRef,
  scalerRef,
  previewScale,
  data,
}) {
  const {
    selectedEmployee,
    grade,
    assignmentEntity,
    assignmentValue,
    duration,
    assignmentDate,
    reasons,
    supervisorSignatureUrl,
    certifyingAdministration,
    employeeNameInCertificate,
    fromDay, fromMonth, fromYear,
    toDay, toMonth, toYear,
    certifierName,
    certifierSignatureUrl,
    stampUrl,
  } = data;

  // أنماط الجدول
  const thStyle = {
    border: '1.2px solid #000',
    padding: '6px 4px',
    fontSize: '10pt',
    fontWeight: 700,
    textAlign: 'center',
    background: '#fff',
    color: '#000',
  };
  const tdStyle = {
    border: '1.2px solid #000',
    padding: '10px 4px',
    fontSize: '10pt',
    fontWeight: 600,
    textAlign: 'center',
    background: '#fff',
    color: '#000',
    height: '38px',
  };

  return (
    <div className="print-area" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="preview-scaler" ref={scalerRef} style={{ width: '100%', aspectRatio: '210 / 297', position: 'relative', overflow: 'hidden' }}>
        <div
          ref={printRef}
          className="bg-white shadow-sm preview-page"
          style={{
            fontFamily: "'Tajawal', 'Cairo', 'Arial', sans-serif",
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
          }}
        >
          {/* الزخرفة الجانبية */}
          <SideDecoration />

          {/* رأس النموذج */}
          <FormHeader />

          {/* العنوان */}
          <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '14pt', fontWeight: 900, color: '#000' }}>
            نموذج تكليف مهمه رسمية
          </div>

          {/* الجدول الرئيسي */}
          <div style={{ padding: '0 50px', marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '13%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '17%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '19%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={thStyle}>رقم الموظف</th>
                  <th style={thStyle}>الاســـــــم</th>
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
                  <td style={tdStyle}>{selectedEmployee?.full_name_arabic || ''}</td>
                  <td style={tdStyle}>{toArabicDigits(grade)}</td>
                  <td style={tdStyle}>{assignmentEntity}</td>
                  <td style={tdStyle}>{toArabicDigits(assignmentValue)}</td>
                  <td style={tdStyle}>{toArabicDigits(duration)}</td>
                  <td style={tdStyle}>{toArabicDigits(assignmentDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* شرح أسباب التكليف */}
          <div style={{ padding: '0 50px', marginTop: '24px' }}>
            <div style={{ fontSize: '11pt', fontWeight: 700, marginBottom: '8px' }}>شرح أسباب التكليف :</div>
            <div style={{ fontSize: '10.5pt', lineHeight: 1.9, minHeight: '90px' }}>
              {(reasons || '').split('\n').slice(0, 4).map((line, i) => (
                <div key={i} style={{ borderBottom: '1px dotted #555', paddingBottom: '4px', marginBottom: '6px', minHeight: '22px' }}>
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* فقرة الإقرار */}
          <div style={{ padding: '0 50px', marginTop: '18px', fontSize: '10.5pt', lineHeight: 1.9, textAlign: 'justify' }}>
            علماً بأن الانتدابات المذكورة لم تتجاوز ( {toArabicDigits('60')} ) ستون يوماً في السنة المالية الحالية ( ) وعلى مسئوليتنا.
          </div>

          {/* توقيع الرئيس المباشر */}
          <div style={{ padding: '0 50px', marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '11pt', fontWeight: 700 }}>
            <div style={{ textAlign: 'center', minWidth: '200px' }}>
              <div>التوقيع :</div>
              <div style={{ marginTop: '8px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {supervisorSignatureUrl && (
                  <img src={supervisorSignatureUrl} alt="توقيع" style={{ maxHeight: '60px', maxWidth: '160px' }} crossOrigin="anonymous" />
                )}
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '200px' }}>
              <div>الرئيس المباشر</div>
            </div>
          </div>

          {/* صندوق شهادة جهة التكليف */}
          <div style={{ padding: '0 50px', marginTop: '40px' }}>
            <div style={{ border: '1.2px solid #000', padding: '0' }}>
              {/* عنوان الصندوق */}
              <div style={{ borderBottom: '1.2px solid #000', textAlign: 'center', padding: '8px', fontSize: '12pt', fontWeight: 800, background: '#fff' }}>
                شهادة جهة التكليف
              </div>
              {/* محتوى الصندوق */}
              <div style={{ padding: '14px 16px', fontSize: '10.5pt', lineHeight: 2 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px' }}>
                  <span>تشهد ادارة</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '140px', display: 'inline-block', textAlign: 'center', fontWeight: 700 }}>
                    {certifyingAdministration}
                  </span>
                  <span>بأن الموضح أسمة بعالية قد انجز المهمة المكلف بها</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
                  <span>من تاريخ</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '30px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(fromDay)}</span>
                  <span>/</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '30px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(fromMonth)}</span>
                  <span>/</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '40px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(fromYear)}</span>
                  <span>هـ</span>
                  <span style={{ marginRight: '20px' }}>وغادر بتاريخ</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '30px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(toDay)}</span>
                  <span>/</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '30px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(toMonth)}</span>
                  <span>/</span>
                  <span style={{ borderBottom: '1px solid #555', minWidth: '40px', textAlign: 'center', fontWeight: 700 }}>{toArabicDigits(toYear)}</span>
                  <span>هـ</span>
                </div>

                {/* الاسم + التوقيع + الختم */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '20px', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>الاســــــم :</div>
                    <div style={{ borderBottom: '1px solid #000', minHeight: '28px', marginTop: '4px', textAlign: 'center', fontWeight: 700, paddingBottom: '2px' }}>
                      {certifierName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>التوقيع</div>
                    <div style={{ borderBottom: '1px solid #000', minHeight: '50px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {certifierSignatureUrl && (
                        <img src={certifierSignatureUrl} alt="توقيع" style={{ maxHeight: '46px', maxWidth: '130px' }} crossOrigin="anonymous" />
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>الختم</div>
                    <div style={{ borderBottom: '1px solid #000', minHeight: '50px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {stampUrl && (
                        <img src={stampUrl} alt="ختم" style={{ maxHeight: '46px', maxWidth: '90px' }} crossOrigin="anonymous" />
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