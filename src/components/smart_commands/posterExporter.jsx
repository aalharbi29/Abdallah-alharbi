// تصدير نتائج التقرير الذكي كبوستر/صورة PNG احترافية
// • هوية بصرية أزرق + سماوي مستوحاة من تجمع المدينة المنورة الصحي
// • عنوان WordArt ذهبي محفور بظل
// • شعار التجمع من إعدادات النظام (LogoSettings) + خلفية مائية
import html2canvas from 'html2canvas';
import { base44 } from '@/api/base44Client';
import { getNestedValue, toLatinDigits, formatLatinDate } from './excelExporter';

const DEFAULT_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/ebae7336b_1407.png";
const DEFAULT_FOOTER_1 = "شؤون المراكز الصحية بالحسو - مستشفى الحسو العام";
const DEFAULT_FOOTER_2 = "تجمع المدينة المنورة الصحي";

// لوحة الألوان: أزرق ملكي + سماوي + ذهبي للنصوص الفنية
const PALETTE = {
  navy: '#0B3D91',
  blue: '#1E63D6',
  sky: '#3FA9F5',
  skyLight: '#E0F2FE',
  gold1: '#FFE27A',
  gold2: '#D4A017',
  gold3: '#8A5A00',
  inkDark: '#0F172A',
  inkSoft: '#475569',
  paper: '#FFFFFF',
  rowAlt: '#F1F8FF',
  border: '#CBD5E1',
};

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

// تحميل إعدادات الشعار من قاعدة البيانات (مرة واحدة عند الاستدعاء)
async function loadLogoSettings() {
  try {
    const records = await base44.entities.LogoSettings.list('-updated_date', 1);
    if (records.length > 0) {
      return {
        logo_url: records[0].logo_url || DEFAULT_LOGO_URL,
        footer_text_1: records[0].footer_text_1 || DEFAULT_FOOTER_1,
        footer_text_2: records[0].footer_text_2 || DEFAULT_FOOTER_2,
      };
    }
  } catch (_) { /* ignore */ }
  return { logo_url: DEFAULT_LOGO_URL, footer_text_1: DEFAULT_FOOTER_1, footer_text_2: DEFAULT_FOOTER_2 };
}

