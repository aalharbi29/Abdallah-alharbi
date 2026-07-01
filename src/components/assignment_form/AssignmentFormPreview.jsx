import React from 'react';

// تحويل الأرقام اللاتينية إلى عربية هندية
const toArabicDigits = (str) => {
  if (str === null || str === undefined || str === '') return '';
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[0-9]/g, (d) => map[+d]);
};

// خلفية الترويسة الرسمية
const LETTERHEAD_BG_URL = 'https://media.base44.com/images/public/68af5003813e47bd07947b30/b76c02f7a_extracted_letterhead_background.png';

// خط نقاط للأسباب - مطابق للنموذج
const DottedLine = ({ text }) => (
  <div style={{
    width: '100%',
    minHeight: '22px',
    paddingBottom: '2px',
    marginBottom: '10px',
    borderBottom: '1px dotted #555',
    fontSize: '10pt',
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#000',
    textAlign: 'center',
  }}>
    {text || '\u00A0'}
  </div>
);

// خط تحت للحقول داخل الشهادة
const FieldLine = ({ text, minWidth = '80px', flex }) => (
  <span style={{
    borderBottom: '1px solid #444',
    minWidth,
    display: 'inline-block',
    textAlign: 'center',
    paddingBottom: '1px',
    flex: flex || undefined,
  }}>
    {text || '\u00A0'}
  </span>
);

