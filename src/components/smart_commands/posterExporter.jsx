// تصدير نتائج التقرير الذكي كبوستر/صورة PNG احترافية
import html2canvas from 'html2canvas';
import { getNestedValue, toLatinDigits, formatLatinDate } from './excelExporter';

const renderCellForPoster = (val) => {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? '✓' : '✗';
  if (Array.isArray(val)) return val.length === 0 ? '—' : toLatinDigits(val.join('، '));
  if (typeof val === 'object') {
    if (val['رقم_اللوحة_عربي']) return toLatinDigits(`${val['رقم_اللوحة_عربي']} | ${val['حالة_السيارة'] || '—'}`);
    if (val['متوفرة'] !== undefined) return val['متوفرة'] ? 'متوفرة' : 'غير متوفرة';
    return toLatinDigits(JSON.stringify(val));
  }
  return toLatinDigits(val);
};

export async function exportAsPoster({ title, results, fields, labelFor, entityLabel, isFree }) {
  if (!results || results.length === 0) throw new Error('لا توجد بيانات للتصدير.');

  // ابنِ عنصراً مؤقتاً خارج الشاشة بتنسيق بوستر A3 رأسي
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '0';
  container.style.width = '1240px';
  container.style.background = '#ffffff';
  container.style.padding = '0';
  container.style.fontFamily = "'Cairo', 'Segoe UI', Arial, sans-serif";
  container.dir = 'rtl';

  const headers = fields.map((f) => labelFor(f));
  const today = formatLatinDate();
  const accent = isFree ? '#a21caf' : '#2563eb';
  const accent2 = isFree ? '#7c3aed' : '#4338ca';

  container.innerHTML = `
    <div style="background: linear-gradient(135deg, ${accent} 0%, ${accent2} 100%); padding: 36px 48px; color: #fff; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -60px; left: -60px; width: 220px; height: 220px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -80px; right: -40px; width: 280px; height: 280px; background: rgba(255,255,255,0.06); border-radius: 50%;"></div>
      <div style="position: relative; z-index: 2;">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px;">
          <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 14px; font-size: 28px; line-height: 1;">📊</div>
          <div style="font-size: 14px; font-weight: 600; opacity: 0.9; letter-spacing: 0.5px;">تقرير احترافي${isFree ? ' • مولّد بالذكاء الاصطناعي 🧠' : ''}</div>
        </div>
        <h1 style="font-size: 38px; font-weight: 800; margin: 0 0 12px 0; line-height: 1.3; text-shadow: 0 2px 4px rgba(0,0,0,0.15);">${title}</h1>
        <div style="display: flex; gap: 24px; margin-top: 18px; flex-wrap: wrap;">
          <div style="background: rgba(255,255,255,0.18); padding: 10px 18px; border-radius: 10px; backdrop-filter: blur(4px);">
            <div style="font-size: 11px; opacity: 0.85;">الكيان</div>
            <div style="font-size: 16px; font-weight: 700; margin-top: 2px;">${entityLabel || '—'}</div>
          </div>
          <div style="background: rgba(255,255,255,0.18); padding: 10px 18px; border-radius: 10px; backdrop-filter: blur(4px);">
            <div style="font-size: 11px; opacity: 0.85;">عدد السجلات</div>
            <div style="font-size: 16px; font-weight: 700; margin-top: 2px;">${toLatinDigits(results.length)}</div>
          </div>
          <div style="background: rgba(255,255,255,0.18); padding: 10px 18px; border-radius: 10px; backdrop-filter: blur(4px);">
            <div style="font-size: 11px; opacity: 0.85;">عدد الأعمدة</div>
            <div style="font-size: 16px; font-weight: 700; margin-top: 2px;">${toLatinDigits(fields.length)}</div>
          </div>
          <div style="background: rgba(255,255,255,0.18); padding: 10px 18px; border-radius: 10px; backdrop-filter: blur(4px);">
            <div style="font-size: 11px; opacity: 0.85;">تاريخ الإصدار</div>
            <div style="font-size: 16px; font-weight: 700; margin-top: 2px;">${today}</div>
          </div>
        </div>
      </div>
    </div>

    <div style="padding: 32px 40px;">
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0;">
        <thead>
          <tr style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);">
            <th style="padding: 14px 10px; text-align: center; font-weight: 700; color: #334155; border-bottom: 2px solid ${accent}; width: 44px;">#</th>
            ${headers.map((h) => `<th style="padding: 14px 12px; text-align: right; font-weight: 700; color: #334155; border-bottom: 2px solid ${accent}; white-space: nowrap;">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${results.map((row, i) => `
            <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 12px 10px; text-align: center; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${toLatinDigits(i + 1)}</td>
              ${fields.map((f) => `<td style="padding: 12px; text-align: right; color: #0f172a; border-bottom: 1px solid #f1f5f9; unicode-bidi: plaintext;">${renderCellForPoster(getNestedValue(row, f))}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="background: #f8fafc; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0;">
      <div style="font-size: 12px; color: #64748b;">تم الإنشاء بواسطة نظام الأوامر الذكية • ${today}</div>
      <div style="font-size: 12px; color: ${accent}; font-weight: 700;">صفحة 1 من 1</div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${title || 'تقرير'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    document.body.removeChild(container);
  }
}