export async function exportAsPoster({ title, results, fields, labelFor, entityLabel, isFree }) {
  if (!results || results.length === 0) throw new Error('لا توجد بيانات للتصدير.');

  const { logo_url, footer_text_1, footer_text_2 } = await loadLogoSettings();
  const headers = fields.map((f) => labelFor(f));
  const today = formatLatinDate();

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '0';
  container.style.width = '1240px';
  container.style.background = '#ffffff';
  container.style.padding = '0';
  container.style.fontFamily = "'Cairo', 'Segoe UI', Arial, sans-serif";
  container.dir = 'rtl';

  // عنوان ذهبي محفور بظل — بدون background-clip (لتجنّب كسر النصوص العربية في html2canvas)
  const wordArtTitleStyle = `
    font-size: 44px;
    font-weight: 900;
    line-height: 1.4;
    letter-spacing: 0;
    color: ${PALETTE.gold1};
    -webkit-text-stroke: 1px ${PALETTE.gold3};
    text-shadow:
      1px 1px 0 ${PALETTE.gold2},
      2px 2px 0 ${PALETTE.gold3},
      3px 3px 0 rgba(0,0,0,0.35),
      4px 5px 8px rgba(0,0,0,0.55);
    margin: 0;
    padding: 6px 0 4px 0;
    direction: rtl;
  `;

  container.innerHTML = `
    <!-- خلفية مائية بشعار التجمع -->
    <div style="position: relative; overflow: hidden;">
      <div style="position: absolute; inset: 0; background-image: url('${logo_url}'); background-repeat: no-repeat; background-position: center 380px; background-size: 620px auto; opacity: 0.05; pointer-events: none; z-index: 0;"></div>

      <!-- شريط علوي: تدرّج أزرق ملكي → سماوي -->
      <div style="position: relative; z-index: 1; background: linear-gradient(135deg, ${PALETTE.navy} 0%, ${PALETTE.blue} 55%, ${PALETTE.sky} 100%); padding: 28px 44px; color: #fff; overflow: hidden;">
        <div style="position: absolute; top: -70px; left: -70px; width: 240px; height: 240px; background: rgba(255,255,255,0.10); border-radius: 50%;"></div>
        <div style="position: absolute; bottom: -90px; right: -50px; width: 320px; height: 320px; background: rgba(255,255,255,0.07); border-radius: 50%;"></div>
        <div style="position: absolute; top: 30%; right: 35%; width: 140px; height: 140px; background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%);"></div>

        <div style="position: relative; z-index: 2; display: flex; align-items: center; gap: 22px;">
          <!-- شعار رسمي -->
          <div style="background: rgba(255,255,255,0.95); padding: 10px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <img src="${logo_url}" alt="شعار التجمع" style="width: 110px; height: 110px; object-fit: contain; display: block;" crossorigin="anonymous" />
          </div>

          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 600; opacity: 0.92; letter-spacing: 0.6px; margin-bottom: 4px;">
              ${footer_text_2} ${isFree ? '• 🧠 مولّد بالذكاء الاصطناعي' : ''}
            </div>
            <h1 style="${wordArtTitleStyle}">${title}</h1>
            <div style="font-size: 13px; opacity: 0.92; margin-top: 6px;">${footer_text_1}</div>
          </div>
        </div>

        <!-- شريط إحصائيات -->
        <div style="position: relative; z-index: 2; display: flex; gap: 14px; margin-top: 20px; flex-wrap: wrap;">
          ${[
            ['الكيان', entityLabel || '—'],
            ['عدد السجلات', toLatinDigits(results.length)],
            ['عدد الأعمدة', toLatinDigits(fields.length)],
            ['تاريخ الإصدار', today],
          ].map(([k, v]) => `
            <div style="background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.25); padding: 10px 18px; border-radius: 10px; min-width: 140px;">
              <div style="font-size: 11px; opacity: 0.85;">${k}</div>
              <div style="font-size: 16px; font-weight: 700; margin-top: 2px;">${v}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- شريط ذهبي رفيع فاصل -->
      <div style="height: 6px; background: linear-gradient(90deg, ${PALETTE.gold3} 0%, ${PALETTE.gold2} 50%, ${PALETTE.gold1} 100%); position: relative; z-index: 1;"></div>

      <!-- جدول البيانات -->
      <div style="position: relative; z-index: 1; padding: 28px 36px;">
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; background: ${PALETTE.paper}; border-radius: 14px; overflow: hidden; box-shadow: 0 6px 24px rgba(11, 61, 145, 0.10); border: 1px solid ${PALETTE.border};">
          <thead>
            <tr style="background: linear-gradient(180deg, ${PALETTE.navy} 0%, ${PALETTE.blue} 100%);">
              <th style="padding: 14px 10px; text-align: center; font-weight: 800; color: ${PALETTE.gold1}; border-bottom: 3px solid ${PALETTE.gold2}; width: 44px; text-shadow: 0 1px 2px rgba(0,0,0,0.4);">#</th>
              ${headers.map((h) => `<th style="padding: 14px 12px; text-align: right; font-weight: 800; color: #fff; border-bottom: 3px solid ${PALETTE.gold2}; white-space: nowrap;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${results.map((row, i) => `
              <tr style="background: ${i % 2 === 0 ? PALETTE.paper : PALETTE.rowAlt};">
                <td style="padding: 12px 10px; text-align: center; color: ${PALETTE.blue}; font-weight: 700; border-bottom: 1px solid ${PALETTE.skyLight};">${toLatinDigits(i + 1)}</td>
                ${fields.map((f) => `<td style="padding: 12px; text-align: right; color: ${PALETTE.inkDark}; border-bottom: 1px solid ${PALETTE.skyLight}; unicode-bidi: plaintext;">${renderCellForPoster(getNestedValue(row, f))}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- تذييل: شريط أزرق-سماوي مع نصوص الإعدادات -->
      <div style="position: relative; z-index: 1; background: linear-gradient(90deg, ${PALETTE.navy} 0%, ${PALETTE.blue} 50%, ${PALETTE.sky} 100%); padding: 18px 40px; display: flex; justify-content: space-between; align-items: center; color: #fff;">
        <div style="font-size: 12px; opacity: 0.95;">${footer_text_1}</div>
        <div style="font-size: 13px; font-weight: 800; color: ${PALETTE.gold1}; text-shadow: 0 1px 2px rgba(0,0,0,0.45);">${footer_text_2}</div>
        <div style="font-size: 12px; opacity: 0.95;">${today}</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // انتظر تحميل صورة الشعار قبل الالتقاط
    const imgs = container.querySelectorAll('img');
    await Promise.all(Array.from(imgs).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    }));

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