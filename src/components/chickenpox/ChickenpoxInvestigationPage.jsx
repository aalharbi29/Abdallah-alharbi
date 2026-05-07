import React from 'react';
import {
  A4_PAGE_STYLE,
  SECTION_HEADER_STYLE,
  DateBoxes,
  SmallBox,
  InlineInput,
  PageHeader,
} from './ChickenpoxFormStyles';

const cellStyle = {
  border: '1px solid #000',
  padding: '6px 6px',
  fontSize: '9pt',
  verticalAlign: 'top',
};

export default function ChickenpoxInvestigationPage({ data, onChange }) {
  const upd = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="a4-page" style={A4_PAGE_STYLE}>
      <PageHeader title="استمارة استقصاء وبائي لحالة جديري مائي" />

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        {/* بيانات التقصي الوبائي */}
        <tbody>
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>بيانات التقصي الوبائي</td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div style={{ marginBottom: '4px' }}>تاريخ تلقي البلاغ:</div>
              <DateBoxes
                d={data.notification_date.d} m={data.notification_date.m} y={data.notification_date.y}
                onDChange={(v) => upd('notification_date', { ...data.notification_date, d: v })}
                onMChange={(v) => upd('notification_date', { ...data.notification_date, m: v })}
                onYChange={(v) => upd('notification_date', { ...data.notification_date, y: v })}
              />
            </td>
            <td style={cellStyle}>
              <div style={{ marginBottom: '4px' }}>تاريخ استيفاء الاستمارة:</div>
              <DateBoxes
                d={data.investigation_date.d} m={data.investigation_date.m} y={data.investigation_date.y}
                onDChange={(v) => upd('investigation_date', { ...data.investigation_date, d: v })}
                onMChange={(v) => upd('investigation_date', { ...data.investigation_date, m: v })}
                onYChange={(v) => upd('investigation_date', { ...data.investigation_date, y: v })}
              />
            </td>
            <td colSpan={2} style={cellStyle}>
              <div>اسم القائم باستيفاء الاستمارة: <InlineInput value={data.investigator_name} onChange={(v) => upd('investigator_name', v)} width="60%" /></div>
              <div style={{ marginTop: '6px' }}>وظيفته: <InlineInput value={data.job} onChange={(v) => upd('job', v)} width="40%" /> مكان عمله: <InlineInput value={data.workplace} onChange={(v) => upd('workplace', v)} width="40%" /></div>
              <div style={{ marginTop: '6px' }}>القطاع/المشرف الإقليمي: <InlineInput value={data.sector} onChange={(v) => upd('sector', v)} width="30%" /> المركز الصحي: <InlineInput value={data.health_center} onChange={(v) => upd('health_center', v)} width="30%" /> المنطقة: <InlineInput value={data.region} onChange={(v) => upd('region', v)} width="20%" /></div>
            </td>
          </tr>

          {/* بيانات المريض */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>بيانات المريض</td>
          </tr>
          <tr>
            <td colSpan={2} style={cellStyle}>
              <div>اسم المريض: <InlineInput value={data.patient_name} onChange={(v) => upd('patient_name', v)} width="60%" /></div>
              <div style={{ marginTop: '4px' }}>اسم الأب: <InlineInput value={data.father_name} onChange={(v) => upd('father_name', v)} width="35%" /> اسم الجد: <InlineInput value={data.grandfather_name} onChange={(v) => upd('grandfather_name', v)} width="35%" /></div>
              <div style={{ marginTop: '4px' }}>لقب العائلة: <InlineInput value={data.family_name} onChange={(v) => upd('family_name', v)} width="60%" /></div>
            </td>
            <td colSpan={2} style={cellStyle}>
              <div>رقم البطاقة الشخصية/الإقامة/الجواز:</div>
              <InlineInput value={data.national_id} onChange={(v) => upd('national_id', v)} width="100%" />
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>تاريخ الميلاد:</div>
              <DateBoxes
                d={data.birth_d} m={data.birth_m} y={data.birth_y}
                onDChange={(v) => upd('birth_d', v)}
                onMChange={(v) => upd('birth_m', v)}
                onYChange={(v) => upd('birth_y', v)}
              />
            </td>
            <td style={cellStyle}>
              <div>العمر: <SmallBox value={data.age} onChange={(v) => upd('age', v)} width={40} /></div>
              <div style={{ marginTop: '4px', fontSize: '8pt' }}>
                نوع العمر:
                {['سنين', 'أسابيع', 'شهور', 'أيام'].map((u) => (
                  <label key={u} style={{ marginRight: '6px' }}>
                    <input type="radio" name="age_unit" checked={data.age_unit === u} onChange={() => upd('age_unit', u)} /> {u}
                  </label>
                ))}
              </div>
            </td>
            <td style={cellStyle}>
              <div style={{ fontSize: '8pt' }}>
                النوع:
                <label style={{ marginRight: '6px' }}><input type="radio" name="gender" checked={data.gender === 'ذكر'} onChange={() => upd('gender', 'ذكر')} /> ذكر</label>
                <label style={{ marginRight: '6px' }}><input type="radio" name="gender" checked={data.gender === 'أنثى'} onChange={() => upd('gender', 'أنثى')} /> أنثى</label>
              </div>
            </td>
            <td style={cellStyle}>
              <div style={{ fontSize: '8pt' }}>
                الجنسية:
                <label style={{ marginRight: '6px' }}><input type="radio" name="nat" checked={data.nationality === 'سعودي'} onChange={() => upd('nationality', 'سعودي')} /> سعودي</label>
                <label style={{ marginRight: '6px' }}><input type="radio" name="nat" checked={data.nationality === 'مقيم'} onChange={() => upd('nationality', 'مقيم')} /> مقيم</label>
                <SmallBox value={data.resident_count} onChange={(v) => upd('resident_count', v)} width={30} />
              </div>
              <div style={{ marginTop: '3px', fontSize: '8pt' }}>
                <label><input type="radio" name="nat" checked={data.nationality === 'غير سعودي'} onChange={() => upd('nationality', 'غير سعودي')} /> غير سعودي</label>
                <SmallBox value={data.non_saudi_count} onChange={(v) => upd('non_saudi_count', v)} width={30} />
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={cellStyle}>
              <div style={{ fontSize: '8pt' }}>
                المهنة:
                {['طفل', 'طالب', 'موظف', 'أخرى'].map((o) => (
                  <label key={o} style={{ marginRight: '8px' }}>
                    <input type="radio" name="occ" checked={data.occupation === o} onChange={() => upd('occupation', o)} /> {o}
                  </label>
                ))}
                {data.occupation === 'أخرى' && (
                  <>(حدد): <InlineInput value={data.occupation_other} onChange={(v) => upd('occupation_other', v)} width="40%" /></>
                )}
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cellStyle}>
              <div style={{ fontSize: '8pt' }}>
                الحالة الاجتماعية:
                {['طفل', 'أعزب', 'متزوج', 'مطلق', 'أرمل'].map((s) => (
                  <label key={s} style={{ marginRight: '6px' }}>
                    <input type="radio" name="social" checked={data.social_status === s} onChange={() => upd('social_status', s)} /> {s}
                  </label>
                ))}
              </div>
            </td>
            <td colSpan={2} style={cellStyle}>
              <div>رقم الهاتف:</div>
              <div style={{ fontSize: '8pt' }}>
                (المنزل): <InlineInput value={data.home_phone} onChange={(v) => upd('home_phone', v)} width="60%" />
              </div>
              <div style={{ fontSize: '8pt' }}>
                (العمل): <InlineInput value={data.work_phone} onChange={(v) => upd('work_phone', v)} width="60%" />
              </div>
              <div style={{ fontSize: '8pt' }}>
                (الجوال): <InlineInput value={data.mobile_phone} onChange={(v) => upd('mobile_phone', v)} width="60%" />
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={cellStyle}>
              <div>العنوان (اسم الحي والشارع): <InlineInput value={data.address} onChange={(v) => upd('address', v)} width="50%" /></div>
              <div style={{ marginTop: '4px' }}>القرية: <InlineInput value={data.village} onChange={(v) => upd('village', v)} width="20%" /> المدينة: <InlineInput value={data.city} onChange={(v) => upd('city', v)} width="20%" /> المنطقة: <InlineInput value={data.region_address} onChange={(v) => upd('region_address', v)} width="20%" /></div>
            </td>
          </tr>

          {/* بيانات التنويم */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>بيانات التنويم</td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>هل تم تنويم المريض بمستشفى</div>
              <SmallBox value={data.hospitalized} onChange={(v) => upd('hospitalized', v)} />
            </td>
            <td colSpan={2} style={cellStyle}>
              <div>اسم المستشفى التي تم تنويم المريض فيها:</div>
              <InlineInput value={data.hospital_name} onChange={(v) => upd('hospital_name', v)} width="100%" />
            </td>
            <td style={cellStyle}>
              <div>رقم ملف المريض:</div>
              <InlineInput value={data.file_number} onChange={(v) => upd('file_number', v)} width="100%" />
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>تاريخ بداية الأعراض:</div>
              <DateBoxes d={data.symptoms_d} m={data.symptoms_m} y={data.symptoms_y}
                onDChange={(v) => upd('symptoms_d', v)} onMChange={(v) => upd('symptoms_m', v)} onYChange={(v) => upd('symptoms_y', v)} />
            </td>
            <td style={cellStyle}>
              <div>تاريخ التشخيص المبدئي:</div>
              <DateBoxes d={data.initial_diagnosis_d} m={data.initial_diagnosis_m} y={data.initial_diagnosis_y}
                onDChange={(v) => upd('initial_diagnosis_d', v)} onMChange={(v) => upd('initial_diagnosis_m', v)} onYChange={(v) => upd('initial_diagnosis_y', v)} />
            </td>
            <td colSpan={2} style={cellStyle}>
              <div>تاريخ التشخيص النهائي:</div>
              <DateBoxes d={data.final_diagnosis_d} m={data.final_diagnosis_m} y={data.final_diagnosis_y}
                onDChange={(v) => upd('final_diagnosis_d', v)} onMChange={(v) => upd('final_diagnosis_m', v)} onYChange={(v) => upd('final_diagnosis_y', v)} />
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>تاريخ تنويم الحالة بالمستشفى:</div>
              <DateBoxes d={data.admission_d} m={data.admission_m} y={data.admission_y}
                onDChange={(v) => upd('admission_d', v)} onMChange={(v) => upd('admission_m', v)} onYChange={(v) => upd('admission_y', v)} />
            </td>
            <td style={cellStyle}>
              <div>تاريخ خروج المريض من المستشفى:</div>
              <DateBoxes d={data.discharge_d} m={data.discharge_m} y={data.discharge_y}
                onDChange={(v) => upd('discharge_d', v)} onMChange={(v) => upd('discharge_m', v)} onYChange={(v) => upd('discharge_y', v)} />
            </td>
            <td colSpan={2} style={cellStyle}>
              <div style={{ fontSize: '8pt' }}>حالة المريض عند الخروج:
                {['تحت العلاج', 'شفاء', 'تحويل', 'وفاة'].map((s) => (
                  <label key={s} style={{ marginRight: '6px', display: 'inline-block' }}>
                    <input type="radio" name="discharge" checked={data.discharge_status === s} onChange={() => upd('discharge_status', s)} /> {s}
                  </label>
                ))}
              </div>
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>الارتباط بفاشية وبائية</div>
              <SmallBox value={data.outbreak_link} onChange={(v) => upd('outbreak_link', v)} />
            </td>
            <td style={cellStyle}>
              <div>تاريخ الإبلاغ عن الفاشية:</div>
              <DateBoxes d={data.outbreak_d} m={data.outbreak_m} y={data.outbreak_y}
                onDChange={(v) => upd('outbreak_d', v)} onMChange={(v) => upd('outbreak_m', v)} onYChange={(v) => upd('outbreak_y', v)} />
            </td>
            <td style={cellStyle}>
              <div style={{ fontSize: '8pt' }}>حالة واردة من خارج المنطقة:</div>
              <div style={{ fontSize: '8pt' }}>
                <label><input type="radio" name="outside" checked={data.case_from_outside === 'نعم'} onChange={() => upd('case_from_outside', 'نعم')} /> ١- نعم</label>{' '}
                <label><input type="radio" name="outside" checked={data.case_from_outside === 'لا'} onChange={() => upd('case_from_outside', 'لا')} /> ٢- لا</label>{' '}
                <label><input type="radio" name="outside" checked={data.case_from_outside === 'غير معروف'} onChange={() => upd('case_from_outside', 'غير معروف')} /> ٣= غير معروف</label>
              </div>
            </td>
            <td style={cellStyle}>
              <div style={{ fontSize: '8pt' }}>نوع الحالة:</div>
              <div style={{ fontSize: '8pt' }}>
                <label><input type="radio" name="ctype" checked={data.case_type === 'مؤكدة'} onChange={() => upd('case_type', 'مؤكدة')} /> ١- مؤكدة</label>{' '}
                <label><input type="radio" name="ctype" checked={data.case_type === 'محتملة'} onChange={() => upd('case_type', 'محتملة')} /> ٢- محتملة</label>
              </div>
              <div style={{ fontSize: '8pt' }}>
                <label><input type="radio" name="ctype" checked={data.case_type === 'مشتبهة'} onChange={() => upd('case_type', 'مشتبهة')} /> ٣= مشتبهة</label>
              </div>
            </td>
          </tr>

          {/* البيانات الإكلينيكية */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>البيانات الإكلينيكية</td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>طفح جلدي</div>
              <SmallBox value={data.skin_rash} onChange={(v) => upd('skin_rash', v)} />
            </td>
            <td style={cellStyle}>
              <div>تاريخ بداية الطفح:</div>
              <DateBoxes d={data.rash_start_d} m={data.rash_start_m} y={data.rash_start_y}
                onDChange={(v) => upd('rash_start_d', v)} onMChange={(v) => upd('rash_start_m', v)} onYChange={(v) => upd('rash_start_y', v)} />
            </td>
            <td style={cellStyle}>
              <div>مدة الطفح:</div>
              <SmallBox value={data.rash_duration} onChange={(v) => upd('rash_duration', v)} width={50} /> يوم
            </td>
            <td style={cellStyle}>
              <div style={{ fontSize: '8pt' }}>مكان وجود الطفح:
                <label style={{ marginRight: '6px' }}><input type="radio" name="rloc" checked={data.rash_location === 'موضعي'} onChange={() => upd('rash_location', 'موضعي')} /> موضعي</label>
                <label><input type="radio" name="rloc" checked={data.rash_location === 'عام بكل الجسم'} onChange={() => upd('rash_location', 'عام بكل الجسم')} /> عام بكل الجسم</label>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cellStyle}>
              <div style={{ fontSize: '8pt' }}>شدة الطفح الجلدي:
                <label style={{ marginRight: '6px' }}><input type="radio" name="sev" checked={data.rash_severity === 'خفيف'} onChange={() => upd('rash_severity', 'خفيف')} /> خفيف</label>
                <label style={{ marginRight: '6px' }}><input type="radio" name="sev" checked={data.rash_severity === 'متوسط الشدة'} onChange={() => upd('rash_severity', 'متوسط الشدة')} /> متوسط الشدة</label>
                <label><input type="radio" name="sev" checked={data.rash_severity === 'منتشر في كل الجلد'} onChange={() => upd('rash_severity', 'منتشر في كل الجلد')} /> منتشر في كل الجلد</label>
              </div>
            </td>
            <td style={cellStyle}>
              <div>حمى</div>
              <SmallBox value={data.fever} onChange={(v) => upd('fever', v)} />
            </td>
            <td style={cellStyle}>
              <div>أقصى درجة حرارة:</div>
              <InlineInput value={data.max_temp} onChange={(v) => upd('max_temp', v)} width="80%" />
              <div style={{ marginTop: '4px' }}>مدة الحمى: <SmallBox value={data.fever_duration} onChange={(v) => upd('fever_duration', v)} width={40} /> يوم</div>
            </td>
          </tr>

          {/* المضاعفات */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>المضاعفات</td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>التهاب رئوي</div>
              <SmallBox value={data.pneumonia} onChange={(v) => upd('pneumonia', v)} />
            </td>
            <td style={cellStyle}>
              <div>التهاب بالدماغ</div>
              <SmallBox value={data.encephalitis} onChange={(v) => upd('encephalitis', v)} />
            </td>
            <td style={cellStyle}>
              <div>ترنح مخيخي</div>
              <SmallBox value={data.rhinitis} onChange={(v) => upd('rhinitis', v)} />
            </td>
            <td style={cellStyle}>
              <div>عدوى جلدية</div>
              <SmallBox value={data.skin_infection} onChange={(v) => upd('skin_infection', v)} />
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>انخفاض الصفائح الدموية</div>
              <SmallBox value={data.thrombocytopenia} onChange={(v) => upd('thrombocytopenia', v)} />
            </td>
            <td colSpan={2} style={cellStyle}>
              <div>مضاعفات أخرى (حدد):</div>
              <InlineInput value={data.other_complications_text} onChange={(v) => upd('other_complications_text', v)} width="100%" />
            </td>
            <td style={cellStyle}>
              <div>عدوى ثانوية أخرى</div>
              <SmallBox value={data.other_complications} onChange={(v) => upd('other_complications', v)} />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ position: 'absolute', bottom: '8mm', right: '10mm', fontSize: '8pt' }}>١</div>
    </div>
  );
}