export default function AssignmentFormPreview({ printRef, scalerRef, previewScale, data }) {
  const {
    selectedEmployee, grade, assignmentEntity, assignmentValue, duration, assignmentDate,
    reasons, supervisorSignatureUrl,
    certifyingAdministration,
    fromDay, fromMonth, fromYear, toDay, toMonth, toYear,
    certifierName, certifierSignatureUrl, stampUrl,
  } = data;

  const reasonLines = (reasons || '').split('\n');

  // أنماط الجدول
  const thStyle = {
    border: '1px solid #000',
    padding: '4px 2px',
    fontSize: '9pt',
    fontWeight: 800,
    textAlign: 'center',
    background: '#fff',
    color: '#000',
    lineHeight: 1.3,
  };
  const tdStyle = {
    border: '1px solid #000',
    padding: '6px 2px',
    fontSize: '9pt',
    fontWeight: 700,
    textAlign: 'center',
    background: '#fff',
    color: '#000',
    height: '32px',
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
            backgroundImage: `url('${LETTERHEAD_BG_URL}')`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top center',
            overflow: 'hidden',
            color: '#000',
            boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
          }}
        >
          {/* المحتوى - يبدأ بعد منطقة الترويسة في الخلفية، مع تفادي الزخرفة الجانبية على اليسار */}
          <div style={{ paddingTop: '48mm', paddingRight: '12mm', paddingLeft: '34mm', fontWeight: 700 }}>

            {/* العنوان الرئيسي */}
            <div style={{
              textAlign: 'center',
              fontSize: '13pt',
              fontWeight: 900,
              color: '#000',
              marginBottom: '5mm',
              letterSpacing: '0.3px',
            }}>
              نموذج تكليف مهمه رسمية
            </div>

            {/* الجدول الرئيسي */}
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginBottom: '5mm' }}>
              <colgroup>
                <col style={{ width: '12%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '19%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '15%' }} />
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
                  <td style={{ ...tdStyle, fontSize: '8.5pt' }}>{selectedEmployee?.full_name_arabic || ''}</td>
                  <td style={tdStyle}>{toArabicDigits(grade)}</td>
                  <td style={{ ...tdStyle, fontSize: '8pt' }}>{assignmentEntity}</td>
                  <td style={tdStyle}>{toArabicDigits(assignmentValue)}</td>
                  <td style={tdStyle}>{toArabicDigits(duration)}</td>
                  <td style={tdStyle}>{toArabicDigits(assignmentDate)}</td>
                </tr>
              </tbody>
            </table>

            {/* شرح أسباب التكليف */}
            <div style={{ marginBottom: '3mm' }}>
              <div style={{ fontSize: '10pt', fontWeight: 700, marginBottom: '3mm', textAlign: 'right' }}>
                شرح أسباب التكليف :
              </div>
              <DottedLine text={reasonLines[0]} />
              <DottedLine text={reasonLines[1]} />
              <DottedLine text={reasonLines[2]} />
            </div>

            {/* فقرة الإقرار */}
            <div style={{ fontSize: '10pt', marginBottom: '6mm', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span>( وعلى</span>
                <span>
                  علماً بان الانتدابات المذكور لم تتجاوز ( {toArabicDigits('60')} ) ستون يوما في السنة المالية الحالية (
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                مسئوليتنا.
              </div>
            </div>

            {/* الرئيس المباشر والتوقيع - مطابق للنموذج: الرئيس يمين، التوقيع يسار */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              fontSize: '10.5pt',
              fontWeight: 700,
              marginBottom: '8mm',
            }}>
              {/* الرئيس المباشر - جهة اليمين في RTL (أول عنصر) */}
              <div style={{ textAlign: 'right' }}>
                <div>الرئيس المباشر</div>
              </div>
              {/* التوقيع - جهة اليسار في RTL (آخر عنصر) */}
              <div style={{ textAlign: 'center', minWidth: '120px' }}>
                <div style={{ marginBottom: '3mm' }}>التوقيع :</div>
                <div style={{ height: '14mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {supervisorSignatureUrl && (
                    <img src={supervisorSignatureUrl} alt="توقيع" style={{ maxHeight: '14mm', maxWidth: '40mm' }} crossOrigin="anonymous" />
                  )}
                </div>
              </div>
            </div>

            {/* صندوق شهادة جهة التكليف */}
            <div style={{ border: '1.2px solid #000' }}>
              {/* عنوان الصندوق */}
              <div style={{
                borderBottom: '1.2px solid #000',
                textAlign: 'center',
                padding: '4px 8px',
                fontSize: '11pt',
                fontWeight: 900,
                background: '#fff',
              }}>
                شهادة جهة التكليف
              </div>

              {/* محتوى الشهادة */}
              <div style={{ padding: '4mm 5mm', fontSize: '10pt', lineHeight: 1.9 }}>

                {/* السطر الأول: تشهد ادارة ___ بأن... */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'nowrap' }}>
                  <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>تشهد ادارة</span>
                  <FieldLine text={certifyingAdministration} minWidth="100px" />
                  <span style={{ whiteSpace: 'nowrap' }}>بأن الموضح أسمة بعالية قد انجز المهمة المكلف بها</span>
                </div>

                {/* السطر الثاني: من تاريخ / / ١٤هـ وغادر بتاريخ / / ١٤هـ */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', flexWrap: 'nowrap' }}>
                  <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>من تاريخ</span>
                  <FieldLine text={toArabicDigits(fromDay)} minWidth="20px" />
                  <span>/</span>
                  <FieldLine text={toArabicDigits(fromMonth)} minWidth="20px" />
                  <span>/</span>
                  <span style={{ fontWeight: 700 }}>{toArabicDigits('14')}</span>
                  <FieldLine text={toArabicDigits(fromYear)} minWidth="20px" />
                  <span style={{ whiteSpace: 'nowrap' }}>هـ</span>
                  <span style={{ marginRight: '8px', fontWeight: 700, whiteSpace: 'nowrap' }}>وغادر بتاريخ</span>
                  <span>/</span>
                  <FieldLine text={toArabicDigits(toDay)} minWidth="20px" />
                  <span>/</span>
                  <FieldLine text={toArabicDigits(toMonth)} minWidth="20px" />
                  <span>/</span>
                  <span style={{ fontWeight: 700 }}>{toArabicDigits('14')}</span>
                  <FieldLine text={toArabicDigits(toYear)} minWidth="20px" />
                  <span style={{ whiteSpace: 'nowrap' }}>هـ</span>
                </div>

                {/* الاسم - التوقيع - الختم */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '4mm', alignItems: 'flex-end' }}>
                  {/* الاسم - يمين */}
                  <div>
                    <span style={{ fontWeight: 700 }}>الاسـم : </span>
                    <span style={{
                      borderBottom: '1px solid #000',
                      display: 'inline-block',
                      minWidth: '60px',
                      textAlign: 'center',
                      paddingBottom: '1px',
                    }}>
                      {certifierName}
                    </span>
                  </div>
                  {/* التوقيع - وسط */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, marginBottom: '2mm' }}>التوقيع</div>
                    <div style={{ borderBottom: '1px solid #000', minHeight: '12mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {certifierSignatureUrl && (
                        <img src={certifierSignatureUrl} alt="توقيع" style={{ maxHeight: '12mm', maxWidth: '30mm' }} crossOrigin="anonymous" />
                      )}
                    </div>
                  </div>
                  {/* الختم - يسار */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, marginBottom: '2mm' }}>الختم</div>
                    <div style={{ borderBottom: '1px solid #000', minHeight: '12mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {stampUrl && (
                        <img src={stampUrl} alt="ختم" style={{ maxHeight: '12mm', maxWidth: '24mm' }} crossOrigin="anonymous" />
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}