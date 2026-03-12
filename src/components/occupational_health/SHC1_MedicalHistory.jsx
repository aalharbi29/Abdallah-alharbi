import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const YesNoUnknown = ({ label, name, value, onChange, lang }) => {
  const isAr = lang === 'ar';
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
      <span className="text-sm flex-1">{label}</span>
      <div className="flex gap-4">
        {['yes', 'no', 'unknown'].map(opt => (
          <label key={opt} className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="radio"
              name={name}
              checked={value === opt}
              onChange={() => onChange(name, opt)}
              className="w-3.5 h-3.5"
            />
            {opt === 'yes' ? (isAr ? 'نعم' : 'YES') : opt === 'no' ? (isAr ? 'لا' : 'NO') : (isAr ? 'غير معروف' : 'Unknown')}
          </label>
        ))}
      </div>
    </div>
  );
};

const YesNo = ({ label, name, value, onChange, lang }) => {
  const isAr = lang === 'ar';
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
      <span className="text-sm flex-1">{label}</span>
      <div className="flex gap-4">
        {['yes', 'no'].map(opt => (
          <label key={opt} className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="radio"
              name={name}
              checked={value === opt}
              onChange={() => onChange(name, opt)}
              className="w-3.5 h-3.5"
            />
            {opt === 'yes' ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No')}
          </label>
        ))}
      </div>
    </div>
  );
};

