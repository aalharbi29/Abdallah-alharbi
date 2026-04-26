// 🎨 الهوية البصرية الرسمية لتجمع المدينة المنورة الصحي (Madinah Health Cluster)
// مرجع موحّد للألوان، الخطوط، الشعار، الخلفيات، والأيقونات في كل النظام.
// أي تعديل على الهوية البصرية يجب أن يتم من هذا الملف فقط لضمان التناسق.

// 🟦 لوحة الألوان الرسمية (مستخرجة من Color Palette الرسمي)
export const MHC_COLORS = {
  // الصف الأول: درجات الأزرق (الأساسية)
  skyLight: '#3FA9F5',     // أزرق سماوي فاتح
  blue: '#1E63D6',          // أزرق ملكي متوسط
  navy: '#0B3D91',          // أزرق كحلي عميق

  // الصف الثاني: درجات داكنة وفيروزية
  navyDark: '#0A2A5E',      // كحلي داكن جداً
  teal: '#0F7884',          // فيروزي داكن
  tealLight: '#5BC2C7',     // فيروزي فاتح

  // الصف الثالث: لمسات تمييز
  blueAccent: '#1976D2',    // أزرق لافت (للأيقونات والروابط)
  green: '#2E9E4E',         // أخضر طبي
  greenLime: '#7DC242',     // أخضر فاتح

  // ألوان مساعدة
  white: '#FFFFFF',
  paper: '#FFFFFF',
  rowAlt: '#F1F8FF',        // خلفية صف بديل (سماوي شفاف)
  ink: '#0F172A',           // نص أساسي داكن
  inkSoft: '#475569',       // نص ثانوي
  border: '#CBD5E1',        // حدود رمادية
};

// 🌈 تدرّجات جاهزة للاستخدام في الهيدرات والبطاقات
export const MHC_GRADIENTS = {
  // التدرّج الرئيسي (هيدر البوسترات والبطاقات)
  primary: `linear-gradient(135deg, ${MHC_COLORS.navyDark} 0%, ${MHC_COLORS.navy} 40%, ${MHC_COLORS.blue} 75%, ${MHC_COLORS.skyLight} 100%)`,
  // تدرّج عمودي للبطاقات الأنيقة
  card: `linear-gradient(180deg, ${MHC_COLORS.navy} 0%, ${MHC_COLORS.blue} 100%)`,
  // تدرّج خفيف للخلفيات
  soft: `linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)`,
  // شريط فاصل سفلي/علوي
  divider: `linear-gradient(90deg, ${MHC_COLORS.navy} 0%, ${MHC_COLORS.blue} 50%, ${MHC_COLORS.skyLight} 100%)`,
  // فيروزي + أخضر (للحالات الإيجابية)
  accent: `linear-gradient(135deg, ${MHC_COLORS.teal} 0%, ${MHC_COLORS.tealLight} 100%)`,
};

// 🖼️ الشعار الرسمي + خلفيات الهوية البصرية (روابط مرفوعة على Base44)
export const MHC_ASSETS = {
  // الشعار الرسمي (نجمة + نص "تجمع المدينة المنورة الصحي")
  logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/ebae7336b_1407.png',
  // خلفيات بانورامية (من الهوية البصرية)
  backgroundHero: 'https://media.base44.com/images/public/68af5003813e47bd07947b30/0ec84e3e8_1.png',         // خلفية مبنى التجمع مع زخارف
  backgroundClean: 'https://media.base44.com/images/public/68af5003813e47bd07947b30/fbf089b8b_3.png',        // خلفية أزرق نقي مع منحنيات
  backgroundCardSlide: 'https://media.base44.com/images/public/68af5003813e47bd07947b30/4752d3002_4.png',    // قالب بطاقات أفقية
  backgroundIcons: 'https://media.base44.com/images/public/68af5003813e47bd07947b30/86eed6a4f_5.png',        // قالب الأيقونات الستة
  backgroundCards3D: 'https://media.base44.com/images/public/68af5003813e47bd07947b30/52ee7818b_6.png',       // قالب 3 بطاقات أنيقة
  backgroundFooterBlue: 'https://media.base44.com/images/public/68af5003813e47bd07947b30/3dfd64dab_8.png',    // خلفية بإطار سفلي
  backgroundClosing: 'https://media.base44.com/images/public/68af5003813e47bd07947b30/91de95037_7.png',       // خلفية إنهاء أزرق نقي
  backgroundSidebar: 'https://media.base44.com/images/public/68af5003813e47bd07947b30/850355196_9.png',       // خلفية بشريط جانبي
  backgroundSocial: 'https://media.base44.com/images/public/68af5003813e47bd07947b30/5a98f2ed0_11.png',       // خلفية ختامية بقنوات التواصل
  designSystem: 'https://media.base44.com/images/public/68af5003813e47bd07947b30/6c09c5feb_10.png',          // ورقة الهوية الكاملة (مرجع)
};

