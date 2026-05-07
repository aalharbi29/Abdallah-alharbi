import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Download, ArrowRight, FileText, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { base44 } from '@/api/base44Client';

import ChickenpoxPdfTemplatePage from '@/components/chickenpox/ChickenpoxPdfTemplatePage';
import { convertPDFToImages } from '@/functions/convertPDFToImages';

const CHICKENPOX_TEMPLATE_URL = 'https://media.base44.com/files/public/68af5003813e47bd07947b30/8e484cbb7_1.pdf';

export default function FillChickenpoxForm() {
  // بيانات الفقرة الأولى - الاستقصاء الوبائي
  const [investigation, setInvestigation] = useState({
    notification_date: { d: '', m: '', y: '' },
    investigation_date: { d: '', m: '', y: '' },
    investigator_name: '',
    job: '',
    workplace: '',
    sector: '',
    health_center: '',
    region: '',
    // بيانات المريض
    patient_name: '',
    father_name: '',
    grandfather_name: '',
    family_name: '',
    national_id: '',
    birth_d: '', birth_m: '', birth_y: '',
    age: '',
    age_unit: '',
    gender: '',
    nationality: '',
    resident_count: '',
    non_saudi_count: '',
    occupation: '',
    occupation_other: '',
    social_status: '',
    home_phone: '',
    work_phone: '',
    mobile_phone: '',
    address: '',
    village: '',
    city: '',
    region_address: '',
    // التنويم
    hospitalized: '',
    hospital_name: '',
    file_number: '',
    symptoms_d: '', symptoms_m: '', symptoms_y: '',
    initial_diagnosis_d: '', initial_diagnosis_m: '', initial_diagnosis_y: '',
    final_diagnosis_d: '', final_diagnosis_m: '', final_diagnosis_y: '',
    admission_d: '', admission_m: '', admission_y: '',
    discharge_d: '', discharge_m: '', discharge_y: '',
    discharge_status: '',
    // الإبلاغ
    outbreak_link: '',
    outbreak_d: '', outbreak_m: '', outbreak_y: '',
    case_from_outside: '',
    case_type: '',
    // الإكلينيكية
    skin_rash: '',
    rash_start_d: '', rash_start_m: '', rash_start_y: '',
    rash_duration: '',
    rash_location: '',
    rash_severity: '',
    fever: '',
    max_temp: '',
    fever_duration: '',
    // المضاعفات
    pneumonia: '',
    encephalitis: '',
    rhinitis: '',
    skin_infection: '',
    thrombocytopenia: '',
    other_complications: '',
    other_complications_text: '',
  });

  // بيانات الفقرة الثانية - التحصين والمختبر
  const [vaccination, setVaccination] = useState({
    vaccinated: '',
    no_vaccine_reason: '',
    first_dose_d: '', first_dose_m: '', first_dose_y: '',
    first_dose_type: '',
    first_dose_product: '',
    second_dose_d: '', second_dose_m: '', second_dose_y: '',
    second_dose_type: '',
    second_dose_product: '',
    third_dose_d: '', third_dose_m: '', third_dose_y: '',
    third_dose_type: '',
    third_dose_product: '',
    doses_before_year: '',
    doses_after_year: '',
    vaccine_type: '',
    vaccine_product: '',
    // المختبر
    lab_test: '',
    igm_date_d: '', igm_date_m: '', igm_date_y: '',
    igm_result: '',
    igg_acute_d: '', igg_acute_m: '', igg_acute_y: '',
    igg_recovery_d: '', igg_recovery_m: '', igg_recovery_y: '',
    igg_result: '',
    other_tests: '',
    test_type: '',
    // الوبائية
    infection_source: '',
    related_outbreak: '',
    related_to_other_case: '',
    pregnant: '',
    pregnancy_week: '',
    // تعريفية
    father_name_id: '',
    phone_id: '',
    mother_name: '',
    notes: '',
  });

  // بيانات الفقرة الثالثة - المخالطين
  const [contacts, setContacts] = useState({
    patient_name: '',
    investigation_number: '',
    center_name: '',
    rows: Array(10).fill(null).map(() => ({
      name: '',
      gender: '',
      age: '',
      national_id: '',
      mobile: '',
      relation: '',
      action: '',
    })),
    investigator_name: '',
    investigator_mobile: '',
    signature_date: '',
  });

  const printRef = useRef(null);
  const [templateImages, setTemplateImages] = useState([]);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      setIsLoadingTemplate(true);
      const response = await convertPDFToImages({ fileUrl: CHICKENPOX_TEMPLATE_URL, format: 'png', quality: 100 });
      const images = response?.data?.images || [];
      setTemplateImages(images.map((img) => img.downloadUrl || img.imageDataUrl));
      setIsLoadingTemplate(false);
    };
    loadTemplate();
  }, []);

  const updateContactRow = (index, field, value) => {
    const newRows = [...contacts.rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setContacts({ ...contacts, rows: newRows });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    toast.info('جاري إنشاء ملف PDF...');
    try {
      // .a4-page فقط - يستثني .guidelines-page
      const pages = printRef.current.querySelectorAll('.a4-page');
      const pdf = new jsPDF('p', 'mm', 'a4');
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      pdf.save(`استمارة_جديري_مائي_${investigation.patient_name || 'حالة'}.pdf`);
      toast.success('تم الحفظ');
    } catch (e) {
      console.error(e);
      toast.error('فشل التصدير');
    }
  };

  const handleSaveToArchive = async () => {
    if (!printRef.current) return;
    toast.info('جاري الحفظ في الأرشيف...');
    try {
      // .a4-page فقط - يستثني .guidelines-page
      const pages = printRef.current.querySelectorAll('.a4-page');
      const pdf = new jsPDF('p', 'mm', 'a4');
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      const blob = pdf.output('blob');
      const file = new File([blob], `جديري_مائي_${investigation.patient_name || 'حالة'}.pdf`, { type: 'application/pdf' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.ArchivedFile.create({
        title: `استمارة استقصاء جديري مائي - ${investigation.patient_name || 'حالة'}`,
        description: `تاريخ: ${new Date().toLocaleDateString('ar-SA')}`,
        category: 'other',
        file_url,
        file_name: file.name,
        tags: ['جديري مائي', 'استقصاء وبائي', investigation.patient_name].filter(Boolean),
      });
      toast.success('تم الحفظ في الأرشيف');
    } catch (e) {
      console.error(e);
      toast.error('فشل الحفظ');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
          .a4-page { 
            width: 210mm !important; 
            height: 297mm !important; 
            page-break-after: always !important; 
            margin: 0 !important;
            box-shadow: none !important;
          }
          .a4-page:last-child { page-break-after: auto !important; }
          .guidelines-page { display: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-blue-600" />
              استمارة استقصاء وبائي - الجديري المائي
            </h1>
            <p className="text-sm text-gray-600 mt-1">فقرتان: استقصاء وبائي + حصر المخالطين</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/InteractiveForms">
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة
              </Button>
            </Link>
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700" size="sm">
              <Printer className="w-4 h-4 ml-1" /> طباعة
            </Button>
            <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700" size="sm">
              <Download className="w-4 h-4 ml-1" /> تصدير PDF
            </Button>
            <Button onClick={handleSaveToArchive} className="bg-emerald-600 hover:bg-emerald-700" size="sm">
              <Save className="w-4 h-4 ml-1" /> حفظ في الأرشيف
            </Button>
          </div>
        </div>

        {/* Preview / Print area */}
        <Card>
          <CardHeader className="no-print pb-3">
            <CardTitle className="text-base">معاينة النموذج المطابق للملف الأصلي 100%</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-4">
            <div ref={printRef} className="print-area flex flex-col items-center gap-6 bg-gray-100 p-4 rounded">

              {isLoadingTemplate ? (
                <div className="no-print flex items-center justify-center p-10 text-gray-600">
                  جاري تحميل النموذج الأصلي...
                </div>
              ) : (
                <>
                  {templateImages.slice(0, 3).map((imageUrl, index) => (
                    <ChickenpoxPdfTemplatePage
                      key={index}
                      imageUrl={imageUrl}
                      pageNumber={index + 1}
                      printable
                    />
                  ))}

                  {templateImages[3] && (
                    <div className="no-print" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          position: 'absolute',
                          top: '-30px',
                          right: 0,
                          left: 0,
                          textAlign: 'center',
                          fontSize: '12px',
                          color: '#666',
                          fontWeight: 600,
                        }}>
                          صفحة إرشادات للعرض فقط - لا تُطبع ولا تُصدّر ولا تُحفظ
                        </div>
                        <ChickenpoxPdfTemplatePage
                          imageUrl={templateImages[3]}
                          pageNumber={4}
                          printable={false}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}