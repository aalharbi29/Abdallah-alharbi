import React, { useRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { User, Phone, Mail, Calendar, Hash, Briefcase, Download, Share2, Printer, QrCode, Building2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MHC_COLORS, MHC_GRADIENTS, MHC_ASSETS, MHC_TEXTS } from '@/components/branding/madinahCluster';
import BackgroundToggle from '@/components/branding/BackgroundToggle';
import { useBrandBackground } from '@/components/branding/useBrandBackground';

const copyToClipboard = async (value, label) => {
  const text = value !== undefined && value !== null ? String(value) : '';
  if (!text || text === '-') return;
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label ? `تم نسخ ${label}` : 'تم النسخ', { duration: 1500 });
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast.success(label ? `تم نسخ ${label}` : 'تم النسخ', { duration: 1500 });
    } catch {
      toast.error('تعذّر النسخ');
    }
    document.body.removeChild(ta);
  }
};

const InfoRow = ({ icon: Icon, iconColor, label, labelColor, value, valueColor, valueClass = '' }) => {
  if (!value) return null;
  return (
    <div
      className="flex items-start gap-2 py-1.5 border-b border-gray-100 cursor-pointer hover:bg-blue-50/60 rounded px-1 -mx-1 transition-colors group"
      onClick={() => copyToClipboard(value, label)}
      title={`نسخ ${label}`}
    >
      <Icon className={`w-3.5 h-3.5 ${iconColor} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className={`text-[10px] ${labelColor}`}>{label}</div>
        <div className={`text-xs font-bold ${valueColor} ${valueClass}`}>{value}</div>
      </div>
      <Copy className="w-3 h-3 text-gray-300 group-hover:text-blue-600 mt-1 flex-shrink-0 transition-colors print-hide" />
    </div>
  );
};

export default function EmployeeIDCard({ employee, onClose }) {
  const cardRef = useRef(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const { enabled: bgEnabled } = useBrandBackground('id_card', true);

  useEffect(() => {
    generateQRCode();
  }, [employee]);

  const generateQRCode = async () => {
    try {
      const profileUrl = `${window.location.origin}/EmployeeProfile?id=${employee.id}`;
      const qrData = await QRCode.toDataURL(profileUrl, {
        width: 300,
        margin: 2,
        color: { dark: MHC_COLORS.navy, light: '#ffffff' }
      });
      setQrCodeDataUrl(qrData);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handlePrint = () => {
    const printContent = cardRef.current;
    const printWindow = window.open('', '', 'width=600,height=800');
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>بطاقة تعريف - ${employee.full_name_arabic}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Cairo', sans-serif; }
            body { padding: 20px; }
            @page { size: A5; margin: 0; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownload = async () => {
    try {
      const element = cardRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // إنشاء PDF بحجم البطاقة مع طبقة نص خفية قابلة للنسخ
      const imgWidth = 85; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [imgWidth, imgHeight] });

      // 1) خلفية البطاقة كصورة (للمظهر البصري)
      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, imgWidth, imgHeight);

      // 2) طبقة نص شفافة فوق الصورة — قابلة للتحديد والنسخ من قارئ PDF
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(0.1);
      const lines = [
        `الاسم: ${employee.full_name_arabic || ''}`,
        `التخصص: ${employee.position || ''}`,
        `رقم الهوية: ${employee.رقم_الهوية || ''}`,
        `رقم الموظف: ${employee.رقم_الموظف || ''}`,
        employee.birth_date ? `تاريخ الميلاد: ${format(new Date(employee.birth_date), 'dd/MM/yyyy')}` : '',
        employee.phone ? `الجوال: ${employee.phone}` : '',
        employee.email ? `البريد: ${employee.email}` : '',
        `المركز: ${employee.المركز_الصحي || ''}`,
      ].filter(Boolean);
      let y = 5;
      lines.forEach((line) => {
        pdf.text(line, 2, y);
        y += 3;
      });

      pdf.save(`بطاقة_تعريف_${employee.full_name_arabic || 'موظف'}.pdf`);
    } catch (error) {
      console.error('خطأ في حفظ البطاقة:', error);
      alert('حدث خطأ في حفظ البطاقة');
    }
  };

  const handleWhatsAppShare = () => {
    const text = `*بطاقة تعريف موظف*

📋 *الاسم:* ${employee.full_name_arabic || 'غير محدد'}
💼 *التخصص:* ${employee.position || 'غير محدد'}
🆔 *رقم الهوية:* ${employee.رقم_الهوية || 'غير محدد'}
🔢 *رقم الموظف:* ${employee.رقم_الموظف || 'غير محدد'}
${employee.birth_date ? `🎂 *تاريخ الميلاد:* ${format(new Date(employee.birth_date), 'dd/MM/yyyy')}\n` : ''}${employee.phone ? `📱 *الجوال:* ${employee.phone}\n` : ''}${employee.email ? `📧 *البريد:* ${employee.email}\n` : ''}
🏥 *المركز:* ${employee.المركز_الصحي || 'غير محدد'}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSystemShare = async () => {
    try {
      const element = cardRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      const file = new File([blob], `بطاقة_تعريف_${employee.full_name_arabic || 'موظف'}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `بطاقة تعريف - ${employee.full_name_arabic}`,
          text: `بطاقة تعريف الموظف: ${employee.full_name_arabic}`,
          files: [file]
        });
      } else {
        alert('المشاركة غير مدعومة في هذا المتصفح. استخدم خيار "حفظ كصورة" بدلاً من ذلك.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      if (error.name === 'AbortError') {
        return;
      }
      alert('فشلت عملية المشاركة. حاول استخدام خيار "حفظ كصورة".');
    }
  };

  if (!employee) return null;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .id-card-print, .id-card-print * { visibility: visible; }
          .id-card-print {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          .print-actions { display: none !important; }
          @page { size: auto; margin: 10mm; }
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="relative w-full max-w-[340px]" onClick={(e) => e.stopPropagation()}>
          {/* أزرار الإجراءات */}
          <div className="print-actions flex gap-2 mb-4 justify-center flex-wrap">
            <BackgroundToggle storageKey="id_card" size="sm" />
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 ml-2" />
              حفظ PDF
            </Button>
            <Button
              onClick={handleSystemShare}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة
            </Button>
            <Button
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              size="sm"
            >
              <Share2 className="w-4 h-4 ml-2" />
              واتساب
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              إغلاق
            </Button>
          </div>

          {/* البطاقة - بهوية تجمع المدينة المنورة الصحي - حجم مصغر */}
          <div
            ref={cardRef}
            className="id-card-print rounded-2xl shadow-2xl overflow-hidden w-full relative"
            style={{
              width: '85mm',
              maxWidth: '320px',
              fontFamily: "'Tajawal','Cairo',sans-serif",
              backgroundColor: '#ffffff',
              backgroundImage: bgEnabled ? `url('${MHC_ASSETS.backgroundCardSlide}')` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {bgEnabled && (
              <div className="absolute inset-0 bg-white/80 pointer-events-none" aria-hidden="true" />
            )}
            <div className="relative z-10">
            {/* Header مع تدرّج الهوية الرسمية + الشعار */}
            <div className="text-white p-3 relative overflow-hidden" style={{ background: MHC_GRADIENTS.primary }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-12 -mt-12"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>

              <div className="relative z-10 flex items-center gap-2">
                <div className="bg-white/95 p-1 rounded-lg flex-shrink-0 shadow-md">
                  <img src={MHC_ASSETS.logo} alt="شعار التجمع" className="w-9 h-9 object-contain" crossOrigin="anonymous" />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-[10px] opacity-90 leading-tight">{MHC_TEXTS.arabicName}</div>
                  <div className="text-[9px] opacity-75 leading-tight">{MHC_TEXTS.englishName}</div>
                  <div className="text-xs font-bold tracking-wide mt-0.5">بطاقة تعريف الموظف</div>
                </div>
              </div>
            </div>

            {/* Employee Photo */}
            <div className="flex justify-center -mt-7 mb-2 relative z-20">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-white" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)' }}>
                <User className="w-8 h-8" style={{ color: MHC_COLORS.navy }} />
              </div>
            </div>

            {/* Employee Name & Position */}
            <div className="text-center px-3 mb-2">
              <h2
                className="text-base font-bold mb-0.5 cursor-pointer hover:text-blue-600 transition-colors"
                style={{ color: MHC_COLORS.ink }}
                onClick={() => copyToClipboard(employee.full_name_arabic, 'الاسم')}
                title="نسخ الاسم"
              >
                {employee.full_name_arabic}
              </h2>
              <p
                className="text-xs font-medium cursor-pointer hover:underline"
                style={{ color: MHC_COLORS.blueAccent }}
                onClick={() => copyToClipboard(employee.position, 'التخصص')}
                title="نسخ التخصص"
              >
                {employee.position || 'غير محدد'}
              </p>
            </div>

            {/* Information Grid - كل صف قابل للنسخ بالنقر */}
            <div className="px-3 pb-3 space-y-0.5">
              <InfoRow
                icon={Hash}
                iconColor="text-gray-500"
                label="رقم الهوية"
                labelColor="text-gray-500"
                value={employee.رقم_الهوية}
                valueColor="text-gray-900"
                valueClass="truncate"
              />
              <InfoRow
                icon={Briefcase}
                iconColor="text-blue-600"
                label="رقم الموظف"
                labelColor="text-blue-600 font-medium"
                value={employee.رقم_الموظف}
                valueColor="text-blue-800"
                valueClass="truncate"
              />
              {employee.birth_date && (
                <InfoRow
                  icon={Calendar}
                  iconColor="text-gray-500"
                  label="تاريخ الميلاد"
                  labelColor="text-gray-500"
                  value={format(new Date(employee.birth_date), 'dd/MM/yyyy', { locale: ar })}
                  valueColor="text-gray-900"
                />
              )}
              <InfoRow
                icon={Phone}
                iconColor="text-green-600"
                label="رقم الجوال"
                labelColor="text-green-600 font-medium"
                value={employee.phone}
                valueColor="text-green-800"
                valueClass="direction-ltr text-right"
              />
              <InfoRow
                icon={Mail}
                iconColor="text-gray-500"
                label="البريد الإلكتروني"
                labelColor="text-gray-500"
                value={employee.email}
                valueColor="text-gray-900"
                valueClass="break-all text-[10px]"
              />
            </div>

            {/* QR Code and Footer - بألوان الهوية */}
            <div className="px-3 py-2.5" style={{ background: 'linear-gradient(135deg, #F1F8FF 0%, #E0F2FE 100%)', borderTop: `2px solid ${MHC_COLORS.tealLight}` }}>
              <div className="flex items-center justify-between gap-2">
                {/* QR Code */}
                {qrCodeDataUrl && (
                  <div className="bg-white p-1 rounded-lg shadow-sm" style={{ border: `1px solid ${MHC_COLORS.skyLight}` }}>
                    <img src={qrCodeDataUrl} alt="QR" className="w-12 h-12" />
                  </div>
                )}

                {/* Center Info */}
                <div
                  className="flex-1 text-right cursor-pointer hover:bg-white/50 rounded p-1 -m-1 transition-colors"
                  onClick={() => copyToClipboard(employee.المركز_الصحي, 'المركز الصحي')}
                  title="نسخ اسم المركز"
                >
                  <div className="flex items-center gap-1 justify-end mb-0.5">
                    <span className="text-[11px] font-bold" style={{ color: MHC_COLORS.ink }}>{employee.المركز_الصحي || 'غير محدد'}</span>
                    <Building2 className="w-3.5 h-3.5" style={{ color: MHC_COLORS.blueAccent }} />
                  </div>
                  <div className="text-[9px]" style={{ color: MHC_COLORS.inkSoft }}>
                    {MHC_TEXTS.arabicName} • {new Date().toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}