// 🔤 الخط الرسمي البديل (Tajawal كبديل لـ Janna LT — متوفر مجاناً ومشابه شكلاً)
export const MHC_FONT = {
  family: "'Tajawal', 'Cairo', 'Segoe UI', Arial, sans-serif",
  importUrl: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap',
  weights: { regular: 400, medium: 500, bold: 700, black: 900 },
};

// 🏷️ نصوص رسمية ثابتة
export const MHC_TEXTS = {
  arabicName: 'تجمع المدينة المنورة الصحي',
  englishName: 'Madinah Health Cluster',
  tagline: 'شراكة الصحة المتكاملة',
  socialHandle: '@Med_Cluster',
};

// 📐 أبعاد قياسية للبطاقات والمستندات
export const MHC_LAYOUT = {
  cardRadius: '16px',
  innerRadius: '12px',
  shadowSoft: '0 4px 12px rgba(11, 61, 145, 0.08)',
  shadowMedium: '0 8px 24px rgba(11, 61, 145, 0.15)',
  shadowStrong: '0 12px 32px rgba(11, 61, 145, 0.25)',
};

// 🎯 توليد عنصر هيدر رسمي (HTML string) — للاستخدام في البوسترات وملفات التصدير
export const buildOfficialHeaderHTML = ({ title, subtitle = '', stats = [] } = {}) => {
  const statsHTML = stats.map(([k, v]) => `
    <div style="background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.28); padding: 10px 18px; border-radius: 10px; min-width: 140px;">
      <div style="font-size: 11px; opacity: 0.85;">${k}</div>
      <div style="font-size: 16px; font-weight: 700; margin-top: 2px;">${v}</div>
    </div>
  `).join('');

  return `
    <div style="position: relative; background: ${MHC_GRADIENTS.primary}; padding: 28px 44px; color: #fff; overflow: hidden; font-family: ${MHC_FONT.family};">
      <div style="position: absolute; top: -70px; left: -70px; width: 240px; height: 240px; background: rgba(255,255,255,0.10); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -90px; right: -50px; width: 320px; height: 320px; background: rgba(255,255,255,0.07); border-radius: 50%;"></div>
      <div style="position: relative; z-index: 2; display: flex; align-items: center; gap: 22px;">
        <div style="background: rgba(255,255,255,0.95); padding: 10px; border-radius: 16px; box-shadow: ${MHC_LAYOUT.shadowMedium}; flex-shrink: 0;">
          <img src="${MHC_ASSETS.logo}" alt="شعار التجمع" style="width: 100px; height: 100px; object-fit: contain; display: block;" crossorigin="anonymous" />
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; font-weight: 600; opacity: 0.92; letter-spacing: 0.6px; margin-bottom: 6px;">${MHC_TEXTS.arabicName} • ${MHC_TEXTS.englishName}</div>
          <h1 style="font-size: 36px; font-weight: 900; margin: 0; padding: 4px 0; color: #fff; text-shadow: 0 2px 6px rgba(0,0,0,0.35); line-height: 1.4;">${title}</h1>
          ${subtitle ? `<div style="font-size: 14px; opacity: 0.92; margin-top: 4px;">${subtitle}</div>` : ''}
        </div>
      </div>
      ${stats.length > 0 ? `<div style="position: relative; z-index: 2; display: flex; gap: 14px; margin-top: 20px; flex-wrap: wrap;">${statsHTML}</div>` : ''}
    </div>
    <div style="height: 4px; background: ${MHC_GRADIENTS.divider};"></div>
  `;
};

// 🎯 توليد فوتر رسمي (HTML string)
export const buildOfficialFooterHTML = ({ leftText = '', rightText = MHC_TEXTS.arabicName, centerText = '' } = {}) => {
  return `
    <div style="background: ${MHC_GRADIENTS.divider}; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; color: #fff; font-family: ${MHC_FONT.family};">
      <div style="font-size: 12px; opacity: 0.95;">${leftText}</div>
      <div style="font-size: 13px; font-weight: 700;">${centerText}</div>
      <div style="font-size: 13px; font-weight: 800; opacity: 0.95;">${rightText}</div>
    </div>
  `;
};