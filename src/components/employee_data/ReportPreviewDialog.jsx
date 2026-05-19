import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { FileOutput, X, AlignRight, AlignCenter, AlignLeft, Indent, Outdent, ArrowUp, ArrowDown } from 'lucide-react';
import { MHC_ASSETS } from '@/components/branding/madinahCluster';
import { formatAssignmentPeriodsHtml } from './periodUtils';
import TransparentSignatureImage from '@/components/common/TransparentSignatureImage';

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
  mergeWorkplace,
  mergeWorkplaceOrientation,
  mergeAssignment,
  mergeAssignmentOrientation,
  mergeAssignmentPeriods = false,
  lineStyles = {},
  setLineStyles,
  headerSideText = '',
}) {
  const updateLineStyle = (pi, i, updates) => {
    if (!setLineStyles) return;
    setLineStyles(prev => ({
      ...prev,
      [`${pi}_${i}`]: { ...(prev[`${pi}_${i}`] || {}), ...updates }
    }));
  };
  const dateStr = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const logoJustifyClass = logoPosition === 'right' ? 'justify-end' : logoPosition === 'left' ? 'justify-start' : 'justify-center';
  const sigAlignClass = signaturePosition === 'right' ? 'text-right' : signaturePosition === 'left' ? 'text-left' : 'text-center';

  const getMergedCellStyle = (spanCount, orientation) => {
    const baseStyle = { padding: '4px 8px', verticalAlign: 'middle' };
    if (spanCount <= 1) return baseStyle;
    
    if (orientation === 'vertical') {
      return { ...baseStyle, writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' };
    } else if (orientation === 'diagonal') {
      return { ...baseStyle, whiteSpace: 'nowrap' };
    } else {
      return { ...baseStyle, whiteSpace: 'normal' };
    }
  };

  const renderMergedCellContent = (content, spanCount, orientation) => {
    if (spanCount > 1 && orientation === 'diagonal') {
      return <div style={{ transform: 'rotate(-45deg)', display: 'inline-block', whiteSpace: 'nowrap' }}>{content}</div>;
    }
    return content;
  };

  // بناء خريطة المجموعات لعمود فترة التكليف المدمج
  const hasAssignmentField = selectedFields.includes('فترة_التكليف');
  const otherFields = selectedFields.filter(k => k !== 'فترة_التكليف');

  const buildGroupedRows = (empList, bgFn) => {
    // حساب دمج الخلايا لجهة العمل وجهة التكليف
    const workplaceSpans = {};
    const assignmentSpans = {};
    
    if (mergeWorkplace || mergeAssignment) {
      let currentWorkplace = null;
      let workplaceStartIdx = 0;
      let currentAssignment = null;
      let assignmentStartIdx = 0;

      empList.forEach((emp, idx) => {
        const wpVal = getFieldValue(emp, 'المركز_الصحي');
        const asVal = getFieldValue(emp, 'جهة_التكليف');

        if (mergeWorkplace) {
          if (wpVal !== currentWorkplace) {
            currentWorkplace = wpVal;
            workplaceStartIdx = idx;
            workplaceSpans[idx] = 1;
          } else {
            workplaceSpans[workplaceStartIdx]++;
            workplaceSpans[idx] = 0;
          }
        }

        if (mergeAssignment) {
          if (asVal !== currentAssignment) {
            currentAssignment = asVal;
            assignmentStartIdx = idx;
            assignmentSpans[idx] = 1;
          } else {
            assignmentSpans[assignmentStartIdx]++;
            assignmentSpans[idx] = 0;
          }
        }
      });
    }

    if (!hasAssignmentField || !assignmentGroups || assignmentGroups.length === 0) {
      return empList.map((emp, idx) => (
        <tr key={emp.id}>
          {selectedFields.map(key => {
            if (mergeWorkplace && key === 'المركز_الصحي') {
              if (workplaceSpans[idx] === 0) return null;
              return (
                <td key={key} rowSpan={workplaceSpans[idx]} className="border border-black px-2 text-center text-xs font-bold" style={{ ...getMergedCellStyle(workplaceSpans[idx], mergeWorkplaceOrientation), backgroundColor: 'transparent' }}>
                  {renderMergedCellContent(getFieldValue(emp, key), workplaceSpans[idx], mergeWorkplaceOrientation)}
                </td>
              );
            }
            if (mergeAssignment && key === 'جهة_التكليف') {
              if (assignmentSpans[idx] === 0) return null;
              return (
                <td key={key} rowSpan={assignmentSpans[idx]} className="border border-black px-2 text-center text-xs font-bold" style={{ ...getMergedCellStyle(assignmentSpans[idx], mergeAssignmentOrientation), backgroundColor: 'transparent' }}>
                  {renderMergedCellContent(getFieldValue(emp, key), assignmentSpans[idx], mergeAssignmentOrientation)}
                </td>
              );
            }
            return (
              <td key={key} className="border border-black px-2 text-center text-xs font-bold" style={{ padding: '2px 6px', backgroundColor: 'transparent' }}>
                {getFieldValue(emp, key)}
              </td>
            );
          })}
        </tr>
      ));
    }

            const sortedInputEmps = [...empList].sort((a, b) => {
      const centerA = getFieldValue(a, 'جهة_التكليف') || '';
      const centerB = getFieldValue(b, 'جهة_التكليف') || '';
      return centerA.localeCompare(centerB, 'ar');
    });

    const centerBuckets = new Map();
    sortedInputEmps.forEach(emp => {
      const center = getFieldValue(emp, 'جهة_التكليف') || '';
      if (!centerBuckets.has(center)) centerBuckets.set(center, []);
      centerBuckets.get(center).push(emp);
    });

    // ترتيب الموظفين حسب جهة التكليف أولاً ثم حسب الفترات داخل كل جهة
    const grouped = [];
    const usedIds = new Set();
    centerBuckets.forEach((centerEmps) => {
      assignmentGroups.forEach(group => {
        const ids = group.employeeIds.length > 0 ? group.employeeIds : (assignmentGroups.length === 1 ? sortedInputEmps.map(e => e.id) : []);
        const groupEmps = centerEmps.filter(e => ids.includes(e.id));
        if (groupEmps.length > 0) {
          grouped.push({ group, employees: groupEmps });
          groupEmps.forEach(e => usedIds.add(e.id));
        }
      });
      const ungroupedCenterEmps = centerEmps.filter(e => !usedIds.has(e.id));
      if (ungroupedCenterEmps.length > 0) {
        grouped.push({ group: null, employees: ungroupedCenterEmps });
      }
    });

    // إعادة حساب الدمج بعد الترتيب الجديد
    const sortedRows = [];
    grouped.forEach(({ group, employees: grpEmps }) => grpEmps.forEach(emp => sortedRows.push({ group, emp })));
    const sortedEmps = sortedRows.map(row => row.emp);
    
    const sortedWorkplaceSpans = {};
    const sortedAssignmentSpans = {};
    const sortedPeriodSpans = {};
    if (mergeWorkplace || mergeAssignment || mergeAssignmentPeriods) {
      let cw = null, ws = 0, ca = null, as = 0, cp = null, ps = 0;
      sortedRows.forEach((row, i) => {
        const e = row.emp;
        const w = getFieldValue(e, 'المركز_الصحي'); const a = getFieldValue(e, 'جهة_التكليف');
        const p = row.group ? formatAssignmentPeriodsHtml(row.group, e.id) : '-';
        if (mergeWorkplace) { if (w !== cw) { cw = w; ws = i; sortedWorkplaceSpans[i] = 1; } else { sortedWorkplaceSpans[ws]++; sortedWorkplaceSpans[i] = 0; } }
        if (mergeAssignment) { if (a !== ca) { ca = a; as = i; sortedAssignmentSpans[i] = 1; } else { sortedAssignmentSpans[as]++; sortedAssignmentSpans[i] = 0; } }
        if (mergeAssignmentPeriods) { if (p !== cp) { cp = p; ps = i; sortedPeriodSpans[i] = 1; } else { sortedPeriodSpans[ps]++; sortedPeriodSpans[i] = 0; } }
      });
    }

    const rows = [];
    let globalIdx = 0;
    grouped.forEach(({ group, employees: grpEmps }) => {
      grpEmps.forEach((emp, localIdx) => {
        rows.push(
          <tr key={emp.id}>
            {selectedFields.map(key => {
              if (key === 'فترة_التكليف') {
                const currentPeriodText = formatAssignmentPeriodsHtml(group, emp.id);
                if (!mergeAssignmentPeriods) {
                  return (
                    <td
                      key="فترة_التكليف"
                      className="border border-black text-center text-xs font-bold"
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'transparent',
                        minWidth: '80px',
                        lineHeight: '1.6',
                      }}
                    >
                      {group ? <div dangerouslySetInnerHTML={{ __html: currentPeriodText }} /> : '-'}
                    </td>
                  );
                }
                if (sortedPeriodSpans[globalIdx] !== 0) {
                  return (
                    <td
                      key="فترة_التكليف"
                      rowSpan={sortedPeriodSpans[globalIdx] || 1}
                      className="border border-black text-center text-xs font-bold"
                      style={{
                        padding: '4px 8px',
                        verticalAlign: 'middle',
                        backgroundColor: 'transparent',
                        minWidth: '80px',
                        lineHeight: '1.6',
                      }}
                    >
                      {group ? <div dangerouslySetInnerHTML={{ __html: currentPeriodText }} /> : '-'}
                    </td>
                  );
                }
                return null;
              }

              if (mergeWorkplace && key === 'المركز_الصحي') {
                if (sortedWorkplaceSpans[globalIdx] === 0) return null;
                return (
                  <td key={key} rowSpan={sortedWorkplaceSpans[globalIdx]} className="border border-black text-center text-xs font-bold" style={{ ...getMergedCellStyle(sortedWorkplaceSpans[globalIdx], mergeWorkplaceOrientation), backgroundColor: 'transparent' }}>
                    {renderMergedCellContent(getFieldValue(emp, key), sortedWorkplaceSpans[globalIdx], mergeWorkplaceOrientation)}
                  </td>
                );
              }
              if (mergeAssignment && key === 'جهة_التكليف') {
                if (sortedAssignmentSpans[globalIdx] === 0) return null;
                return (
                  <td key={key} rowSpan={sortedAssignmentSpans[globalIdx]} className="border border-black text-center text-xs font-bold" style={{ ...getMergedCellStyle(sortedAssignmentSpans[globalIdx], mergeAssignmentOrientation), backgroundColor: 'transparent' }}>
                    {renderMergedCellContent(getFieldValue(emp, key), sortedAssignmentSpans[globalIdx], mergeAssignmentOrientation)}
                  </td>
                );
              }
              return (
                <td key={key} className="border border-black text-center text-xs font-bold" style={{ padding: '4px 8px', backgroundColor: 'transparent' }}>
                  {getFieldValue(emp, key)}
                </td>
              );
            })}
          </tr>
        );
        globalIdx++;
      });
    });
    return rows;
  };

  const renderNarrative = (extraClass = "mb-4 text-sm") => {
    if (!reportNarrative) return null;
    return (
      <div className={extraClass}>
        {reportNarrative.split(/\n\s*\n/).map((paragraph, pi) => (
          <div key={pi} style={{ marginBottom: `${fontSettings?.paragraphSpacing || 10}px` }}>
            {paragraph.split('\n').map((line, i) => {
              const greetingKeywords = ['السلام', 'التحية', 'وبعد', 'تحية'];
              const boldKeywords = ['سعادة', 'المكرم', 'المكرمة', 'مدير', 'إدارة', 'الإدارة', 'دائرة', 'الدائرة', 'قسم', 'القسم'];
              const isGreeting = greetingKeywords.some(kw => line.includes(kw));
              const isBold = boldKeywords.some(kw => line.includes(kw));
              
              const lineKey = `${pi}_${i}`;
              const customStyle = lineStyles[lineKey] || {};

              return (
                <div key={i} className="relative group/line" style={{ textAlign: customStyle.textAlign || 'right', paddingRight: customStyle.indent ? `${customStyle.indent}px` : '0', marginBottom: customStyle.spacing ? `${customStyle.spacing}px` : '0' }}>
                  <span className="block" style={
                    isBold ? { fontFamily: `'${fontSettings?.narrativeBold?.font || 'PT Sans Caption'}', 'Cairo', sans-serif`, fontWeight: fontSettings?.narrativeBold?.weight || 900, fontSize: `${fontSettings?.narrativeBold?.size || 17}px`, lineHeight: '1.0' }
                    : isGreeting ? { fontFamily: `'${fontSettings?.narrativeGreeting?.font || 'Cairo'}', sans-serif`, fontWeight: fontSettings?.narrativeGreeting?.weight || 700, fontSize: `${fontSettings?.narrativeGreeting?.size || 16}px`, lineHeight: '1.0' }
                    : { fontFamily: `'${fontSettings?.narrativeBody?.font || 'Cairo'}', sans-serif`, fontWeight: fontSettings?.narrativeBody?.weight || 600, fontSize: `${fontSettings?.narrativeBody?.size || 16}px`, lineHeight: fontSettings?.lineHeight || '2.0' }
                  }>
                    {line}
                  </span>
                  
                  {/* Toolbar */}
                  <div className="absolute -top-8 right-0 opacity-0 group-hover/line:opacity-100 transition-opacity bg-white border border-gray-200 shadow-md rounded-md flex items-center gap-1 p-1 no-print z-50" dir="rtl">
                     <button onClick={() => updateLineStyle(pi, i, { textAlign: 'right' })} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="يمين"><AlignRight size={14}/></button>
                     <button onClick={() => updateLineStyle(pi, i, { textAlign: 'center' })} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="توسيط"><AlignCenter size={14}/></button>
                     <button onClick={() => updateLineStyle(pi, i, { textAlign: 'left' })} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="يسار"><AlignLeft size={14}/></button>
                     <div className="w-px h-4 bg-gray-300 mx-1"></div>
                     <button onClick={() => updateLineStyle(pi, i, { indent: (customStyle.indent || 0) + 20 })} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="إزاحة لليسار"><Indent size={14}/></button>
                     <button onClick={() => updateLineStyle(pi, i, { indent: Math.max(0, (customStyle.indent || 0) - 20) })} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="إزاحة لليمين"><Outdent size={14}/></button>
                     <div className="w-px h-4 bg-gray-300 mx-1"></div>
                     <button onClick={() => updateLineStyle(pi, i, { spacing: (customStyle.spacing || 0) + 5 })} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="زيادة المسافة"><ArrowDown size={14}/></button>
                     <button onClick={() => updateLineStyle(pi, i, { spacing: Math.max(-20, (customStyle.spacing || 0) - 5) })} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="تقليل المسافة"><ArrowUp size={14}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const tableRows = useMemo(() => {
    if (displayMode === 'normal') {
      return buildGroupedRows(selectedEmployees);
    } else {
      const empRows = buildGroupedRows(selectedEmployees);
      const managerRows = [];
      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            managerRows.push(
              <tr key={`mh-${managerId}`}>
                <td colSpan={selectedFields.length} className="border border-black text-center font-bold text-xs" style={{ padding: '2px 6px', backgroundColor: 'transparent' }}>
                  بيانات المدير المباشر
                </td>
              </tr>
            );
            managerRows.push(
              <tr key={`md-${managerId}`}>
                {selectedFields.map(key => (
                  <td key={key} className="border border-black text-center text-xs font-bold" style={{ padding: '2px 6px', backgroundColor: 'transparent' }}>
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
  }, [selectedEmployees, selectedFields, displayMode, groupedByManager, getFieldValue, getManagerWithCenters, assignmentGroups, mergeAssignmentPeriods]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" dir="rtl">
        <DialogHeader className="p-4 border-b sticky top-0 flex flex-row items-center justify-between">
          <DialogTitle>معاينة التقرير</DialogTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={onExport} className="bg-teal-600 hover:bg-teal-700">
              <FileOutput className="w-4 h-4 ml-1" />
              تصدير PDF
            </Button>
          </div>
        </DialogHeader>

        {/* مكوّن الصفحة - خلفية مستقلة لكل صفحة */}
        {(() => {
          const pageStyle = {
            fontFamily: "'Cairo', sans-serif",
            padding: '0 10mm 110px 10mm',
            minHeight: '297mm',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#fff',
          };

          const PageWrapper = ({ children, label }) => (
            <div style={{ marginBottom: 16 }}>
              {label && <div className="border-t-4 border-dashed border-sky-300 py-2 text-center text-xs text-sky-500 font-bold no-print">{label}</div>}
              <div style={pageStyle}>
                <img
                  src={MHC_ASSETS.officialLetterhead}
                  alt="الخلفية الرسمية"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  style={{ zIndex: 0 }}
                />
                <div className="relative" style={{ zIndex: 1 }}>
                  {/* ترويسة */}
                  <div style={{ height: 130, position: 'relative' }}>
                    {headerSideText && (
                      <div style={{ position: 'absolute', top: 35, right: 130, maxWidth: 380, textAlign: 'right', color: '#0B3D91', fontWeight: 700, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {headerSideText}
                      </div>
                    )}
                  </div>
                  {/* عنوان */}
                  <div className="text-center mb-5" style={{ marginTop: '60px' }}>
                    <h1 className="text-sm font-bold" style={{ color: '#0284c7' }}>{reportTitle}</h1>
                  </div>
                  {children}
                </div>
              </div>
            </div>
          );

          const signatureBlock = showSignature && (
            <div className={`mt-8 ${sigAlignClass}`}>
              {signerName && <p style={{ fontFamily: "'PT Sans Caption', 'Cairo', sans-serif", fontWeight: 700, color: '#000', fontSize: '18px' }}>{signerName}</p>}
              {signerTitle && <p style={{ fontWeight: 700, color: '#000', fontSize: '15px', marginTop: 0 }}>{signerTitle}</p>}
              {selectedSig && <TransparentSignatureImage src={selectedSig.image_url} alt={selectedSig.name} className={`max-h-24 ${signaturePosition === 'center' ? 'mx-auto' : ''} block`} style={{ marginTop: '-2px' }} />}
            </div>
          );

          const tableBlock = (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="border border-gray-800 px-2 py-1 text-center font-bold text-xs" style={{ color: '#0B3D91', backgroundColor: 'transparent' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{tableRows}</tbody>
              </table>
            </div>
          );

          if (splitPages) {
            return (
              <>
                {/* صفحة 1: النص التعبيري والتوقيع */}
                <PageWrapper>
                  {renderNarrative()}
                  {finalRequest && (
                    <div className="mt-4 p-3 border border-yellow-300 rounded-lg text-sm whitespace-pre-wrap">{finalRequest}</div>
                  )}
                  {signatureBlock}
                </PageWrapper>

                {/* صفحة 2: الجدول والتوقيع */}
                <PageWrapper label="— صفحة 2: الجدول —">
                  {tableBlock}
                  {signatureBlock}
                </PageWrapper>
              </>
            );
          }

          return (
            <PageWrapper>
              {narrativePosition === 'before' && renderNarrative()}
              {tableBlock}
              {narrativePosition === 'after' && renderNarrative("mt-4 text-sm")}
              {finalRequest && (
                <div className="mt-4 p-3 border border-yellow-300 rounded-lg text-sm whitespace-pre-wrap">{finalRequest}</div>
              )}
              {signatureBlock}
            </PageWrapper>
          );
        })()}
      </DialogContent>
    </Dialog>
  );
}