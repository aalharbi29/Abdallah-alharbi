import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Download, FileCheck2, Printer, Save } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import EmployeeSearchCombobox from '@/components/employees/EmployeeSearchCombobox';
import DeliveryRecordPreview from '@/components/delivery_record/DeliveryRecordPreview';

const createEmptyItems = () => Array.from({ length: 5 }, () => ({ quantity: '', batchNumber: '', expiryDate: '', notes: '' }));

export default function FillDeliveryRecordForm() {
  const [employees, setEmployees] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [deliveredBy, setDeliveredBy] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [items, setItems] = useState(createEmptyItems);
  const [recordDate, setRecordDate] = useState({ day: '', month: '', year: '' });
  const [deliveredDate, setDeliveredDate] = useState({ day: '', month: '', year: '' });
  const [receivedDate, setReceivedDate] = useState({ day: '', month: '', year: '' });

  const printRef = useRef(null);
  const scalerRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const updateScale = () => {
      if (!scalerRef.current) return;
      setPreviewScale(scalerRef.current.offsetWidth / 794);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const loadData = async () => {
    const [employeeData, centerData] = await Promise.all([
      base44.entities.Employee.list('-updated_date', 1000),
      base44.entities.HealthCenter.list('اسم_المركز', 1000),
    ]);
    setEmployees(Array.isArray(employeeData) ? employeeData : []);
    setCenters(Array.isArray(centerData) ? centerData : []);
  };

  const selectedCenter = useMemo(
    () => centers.find((center) => center.id === selectedCenterId) || null,
    [centers, selectedCenterId]
  );

  useEffect(() => {
    if (!selectedCenter || receiver) return;
    const managerId = selectedCenter['المدير'];
    const manager = employees.find((emp) => emp.id === managerId || emp['رقم_الموظف'] === managerId);
    if (manager) setReceiver(manager);
  }, [selectedCenter, employees, receiver]);

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    toast.info('جاري إنشاء ملف PDF...');
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save(`محضر_تسليم_${selectedCenter?.اسم_المركز || 'مركز'}.pdf`);
    toast.success('تم تصدير PDF');
  };

  const handlePrint = () => window.print();

  const handleSaveToCenter = async () => {
    if (!selectedCenter) {
      toast.error('اختر المركز أولاً');
      return;
    }
    toast.info('جاري حفظ المحضر...');
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    const file = new File([pdf.output('blob')], 'محضر_تسليم.pdf', { type: 'application/pdf' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.CenterDocument.create({
      health_center_id: selectedCenter.id,
      health_center_name: selectedCenter['اسم_المركز'],
      title: 'محضر تسليم لقاح كوفيد-19',
      document_title: 'محضر تسليم لقاح كوفيد-19',
      document_type: 'other',
      file_url,
      file_name: file.name,
    });
    toast.success('تم حفظ المحضر في ملفات المركز');
  };

  const previewData = {
    center: selectedCenter,
    deliveredBy,
    receiver,
    items,
    recordDay: recordDate.day,
    recordMonth: recordDate.month,
    recordYear: recordDate.year,
    deliveredDay: deliveredDate.day,
    deliveredMonth: deliveredDate.month,
    deliveredYear: deliveredDate.year,
    receivedDay: receivedDate.day,
    receivedMonth: receivedDate.month,
    receivedYear: receivedDate.year,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6" dir="rtl">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area, .preview-scaler { position: static !important; width: auto !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; display: block !important; }
          .preview-page { transform: none !important; position: fixed !important; top: 0 !important; right: 0 !important; width: 210mm !important; height: 297mm !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-4">
        <div className="no-print flex items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 md:text-3xl">
              <FileCheck2 className="h-7 w-7 text-blue-700" />
              محضر تسليم
            </h1>
            <p className="mt-1 text-sm text-gray-600">محضر تفاعلي مطابق للمرفق مع تعبئة المركز والمدير والمسلم والمستلم من النظام</p>
          </div>
          <Link to="/InteractiveForms">
            <Button variant="outline" size="sm"><ArrowRight className="ml-2 h-4 w-4" />العودة</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
          <Card className="no-print">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">بيانات المحضر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>المركز الصحي</Label>
                <select value={selectedCenterId} onChange={(e) => { setSelectedCenterId(e.target.value); setReceiver(null); }} className="mt-1 h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
                  <option value="">اختر المركز</option>
                  {centers.map((center) => <option key={center.id} value={center.id}>{center['اسم_المركز']}</option>)}
                </select>
                {selectedCenter && <div className="mt-2 rounded-md bg-blue-50 p-2 text-xs text-blue-900">سيتم تعبئة اسم المركز ومدير المركز تلقائياً عند توفره.</div>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">يوم المحضر</Label><Input value={recordDate.day} onChange={(e) => setRecordDate({ ...recordDate, day: e.target.value })} /></div>
                <div><Label className="text-xs">الشهر</Label><Input value={recordDate.month} onChange={(e) => setRecordDate({ ...recordDate, month: e.target.value })} /></div>
                <div><Label className="text-xs">السنة بعد 14</Label><Input value={recordDate.year} onChange={(e) => setRecordDate({ ...recordDate, year: e.target.value })} /></div>
              </div>

              <div className="border-t pt-3">
                <Label className="font-bold">المسلم</Label>
                <div className="mt-1"><EmployeeSearchCombobox employees={employees} onSelect={setDeliveredBy} buttonClassName="w-full" /></div>
              </div>

              <div className="border-t pt-3">
                <Label className="font-bold">المستلم / مدير المركز</Label>
                <div className="mt-1"><EmployeeSearchCombobox employees={employees} onSelect={setReceiver} buttonClassName="w-full" /></div>
                {receiver && <div className="mt-2 rounded-md bg-emerald-50 p-2 text-xs text-emerald-900">المستلم: {receiver.full_name_arabic}</div>}
              </div>

              <div className="border-t pt-3">
                <Label className="font-bold">بيانات الكميات</Label>
                <div className="mt-2 space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="rounded-md border p-2">
                      <div className="mb-2 text-xs font-bold text-gray-600">السطر {index + 1}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="الكمية" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
                        <Input placeholder="رقم التشغيلة" value={item.batchNumber} onChange={(e) => updateItem(index, 'batchNumber', e.target.value)} />
                        <Input placeholder="تاريخ الانتهاء" value={item.expiryDate} onChange={(e) => updateItem(index, 'expiryDate', e.target.value)} />
                        <Input placeholder="ملاحظات" value={item.notes} onChange={(e) => updateItem(index, 'notes', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t pt-3">
                <div><Label className="text-xs">يوم التسليم</Label><Input value={deliveredDate.day} onChange={(e) => setDeliveredDate({ ...deliveredDate, day: e.target.value })} /></div>
                <div><Label className="text-xs">الشهر</Label><Input value={deliveredDate.month} onChange={(e) => setDeliveredDate({ ...deliveredDate, month: e.target.value })} /></div>
                <div><Label className="text-xs">السنة</Label><Input value={deliveredDate.year} onChange={(e) => setDeliveredDate({ ...deliveredDate, year: e.target.value })} /></div>
                <div><Label className="text-xs">يوم الاستلام</Label><Input value={receivedDate.day} onChange={(e) => setReceivedDate({ ...receivedDate, day: e.target.value })} /></div>
                <div><Label className="text-xs">الشهر</Label><Input value={receivedDate.month} onChange={(e) => setReceivedDate({ ...receivedDate, month: e.target.value })} /></div>
                <div><Label className="text-xs">السنة</Label><Input value={receivedDate.year} onChange={(e) => setReceivedDate({ ...receivedDate, year: e.target.value })} /></div>
              </div>

              <div className="flex flex-wrap gap-2 border-t pt-3">
                <Button onClick={handlePrint} size="sm" className="bg-blue-700 hover:bg-blue-800"><Printer className="ml-1 h-4 w-4" />طباعة</Button>
                <Button onClick={handleExportPDF} size="sm" className="bg-red-600 hover:bg-red-700"><Download className="ml-1 h-4 w-4" />PDF</Button>
                <Button onClick={handleSaveToCenter} size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={!selectedCenter}><Save className="ml-1 h-4 w-4" />حفظ بالمركز</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="no-print pb-3"><CardTitle className="text-base">معاينة النموذج</CardTitle></CardHeader>
            <CardContent>
              <DeliveryRecordPreview printRef={printRef} scalerRef={scalerRef} previewScale={previewScale} data={previewData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}