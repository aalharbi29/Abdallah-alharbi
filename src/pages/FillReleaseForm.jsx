import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Printer, Download, Loader2, X, Stamp, PenTool, Move } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function FillReleaseForm() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const printRef = useRef(null);

  const [formData, setFormData] = useState({
    employeeName: "",
    position: "",
    positionNumber: "",
    nationality: "",
    idNumber: "",
    workPlace: "",
    gender: "ذكر", // ذكر أو أنثى
    // بيانات التوجيه
    recipientTitle: "مدير مستشفى الحسو العام",
    // بيانات القرار
    releaseDate: "",
    decisionNumber: "",
    decisionDate: "",
    assignedTo: "", // الجهة المكلف لها
    // بيانات الجهة المُرسِلة
    departmentName: "إدارة الموارد البشرية بالرعاية الأولية بتجمع المدينة المنورة",
    senderName: "أ.تركي بن عبدالرحمن الغامدي",
    senderTitle: "مدير إدارة الموارد البشرية بالرعاية الأولية"
  });

  // موضع كل سطر نصي بشكل مستقل (offset عمودي بالبكسل)
  const [lineOffsets, setLineOffsets] = useState({
    recipient: { x: 0, y: 0 },
    greeting: { x: 0, y: 0 },
    mainPara: { x: 0, y: 0 },
    closing: { x: 0, y: 0 },
    sender: { x: 0, y: 0 },
  });
  const [draggingLine, setDraggingLine] = useState(null);
  const [lineDragStart, setLineDragStart] = useState({ x: 0, y: 0, origX: 0, origY: 0 });

  const [systemStamps, setSystemStamps] = useState([]);
  const [systemSignatures, setSystemSignatures] = useState([]);
  const [stampSettings, setStampSettings] = useState({ showStamp: false, selectedStamp: null, position: { x: 400, y: 650 }, size: 100 });
  const [signatureSettings, setSignatureSettings] = useState({ showSignature: false, selectedSignature: null, position: { x: 350, y: 580 }, size: 120 });
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [processedImages, setProcessedImages] = useState({});

  useEffect(() => {loadData();loadStampsAndSignatures();}, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const employeesData = await base44.entities.Employee.list();
      setEmployees(employeesData || []);
    } catch (error) {
      toast.error("فشل في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStampsAndSignatures = async () => {
    try {
      const data = await base44.entities.StampSignature.list('-created_date', 50);
      const items = Array.isArray(data) ? data : [];
      setSystemStamps(items.filter((i) => i.type === 'stamp' && i.is_active !== false));
      setSystemSignatures(items.filter((i) => i.type === 'signature' && i.is_active !== false));
    } catch {}
  };

  const removeWhiteBackground = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] > 220 && d[i + 1] > 220 && d[i + 2] > 220) d[i + 3] = 0;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    });
  };

  useEffect(() => {
    const s = signatureSettings.selectedSignature;
    if (s && !processedImages[s.id]) {
      removeWhiteBackground(s.image_url).then((d) => setProcessedImages((p) => ({ ...p, [s.id]: d })));
    }
  }, [signatureSettings.selectedSignature]);

  useEffect(() => {
    const s = stampSettings.selectedStamp;
    if (s && !processedImages[s.id]) {
      removeWhiteBackground(s.image_url).then((d) => setProcessedImages((p) => ({ ...p, [s.id]: d })));
    }
  }, [stampSettings.selectedStamp]);

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    const rect = printRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = type === 'stamp' ? stampSettings.position : signatureSettings.position;
    setDragOffset({ x: e.clientX - rect.left - pos.x, y: e.clientY - rect.top - pos.y });
    setDragging(type);
  };

  const handleMouseMove = (e) => {
    if (!dragging || !printRef.current) return;
    const rect = printRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 80));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 80));
    if (dragging === 'stamp') setStampSettings((p) => ({ ...p, position: { x, y } }));else
    setSignatureSettings((p) => ({ ...p, position: { x, y } }));
  };

  const handleMouseUp = () => setDragging(null);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {window.removeEventListener('mousemove', handleMouseMove);window.removeEventListener('mouseup', handleMouseUp);};
    }
  }, [dragging, dragOffset]);

  // سحب الصفوف النصية
  const handleLineMouseDown = (e, lineKey) => {
    e.preventDefault();
    setDraggingLine(lineKey);
    setLineDragStart({ x: e.clientX, y: e.clientY, origX: lineOffsets[lineKey].x, origY: lineOffsets[lineKey].y });
  };

  const handleLineMoveGlobal = useCallback((e) => {
    if (!draggingLine) return;
    const dx = e.clientX - lineDragStart.x;
    const dy = e.clientY - lineDragStart.y;
    setLineOffsets((prev) => ({ ...prev, [draggingLine]: { x: lineDragStart.origX + dx, y: lineDragStart.origY + dy } }));
  }, [draggingLine, lineDragStart]);

  const handleLineUpGlobal = useCallback(() => setDraggingLine(null), []);

  useEffect(() => {
    if (draggingLine) {
      window.addEventListener('mousemove', handleLineMoveGlobal);
      window.addEventListener('mouseup', handleLineUpGlobal);
      return () => { window.removeEventListener('mousemove', handleLineMoveGlobal); window.removeEventListener('mouseup', handleLineUpGlobal); };
    }
  }, [draggingLine, handleLineMoveGlobal, handleLineUpGlobal]);

  const handleEmployeeSelect = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    setSelectedEmployee(emp);
    if (emp) {
      setFormData((prev) => ({
        ...prev,
        employeeName: emp.full_name_arabic || "",
        position: emp.position || "",
        positionNumber: emp.رقم_الموظف || "",
        nationality: emp.nationality || "",
        idNumber: emp.رقم_الهوية || "",
        workPlace: emp.المركز_الصحي || "",
        gender: emp.gender === 'أنثى' ? 'أنثى' : 'ذكر'
      }));
    }
  };

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    pdf.save(`إخلاء_طرف_${formData.employeeName || 'موظف'}.pdf`);
    toast.success("تم تصدير الملف بنجاح");
  };

  // تحديد الضمير بناءً على الجنس
  const isFemale = formData.gender === 'أنثى';
  const pronoun = isFemale ? 'ها' : 'ه';
  const employeeWord = isFemale ? 'الموظفة' : 'الموظف';
  const assignedWord = isFemale ? 'مكلفتها' : 'مكلفه';

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="mr-2">جاري تحميل البيانات...</span>
    </div>);


  const formStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
      body * { visibility: hidden; }
      .print-area, .print-area * { visibility: visible !important; }
      .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 210mm !important; height: 297mm !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
      .no-print { display: none !important; }
      @page { size: A4 portrait; margin: 0 !important; }
    }
    .ef { outline: none; min-width: 20px; display: inline-block; }
    .ef:focus { background-color: #e0f2fe; }
    @media screen { .ef:hover { background-color: #f0f9ff; } }
    .font-bold-title { font-family: 'Cairo', Arial, sans-serif; font-weight: 700; }
    .font-regular { font-family: 'Cairo', Arial, sans-serif; font-weight: 400; }
  `;

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <style>{formStyles}</style>

      {/* Controls Panel */}
      <div className="no-print max-w-4xl mx-auto mb-4 bg-white rounded-lg shadow p-4 space-y-3">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">نموذج إخلاء الطرف</h2>

        {/* Row 1 */}
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <Label className="text-xs">اختر الموظف</Label>
            <Select onValueChange={handleEmployeeSelect}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="اختر الموظف..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) =>
                <SelectItem key={emp.id} value={emp.id}>{emp.full_name_arabic}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">الجنس</Label>
            <Select value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ذكر">ذكر</SelectItem>
                <SelectItem value="أنثى">أنثى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1">
              <Printer className="w-4 h-4" /> طباعة
            </Button>
            <Button onClick={handleExportPDF} size="sm" className="gap-1 bg-red-600 hover:bg-red-700 text-white">
              <Download className="w-4 h-4" /> PDF
            </Button>
          </div>

          {/* زر الختم */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1"><Stamp className="w-4 h-4" />الختم</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader><DialogTitle>إعدادات الختم</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={stampSettings.showStamp}
                  onChange={(e) => setStampSettings((p) => ({ ...p, showStamp: e.target.checked, selectedStamp: e.target.checked && !p.selectedStamp && systemStamps[0] ? systemStamps[0] : p.selectedStamp }))}
                  className="w-4 h-4" />
                  <Label>إظهار الختم</Label>
                </div>
                {systemStamps.length > 0 ?
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {systemStamps.map((s) =>
                  <button key={s.id} onClick={() => setStampSettings((p) => ({ ...p, selectedStamp: s, showStamp: true }))}
                  className={`p-2 rounded border text-center ${stampSettings.selectedStamp?.id === s.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <img src={s.image_url} alt={s.name} className="w-10 h-10 object-contain mx-auto" />
                        <span className="text-xs truncate block">{s.name}</span>
                      </button>
                  )}
                  </div> :
                <p className="text-sm text-gray-500 text-center p-4">لا توجد أختام</p>}
                <div>
                  <Label className="text-xs">الحجم: {stampSettings.size}</Label>
                  <Slider value={[stampSettings.size]} onValueChange={(v) => setStampSettings((p) => ({ ...p, size: v[0] }))} min={40} max={250} step={5} />
                </div>
                <p className="text-xs text-gray-500">💡 اسحب الختم في المعاينة لتحريكه</p>
              </div>
            </DialogContent>
          </Dialog>

          {/* زر التوقيع */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1"><PenTool className="w-4 h-4" />التوقيع</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader><DialogTitle>إعدادات التوقيع</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={signatureSettings.showSignature}
                  onChange={(e) => setSignatureSettings((p) => ({ ...p, showSignature: e.target.checked, selectedSignature: e.target.checked && !p.selectedSignature && systemSignatures[0] ? systemSignatures[0] : p.selectedSignature }))}
                  className="w-4 h-4" />
                  <Label>إظهار التوقيع</Label>
                </div>
                {systemSignatures.length > 0 ?
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {systemSignatures.map((s) =>
                  <button key={s.id} onClick={() => setSignatureSettings((p) => ({ ...p, selectedSignature: s, showSignature: true }))}
                  className={`p-2 rounded border text-center ${signatureSettings.selectedSignature?.id === s.id ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'}`}>
                        <img src={s.image_url} alt={s.name} className="w-14 h-8 object-contain mx-auto" />
                        <span className="text-xs truncate block">{s.name}</span>
                      </button>
                  )}
                  </div> :
                <p className="text-sm text-gray-500 text-center p-4">لا توجد توقيعات</p>}
                <div>
                  <Label className="text-xs">الحجم: {signatureSettings.size}</Label>
                  <Slider value={[signatureSettings.size]} onValueChange={(v) => setSignatureSettings((p) => ({ ...p, size: v[0] }))} min={50} max={250} step={5} />
                </div>
                <p className="text-xs text-gray-500">💡 اسحب التوقيع في المعاينة لتحريكه</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Row 2 - بيانات القرار */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs">اسم الجهة / المستشفى المُوجَّه إليه</Label>
            <Input value={formData.recipientTitle} onChange={(e) => handleInputChange('recipientTitle', e.target.value)} placeholder="مدير مستشفى ..." />
          </div>
          <div>
            <Label className="text-xs">تاريخ الإخلاء</Label>
            <Input value={formData.releaseDate} onChange={(e) => handleInputChange('releaseDate', e.target.value)} placeholder="مثال: 15/7/1446هـ" />
          </div>
          <div>
            <Label className="text-xs">رقم القرار</Label>
            <Input value={formData.decisionNumber} onChange={(e) => handleInputChange('decisionNumber', e.target.value)} placeholder="رقم القرار" />
          </div>
          <div>
            <Label className="text-xs">تاريخ القرار</Label>
            <Input value={formData.decisionDate} onChange={(e) => handleInputChange('decisionDate', e.target.value)} placeholder="مثال: 10/6/1446هـ" />
          </div>
          <div>
            <Label className="text-xs">الجهة المكلف بها</Label>
            <Input value={formData.assignedTo} onChange={(e) => handleInputChange('assignedTo', e.target.value)} placeholder="اسم الجهة المكلف بها" />
          </div>
          <div>
            <Label className="text-xs">اسم الدائرة / الجهة المُرسِلة</Label>
            <Input value={formData.departmentName} onChange={(e) => handleInputChange('departmentName', e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">اسم المدير / المُوقِّع</Label>
            <Input value={formData.senderName} onChange={(e) => handleInputChange('senderName', e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">مسمى المدير</Label>
            <Input value={formData.senderTitle} onChange={(e) => handleInputChange('senderTitle', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Form Preview */}
      <div
        ref={printRef}
        className="print-area max-w-4xl mx-auto bg-white shadow-lg"
        style={{
          width: '210mm', minHeight: '297mm', padding: '0', margin: '0 auto',
          position: 'relative', boxSizing: 'border-box',
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/b6c7b20f8_ChatGPTImage1202605_58_03.png)',
          backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
        }}>

        {/* Header */}
        <div style={{ padding: '27mm 39mm 0 10mm', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <div className="font-bold-title ef"
          contentEditable suppressContentEditableWarning
          onBlur={(e) => handleInputChange('departmentName', e.currentTarget.textContent)}
          style={{ color: '#3498db', fontSize: '14px', borderRight: '3px solid #3498db', paddingRight: '10px', paddingTop: '2mm', paddingBottom: '2mm' }}>
            {formData.departmentName}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '0 12mm', marginTop: '32mm' }}>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 className="font-bold-title" style={{ fontSize: '18px', color: '#333', textDecoration: 'underline', textUnderlineOffset: '4px', margin: '0' }}>
              إخـلاء طـرف
            </h1>
          </div>

          {/* Employee Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
            <thead>
              <tr>
                <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>الاسم</th>
                <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>الوظيفة</th>
                <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>رقم الوظيفة</th>
                <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>الجنسية</th>
                <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>رقم الهوية</th>
                <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>جهة العمل</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #888', padding: '10px 6px', textAlign: 'center', fontFamily: 'Cairo,Arial', fontWeight: 500 }}>
                  <span className="ef" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('employeeName', e.currentTarget.textContent)}>{formData.employeeName || '\u00A0'}</span>
                </td>
                <td style={{ border: '1px solid #888', padding: '10px 6px', textAlign: 'center', fontFamily: 'Cairo,Arial', fontWeight: 500 }}>
                  <span className="ef" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('position', e.currentTarget.textContent)}>{formData.position || '\u00A0'}</span>
                </td>
                <td style={{ border: '1px solid #888', padding: '10px 6px', textAlign: 'center', fontFamily: 'Cairo,Arial', fontWeight: 500 }}>
                  <span className="ef" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('positionNumber', e.currentTarget.textContent)}>{formData.positionNumber || '\u00A0'}</span>
                </td>
                <td style={{ border: '1px solid #888', padding: '10px 6px', textAlign: 'center', fontFamily: 'Cairo,Arial', fontWeight: 500 }}>
                  <span className="ef" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('nationality', e.currentTarget.textContent)}>{formData.nationality || '\u00A0'}</span>
                </td>
                <td style={{ border: '1px solid #888', padding: '10px 6px', textAlign: 'center', fontFamily: 'Cairo,Arial', fontWeight: 500 }}>
                  <span className="ef" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('idNumber', e.currentTarget.textContent)}>{formData.idNumber || '\u00A0'}</span>
                </td>
                <td style={{ border: '1px solid #888', padding: '10px 6px', textAlign: 'center', fontFamily: 'Cairo,Arial', fontWeight: 500 }}>
                  <span className="ef" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('workPlace', e.currentTarget.textContent)}>{formData.workPlace || '\u00A0'}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Body Text */}
          <div style={{ fontSize: '13px', lineHeight: '2.2', fontFamily: 'Cairo,Arial', position: 'relative' }}>

            {/* Recipient line - draggable */}
            <div
              style={{ transform: `translate(${lineOffsets.recipient.x}px, ${lineOffsets.recipient.y}px)`, cursor: draggingLine === 'recipient' ? 'grabbing' : 'grab', userSelect: 'none', marginBottom: '4px' }}
              onMouseDown={(e) => handleLineMouseDown(e, 'recipient')}
            >
              <p className="font-bold-title no-print-drag" style={{ margin: 0, padding: '2px 0' }}>
                <span className="no-print" style={{ fontSize: '10px', color: '#aaa', marginLeft: '4px' }}>↕</span>
                المكرم{' '}
                <span className="ef" contentEditable suppressContentEditableWarning
                  onMouseDown={(e) => e.stopPropagation()}
                  onBlur={(e) => handleInputChange('recipientTitle', e.currentTarget.textContent)}
                  style={{ padding: '0 4px', minWidth: '120px', display: 'inline-block' }}>
                  {formData.recipientTitle}
                </span>
                {'  '}المحترم
              </p>
            </div>

            {/* Greeting - draggable */}
            <div
              style={{ transform: `translate(${lineOffsets.greeting.x}px, ${lineOffsets.greeting.y}px)`, cursor: draggingLine === 'greeting' ? 'grabbing' : 'grab', userSelect: 'none', marginBottom: '12px' }}
              onMouseDown={(e) => handleLineMouseDown(e, 'greeting')}
            >
              <p className="font-bold-title" style={{ margin: 0, padding: '2px 0' }}>
                <span className="no-print" style={{ fontSize: '10px', color: '#aaa', marginLeft: '4px' }}>↕</span>
                السلام عليكم ورحمة الله وبركاته ،،،
              </p>
            </div>

            {/* Main Paragraph - draggable */}
            <div
              style={{ transform: `translateY(${lineOffsets.mainPara}px)`, cursor: draggingLine === 'mainPara' ? 'grabbing' : 'grab', userSelect: 'none', marginBottom: '8px' }}
              onMouseDown={(e) => handleLineMouseDown(e, 'mainPara')}
            >
              <p className="font-bold-title" style={{ textAlign: 'justify', margin: 0, padding: '4px 0' }}>
                <span className="no-print" style={{ fontSize: '10px', color: '#aaa', marginLeft: '4px' }}>↕</span>
                نفيدكم بأنه تم إخلاء طرف {employeeWord} الموضحة بياناتـ{pronoun} أعلاه يوم{' '}
                <span className="ef" contentEditable suppressContentEditableWarning
                  onMouseDown={(e) => e.stopPropagation()}
                  onBlur={(e) => handleInputChange('releaseDate', e.currentTarget.textContent)}
                  style={{ borderBottom: '1px dotted #333', padding: '0 5px', minWidth: '100px', display: 'inline-block' }}>
                  {formData.releaseDate || '...............'}
                </span>
                {' '}وذلك بناءً على القرار رقم{' '}
                <span className="ef" contentEditable suppressContentEditableWarning
                  onMouseDown={(e) => e.stopPropagation()}
                  onBlur={(e) => handleInputChange('decisionNumber', e.currentTarget.textContent)}
                  style={{ borderBottom: '1px dotted #333', padding: '0 5px', minWidth: '80px', display: 'inline-block' }}>
                  {formData.decisionNumber || '..........'}
                </span>
                {' '}وتاريخ{' '}
                <span className="ef" contentEditable suppressContentEditableWarning
                  onMouseDown={(e) => e.stopPropagation()}
                  onBlur={(e) => handleInputChange('decisionDate', e.currentTarget.textContent)}
                  style={{ borderBottom: '1px dotted #333', padding: '0 5px', minWidth: '100px', display: 'inline-block' }}>
                  {formData.decisionDate || '...............'}
                </span>
                {' '}والقاضي بتكليف{pronoun}{' '}
                <span className="ef" contentEditable suppressContentEditableWarning
                  onMouseDown={(e) => e.stopPropagation()}
                  onBlur={(e) => handleInputChange('assignedTo', e.currentTarget.textContent)}
                  style={{ borderBottom: '1px dotted #333', padding: '0 5px', minWidth: '120px', display: 'inline-block' }}>
                  {formData.assignedTo || '...........................'}
                </span>
                {' '}.
              </p>
            </div>

            {/* Closing - draggable */}
            <div
              style={{ transform: `translateY(${lineOffsets.closing}px)`, cursor: draggingLine === 'closing' ? 'grabbing' : 'grab', userSelect: 'none', marginBottom: '20px' }}
              onMouseDown={(e) => handleLineMouseDown(e, 'closing')}
            >
              <p className="font-bold-title" style={{ margin: 0, padding: '2px 0' }}>
                <span className="no-print" style={{ fontSize: '10px', color: '#aaa', marginLeft: '4px' }}>↕</span>
                نرجو التكرم بالاطلاع وإكمال اللازم .
              </p>
            </div>

            {/* Sender - draggable */}
            <div
              style={{ transform: `translateY(${lineOffsets.sender}px)`, cursor: draggingLine === 'sender' ? 'grabbing' : 'grab', userSelect: 'none', textAlign: 'center', marginTop: '10px' }}
              onMouseDown={(e) => handleLineMouseDown(e, 'sender')}
            >
              <span className="no-print" style={{ fontSize: '10px', color: '#aaa' }}>↕</span>
              <p className="font-bold-title ef" contentEditable suppressContentEditableWarning
                onMouseDown={(e) => e.stopPropagation()}
                onBlur={(e) => handleInputChange('senderName', e.currentTarget.textContent)}
                style={{ fontSize: '15px', margin: '0 0 6px 0' }}>
                {formData.senderName}
              </p>
              <p className="font-bold-title ef" contentEditable suppressContentEditableWarning
                onMouseDown={(e) => e.stopPropagation()}
                onBlur={(e) => handleInputChange('senderTitle', e.currentTarget.textContent)}
                style={{ fontSize: '12px', color: '#444', margin: 0 }}>
                {formData.senderTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '10mm', display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="font-bold-title" style={{ color: '#3498db', fontSize: '14px' }}>تجمع المدينة المنورة الصحي</div>
            <div className="font-bold-title" style={{ color: '#3498db', fontSize: '13px' }}>Madinah Health Cluster</div>
            <div className="font-regular" style={{ color: '#888', fontSize: '10px' }}>Empowered by Health Holding co.</div>
          </div>
        </div>

        {/* الختم */}
        {stampSettings.showStamp && stampSettings.selectedStamp &&
        <div className={`absolute cursor-grab select-none no-print-drag ${dragging === 'stamp' ? 'ring-2 ring-blue-500 rounded' : ''}`}
        style={{ left: stampSettings.position.x, top: stampSettings.position.y, zIndex: 50 }}
        onMouseDown={(e) => handleMouseDown(e, 'stamp')}>
            <img src={processedImages[stampSettings.selectedStamp.id] || stampSettings.selectedStamp.image_url} alt="الختم"
          style={{ width: stampSettings.size, opacity: 0.9, pointerEvents: 'none' }} draggable={false} />
            <div className="no-print absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-blue-500">
              <Move className="w-3 h-3" />
            </div>
          </div>
        }

        {/* التوقيع */}
        {signatureSettings.showSignature && signatureSettings.selectedSignature &&
        <div className={`absolute cursor-grab select-none no-print-drag ${dragging === 'signature' ? 'ring-2 ring-green-500 rounded' : ''}`}
        style={{ left: signatureSettings.position.x, top: signatureSettings.position.y, zIndex: 50, mixBlendMode: 'multiply' }}
        onMouseDown={(e) => handleMouseDown(e, 'signature')}>
            <img src={processedImages[signatureSettings.selectedSignature.id] || signatureSettings.selectedSignature.image_url} alt="التوقيع"
          style={{ width: signatureSettings.size, opacity: 0.9, pointerEvents: 'none', display: 'block' }} draggable={false} />
            <div className="no-print absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-green-500">
              <Move className="w-3 h-3" />
            </div>
          </div>
        }
      </div>
    </div>);

}