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

export default function ChickenpoxVaccinationPage({ data, onChange }) {
  const upd = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="a4-page" style={A4_PAGE_STYLE}>
      <PageHeader title="استمارة استقصاء وبائي لحالة جديري مائي" />

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <tbody>
          {/* تاريخ التحصين */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>تاريخ التحصين ضد الجديري المائي</td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>هل تم الحصول على لقاح ضد الجديري المائي</div>
              <SmallBox value={data.vaccinated} onChange={(v) => upd('vaccinated', v)} />
              <div style={{ fontSize: '8pt', marginTop: '3px' }}>١= نعم    ٢= لا    ٣= غير معروف</div>
            </td>
            <td style={cellStyle}>
              <div>سبب عدم الحصول على اللقاح</div>
              <div style={{ fontSize: '8pt' }}>
                <label style={{ display: 'block' }}><input type="radio" name="novac" checked={data.no_vaccine_reason === 'موانع طبية'} onChange={() => upd('no_vaccine_reason', 'موانع طبية')} /> ١= موانع طبية</label>
                <label style={{ display: 'block' }}><input type="radio" name="novac" checked={data.no_vaccine_reason === 'سابقة الإصابة بالمرض'} onChange={() => upd('no_vaccine_reason', 'سابقة الإصابة بالمرض')} /> ٢= سابقة الإصابة بالمرض</label>
                <label><input type="radio" name="novac" checked={data.no_vaccine_reason === 'أقل من السن'} onChange={() => upd('no_vaccine_reason', 'أقل من السن')} /> ٣= أقل من السن  ٤= أخرى</label>
              </div>
            </td>
            <td style={cellStyle}>
              <div>تاريخ الحصول على أول جرعة</div>
              <DateBoxes d={data.first_dose_d} m={data.first_dose_m} y={data.first_dose_y}
                onDChange={(v) => upd('first_dose_d', v)} onMChange={(v) => upd('first_dose_m', v)} onYChange={(v) => upd('first_dose_y', v)} />
            </td>
            <td style={cellStyle}>
              <div>النوع</div>
              <SmallBox value={data.first_dose_type} onChange={(v) => upd('first_dose_type', v)} />
              <div style={{ marginTop: '4px' }}>منتج</div>
              <SmallBox value={data.first_dose_product} onChange={(v) => upd('first_dose_product', v)} />
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>تاريخ الحصول على ثاني جرعة</div>
              <DateBoxes d={data.second_dose_d} m={data.second_dose_m} y={data.second_dose_y}
                onDChange={(v) => upd('second_dose_d', v)} onMChange={(v) => upd('second_dose_m', v)} onYChange={(v) => upd('second_dose_y', v)} />
            </td>
            <td style={cellStyle}>
              <div>النوع</div>
              <SmallBox value={data.second_dose_type} onChange={(v) => upd('second_dose_type', v)} />
              <div style={{ marginTop: '4px' }}>منتج</div>
              <SmallBox value={data.second_dose_product} onChange={(v) => upd('second_dose_product', v)} />
            </td>
            <td style={cellStyle}>
              <div>تاريخ الحصول على ثالث جرعة</div>
              <DateBoxes d={data.third_dose_d} m={data.third_dose_m} y={data.third_dose_y}
                onDChange={(v) => upd('third_dose_d', v)} onMChange={(v) => upd('third_dose_m', v)} onYChange={(v) => upd('third_dose_y', v)} />
            </td>
            <td style={cellStyle}>
              <div>النوع</div>
              <SmallBox value={data.third_dose_type} onChange={(v) => upd('third_dose_type', v)} />
              <div style={{ marginTop: '4px' }}>منتج</div>
              <SmallBox value={data.third_dose_product} onChange={(v) => upd('third_dose_product', v)} />
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cellStyle}>
              <div>عدد الجرعات التي تم الحصول عليها قبل بلوغ عام</div>
              <SmallBox value={data.doses_before_year} onChange={(v) => upd('doses_before_year', v)} />
            </td>
            <td colSpan={2} style={cellStyle}>
              <div style={{ fontSize: '8pt' }}>نوع اللقاح:
                <label style={{ marginRight: '4px' }}><input type="radio" name="vtype" checked={data.vaccine_type === 'الجديري المائي'} onChange={() => upd('vaccine_type', 'الجديري المائي')} /> ١= الجديري المائي</label>
                <label style={{ marginRight: '4px' }}><input type="radio" name="vtype" checked={data.vaccine_type === 'MMR'} onChange={() => upd('vaccine_type', 'MMR')} /> ٢= MMR</label>
                <label style={{ marginRight: '4px' }}><input type="radio" name="vtype" checked={data.vaccine_type === 'أخرى'} onChange={() => upd('vaccine_type', 'أخرى')} /> ٣= أخرى</label>
                <label><input type="radio" name="vtype" checked={data.vaccine_type === 'غير معروف'} onChange={() => upd('vaccine_type', 'غير معروف')} /> ٤= غير معروف</label>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cellStyle}>
              <div>عدد الجرعات التي تم الحصول عليها عند بلوغ عام أو بعده</div>
              <SmallBox value={data.doses_after_year} onChange={(v) => upd('doses_after_year', v)} />
            </td>
            <td colSpan={2} style={cellStyle}>
              <div style={{ fontSize: '8pt' }}>منتج اللقاح:
                <label style={{ marginRight: '4px' }}><input type="radio" name="vprod" checked={data.vaccine_product === 'شركة ميرك'} onChange={() => upd('vaccine_product', 'شركة ميرك')} /> ١= شركة ميرك</label>
                <label style={{ marginRight: '4px' }}><input type="radio" name="vprod" checked={data.vaccine_product === 'أخرى'} onChange={() => upd('vaccine_product', 'أخرى')} /> ٢= أخرى</label>
                <label><input type="radio" name="vprod" checked={data.vaccine_product === 'غير معروف'} onChange={() => upd('vaccine_product', 'غير معروف')} /> ٣= غير معروف</label>
              </div>
            </td>
          </tr>

          {/* البيانات المخبرية */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>البيانات المخبرية</td>
          </tr>
          <tr>
            <td colSpan={2} style={cellStyle}>
              <div>إجراء اختبارات مخبرية للتأكد من التشخيص بالجديري المائي:</div>
              <div style={{ fontSize: '8pt' }}>
                <label><input type="radio" name="lab" checked={data.lab_test === 'نعم'} onChange={() => upd('lab_test', 'نعم')} /> ١= نعم</label>{' '}
                <label><input type="radio" name="lab" checked={data.lab_test === 'لا'} onChange={() => upd('lab_test', 'لا')} /> ٢= لا</label>
              </div>
              <div style={{ fontSize: '8pt' }}>
                <label><input type="radio" name="lab" checked={data.lab_test === 'غير معروف'} onChange={() => upd('lab_test', 'غير معروف')} /> ٣= غير معروف</label>
              </div>
            </td>
            <td style={cellStyle}>
              <div>تاريخ إجراء اختبار العينة المصلية IgM:</div>
              <DateBoxes d={data.igm_date_d} m={data.igm_date_m} y={data.igm_date_y}
                onDChange={(v) => upd('igm_date_d', v)} onMChange={(v) => upd('igm_date_m', v)} onYChange={(v) => upd('igm_date_y', v)} />
            </td>
            <td style={cellStyle}>
              <div>نتيجة الاختبار</div>
              <SmallBox value={data.igm_result} onChange={(v) => upd('igm_result', v)} />
              <div style={{ fontSize: '7pt', marginTop: '2px' }}>١= إيجابية ٢= سلبية ٣= غير محددة ٤= جاري الحصول عليها ٥= لم تعمل ٦= غير معروف</div>
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>تاريخ إجراء اختبار العينة المصلية IgG في المرحلة الحادة</div>
              <DateBoxes d={data.igg_acute_d} m={data.igg_acute_m} y={data.igg_acute_y}
                onDChange={(v) => upd('igg_acute_d', v)} onMChange={(v) => upd('igg_acute_m', v)} onYChange={(v) => upd('igg_acute_y', v)} />
            </td>
            <td style={cellStyle}>
              <div>تاريخ إجراء اختبار العينة المصلية IgG في مرحلة النقاهة</div>
              <DateBoxes d={data.igg_recovery_d} m={data.igg_recovery_m} y={data.igg_recovery_y}
                onDChange={(v) => upd('igg_recovery_d', v)} onMChange={(v) => upd('igg_recovery_m', v)} onYChange={(v) => upd('igg_recovery_y', v)} />
            </td>
            <td colSpan={2} style={cellStyle}>
              <div>نتيجة اختبارات IgG:</div>
              <SmallBox value={data.igg_result} onChange={(v) => upd('igg_result', v)} />
              <div style={{ fontSize: '7pt' }}>١= زيادة ذات أهمية ٢= زيادة غير ذات أهمية ٣= نتيجة غير محددة ٤= لم تعمل ٥= غير معروف</div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cellStyle}>
              <div>اختبارات أخرى تم إجراؤها:</div>
              <SmallBox value={data.other_tests} onChange={(v) => upd('other_tests', v)} />
              <div style={{ fontSize: '7pt' }}>١= إيجابية ٢= سلبية ٣= جاري الحصول عليها ٤= لم تعمل ٥= غير معروف</div>
            </td>
            <td colSpan={2} style={cellStyle}>
              <div>يذكر نوع الاختبار:</div>
              <InlineInput value={data.test_type} onChange={(v) => upd('test_type', v)} width="100%" />
            </td>
          </tr>

          {/* البيانات الوبائية */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>البيانات الوبائية</td>
          </tr>
          <tr>
            <td colSpan={2} style={cellStyle}>
              <div>أين حدث انتقال العدوى للحالة:</div>
              <div style={{ fontSize: '8pt' }}>
                ١= في المنزل  ٢= لمدرسة  ٣= في عيادة طبيب
              </div>
              <div style={{ fontSize: '8pt' }}>
                ٤= في مستشفى  ٥= في المنزل  ٦= في العمل
              </div>
              <div style={{ fontSize: '8pt' }}>
                ٧= في الجامعة  ٨= غير معروف  ٩= أخرى وتذكر
              </div>
              <InlineInput value={data.infection_source} onChange={(v) => upd('infection_source', v)} width="80%" />
            </td>
            <td colSpan={2} style={cellStyle}>
              <div>هل ترتبط الحالة بحدوث تفشي وبائي:</div>
              <div style={{ fontSize: '8pt' }}>
                <label><input type="radio" name="related" checked={data.related_outbreak === 'نعم'} onChange={() => upd('related_outbreak', 'نعم')} /> ١= نعم</label>{' '}
                <label><input type="radio" name="related" checked={data.related_outbreak === 'لا'} onChange={() => upd('related_outbreak', 'لا')} /> ٢= لا</label>{' '}
                <label><input type="radio" name="related" checked={data.related_outbreak === 'غير معروف'} onChange={() => upd('related_outbreak', 'غير معروف')} /> ٣= غير معروف</label>
              </div>
              <div style={{ marginTop: '4px' }}>هل ترتبط الحالة بحالة أخرى مؤكدة مخبرياً:</div>
              <div style={{ fontSize: '8pt' }}>
                <label><input type="radio" name="related2" checked={data.related_to_other_case === 'نعم'} onChange={() => upd('related_to_other_case', 'نعم')} /> ١= نعم</label>{' '}
                <label><input type="radio" name="related2" checked={data.related_to_other_case === 'لا'} onChange={() => upd('related_to_other_case', 'لا')} /> ٢= لا</label>{' '}
                <label><input type="radio" name="related2" checked={data.related_to_other_case === 'غير معروف'} onChange={() => upd('related_to_other_case', 'غير معروف')} /> ٣= غير معروف</label>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cellStyle}>
              <div>هل كانت المصابة حامل وقت حدوث العدوى (إذا كانت سيدة)</div>
              <SmallBox value={data.pregnant} onChange={(v) => upd('pregnant', v)} />
            </td>
            <td colSpan={2} style={cellStyle}>
              <div>مدة الحمل عند الإصابة بالمرض: <SmallBox value={data.pregnancy_week} onChange={(v) => upd('pregnancy_week', v)} width={50} /> أسبوع</div>
            </td>
          </tr>

          {/* بيانات تعريفية */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>بيانات تعريفية</td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <div>اسم الأب:</div>
              <InlineInput value={data.father_name_id} onChange={(v) => upd('father_name_id', v)} width="100%" />
            </td>
            <td style={cellStyle}>
              <div>التليفون:</div>
              <InlineInput value={data.phone_id} onChange={(v) => upd('phone_id', v)} width="100%" />
            </td>
            <td colSpan={2} style={cellStyle}>
              <div>اسم الأم:</div>
              <InlineInput value={data.mother_name} onChange={(v) => upd('mother_name', v)} width="100%" />
            </td>
          </tr>

          {/* ملاحظات */}
          <tr>
            <td colSpan={4} style={SECTION_HEADER_STYLE}>ملاحظات</td>
          </tr>
          <tr>
            <td colSpan={4} style={{ ...cellStyle, height: '120px', verticalAlign: 'top' }}>
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

      <div style={{ position: 'absolute', bottom: '8mm', right: '10mm', fontSize: '8pt' }}>٢</div>
    </div>
  );
}