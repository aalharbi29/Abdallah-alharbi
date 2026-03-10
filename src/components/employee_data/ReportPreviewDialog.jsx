import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { FileOutput, X } from 'lucide-react';

export default function ReportPreviewDialog({
  open,
  onClose,
  onExport,
  logoSettings,
  logoPosition,
  reportTitle,
  reportNarrative,
  narrativePosition,
  headers,
  selectedFields,
  selectedEmployees,
  displayMode,
  getFieldValue,
  groupedByManager,
  getManagerWithCenters,
  finalRequest,
  showSignature,
  selectedSig,
  signerName,
  signerTitle,
  signaturePosition,
  assignmentGroups,
  splitPages,
  fontSettings,
}) {
  const dateStr = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const logoJustifyClass = logoPosition === 'right' ? 'justify-end' : logoPosition === 'left' ? 'justify-start' : 'justify-center';
  const sigAlignClass = signaturePosition === 'right' ? 'text-right' : signaturePosition === 'left' ? 'text-left' : 'text-center';

  // بناء خريطة المجموعات لعمود فترة التكليف المدمج
  const hasAssignmentField = selectedFields.includes('فترة_التكليف');
  const otherFields = selectedFields.filter(k => k !== 'فترة_التكليف');

  const buildGroupedRows = (empList, bgFn) => {
    if (!hasAssignmentField || !assignmentGroups || assignmentGroups.length === 0) {
      return empList.map((emp, idx) => (
        <tr key={emp.id} style={{ backgroundColor: bgFn ? bgFn(idx) : (idx % 2 === 0 ? '#fff' : '#f9fafb') }}>
          {selectedFields.map(key => (
            <td key={key} className="border border-gray-300 px-2 text-center text-xs font-bold" style={{ padding: '4px 8px' }}>
                {getFieldValue(emp, key)}
              </td>
            ))}
            </tr>
            ));
            }

            // ترتيب الموظفين حسب المجموعات
    const grouped = [];
    const usedIds = new Set();
    assignmentGroups.forEach(group => {
      const ids = group.employeeIds.length > 0 ? group.employeeIds : (assignmentGroups.length === 1 ? empList.map(e => e.id) : []);
      const groupEmps = empList.filter(e => ids.includes(e.id));
      if (groupEmps.length > 0) {
        grouped.push({ group, employees: groupEmps });
        groupEmps.forEach(e => usedIds.add(e.id));
      }
    });
    // موظفون بدون مجموعة
    const ungrouped = empList.filter(e => !usedIds.has(e.id));
    if (ungrouped.length > 0) {
      grouped.push({ group: null, employees: ungrouped });
    }

    const rows = [];
    let globalIdx = 0;
    grouped.forEach(({ group, employees: grpEmps }) => {
      grpEmps.forEach((emp, localIdx) => {
        const bg = bgFn ? bgFn(globalIdx) : (globalIdx % 2 === 0 ? '#fff' : '#f9fafb');
        rows.push(
          <tr key={emp.id} style={{ backgroundColor: bg }}>
            {otherFields.map(key => (
              <td key={key} className="border border-gray-300 text-center text-xs font-bold" style={{ padding: '4px 8px' }}>
                {getFieldValue(emp, key)}
              </td>
            ))}
            {localIdx === 0 && (
              <td
                key="فترة_التكليف"
                rowSpan={grpEmps.length}
                className="border border-gray-300 text-center text-xs font-bold" style={{ padding: '4px 8px' }}
                style={{
                  backgroundColor: '#fff',
                  minWidth: '80px',
                  lineHeight: '1.6',
                }}
              >
                {group && (group.fromDate || group.toDate)
                  ? <>
                      <div>من {group.fromDate || '...'}</div>
                      <div>إلى {group.toDate || '...'} {group.dateType === 'hijri' ? 'هـ' : 'م'}</div>
                    </>
                  : '-'}
              </td>
            )}
          </tr>
        );
        globalIdx++;
      });
    });
    return rows;
  };

  const tableRows = useMemo(() => {
    if (displayMode === 'normal') {
      return buildGroupedRows(selectedEmployees);
    } else {
      const empRows = buildGroupedRows(selectedEmployees, () => '#dbeafe');
      const managerRows = [];
      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            managerRows.push(
              <tr key={`mh-${managerId}`} style={{ backgroundColor: '#d1fae5' }}>
                <td colSpan={selectedFields.length} className="border border-gray-300 text-center font-bold text-xs" style={{ padding: '4px 8px' }}>
                  بيانات المدير المباشر
                </td>
              </tr>
            );
            managerRows.push(
              <tr key={`md-${managerId}`} style={{ backgroundColor: '#ecfdf5' }}>
                {selectedFields.map(key => (
                  <td key={key} className="border border-gray-300 text-center text-xs font-bold" style={{ padding: '4px 8px' }}>
                    {getFieldValue(manager, key)}
                  </td>
                ))}
              </tr>
            );
            processedManagers.add(managerId);
          }
        }
      });
      return [...empRows, ...managerRows];
    }
  }, [selectedEmployees, selectedFields, displayMode, groupedByManager, getFieldValue, getManagerWithCenters, assignmentGroups]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" dir="rtl">
        <DialogHeader className="p-4 border-b sticky top-0 bg-white z-10 flex flex-row items-center justify-between">
          <DialogTitle>معاينة التقرير</DialogTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={onExport} className="bg-teal-600 hover:bg-teal-700">
              <FileOutput className="w-4 h-4 ml-1" />
              تصدير PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 bg-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
          {/* شعار */}
          {logoSettings.show_logo && logoSettings.logo_url && (
            <div className={`flex ${logoJustifyClass} items-center border-b-2 pb-2 mb-4`} style={{ borderColor: '#0284c7' }}>
              <img 
                src={logoSettings.logo_url} 
                alt="شعار"
                style={{ 
                  maxHeight: `${Math.min(logoSettings.max_height, 200)}px`,
                  marginTop: `${logoSettings.margin_top}px`,
                  marginBottom: `${logoSettings.margin_bottom}px`
                }}
              />
            </div>
          )}

          {/* عنوان */}
          <div className="text-center mb-5">
            <h1 className="text-lg font-bold" style={{ color: '#0284c7' }}>{reportTitle}</h1>
          </div>

          {splitPages ? (
            <>
              {/* صفحة 1: النص التعبيري */}
              {reportNarrative && (
                <div className="mb-4 text-sm">
                  {reportNarrative.split(/\n\s*\n/).map((paragraph, pi) => (
                    <div key={pi} style={{ marginBottom: `${fontSettings?.paragraphSpacing || 10}px` }}>
                      {paragraph.split('\n').map((line, i) => {
                        const greetingKeywords = ['السلام', 'التحية', 'وبعد', 'تحية'];
                        const boldKeywords = ['سعادة', 'المكرم', 'المكرمة', 'مدير', 'إدارة', 'الإدارة', 'دائرة', 'الدائرة', 'قسم', 'القسم'];
                        const isGreeting = greetingKeywords.some(kw => line.includes(kw));
                        const isBold = boldKeywords.some(kw => line.includes(kw));
                        return (
                          <span key={i} className="block" style={
                            isBold ? { fontFamily: `'${fontSettings?.narrativeBold?.font || 'PT Sans Caption'}', 'Cairo', sans-serif`, fontWeight: fontSettings?.narrativeBold?.weight || 900, fontSize: `${fontSettings?.narrativeBold?.size || 17}px`, lineHeight: '1.0' }
                            : isGreeting ? { fontFamily: `'${fontSettings?.narrativeGreeting?.font || 'Cairo'}', sans-serif`, fontWeight: fontSettings?.narrativeGreeting?.weight || 700, fontSize: `${fontSettings?.narrativeGreeting?.size || 16}px`, lineHeight: '1.0' }
                            : { fontFamily: `'${fontSettings?.narrativeBody?.font || 'Cairo'}', sans-serif`, fontWeight: fontSettings?.narrativeBody?.weight || 600, fontSize: `${fontSettings?.narrativeBody?.size || 16}px`, lineHeight: fontSettings?.lineHeight || '2.0' }
                          }>
                            {line}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {finalRequest && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm whitespace-pre-wrap">
                  {finalRequest}
                </div>
              )}

              {/* توقيع صفحة 1 */}
              {showSignature && (
                <div className={`mt-8 ${sigAlignClass}`}>
                  {signerName && <p className="text-lg" style={{ fontFamily: "'PT Sans Caption', 'Cairo', sans-serif", fontWeight: 700, color: '#000', fontSize: '18px' }}>{signerName}</p>}
                  {signerTitle && <p className="text-sm" style={{ fontWeight: 700, color: '#000', fontSize: '15px', marginTop: 0 }}>{signerTitle}</p>}
                  {selectedSig && <img src={selectedSig.image_url} alt={selectedSig.name} className={`max-h-24 ${signaturePosition === 'center' ? 'mx-auto' : ''} block`} style={{ marginTop: '-2px', mixBlendMode: 'multiply' }} />}
                </div>
              )}

              {/* تذييل صفحة 1 */}
              {logoSettings.show_footer && (
                <div className="mt-8 pt-3 border-t-2 text-center" style={{ borderColor: '#0284c7' }}>
                  {logoSettings.footer_text_1 && <p className="font-bold text-sm" style={{ color: '#0284c7' }}>{logoSettings.footer_text_1}</p>}
                  {logoSettings.footer_text_2 && <p className="text-sm" style={{ color: '#0284c7' }}>{logoSettings.footer_text_2}</p>}
                  <p className="text-xs mt-2" style={{ color: '#0284c7' }}>{dateStr}</p>
                </div>
              )}

              {/* فاصل صفحات */}
              <div className="my-6 border-t-4 border-dashed border-sky-300 py-2 text-center text-xs text-sky-500 font-bold">— صفحة 2: الجدول —</div>

              {/* شعار صفحة 2 */}
              {logoSettings.show_logo && logoSettings.logo_url && (
                <div className={`flex ${logoJustifyClass} items-center border-b-2 pb-2 mb-4`} style={{ borderColor: '#0284c7' }}>
                  <img src={logoSettings.logo_url} alt="شعار" style={{ maxHeight: `${Math.min(logoSettings.max_height, 200)}px`, marginTop: `${logoSettings.margin_top}px`, marginBottom: `${logoSettings.margin_bottom}px` }} />
                </div>
              )}

              <div className="text-center mb-5">
                <h1 className="text-lg font-bold" style={{ color: '#0284c7' }}>{reportTitle}</h1>
              </div>

              {/* الجدول */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="border border-gray-300 px-3 py-2 text-center font-bold text-xs text-black" style={{ backgroundColor: '#e0f2fe' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{tableRows}</tbody>
                </table>
              </div>

              {/* توقيع صفحة 2 */}
              {showSignature && (
                <div className={`mt-8 ${sigAlignClass}`}>
                  {signerName && <p className="text-lg" style={{ fontFamily: "'PT Sans Caption', 'Cairo', sans-serif", fontWeight: 700, color: '#000', fontSize: '18px' }}>{signerName}</p>}
                  {signerTitle && <p className="text-sm" style={{ fontWeight: 700, color: '#000', fontSize: '15px', marginTop: 0 }}>{signerTitle}</p>}
                  {selectedSig && <img src={selectedSig.image_url} alt={selectedSig.name} className={`max-h-24 ${signaturePosition === 'center' ? 'mx-auto' : ''} block`} style={{ marginTop: '-2px', mixBlendMode: 'multiply' }} />}
                </div>
              )}

              {/* تذييل صفحة 2 */}
              {logoSettings.show_footer && (
                <div className="mt-8 pt-3 border-t-2 text-center" style={{ borderColor: '#0284c7' }}>
                  {logoSettings.footer_text_1 && <p className="font-bold text-sm" style={{ color: '#0284c7' }}>{logoSettings.footer_text_1}</p>}
                  {logoSettings.footer_text_2 && <p className="text-sm" style={{ color: '#0284c7' }}>{logoSettings.footer_text_2}</p>}
                  <p className="text-xs mt-2" style={{ color: '#0284c7' }}>{dateStr}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* نص تعبيري قبل الجدول */}
              {narrativePosition === 'before' && reportNarrative && (
                <div className="mb-4 text-sm">
                  {reportNarrative.split(/\n\s*\n/).map((paragraph, pi) => (
                    <div key={pi} style={{ marginBottom: `${fontSettings?.paragraphSpacing || 10}px` }}>
                      {paragraph.split('\n').map((line, i) => {
                        const greetingKeywords = ['السلام', 'التحية', 'وبعد', 'تحية'];
                        const boldKeywords = ['سعادة', 'المكرم', 'المكرمة', 'مدير', 'إدارة', 'الإدارة', 'دائرة', 'الدائرة', 'قسم', 'القسم'];
                        const isGreeting = greetingKeywords.some(kw => line.includes(kw));
                        const isBold = boldKeywords.some(kw => line.includes(kw));
                        const isStructural = isGreeting || isBold;
                        return (
                          <span key={i} className="block" style={
                            isBold ? { fontFamily: `'${fontSettings?.narrativeBold?.font || 'PT Sans Caption'}', 'Cairo', sans-serif`, fontWeight: fontSettings?.narrativeBold?.weight || 900, fontSize: `${fontSettings?.narrativeBold?.size || 17}px`, lineHeight: '1.0' }
                            : isGreeting ? { fontFamily: `'${fontSettings?.narrativeGreeting?.font || 'Cairo'}', sans-serif`, fontWeight: fontSettings?.narrativeGreeting?.weight || 700, fontSize: `${fontSettings?.narrativeGreeting?.size || 16}px`, lineHeight: '1.0' }
                            : { fontFamily: `'${fontSettings?.narrativeBody?.font || 'Cairo'}', sans-serif`, fontWeight: fontSettings?.narrativeBody?.weight || 600, fontSize: `${fontSettings?.narrativeBody?.size || 16}px`, lineHeight: fontSettings?.lineHeight || '2.0' }
                          }>
                            {line}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* الجدول */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="border border-gray-300 px-3 py-2 text-center font-bold text-xs text-black" style={{ backgroundColor: '#e0f2fe' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{tableRows}</tbody>
                </table>
              </div>

              {/* نص تعبيري بعد الجدول */}
              {narrativePosition === 'after' && reportNarrative && (
                <div className="mt-4 text-sm">
                  {reportNarrative.split(/\n\s*\n/).map((paragraph, pi) => (
                    <div key={pi} style={{ marginBottom: `${fontSettings?.paragraphSpacing || 10}px` }}>
                      {paragraph.split('\n').map((line, i) => {
                        const greetingKeywords = ['السلام', 'التحية', 'وبعد', 'تحية'];
                        const boldKeywords = ['سعادة', 'المكرم', 'المكرمة', 'مدير', 'إدارة', 'الإدارة', 'دائرة', 'الدائرة', 'قسم', 'القسم'];
                        const isGreeting = greetingKeywords.some(kw => line.includes(kw));
                        const isBold = boldKeywords.some(kw => line.includes(kw));
                        return (
                          <span key={i} className="block" style={
                            isBold ? { fontFamily: `'${fontSettings?.narrativeBold?.font || 'PT Sans Caption'}', 'Cairo', sans-serif`, fontWeight: fontSettings?.narrativeBold?.weight || 900, fontSize: `${fontSettings?.narrativeBold?.size || 17}px`, lineHeight: '1.0' }
                            : isGreeting ? { fontFamily: `'${fontSettings?.narrativeGreeting?.font || 'Cairo'}', sans-serif`, fontWeight: fontSettings?.narrativeGreeting?.weight || 700, fontSize: `${fontSettings?.narrativeGreeting?.size || 16}px`, lineHeight: '1.0' }
                            : { fontFamily: `'${fontSettings?.narrativeBody?.font || 'Cairo'}', sans-serif`, fontWeight: fontSettings?.narrativeBody?.weight || 600, fontSize: `${fontSettings?.narrativeBody?.size || 16}px`, lineHeight: fontSettings?.lineHeight || '2.0' }
                          }>
                            {line}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* نص الطلب */}
              {finalRequest && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm whitespace-pre-wrap">
                  {finalRequest}
                </div>
              )}

              {/* التوقيع */}
              {showSignature && (
                <div className={`mt-8 ${sigAlignClass}`}>
                  {signerName && <p className="text-lg" style={{ fontFamily: "'PT Sans Caption', 'Cairo', sans-serif", fontWeight: 700, color: '#000', fontSize: '18px' }}>{signerName}</p>}
                  {signerTitle && <p className="text-sm" style={{ fontWeight: 700, color: '#000', fontSize: '15px', marginTop: 0 }}>{signerTitle}</p>}
                  {selectedSig && <img src={selectedSig.image_url} alt={selectedSig.name} className={`max-h-24 ${signaturePosition === 'center' ? 'mx-auto' : ''} block`} style={{ marginTop: '-2px', mixBlendMode: 'multiply' }} />}
                </div>
              )}

              {/* تذييل */}
              {logoSettings.show_footer && (
                <div className="mt-8 pt-3 border-t-2 text-center" style={{ borderColor: '#0284c7' }}>
                  {logoSettings.footer_text_1 && <p className="font-bold text-sm" style={{ color: '#0284c7' }}>{logoSettings.footer_text_1}</p>}
                  {logoSettings.footer_text_2 && <p className="text-sm" style={{ color: '#0284c7' }}>{logoSettings.footer_text_2}</p>}
                  <p className="text-xs mt-2" style={{ color: '#0284c7' }}>{dateStr}</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}