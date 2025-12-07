import React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const getDayName = (dateString) => {
  try {
    const date = new Date(dateString);
    return format(date, 'EEEE', { locale: ar });
  } catch (error) {
    return '';
  }
};

export default function StandardAssignmentTemplate({ 
  assignment, 
  employee,
  signaturePosition = { x: 420, y: 520 },
  stampPosition = { x: 350, y: 600 },
  managerNamePosition = { x: 300, y: 480 },
  stampSize = 150,
  textStyles = {
    title: { size: 24, font: 'Arial', bold: true },
    intro: { size: 16, font: 'Arial', bold: true },
    paragraph1: { size: 16, font: 'Arial', bold: false },
    paragraph2: { size: 16, font: 'Arial', bold: false },
    paragraph3: { size: 16, font: 'Arial', bold: false },
    paragraph4: { size: 16, font: 'Arial', bold: false },
    paragraph5: { size: 16, font: 'Arial', bold: false },
    closing: { size: 16, font: 'Arial', bold: true },
    managerName: { size: 16, font: 'Arial', bold: true },
    tableHeaders: { size: 14, font: 'Arial', bold: true },
    tableData: { size: 14, font: 'Arial', bold: false }
  },
  // خيارات عكس التعديلات من القالب المرن
  syncOptions = null
}) {
  if (!assignment) {
    return <div className="p-6 text-center">لا توجد بيانات تكليف لعرضها</div>;
  }

  const isFemale = assignment.gender === 'أنثى';
  const formattedStartDate = assignment.start_date ? format(new Date(assignment.start_date), "dd-MM-yyyy") : '____-___-____';
  const formattedEndDate = assignment.end_date ? format(new Date(assignment.end_date), "dd-MM-yyyy") : '____-___-____';
  const startDayName = assignment.start_date ? getDayName(assignment.start_date) : '';
  const endDayName = assignment.end_date ? getDayName(assignment.end_date) : '';

  // استخراج خيارات التزامن إذا كانت مفعلة
  const showNumbering = syncOptions?.showNumbering ?? true;
  const customTitle = syncOptions?.customTitle || 'تكليف';
  const customIntro = syncOptions?.customIntro || null;
  const customParagraph1 = syncOptions?.customParagraph1 || null;
  const customParagraph2 = syncOptions?.customParagraph2 || null;
  const customParagraph3 = syncOptions?.customParagraph3 || null;
  const customParagraph4 = syncOptions?.customParagraph4 || null;
  const customParagraph5 = syncOptions?.customParagraph5 || null;
  const customClosing = syncOptions?.customClosing || null;
  const customTextAfter = syncOptions?.customTextAfter || null;
  const customTextAfterPosition = syncOptions?.customTextAfterPosition || { x: 300, y: 750 };
  const customTextAfterStyle = syncOptions?.customTextAfterStyle || { size: 14, font: 'Arial', bold: false, align: 'center' };
  const showDurationInParagraph = syncOptions?.showDurationInParagraph ?? true;
  const paragraphAlign = syncOptions?.paragraphAlign || 'right';
  const multiplePeriods = syncOptions?.multiplePeriods ?? false;
  const additionalPeriods = syncOptions?.additionalPeriods || [];

  const formatPeriod = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startFormatted = format(start, "dd-MM-yyyy");
    const endFormatted = format(end, "dd-MM-yyyy");
    const startDay = format(start, 'EEEE', { locale: ar });
    const endDay = format(end, 'EEEE', { locale: ar });
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    if (days === 1) {
      return `يوم ${startDay} ${startFormatted}م`;
    } else {
      return `من ${startDay} ${startFormatted}م حتى ${endDay} ${endFormatted}م`;
    }
  };

  const getMultiplePeriodsDurationText = () => {
    if (multiplePeriods && additionalPeriods.length > 0) {
      const allPeriods = [
        { start_date: assignment.start_date, end_date: assignment.end_date },
        ...additionalPeriods.filter(p => p.start_date && p.end_date)
      ];
      
      return (
        <>
          على الفترات التالية:<br />
          {allPeriods.map((period, index) => (
            <span key={index}>
              {index + 1}- {formatPeriod(period.start_date, period.end_date)}
              {index < allPeriods.length - 1 && <br />}
            </span>
          ))}
        </>
      );
    }
    return null;
  };

  const getDurationText = () => {
    const days = assignment.duration_days;
    if (days === 1) {
      return <>لمدة يوم&nbsp;واحد والموافق يوم {startDayName} {formattedStartDate}م.</>;
    } else if (days === 2) {
      return <>لمدة يومين،<br />اعتباراً&nbsp;من {startDayName} {formattedStartDate}م حتى {endDayName} {formattedEndDate}م.</>;
    } else if (days >= 3 && days <= 10) {
      return <>لمدة {days}&nbsp;أيام،<br />اعتباراً&nbsp;من {startDayName} {formattedStartDate}م حتى {endDayName} {formattedEndDate}م.</>;
    } else {
      return <>لمدة {days}&nbsp;يوم،<br />اعتباراً&nbsp;من {startDayName} {formattedStartDate}م حتى {endDayName} {formattedEndDate}م.</>;
    }
  };

  const getSingleLineDurationText = () => {
    const days = assignment.duration_days;
    if (days === 1) {
      return `لمدة يوم\u00A0واحد والموافق يوم ${startDayName} ${formattedStartDate}م`;
    } else if (days === 2) {
      return `لمدة يومين، اعتباراً\u00A0من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م`;
    } else if (days >= 3 && days <= 10) {
      return `لمدة ${days}\u00A0أيام، اعتباراً\u00A0من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م`;
    } else {
      return `لمدة ${days}\u00A0يوم، اعتباراً\u00A0من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م`;
    }
  };

  const letterheadUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/20b408cf3_.png";

  return (
    <div 
      className="bg-white mx-auto print-area shadow-2xl" 
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        maxWidth: '210mm', 
        position: 'relative', 
        padding: '20mm', 
        boxSizing: 'border-box',
        backgroundImage: `url(${letterheadUrl})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      {/* المحتوى يبدأ بعد الترويسة */}
      <div style={{ marginTop: '60px' }}>
        <h1 className="text-center mb-4 text-sky-400" style={{
          fontSize: `${textStyles.title.size}px`,
          fontFamily: textStyles.title.font,
          fontWeight: textStyles.title.bold ? 'bold' : 'normal'
        }}>{customTitle}</h1>

        <div className="mb-4 flex justify-center">
          <table className="border-collapse border-2 border-black text-sm" style={{ width: '90%', maxWidth: '600px' }}>
            <tbody>
              <tr className="border-b border-black">
                <td className="border-l border-black p-2 bg-gray-100 w-1/4 text-center" style={{
                  fontSize: `${textStyles.tableHeaders.size}px`,
                  fontFamily: textStyles.tableHeaders.font,
                  fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal'
                }}>الاسم</td>
                <td className="p-2 text-center" style={{
                  fontSize: `${textStyles.tableData.size}px`,
                  fontFamily: textStyles.tableData.font,
                  fontWeight: textStyles.tableData.bold ? 'bold' : 'normal'
                }}>{assignment.employee_name || 'غير محدد'}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-l border-black p-2 bg-gray-100 text-center" style={{
                  fontSize: `${textStyles.tableHeaders.size}px`,
                  fontFamily: textStyles.tableHeaders.font,
                  fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal'
                }}>المسمى الوظيفي</td>
                <td className="p-2 text-center" style={{
                  fontSize: `${textStyles.tableData.size}px`,
                  fontFamily: textStyles.tableData.font,
                  fontWeight: textStyles.tableData.bold ? 'bold' : 'normal'
                }}>{assignment.employee_position || 'غير محدد'}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-l border-black p-2 bg-gray-100 text-center" style={{
                  fontSize: `${textStyles.tableHeaders.size}px`,
                  fontFamily: textStyles.tableHeaders.font,
                  fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal'
                }}>نوع التكليف</td>
                <td className="p-2 text-center" style={{
                  fontSize: `${textStyles.tableData.size}px`,
                  fontFamily: textStyles.tableData.font,
                  fontWeight: textStyles.tableData.bold ? 'bold' : 'normal'
                }}>{assignment.assignment_type || 'تكليف داخلي - مؤقت'}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-l border-black p-2 bg-gray-100 text-center" style={{
                  fontSize: `${textStyles.tableHeaders.size}px`,
                  fontFamily: textStyles.tableHeaders.font,
                  fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal'
                }}>جهة العمل</td>
                <td className="p-2 text-center" style={{
                  fontSize: `${textStyles.tableData.size}px`,
                  fontFamily: textStyles.tableData.font,
                  fontWeight: textStyles.tableData.bold ? 'bold' : 'normal'
                }}>{assignment.from_health_center || 'غير محدد'}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-l border-black p-2 bg-gray-100 text-center" style={{
                  fontSize: `${textStyles.tableHeaders.size}px`,
                  fontFamily: textStyles.tableHeaders.font,
                  fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal'
                }}>جهة التكليف</td>
                <td className="p-2 text-center" style={{
                  fontSize: `${textStyles.tableData.size}px`,
                  fontFamily: textStyles.tableData.font,
                  fontWeight: textStyles.tableData.bold ? 'bold' : 'normal'
                }}>{assignment.assigned_to_health_center || 'غير محدد'}</td>
              </tr>
              <tr>
                <td className="border-l border-black p-2 bg-gray-100 text-center" style={{
                  fontSize: `${textStyles.tableHeaders.size}px`,
                  fontFamily: textStyles.tableHeaders.font,
                  fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal'
                }}>مدة التكليف</td>
                <td className="p-2 text-center" style={{
                  fontSize: `${textStyles.tableData.size}px`,
                  fontFamily: textStyles.tableData.font,
                  fontWeight: textStyles.tableData.bold ? 'bold' : 'normal'
                }}>
                  {getSingleLineDurationText()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'right', marginRight: '12px', marginLeft: '4px', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          <p className="mb-3 text-center" style={{
            fontSize: `${textStyles.intro.size}px`,
            fontFamily: textStyles.intro.font,
            fontWeight: textStyles.intro.bold ? 'bold' : 'normal'
          }}>
            {customIntro ? (
              <span dangerouslySetInnerHTML={{ __html: customIntro }} />
            ) : (
              'إن مدير شؤون المراكز الصحية بالحناكية وبناءً على الصلاحيات الممنوحة له نظاماً ونظراً لما تقتضيه حاجة العمل عليه يقرر ما يلي:'
            )}
          </p>
          <div style={{ marginRight: '80px', textAlign: paragraphAlign }}>
            <p style={{ 
              marginBottom: '0.75rem',
              fontSize: `${textStyles.paragraph1.size}px`,
              fontFamily: textStyles.paragraph1.font,
              fontWeight: textStyles.paragraph1.bold ? 'bold' : 'normal',
              lineHeight: '1.6',
              textAlign: paragraphAlign
            }}>
              {showNumbering && <strong>١- </strong>}
              {customParagraph1 ? (
                <span dangerouslySetInnerHTML={{ __html: customParagraph1 }} />
              ) : (
                <>تكليف الموضح{isFemale ? 'ة' : ''} بيانات{isFemale ? 'ها' : 'ه'} أعلاه لتغطية العمل في <strong>({assignment.assigned_to_health_center || 'غير محدد'})</strong> {showDurationInParagraph && (getMultiplePeriodsDurationText() || getDurationText())}</>
              )}
            </p>
            <p style={{ 
              marginBottom: '0.75rem',
              fontSize: `${textStyles.paragraph2.size}px`,
              fontFamily: textStyles.paragraph2.font,
              fontWeight: textStyles.paragraph2.bold ? 'bold' : 'normal',
              lineHeight: '1.6',
              textAlign: paragraphAlign
            }}>
              {showNumbering && <strong>٢- </strong>}
              {customParagraph2 ? (
                <span dangerouslySetInnerHTML={{ __html: customParagraph2 }} />
              ) : (
                'لا يترتب على هذا القرار أي ميزة مالية إلا ما يقره النظام.'
              )}
            </p>
            <p style={{ 
              marginBottom: '0.75rem',
              fontSize: `${textStyles.paragraph3.size}px`,
              fontFamily: textStyles.paragraph3.font,
              fontWeight: textStyles.paragraph3.bold ? 'bold' : 'normal',
              lineHeight: '1.6',
              textAlign: paragraphAlign
            }}>
              {showNumbering && <strong>٣- </strong>}
              {customParagraph3 ? (
                <span dangerouslySetInnerHTML={{ __html: customParagraph3 }} />
              ) : (
                <>نسخة لـ <strong>({assignment.from_health_center || 'غير محدد'})</strong> لإبلاغ المذكور{isFemale ? 'ة' : ''} وتزويد{isFemale ? 'ها' : 'ه'} بنسخة من القرار.</>
              )}
            </p>
            <p style={{ 
              marginBottom: '0.75rem',
              fontSize: `${textStyles.paragraph4.size}px`,
              fontFamily: textStyles.paragraph4.font,
              fontWeight: textStyles.paragraph4.bold ? 'bold' : 'normal',
              lineHeight: '1.6',
              textAlign: paragraphAlign
            }}>
              {showNumbering && <strong>٤- </strong>}
              {customParagraph4 ? (
                <span dangerouslySetInnerHTML={{ __html: customParagraph4 }} />
              ) : (
                <>نسخة لـ <strong>({assignment.assigned_to_health_center || 'غير محدد'})</strong> لتمكين{isFemale ? 'ها' : 'ه'} من المباشرة وأداء مهام عمل{isFemale ? 'ها' : 'ه'}.</>
              )}
            </p>
            <p style={{ 
              marginBottom: '0.75rem',
              fontSize: `${textStyles.paragraph5.size}px`,
              fontFamily: textStyles.paragraph5.font,
              fontWeight: textStyles.paragraph5.bold ? 'bold' : 'normal',
              lineHeight: '1.6',
              textAlign: paragraphAlign
            }}>
              {showNumbering && <strong>٥- </strong>}
              {customParagraph5 ? (
                <span dangerouslySetInnerHTML={{ __html: customParagraph5 }} />
              ) : (
                'يتم تنفيذ هذا القرار كلاً فيما يخصه.'
              )}
            </p>
          </div>
          <p className="text-center mt-6" style={{
            fontSize: `${textStyles.closing.size}px`,
            fontFamily: textStyles.closing.font,
            fontWeight: textStyles.closing.bold ? 'bold' : 'normal'
          }}>{customClosing || 'خالص التحايا ،،،'}</p>
        </div>

        {/* النص الإضافي بعد الختام */}
        {customTextAfter && (
          <div 
            style={{ 
              position: 'absolute',
              left: `${customTextAfterPosition.x}px`, 
              top: `${customTextAfterPosition.y}px`,
              fontSize: `${customTextAfterStyle.size}px`,
              fontFamily: customTextAfterStyle.font,
              fontWeight: customTextAfterStyle.bold ? 'bold' : 'normal',
              textAlign: customTextAfterStyle.align || 'center',
              maxWidth: '400px'
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: customTextAfter }} />
          </div>
        )}

        {/* التوقيع والختم */}
        <div 
            style={{ 
              position: 'absolute',
              left: `${managerNamePosition.x}px`, 
              top: `${managerNamePosition.y}px`,
              textAlign: 'center',
              fontSize: `${textStyles.managerName.size}px`,
              fontFamily: textStyles.managerName.font,
              fontWeight: 'bold'
            }}
          >
            <p style={{ marginBottom: '4px', fontWeight: 'bold' }}>
              مدير إدارة شؤون المراكز الصحية بالحناكية
            </p>
            <p style={{ fontWeight: 'bold' }}>
              أ/عبدالمجيد سعود الربيقي
            </p>
          </div>

        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png"
          alt="الختم"
          style={{ 
            position: 'absolute',
            left: `${stampPosition.x}px`, 
            top: `${stampPosition.y}px`,
            width: `${stampSize}px`,
            opacity: 0.85,
            mixBlendMode: 'multiply',
            zIndex: 100
          }}
        />

        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png"
          alt="التوقيع"
          style={{ 
            position: 'absolute',
            left: `${signaturePosition.x}px`, 
            top: `${signaturePosition.y}px`,
            width: '170px',
            mixBlendMode: 'darken'
          }}
        />
      </div>
    </div>
  );
}