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
}) {
  const dateStr = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const logoJustifyClass = logoPosition === 'right' ? 'justify-end' : logoPosition === 'left' ? 'justify-start' : 'justify-center';
  const sigAlignClass = signaturePosition === 'right' ? 'text-right' : signaturePosition === 'left' ? 'text-left' : 'text-center';

  const tableRows = useMemo(() => {
    const rows = [];
    if (displayMode === 'normal') {
      selectedEmployees.forEach((emp, idx) => {
        rows.push(
          <tr key={emp.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
            {selectedFields.map(key => (
              <td key={key} className="border border-gray-300 px-3 py-2 text-center text-xs">
                {getFieldValue(emp, key)}
              </td>
            ))}
          </tr>
        );
      });
    } else {
      selectedEmployees.forEach(emp => {
        rows.push(
          <tr key={`emp-${emp.id}`} style={{ backgroundColor: '#dbeafe' }}>
            {selectedFields.map(key => (
              <td key={key} className="border border-gray-300 px-3 py-2 text-center text-xs font-medium">
                {getFieldValue(emp, key)}
              </td>
            ))}
          </tr>
        );
      });
      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            rows.push(
              <tr key={`mh-${managerId}`} style={{ backgroundColor: '#d1fae5' }}>
                <td colSpan={selectedFields.length} className="border border-gray-300 px-3 py-2 text-center font-bold text-xs">
                  بيانات المدير المباشر
                </td>
              </tr>
            );
            rows.push(
              <tr key={`md-${managerId}`} style={{ backgroundColor: '#ecfdf5' }}>
                {selectedFields.map(key => (
                  <td key={key} className="border border-gray-300 px-3 py-2 text-center text-xs">
                    {getFieldValue(manager, key)}
                  </td>
                ))}
              </tr>
            );
            processedManagers.add(managerId);
          }
        }
      });
    }
    return rows;
  }, [selectedEmployees, selectedFields, displayMode, groupedByManager, getFieldValue, getManagerWithCenters]);

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
            <div className={`flex ${logoJustifyClass} items-center border-b-2 border-blue-800 pb-2 mb-4`}>
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
            <h1 className="text-lg font-bold text-teal-700">{reportTitle}</h1>
          </div>

          {/* نص تعبيري قبل الجدول */}
          {narrativePosition === 'before' && reportNarrative && (
            <div className="mb-4 text-sm leading-relaxed whitespace-pre-wrap">
              {reportNarrative.split('\n').map((line, i) => {
                const keywords = ['سعادة', 'المكرم', 'المكرمة', 'مدير', 'إدارة', 'الإدارة', 'دائرة', 'الدائرة', 'قسم', 'القسم'];
                const hasKeyword = keywords.some(kw => line.includes(kw));
                return (
                  <span key={i} className={hasKeyword ? 'block font-bold' : 'block font-semibold'} style={hasKeyword ? { fontFamily: "'PT Sans Caption', 'Cairo', sans-serif", fontWeight: 700, fontSize: '14px' } : {}}>
                    {line}
                  </span>
                );
              })}
            </div>
          )}

          {/* الجدول */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="bg-teal-700 text-white border border-gray-300 px-3 py-2 text-center font-bold text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
          </div>

          {/* نص تعبيري بعد الجدول */}
          {narrativePosition === 'after' && reportNarrative && (
            <div className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">
              {reportNarrative.split('\n').map((line, i) => {
                const keywords = ['سعادة', 'المكرم', 'المكرمة', 'مدير', 'إدارة', 'الإدارة', 'دائرة', 'الدائرة', 'قسم', 'القسم'];
                const hasKeyword = keywords.some(kw => line.includes(kw));
                return (
                  <span key={i} className={hasKeyword ? 'block font-bold' : 'block font-semibold'} style={hasKeyword ? { fontFamily: "'PT Sans Caption', 'Cairo', sans-serif", fontWeight: 700, fontSize: '14px' } : {}}>
                    {line}
                  </span>
                );
              })}
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
              {selectedSig && (
                <img 
                  src={selectedSig.image_url} 
                  alt={selectedSig.name}
                  className={`max-h-24 ${signaturePosition === 'center' ? 'mx-auto' : ''} block`}
                />
              )}
              {signerName && <p className="font-bold text-blue-800 text-sm mt-2">{signerName}</p>}
              {signerTitle && <p className="text-gray-600 text-xs mt-0.5">{signerTitle}</p>}
            </div>
          )}

          {/* تذييل */}
          {logoSettings.show_footer && (
            <div className="mt-8 pt-3 border-t-2 border-blue-800 text-center">
              {logoSettings.footer_text_1 && <p className="font-bold text-blue-800 text-sm">{logoSettings.footer_text_1}</p>}
              {logoSettings.footer_text_2 && <p className="text-blue-800 text-sm">{logoSettings.footer_text_2}</p>}
              <p className="text-blue-800 text-xs mt-2">{dateStr}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}