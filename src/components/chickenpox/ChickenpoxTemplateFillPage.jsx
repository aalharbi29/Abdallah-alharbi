import React from 'react';

const inputBase = {
  position: 'absolute',
  border: 'none',
  background: 'transparent',
  color: '#000',
  fontFamily: "'Tajawal','Cairo',Arial,sans-serif",
  fontSize: '9pt',
  fontWeight: 700,
  textAlign: 'center',
  outline: 'none',
  padding: '0 2px',
  height: '18px',
};

const areaBase = {
  ...inputBase,
  resize: 'none',
  lineHeight: 1.35,
  textAlign: 'right',
};

const checkBase = {
  position: 'absolute',
  width: '13px',
  height: '13px',
  margin: 0,
  accentColor: '#111827',
};

const field = (top, right, width, extra = {}) => ({ ...inputBase, top: `${top}%`, right: `${right}%`, width: `${width}%`, ...extra });
const area = (top, right, width, height, extra = {}) => ({ ...areaBase, top: `${top}%`, right: `${right}%`, width: `${width}%`, height: `${height}%`, ...extra });
const check = (top, right) => ({ ...checkBase, top: `${top}%`, right: `${right}%` });

function TextField({ value, onChange, style, as = 'input' }) {
  const Comp = as;
  return <Comp value={value || ''} onChange={(e) => onChange(e.target.value)} style={style} />;
}

function CheckField({ checked, onChange, style }) {
  return <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} style={style} />;
}

