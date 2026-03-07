import React from 'react';

const COMPETENCIES_LABELS = ["حس المسؤولية", "التعاون", "التواصل", "تحقيق النتائج", "التطوير", "الارتباط الوظيفي"];

const RATING_SCALE = [
  { score: 5, label: "ممتاز", labelEn: "Excellent" },
  { score: 4, label: "جيد جدا", labelEn: "Very Good" },
  { score: 3, label: "جيد", labelEn: "Good" },
  { score: 2, label: "مرضي", labelEn: "Satisfactory" },
  { score: 1, label: "غير مرضي", labelEn: "Unsatisfactory" }
];

export default function CharterPrintView({ data }) {
  const goals = data.goals || [];
  const competencies = data.competencies || [];
  const totalGoalsWeight = goals.reduce((s, g) => s + (parseFloat(g.relative_weight) || 0), 0);
  const totalCompWeight = competencies.reduce((s, c) => s + (parseFloat(c.relative_weight) || 0), 0);
  const totalWeightedRating = goals.reduce((s, g) => s + (parseFloat(g.weighted_rating) || 0), 0);
  
  const overallScore = RATING_SCALE.find(r => r.label === data.overall_rating_text);
  
  const cellStyle = "border: 1px solid #333; padding: 6px 8px; font-size: 11px;";
  const headerCellStyle = `${cellStyle} background: #e8f5e9; font-weight: bold; text-align: center;`;

  return (
    <div id="charter-print-area" style={{ direction: 'rtl', fontFamily: 'Cairo, Arial, sans-serif', padding: '20px', fontSize: '12px', color: '#333' }}>
      
      {/* === الصفحة الأولى: ميثاق الأداء === */}
      <div style={{ pageBreakAfter: 'always' }}>
        <div style={{ textAlign: 'center', background: '#2e7d32', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '16px' }}>ميثاق الأداء للموظف على الوظيفة غير الإشرافية 2025</h2>
        </div>

        {/* بيانات الموظف */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
          <tbody>
            <tr>
              <td style={`${cellStyle} font-weight:bold; width:20%; background:#f5f5f5;`}>اسم الموظف:</td>
              <td style={`${cellStyle} width:30%;`}>{data.employee_name || ''}</td>
              <td style={`${cellStyle} font-weight:bold; width:20%; background:#f5f5f5;`}>الوكالة / الإدارة العامة:</td>
              <td style={`${cellStyle} width:30%;`}>{data.agency_department || ''}</td>
            </tr>
            <tr>
              <td style={`${cellStyle} font-weight:bold; background:#f5f5f5;`}>المسمى الوظيفي:</td>
              <td style={cellStyle}>{data.job_title || ''}</td>
              <td style={`${cellStyle} font-weight:bold; background:#f5f5f5;`}>الإدارة / القسم:</td>
              <td style={cellStyle}>{data.department || ''}</td>
            </tr>
            <tr>
              <td style={`${cellStyle} font-weight:bold; background:#f5f5f5;`}>السجل المدني / رقم الموظف:</td>
              <td style={cellStyle}>{data.employee_id_number || ''}</td>
              <td style={`${cellStyle} font-weight:bold; background:#f5f5f5;`}>المدير (المقيّم):</td>
              <td style={cellStyle}>{data.manager_name || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* الأهداف */}
        <div style={{ background: '#2e7d32', color: 'white', padding: '8px 12px', borderRadius: '6px 6px 0 0', fontWeight: 'bold' }}>
          أولاً: الأهداف Part-1: The Goals
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>#</th>
              <th style={headerCellStyle}>الهدف The Goal</th>
              <th style={headerCellStyle}>معيار القياس</th>
              <th style={headerCellStyle}>الوزن النسبي</th>
              <th style={headerCellStyle}>الناتج المستهدف</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g, i) => (
              <tr key={i}>
                <td style={`${cellStyle} text-align:center;`}>{i + 1}</td>
                <td style={cellStyle}>{g.goal || ''}</td>
                <td style={`${cellStyle} text-align:center;`}>{g.measurement_criterion || ''}</td>
                <td style={`${cellStyle} text-align:center;`}>{((parseFloat(g.relative_weight) || 0) * 100).toFixed(0)}%</td>
                <td style={`${cellStyle} text-align:center;`}>{g.target_output || ''}</td>
              </tr>
            ))}
            <tr style={{ background: '#e8f5e9', fontWeight: 'bold' }}>
              <td colSpan={3} style={`${cellStyle} text-align:center;`}>مجموع الوزن النسبي</td>
              <td style={`${cellStyle} text-align:center;`}>{(totalGoalsWeight * 100).toFixed(0)}%</td>
              <td style={cellStyle}></td>
            </tr>
          </tbody>
        </table>

        {/* الجدارات */}
        <div style={{ background: '#2e7d32', color: 'white', padding: '8px 12px', borderRadius: '6px 6px 0 0', fontWeight: 'bold' }}>
          ثانياً: الجدارات Part-2: Competencies
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>#</th>
              <th style={headerCellStyle}>الجدارة</th>
              <th style={headerCellStyle}>الوزن النسبي</th>
              <th style={headerCellStyle}>مستوى الجدارة المطلوبة</th>
            </tr>
          </thead>
          <tbody>
            {competencies.map((c, i) => (
              <tr key={i}>
                <td style={`${cellStyle} text-align:center;`}>{i + 1}</td>
                <td style={cellStyle}>{c.name || COMPETENCIES_LABELS[i] || ''}</td>
                <td style={`${cellStyle} text-align:center;`}>{((parseFloat(c.relative_weight) || 0) * 100).toFixed(0)}%</td>
                <td style={`${cellStyle} text-align:center;`}>{c.required_level || ''}</td>
              </tr>
            ))}
            <tr style={{ background: '#e8f5e9', fontWeight: 'bold' }}>
              <td colSpan={2} style={`${cellStyle} text-align:center;`}>مجموع الوزن النسبي</td>
              <td style={`${cellStyle} text-align:center;`}>{(totalCompWeight * 100).toFixed(0)}%</td>
              <td style={cellStyle}></td>
            </tr>
          </tbody>
        </table>

        {/* التوقيعات */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '30px' }}>
          <tbody>
            <tr>
              <td style={`${cellStyle} text-align:center; width:25%; font-weight:bold;`}>التاريخ:</td>
              <td style={`${cellStyle} text-align:center; width:25%;`}>{data.charter_date || ''}</td>
              <td style={`${cellStyle} text-align:center; width:25%; font-weight:bold;`}>توقيع الموظف:</td>
              <td style={`${cellStyle} text-align:center; width:25%;`}></td>
            </tr>
            <tr>
              <td style={`${cellStyle} text-align:center; font-weight:bold;`}>توقيع المدير (المقيّم):</td>
              <td style={cellStyle}></td>
              <td style={`${cellStyle} text-align:center; font-weight:bold;`}>توقيع المعتمد:</td>
              <td style={cellStyle}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* === الصفحة الثانية: التقييم === */}
      {data.status !== 'ميثاق' && (
        <div style={{ pageBreakAfter: 'always' }}>
          <div style={{ textAlign: 'center', background: '#2e7d32', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '16px' }}>تقييم الأداء الوظيفي على الوظيفة غير الإشرافية 2025</h2>
          </div>

          {/* بيانات الموظف مكررة */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
            <tbody>
              <tr>
                <td style={`${cellStyle} font-weight:bold; background:#f5f5f5;`}>اسم الموظف:</td>
                <td style={cellStyle}>{data.employee_name || ''}</td>
                <td style={`${cellStyle} font-weight:bold; background:#f5f5f5;`}>الوكالة / الإدارة العامة:</td>
                <td style={cellStyle}>{data.agency_department || ''}</td>
              </tr>
              <tr>
                <td style={`${cellStyle} font-weight:bold; background:#f5f5f5;`}>المسمى الوظيفي:</td>
                <td style={cellStyle}>{data.job_title || ''}</td>
                <td style={`${cellStyle} font-weight:bold; background:#f5f5f5;`}>الإدارة / القسم:</td>
                <td style={cellStyle}>{data.department || ''}</td>
              </tr>
            </tbody>
          </table>

          {/* الأهداف مع التقييم */}
          <div style={{ background: '#2e7d32', color: 'white', padding: '8px 12px', borderRadius: '6px 6px 0 0', fontWeight: 'bold' }}>
            أولاً: الأهداف (التقييم)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr>
                <th style={headerCellStyle}>#</th>
                <th style={headerCellStyle}>الهدف</th>
                <th style={headerCellStyle}>معيار القياس</th>
                <th style={headerCellStyle}>الوزن</th>
                <th style={headerCellStyle}>المستهدف</th>
                <th style={headerCellStyle}>الفعلي</th>
                <th style={headerCellStyle}>الفرق</th>
                <th style={headerCellStyle}>التقدير الموزون</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((g, i) => (
                <tr key={i}>
                  <td style={`${cellStyle} text-align:center;`}>{i + 1}</td>
                  <td style={cellStyle}>{g.goal || ''}</td>
                  <td style={`${cellStyle} text-align:center;`}>{g.measurement_criterion || ''}</td>
                  <td style={`${cellStyle} text-align:center;`}>{((parseFloat(g.relative_weight) || 0) * 100).toFixed(0)}%</td>
                  <td style={`${cellStyle} text-align:center;`}>{g.target_output || ''}</td>
                  <td style={`${cellStyle} text-align:center;`}>{g.actual_output || 0}</td>
                  <td style={`${cellStyle} text-align:center;`}>{g.difference || 0}</td>
                  <td style={`${cellStyle} text-align:center;`}>{g.weighted_rating || 0}</td>
                </tr>
              ))}
              <tr style={{ background: '#e8f5e9', fontWeight: 'bold' }}>
                <td colSpan={7} style={`${cellStyle} text-align:center;`}>إجمالي التقدير الموزون</td>
                <td style={`${cellStyle} text-align:center;`}>{totalWeightedRating.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* الجدارات مع التقييم */}
          <div style={{ background: '#2e7d32', color: 'white', padding: '8px 12px', borderRadius: '6px 6px 0 0', fontWeight: 'bold' }}>
            ثانياً: الجدارات (التقييم)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr>
                <th style={headerCellStyle}>#</th>
                <th style={headerCellStyle}>الجدارة</th>
                <th style={headerCellStyle}>الوزن</th>
                <th style={headerCellStyle}>المستوى المتحقق</th>
                <th style={headerCellStyle}>التقدير</th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((c, i) => (
                <tr key={i}>
                  <td style={`${cellStyle} text-align:center;`}>{i + 1}</td>
                  <td style={cellStyle}>{c.name || ''}</td>
                  <td style={`${cellStyle} text-align:center;`}>{((parseFloat(c.relative_weight) || 0) * 100).toFixed(0)}%</td>
                  <td style={`${cellStyle} text-align:center;`}>{c.achieved_level || ''}</td>
                  <td style={`${cellStyle} text-align:center;`}>{c.rating || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* التوقيعات */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '30px' }}>
            <tbody>
              <tr>
                <td style={`${cellStyle} text-align:center; font-weight:bold;`}>توقيع الموظف:</td>
                <td style={cellStyle}></td>
                <td style={`${cellStyle} text-align:center; font-weight:bold;`}>توقيع المدير (المقيّم):</td>
                <td style={cellStyle}></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* === الصفحة الثالثة: التقدير العام === */}
      {data.status === 'مكتمل' && (
        <div>
          <div style={{ textAlign: 'center', background: '#2e7d32', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '16px' }}>التقدير العام لأداء الموظف على الوظيفة غير الإشرافية 2025</h2>
          </div>

          {/* التقدير النهائي */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
            <thead>
              <tr>
                <th style={headerCellStyle}>التصنيف</th>
                <th style={headerCellStyle}>التقدير العام</th>
                <th style={headerCellStyle}>النتيجة</th>
              </tr>
            </thead>
            <tbody>
              {RATING_SCALE.map(r => (
                <tr key={r.score} style={data.overall_rating_text === r.label ? { background: '#e8f5e9' } : {}}>
                  <td style={`${cellStyle} text-align:center; font-weight:bold;`}>{r.score}</td>
                  <td style={`${cellStyle} text-align:center;`}>{r.label} - {r.labelEn}</td>
                  <td style={`${cellStyle} text-align:center;`}>{data.overall_rating_text === r.label ? '✓' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* نقاط القوة والتطوير */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
            <thead>
              <tr>
                <th style={`${headerCellStyle} width:50%;`}>نقاط القوة Strength Points</th>
                <th style={`${headerCellStyle} width:50%;`}>النقاط التي تحتاج إلى تطوير</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={`${cellStyle} min-height:80px; vertical-align:top;`}>{data.strength_points || ''}</td>
                <td style={`${cellStyle} min-height:80px; vertical-align:top;`}>{data.improvement_points || ''}</td>
              </tr>
            </tbody>
          </table>

          {/* الملاحظات */}
          <div style={{ border: '1px solid #333', padding: '10px', borderRadius: '6px', marginBottom: '20px' }}>
            <strong>الملاحظات Remarks:</strong>
            <p style={{ marginTop: '8px' }}>{data.remarks || ''}</p>
          </div>

          {/* التوقيعات */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '30px' }}>
            <tbody>
              <tr>
                <td style={`${cellStyle} text-align:center; font-weight:bold;`}>توقيع الموظف</td>
                <td style={cellStyle}></td>
                <td style={`${cellStyle} text-align:center; font-weight:bold;`}>توقيع المدير (المقيّم)</td>
                <td style={cellStyle}></td>
                <td style={`${cellStyle} text-align:center; font-weight:bold;`}>توقيع المعتمد</td>
                <td style={cellStyle}></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}