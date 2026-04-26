// تصدير نتائج التقرير الذكي كبوستر/صورة PNG احترافية
// • هوية بصرية أزرق + سماوي مستوحاة من تجمع المدينة المنورة الصحي
// • عنوان WordArt ذهبي محفور بظل
// • شعار التجمع من إعدادات النظام (LogoSettings) + خلفية مائية
import html2canvas from 'html2canvas';
import { base44 } from '@/api/base44Client';
import { getNestedValue, toLatinDigits, formatLatinDate } from './excelExporter';
import { MHC_COLORS, MHC_GRADIENTS, MHC_ASSETS, MHC_FONT, MHC_TEXTS } from '../branding/madinahCluster';
import { getBrandBackgroundPref } from '../branding/useBrandBackground';

const DEFAULT_LOGO_URL = MHC_ASSETS.logo;
const DEFAULT_FOOTER_1 = "شؤون المراكز الصحية بالحسو - مستشفى الحسو العام";
const DEFAULT_FOOTER_2 = MHC_TEXTS.arabicName;

// 🎨 لوحة الألوان الرسمية لتجمع المدينة المنورة الصحي
const PALETTE = {
  navy: MHC_COLORS.navy,
  navyDark: MHC_COLORS.navyDark,
  blue: MHC_COLORS.blue,
  sky: MHC_COLORS.skyLight,
  skyLight: '#E0F2FE',
  teal: MHC_COLORS.teal,
  tealLight: MHC_COLORS.tealLight,
  inkDark: MHC_COLORS.ink,
  inkSoft: MHC_COLORS.inkSoft,
  paper: MHC_COLORS.paper,
  rowAlt: MHC_COLORS.rowAlt,
  border: MHC_COLORS.border,
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

  const useBg = getBrandBackgroundPref('poster', true);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '0';
  container.style.width = '1240px';
  container.style.background = '#ffffff';
  container.style.padding = '0';
  container.style.fontFamily = MHC_FONT.family;
  container.dir = 'rtl';

  // 🏷️ عنوان أبيض رسمي بظلال (هوية تجمع المدينة المنورة)
  const wordArtTitleStyle = `
    font-size: 42px;
    font-weight: 900;
    line-height: 1.4;
    letter-spacing: 0;
    color: #FFFFFF;
    text-shadow:
      0 1px 2px rgba(0,0,0,0.30),
      0 2px 6px rgba(0,0,0,0.40),
      0 4px 12px rgba(11,61,145,0.55);
    margin: 0;
    padding: 6px 0 4px 0;
    direction: rtl;
  `;

  container.innerHTML = `
    <!-- خلفية مائية بشعار التجمع + خلفية بانورامية معتمدة (اختيارية) -->
    <div style="position: relative; overflow: hidden;">
      ${useBg ? `<div style="position: absolute; inset: 0; background-image: url('${MHC_ASSETS.backgroundHero}'); background-size: cover; background-position: center; opacity: 0.18; pointer-events: none; z-index: 0;"></div>
      <div style="position: absolute; inset: 0; background: rgba(255,255,255,0.78); pointer-events: none; z-index: 0;"></div>` : ''}
      <div style="position: absolute; inset: 0; background-image: url('${logo_url}'); background-repeat: no-repeat; background-position: center 380px; background-size: 620px auto; opacity: 0.05; pointer-events: none; z-index: 0;"></div>

      <!-- شريط علوي: التدرّج الرسمي لتجمع المدينة المنورة -->
      <div style="position: relative; z-index: 1; background: ${MHC_GRADIENTS.primary}; padding: 28px 44px; color: #fff; overflow: hidden;">
        <div style="position: absolute; top: -70px; left: -70px; width: 240px; height: 240px; background: rgba(255,255,255,0.10); border-radius: 50%;"></div>
        <div style="position: absolute; bottom: -90px; right: -50px; width: 320px; height: 320px; background: rgba(255,255,255,0.07); border-radius: 50%;"></div>
        <div style="position: absolute; top: 30%; right: 35%; width: 140px; height: 140px; background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%);"></div>

        <div style="position: relative; z-index: 2; display: flex; align-items: center; gap: 22px;">
          <!-- شعار رسمي -->
          <div style="background: rgba(255,255,255,0.95); padding: 10px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <img src="${logo_url}" alt="شعار التجمع" style="width: 110px; height: 110px; object-fit: contain; display: block;" crossorigin="anonymous" />
          </div>

          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 700; opacity: 0.95; letter-spacing: 0.6px; margin-bottom: 4px;">
              ${footer_text_2} • ${MHC_TEXTS.englishName} ${isFree ? '• 🧠 مولّد بالذكاء الاصطناعي' : ''}
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

      <!-- شريط فيروزي رفيع فاصل (هوية التجمع) -->
      <div style="height: 5px; background: linear-gradient(90deg, ${PALETTE.teal} 0%, ${PALETTE.tealLight} 50%, ${PALETTE.sky} 100%); position: relative; z-index: 1;"></div>

      <!-- جدول البيانات -->
      <div style="position: relative; z-index: 1; padding: 28px 36px;">
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; background: ${PALETTE.paper}; border-radius: 14px; overflow: hidden; box-shadow: 0 6px 24px rgba(11, 61, 145, 0.10); border: 1px solid ${PALETTE.border};">
          <thead>
            <tr style="background: linear-gradient(180deg, ${PALETTE.navy} 0%, ${PALETTE.blue} 100%);">
              <th style="padding: 14px 10px; text-align: center; font-weight: 800; color: #fff; border-bottom: 3px solid ${PALETTE.tealLight}; width: 44px; text-shadow: 0 1px 2px rgba(0,0,0,0.4);">#</th>
              ${headers.map((h) => `<th style="padding: 14px 12px; text-align: right; font-weight: 800; color: #fff; border-bottom: 3px solid ${PALETTE.tealLight}; white-space: nowrap;">${h}</th>`).join('')}
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

      <!-- تذييل رسمي: التدرّج الموحّد للهوية البصرية -->
      <div style="position: relative; z-index: 1; background: ${MHC_GRADIENTS.divider}; padding: 18px 40px; display: flex; justify-content: space-between; align-items: center; color: #fff;">
        <div style="font-size: 12px; opacity: 0.95;">${footer_text_1}</div>
        <div style="font-size: 13px; font-weight: 800; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.40);">${footer_text_2} • ${MHC_TEXTS.socialHandle}</div>
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