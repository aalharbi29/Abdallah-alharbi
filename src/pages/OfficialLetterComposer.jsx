import React, { useState, useRef, useEffect } from 'react';
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

// ثوابت A4 بالـ px (96dpi)
const A4_W = 794; // 210mm
const A4_H = 1123; // 297mm

export default function OfficialLetterComposer() {
  const { logoSettings, isLoaded } = useLogoSettings();

  const [from, setFrom] = useState('مدير إدارة الموارد البشرية');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [letterDate, setLetterDate] = useState(today());
  const [rawText, setRawText] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [previewScale, setPreviewScale] = useState(1);

  const previewContainerRef = useRef(null);
  const printAreaRef = useRef(null);

  // حساب scale المعاينة ليناسب الشاشة
  useEffect(() => {
    const update = () => {
      if (!previewContainerRef.current) return;
      const containerW = previewContainerRef.current.clientWidth - 16;
      const scale = Math.min(1, containerW / A4_W);
      setPreviewScale(scale);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [showEditor]);

  const handleFormat = async () => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `أعد تنسيق النص التالي كخطاب رسمي باللغة العربية الفصحى، مع الحفاظ على نفس المعنى والمحتوى تماماً دون إضافة أو حذف أي معلومات. أعد فقط نص الفقرات دون مقدمة التحية أو الخاتمة لأنها ستضاف تلقائياً.\n\nالنص:\n${rawText}`,
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
        prompt: `اكتب خطاباً رسمياً باللغة العربية الفصحى بناءً على الموضوع التالي. يجب أن يكون الخطاب احترافياً ورسمياً بالكامل. أعد فقط نص الفقرات الرئيسية دون كتابة عبارات التحية في البداية أو الخاتمة لأنها ستضاف تلقائياً.\n\n${subject ? `موضوع الخطاب: ${subject}\n` : ''}المحتوى المطلوب:\n${rawText}`,
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
    printWindow.document.write(`<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>خطاب رسمي</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 0; }
    body { font-family: 'Cairo','Tajawal',Arial,sans-serif; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    #letter-print-area { width: 210mm; min-height: 297mm; position: relative; overflow: hidden; background: white; }
    @media print { html,body { width: 210mm; height: 297mm; } }
  </style>
</head>
<body>
  ${printContent.outerHTML}
  <script>
    window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 800); };
  <\/script>
</body>
</html>`);
    printWindow.document.close();
  };

  const displayBody = generatedBody || rawText;
  const logoSrc = isLoaded && logoSettings?.show_logo && logoSettings?.logo_url
    ? logoSettings.logo_url
    : MHC_ASSETS.logo;

  return (
    <div dir="rtl" style={{ fontFamily: MHC_FONT.family }} className="min-h-screen bg-gray-100">

      {/* شريط الأدوات */}
      <div className="no-print bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-bold text-gray-800 flex-1 truncate">📝 منشئ الخطابات الرسمية</h1>
          <Button variant="outline" size="sm" onClick={() => setShowEditor(!showEditor)} className="shrink-0 text-xs gap-1">
            {showEditor ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span className="hidden sm:inline">{showEditor ? 'إخفاء التحرير' : 'إظهار التحرير'}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="shrink-0 text-xs gap-1">
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">مسح</span>
          </Button>
          <Button size="sm" onClick={handlePrint} className="bg-blue-700 hover:bg-blue-800 text-white shrink-0 text-xs gap-1">
            <Printer className="w-3 h-3" />
            <span>طباعة</span>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 flex flex-col lg:flex-row gap-4">

        {/* لوحة التحرير */}
        {showEditor && (
          <div className="no-print w-full lg:w-80 xl:w-96 shrink-0 space-y-3">
            <div className="bg-white rounded-xl shadow p-3 sm:p-4 space-y-3">
              <h2 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2 text-sm">
                <Edit3 className="w-4 h-4" /> بيانات الخطاب
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">رقم الخطاب</Label>
                  <Input value={refNumber} onChange={e => setRefNumber(e.target.value)} placeholder="م/ص/١٢٣" className="text-xs h-8" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">التاريخ</Label>
                  <Input value={letterDate} onChange={e => setLetterDate(e.target.value)} placeholder="YYYY/MM/DD" className="text-xs h-8" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">من</Label>
                <Input value={from} onChange={e => setFrom(e.target.value)} placeholder="المرسِل" className="text-xs h-8" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">إلى</Label>
                <Input value={to} onChange={e => setTo(e.target.value)} placeholder="المرسَل إليه" className="text-xs h-8" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">الموضوع</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="موضوع الخطاب" className="text-xs h-8" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-3 sm:p-4 space-y-3">
              <h2 className="font-bold text-gray-700 border-b pb-2 text-sm">محتوى الخطاب</h2>
              <Textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="اكتب أو الصق موضوع الخطاب هنا..."
                className="text-xs min-h-[140px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8"
                  onClick={handleCompose}
                  disabled={isLoading || !rawText.trim()}
                >
                  <Wand2 className="w-3 h-3 ml-1" />
                  {isLoading ? 'جارٍ...' : 'صياغة كاملة'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-xs h-8"
                  onClick={handleFormat}
                  disabled={isLoading || !rawText.trim()}
                >
                  <AlignRight className="w-3 h-3 ml-1" />
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

        {/* منطقة المعاينة */}
        <div className="flex-1 min-w-0" ref={previewContainerRef}>
          <div
            style={{
              width: A4_W,
              height: A4_H,
              transform: `scale(${previewScale})`,
              transformOrigin: 'top right',
              marginBottom: `${(previewScale - 1) * A4_H}px`,
            }}
          >
            <div
              ref={printAreaRef}
              id="letter-print-area"
              style={{
                width: A4_W,
                minHeight: A4_H,
                position: 'relative',
                overflow: 'hidden',
                fontFamily: MHC_FONT.family,
                background: 'white',
                boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
              }}
            >
              {/* الخلفية الرسمية */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                backgroundImage: `url('${MHC_ASSETS.officialLetterhead}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />
              {/* طبقة شفافة */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.88)' }} />

              {/* المحتوى */}
              <div style={{
                position: 'relative', zIndex: 2,
                padding: '60px 56px 40px 56px',
                minHeight: A4_H,
                display: 'flex', flexDirection: 'column',
              }}>

                {/* هيدر */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  marginBottom: 24, borderBottom: '2px solid #1E63D6', paddingBottom: 16,
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>المملكة العربية السعودية</div>
                    <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>وزارة الصحة</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0B3D91' }}>تجمع المدينة المنورة الصحي</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={logoSrc} alt="الشعار" style={{ width: 72, height: 72, objectFit: 'contain' }} crossOrigin="anonymous" />
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>Kingdom of Saudi Arabia</div>
                    <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>Ministry of Health</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0B3D91' }}>Madinah Health Cluster</div>
                  </div>
                </div>

                {/* رقم وتاريخ */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, fontSize: 13 }}>
                  <div><span style={{ color: '#555' }}>التاريخ: </span><span style={{ fontWeight: 600 }}>{letterDate || '___________'}</span></div>
                  <div><span style={{ color: '#555' }}>الرقم: </span><span style={{ fontWeight: 600 }}>{refNumber || '___________'}</span></div>
                </div>

                {/* من / إلى */}
                <div style={{
                  border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 16px',
                  marginBottom: 18, background: 'rgba(241,248,255,0.8)', fontSize: 13,
                }}>
                  <div style={{ marginBottom: 5 }}>
                    <span style={{ color: '#0B3D91', fontWeight: 700, marginLeft: 8 }}>من:</span>
                    {from || '___________'}
                  </div>
                  <div>
                    <span style={{ color: '#0B3D91', fontWeight: 700, marginLeft: 8 }}>إلى:</span>
                    {to || '___________'}
                  </div>
                </div>

                {/* الموضوع */}
                {subject && (
                  <div style={{ marginBottom: 18, fontSize: 14, fontWeight: 700, borderRight: '4px solid #1E63D6', paddingRight: 12 }}>
                    الموضوع: {subject}
                  </div>
                )}

                {/* تحية الافتتاح */}
                {displayBody && (
                  <div style={{ marginBottom: 14, fontSize: 13, color: '#333' }}>
                    السلام عليكم ورحمة الله وبركاته،
                  </div>
                )}

                {/* جسم الخطاب */}
                <div style={{ flex: 1, fontSize: 14, lineHeight: 2.1, color: '#1a1a1a', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                  {displayBody || (
                    <span style={{ color: '#aaa', fontStyle: 'italic', fontSize: 13 }}>
                      أدخل موضوع الخطاب في لوحة التحرير واضغط على "صياغة كاملة" أو "تنسيق فقط"...
                    </span>
                  )}
                </div>

                {/* خاتمة */}
                {displayBody && (
                  <div style={{ marginTop: 24, fontSize: 13, color: '#333' }}>
                    وتفضلوا بقبول وافر التحية والاحترام،،،
                  </div>
                )}

                {/* توقيع */}
                {displayBody && (
                  <div style={{ marginTop: 36, display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'center', minWidth: 160 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 48, color: '#333' }}>{from || 'المرسِل'}</div>
                      <div style={{ borderTop: '1px solid #333', paddingTop: 5, fontSize: 12, color: '#555' }}>التوقيع</div>
                    </div>
                  </div>
                )}

                {/* فوتر */}
                <div style={{
                  marginTop: 'auto', paddingTop: 20,
                  borderTop: '1px solid #CBD5E1',
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 11, color: '#888',
                }}>
                  <span>تجمع المدينة المنورة الصحي — Madinah Health Cluster</span>
                  <span>{letterDate}</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0 !important; background: white !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>
    </div>
  );
}