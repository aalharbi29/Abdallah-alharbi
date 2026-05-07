import React from 'react';
import {
  A4_PAGE_STYLE,
  SECTION_HEADER_STYLE,
  DateBoxes,
  SmallBox,
  BoxesRow,
  InlineInput,
  PageHeader,
} from './ChickenpoxFormStyles';

const td = {
  border: '1px solid #000',
  padding: '4px 5px',
  fontSize: '8.5pt',
  verticalAlign: 'top',
};

const Radio = ({ name, value, checked, onChange, label }) => (
  <label style={{ marginLeft: '6px', whiteSpace: 'nowrap', fontSize: '8pt' }}>
    <input type="radio" name={name} checked={checked} onChange={() => onChange?.(value)} style={{ margin: 0, verticalAlign: 'middle' }} /> {label}
  </label>
);

export default function ChickenpoxInvestigationPage({ data, onChange }) {
  const upd = (field, value) => onChange({ ...data, [field]: value });
  const updNested = (parent, field, value) => onChange({ ...data, [parent]: { ...data[parent], [field]: value } });

  return (
    <div className="a4-page" style={A4_PAGE_STYLE}>
      <PageHeader title="استمارة استقصاء وبائي لحالة جديري مائي" />

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '25%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '25%' }} />
        </colgroup>
        <tbody>
          {/* بيانات التقصي الوبائي */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>بيانات التقصي الوبائي</td>
          </tr>
          <tr>
            <td style={td}>
              <div style={{ marginBottom: '3px' }}>تاريخ تلقي البلاغ:</div>
              <DateBoxes
                d={data.notification_date.d} m={data.notification_date.m} y={data.notification_date.y}
                onDChange={(v) => updNested('notification_date', 'd', v)}
                onMChange={(v) => updNested('notification_date', 'm', v)}
                onYChange={(v) => updNested('notification_date', 'y', v)}
              />
            </td>
            <td style={td}>
              <div style={{ marginBottom: '3px' }}>تاريخ استيفاء الاستمارة:</div>
              <DateBoxes
                d={data.investigation_date.d} m={data.investigation_date.m} y={data.investigation_date.y}
                onDChange={(v) => updNested('investigation_date', 'd', v)}
                onMChange={(v) => updNested('investigation_date', 'm', v)}
                onYChange={(v) => updNested('investigation_date', 'y', v)}
              />
            </td>
            <td colSpan={2} style={td}>
              <div style={{ marginBottom: '4px' }}>اسم القائم باستيفاء الاستمارة: <InlineInput value={data.investigator_name} onChange={(v) => upd('investigator_name', v)} width="55%" /></div>
              <div style={{ marginBottom: '4px' }}>وظيفته: <InlineInput value={data.job} onChange={(v) => upd('job', v)} width="35%" /> مكان عمله: <InlineInput value={data.workplace} onChange={(v) => upd('workplace', v)} width="35%" /></div>
              <div>القطاع/المشرف الإقليمي: <InlineInput value={data.sector} onChange={(v) => upd('sector', v)} width="25%" /> المركز الصحي: <InlineInput value={data.health_center} onChange={(v) => upd('health_center', v)} width="25%" /> المنطقة: <InlineInput value={data.region} onChange={(v) => upd('region', v)} width="20%" /></div>
            </td>
          </tr>

          {/* بيانات المريض */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>بيانات المريض</td>
          </tr>
          <tr>
            <td colSpan={2} style={td}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span>اسم المريض: <InlineInput value={data.patient_name} onChange={(v) => upd('patient_name', v)} width="80px" /></span>
                <span>اسم الأب: <InlineInput value={data.father_name} onChange={(v) => upd('father_name', v)} width="60px" /></span>
                <span>اسم الجد: <InlineInput value={data.grandfather_name} onChange={(v) => upd('grandfather_name', v)} width="60px" /></span>
                <span>لقب العائلة: <InlineInput value={data.family_name} onChange={(v) => upd('family_name', v)} width="80px" /></span>
              </div>
            </td>
            <td colSpan={2} style={td}>
              <div style={{ marginBottom: '3px' }}>رقم البطاقة الشخصية/الإقامة/الجواز:</div>
              <BoxesRow value={data.national_id} onChange={(v) => upd('national_id', v)} count={10} />
            </td>
          </tr>
          <tr>
            <td style={td}>
              <div style={{ marginBottom: '3px' }}>تاريخ الميلاد:</div>
              <DateBoxes d={data.birth_d} m={data.birth_m} y={data.birth_y}
                onDChange={(v) => upd('birth_d', v)} onMChange={(v) => upd('birth_m', v)} onYChange={(v) => upd('birth_y', v)} />
            </td>
            <td style={td}>
              <div>العمر: <SmallBox value={data.age} onChange={(v) => upd('age', v)} width={50} /></div>
              <div style={{ marginTop: '4px' }}>
                نوع العمر:
                <div style={{ marginTop: '2px' }}>
                  <Radio name="age_unit" value="سنين" checked={data.age_unit === 'سنين'} onChange={(v) => upd('age_unit', v)} label="سنين" />
                  <Radio name="age_unit" value="شهور" checked={data.age_unit === 'شهور'} onChange={(v) => upd('age_unit', v)} label="شهور" />
                </div>
                <div>
                  <Radio name="age_unit" value="أسابيع" checked={data.age_unit === 'أسابيع'} onChange={(v) => upd('age_unit', v)} label="أسابيع" />
                  <Radio name="age_unit" value="أيام" checked={data.age_unit === 'أيام'} onChange={(v) => upd('age_unit', v)} label="أيام" />
                </div>
              </div>
            </td>
            <td style={td}>
              <div>النوع:</div>
              <div style={{ marginTop: '2px' }}>
                <Radio name="gender" value="ذكر" checked={data.gender === 'ذكر'} onChange={(v) => upd('gender', v)} label="ذكر" />
              </div>
              <div>
                <Radio name="gender" value="أنثى" checked={data.gender === 'أنثى'} onChange={(v) => upd('gender', v)} label="أنثى" />
              </div>
            </td>
            <td style={td}>
              <div>الجنسية:</div>
              <div style={{ marginTop: '2px' }}>
                <Radio name="nat" value="سعودي" checked={data.nationality === 'سعودي'} onChange={(v) => upd('nationality', v)} label="سعودي" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Radio name="nat" value="مقيم" checked={data.nationality === 'مقيم'} onChange={(v) => upd('nationality', v)} label="مقيم (حدد)" />
                <SmallBox value={data.resident_count} onChange={(v) => upd('resident_count', v)} width={40} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Radio name="nat" value="غير سعودي" checked={data.nationality === 'غير سعودي'} onChange={(v) => upd('nationality', v)} label="غير سعودي (حدد)" />
                <SmallBox value={data.non_saudi_count} onChange={(v) => upd('non_saudi_count', v)} width={40} />
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={td}>
              المهنة:
              <Radio name="occ" value="طفل" checked={data.occupation === 'طفل'} onChange={(v) => upd('occupation', v)} label="طفل" />
              <Radio name="occ" value="طالب" checked={data.occupation === 'طالب'} onChange={(v) => upd('occupation', v)} label="طالب" />
              <Radio name="occ" value="موظف" checked={data.occupation === 'موظف'} onChange={(v) => upd('occupation', v)} label="موظف" />
              <Radio name="occ" value="أخرى" checked={data.occupation === 'أخرى'} onChange={(v) => upd('occupation', v)} label="أخرى (حدد):" />
              <InlineInput value={data.occupation_other} onChange={(v) => upd('occupation_other', v)} width="40%" />
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={td}>
              <div>الحالة الاجتماعية:</div>
              <div style={{ marginTop: '2px' }}>
                <Radio name="social" value="طفل" checked={data.social_status === 'طفل'} onChange={(v) => upd('social_status', v)} label="طفل" />
                <Radio name="social" value="أعزب" checked={data.social_status === 'أعزب'} onChange={(v) => upd('social_status', v)} label="أعزب" />
                <Radio name="social" value="متزوج" checked={data.social_status === 'متزوج'} onChange={(v) => upd('social_status', v)} label="متزوج" />
                <Radio name="social" value="مطلق" checked={data.social_status === 'مطلق'} onChange={(v) => upd('social_status', v)} label="مطلق" />
                <Radio name="social" value="أرمل" checked={data.social_status === 'أرمل'} onChange={(v) => upd('social_status', v)} label="أرمل" />
              </div>
            </td>
            <td colSpan={2} style={td}>
              <div>رقم الهاتف:</div>
              <div>(المنزل): <InlineInput value={data.home_phone} onChange={(v) => upd('home_phone', v)} width="60%" /></div>
              <div>(العمل): <InlineInput value={data.work_phone} onChange={(v) => upd('work_phone', v)} width="60%" /></div>
              <div>(الجوال): <InlineInput value={data.mobile_phone} onChange={(v) => upd('mobile_phone', v)} width="60%" /></div>
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={td}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span>العنوان (اسم الحي والشارع): <InlineInput value={data.address} onChange={(v) => upd('address', v)} width="180px" /></span>
                <span>القرية: <InlineInput value={data.village} onChange={(v) => upd('village', v)} width="80px" /></span>
                <span>المدينة: <InlineInput value={data.city} onChange={(v) => upd('city', v)} width="80px" /></span>
                <span>المنطقة: <InlineInput value={data.region_address} onChange={(v) => upd('region_address', v)} width="80px" /></span>
              </div>
            </td>
          </tr>

          {/* بيانات التنويم */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>بيانات التنويم</td>
          </tr>
          <tr>
            <td style={td}>
              <div>هل تم تنويم المريض بمستشفى</div>
              <SmallBox value={data.hospitalized} onChange={(v) => upd('hospitalized', v)} />
            </td>
            <td colSpan={2} style={td}>
              <div>اسم المستشفى التي تم تنويم المريض فيها:</div>
              <InlineInput value={data.hospital_name} onChange={(v) => upd('hospital_name', v)} width="100%" />
            </td>
            <td style={td}>
              <div>رقم ملف المريض:</div>
              <BoxesRow value={data.file_number} onChange={(v) => upd('file_number', v)} count={8} />
            </td>
          </tr>
          <tr>
            <td style={td}>
              <div>تاريخ بداية الأعراض:</div>
              <DateBoxes d={data.symptoms_d} m={data.symptoms_m} y={data.symptoms_y}
                onDChange={(v) => upd('symptoms_d', v)} onMChange={(v) => upd('symptoms_m', v)} onYChange={(v) => upd('symptoms_y', v)} />
            </td>
            <td style={td}>
              <div>تاريخ التشخيص المبدئي:</div>
              <DateBoxes d={data.initial_diagnosis_d} m={data.initial_diagnosis_m} y={data.initial_diagnosis_y}
                onDChange={(v) => upd('initial_diagnosis_d', v)} onMChange={(v) => upd('initial_diagnosis_m', v)} onYChange={(v) => upd('initial_diagnosis_y', v)} />
            </td>
            <td colSpan={2} style={td}>
              <div>تاريخ التشخيص النهائي:</div>
              <DateBoxes d={data.final_diagnosis_d} m={data.final_diagnosis_m} y={data.final_diagnosis_y}
                onDChange={(v) => upd('final_diagnosis_d', v)} onMChange={(v) => upd('final_diagnosis_m', v)} onYChange={(v) => upd('final_diagnosis_y', v)} />
            </td>
          </tr>
          <tr>
            <td style={td}>
              <div>تاريخ تنويم الحالة بالمستشفى:</div>
              <DateBoxes d={data.admission_d} m={data.admission_m} y={data.admission_y}
                onDChange={(v) => upd('admission_d', v)} onMChange={(v) => upd('admission_m', v)} onYChange={(v) => upd('admission_y', v)} />
            </td>
            <td style={td}>
              <div>تاريخ خروج المريض من المستشفى:</div>
              <DateBoxes d={data.discharge_d} m={data.discharge_m} y={data.discharge_y}
                onDChange={(v) => upd('discharge_d', v)} onMChange={(v) => upd('discharge_m', v)} onYChange={(v) => upd('discharge_y', v)} />
            </td>
            <td colSpan={2} style={td}>
              <div>حالة المريض عند الخروج:</div>
              <div style={{ marginTop: '2px' }}>
                <Radio name="discharge" value="تحت العلاج" checked={data.discharge_status === 'تحت العلاج'} onChange={(v) => upd('discharge_status', v)} label="تحت العلاج" />
                <Radio name="discharge" value="شفاء" checked={data.discharge_status === 'شفاء'} onChange={(v) => upd('discharge_status', v)} label="شفاء" />
                <Radio name="discharge" value="تحويل" checked={data.discharge_status === 'تحويل'} onChange={(v) => upd('discharge_status', v)} label="تحويل" />
                <Radio name="discharge" value="وفاة" checked={data.discharge_status === 'وفاة'} onChange={(v) => upd('discharge_status', v)} label="وفاة" />
              </div>
            </td>
          </tr>
          <tr>
            <td style={td}>
              <div>الارتباط بفاشية وبائية</div>
              <SmallBox value={data.outbreak_link} onChange={(v) => upd('outbreak_link', v)} />
            </td>
            <td style={td}>
              <div>تاريخ الإبلاغ عن الفاشية:</div>
              <DateBoxes d={data.outbreak_d} m={data.outbreak_m} y={data.outbreak_y}
                onDChange={(v) => upd('outbreak_d', v)} onMChange={(v) => upd('outbreak_m', v)} onYChange={(v) => upd('outbreak_y', v)} />
            </td>
            <td style={td}>
              <div>حالة واردة من خارج المنطقة</div>
              <div style={{ marginTop: '2px' }}>
                <Radio name="outside" value="نعم" checked={data.case_from_outside === 'نعم'} onChange={(v) => upd('case_from_outside', v)} label="١- نعم" />
                <Radio name="outside" value="لا" checked={data.case_from_outside === 'لا'} onChange={(v) => upd('case_from_outside', v)} label="٢- لا" />
              </div>
              <Radio name="outside" value="غير معروف" checked={data.case_from_outside === 'غير معروف'} onChange={(v) => upd('case_from_outside', v)} label="٣= غير معروف" />
            </td>
            <td style={td}>
              <div>نوع الحالة:</div>
              <div style={{ marginTop: '2px' }}>
                <Radio name="ctype" value="مؤكدة" checked={data.case_type === 'مؤكدة'} onChange={(v) => upd('case_type', v)} label="١- مؤكدة" />
                <Radio name="ctype" value="محتملة" checked={data.case_type === 'محتملة'} onChange={(v) => upd('case_type', v)} label="٢- محتملة" />
              </div>
              <Radio name="ctype" value="مشتبهة" checked={data.case_type === 'مشتبهة'} onChange={(v) => upd('case_type', v)} label="٣= مشتبهة" />
            </td>
          </tr>

          {/* البيانات الإكلينيكية */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>البيانات الإكلينيكية</td>
          </tr>
          <tr>
            <td style={td}>
              <div>طفح جلدي</div>
              <SmallBox value={data.skin_rash} onChange={(v) => upd('skin_rash', v)} />
            </td>
            <td style={td}>
              <div>تاريخ بداية الطفح:</div>
              <DateBoxes d={data.rash_start_d} m={data.rash_start_m} y={data.rash_start_y}
                onDChange={(v) => upd('rash_start_d', v)} onMChange={(v) => upd('rash_start_m', v)} onYChange={(v) => upd('rash_start_y', v)} />
            </td>
            <td style={td}>
              <div>مدة الطفح:</div>
              <SmallBox value={data.rash_duration} onChange={(v) => upd('rash_duration', v)} width={50} /> يوم
            </td>
            <td style={td}>
              <div>مكان وجود الطفح:</div>
              <Radio name="rloc" value="موضعي" checked={data.rash_location === 'موضعي'} onChange={(v) => upd('rash_location', v)} label="موضعي" />
              <Radio name="rloc" value="عام بكل الجسم" checked={data.rash_location === 'عام بكل الجسم'} onChange={(v) => upd('rash_location', v)} label="عام بكل الجسم" />
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={td}>
              <div>شدة الطفح الجلدي:</div>
              <Radio name="sev" value="خفيف" checked={data.rash_severity === 'خفيف'} onChange={(v) => upd('rash_severity', v)} label="خفيف" />
              <Radio name="sev" value="متوسط الشدة" checked={data.rash_severity === 'متوسط الشدة'} onChange={(v) => upd('rash_severity', v)} label="متوسط الشدة" />
              <Radio name="sev" value="منتشر في كل الجلد" checked={data.rash_severity === 'منتشر في كل الجلد'} onChange={(v) => upd('rash_severity', v)} label="منتشر في كل الجلد" />
            </td>
            <td style={td}>
              <div>حمى</div>
              <SmallBox value={data.fever} onChange={(v) => upd('fever', v)} />
            </td>
            <td style={td}>
              <div>أقصى درجة حرارة مسجلة:</div>
              <InlineInput value={data.max_temp} onChange={(v) => upd('max_temp', v)} width="80%" />
              <div style={{ marginTop: '3px' }}>مدة الحمى: <SmallBox value={data.fever_duration} onChange={(v) => upd('fever_duration', v)} width={40} /> يوم</div>
            </td>
          </tr>

          {/* المضاعفات */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>المضاعفات</td>
          </tr>
          <tr>
            <td style={td}>
              <div>التهاب رئوي</div>
              <SmallBox value={data.pneumonia} onChange={(v) => upd('pneumonia', v)} />
            </td>
            <td style={td}>
              <div>التهاب بالدماغ</div>
              <SmallBox value={data.encephalitis} onChange={(v) => upd('encephalitis', v)} />
            </td>
            <td style={td}>
              <div>ترنح مخيخي</div>
              <SmallBox value={data.rhinitis} onChange={(v) => upd('rhinitis', v)} />
            </td>
            <td style={td}>
              <div>عدوى جلدية</div>
              <SmallBox value={data.skin_infection} onChange={(v) => upd('skin_infection', v)} />
            </td>
          </tr>
          <tr>
            <td style={td}>
              <div>انخفاض الصفائح الدموية</div>
              <SmallBox value={data.thrombocytopenia} onChange={(v) => upd('thrombocytopenia', v)} />
            </td>
            <td colSpan={2} style={td}>
              <div>مضاعفات أخرى (حدد):</div>
              <InlineInput value={data.other_complications_text} onChange={(v) => upd('other_complications_text', v)} width="100%" />
            </td>
            <td style={td}>
              <div>عدوى ثانوية أخرى</div>
              <SmallBox value={data.other_complications} onChange={(v) => upd('other_complications', v)} />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ position: 'absolute', bottom: '6mm', right: '8mm', fontSize: '8pt' }}>١</div>
    </div>
  );
}