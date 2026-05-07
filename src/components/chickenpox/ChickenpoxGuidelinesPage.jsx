import React from 'react';
import { MHC_LOGO_URL } from './ChickenpoxFormStyles';

const sectionTitle = {
  color: '#2E9E4E',
  fontSize: '12pt',
  fontWeight: 700,
  marginTop: '12px',
  marginBottom: '6px',
};

const listItem = {
  fontSize: '10pt',
  lineHeight: 1.8,
  marginBottom: '4px',
  paddingRight: '14px',
  position: 'relative',
};

// صفحة عرض فقط - إرشادات الإجراءات الوقائية (لا تطبع/لا تصدر/لا تحفظ)
export default function ChickenpoxGuidelinesPage() {
  return (
    <div className="guidelines-page" style={{
      width: '210mm',
      minHeight: '297mm',
      background: '#fff',
      padding: '15mm 14mm',
      fontFamily: "'Tajawal', 'Cairo', 'Arial', sans-serif",
      direction: 'rtl',
      color: '#000',
      position: 'relative',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    }}>
      {/* خلفية موجة زرقاء سفلية */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50mm',
        background: 'linear-gradient(180deg, transparent 0%, #E3F2FD 60%, #BBDEFB 100%)',
        clipPath: 'polygon(0 30%, 25% 50%, 50% 35%, 75% 55%, 100% 40%, 100% 100%, 0 100%)',
        opacity: 0.6,
        pointerEvents: 'none',
      }} />

      {/* الرأس - الشعار + العنوان */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
        <div style={{ flex: 1 }} />
        <h2 style={{ fontSize: '16pt', fontWeight: 700, margin: 0, textAlign: 'center', flex: 2 }}>
          الإجراءات الوقائية لحالة جديري مائي
        </h2>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <img
            src={MHC_LOGO_URL}
            alt="تجمع المدينة المنورة الصحي"
            style={{ height: '60px', width: 'auto' }}
            crossOrigin="anonymous"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>

      {/* المحتوى */}
      <div style={{ position: 'relative', zIndex: 2, paddingRight: '6mm' }}>
        <div style={sectionTitle}>الإجراءات الوقائية:</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={listItem}>• الإبلاغ الفوري.</li>
          <li style={listItem}>• متابعة التقصي.</li>
          <li style={listItem}>• عزل المريض لمدة أسبوع (عزل هوائي سلبي).</li>
          <li style={listItem}>• تجنب الاتصال مع الأشخاص الضعفاء.</li>
          <li style={listItem}>• استبعاد المصابين من المدرسة والبالغين من أماكن عملهم لمدة أسبوع بعد أول ظهور للطفح.</li>
          <li style={listItem}>• حصر المخالطين.</li>
          <li style={listItem}>• تطعيم المخالطين (يعطى الغلوبولين للفئات ذات العوز المناعي / الحوامل / حديثي الولادة)</li>
          <li style={{ ...listItem, fontStyle: 'italic' }}>* يتم عزل المخالطين لمدة 21 يوم في حال عدم توفر اللقاح أو رفض المريض لأخذ اللقاح *</li>
        </ul>

        <div style={sectionTitle}>فترة الحضانة:</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={listItem}>• قد تستغرق من 2 إلى 3 أسابيع وغالباً من 12 إلى 16 يوم.</li>
        </ul>

        <div style={sectionTitle}>مدة العدوى:</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={listItem}>• تمتد 5 أيام قبل بدء الطفح ولا تتعدى 6 أيام بعد ظهور المجموعة الأولى من الحويصلات.</li>
        </ul>

        <div style={sectionTitle}>مصدر العدوى:</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={listItem}>• الإنسان هو المصدر الوحيد لهذا الفيروس.</li>
        </ul>

        <div style={sectionTitle}>الأعراض والعلامات:</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={listItem}>• الأعراض الأولية تشمل حمى خفيفة وأعراض بدنية طفيفة.</li>
          <li style={listItem}>• طفح جلدي على شكل بقع حطاطية ثم يتطور إلى حويصلات تستمر لمدة 3 - 4 أيام وتترك قشور حبيبية.</li>
          <li style={listItem}>• توزيع ظهور الطفح: أعلى فروة الرأس، أعلى الإبط، الأغشية المخاطية للفم والجهاز التنفسي العلوي، وعلى الملتحمة.</li>
          <li style={listItem}>• حالات خاصة في الرضع: يصاب الرضيع بشكل خطير إذا أصيبت الأم في الخمسة أيام الأخيرة قبل الولادة أو خلال يومين بعد الولادة.</li>
          <li style={listItem}>• متلازمة الجديري المائي الخلقي: 0.4 - 2.0 % من الأطفال المولودين من أمهات أصبن بالجديري المائي خلال الثلث الأول أو الثاني من الحمل وتتميز بتشوهات جلدية، التهاب الدماغ، صغر حجم الرأس، تشوهات في العين، تخلف عقلي، وانخفاض في الوزن.</li>
        </ul>
      </div>

      {/* اسم التجمع في الأسفل */}
      <div style={{ position: 'absolute', bottom: '8mm', left: '14mm', textAlign: 'left', zIndex: 3 }}>
        <div style={{ fontSize: '14pt', fontWeight: 800, color: '#1976D2' }}>تجمع المدينة المنورة الصحي</div>
        <div style={{ fontSize: '10pt', fontWeight: 700, color: '#1976D2' }}>Madinah Health Cluster</div>
        <div style={{ fontSize: '7pt', color: '#1976D2' }}>Empowered by Health Holding co.</div>
      </div>
    </div>
  );
}