export default function ChickenpoxTemplateFillPage({
  imageUrl,
  pageIndex,
  investigation,
  setInvestigation,
  vaccination,
  setVaccination,
  contacts,
  setContacts,
  updateContactRow,
  printable = true,
}) {
  const inv = (key, value) => setInvestigation?.({ ...investigation, [key]: value });
  const vac = (key, value) => setVaccination?.({ ...vaccination, [key]: value });
  const con = (key, value) => setContacts?.({ ...contacts, [key]: value });
  const invNested = (parent, key, value) => setInvestigation?.({
    ...investigation,
    [parent]: { ...(investigation?.[parent] || {}), [key]: value },
  });

  return (
    <div
      className={printable ? 'a4-page pdf-template-page' : 'guidelines-page pdf-template-page'}
      style={{
        width: '210mm',
        height: '297mm',
        background: '#fff',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}
    >
      <img src={imageUrl} alt={`صفحة ${pageIndex + 1}`} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} />

      {pageIndex === 0 && (
        <>
          <TextField value={investigation?.notification_date?.d} onChange={(v) => invNested('notification_date', 'd', v)} style={field(13.4, 76.5, 3)} />
          <TextField value={investigation?.notification_date?.m} onChange={(v) => invNested('notification_date', 'm', v)} style={field(13.4, 72.8, 3)} />
          <TextField value={investigation?.notification_date?.y} onChange={(v) => invNested('notification_date', 'y', v)} style={field(13.4, 66.7, 5)} />
          <TextField value={investigation?.investigation_date?.d} onChange={(v) => invNested('investigation_date', 'd', v)} style={field(13.4, 50.2, 3)} />
          <TextField value={investigation?.investigation_date?.m} onChange={(v) => invNested('investigation_date', 'm', v)} style={field(13.4, 46.5, 3)} />
          <TextField value={investigation?.investigation_date?.y} onChange={(v) => invNested('investigation_date', 'y', v)} style={field(13.4, 40.3, 5)} />

          <TextField value={investigation?.investigator_name} onChange={(v) => inv('investigator_name', v)} style={field(14.9, 48, 29)} />
          <TextField value={investigation?.job} onChange={(v) => inv('job', v)} style={field(16.5, 68, 12)} />
          <TextField value={investigation?.workplace} onChange={(v) => inv('workplace', v)} style={field(16.5, 43, 16)} />
          <TextField value={investigation?.sector} onChange={(v) => inv('sector', v)} style={field(18.1, 66, 16)} />
          <TextField value={investigation?.health_center} onChange={(v) => inv('health_center', v)} style={field(18.1, 42, 17)} />
          <TextField value={investigation?.region} onChange={(v) => inv('region', v)} style={field(18.1, 22, 13)} />

          <TextField value={investigation?.patient_name} onChange={(v) => inv('patient_name', v)} style={field(22.4, 75, 13)} />
          <TextField value={investigation?.father_name} onChange={(v) => inv('father_name', v)} style={field(22.4, 59, 12)} />
          <TextField value={investigation?.grandfather_name} onChange={(v) => inv('grandfather_name', v)} style={field(22.4, 43, 12)} />
          <TextField value={investigation?.family_name} onChange={(v) => inv('family_name', v)} style={field(22.4, 24, 14)} />
          <TextField value={investigation?.national_id} onChange={(v) => inv('national_id', v)} style={field(26.2, 53, 31)} />
          <TextField value={investigation?.birth_d} onChange={(v) => inv('birth_d', v)} style={field(30.4, 78, 3)} />
          <TextField value={investigation?.birth_m} onChange={(v) => inv('birth_m', v)} style={field(30.4, 74, 3)} />
          <TextField value={investigation?.birth_y} onChange={(v) => inv('birth_y', v)} style={field(30.4, 67.8, 5)} />
          <TextField value={investigation?.age} onChange={(v) => inv('age', v)} style={field(30.7, 48, 6)} />
          <CheckField checked={investigation?.gender === 'ذكر'} onChange={(v) => inv('gender', v ? 'ذكر' : '')} style={check(31.1, 31.8)} />
          <CheckField checked={investigation?.gender === 'أنثى'} onChange={(v) => inv('gender', v ? 'أنثى' : '')} style={check(32.8, 31.8)} />
          <CheckField checked={investigation?.nationality === 'سعودي'} onChange={(v) => inv('nationality', v ? 'سعودي' : '')} style={check(31.1, 18.4)} />
          <CheckField checked={investigation?.nationality === 'غير سعودي'} onChange={(v) => inv('nationality', v ? 'غير سعودي' : '')} style={check(34.4, 18.4)} />

          <TextField value={investigation?.occupation_other || investigation?.occupation} onChange={(v) => inv('occupation_other', v)} style={field(39.2, 25, 30)} />
          <TextField value={investigation?.home_phone} onChange={(v) => inv('home_phone', v)} style={field(44.2, 51, 19)} />
          <TextField value={investigation?.work_phone} onChange={(v) => inv('work_phone', v)} style={field(46.2, 51, 19)} />
          <TextField value={investigation?.mobile_phone} onChange={(v) => inv('mobile_phone', v)} style={field(48.1, 51, 19)} />
          <TextField value={investigation?.address} onChange={(v) => inv('address', v)} style={field(52.8, 48, 33)} />
          <TextField value={investigation?.village} onChange={(v) => inv('village', v)} style={field(52.8, 36, 9)} />
          <TextField value={investigation?.city} onChange={(v) => inv('city', v)} style={field(52.8, 24, 9)} />
          <TextField value={investigation?.region_address} onChange={(v) => inv('region_address', v)} style={field(52.8, 12, 9)} />

          <TextField value={investigation?.hospital_name} onChange={(v) => inv('hospital_name', v)} style={field(58.9, 42, 34)} />
          <TextField value={investigation?.file_number} onChange={(v) => inv('file_number', v)} style={field(58.9, 13, 20)} />
          <TextField value={investigation?.symptoms_d} onChange={(v) => inv('symptoms_d', v)} style={field(64.4, 78, 3)} />
          <TextField value={investigation?.symptoms_m} onChange={(v) => inv('symptoms_m', v)} style={field(64.4, 74, 3)} />
          <TextField value={investigation?.symptoms_y} onChange={(v) => inv('symptoms_y', v)} style={field(64.4, 67.8, 5)} />
          <TextField value={investigation?.discharge_status} onChange={(v) => inv('discharge_status', v)} style={field(72.8, 16, 22)} />
          <TextField value={investigation?.case_type} onChange={(v) => inv('case_type', v)} style={field(81.5, 12, 20)} />

          <TextField value={investigation?.rash_duration} onChange={(v) => inv('rash_duration', v)} style={field(91.2, 43, 8)} />
          <TextField value={investigation?.max_temp} onChange={(v) => inv('max_temp', v)} style={field(94.3, 17, 10)} />
        </>
      )}

      {pageIndex === 1 && (
        <>
          <TextField value={vaccination?.vaccinated} onChange={(v) => vac('vaccinated', v)} style={field(13.8, 79, 7)} />
          <TextField value={vaccination?.first_dose_d} onChange={(v) => vac('first_dose_d', v)} style={field(14.1, 34, 3)} />
          <TextField value={vaccination?.first_dose_m} onChange={(v) => vac('first_dose_m', v)} style={field(14.1, 30, 3)} />
          <TextField value={vaccination?.first_dose_y} onChange={(v) => vac('first_dose_y', v)} style={field(14.1, 24, 5)} />
          <TextField value={vaccination?.first_dose_type} onChange={(v) => vac('first_dose_type', v)} style={field(14.2, 14, 7)} />
          <TextField value={vaccination?.first_dose_product} onChange={(v) => vac('first_dose_product', v)} style={field(14.2, 4, 7)} />
          <TextField value={vaccination?.second_dose_d} onChange={(v) => vac('second_dose_d', v)} style={field(22.1, 76, 3)} />
          <TextField value={vaccination?.second_dose_m} onChange={(v) => vac('second_dose_m', v)} style={field(22.1, 72, 3)} />
          <TextField value={vaccination?.second_dose_y} onChange={(v) => vac('second_dose_y', v)} style={field(22.1, 66, 5)} />
          <TextField value={vaccination?.doses_before_year} onChange={(v) => vac('doses_before_year', v)} style={field(29.8, 66, 8)} />
          <TextField value={vaccination?.doses_after_year} onChange={(v) => vac('doses_after_year', v)} style={field(34.5, 66, 8)} />
          <TextField value={vaccination?.vaccine_type} onChange={(v) => vac('vaccine_type', v)} style={field(31.8, 18, 24)} />
          <TextField value={vaccination?.vaccine_product} onChange={(v) => vac('vaccine_product', v)} style={field(37.1, 18, 24)} />

          <TextField value={vaccination?.lab_test} onChange={(v) => vac('lab_test', v)} style={field(47.2, 69, 8)} />
          <TextField value={vaccination?.igm_date_d} onChange={(v) => vac('igm_date_d', v)} style={field(47.2, 34, 3)} />
          <TextField value={vaccination?.igm_date_m} onChange={(v) => vac('igm_date_m', v)} style={field(47.2, 30, 3)} />
          <TextField value={vaccination?.igm_date_y} onChange={(v) => vac('igm_date_y', v)} style={field(47.2, 24, 5)} />
          <TextField value={vaccination?.igm_result} onChange={(v) => vac('igm_result', v)} style={field(47.4, 7, 8)} />
          <TextField value={vaccination?.igg_result} onChange={(v) => vac('igg_result', v)} style={field(58.2, 12, 16)} />
          <TextField value={vaccination?.other_tests} onChange={(v) => vac('other_tests', v)} style={field(68.4, 56, 14)} />
          <TextField value={vaccination?.test_type} onChange={(v) => vac('test_type', v)} style={field(68.4, 18, 26)} />

          <TextField value={vaccination?.infection_source} onChange={(v) => vac('infection_source', v)} style={area(78.1, 52, 35, 4, { fontSize: '8pt' })} as="textarea" />
          <TextField value={vaccination?.pregnancy_week} onChange={(v) => vac('pregnancy_week', v)} style={field(86.7, 18, 9)} />
          <TextField value={vaccination?.father_name_id} onChange={(v) => vac('father_name_id', v)} style={field(93.5, 67, 19)} />
          <TextField value={vaccination?.phone_id} onChange={(v) => vac('phone_id', v)} style={field(93.5, 42, 18)} />
          <TextField value={vaccination?.mother_name} onChange={(v) => vac('mother_name', v)} style={field(93.5, 12, 23)} />
        </>
      )}

      {pageIndex === 2 && (
        <>
          <TextField value={contacts?.patient_name} onChange={(v) => con('patient_name', v)} style={field(24.2, 66, 22)} />
          <TextField value={contacts?.investigation_number} onChange={(v) => con('investigation_number', v)} style={field(24.2, 39, 18)} />
          <TextField value={contacts?.center_name} onChange={(v) => con('center_name', v)} style={field(24.2, 12, 22)} />
          {(contacts?.rows || []).slice(0, 10).map((row, i) => {
            const top = 35.5 + i * 3.35;
            return (
              <React.Fragment key={i}>
                <TextField value={row.name} onChange={(v) => updateContactRow(i, 'name', v)} style={field(top, 72, 15, { fontSize: '7.5pt' })} />
                <TextField value={row.gender} onChange={(v) => updateContactRow(i, 'gender', v)} style={field(top, 62, 7, { fontSize: '7.5pt' })} />
                <TextField value={row.age} onChange={(v) => updateContactRow(i, 'age', v)} style={field(top, 53, 6, { fontSize: '7.5pt' })} />
                <TextField value={row.national_id} onChange={(v) => updateContactRow(i, 'national_id', v)} style={field(top, 38, 12, { fontSize: '7.5pt' })} />
                <TextField value={row.mobile} onChange={(v) => updateContactRow(i, 'mobile', v)} style={field(top, 23, 12, { fontSize: '7.5pt' })} />
                <TextField value={row.relation} onChange={(v) => updateContactRow(i, 'relation', v)} style={field(top, 13, 8, { fontSize: '7.5pt' })} />
                <TextField value={row.action} onChange={(v) => updateContactRow(i, 'action', v)} style={field(top, 4, 8, { fontSize: '7.5pt' })} />
              </React.Fragment>
            );
          })}
          <TextField value={contacts?.investigator_name} onChange={(v) => con('investigator_name', v)} style={field(75.2, 55, 25)} />
          <TextField value={contacts?.investigator_mobile} onChange={(v) => con('investigator_mobile', v)} style={field(75.2, 20, 20)} />
          <TextField value={contacts?.signature_date} onChange={(v) => con('signature_date', v)} style={field(78.2, 22, 16)} />
        </>
      )}
    </div>
  );
}