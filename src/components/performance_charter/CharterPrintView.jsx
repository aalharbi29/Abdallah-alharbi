import React from 'react';

const COMPETENCIES_LABELS = ["حس المسؤولية", "التعاون", "التواصل", "تحقيق النتائج", "التطوير", "الارتباط الوظيفي"];

const RATING_SCALE = [
  { score: 5, label: "ممتاز", labelEn: "Excellent" },
  { score: 4, label: "جيد جدا", labelEn: "Very Good" },
  { score: 3, label: "جيد", labelEn: "Good" },
  { score: 2, label: "مرضي", labelEn: "Satisfactory" },
  { score: 1, label: "غير مرضي", labelEn: "Unsatisfactory" }
];

const cell = { border: '1px solid #333', padding: '6px 8px', fontSize: '11px' };
const cellCenter = { ...cell, textAlign: 'center' };
const cellBold = { ...cell, fontWeight: 'bold', background: '#f5f5f5' };
const cellBoldCenter = { ...cellBold, textAlign: 'center' };
const headerCell = { ...cell, background: '#e8f5e9', fontWeight: 'bold', textAlign: 'center' };
const headerCellW50 = { ...headerCell, width: '50%' };

export default function CharterPrintView({ data }) {
  const goals = data.goals || [];
  const competencies = data.competencies || [];
  const totalGoalsWeight = goals.reduce((s, g) => s + (parseFloat(g.relative_weight) || 0), 0);
  const totalCompWeight = competencies.reduce((s, c) => s + (parseFloat(c.relative_weight) || 0), 0);
  const totalWeightedRating = goals.reduce((s, g) => s + (parseFloat(g.weighted_rating) || 0), 0);

  const sectionHeader = { background: '#2e7d32', color: 'white', padding: '8px 12px', borderRadius: '6px 6px 0 0', fontWeight: 'bold' };
  const titleBar = { textAlign: 'center', background: '#2e7d32', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '15px' };
  const tbl = { width: '100%', borderCollapse: 'collapse', marginBottom: '10px' };
  const tblMb15 = { ...tbl, marginBottom: '15px' };
  const sigTbl = { width: '100%', borderCollapse: 'collapse', marginTop: '30px' };

  return (
    <div id="charter-print-area" style={{ direction: 'rtl', fontFamily: 'Cairo, Arial, sans-serif', padding: '20px', fontSize: '12px', color: '#333' }}>
      
      {/* === الصفحة الأولى: ميثاق الأداء === */}
      <div style={{ pageBreakAfter: 'always' }}>
        <div style={titleBar}>
          <h2 style={{ margin: 0, fontSize: '16px' }}>ميثاق الأداء للموظف على الوظيفة غير الإشرافية 2025</h2>
        </div>

        <table style={tblMb15}>
          <tbody>
            <tr>
              <td style={{ ...cellBold, width: '20%' }}>اسم الموظف:</td>
              <td style={{ ...cell, width: '30%' }}>{data.employee_name || ''}</td>
              <td style={{ ...cellBold, width: '20%' }}>الوكالة / الإدارة العامة:</td>
              <td style={{ ...cell, width: '30%' }}>{data.agency_department || ''}</td>
            </tr>
            <tr>
              <td style={cellBold}>المسمى الوظيفي:</td>
              <td style={cell}>{data.job_title || ''}</td>
              <td style={cellBold}>الإدارة / القسم:</td>
              <td style={cell}>{data.department || ''}</td>
            </tr>
            <tr>
              <td style={cellBold}>السجل المدني / رقم الموظف:</td>
              <td style={cell}>{data.employee_id_number || ''}</td>
              <td style={cellBold}>المدير (المقيّم):</td>
              <td style={cell}>{data.manager_name || ''}</td>
            </tr>
          </tbody>
        </table>

        <div style={sectionHeader}>أولاً: الأهداف Part-1: The Goals</div>
        <table style={tbl}>
          <thead>
            <tr>
              <th style={headerCell}>#</th>
              <th style={headerCell}>الهدف The Goal</th>
              <th style={headerCell}>معيار القياس</th>
              <th style={headerCell}>الوزن النسبي</th>
              <th style={headerCell}>الناتج المستهدف</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g, i) => (
              <tr key={i}>
                <td style={cellCenter}>{i + 1}</td>
                <td style={cell}>{g.goal || ''}</td>
                <td style={cellCenter}>{g.measurement_criterion || ''}</td>
                <td style={cellCenter}>{((parseFloat(g.relative_weight) || 0) * 100).toFixed(0)}%</td>
                <td style={cellCenter}>{g.target_output || ''}</td>
              </tr>
            ))}
            <tr style={{ background: '#e8f5e9', fontWeight: 'bold' }}>
              <td colSpan={3} style={cellCenter}>مجموع الوزن النسبي</td>
              <td style={cellCenter}>{(totalGoalsWeight * 100).toFixed(0)}%</td>
              <td style={cell}></td>
            </tr>
          </tbody>
        </table>

        <div style={sectionHeader}>ثانياً: الجدارات Part-2: Competencies</div>
        <table style={tbl}>
          <thead>
            <tr>
              <th style={headerCell}>#</th>
              <th style={headerCell}>الجدارة</th>
              <th style={headerCell}>الوزن النسبي</th>
              <th style={headerCell}>مستوى الجدارة المطلوبة</th>
            </tr>
          </thead>
          <tbody>
            {competencies.map((c, i) => (
              <tr key={i}>
                <td style={cellCenter}>{i + 1}</td>
                <td style={cell}>{c.name || COMPETENCIES_LABELS[i] || ''}</td>
                <td style={cellCenter}>{((parseFloat(c.relative_weight) || 0) * 100).toFixed(0)}%</td>
                <td style={cellCenter}>{c.required_level || ''}</td>
              </tr>
            ))}
            <tr style={{ background: '#e8f5e9', fontWeight: 'bold' }}>
              <td colSpan={2} style={cellCenter}>مجموع الوزن النسبي</td>
              <td style={cellCenter}>{(totalCompWeight * 100).toFixed(0)}%</td>
              <td style={cell}></td>
            </tr>
          </tbody>
        </table>

        <table style={sigTbl}>
          <tbody>
            <tr>
              <td style={{ ...cellBoldCenter, width: '25%' }}>التاريخ:</td>
              <td style={{ ...cellCenter, width: '25%' }}>{data.charter_date || ''}</td>
              <td style={{ ...cellBoldCenter, width: '25%' }}>توقيع الموظف:</td>
              <td style={{ ...cellCenter, width: '25%' }}></td>
            </tr>
            <tr>
              <td style={cellBoldCenter}>توقيع المدير (المقيّم):</td>
              <td style={cell}></td>
              <td style={cellBoldCenter}>توقيع المعتمد:</td>
              <td style={cell}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* === الصفحة الثانية: التقييم === */}
      <div style={{ pageBreakAfter: 'always' }}>
          <div style={titleBar}>
            <h2 style={{ margin: 0, fontSize: '16px' }}>تقييم الأداء الوظيفي على الوظيفة غير الإشرافية 2025</h2>
          </div>

          <table style={tblMb15}>
            <tbody>
              <tr>
                <td style={cellBold}>اسم الموظف:</td>
                <td style={cell}>{data.employee_name || ''}</td>
                <td style={cellBold}>الوكالة / الإدارة العامة:</td>
                <td style={cell}>{data.agency_department || ''}</td>
              </tr>
              <tr>
                <td style={cellBold}>المسمى الوظيفي:</td>
                <td style={cell}>{data.job_title || ''}</td>
                <td style={cellBold}>الإدارة / القسم:</td>
                <td style={cell}>{data.department || ''}</td>
              </tr>
            </tbody>
          </table>

          <div style={sectionHeader}>أولاً: الأهداف (التقييم)</div>
          <table style={tbl}>
            <thead>
              <tr>
                <th style={headerCell}>#</th>
                <th style={headerCell}>الهدف</th>
                <th style={headerCell}>معيار القياس</th>
                <th style={headerCell}>الوزن</th>
                <th style={headerCell}>المستهدف</th>
                <th style={headerCell}>الفعلي</th>
                <th style={headerCell}>الفرق</th>
                <th style={headerCell}>التقدير الموزون</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((g, i) => (
                <tr key={i}>
                  <td style={cellCenter}>{i + 1}</td>
                  <td style={cell}>{g.goal || ''}</td>
                  <td style={cellCenter}>{g.measurement_criterion || ''}</td>
                  <td style={cellCenter}>{((parseFloat(g.relative_weight) || 0) * 100).toFixed(0)}%</td>
                  <td style={cellCenter}>{g.target_output || ''}</td>
                  <td style={cellCenter}>{g.actual_output || 0}</td>
                  <td style={cellCenter}>{g.difference || 0}</td>
                  <td style={cellCenter}>{g.weighted_rating || 0}</td>
                </tr>
              ))}
              <tr style={{ background: '#e8f5e9', fontWeight: 'bold' }}>
                <td colSpan={7} style={cellCenter}>إجمالي التقدير الموزون</td>
                <td style={cellCenter}>{totalWeightedRating.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style={sectionHeader}>ثانياً: الجدارات (التقييم)</div>
          <table style={tbl}>
            <thead>
              <tr>
                <th style={headerCell}>#</th>
                <th style={headerCell}>الجدارة</th>
                <th style={headerCell}>الوزن</th>
                <th style={headerCell}>المستوى المتحقق</th>
                <th style={headerCell}>التقدير</th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((c, i) => (
                <tr key={i}>
                  <td style={cellCenter}>{i + 1}</td>
                  <td style={cell}>{c.name || ''}</td>
                  <td style={cellCenter}>{((parseFloat(c.relative_weight) || 0) * 100).toFixed(0)}%</td>
                  <td style={cellCenter}>{c.achieved_level || ''}</td>
                  <td style={cellCenter}>{c.rating || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table style={sigTbl}>
            <tbody>
              <tr>
                <td style={cellBoldCenter}>توقيع الموظف:</td>
                <td style={cell}></td>
                <td style={cellBoldCenter}>توقيع المدير (المقيّم):</td>
                <td style={cell}></td>
              </tr>
            </tbody>
          </table>
        </div>

      {/* === الصفحة الثالثة: التقدير العام === */}
      <div>
          <div style={titleBar}>
            <h2 style={{ margin: 0, fontSize: '16px' }}>التقدير العام لأداء الموظف على الوظيفة غير الإشرافية 2025</h2>
          </div>

          <table style={tblMb15}>
            <thead>
              <tr>
                <th style={headerCell}>التصنيف</th>
                <th style={headerCell}>التقدير العام</th>
                <th style={headerCell}>النتيجة</th>
              </tr>
            </thead>
            <tbody>
              {RATING_SCALE.map(r => (
                <tr key={r.score} style={data.overall_rating_text === r.label ? { background: '#e8f5e9' } : {}}>
                  <td style={cellBoldCenter}>{r.score}</td>
                  <td style={cellCenter}>{r.label} - {r.labelEn}</td>
                  <td style={cellCenter}>{data.overall_rating_text === r.label ? '✓' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table style={tblMb15}>
            <thead>
              <tr>
                <th style={headerCellW50}>نقاط القوة Strength Points</th>
                <th style={headerCellW50}>النقاط التي تحتاج إلى تطوير</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...cell, minHeight: '80px', verticalAlign: 'top' }}>{data.strength_points || ''}</td>
                <td style={{ ...cell, minHeight: '80px', verticalAlign: 'top' }}>{data.improvement_points || ''}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ border: '1px solid #333', padding: '10px', borderRadius: '6px', marginBottom: '20px' }}>
            <strong>الملاحظات Remarks:</strong>
            <p style={{ marginTop: '8px' }}>{data.remarks || ''}</p>
          </div>

          <table style={sigTbl}>
            <tbody>
              <tr>
                <td style={cellBoldCenter}>توقيع الموظف</td>
                <td style={cell}></td>
                <td style={cellBoldCenter}>توقيع المدير (المقيّم)</td>
                <td style={cell}></td>
                <td style={cellBoldCenter}>توقيع المعتمد</td>
                <td style={cell}></td>
              </tr>
            </tbody>
          </table>
        </div>
    </div>
  );
}