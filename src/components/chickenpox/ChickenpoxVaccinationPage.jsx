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

export default function ChickenpoxVaccinationPage({ data, onChange }) {
  const upd = (field, value) => onChange({ ...data, [field]: value });

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
          {/* تاريخ التحصين */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>تاريخ التحصين ضد الجديري المائي</td>
          </tr>
          <tr>
            <td style={td}>
              <div>هل تم الحصول على لقاح ضد الجديري المائي</div>
              <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <SmallBox value={data.vaccinated} onChange={(v) => upd('vaccinated', v)} />
                <span style={{ fontSize: '7.5pt' }}>١= نعم  ٢= لا</span>
              </div>
              <div style={{ fontSize: '7.5pt', marginTop: '2px' }}>٣= غير معروف</div>
            </td>
            <td style={td}>
              <div>سبب عدم الحصول على اللقاح</div>
              <div style={{ fontSize: '7.5pt', marginTop: '2px' }}>
                <div><Radio name="novac" value="موانع طبية" checked={data.no_vaccine_reason === 'موانع طبية'} onChange={(v) => upd('no_vaccine_reason', v)} label="١= موانع طبية" /></div>
                <div><Radio name="novac" value="سابقة الإصابة بالمرض" checked={data.no_vaccine_reason === 'سابقة الإصابة بالمرض'} onChange={(v) => upd('no_vaccine_reason', v)} label="٢= سابقة الإصابة بالمرض" /></div>
                <div>
                  <Radio name="novac" value="أقل من السن" checked={data.no_vaccine_reason === 'أقل من السن'} onChange={(v) => upd('no_vaccine_reason', v)} label="٣= أقل من السن" />
                  <Radio name="novac" value="أخرى" checked={data.no_vaccine_reason === 'أخرى'} onChange={(v) => upd('no_vaccine_reason', v)} label="٤= أخرى" />
                </div>
              </div>
            </td>
            <td style={td}>
              <div>تاريخ الحصول على أول جرعة</div>
              <DateBoxes d={data.first_dose_d} m={data.first_dose_m} y={data.first_dose_y}
                onDChange={(v) => upd('first_dose_d', v)} onMChange={(v) => upd('first_dose_m', v)} onYChange={(v) => upd('first_dose_y', v)} />
            </td>
            <td style={td}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                <div>
                  <div>النوع</div>
                  <SmallBox value={data.first_dose_type} onChange={(v) => upd('first_dose_type', v)} />
                </div>
                <div>
                  <div>منتج</div>
                  <SmallBox value={data.first_dose_product} onChange={(v) => upd('first_dose_product', v)} />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={td}>
              <div>تاريخ الحصول على ثاني جرعة</div>
              <DateBoxes d={data.second_dose_d} m={data.second_dose_m} y={data.second_dose_y}
                onDChange={(v) => upd('second_dose_d', v)} onMChange={(v) => upd('second_dose_m', v)} onYChange={(v) => upd('second_dose_y', v)} />
            </td>
            <td style={td}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                <div>
                  <div>النوع</div>
                  <SmallBox value={data.second_dose_type} onChange={(v) => upd('second_dose_type', v)} />
                </div>
                <div>
                  <div>منتج</div>
                  <SmallBox value={data.second_dose_product} onChange={(v) => upd('second_dose_product', v)} />
                </div>
              </div>
            </td>
            <td style={td}>
              <div>تاريخ الحصول على ثالث جرعة</div>
              <DateBoxes d={data.third_dose_d} m={data.third_dose_m} y={data.third_dose_y}
                onDChange={(v) => upd('third_dose_d', v)} onMChange={(v) => upd('third_dose_m', v)} onYChange={(v) => upd('third_dose_y', v)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', marginTop: '3px' }}>
                <div>
                  <div>النوع</div>
                  <SmallBox value={data.third_dose_type} onChange={(v) => upd('third_dose_type', v)} />
                </div>
                <div>
                  <div>منتج</div>
                  <SmallBox value={data.third_dose_product} onChange={(v) => upd('third_dose_product', v)} />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={td}>
              <div>عدد الجرعات التي تم الحصول عليها قبل بلوغ عام</div>
              <SmallBox value={data.doses_before_year} onChange={(v) => upd('doses_before_year', v)} />
            </td>
            <td colSpan={2} style={td}>
              <div>نوع اللقاح:</div>
              <div style={{ fontSize: '7.5pt' }}>
                <Radio name="vtype" value="الجديري المائي" checked={data.vaccine_type === 'الجديري المائي'} onChange={(v) => upd('vaccine_type', v)} label="١= الجديري المائي" />
                <Radio name="vtype" value="MMR" checked={data.vaccine_type === 'MMR'} onChange={(v) => upd('vaccine_type', v)} label="٢= MMR" />
                <Radio name="vtype" value="أخرى" checked={data.vaccine_type === 'أخرى'} onChange={(v) => upd('vaccine_type', v)} label="٣= أخرى" />
                <Radio name="vtype" value="غير معروف" checked={data.vaccine_type === 'غير معروف'} onChange={(v) => upd('vaccine_type', v)} label="٤= غير معروف" />
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={td}>
              <div>عدد الجرعات التي تم الحصول عليها عند بلوغ عام أو بعده</div>
              <SmallBox value={data.doses_after_year} onChange={(v) => upd('doses_after_year', v)} />
            </td>
            <td colSpan={2} style={td}>
              <div>منتج اللقاح:</div>
              <div style={{ fontSize: '7.5pt' }}>
                <Radio name="vprod" value="شركة ميرك" checked={data.vaccine_product === 'شركة ميرك'} onChange={(v) => upd('vaccine_product', v)} label="١= شركة ميرك" />
                <Radio name="vprod" value="أخرى" checked={data.vaccine_product === 'أخرى'} onChange={(v) => upd('vaccine_product', v)} label="٢= أخرى" />
                <Radio name="vprod" value="غير معروف" checked={data.vaccine_product === 'غير معروف'} onChange={(v) => upd('vaccine_product', v)} label="٣= غير معروف" />
              </div>
            </td>
          </tr>

          {/* البيانات المخبرية */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>البيانات المخبرية</td>
          </tr>
          <tr>
            <td colSpan={2} style={td}>
              <div>إجراء اختبارات مخبرية للتأكد من التشخيص بالجديري المائي:</div>
              <div style={{ fontSize: '7.5pt', marginTop: '3px' }}>
                <Radio name="lab" value="نعم" checked={data.lab_test === 'نعم'} onChange={(v) => upd('lab_test', v)} label="١= نعم" />
                <Radio name="lab" value="لا" checked={data.lab_test === 'لا'} onChange={(v) => upd('lab_test', v)} label="٢= لا" />
              </div>
              <Radio name="lab" value="غير معروف" checked={data.lab_test === 'غير معروف'} onChange={(v) => upd('lab_test', v)} label="٣= غير معروف" />
            </td>
            <td style={td}>
              <div>تاريخ إجراء اختبار العينة المصلية IgM:</div>
              <DateBoxes d={data.igm_date_d} m={data.igm_date_m} y={data.igm_date_y}
                onDChange={(v) => upd('igm_date_d', v)} onMChange={(v) => upd('igm_date_m', v)} onYChange={(v) => upd('igm_date_y', v)} />
            </td>
            <td style={td}>
              <div>نتيجة الاختبار</div>
              <SmallBox value={data.igm_result} onChange={(v) => upd('igm_result', v)} />
              <div style={{ fontSize: '7pt', marginTop: '2px', lineHeight: 1.3 }}>
                ١= إيجابية ٢= سلبية ٣= غير محددة<br />
                ٤= جاري الحصول عليها ٥= لم تعمل ٦= غير معروف
              </div>
            </td>
          </tr>
          <tr>
            <td style={td}>
              <div>تاريخ إجراء اختبار العينة المصلية IgG في المرحلة الحادة</div>
              <DateBoxes d={data.igg_acute_d} m={data.igg_acute_m} y={data.igg_acute_y}
                onDChange={(v) => upd('igg_acute_d', v)} onMChange={(v) => upd('igg_acute_m', v)} onYChange={(v) => upd('igg_acute_y', v)} />
            </td>
            <td style={td}>
              <div>تاريخ إجراء اختبار العينة المصلية IgG في مرحلة النقاهة</div>
              <DateBoxes d={data.igg_recovery_d} m={data.igg_recovery_m} y={data.igg_recovery_y}
                onDChange={(v) => upd('igg_recovery_d', v)} onMChange={(v) => upd('igg_recovery_m', v)} onYChange={(v) => upd('igg_recovery_y', v)} />
            </td>
            <td colSpan={2} style={td}>
              <div>نتيجة اختبارات IgG:</div>
              <SmallBox value={data.igg_result} onChange={(v) => upd('igg_result', v)} />
              <div style={{ fontSize: '7pt', marginTop: '2px', lineHeight: 1.3 }}>
                ١= زيادة ذات أهمية ٢= زيادة غير ذات أهمية<br />
                ٣= نتيجة غير محددة ٤= لم تعمل ٥= غير معروف
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={td}>
              <div>اختبارات أخرى تم إجراؤها:</div>
              <div style={{ fontSize: '7.5pt', marginTop: '2px' }}>
                <Radio name="oth" value="إيجابية" checked={data.other_tests === 'إيجابية'} onChange={(v) => upd('other_tests', v)} label="١= إيجابية" />
                <Radio name="oth" value="سلبية" checked={data.other_tests === 'سلبية'} onChange={(v) => upd('other_tests', v)} label="٢= سلبية" />
                <Radio name="oth" value="جاري الحصول عليها" checked={data.other_tests === 'جاري الحصول عليها'} onChange={(v) => upd('other_tests', v)} label="٤= جاري الحصول عليها" />
              </div>
              <div style={{ fontSize: '7.5pt' }}>
                <Radio name="oth" value="غير محددة" checked={data.other_tests === 'غير محددة'} onChange={(v) => upd('other_tests', v)} label="٣= غير محددة" />
                <Radio name="oth" value="لم تعمل" checked={data.other_tests === 'لم تعمل'} onChange={(v) => upd('other_tests', v)} label="٥= لم تعمل" />
                <Radio name="oth" value="غير معروف" checked={data.other_tests === 'غير معروف'} onChange={(v) => upd('other_tests', v)} label="٦= غير معروف" />
              </div>
            </td>
            <td colSpan={2} style={td}>
              <div>يذكر نوع الاختبار:</div>
              <InlineInput value={data.test_type} onChange={(v) => upd('test_type', v)} width="100%" />
            </td>
          </tr>

          {/* البيانات الوبائية */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>البيانات الوبائية</td>
          </tr>
          <tr>
            <td colSpan={2} style={td}>
              <div>أين حدث انتقال العدوى للحالة:</div>
              <div style={{ fontSize: '7.5pt', marginTop: '2px', lineHeight: 1.4 }}>
                ١= في المنزل  ٢= في المدرسة  ٣= في عيادة طبيب<br />
                ٤= في مستشفى  ٥= في المنزل  ٦= في العمل<br />
                ٧= في الجامعة  ٨= غير معروف  ٩= أخرى وتذكر:
              </div>
              <InlineInput value={data.infection_source} onChange={(v) => upd('infection_source', v)} width="80%" />
            </td>
            <td colSpan={2} style={td}>
              <div>هل ترتبط الحالة بحدوث تفشي وبائي:</div>
              <div style={{ fontSize: '7.5pt', marginTop: '2px' }}>
                <Radio name="related" value="نعم" checked={data.related_outbreak === 'نعم'} onChange={(v) => upd('related_outbreak', v)} label="١= نعم" />
                <Radio name="related" value="لا" checked={data.related_outbreak === 'لا'} onChange={(v) => upd('related_outbreak', v)} label="٢= لا" />
                <Radio name="related" value="غير معروف" checked={data.related_outbreak === 'غير معروف'} onChange={(v) => upd('related_outbreak', v)} label="٣= غير معروف" />
              </div>
              <div style={{ marginTop: '4px' }}>هل ترتبط الحالة بحالة أخرى مؤكدة مخبرياً:</div>
              <div style={{ fontSize: '7.5pt', marginTop: '2px' }}>
                <Radio name="related2" value="نعم" checked={data.related_to_other_case === 'نعم'} onChange={(v) => upd('related_to_other_case', v)} label="١= نعم" />
                <Radio name="related2" value="لا" checked={data.related_to_other_case === 'لا'} onChange={(v) => upd('related_to_other_case', v)} label="٢= لا" />
                <Radio name="related2" value="غير معروف" checked={data.related_to_other_case === 'غير معروف'} onChange={(v) => upd('related_to_other_case', v)} label="٣= غير معروف" />
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={td}>
              <div>هل كانت المصابة حامل وقت حدوث العدوى (إذا كانت سيدة)</div>
              <SmallBox value={data.pregnant} onChange={(v) => upd('pregnant', v)} />
            </td>
            <td colSpan={2} style={td}>
              <div>مدة الحمل عند الإصابة بالمرض:</div>
              <div style={{ marginTop: '3px' }}><SmallBox value={data.pregnancy_week} onChange={(v) => upd('pregnancy_week', v)} width={60} /> أسبوع</div>
            </td>
          </tr>

          {/* بيانات تعريفية */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>بيانات تعريفية</td>
          </tr>
          <tr>
            <td style={td}>
              <div>اسم الأب:</div>
              <InlineInput value={data.father_name_id} onChange={(v) => upd('father_name_id', v)} width="100%" />
            </td>
            <td style={td}>
              <div>التليفون:</div>
              <InlineInput value={data.phone_id} onChange={(v) => upd('phone_id', v)} width="100%" />
            </td>
            <td colSpan={2} style={td}>
              <div>اسم الأم:</div>
              <InlineInput value={data.mother_name} onChange={(v) => upd('mother_name', v)} width="100%" />
            </td>
          </tr>

          {/* ملاحظات */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>ملاحظات</td>
          </tr>
          <tr>
            <td colSpan={4} style={{ ...td, height: '120px', verticalAlign: 'top' }}>
              <textarea
                value={data.notes || ''}
                onChange={(e) => upd('notes', e.target.value)}
                style={{
                  width: '100%',
                  height: '110px',
                  border: 'none',
                  resize: 'none',
                  fontSize: '9pt',
                  fontFamily: 'inherit',
                  background: 'transparent',
                  outline: 'none',
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ position: 'absolute', bottom: '6mm', right: '8mm', fontSize: '8pt' }}>٢</div>
    </div>
  );
}