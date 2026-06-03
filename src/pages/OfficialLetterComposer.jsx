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

const A4_W = 794;
const A4_H = 1123;

export default function OfficialLetterComposer() {
  const { logoSettings, isLoaded } = useLogoSettings();


  const [rawText, setRawText] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [previewScale, setPreviewScale] = useState(1);

  const previewContainerRef = useRef(null);

  useEffect(() => {
    const update = () => {
      if (!previewContainerRef.current) return;
      const containerW = previewContainerRef.current.clientWidth - 8;
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
        prompt: `أعد تنسيق النص التالي كخطاب رسمي باللغة العربية الفصحى، مع الحفاظ على نفس المعنى والمحتوى تماماً. أعد فقط نص الفقرات دون أي تحية أو خاتمة.\n\nالنص:\n${rawText}`,
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
        prompt: `اكتب خطاباً رسمياً باللغة العربية الفصحى احترافياً. أعد فقط نص الفقرات الرئيسية بدون أي تحية افتتاحية أو خاتمة.\n\nالمحتوى:\n${rawText}`,
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
            <div className="bg-white rounded-xl shadow p-3 space-y-3">
              <h2 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2 text-sm">
                <Edit3 className="w-4 h-4" /> بيانات الخطاب
              </h2>

            </div>

            <div className="bg-white rounded-xl shadow p-3 space-y-3">
              <h2 className="font-bold text-gray-700 border-b pb-2 text-sm">محتوى الخطاب</h2>
              <Textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="اكتب أو الصق محتوى الخطاب هنا..."
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
                  ✓ تم إنشاء الخطاب بالذكاء الاصطناعي
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* منطقة المعاينة */}
        <div className="flex-1 min-w-0 overflow-hidden" ref={previewContainerRef}>
          {/* غلاف يضبط الارتفاع حسب scale */}
          <div style={{ height: A4_H * previewScale, width: '100%' }}>
            <div
              style={{
                width: A4_W,
                height: A4_H,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top right',
              }}
            >
              <div
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
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />

                {/* المحتوى — padding يوافق مساحة الهيدر والفوتر الموجودة بالخلفية */}
                <div style={{
                  position: 'relative', zIndex: 2,
                  padding: '180px 56px 120px 56px',
                  minHeight: A4_H,
                  display: 'flex', flexDirection: 'column',
                }}>



                  {/* تحية افتتاح */}
                  {displayBody && (
                    <div style={{ marginBottom: 24, fontSize: 15, color: '#1a1a1a', lineHeight: 1.8 }}>
                      السلام عليكم ورحمة الله وبركاته،
                    </div>
                  )}

                  {/* جسم الخطاب */}
                  <div style={{ 
                    flex: 1, 
                    fontSize: 15, 
                    lineHeight: 2, 
                    color: '#1a1a1a', 
                    whiteSpace: 'pre-wrap', 
                    textAlign: 'justify',
                    fontFamily: "'Cairo','Tajawal',sans-serif",
                    fontWeight: 400,
                    letterSpacing: '0.5px'
                  }}>
                    {displayBody ? (
                      displayBody.split('\n').map((para, i) => (
                        <p key={i} style={{ marginBottom: para.trim() ? 16 : 0 }}>
                          {para}
                        </p>
                      ))
                    ) : (
                      <span style={{ color: '#aaa', fontStyle: 'italic', fontSize: 14 }}>
                        أدخل محتوى الخطاب في لوحة التحرير...
                      </span>
                    )}
                  </div>

                  {/* خاتمة */}
                  {displayBody && (
                    <div style={{ marginTop: 28, marginBottom: 24, fontSize: 15, color: '#1a1a1a', lineHeight: 1.8 }}>
                      وتفضلوا بقبول وافر التحية والاحترام،،
                    </div>
                  )}

                  {/* توقيع */}
                  {displayBody && (
                    <div style={{ marginTop: 48, display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ textAlign: 'center', minWidth: 160 }}>
                        <div style={{ height: 56, borderBottom: '2px solid #333', marginBottom: 8 }} />
                        <div style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>التوقيع</div>
                      </div>
                    </div>
                  )}

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