// تصدير نتائج التقرير الذكي كبوستر/صورة PNG احترافية
// • هوية بصرية أزرق + سماوي مستوحاة من تجمع المدينة المنورة الصحي
// • عنوان WordArt ذهبي محفور بظل
// • شعار التجمع من إعدادات النظام (LogoSettings) + خلفية مائية
import html2canvas from 'html2canvas';
import { base44 } from '@/api/base44Client';
import { getNestedValue, toLatinDigits, formatLatinDate } from './excelExporter';
import { MHC_COLORS, MHC_GRADIENTS, MHC_ASSETS, MHC_FONT, MHC_TEXTS, MHC_LOGO_SPEC } from '../branding/madinahCluster';
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
  // 🔧 استخدام Cairo (محمَّل عالمياً في index.css) كخط أساسي لتفادي تكسر الحروف في html2canvas
  container.style.fontFamily = "'Cairo', 'Tajawal', 'Segoe UI', Arial, sans-serif";
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
    <!-- 📐 القالب الرسمي الموحّد: خلفية بانورامية رسمية + شعار في الزاوية اليمنى العلوية -->
    <div style="position: relative; overflow: hidden;">
      <!-- الترويسة: خلفية القالب الرسمي (تدرّج أزرق + منحنيات) -->
      <div style="position: relative; z-index: 1; background-image: url('${MHC_ASSETS.officialReportTemplate}'); background-size: cover; background-position: center; padding: 36px 44px 44px 44px; color: #fff; min-height: 240px;">
        <!-- شعار التجمع في الزاوية اليمنى العلوية بنفس الحجم والتموضع الرسمي -->
        <div style="position: absolute; top: ${MHC_LOGO_SPEC.topPx}px; right: ${MHC_LOGO_SPEC.rightPx}px; z-index: 3;">
          <img src="${logo_url}" alt="شعار التجمع" style="height: ${MHC_LOGO_SPEC.heightPxWide}px; width: auto; object-fit: contain; display: block;" crossorigin="anonymous" />
        </div>

        <!-- العنوان والمعلومات الفرعية في وسط الترويسة -->
        <div style="position: relative; z-index: 2; max-width: 70%; margin-top: 24px;">
          <h1 style="${wordArtTitleStyle}">${title}</h1>
          <div style="font-size: 14px; opacity: 0.92; margin-top: 8px; color: #fff;">${footer_text_1}</div>
        </div>
      </div>

      <!-- جدول البيانات -->
      <div style="position: relative; z-index: 1; padding: 28px 36px; background: #ffffff;">
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
    // 🔧 انتظر تحميل الخطوط أولاً (Cairo + Tajawal) لتفادي تكسر الحروف العربية
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.load("700 16px Cairo");
        await document.fonts.load("900 42px Cairo");
        await document.fonts.ready;
      } catch (_) { /* ignore */ }
    }

    // انتظر تحميل صورة الشعار قبل الالتقاط
    const imgs = container.querySelectorAll('img');
    await Promise.all(Array.from(imgs).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    }));

    // تأخير بسيط إضافي للتأكد من اكتمال الرسم
    await new Promise((r) => setTimeout(r, 250));

    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      letterRendering: true,
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