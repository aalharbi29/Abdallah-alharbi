import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SHC5_VaccinationCard({ data, onChange, lang = 'ar' }) {
  const isAr = lang === 'ar';
  const d = data || {};
  const set = (field, val) => onChange({ ...d, [field]: val });

  const immunizations = [
    { key: 'hepb_1', label: 'Hepatitis B: 1st dose' },
    { key: 'hepb_2', label: 'Hepatitis B: 2nd dose' },
    { key: 'hepb_3', label: 'Hepatitis B: 3rd dose' },
    { key: 'influenza', label: 'Influenza vaccine' },
    { key: 'meningococcal', label: 'Meningococcal vaccine' },
    { key: 'td', label: 'Td' },
    { key: 'mmr', label: 'MMR*' },
    { key: 'vz_1', label: 'VZ vaccine*: 1st dose' },
    { key: 'vz_2', label: 'VZ vaccine*: 2nd dose' },
  ];

  const secondSeries = [
    { key: 'hepb2_1', label: 'Hepatitis B (2nd series): 1st dose' },
    { key: 'hepb2_2', label: 'Hepatitis B (2nd series): 2nd dose' },
    { key: 'hepb2_3', label: 'Hepatitis B (2nd series): 3rd dose' },
  ];

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[#5B9BD5]">
          {isAr ? 'بطاقة التطعيم' : 'Vaccination Card'}
        </h2>
        <p className="text-xs text-gray-500">SHC5</p>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#5B9BD5] text-white">
              <th className="border border-gray-300 p-2 text-right">IMMUNIZATION</th>
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Signature</th>
              <th className="border border-gray-300 p-2">Comments</th>
            </tr>
          </thead>
          <tbody>
            {immunizations.map(item => (
              <tr key={item.key}>
                <td className="border border-gray-200 p-1.5 font-medium bg-[#EBF3FA]">{item.label}</td>
                <td className="border border-gray-200 p-1"><Input type="date" value={d[`${item.key}_date`] || ''} onChange={e => set(`${item.key}_date`, e.target.value)} className="h-7 text-xs border-0" /></td>
                <td className="border border-gray-200 p-1"><Input value={d[`${item.key}_sig`] || ''} onChange={e => set(`${item.key}_sig`, e.target.value)} className="h-7 text-xs border-0" /></td>
                <td className="border border-gray-200 p-1"><Input value={d[`${item.key}_comment`] || ''} onChange={e => set(`${item.key}_comment`, e.target.value)} className="h-7 text-xs border-0" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hep B Response */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#D6E8F7]">
              <th className="border border-gray-200 p-2 text-right">Hep. B Vaccine Response</th>
              <th className="border border-gray-200 p-2">Date</th>
              <th className="border border-gray-200 p-2">Results</th>
              <th className="border border-gray-200 p-2">Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 p-1.5 font-medium bg-[#EBF3FA]">anti-HBs</td>
              <td className="border border-gray-200 p-1"><Input type="date" value={d.antihbs_date || ''} onChange={e => set('antihbs_date', e.target.value)} className="h-7 text-xs border-0" /></td>
              <td className="border border-gray-200 p-1"><Input value={d.antihbs_result || ''} onChange={e => set('antihbs_result', e.target.value)} className="h-7 text-xs border-0" /></td>
              <td className="border border-gray-200 p-1"><Input value={d.antihbs_comment || ''} onChange={e => set('antihbs_comment', e.target.value)} className="h-7 text-xs border-0" /></td>
            </tr>
            {secondSeries.map(item => (
              <tr key={item.key}>
                <td className="border border-gray-200 p-1.5 font-medium bg-[#EBF3FA]">{item.label}</td>
                <td className="border border-gray-200 p-1"><Input type="date" value={d[`${item.key}_date`] || ''} onChange={e => set(`${item.key}_date`, e.target.value)} className="h-7 text-xs border-0" /></td>
                <td className="border border-gray-200 p-1"><Input value={d[`${item.key}_sig`] || ''} onChange={e => set(`${item.key}_sig`, e.target.value)} className="h-7 text-xs border-0" /></td>
                <td className="border border-gray-200 p-1"><Input value={d[`${item.key}_comment`] || ''} onChange={e => set(`${item.key}_comment`, e.target.value)} className="h-7 text-xs border-0" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-red-500 text-center">* {isAr ? 'تجنب الحمل خلال 3 أشهر بعد التطعيم' : 'Avoid pregnancy within 3 months post vaccination.'}</p>
    </div>
  );
}