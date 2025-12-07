import React, { useRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { User, Phone, Mail, Calendar, Hash, Briefcase, Download, Share2, Printer, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';

export default function EmployeeIDCard({ employee, onClose }) {
  const cardRef = useRef(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  useEffect(() => {
    generateQRCode();
  }, [employee]);

  const generateQRCode = async () => {
    try {
      const profileUrl = `${window.location.origin}/EmployeeProfile?id=${employee.id}`;
      const qrData = await QRCode.toDataURL(profileUrl, {
        width: 200,
        margin: 1,
        color: { dark: '#1e40af', light: '#ffffff' }
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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const card = cardRef.current;
      
      // High resolution: 2x scale
      const scale = 2;
      canvas.width = 1400 * scale;
      canvas.height = 2000 * scale;
      ctx.scale(scale, scale);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // رسم الحدود
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
      
      // رسم الهيدر
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#2563eb');
      gradient.addColorStop(1, '#1e40af');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, 250);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('وزارة الصحة', canvas.width / 2, 60);
      ctx.font = '50px Arial';
      ctx.fillText('بطاقة تعريف الموظف', canvas.width / 2, 120);
      
      // رسم الصورة الشخصية
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 200, 80, 0, Math.PI * 2);
      ctx.fill();
      
      // النصوص
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 60px Arial';
      ctx.fillText(employee.full_name_arabic || '', canvas.width / 2, 350);
      
      ctx.fillStyle = '#2563eb';
      ctx.font = '40px Arial';
      ctx.fillText(employee.position || 'غير محدد', canvas.width / 2, 410);
      
      // البيانات
      let yPos = 500;
      const data = [
        { label: 'رقم الهوية', value: employee.رقم_الهوية },
        { label: 'رقم الموظف', value: employee.رقم_الموظف },
        { label: 'تاريخ الميلاد', value: employee.birth_date ? format(new Date(employee.birth_date), 'dd/MM/yyyy') : null },
        { label: 'رقم الجوال', value: employee.phone },
        { label: 'البريد الإلكتروني', value: employee.email }
      ];
      
      ctx.textAlign = 'right';
      data.forEach(item => {
        if (item.value) {
          ctx.fillStyle = '#6b7280';
          ctx.font = '30px Arial';
          ctx.fillText(item.label + ':', canvas.width - 100, yPos);
          
          ctx.fillStyle = '#111827';
          ctx.font = 'bold 35px Arial';
          ctx.fillText(item.value, canvas.width - 100, yPos + 40);
          
          yPos += 120;
        }
      });
      
      // QR Code
      if (qrCodeDataUrl) {
        const qrImage = new Image();
        qrImage.src = qrCodeDataUrl;
        await new Promise((resolve) => {
          qrImage.onload = () => {
            ctx.drawImage(qrImage, 100, yPos, 150, 150);
            resolve();
          };
        });
      }
      
      // الفوتر
      const footerY = 2000 - 120;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, footerY, 1400, 120);
      
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = '35px Arial';
      ctx.fillText('المركز الصحي: ' + (employee.المركز_الصحي || 'غير محدد'), 700, footerY + 50);
      ctx.font = '25px Arial';
      ctx.fillText('تاريخ الإصدار: ' + new Date().toLocaleDateString('ar-SA'), 700, footerY + 90);
      
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
      // Generate high-res image as blob
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = 2;
      canvas.width = 1400 * scale;
      canvas.height = 2000 * scale;
      ctx.scale(scale, scale);
      
      // Render card content (simplified version)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1400, 2000);
      
      const gradient = ctx.createLinearGradient(0, 0, 1400, 0);
      gradient.addColorStop(0, '#2563eb');
      gradient.addColorStop(1, '#1e40af');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1400, 250);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('وزارة الصحة', 700, 60);
      ctx.font = '50px Arial';
      ctx.fillText('بطاقة تعريف الموظف', 700, 120);
      
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 60px Arial';
      ctx.fillText(employee.full_name_arabic || '', 700, 350);
      
      ctx.fillStyle = '#2563eb';
      ctx.font = '40px Arial';
      ctx.fillText(employee.position || 'غير محدد', 700, 410);
      
      // Data
      let yPos = 500;
      const data = [
        { label: 'رقم الهوية', value: employee.رقم_الهوية },
        { label: 'رقم الموظف', value: employee.رقم_الموظف },
        { label: 'تاريخ الميلاد', value: employee.birth_date ? format(new Date(employee.birth_date), 'dd/MM/yyyy') : null },
        { label: 'رقم الجوال', value: employee.phone },
        { label: 'البريد الإلكتروني', value: employee.email }
      ];
      
      ctx.textAlign = 'right';
      data.forEach(item => {
        if (item.value) {
          ctx.fillStyle = '#6b7280';
          ctx.font = '30px Arial';
          ctx.fillText(item.label + ':', 1300, yPos);
          ctx.fillStyle = '#111827';
          ctx.font = 'bold 35px Arial';
          ctx.fillText(item.value, 1300, yPos + 40);
          yPos += 120;
        }
      });
      
      // QR Code
      if (qrCodeDataUrl) {
        const qrImage = new Image();
        qrImage.src = qrCodeDataUrl;
        await new Promise((resolve) => {
          qrImage.onload = () => {
            ctx.drawImage(qrImage, 100, yPos, 150, 150);
            resolve();
          };
        });
      }
      
      // Footer
      const footerY = 2000 - 120;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, footerY, 1400, 120);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = '35px Arial';
      ctx.fillText('المركز الصحي: ' + (employee.المركز_الصحي || 'غير محدد'), 700, footerY + 50);
      ctx.font = '25px Arial';
      ctx.fillText('تاريخ الإصدار: ' + new Date().toLocaleDateString('ar-SA'), 700, footerY + 90);
      
      // Convert to blob
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* أزرار الإجراءات */}
        <div className="flex gap-2 mb-4 justify-center">
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

      <div ref={cardRef} className="id-card-container bg-gray-100 p-4">
        <div 
          className="bg-white shadow-2xl rounded-xl overflow-hidden"
          style={{ 
            width: '148mm', 
            height: '210mm',
            border: '3px solid #1e40af'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 text-center">
            <div className="mb-2">
              <div className="text-sm opacity-90">وزارة الصحة</div>
              <div className="text-lg font-bold">بطاقة تعريف الموظف</div>
            </div>
            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg">
              <User className="w-16 h-16 text-blue-600" />
            </div>
          </div>

          {/* Employee Info */}
          <div className="p-8 space-y-6">
            {/* الاسم */}
            <div className="text-center pb-4 border-b-2 border-blue-200">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {employee.full_name_arabic}
              </div>
              <div className="text-base text-blue-600 font-medium">
                {employee.position || 'غير محدد'}
              </div>
            </div>

            {/* البيانات الأساسية */}
            <div className="space-y-4">
              {/* رقم الهوية */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <Hash className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">رقم الهوية</div>
                  <div className="text-base font-bold text-gray-900">
                    {employee.رقم_الهوية || 'غير محدد'}
                  </div>
                </div>
              </div>

              {/* رقم الموظف */}
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-blue-600 font-medium">رقم الموظف</div>
                  <div className="text-base font-bold text-blue-800">
                    {employee.رقم_الموظف || 'غير محدد'}
                  </div>
                </div>
              </div>

              {/* تاريخ الميلاد */}
              {employee.birth_date && (
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">تاريخ الميلاد</div>
                    <div className="text-base font-semibold text-gray-900">
                      {format(new Date(employee.birth_date), 'dd/MM/yyyy', { locale: ar })}
                    </div>
                  </div>
                </div>
              )}

              {/* رقم الجوال */}
              {employee.phone && (
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-green-600 font-medium">رقم الجوال</div>
                    <div className="text-base font-bold text-green-800 direction-ltr text-right">
                      {employee.phone}
                    </div>
                  </div>
                </div>
              )}

              {/* البريد الإلكتروني */}
              {employee.email && (
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-xs text-gray-500">البريد الإلكتروني</div>
                    <div className="text-sm font-semibold text-gray-900 break-all">
                      {employee.email}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="mt-6 flex justify-center">
                <div className="bg-white p-3 rounded-lg border-2 border-blue-200 shadow-sm">
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />
                  <div className="text-xs text-center text-gray-500 mt-2 flex items-center justify-center gap-1">
                    <QrCode className="w-3 h-3" />
                    مسح للملف الشخصي
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center text-xs mt-auto">
            <div className="font-medium">المركز الصحي: {employee.المركز_الصحي || 'غير محدد'}</div>
            <div className="text-xs opacity-75 mt-1">تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}