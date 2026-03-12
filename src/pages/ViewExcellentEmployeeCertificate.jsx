import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExcellentEmployeeCertificate } from '@/entities/ExcellentEmployeeCertificate';
import { Button } from '@/components/ui/button';
import { ArrowRight, Printer } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function ViewExcellentEmployeeCertificate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      loadCertificate(id);
    }
  }, [location.search]);

  const loadCertificate = async (id) => {
    try {
      const data = await ExcellentEmployeeCertificate.get(id);
      setCertificate(data);
    } catch (error) {
      console.error('Error loading certificate:', error);
      alert('فشل تحميل الشهادة');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="p-6 text-center">جاري التحميل...</div>;
  }

  if (!certificate) {
    return <div className="p-6 text-center">لم يتم العثور على الشهادة</div>;
  }

  return (
    <div className="relative">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .certificate-container {
            width: 210mm !important;
            height: 297mm !important;
            page-break-after: always;
          }
        }
        .watermark-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          opacity: 0.08;
          z-index: 2;
          pointer-events: none;
        }
        .watermark-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      `}</style>

      {/* أزرار التحكم */}
      <div className="no-print fixed top-4 left-4 z-50 flex gap-2">
        <Button variant="outline" onClick={() => navigate(createPageUrl('Forms?type=interactive'))} size="icon">
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="w-4 h-4 ml-2" />
          طباعة
        </Button>
      </div>

      {/* الشهادة */}
      <div className="certificate-container relative" style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        backgroundColor: 'white'
      }}>
        {/* الخلفية الرئيسية الجديدة */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/fd38b6c13_image.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }} />

        {/* الصورة المائية للشعار */}
        <div className="watermark-logo">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/040ed9ff1_image.png"
            alt=""
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>

        {/* المحتوى */}
        <div style={{
          position: 'relative',
          zIndex: 3,
          padding: '20mm',
          paddingTop: '140px'
        }}>
          {/* العنوان */}
          <h1 style={{
            fontFamily: certificate.fonts?.title || 'Cairo',
            fontSize: '28px',
            fontWeight: certificate.weights?.title || 'bold',
            textAlign: 'center',
            marginBottom: '60px',
            color: '#000'
          }}>
            مشهد إنجاز موظف حاصل تقييم ممتاز
          </h1>

          {/* الجدول */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px', fontFamily: certificate.fonts?.table || 'Cairo' }}>
            <table style={{
              border: '2px solid black',
              width: '85%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid black' }}>
                  <th style={{
                    borderLeft: '2px solid black',
                    padding: '15px',
                    fontWeight: certificate.weights?.tableHeader || 'bold',
                    textAlign: 'center',
                    backgroundColor: '#7dd3fc',
                    fontSize: '18px'
                  }}>اسم الموظف</th>
                  <th style={{
                    borderLeft: '2px solid black',
                    padding: '15px',
                    fontWeight: certificate.weights?.tableHeader || 'bold',
                    textAlign: 'center',
                    backgroundColor: '#7dd3fc',
                    fontSize: '18px'
                  }}>رقم الموظف</th>
                  <th style={{
                    padding: '15px',
                    fontWeight: certificate.weights?.tableHeader || 'bold',
                    textAlign: 'center',
                    backgroundColor: '#7dd3fc',
                    fontSize: '18px'
                  }}>جهة العمل</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{
                    borderLeft: '2px solid black',
                    padding: '15px',
                    textAlign: 'center',
                    fontSize: '17px',
                    fontWeight: certificate.weights?.tableData || 'bold'
                  }}>{certificate.employee_name}</td>
                  <td style={{
                    borderLeft: '2px solid black',
                    padding: '15px',
                    textAlign: 'center',
                    fontSize: '17px',
                    fontWeight: certificate.weights?.tableData || 'bold'
                  }}>{certificate.employee_number}</td>
                  <td style={{
                    padding: '15px',
                    textAlign: 'center',
                    fontSize: '17px',
                    fontWeight: certificate.weights?.tableData || 'bold'
                  }}>{certificate.work_place}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* نص الشهادة */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ 
              marginBottom: '30px', 
              fontSize: '20px',
              fontWeight: certificate.weights?.greeting || '900',
              fontFamily: certificate.fonts?.greeting || 'Cairo'
            }}>
              السلام عليكم ورحمة الله وبركاته <span style={{ display: 'inline-block', width: '40px' }}></span> وبعد
            </p>
            <p style={{
              fontSize: '18px',
              fontWeight: certificate.weights?.text || 'bold',
              fontFamily: certificate.fonts?.text || 'Cairo',
              lineHeight: '2.2',
              textAlign: 'justify',
              padding: '0 50px'
            }}>
              تشهد {certificate.administration_name ? (certificate.administration_name.trim().startsWith('إدارة') ? certificate.administration_name : `إدارة ${certificate.administration_name}`) : 'إدارة المراكز الصحية بالحناكية'} بأن الموضح اسمه وبياناته أعلاه {certificate.achievement_description}
            </p>
          </div>

          {/* منطقة التوقيع والختم */}
          <div style={{
            position: 'relative',
            marginTop: '60px',
            minHeight: '250px'
          }}>
            {/* كتلة المدير */}
            <div style={{
              position: 'absolute',
              left: '300px',
              top: '0px',
              textAlign: 'center',
              fontFamily: certificate.fonts?.manager || 'Cairo'
            }}>
              <p style={{ 
                fontSize: '17px', 
                fontWeight: certificate.weights?.manager || 'bold',
                marginBottom: '8px'
              }}>
                مدير {certificate.administration_name || 'إدارة شؤون المراكز الصحية بالحناكية'}
              </p>
              <p style={{ 
                fontSize: '18px', 
                fontWeight: certificate.weights?.manager || 'bold',
                color: '#1f2937'
              }}>
                {certificate.supervisor_name}
              </p>
            </div>

            {/* التوقيع */}
            {String(certificate.show_signature) !== 'false' && (
              <div style={{
                position: 'absolute',
                left: '420px',
                top: '60px'
              }}>
                <div style={{ position: 'relative' }}>
                  <p style={{ fontSize: '16px', marginBottom: '5px' }}>
                    التوقيع........................
                  </p>
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png"
                    alt="التوقيع"
                    style={{
                      position: 'absolute',
                      right: '40px',
                      top: '-30px',
                      width: '130px',
                      mixBlendMode: 'darken'
                    }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              </div>
            )}

            {/* الختم */}
            {String(certificate.show_stamp) !== 'false' && (
              <div style={{
                position: 'absolute',
                left: '350px',
                top: '140px'
              }}>
                <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>الختم الجهة</p>
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png"
                  alt="الختم"
                  style={{
                    width: '150px',
                    opacity: 0.8,
                    marginTop: '-55px'
                  }}
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}

            {/* التاريخ */}
            <p style={{
              position: 'absolute',
              left: '80px',
              bottom: '20px',
              fontSize: '17px',
              fontWeight: 'bold'
            }}>
              حررت في تاريخ: {certificate.hijri_date} هـ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}