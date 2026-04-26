import React, { useRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { User, Phone, Mail, Calendar, Hash, Briefcase, Download, Share2, Printer, QrCode, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { MHC_COLORS, MHC_GRADIENTS, MHC_ASSETS, MHC_TEXTS } from '@/components/branding/madinahCluster';
import BackgroundToggle from '@/components/branding/BackgroundToggle';
import { useBrandBackground } from '@/components/branding/useBrandBackground';

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

      const link = document.createElement('a');
      link.download = `بطاقة_تعريف_${employee.full_name_arabic || 'موظف'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
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
        <div className="relative w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
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
              حفظ كصورة
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

          {/* البطاقة - بهوية تجمع المدينة المنورة الصحي */}
          <div
            ref={cardRef}
            className="id-card-print rounded-2xl shadow-2xl overflow-hidden w-full relative"
            style={{
              width: '100mm',
              maxWidth: '380px',
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
            <div className="text-white p-5 relative overflow-hidden" style={{ background: MHC_GRADIENTS.primary }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>

              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-white/95 p-1.5 rounded-lg flex-shrink-0 shadow-md">
                  <img src={MHC_ASSETS.logo} alt="شعار التجمع" className="w-12 h-12 object-contain" crossOrigin="anonymous" />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-[11px] opacity-90 leading-tight">{MHC_TEXTS.arabicName}</div>
                  <div className="text-[10px] opacity-75 leading-tight">{MHC_TEXTS.englishName}</div>
                  <div className="text-sm font-bold tracking-wide mt-1">بطاقة تعريف الموظف</div>
                </div>
              </div>
            </div>

            {/* Employee Photo */}
            <div className="flex justify-center -mt-10 mb-4 relative z-20">
              <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)' }}>
                <User className="w-12 h-12" style={{ color: MHC_COLORS.navy }} />
              </div>
            </div>

            {/* Employee Name & Position */}
            <div className="text-center px-5 mb-5">
              <h2 className="text-xl font-bold mb-1" style={{ color: MHC_COLORS.ink }}>{employee.full_name_arabic}</h2>
              <p className="text-sm font-medium" style={{ color: MHC_COLORS.blueAccent }}>{employee.position || 'غير محدد'}</p>
            </div>

            {/* Information Grid */}
            <div className="px-5 pb-5 space-y-2">
              {/* رقم الهوية */}
              <div className="flex items-start gap-2 py-2 border-b border-gray-100">
                <Hash className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500">رقم الهوية</div>
                  <div className="text-sm font-bold text-gray-900 truncate">{employee.رقم_الهوية || '-'}</div>
                </div>
              </div>

              {/* رقم الموظف */}
              <div className="flex items-start gap-2 py-2 border-b border-gray-100">
                <Briefcase className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-blue-600 font-medium">رقم الموظف</div>
                  <div className="text-sm font-bold text-blue-800 truncate">{employee.رقم_الموظف || '-'}</div>
                </div>
              </div>

              {/* تاريخ الميلاد */}
              {employee.birth_date && (
                <div className="flex items-start gap-2 py-2 border-b border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">تاريخ الميلاد</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {format(new Date(employee.birth_date), 'dd/MM/yyyy', { locale: ar })}
                    </div>
                  </div>
                </div>
              )}

              {/* رقم الجوال */}
              {employee.phone && (
                <div className="flex items-start gap-2 py-2 border-b border-gray-100">
                  <Phone className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-green-600 font-medium">رقم الجوال</div>
                    <div className="text-sm font-bold text-green-800 direction-ltr text-right">{employee.phone}</div>
                  </div>
                </div>
              )}

              {/* البريد الإلكتروني */}
              {employee.email && (
                <div className="flex items-start gap-2 py-2 border-b border-gray-100">
                  <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">البريد الإلكتروني</div>
                    <div className="text-xs font-semibold text-gray-900 break-all">{employee.email}</div>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code and Footer - بألوان الهوية */}
            <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #F1F8FF 0%, #E0F2FE 100%)', borderTop: `2px solid ${MHC_COLORS.tealLight}` }}>
              <div className="flex items-center justify-between gap-4">
                {/* QR Code */}
                {qrCodeDataUrl && (
                  <div className="bg-white p-2 rounded-lg shadow-sm" style={{ border: `1px solid ${MHC_COLORS.skyLight}` }}>
                    <img src={qrCodeDataUrl} alt="QR" className="w-16 h-16" />
                  </div>
                )}

                {/* Center Info */}
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-xs font-bold" style={{ color: MHC_COLORS.ink }}>{employee.المركز_الصحي || 'غير محدد'}</span>
                    <Building2 className="w-4 h-4" style={{ color: MHC_COLORS.blueAccent }} />
                  </div>
                  <div className="text-[10px]" style={{ color: MHC_COLORS.inkSoft }}>
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