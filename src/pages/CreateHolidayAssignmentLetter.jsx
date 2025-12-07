import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Employee } from "@/entities/Employee";
import { HealthCenter } from "@/entities/HealthCenter";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Printer, Image as ImageIcon } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format, differenceInDays } from "date-fns";

export default function CreateHolidayAssignmentLetter() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [center, setCenter] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [holidayName, setHolidayName] = useState("عيد الفطر المبارك");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [logoUrl, setLogoUrl] = useState("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0cbac0660_.png");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [stampUrl, setStampUrl] = useState("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/aab919406_.png");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const centerId = params.get("centerId");
    const employeeIds = params.get("employeeIds")?.split(',') || [];
    
    if (centerId && employeeIds.length > 0) {
      loadData(centerId, employeeIds);
    } else {
      setIsLoading(false);
    }
  }, [location.search]);

  const loadData = async (centerId, employeeIds) => {
    setIsLoading(true);
    try {
      const [centerData, allEmployees] = await Promise.all([
        HealthCenter.get(centerId),
        Employee.list()
      ]);
      setCenter(centerData);
      
      const safeEmployees = Array.isArray(allEmployees) ? allEmployees : [];
      const selected = safeEmployees.filter(emp => employeeIds.includes(emp.id));
      setEmployees(selected);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async (file, setUrlFunc) => {
    if (!file) return;
    try {
      const result = await UploadFile({ file });
      setUrlFunc(result.file_url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("فشل رفع الملف");
    }
  };
  
  const duration = (startDate && endDate) ? differenceInDays(new Date(endDate), new Date(startDate)) + 1 : 0;

  if (isLoading) return <div className="p-6">جاري تحميل البيانات...</div>;
  if (!center || employees.length === 0) return <div className="p-6">بيانات غير كافية لإنشاء الخطاب.</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <style>{`
        @media print {
          body { margin: 0; } .no-print { display: none !important; }
          .print-area { box-shadow: none !important; margin: 0 !important; width: 100%; height: 100%; }
          .paper { width: 210mm; height: 297mm; margin: 0; padding: 15mm; page-break-after: always; }
        }
        .paper { width: 210mm; min-height: 297mm; }
      `}</style>
      
      <div className="no-print p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(createPageUrl(`HealthCenterDetails?id=${center.id}`))} size="icon">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">إصدار خطاب تكليف الأعياد</h1>
              <p className="text-gray-600">لمركز {center.اسم_المركز}</p>
            </div>
            <div className="mr-auto">
              <Button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700">
                <Printer className="w-4 h-4 ml-2" />
                طباعة / تحميل PDF
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader><CardTitle>إعدادات الخطاب</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>اسم الإجازة / العيد</Label>
                <Input value={holidayName} onChange={(e) => setHolidayName(e.target.value)} />
              </div>
              <div>
                <Label>تاريخ بداية التكليف</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>تاريخ نهاية التكليف</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
               <div>
                  <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> الشعار الرسمي</Label>
                  <Input type="file" onChange={(e) => handleFileUpload(e.target.files[0], setLogoUrl)} />
              </div>
              <div>
                  <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> صورة التوقيع</Label>
                  <Input type="file" onChange={(e) => handleFileUpload(e.target.files[0], setSignatureUrl)} />
              </div>
              <div>
                  <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> صورة الختم</Label>
                  <Input type="file" onChange={(e) => handleFileUpload(e.target.files[0], setStampUrl)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="print-area bg-white shadow-lg mx-auto paper p-12">
        <header className="flex justify-between items-start mb-8">
          <div className="w-2/3 text-center text-sm font-semibold leading-relaxed">
            <p>وزارة الصحة</p>
            <p>تجمع المدينة المنورة الصحي</p>
            <p>الرعاية الصحية الأولية بالمدينة المنورة</p>
            <p>إدارة المراكز الصحية بمحافظة الحناكية</p>
          </div>
          <div className="w-1/3 flex justify-end">
            {logoUrl && <img src={logoUrl} alt="شعار" className="w-32 h-auto" />}
          </div>
        </header>

        <div className="text-center mb-8">
          <h1 className="text-xl font-bold border-b-2 border-black inline-block pb-1">
            بيان بأسماء المكلفين بالعمل خلال إجازة {holidayName}
          </h1>
          <p>بمركز {center.اسم_المركز}</p>
        </div>

        <div className="mb-8">
          <table className="w-full border-collapse border-2 border-black text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black p-2 text-center font-bold">م</th>
                <th className="border border-black p-2 text-center font-bold">الاسم</th>
                <th className="border border-black p-2 text-center font-bold">الوظيفة</th>
                <th className="border border-black p-2 text-center font-bold">جهة العمل</th>
                <th className="border border-black p-2 text-center font-bold">عدد أيام التكليف</th>
                <th className="border border-black p-2 text-center font-bold">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, index) => (
                <tr key={emp.id}>
                  <td className="border border-black p-2 text-center">{index + 1}</td>
                  <td className="border border-black p-2 text-right">{emp.full_name_arabic}</td>
                  <td className="border border-black p-2 text-center">{emp.position}</td>
                  <td className="border border-black p-2 text-center">{emp.المركز_الصحي}</td>
                  <td className="border border-black p-2 text-center">
                    {duration} يوم
                  </td>
                  <td className="border border-black p-2 text-center">
                     {emp.nationality !== 'السعودية' ? 'غير سعودي' : ''}
                     {emp.nationality !== 'السعودية' && emp.contract_type !== 'خدمة مدنية' ? ' / ' : ''}
                     {emp.contract_type !== 'خدمة مدنية' ? 'تشغيل ذاتي' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm">
            وذلك اعتباراً من تاريخ {startDate ? format(new Date(startDate), "d/M/yyyy") : '...'}م
            حتى تاريخ {endDate ? format(new Date(endDate), "d/M/yyyy") : '...'}م
          </p>
        </div>

        <div className="flex justify-between items-end mt-20" style={{'page-break-inside': 'avoid'}}>
           <div>
                <p className="font-semibold text-center">يعتمد مدير شئون المراكز الصحية بالحناكية</p>
                <p className="font-semibold text-center">أ/ عبدالمجيد سعود الريقي</p>
           </div>
           <div className="text-center">
             {signatureUrl && <img src={signatureUrl} alt="توقيع" className="w-40 h-auto" />}
             {stampUrl && <img src={stampUrl} alt="ختم" className="w-40 h-auto" />}
           </div>
        </div>
      </div>
    </div>
  );
}