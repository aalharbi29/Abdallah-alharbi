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
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[#5B9BD5]">
          {isAr ? 'نموذج الفحوصات والتحاليل' : 'Screening & Investigations Sheet'}
        </h2>
        <p className="text-xs text-gray-500">SHC3</p>
      </div>

      {/* Screening */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">SCREENING</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#D6E8F7]">
              <th className="border border-gray-200 p-2 text-right">{isAr ? 'الفحص' : 'Test'}</th>
              <th className="border border-gray-200 p-2">{isAr ? 'التاريخ' : 'Date'}</th>
              <th className="border border-gray-200 p-2">{isAr ? 'النتيجة' : 'Results'}</th>
              <th className="border border-gray-200 p-2">{isAr ? 'ملاحظات' : 'Comments'}</th>
            </tr>
          </thead>
          <tbody>
            {screeningItems.map(item => (
              <tr key={item}>
                <td className="border border-gray-200 p-1.5 font-medium bg-[#EBF3FA]">{item}</td>
                <td className="border border-gray-200 p-1"><Input type="date" value={d[`scr_${item}_date`] || ''} onChange={e => set(`scr_${item}_date`, e.target.value)} className="h-7 text-xs border-0" /></td>
                <td className="border border-gray-200 p-1"><Input value={d[`scr_${item}_result`] || ''} onChange={e => set(`scr_${item}_result`, e.target.value)} className="h-7 text-xs border-0" /></td>
                <td className="border border-gray-200 p-1"><Input value={d[`scr_${item}_comment`] || ''} onChange={e => set(`scr_${item}_comment`, e.target.value)} className="h-7 text-xs border-0" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PPD Skin Test */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">PPD SKIN TEST</div>
        <div className="p-4 grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Date</Label><Input type="date" value={d.ppd_skin_date || ''} onChange={e => set('ppd_skin_date', e.target.value)} className="h-8 text-sm" /></div>
          <div><Label className="text-xs">Results</Label><Input value={d.ppd_skin_result || ''} onChange={e => set('ppd_skin_result', e.target.value)} className="h-8 text-sm" /></div>
          <div><Label className="text-xs">Signature</Label><Input value={d.ppd_skin_sig || ''} onChange={e => set('ppd_skin_sig', e.target.value)} className="h-8 text-sm" /></div>
        </div>
      </div>

      {/* Investigation */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">{isAr ? 'التحاليل' : 'Investigation'}</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#D6E8F7]">
              <th className="border border-gray-200 p-2 text-right">{isAr ? 'الفحص' : 'Investigation'}</th>
              <th className="border border-gray-200 p-2">{isAr ? 'النتيجة' : 'Results'}</th>
              <th className="border border-gray-200 p-2">{isAr ? 'ملاحظات' : 'Comments'}</th>
            </tr>
          </thead>
          <tbody>
            {investigationItems.map(item => (
              <tr key={item}>
                <td className="border border-gray-200 p-1.5 font-medium bg-[#EBF3FA]">{item}</td>
                <td className="border border-gray-200 p-1"><Input value={d[`inv_${item}_result`] || ''} onChange={e => set(`inv_${item}_result`, e.target.value)} className="h-7 text-xs border-0" /></td>
                <td className="border border-gray-200 p-1"><Input value={d[`inv_${item}_comment`] || ''} onChange={e => set(`inv_${item}_comment`, e.target.value)} className="h-7 text-xs border-0" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}