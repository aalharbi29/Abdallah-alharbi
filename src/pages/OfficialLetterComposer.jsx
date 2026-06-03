import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MHC_ASSETS, MHC_FONT } from '@/components/branding/madinahCluster';
import useLogoSettings from '@/components/settings/useLogoSettings';
import { Wand2, AlignRight, Printer, RotateCcw, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

export default function OfficialLetterComposer() {
  const { logoSettings, isLoaded } = useLogoSettings();

  // حقول الخطاب
  const [from, setFrom] = useState('مدير إدارة الموارد البشرية');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [letterDate, setLetterDate] = useState(today());
  const [rawText, setRawText] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const printRef = useRef();

  const hasContent = generatedBody || rawText;

  const handleFormat = async () => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `أعد تنسيق النص التالي كخطاب رسمي باللغة العربية الفصحى، مع الحفاظ على نفس المعنى والمحتوى تماماً دون إضافة أو حذف أي معلومات. أعد فقط نص الفقرات دون مقدمة التحية أو الخاتمة لأنها ستضاف تلقائياً.

النص:
${rawText}`,
        response_json_schema: { type: 'object', properties: { body: { type: 'string' } } }
      });
      setGeneratedBody(res.body || rawText);
    } catch (e) {
      setGeneratedBody(rawText);
    }
    setIsLoading(false);
  };

  const handleCompose = async () => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `اكتب خطاباً رسمياً باللغة العربية الفصحى بناءً على الموضوع التالي. يجب أن يكون الخطاب احترافياً ورسمياً بالكامل. أعد فقط نص الفقرات الرئيسية دون كتابة عبارات التحية في البداية أو الخاتمة لأنها ستضاف تلقائياً.

${subject ? `موضوع الخطاب: ${subject}` : ''}
المحتوى المطلوب:
${rawText}`,
        response_json_schema: { type: 'object', properties: { body: { type: 'string' } } }
      });
      setGeneratedBody(res.body || rawText);
    } catch (e) {
      setGeneratedBody(rawText);
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setGeneratedBody('');
    setRawText('');
    setSubject('');
    setTo('');
    setRefNumber('');
    setLetterDate(today());
  };

  const handlePrint = () => {
    const printContent = document.getElementById('letter-print-area');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8"/>
        <title>خطاب رسمي</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"/>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            font-family: 'Cairo', 'Tajawal', Arial, sans-serif;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #letter-print-area {
            width: 210mm;
            min-height: 297mm;
            position: relative;
            overflow: hidden;
            background: white;
          }
          @media print {
            html, body { width: 210mm; height: 297mm; }
            #letter-print-area { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 800);
          };
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const displayBody = generatedBody || rawText;

  return (
    <div dir="rtl" style={{ fontFamily: MHC_FONT.family }} className="min-h-screen bg-gray-100">

      {/* شريط الأدوات - لا يظهر عند الطباعة */}
      <div className="no-print bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-base sm:text-lg font-bold text-gray-800 flex-1 min-w-0 truncate">📝 منشئ الخطابات الرسمية</h1>
          <Button variant="outline" size="sm" onClick={() => setShowHeader(!showHeader)} className="text-xs sm:text-sm px-2 sm:px-3">
            {showHeader ? <ChevronUp className="w-4 h-4 sm:ml-1" /> : <ChevronDown className="w-4 h-4 sm:ml-1" />}
            <span className="hidden sm:inline">{showHeader ? 'إخفاء لوحة التحرير' : 'إظهار لوحة التحرير'}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="text-xs sm:text-sm px-2 sm:px-3">
            <RotateCcw className="w-4 h-4 sm:ml-1" />
            <span className="hidden sm:inline">مسح</span>
          </Button>
          <Button size="sm" onClick={handlePrint} className="bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm px-2 sm:px-3">
            <Printer className="w-4 h-4 sm:ml-1" />
            <span className="hidden sm:inline">طباعة الخطاب</span>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 sm:gap-6">

        {/* لوحة الإدخال - لا تظهر عند الطباعة */}
        {showHeader && (
          <div className="no-print w-full lg:w-96 shrink-0 space-y-4">

            <div className="bg-white rounded-xl shadow p-4 space-y-3">
              <h2 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> بيانات الخطاب
              </h2>

              <div>
                <Label className="text-xs text-gray-600 mb-1 block">رقم الخطاب</Label>
                <Input value={refNumber} onChange={e => setRefNumber(e.target.value)} placeholder="مثال: م/ص/٢٠٢٦/١٢٣" className="text-sm" />
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-1 block">التاريخ</Label>
                <Input value={letterDate} onChange={e => setLetterDate(e.target.value)} placeholder="YYYY/MM/DD" className="text-sm" />
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-1 block">من</Label>
                <Input value={from} onChange={e => setFrom(e.target.value)} placeholder="المرسِل" className="text-sm" />
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-1 block">إلى</Label>
                <Input value={to} onChange={e => setTo(e.target.value)} placeholder="المرسَل إليه" className="text-sm" />
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-1 block">الموضوع</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="موضوع الخطاب" className="text-sm" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 space-y-3">
              <h2 className="font-bold text-gray-700 border-b pb-2">محتوى الخطاب</h2>
              <Textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="اكتب أو الصق موضوع الخطاب هنا..."
                className="text-sm min-h-[180px] resize-none"
              />

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-sm"
                  onClick={handleCompose}
                  disabled={isLoading || !rawText.trim()}
                >
                  <Wand2 className="w-4 h-4 ml-1" />
                  {isLoading ? 'جارٍ الصياغة...' : 'صياغة كاملة'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={handleFormat}
                  disabled={isLoading || !rawText.trim()}
                >
                  <AlignRight className="w-4 h-4 ml-1" />
                  {isLoading ? '...' : 'تنسيق فقط'}
                </Button>
              </div>

              {generatedBody && (
                <Badge variant="outline" className="text-emerald-700 border-emerald-300 text-xs">
                  ✓ تم إنشاء الخطاب بواسطة الذكاء الاصطناعي
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* معاينة الخطاب */}
        <div className="flex-1 overflow-x-auto">
          <div ref={printRef} id="letter-print-area" className="bg-white shadow-xl mx-auto"
            style={{
              width: '210mm',
              minWidth: '210mm',
              minHeight: '297mm',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: MHC_FONT.family,
            }}
          >
            {/* الخلفية الرسمية */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0,
              backgroundImage: `url('${MHC_ASSETS.officialLetterhead}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }} />

            {/* طبقة شفافة بيضاء */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.88)' }} />

            {/* المحتوى */}
            <div style={{ position: 'relative', zIndex: 2, padding: '28mm 20mm 20mm 20mm', minHeight: '297mm', display: 'flex', flexDirection: 'column' }}>

              {/* هيدر الخطاب */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm', borderBottom: '2px solid #1E63D6', paddingBottom: '4mm' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.6 }}>المملكة العربية السعودية</div>
                  <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.6 }}>وزارة الصحة</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0B3D91' }}>تجمع المدينة المنورة الصحي</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {isLoaded && logoSettings?.show_logo && logoSettings?.logo_url ? (
                    <img src={logoSettings.logo_url} alt="الشعار" style={{ width: '64px', height: '64px', objectFit: 'contain' }} crossOrigin="anonymous" />
                  ) : (
                    <img src={MHC_ASSETS.logo} alt="الشعار" style={{ width: '64px', height: '64px', objectFit: 'contain' }} crossOrigin="anonymous" />
                  )}
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.6 }}>Kingdom of Saudi Arabia</div>
                  <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.6 }}>Ministry of Health</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0B3D91' }}>Madinah Health Cluster</div>
                </div>
              </div>

              {/* رقم وتاريخ */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6mm', fontSize: '12px' }}>
                <div><span style={{ color: '#555' }}>التاريخ: </span><span style={{ fontWeight: 600 }}>{letterDate || '___________'}</span></div>
                <div><span style={{ color: '#555' }}>الرقم: </span><span style={{ fontWeight: 600 }}>{refNumber || '___________'}</span></div>
              </div>

              {/* من / إلى */}
              <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', marginBottom: '6mm', background: 'rgba(241,248,255,0.8)', fontSize: '12px' }}>
                <div style={{ marginBottom: '4px' }}><span style={{ color: '#0B3D91', fontWeight: 700, marginLeft: '8px' }}>من:</span>{from || '___________'}</div>
                <div><span style={{ color: '#0B3D91', fontWeight: 700, marginLeft: '8px' }}>إلى:</span>{to || '___________'}</div>
              </div>

              {/* الموضوع */}
              {subject && (
                <div style={{ marginBottom: '6mm', fontSize: '13px', fontWeight: 700, borderRight: '4px solid #1E63D6', paddingRight: '10px' }}>
                  الموضوع: {subject}
                </div>
              )}

              {/* تحية الافتتاح */}
              {displayBody && (
                <div style={{ marginBottom: '5mm', fontSize: '12px', color: '#333' }}>
                  السلام عليكم ورحمة الله وبركاته،
                </div>
              )}

              {/* جسم الخطاب */}
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 2, color: '#1a1a1a', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                {displayBody || (
                  <span style={{ color: '#aaa', fontStyle: 'italic' }}>
                    أدخل موضوع الخطاب في لوحة التحرير واضغط على "صياغة كاملة" أو "تنسيق فقط"...
                  </span>
                )}
              </div>

              {/* خاتمة */}
              {displayBody && (
                <div style={{ marginTop: '8mm', fontSize: '12px', color: '#333' }}>
                  وتفضلوا بقبول وافر التحية والاحترام،،،
                </div>
              )}

              {/* توقيع */}
              {displayBody && (
                <div style={{ marginTop: '12mm', display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'center', minWidth: '140px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '16mm', color: '#333' }}>{from || 'المرسِل'}</div>
                    <div style={{ borderTop: '1px solid #333', paddingTop: '4px', fontSize: '11px', color: '#555' }}>التوقيع</div>
                  </div>
                </div>
              )}

              {/* فوتر */}
              <div style={{ marginTop: 'auto', paddingTop: '8mm', borderTop: '1px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                <span>تجمع المدينة المنورة الصحي — Madinah Health Cluster</span>
                <span>{letterDate}</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* CSS الطباعة - للطباعة المباشرة من المتصفح */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0 !important; background: white !important; }
          #letter-print-area {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
          }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>
    </div>
  );
}