export default function SHC1_MedicalHistory({ data, onChange, lang = 'ar' }) {
  const isAr = lang === 'ar';
  const d = data || {};

  const set = (field, val) => onChange({ ...d, [field]: val });

  const familyConditions = [
    { en: 'Diabetes', ar: 'السكري' },
    { en: 'Easy Bleeding', ar: 'سهولة النزيف' },
    { en: 'Obesity', ar: 'السمنة' },
    { en: 'Allergy', ar: 'الحساسية' },
    { en: 'Hypertension', ar: 'ارتفاع ضغط الدم' },
    { en: 'Alcoholism', ar: 'الكحول' },
    { en: 'Asthma', ar: 'الربو' },
    { en: 'Cancer', ar: 'السرطان' },
    { en: 'Heart troubles', ar: 'أمراض القلب' },
    { en: 'T.B', ar: 'السل' },
    { en: 'Psychiatric illness', ar: 'أمراض نفسية' },
  ];

  const reviewSystems = [
    { category: 'CARDIOVASCULAR', categoryAr: 'القلب والأوعية', items: ['High Blood Pressure', 'High Cholesterol', 'Heart Attack', 'Stroke'] },
    { category: 'ENDOCRINE', categoryAr: 'الغدد الصماء', items: ['Type I Diabetes', 'Type II Diabetes', 'Diabetic Suspect', 'Thyroid Disorder', "Crohn's Disease"] },
    { category: 'ALLERGY', categoryAr: 'الحساسية', items: ['Allergy to medications', 'Contact Allergy'] },
    { category: 'GASTROINTESTINAL', categoryAr: 'الجهاز الهضمي', items: ['Colon Cancer', 'Liver Cancer', 'Gall Stones', 'Hepatitis', 'Inflammatory Bowel'] },
    { category: 'GENITOURINARY', categoryAr: 'الجهاز البولي', items: ['Kidney Stones', 'Prostate Cancer'] },
    { category: 'EARS, NOSE, MOUTH, THROAT', categoryAr: 'الأذن والأنف والحنجرة', items: ['Hearing Loss', 'Chronic Cough'] },
    { category: 'HEMATOLOGIC/LYMPHATIC', categoryAr: 'الدم والليمفاوي', items: ['Anemia', 'Breast Cancer', 'Leukemia', 'Lymphatic Cancer'] },
    { category: 'IMMUNOLOGIC', categoryAr: 'المناعة', items: ['Chicken Pox', 'Herpes Zoster Virus', 'AIDS/HIV Positive'] },
    { category: 'SKIN', categoryAr: 'الجلد', items: ['Skin Cancer', 'Lupus', 'Psoriasis'] },
    { category: 'MUSCULOSKELETAL', categoryAr: 'العظام والعضلات', items: ['Rheumatoid Arthritis', 'Arthritis', 'Osteoporosis'] },
    { category: 'NEUROLOGICAL', categoryAr: 'الجهاز العصبي', items: ["Bell's Palsy", 'Brain Tumor', "Parkinson's Disease", 'Chronic headache', 'Migraine'] },
    { category: 'PSYCHIATRIC', categoryAr: 'الأمراض النفسية', items: ['Attention Deficit Disorder', 'Anxiety', 'Depression', 'Dementia'] },
    { category: 'RESPIRATORY', categoryAr: 'الجهاز التنفسي', items: ['Asthma', 'Chronic Bronchitis', 'Emphysema', 'COPD', 'Lung Cancer', 'Tuberculosis'] },
  ];

  return (
    <div className="space-y-6 print:text-[11px]" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[#5B9BD5]">
          {isAr ? 'استبيان التاريخ الطبي المهني' : 'Occupational Medical History Questionnaire'}
        </h2>
        <p className="text-xs text-gray-500">SHC1</p>
      </div>

      {/* Personal History */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'التاريخ الشخصي' : 'Personal History'}
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{isAr ? 'رقم الملف الطبي' : 'Medical record number'}</Label>
            <Input value={d.medical_record || ''} onChange={e => set('medical_record', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'الاسم' : 'Name'}</Label>
            <Input value={d.name || ''} onChange={e => set('name', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'العمر' : 'Age'}</Label>
            <Input value={d.age || ''} onChange={e => set('age', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'الجنس' : 'Sex'}</Label>
            <Input value={d.sex || ''} onChange={e => set('sex', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'العنوان' : 'Address'}</Label>
            <Input value={d.address || ''} onChange={e => set('address', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'رقم الهاتف' : 'Telephone Number'}</Label>
            <Input value={d.phone || ''} onChange={e => set('phone', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'جهة اتصال الطوارئ' : 'Emergency Contact'}</Label>
            <Input value={d.emergency_contact || ''} onChange={e => set('emergency_contact', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'تاريخ الميلاد' : 'Date of Birth'}</Label>
            <Input value={d.birth_date || ''} onChange={e => set('birth_date', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'مكان الولادة' : 'Place of Birth'}</Label>
            <Input value={d.place_of_birth || ''} onChange={e => set('place_of_birth', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'الجنسية' : 'Race/Nationality'}</Label>
            <Input value={d.nationality || ''} onChange={e => set('nationality', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'اللغة الأم' : 'Native Language'}</Label>
            <Input value={d.native_language || ''} onChange={e => set('native_language', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'المستوى التعليمي' : 'Educational Level'}</Label>
            <Input value={d.educational_level || ''} onChange={e => set('educational_level', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'الحالة الاجتماعية' : 'Marital Status'}</Label>
            <Input value={d.marital_status || ''} onChange={e => set('marital_status', e.target.value)} className="h-8 text-sm" />
          </div>
        </div>
      </div>

      {/* Department */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'معلومات القسم' : 'Department Information'}
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{isAr ? 'القسم' : 'Department'}</Label>
            <Input value={d.department || ''} onChange={e => set('department', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'المشرف الرئيسي' : 'Principal Supervisor'}</Label>
            <Input value={d.supervisor || ''} onChange={e => set('supervisor', e.target.value)} className="h-8 text-sm" />
          </div>
        </div>
      </div>

      {/* Social Habits */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'العادات الاجتماعية' : 'Social Habits'}
        </div>
        <div className="p-4">
          <div>
            <Label className="text-xs">{isAr ? 'هل تستخدم منتجات التبغ؟ اذكر النوع:' : 'Do you use tobacco products? Mention type:'}</Label>
            <Input value={d.tobacco || ''} onChange={e => set('tobacco', e.target.value)} className="h-8 text-sm mt-1" />
          </div>
        </div>
      </div>

      {/* Family History */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'التاريخ العائلي' : 'Family History'}
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">{isAr ? 'حدد إذا كان هناك تاريخ عائلي لأي من التالي:' : 'Check if there is any history in your family of:'}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {familyConditions.map(c => (
              <label key={c.en} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={d[`family_${c.en}`] || false}
                  onCheckedChange={v => set(`family_${c.en}`, v)}
                />
                {isAr ? c.ar : c.en}
              </label>
            ))}
            <div className="col-span-2 md:col-span-4">
              <Label className="text-xs">{isAr ? 'أخرى:' : 'Other:'}</Label>
              <Input value={d.family_other || ''} onChange={e => set('family_other', e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <div className="mt-2">
            <Label className="text-xs">{isAr ? 'اشرح:' : 'Please explain:'}</Label>
            <Textarea value={d.family_explain || ''} onChange={e => set('family_explain', e.target.value)} className="h-16 text-sm" />
          </div>
        </div>
      </div>

      {/* Statement of Present Health */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'بيان الحالة الصحية الحالية' : 'Statement of Present Health'}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <Label className="text-xs">{isAr ? 'هل تتلقى علاجاً أو متابعة لأي حالة طبية حالياً؟' : 'Are you currently being treated or monitored for any medical conditions?'}</Label>
            <Textarea value={d.current_treatment || ''} onChange={e => set('current_treatment', e.target.value)} className="h-16 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'هل تتناول أي أدوية حالياً؟' : 'Are you currently taking any medications?'}</Label>
            <Textarea value={d.current_medications || ''} onChange={e => set('current_medications', e.target.value)} className="h-16 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'هل أجريت عمليات جراحية سابقاً؟' : 'Have you ever had any surgeries?'}</Label>
            <Textarea value={d.surgeries || ''} onChange={e => set('surgeries', e.target.value)} className="h-16 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'هل لديك إصابات أو أمراض في العين؟' : 'Have you ever had any eye injuries or diseases?'}</Label>
            <Textarea value={d.eye_issues || ''} onChange={e => set('eye_issues', e.target.value)} className="h-16 text-sm" />
          </div>
          <YesNo label={isAr ? 'هل تلبس نظارات؟' : 'Do you wear glasses?'} name="glasses" value={d.glasses} onChange={set} lang={lang} />
        </div>
      </div>

      {/* Review of Systems */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'مراجعة الأجهزة' : 'Review of Systems'}
        </div>
        <div className="p-4">
          {reviewSystems.map(sys => (
            <div key={sys.category} className="mb-3">
              <h4 className="font-bold text-sm text-[#5B9BD5] border-b border-[#5B9BD5] pb-1 mb-1">
                {isAr ? sys.categoryAr : sys.category}
              </h4>
              {sys.items.map(item => (
                <YesNoUnknown
                  key={item}
                  label={item}
                  name={`ros_${item}`}
                  value={d[`ros_${item}`]}
                  onChange={set}
                  lang={lang}
                />
              ))}
            </div>
          ))}
          <div className="mt-3">
            <Label className="text-xs">{isAr ? 'حالات إضافية:' : 'List any additional conditions:'}</Label>
            <Textarea value={d.additional_conditions || ''} onChange={e => set('additional_conditions', e.target.value)} className="h-16 text-sm" />
          </div>
        </div>
      </div>

      {/* Past Medical History */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'التاريخ الطبي السابق' : 'Past Medical History'}
        </div>
        <div className="p-4 space-y-3">
          {[
            { en: 'High blood pressure', ar: 'ارتفاع ضغط الدم' },
            { en: 'High Cholesterol', ar: 'ارتفاع الكوليسترول' },
            { en: 'Liver Disease', ar: 'أمراض الكبد' },
            { en: 'Diabetes', ar: 'السكري' },
            { en: 'Thyroid Problems', ar: 'مشاكل الغدة الدرقية' },
            { en: 'Kidney Disease', ar: 'أمراض الكلى' },
            { en: 'Heart Failure', ar: 'فشل القلب' },
            { en: 'Stroke', ar: 'السكتة الدماغية' },
            { en: 'Seizures/Epilepsy', ar: 'تشنجات/صرع' },
            { en: 'Glaucoma', ar: 'المياه الزرقاء' },
            { en: 'Psychiatric Illness', ar: 'أمراض نفسية' },
            { en: 'Arthritis', ar: 'التهاب المفاصل' },
          ].map(c => (
            <label key={c.en} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={d[`pmh_${c.en}`] || false} onCheckedChange={v => set(`pmh_${c.en}`, v)} />
              {isAr ? c.ar : c.en}
            </label>
          ))}
          <YesNo label={isAr ? 'هل سبق لك فحص سل إيجابي؟' : 'Have you ever had Positive Tuberculosis Test?'} name="pmh_tb_positive" value={d.pmh_tb_positive} onChange={set} lang={lang} />
          <YesNo label={isAr ? 'حمى روماتيزمية؟' : 'Rheumatic Fever?'} name="pmh_rheumatic" value={d.pmh_rheumatic} onChange={set} lang={lang} />
          <YesNo label={isAr ? 'نقل دم؟' : 'Blood Transfusion?'} name="pmh_blood_transfusion" value={d.pmh_blood_transfusion} onChange={set} lang={lang} />
          <div>
            <Label className="text-xs">{isAr ? 'العمليات والتنويم:' : 'Hospitalizations/Surgeries:'}</Label>
            <Textarea value={d.pmh_hospitalizations || ''} onChange={e => set('pmh_hospitalizations', e.target.value)} className="h-16 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'حساسية الأدوية:' : 'Drug allergies:'}</Label>
            <Input value={d.pmh_drug_allergies || ''} onChange={e => set('pmh_drug_allergies', e.target.value)} className="h-8 text-sm" />
          </div>
          <YesNo label={isAr ? 'هل لديك حساسية من اللاتكس؟' : 'Are you allergic to latex?'} name="pmh_latex_allergy" value={d.pmh_latex_allergy} onChange={set} lang={lang} />
          <div>
            <Label className="text-xs">{isAr ? 'الأدوية الحالية:' : 'Current medications:'}</Label>
            <Textarea value={d.pmh_current_meds || ''} onChange={e => set('pmh_current_meds', e.target.value)} className="h-16 text-sm" />
          </div>
        </div>
      </div>

      {/* Preventative Care */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'الرعاية الوقائية' : 'Preventative Care'}
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tetanus Booster (Td/TT):</Label>
              <Input type="date" value={d.tetanus_date || ''} onChange={e => set('tetanus_date', e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">PPD (TB Skin Test):</Label>
              <Input type="date" value={d.ppd_date || ''} onChange={e => set('ppd_date', e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">{isAr ? 'نتيجة PPD:' : 'PPD Result:'}</Label>
              <Input value={d.ppd_result || ''} onChange={e => set('ppd_result', e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <YesNo label={isAr ? 'هل أخذت لقاح BCG؟' : 'Have you had BCG vaccination?'} name="bcg" value={d.bcg} onChange={set} lang={lang} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">MMR:</Label>
              <Input type="date" value={d.mmr_date || ''} onChange={e => set('mmr_date', e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Chickenpox Vaccination:</Label>
              <Input type="date" value={d.chickenpox_date || ''} onChange={e => set('chickenpox_date', e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold">Hepatitis A:</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div><Label className="text-xs">#1</Label><Input type="date" value={d.hepA_1 || ''} onChange={e => set('hepA_1', e.target.value)} className="h-8 text-sm" /></div>
              <div><Label className="text-xs">#2</Label><Input type="date" value={d.hepA_2 || ''} onChange={e => set('hepA_2', e.target.value)} className="h-8 text-sm" /></div>
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold">Hepatitis B:</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div><Label className="text-xs">#1</Label><Input type="date" value={d.hepB_1 || ''} onChange={e => set('hepB_1', e.target.value)} className="h-8 text-sm" /></div>
              <div><Label className="text-xs">#2</Label><Input type="date" value={d.hepB_2 || ''} onChange={e => set('hepB_2', e.target.value)} className="h-8 text-sm" /></div>
              <div><Label className="text-xs">#3</Label><Input type="date" value={d.hepB_3 || ''} onChange={e => set('hepB_3', e.target.value)} className="h-8 text-sm" /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Occupational History */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'التاريخ المهني' : 'Occupational History'}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <Label className="text-xs">{isAr ? 'الوظيفة الحالية:' : 'Current job:'}</Label>
            <Input value={d.current_job || ''} onChange={e => set('current_job', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'حالة العمل:' : 'Job status:'}</Label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-1 text-sm"><input type="radio" name="job_status" checked={d.job_status === 'full'} onChange={() => set('job_status', 'full')} /> {isAr ? 'دوام كامل' : 'Full time'}</label>
              <label className="flex items-center gap-1 text-sm"><input type="radio" name="job_status" checked={d.job_status === 'part'} onChange={() => set('job_status', 'part')} /> {isAr ? 'دوام جزئي' : 'Part time'}</label>
            </div>
            <div className="mt-1">
              <Label className="text-xs">{isAr ? 'منذ سنة:' : 'Since year:'}</Label>
              <Input value={d.job_since || ''} onChange={e => set('job_since', e.target.value)} className="h-8 text-sm w-32" />
            </div>
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'معدات السلامة المستخدمة:' : 'Safety equipment used:'}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
              {['Mask respirator', 'Air supply respirator', 'Gloves', 'Coveralls/aprons', 'Safety glasses'].map(eq => (
                <label key={eq} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={d[`equip_${eq}`] || false} onCheckedChange={v => set(`equip_${eq}`, v)} />
                  {eq}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hepatitis B Vaccine Record */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'سجل لقاح التهاب الكبد ب' : 'Hepatitis B Vaccine Record'}
        </div>
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            {[
              { val: 'completed', en: 'I have previously received the complete Hepatitis B Vaccine series', ar: 'سبق أن حصلت على سلسلة لقاح التهاب الكبد ب كاملة' },
              { val: 'booster', en: 'I request a titer and a possible booster', ar: 'أطلب فحص الأجسام المضادة ولقاح معزز إن لزم' },
              { val: 'request', en: 'I request the Hepatitis B Vaccine', ar: 'أطلب لقاح التهاب الكبد ب' },
              { val: 'decline', en: 'I decline hepatitis B vaccination at this time', ar: 'أرفض لقاح التهاب الكبد ب في هذا الوقت' },
            ].map(opt => (
              <label key={opt.val} className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="radio" name="hepb_record" checked={d.hepb_record === opt.val} onChange={() => set('hepb_record', opt.val)} className="mt-1" />
                <span>{isAr ? opt.ar : opt.en}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 border-t pt-3">
            <div>
              <Label className="text-xs">{isAr ? 'اسم الموظف:' : 'Employee name:'}</Label>
              <Input value={d.name || ''} readOnly className="h-8 text-sm bg-gray-50" />
            </div>
            <div>
              <Label className="text-xs">{isAr ? 'التاريخ:' : 'Date:'}</Label>
              <Input type="date" value={d.hepb_emp_date || ''} onChange={e => set('hepb_emp_date', e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">{isAr ? 'اسم المشرف:' : 'Supervisor name:'}</Label>
              <Input value={d.supervisor || ''} readOnly className="h-8 text-sm bg-gray-50" />
            </div>
            <div>
              <Label className="text-xs">{isAr ? 'التاريخ:' : 'Date:'}</Label>
              <Input type="date" value={d.hepb_sup_date || ''} onChange={e => set('hepb_sup_date', e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}