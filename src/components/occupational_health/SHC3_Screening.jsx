import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SHC3_Screening({ data, onChange, lang = 'ar' }) {
  const isAr = lang === 'ar';
  const d = data || {};
  const set = (field, val) => onChange({ ...d, [field]: val });

  const screeningItems = ['HBsAg', 'anti-HBs', 'anti-HBc', 'HCV-Ab', 'HIV-Ab', 'Rubella', 'Chickenpox', 'Measles', 'Mumps', 'Malaria', 'Syphilis'];
  const investigationItems = ['Blood Group', 'CBC, differential', 'Urea, Creatinine', 'Liver Function Tests', 'Random Blood Sugar', 'Urine Analysis', 'Stool Analysis', 'Chest X-ray', 'ECG (If over 40)', 'Pregnancy test'];

  return (
    <div className="space-y-4 print:text-[11px] font-cairo" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center mb-4 border-b-2 border-black pb-2">
        <h2 className="text-xl font-bold">
          {isAr ? 'نموذج الفحوصات والتحاليل' : 'Screening & Investigations Sheet'}
        </h2>
        <p className="text-sm font-bold">SHC3</p>
      </div>

      {/* Screening */}
      <div className="border-2 border-black">
        <div className="bg-gray-200 border-b-2 border-black text-center py-1 font-bold text-sm">SCREENING</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-right">{isAr ? 'الفحص' : 'Test'}</th>
              <th className="border border-black p-2">{isAr ? 'التاريخ' : 'Date'}</th>
              <th className="border border-black p-2">{isAr ? 'النتيجة' : 'Results'}</th>
              <th className="border border-black p-2">{isAr ? 'ملاحظات' : 'Comments'}</th>
            </tr>
          </thead>
          <tbody>
            {screeningItems.map(item => (
              <tr key={item}>
                <td className="border border-black p-1.5 font-medium bg-gray-50">{item}</td>
                <td className="border border-black p-1"><Input type="date" value={d[`scr_${item}_date`] || ''} onChange={e => set(`scr_${item}_date`, e.target.value)} className="h-7 text-xs border-0" /></td>
                <td className="border border-black p-1"><Input value={d[`scr_${item}_result`] || ''} onChange={e => set(`scr_${item}_result`, e.target.value)} className="h-7 text-xs border-0" /></td>
                <td className="border border-black p-1"><Input value={d[`scr_${item}_comment`] || ''} onChange={e => set(`scr_${item}_comment`, e.target.value)} className="h-7 text-xs border-0" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PPD Skin Test */}
      <div className="border-2 border-black">
        <div className="bg-gray-200 border-b-2 border-black text-center py-1 font-bold text-sm">PPD SKIN TEST</div>
        <div className="p-2 grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Date</Label><Input type="date" value={d.ppd_skin_date || ''} onChange={e => set('ppd_skin_date', e.target.value)} className="h-8 text-sm" /></div>
          <div><Label className="text-xs">Results</Label><Input value={d.ppd_skin_result || ''} onChange={e => set('ppd_skin_result', e.target.value)} className="h-8 text-sm" /></div>
          <div><Label className="text-xs">Signature</Label><Input value={d.ppd_skin_sig || ''} onChange={e => set('ppd_skin_sig', e.target.value)} className="h-8 text-sm" /></div>
        </div>
      </div>

      {/* Investigation */}
      <div className="border-2 border-black">
        <div className="bg-gray-200 border-b-2 border-black text-center py-1 font-bold text-sm">{isAr ? 'التحاليل' : 'Investigation'}</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-right">{isAr ? 'الفحص' : 'Investigation'}</th>
              <th className="border border-black p-2">{isAr ? 'النتيجة' : 'Results'}</th>
              <th className="border border-black p-2">{isAr ? 'ملاحظات' : 'Comments'}</th>
            </tr>
          </thead>
          <tbody>
            {investigationItems.map(item => (
              <tr key={item}>
                <td className="border border-black p-1.5 font-medium bg-gray-50">{item}</td>
                <td className="border border-black p-1"><Input value={d[`inv_${item}_result`] || ''} onChange={e => set(`inv_${item}_result`, e.target.value)} className="h-7 text-xs border-0" /></td>
                <td className="border border-black p-1"><Input value={d[`inv_${item}_comment`] || ''} onChange={e => set(`inv_${item}_comment`, e.target.value)} className="h-7 text-xs border-0" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}