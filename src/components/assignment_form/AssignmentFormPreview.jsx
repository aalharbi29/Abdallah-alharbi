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

  const SUPERVISOR_NAME = 'عبدالمجيد سعود الربيقي';
  const SUPERVISOR_SIG_URL = 'https://media.base44.com/files/public/68af5003813e47bd07947b30/supervisor_signature.png';

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
              letterSpacing: '0px',
              fontFamily: "'Tajawal','Cairo','Arial',sans-serif",
              wordSpacing: '1px',
            }}>
              نموذج تكليف مهمة رسمية
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

            {/* الرئيس المباشر والتوقيع - مطابق للنموذج */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              fontSize: '10.5pt',
              fontWeight: 700,
              marginBottom: '8mm',
            }}>
              {/* الرئيس المباشر - يمين */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: '2mm' }}>الرئيس المباشر</div>
                <div style={{ fontSize: '10pt', fontWeight: 800, color: '#000' }}>{SUPERVISOR_NAME}</div>
              </div>
              {/* التوقيع - يسار */}
              <div style={{ textAlign: 'center', minWidth: '120px' }}>
                <div style={{ marginBottom: '2mm' }}>التوقيع :</div>
                <div style={{ height: '16mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {supervisorSignatureUrl ? (
                    <img src={supervisorSignatureUrl} alt="توقيع" style={{ maxHeight: '16mm', maxWidth: '45mm' }} crossOrigin="anonymous" />
                  ) : null}
                </div>
              </div>
            </div>

            {/* صندوق شهادة جهة التكليف - مطابق للنموذج */}
            <div style={{ border: '1.5px solid #000' }}>
              {/* عنوان الصندوق */}
              <div style={{
                borderBottom: '1.5px solid #000',
                textAlign: 'center',
                padding: '5px 8px',
                fontSize: '11pt',
                fontWeight: 900,
                background: '#fff',
                letterSpacing: '0.5px',
              }}>
                شهادة جهة التكليف
              </div>

              {/* محتوى الشهادة */}
              <div style={{ padding: '4mm 6mm 3mm 6mm', fontSize: '10pt', lineHeight: 2 }}>

                {/* السطر الأول: تشهد ادارة ___ بأن الموضح أسمة بعالية قد انجز المهمة المكلف بها */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'nowrap', marginBottom: '1mm' }}>
                  <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>تشهد ادارة</span>
                  <span style={{
                    borderBottom: '1px solid #000',
                    minWidth: '90px',
                    display: 'inline-block',
                    textAlign: 'center',
                    paddingBottom: '1px',
                    fontWeight: 700,
                  }}>{certifyingAdministration || '\u00A0'}</span>
                  <span style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>بأن الموضح أسمة بعالية قد انجز المهمة المكلف بها</span>
                </div>

                {/* السطر الثاني: من تاريخ / / 14هـ وغادر بتاريخ / / 14هـ */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', flexWrap: 'nowrap', fontWeight: 700, marginBottom: '2mm' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>من تاريخ</span>
                  <span style={{ borderBottom: '1px solid #000', minWidth: '22px', display: 'inline-block', textAlign: 'center' }}>{toArabicDigits(fromDay) || '\u00A0'}</span>
                  <span>/</span>
                  <span style={{ borderBottom: '1px solid #000', minWidth: '22px', display: 'inline-block', textAlign: 'center' }}>{toArabicDigits(fromMonth) || '\u00A0'}</span>
                  <span>/</span>
                  <span style={{ whiteSpace: 'nowrap' }}>١٤{toArabicDigits(fromYear) || '\u00A0\u00A0'}هـ</span>
                  <span style={{ marginRight: '6px', marginLeft: '6px' }}>وغادر بتاريخ</span>
                  <span style={{ borderBottom: '1px solid #000', minWidth: '22px', display: 'inline-block', textAlign: 'center' }}>{toArabicDigits(toDay) || '\u00A0'}</span>
                  <span>/</span>
                  <span style={{ borderBottom: '1px solid #000', minWidth: '22px', display: 'inline-block', textAlign: 'center' }}>{toArabicDigits(toMonth) || '\u00A0'}</span>
                  <span>/</span>
                  <span style={{ whiteSpace: 'nowrap' }}>١٤{toArabicDigits(toYear) || '\u00A0\u00A0'}هـ</span>
                </div>

                {/* الصف الأخير: الاسم - التوقيع - الختم */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4mm', marginTop: '2mm' }}>
                  {/* الاسم - يمين */}
                  <div style={{ flex: '1.2' }}>
                    <div style={{ fontWeight: 700, marginBottom: '1mm' }}>الاسـم :</div>
                    <div style={{
                      borderBottom: '1px solid #000',
                      minHeight: '10mm',
                      display: 'flex',
                      alignItems: 'flex-end',
                      paddingBottom: '1px',
                      fontWeight: 700,
                      fontSize: '9.5pt',
                    }}>{certifierName || '\u00A0'}</div>
                  </div>
                  {/* التوقيع - وسط */}
                  <div style={{ flex: '1', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, marginBottom: '1mm' }}>التوقيع</div>
                    <div style={{ borderBottom: '1px solid #000', minHeight: '12mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {certifierSignatureUrl && (
                        <img src={certifierSignatureUrl} alt="توقيع" style={{ maxHeight: '12mm', maxWidth: '32mm' }} crossOrigin="anonymous" />
                      )}
                    </div>
                  </div>
                  {/* الختم - يسار */}
                  <div style={{ flex: '1', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, marginBottom: '1mm' }}>الختم</div>
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