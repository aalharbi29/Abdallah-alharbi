import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Move } from 'lucide-react';
import OfficialLetterHeader from '@/components/official/OfficialLetterHeader';
import OfficialFooter from '@/components/common/OfficialFooter';

export default function EmployeeIntroductionPreview({
  letterRef,
  signatureAreaRef,
  selectedEmployee,
  letterSettings,
  additionalFields,
  letterTemplates,
  signatureSettings,
  stampSettings,
  directorPosition,
  dragging,
  handleMouseDown,
}) {
  const visibleAdditionalFields = additionalFields.filter((f) => f.label && f.value);

  return (
    <div
      ref={letterRef}
      className="print-area bg-white p-8 md:p-12 min-h-[1000px] relative letter-content"
      style={{ direction: 'rtl' }}
    >
      <OfficialLetterHeader arabicDepartment="إدارة المراكز الصحية بالحناكية" englishDepartment="Al-Hanakiyah Health Centers" />

      <div className="flex justify-between mb-6 text-sm">
        <div>
          <p>الرقم: {letterSettings.letterNumber || '..................'}</p>
          <p>التاريخ: {new Date(letterSettings.letterDate).toLocaleDateString('ar-SA')}</p>
        </div>
        <div className="text-left">
          <p>المرفقات: لا يوجد</p>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-green-800 underline decoration-2 underline-offset-8">
          {letterTemplates[letterSettings.letterType]?.title || letterSettings.letterType}
        </h2>
      </div>

      <div className="mb-6">
        <p className="font-bold text-lg">{letterSettings.recipient}</p>
        <p className="text-gray-600">السلام عليكم ورحمة الله وبركاته،،،</p>
      </div>

      {selectedEmployee ? (
        <div className="mb-6 bg-gray-50 p-3 rounded-lg border">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-1.5 font-bold text-center" style={{ width: '15%' }}>الاسم:</td>
                <td className="py-1.5 text-center" colSpan={3}>{selectedEmployee.full_name_arabic}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1.5 font-bold text-center" style={{ width: '15%' }}>رقم الهوية:</td>
                <td className="py-1.5 text-center" style={{ width: '35%' }}>{selectedEmployee.رقم_الهوية || 'غير محدد'}</td>
                <td className="py-1.5 font-bold text-center" style={{ width: '15%' }}>الرقم الوظيفي:</td>
                <td className="py-1.5 text-center" style={{ width: '35%' }}>{selectedEmployee.رقم_الموظف || 'غير محدد'}</td>
              </tr>
              <tr className={visibleAdditionalFields.length > 0 ? 'border-b' : ''}>
                <td className="py-1.5 font-bold text-center">الوظيفة:</td>
                <td className="py-1.5 text-center">{selectedEmployee.position || 'غير محدد'}</td>
                <td className="py-1.5 font-bold text-center">جهة العمل:</td>
                <td className="py-1.5 text-center">{selectedEmployee.المركز_الصحي || 'إدارة المراكز الصحية'}</td>
              </tr>
              {visibleAdditionalFields.map((field, index) => (
                <tr key={index} className={index < visibleAdditionalFields.length - 1 ? 'border-b' : ''}>
                  <td className="py-1.5 font-bold text-center">{field.label}:</td>
                  <td className="py-1.5 text-center" colSpan={3}>{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Alert className="mb-6">
          <AlertDescription>الرجاء اختيار موظف من القائمة</AlertDescription>
        </Alert>
      )}

      <div className="mb-4 leading-8 text-justify">
        <p>
          نفيدكم بأن الموضحة بياناته أعلاه أحد منسوبي إدارة المراكز الصحية بالحناكية، ويعمل بوظيفة ({selectedEmployee?.position || '............'}) وذلك اعتباراً من ({letterSettings.workStartDate ? new Date(letterSettings.workStartDate).toLocaleDateString('ar-SA') : '............'}) ولا يزال على رأس العمل حتى تاريخه.
        </p>
      </div>

      <div className="mb-4 leading-8 text-justify">
        <p>
          وقد أُعطي هذا الخطاب بناءً على طلبه دون أدنى مسؤولية على الجهة المصدرة.
        </p>
      </div>

      <div className="mb-12 text-center">
        <p>وتقبلوا وافر التحية والتقدير،،،</p>
      </div>

      <div ref={signatureAreaRef} className="relative" style={{ height: '200px', cursor: dragging ? 'grabbing' : 'default' }}>
        <div
          className={`absolute text-center cursor-grab select-none ${dragging === 'director' ? 'ring-2 ring-blue-500 bg-blue-50/50 rounded' : 'hover:ring-2 hover:ring-gray-300 hover:bg-gray-50/50 rounded'}`}
          style={{ left: `${directorPosition.x}px`, top: `${directorPosition.y}px`, padding: '4px 8px' }}
          onMouseDown={(e) => handleMouseDown(e, 'director')}
        >
          <p className="font-bold text-lg">{signatureSettings.selectedSignature?.owner_name || letterSettings.directorName}</p>
          <p className="text-gray-600">{signatureSettings.selectedSignature?.owner_title || letterSettings.directorTitle}</p>
          <Move className="w-3 h-3 text-gray-400 mx-auto mt-1 no-print" />
        </div>

        {signatureSettings.showSignature && signatureSettings.selectedSignature && (
          <div
            className={`absolute cursor-grab select-none ${dragging === 'signature' ? 'ring-2 ring-green-500 rounded' : 'hover:ring-2 hover:ring-green-300 rounded'}`}
            style={{ left: `${signatureSettings.signaturePosition.x - 60}px`, top: `${signatureSettings.signaturePosition.y - 530}px` }}
            onMouseDown={(e) => handleMouseDown(e, 'signature')}
          >
            <img
              src={signatureSettings.selectedSignature.image_url}
              alt="التوقيع"
              style={{ width: `${signatureSettings.signatureSize}px`, opacity: 0.9 }}
              draggable={false}
            />
            <Move className="w-3 h-3 text-green-400 mx-auto mt-1 no-print" />
          </div>
        )}

        {stampSettings.showStamp && stampSettings.selectedStamp && (
          <div
            className={`absolute cursor-grab select-none ${dragging === 'stamp' ? 'ring-2 ring-blue-500 rounded-full' : 'hover:ring-2 hover:ring-blue-300 rounded-full'}`}
            style={{ left: `${stampSettings.stampPosition.x - 50}px`, top: `${stampSettings.stampPosition.y - 600}px` }}
            onMouseDown={(e) => handleMouseDown(e, 'stamp')}
          >
            <img
              src={stampSettings.selectedStamp.image_url}
              alt="الختم"
              style={{ width: `${stampSettings.stampSize}px`, opacity: 0.85 }}
              draggable={false}
            />
            <Move className="w-3 h-3 text-blue-400 mx-auto mt-1 no-print" />
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-8 right-8">
        <OfficialFooter />
      </div>
    </div>
  );
}