import React, { useEffect, useState } from 'react';

const DELIVERY_LOGO_URL = 'https://media.base44.com/images/public/68af5003813e47bd07947b30/b604e8fcf_30-11-1447.png';

const toArabicDigits = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(value).replace(/[0-9]/g, (d) => map[+d]);
};

const emptyRows = Array.from({ length: 5 }, (_, index) => index + 1);

const formatGregorianDate = (value) => {
  if (!value) return '';
  const [year, month, day] = String(value).split('-');
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}م`;
};

const cleanCenterName = (value) => {
  return (value || '')
    .replace(/^مركز\s+صحي\s+/i, '')
    .replace(/^مركز\s+/i, '')
    .trim();
};

function TransparentLogo() {
  const [processedLogo, setProcessedLogo] = useState(DELIVERY_LOGO_URL);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.drawImage(image, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];
        const isLightBackground = red > 232 && green > 232 && blue > 232;

        if (isLightBackground) {
          pixels[i + 3] = 0;
        }
      }

      context.putImageData(imageData, 0, 0);
      setProcessedLogo(canvas.toDataURL('image/png'));
    };
    image.src = DELIVERY_LOGO_URL;
  }, []);

  return (
    <img
      src={processedLogo}
      alt="شعار تجمع المدينة المنورة الصحي"
      className="h-32 w-40 object-contain"
    />
  );
}

function FormLogo() {
  return (
    <div className="flex items-start justify-between px-14 pt-12">
      <div className="text-right text-[#063b75] leading-8 font-semibold text-[18px]">
        <div>تجمع المدينة المنورة الصحي</div>
        <div>مستشفى الحسو العام</div>
        <div>إدارة المراكز الصحية بالحسو</div>
      </div>
      <div className="text-center">
        <TransparentLogo />
      </div>
    </div>
  );
}

export default function DeliveryRecordPreview({ printRef, scalerRef, previewScale, data }) {
  const rows = data.items?.length ? data.items : emptyRows.map(() => ({}));
  const receiverName = data.receiver?.full_name_arabic || '';
  const receiverCenterName = cleanCenterName(data.receiver?.['المركز_الصحي'] || data.center?.اسم_المركز || '');
  const deliveredByName = data.deliveredBy?.full_name_arabic || '';
  const sectionColors = data.sectionColors || {};
  const partyHeaderStyle = {
    backgroundColor: sectionColors.partyHeaderBg || '#ffffff',
    color: sectionColors.partyHeaderText || '#07356c',
    border: `1.5px solid ${sectionColors.partyHeaderBorder || '#07356c'}`,
  };
  const notesHeaderStyle = {
    backgroundColor: sectionColors.notesHeaderBg || '#ffffff',
    color: sectionColors.notesHeaderText || '#07356c',
    border: `1.5px solid ${sectionColors.notesHeaderBorder || '#07356c'}`,
  };
  const serialHeaderStyle = {
    backgroundColor: sectionColors.serialHeaderBg || '#ffffff',
    color: sectionColors.serialHeaderText || '#07356c',
    border: `1.5px solid ${sectionColors.serialHeaderBorder || '#07356c'}`,
  };

  return (
    <div className="print-area flex justify-center">
      <div ref={scalerRef} className="preview-scaler relative aspect-[210/297] w-full overflow-hidden">
        <div
          ref={printRef}
          className="preview-page absolute right-0 top-0 bg-white text-black shadow-sm"
          style={{
            width: '210mm',
            height: '297mm',
            direction: 'rtl',
            fontFamily: "'Tajawal','Cairo','Arial',sans-serif",
            transform: `scale(${previewScale})`,
            transformOrigin: 'top right',
          }}
        >
          <div className="relative h-full border-[3px] border-[#07356c] bg-white overflow-hidden">
            <FormLogo />

            <div className="mx-14 mt-11 flex items-center gap-3">
              <div className="h-[2px] flex-1 bg-[#07356c]" />
              <div className="h-2 w-2 rounded-full bg-[#07356c]" />
              <div className="h-[2px] flex-1 bg-[#07356c]" />
            </div>

            <h1 className="mt-8 text-center text-[29px] font-black text-[#07356c]">
              محضر تسليم لقاح كوفيد -19
            </h1>

            <p className="mt-7 px-16 text-right text-[15px] leading-8">
              نفيدكم بأنه تم تسليم لقاحات كوفيد-19 لمراكز الرعاية الأولية بالحسو حسب البيانات التالية:
            </p>

            <section className="mx-10 mt-5 rounded-xl border-2 border-[#07356c] p-2">
              <div className="flex items-center justify-between px-5 py-4 text-[14px] font-semibold">
                <div className="flex w-[48%] items-center gap-3">
                  <span className="whitespace-nowrap">اسم المركز:</span>
                  <span className="min-h-6 w-52 border-b border-dotted border-gray-500 text-center font-bold">
                    {data.center?.اسم_المركز || data.center?.name || ''}
                  </span>
                </div>
                <div className="flex items-center gap-5" dir="ltr">
                  <span>هـ</span>
                  <span className="min-w-10 border-b border-dotted border-gray-500 text-center">{toArabicDigits(data.recordYear)}</span>
                  <span>/</span>
                  <span className="min-w-6 border-b border-dotted border-gray-500 text-center">{toArabicDigits(data.recordMonth)}</span>
                  <span>/</span>
                  <span className="min-w-6 border-b border-dotted border-gray-500 text-center">{toArabicDigits(data.recordDay)}</span>
                  <span dir="rtl">التاريخ:</span>
                </div>
              </div>

              <table className="w-full table-fixed border-collapse overflow-hidden rounded-lg text-center text-[14px]">
                <thead>
                  <tr style={serialHeaderStyle}>
                    <th className="w-[8%] border border-[#6c89ad] py-3">م</th>
                    <th className="w-[22%] border border-[#6c89ad] py-3">الكمية (جرعة)</th>
                    <th className="w-[21%] border border-[#6c89ad] py-3">رقم التشغيلة</th>
                    <th className="w-[22%] border border-[#6c89ad] py-3">تاريخ الانتهاء</th>
                    <th className="w-[27%] border border-[#6c89ad] py-3">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {emptyRows.map((number, index) => {
                    const row = rows[index] || {};
                    return (
                      <tr key={number} className={`h-[42px] ${index === 0 ? 'text-black' : ''}`}>
                        <td className="border border-[#6c89ad] text-[18px] font-bold">{toArabicDigits(number)}</td>
                        <td className="border border-[#6c89ad] font-semibold">{toArabicDigits(row.quantity)}</td>
                        <td className="border border-[#6c89ad] font-semibold">{toArabicDigits(row.batchNumber)}</td>
                        <td className="border border-[#6c89ad] font-semibold">{toArabicDigits(formatGregorianDate(row.expiryDate))}</td>
                        <td className="border border-[#6c89ad] font-semibold">{row.notes || ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            <section className="mx-10 mt-8 grid grid-cols-[1fr_76px_1fr] items-center gap-4">
              <div className="relative rounded-lg border-2 border-[#07356c] px-8 pb-7 pt-10 text-[14px] leading-9">
                <div className="absolute -top-4 right-10 w-44 rounded-md py-1 text-center text-sm font-bold" style={partyHeaderStyle}>المسلم</div>
                <div className="flex gap-2"><span>الاسم:</span><span className="flex-1 border-b border-dotted border-gray-500 text-center font-bold">{deliveredByName}</span></div>
                <div className="flex gap-2"><span>التوقيع:</span><span className="flex-1 border-b border-dotted border-gray-500 text-center"></span></div>
                <div className="mt-1 flex items-center justify-center gap-3" dir="ltr"><span>هـ</span><span className="min-w-10 border-b border-dotted border-gray-500 text-center">{toArabicDigits(data.deliveredYear)}</span><span>/</span><span className="min-w-6 border-b border-dotted border-gray-500 text-center">{toArabicDigits(data.deliveredMonth)}</span><span>/</span><span className="min-w-6 border-b border-dotted border-gray-500 text-center">{toArabicDigits(data.deliveredDay)}</span><span dir="rtl">التاريخ:</span></div>
              </div>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-[#b7c8dc] text-[12px] font-bold text-[#c5cbd3]">
                الختم
              </div>

              <div className="relative rounded-lg border-2 border-[#07356c] px-8 pb-7 pt-10 text-[14px] leading-9">
                <div className="absolute -top-4 left-10 w-44 rounded-md py-1 text-center text-sm font-bold" style={partyHeaderStyle}>المستلم</div>
                <div className="flex gap-2"><span>الاسم:</span><span className="flex-1 border-b border-dotted border-gray-500 text-center font-bold">{receiverName}</span></div>
                <div className="flex gap-2"><span>مدير مركز صحي:</span><span className="flex-1 border-b border-dotted border-gray-500 text-center font-bold">{receiverCenterName}</span></div>
                <div className="flex gap-2"><span>التوقيع:</span><span className="flex-1 border-b border-dotted border-gray-500 text-center"></span></div>
                <div className="mt-1 flex items-center justify-center gap-3" dir="ltr"><span>هـ</span><span className="min-w-10 border-b border-dotted border-gray-500 text-center">{toArabicDigits(data.receivedYear)}</span><span>/</span><span className="min-w-6 border-b border-dotted border-gray-500 text-center">{toArabicDigits(data.receivedMonth)}</span><span>/</span><span className="min-w-6 border-b border-dotted border-gray-500 text-center">{toArabicDigits(data.receivedDay)}</span><span dir="rtl">التاريخ:</span></div>
              </div>
            </section>

            <section className="mx-10 mt-5 rounded-lg border-2 border-[#07356c] px-7 pb-6 pt-8 text-[14px] leading-8 relative">
              <div className="absolute -top-1 right-4 rounded-b-md px-8 py-1 text-sm font-bold" style={notesHeaderStyle}>ملاحظات:</div>
              <ul className="mr-12 list-disc">
                <li>يجب حفظ اللقاح في درجة حرارة من 2-8 درجة مئوية</li>
                <li>يجب إتلاف اللقاح بعد مرور 10 أسابيع من تاريخ استلامه</li>
              </ul>
            </section>

            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[#d8e4f0] text-2xl tracking-widest" aria-hidden="true">
              {Array.from({ length: 18 }).map((_, i) => <span key={i}>❧</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}