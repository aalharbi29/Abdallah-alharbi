import ExcelJS from 'exceljs';
import { MHC_TEXTS, MHC_ASSETS } from '../branding/madinahCluster';
import { formatAssignmentPeriodsHtml } from './periodUtils';

// 🎨 ألوان الهوية البصرية لتجمع المدينة المنورة (ARGB لـ ExcelJS)
const MHC_XL = {
  navy: 'FF0B3D91',
  blue: 'FF1E63D6',
  skyLight: 'FF3FA9F5',
  teal: 'FF0F7884',
  tealLight: 'FF5BC2C7',
  rowAlt: 'FFF1F8FF',
  ink: 'FF0F172A',
  inkSoft: 'FF475569',
  white: 'FFFFFFFF',
  managerBg: 'FFE0F2FE',
  managerLabel: 'FFBAE6FD',
};

export const exportToCSV = async ({
  headers,
  displayMode,
  selectedEmployees,
  selectedFields,
  groupedByManager,
  getManagerWithCenters,
  getFieldValue,
  reportTitle
}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = MHC_TEXTS.arabicName;
  workbook.company = MHC_TEXTS.arabicName;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('بيانات الموظفين', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 3 }]
  });

  // الصف 1: شريط الهوية (تجمع المدينة المنورة الصحي)
  worksheet.mergeCells(1, 1, 1, headers.length);
  const brandCell = worksheet.getCell(1, 1);
  brandCell.value = `${MHC_TEXTS.arabicName} • ${MHC_TEXTS.englishName}`;
  brandCell.font = { name: 'Tajawal', size: 12, bold: true, color: { argb: MHC_XL.white } };
  brandCell.alignment = { horizontal: 'center', vertical: 'middle' };
  brandCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MHC_XL.navy } };
  worksheet.getRow(1).height = 24;

  // الصف 2: عنوان التقرير
  worksheet.mergeCells(2, 1, 2, headers.length);
  const titleCell = worksheet.getCell(2, 1);
  titleCell.value = reportTitle || 'تقرير بيانات الموظفين';
  titleCell.font = { name: 'Tajawal', size: 16, bold: true, color: { argb: MHC_XL.white } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MHC_XL.blue } };
  worksheet.getRow(2).height = 34;

  // الصف 3: رؤوس الأعمدة (فيروزي رسمي)
  const headerRow = worksheet.getRow(3);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { name: 'Tajawal', size: 12, bold: true, color: { argb: MHC_XL.white } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MHC_XL.teal } };
    cell.border = {
      top: { style: 'medium', color: { argb: MHC_XL.navy } },
      left: { style: 'thin', color: { argb: MHC_XL.navy } },
      bottom: { style: 'medium', color: { argb: MHC_XL.navy } },
      right: { style: 'thin', color: { argb: MHC_XL.navy } },
    };
  });
  worksheet.getRow(3).height = 30;

  const sortedEmps = [...selectedEmployees].sort((a, b) => {
    const centerA = a.المركز_الصحي || '';
    const centerB = b.المركز_الصحي || '';
    return centerA.localeCompare(centerB, 'ar');
  });

  const rows = [];
  if (displayMode === 'normal') {
    sortedEmps.forEach((emp) => {
      rows.push(selectedFields.map((key) => getFieldValue ? getFieldValue(emp, key) : (emp[key] || '')));
    });
  } else {
    sortedEmps.forEach((emp) => {
      rows.push(selectedFields.map((key) => getFieldValue ? getFieldValue(emp, key) : (emp[key] || '')));
    });

    const processedManagers = new Set();
    Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
      if (!processedManagers.has(managerId)) {
        const manager = getManagerWithCenters(managerId, employeeIds);
        if (manager) {
          rows.push(['بيانات المدير المباشر', ...Array(Math.max(0, selectedFields.length - 1)).fill('')]);
          rows.push(selectedFields.map((key) => getFieldValue ? getFieldValue(manager, key) : (manager[key] || '')));
          processedManagers.add(managerId);
        }
      }
    });
  }

  rows.forEach((rowData, rowIndex) => {
    const row = worksheet.addRow(rowData);
    const isManagerLabel = rowData[0] === 'بيانات المدير المباشر';
    const isManagerData = displayMode !== 'normal' && rowIndex > 0 && rows[rowIndex - 1]?.[0] === 'بيانات المدير المباشر';

    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.font = { name: 'Tajawal', size: 11, bold: isManagerLabel || isManagerData, color: { argb: MHC_XL.ink } };
      cell.border = {
        top: { style: 'thin', color: { argb: MHC_XL.tealLight } },
        left: { style: 'thin', color: { argb: MHC_XL.tealLight } },
        bottom: { style: 'thin', color: { argb: MHC_XL.tealLight } },
        right: { style: 'thin', color: { argb: MHC_XL.tealLight } },
      };

      if (isManagerLabel) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MHC_XL.white } };
        cell.font = { name: 'Tajawal', size: 11, bold: true, color: { argb: MHC_XL.navy } };
      } else if (isManagerData) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MHC_XL.white } };
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MHC_XL.white } };
      }
    });

    if (isManagerLabel && selectedFields.length > 1) {
      worksheet.mergeCells(row.number, 1, row.number, selectedFields.length);
    }
  });

  worksheet.columns = headers.map((header, index) => {
    const values = [header, ...rows.map((row) => String(row[index] || ''))];
    const maxLength = Math.min(Math.max(...values.map((value) => value.length), 12), 28);
    return { width: maxLength + 4 };
  });

  worksheet.getRow(1).height = 26;
  worksheet.getRow(2).height = 22;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `بيانات_الموظفين_${new Date().toLocaleDateString('ar-SA')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportToHTML = ({
  headers,
  displayMode,
  selectedEmployees,
  selectedFields,
  groupedByManager,
  getManagerWithCenters,
  getFieldValue,
  finalRequest,
  availableFields
}) => {
  let tableRows = '';
  if (displayMode === 'normal') {
    selectedEmployees.forEach((emp, idx) => {
      tableRows += `<tr>`;
      selectedFields.forEach(key => {
        const val = getFieldValue ? getFieldValue(emp, key) : (emp[key] || '-');
        tableRows += `<td style="border: 1px solid #5BC2C7; padding: 8px 16px; text-align: center; white-space: pre-wrap; color: #0F172A;">${val}</td>`;
      });
      tableRows += '</tr>';
    });
  } else {
    selectedEmployees.forEach(emp => {
      tableRows += '<tr>';
      selectedFields.forEach(key => {
        const val = getFieldValue ? getFieldValue(emp, key) : (emp[key] || '-');
        tableRows += `<td style="border: 1px solid #5BC2C7; padding: 8px 16px; text-align: center; white-space: pre-wrap; color: #0F172A;">${val}</td>`;
      });
      tableRows += '</tr>';
    });

    const processedManagers = new Set();
    Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
      if (!processedManagers.has(managerId)) {
        const manager = getManagerWithCenters(managerId, employeeIds);
        if (manager) {
          tableRows += `<tr><td colspan="${selectedFields.length}" style="border: 1px solid #0B3D91; padding: 8px 16px; text-align: center; font-weight: bold; color: #0B3D91;">بيانات المدير المباشر</td></tr>`;
          tableRows += '<tr>';
          selectedFields.forEach(key => {
            const val = getFieldValue ? getFieldValue(manager, key) : (manager[key] || '-');
            tableRows += `<td style="border: 1px solid #5BC2C7; padding: 8px 16px; text-align: center; white-space: pre-wrap; color: #0F172A; font-weight: 600;">${val}</td>`;
          });
          tableRows += '</tr>';
          processedManagers.add(managerId);
        }
      }
    });
  }

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>طلب بيانات الموظفين - ${MHC_TEXTS.arabicName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
    body { font-family: 'Tajawal', 'Cairo', sans-serif; padding: 0; background: #fff; color: #0F172A; }
    .container { max-width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 0 10mm; background-image: url('${MHC_ASSETS.officialLetterhead}'); background-size: 100% 100%; background-position: center; background-repeat: no-repeat; position: relative; }
    .header-spacer { height: 130px; }
    .body-content { padding: 0; padding-bottom: 110px; }
    h2 { text-align: center; color: #0B3D91; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 61, 145, 0.08); }
    th { background: transparent; color: #0B3D91; border: 1px solid #0B3D91; padding: 12px 16px; text-align: center; font-weight: 800; }
    td { border: 1px solid #5BC2C7; padding: 8px 16px; text-align: center; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #0B3D91; }
    .request-text { background: transparent; border-right: 4px solid #1E63D6; padding: 16px 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; color: #0F172A; }
    .closing { margin-top: 30px; }
    @media print { body { background: white; padding: 0; } .container { box-shadow: none; border-radius: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-spacer"></div>
    <div class="body-content">
      <p class="greeting">بعد التحية</p>

      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      ${finalRequest ? `<div class="request-text">${finalRequest}</div>` : ''}

      <div class="closing"></div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `طلب_بيانات_الموظفين_${new Date().toLocaleDateString('ar-SA')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateReportHtml = ({
  selectedFields, availableFields, reportTitle, reportNarrative, narrativePosition, lineStyles, fontSettings,
  logoSettings, logoPosition, showSignature, selectedSignatureId, signatures,
  signerName, signerTitle, signaturePosition, assignmentGroups, selectedEmployees,
  displayMode, groupedByManager, getManagerWithCenters, getFieldValue,
  mergeWorkplace, mergeWorkplaceOrientation, mergeAssignment, mergeAssignmentOrientation, mergeAssignmentPeriods = false, splitPages, rowsPerFirstPage, rowsPerNextPage,
  pageBreakAfterRows, finalRequest
}) => {
  const headers = selectedFields.map(key =>
    availableFields.find(f => f.key === key)?.label || key
  );

  const hasAssignmentCol = selectedFields.includes('فترة_التكليف');
  const otherFieldsExport = selectedFields.filter(k => k !== 'فترة_التكليف');

  const dateStr = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const selectedSig = showSignature && selectedSignatureId ? signatures.find(s => s.id === selectedSignatureId) : null;

  const processNarrativeHtml = (text) => {
    if (!text) return '';
    const paragraphs = text.split(/\n\s*\n/);
    const greetingKeywords = ['السلام', 'التحية', 'وبعد', 'تحية'];
    const boldKeywords = ['سعادة', 'المكرم', 'المكرمة', 'مدير', 'إدارة', 'الإدارة', 'دائرة', 'الدائرة', 'قسم', 'القسم'];
    
    return paragraphs.map((paragraph, pi) => {
      const lines = paragraph.split('\n');
      const processedLines = lines.map((line, i) => {
        const isGreeting = greetingKeywords.some(kw => line.includes(kw));
        const isBold = boldKeywords.some(kw => line.includes(kw));
        let className = 'narrative-body';
        if (isGreeting) className = 'narrative-greeting';
        if (isBold) className = 'narrative-bold';

        const lineKey = `${pi}_${i}`;
        const customStyle = lineStyles[lineKey] || {};
        const textAlign = customStyle.textAlign || 'right';
        const paddingRight = customStyle.indent ? `${customStyle.indent}px` : '0';
        // زيادة المسافة السفلية بعد سطر "السلام عليكم" تلقائياً
        const isSalamLine = line.includes('السلام عليكم');
        const defaultSpacing = isSalamLine ? 22 : 0;
        const marginBottom = customStyle.spacing ? `${customStyle.spacing}px` : `${defaultSpacing}px`;

        return `<div style="text-align: ${textAlign}; padding-right: ${paddingRight}; margin-bottom: ${marginBottom};"><span class="${className}">${line}</span></div>`;
      });
      return `<div class="paragraph">${processedLines.join('\n')}</div>`;
    }).join('');
  };
  const narrativeHtml = reportNarrative ? `<div class="narrative-box">${processNarrativeHtml(reportNarrative)}</div>` : '';

  const logoJustify = logoPosition === 'right' ? 'flex-end' : logoPosition === 'left' ? 'flex-start' : 'center';
  const sigAlign = signaturePosition === 'right' ? 'right' : signaturePosition === 'left' ? 'left' : 'center';

  const signatureBlock = showSignature ? `<div class="signature-section">
      ${signerName ? `<p class="sig-name">${signerName}</p>` : ''}
      ${signerTitle ? `<p class="sig-title">${signerTitle}</p>` : ''}
      ${selectedSig ? `<img src="${selectedSig.image_url}" alt="${selectedSig.name}" />` : ''}
    </div>` : '';

  // الفوتر مدمج ضمن الخلفية الرسمية (شعار التجمع في الأسفل)، لذا لا نضيف فوتر خارجي
  const footerBlock = '';

  // 🆕 خلفية A4 رسمية موحّدة (الشعار + الموجات السفلية + اسم التجمع مدمج فيها)
  // النص بجانب الشعار يُعرض فوق الخلفية في الزاوية اليمنى العلوية
  const headerTextBlock = logoSettings.header_side_text ? `<div class="header-side-text">${logoSettings.header_side_text}</div>` : '';
  const headerBlock = `<div class="header-spacer">${headerTextBlock}</div>`;

  const titleBlock = `<div class="report-title"><h1>${reportTitle}</h1></div>`;

  const buildRowsData = (empList, bgFn) => {
    const rows = [];
    if (!hasAssignmentCol || !assignmentGroups || assignmentGroups.length === 0) {
      empList.forEach((emp, idx) => {
        rows.push({ emp, bg: 'transparent', empIdx: idx, group: null, groupId: null });
      });
      return rows;
    }

    const grouped = [];
    const usedIds = new Set();
    assignmentGroups.forEach(group => {
      const ids = group.employeeIds.length > 0 ? group.employeeIds : (assignmentGroups.length === 1 ? empList.map(e => e.id) : []);
      const grpEmps = empList.filter(e => ids.includes(e.id));
      if (grpEmps.length > 0) {
        grouped.push({ group, employees: grpEmps });
        grpEmps.forEach(e => usedIds.add(e.id));
      }
    });
    const ungrouped = empList.filter(e => !usedIds.has(e.id));
    if (ungrouped.length > 0) grouped.push({ group: null, employees: ungrouped });

    let globalIdx = 0;
    grouped.forEach(({ group, employees: grpEmps }) => {
      grpEmps.forEach((emp) => {
        rows.push({ emp, bg: 'transparent', empIdx: globalIdx, group, groupId: group ? group.id : null });
        globalIdx++;
      });
    });
    return rows;
  };

  let allRowsData = buildRowsData(selectedEmployees);

  const workplaceSpans = {};
  const assignmentSpans = {};
  
  if (mergeWorkplace || mergeAssignment) {
    let currentWorkplace = null;
    let workplaceStartIdx = 0;
    let currentAssignment = null;
    let assignmentStartIdx = 0;

    allRowsData.forEach((row, idx) => {
      const wpVal = getFieldValue(row.emp, 'المركز_الصحي');
      const asVal = getFieldValue(row.emp, 'جهة_التكليف');

      if (mergeWorkplace) {
        if (wpVal !== currentWorkplace) {
          currentWorkplace = wpVal;
          workplaceStartIdx = idx;
          workplaceSpans[idx] = 1;
        } else {
          workplaceSpans[workplaceStartIdx]++;
          workplaceSpans[idx] = 0;
        }
      }

      if (mergeAssignment) {
        if (asVal !== currentAssignment) {
          currentAssignment = asVal;
          assignmentStartIdx = idx;
          assignmentSpans[idx] = 1;
        } else {
          assignmentSpans[assignmentStartIdx]++;
          assignmentSpans[idx] = 0;
        }
      }
    });
  }

  const managerRowsHtml = [];
  if (displayMode === 'with-manager') {
    const processedManagers = new Set();
    Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
      if (!processedManagers.has(managerId)) {
        const manager = getManagerWithCenters(managerId, employeeIds);
        if (manager) {
          let mhRow = `<tr><td colspan="${selectedFields.length}" style="border: 1px solid #0B3D91; padding: 8px 12px; text-align: center; font-weight: bold; color: #0B3D91;">بيانات المدير المباشر</td></tr>`;
          let mdRow = '<tr>';
          selectedFields.forEach(key => {
            mdRow += `<td style="border: 1px solid #5BC2C7; padding: 8px 12px; text-align: center; font-size: 13px; color: #0F172A; font-weight: 600;">${getFieldValue(manager, key)}</td>`;
          });
          mdRow += '</tr>';
          managerRowsHtml.push(mhRow + mdRow);
          processedManagers.add(managerId);
        }
      }
    });
  }

  const theadHtml = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;

  const renderPageRowsHtml = (pageRows) => {
    const pageWSpans = {}; const pageASpans = {}; const pagePeriodSpans = {};
    if (mergeWorkplace || mergeAssignment || mergeAssignmentPeriods) {
      let cw = null, ws = 0, ca = null, as = 0, cp = null, ps = 0;
      pageRows.forEach((r, i) => {
        const w = getFieldValue(r.emp, 'المركز_الصحي'); const a = getFieldValue(r.emp, 'جهة_التكليف');
        const p = r.group ? formatAssignmentPeriodsHtml(r.group, r.emp.id) : '-';
        if (mergeWorkplace) { if (w !== cw) { cw = w; ws = i; pageWSpans[i] = 1; } else { pageWSpans[ws]++; pageWSpans[i] = 0; } }
        if (mergeAssignment) { if (a !== ca) { ca = a; as = i; pageASpans[i] = 1; } else { pageASpans[as]++; pageASpans[i] = 0; } }
        if (mergeAssignmentPeriods) { if (p !== cp) { cp = p; ps = i; pagePeriodSpans[i] = 1; } else { pagePeriodSpans[ps]++; pagePeriodSpans[i] = 0; } }
      });
    }

    const getMergedCellStyle = (spanCount, orientation) => {
      let styleStr = 'border: 1px solid #000; padding: 2px 6px; text-align: center; font-size: 13px; vertical-align: middle; background-color: transparent;';
      if (spanCount > 1) {
        if (orientation === 'vertical') {
          styleStr += ' writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; width: 40px;';
        } else if (orientation === 'diagonal') {
          styleStr += ' white-space: nowrap;';
        } else {
          styleStr += ' white-space: normal;';
        }
      }
      return styleStr;
    };

    const renderMergedCellContent = (content, spanCount, orientation) => {
      if (spanCount > 1 && orientation === 'diagonal') {
        return `<div style="transform: rotate(-45deg); display: inline-block; white-space: nowrap;">${content}</div>`;
      }
      return content;
    };

    if (!hasAssignmentCol || !assignmentGroups || assignmentGroups.length === 0) {
      return pageRows.map((r, idxInPage) => {
        let html = `<tr style="background-color: ${r.bg};">`;
        selectedFields.forEach(key => {
          if (mergeWorkplace && key === 'المركز_الصحي') {
            if (pageWSpans[idxInPage] === 0) return;
            html += `<td rowspan="${pageWSpans[idxInPage]}" style="${getMergedCellStyle(pageWSpans[idxInPage], mergeWorkplaceOrientation)}">${renderMergedCellContent(getFieldValue(r.emp, key), pageWSpans[idxInPage], mergeWorkplaceOrientation)}</td>`;
            return;
          }
          if (mergeAssignment && key === 'جهة_التكليف') {
            if (pageASpans[idxInPage] === 0) return;
            html += `<td rowspan="${pageASpans[idxInPage]}" style="${getMergedCellStyle(pageASpans[idxInPage], mergeAssignmentOrientation)}">${renderMergedCellContent(getFieldValue(r.emp, key), pageASpans[idxInPage], mergeAssignmentOrientation)}</td>`;
            return;
          }
          html += `<td style="border: 1px solid #000; padding: 2px 6px; text-align: center; font-size: 13px; background-color: transparent;">${getFieldValue(r.emp, key)}</td>`;
        });
        html += '</tr>';
        return html;
      }).join('');
    }

    const segments = [];
    let currentSegment = null;
    pageRows.forEach(r => {
      if (!currentSegment || currentSegment.groupId !== r.groupId) {
        currentSegment = { groupId: r.groupId, group: r.group, rows: [] };
        segments.push(currentSegment);
      }
      currentSegment.rows.push(r);
    });

    let html = '';
    let idxInPage = 0;
    segments.forEach(seg => {
      seg.rows.forEach((r, li) => {
        const periodText = seg.group ? formatAssignmentPeriodsHtml(seg.group, r.emp.id) : '-';
        const previousPeriodText = li > 0 && seg.group ? formatAssignmentPeriodsHtml(seg.group, seg.rows[li - 1].emp.id) : null;
        const nextSameCount = seg.rows.slice(li).findIndex((candidate, candidateIdx) => candidateIdx > 0 && seg.group && formatAssignmentPeriodsHtml(seg.group, candidate.emp.id) !== periodText);
        const periodRowSpan = nextSameCount === -1 ? seg.rows.length - li : nextSameCount;
        html += `<tr style="background-color: ${r.bg};">`;
        selectedFields.forEach(key => {
          if (key === 'فترة_التكليف') {
            if (!mergeAssignmentPeriods) {
              html += `<td style="border: 1px solid #000; padding: 6px 4px; text-align: center; font-size: 11px; font-weight: bold; background-color: transparent; min-width: 80px; line-height: 1.6;">${periodText}</td>`;
              return;
            }
            if (pagePeriodSpans[idxInPage] !== 0) {
              html += `<td rowspan="${pagePeriodSpans[idxInPage] || 1}" style="border: 1px solid #000; padding: 6px 4px; text-align: center; vertical-align: middle; font-size: 11px; font-weight: bold; background-color: transparent; min-width: 80px; line-height: 1.6;">${periodText}</td>`;
            }
            return;
          }
          if (mergeWorkplace && key === 'المركز_الصحي') {
            if (pageWSpans[idxInPage] === 0) return;
            html += `<td rowspan="${pageWSpans[idxInPage]}" style="${getMergedCellStyle(pageWSpans[idxInPage], mergeWorkplaceOrientation)}">${renderMergedCellContent(getFieldValue(r.emp, key), pageWSpans[idxInPage], mergeWorkplaceOrientation)}</td>`;
            return;
          }
          if (mergeAssignment && key === 'جهة_التكليف') {
            if (pageASpans[idxInPage] === 0) return;
            html += `<td rowspan="${pageASpans[idxInPage]}" style="${getMergedCellStyle(pageASpans[idxInPage], mergeAssignmentOrientation)}">${renderMergedCellContent(getFieldValue(r.emp, key), pageASpans[idxInPage], mergeAssignmentOrientation)}</td>`;
            return;
          }
          html += `<td style="border: 1px solid #000; padding: 2px 6px; text-align: center; font-size: 13px; background-color: transparent;">${getFieldValue(r.emp, key)}</td>`;
        });
        html += '</tr>';
        idxInPage++;
      });
    });
    return html;
  };

  const splitRowsIntoPages = (rows) => {
    const pages = [];
    let currentIdx = 0;
    let pageNum = 0;

    while (currentIdx < rows.length) {
      const isFirst = pageNum === 0;
      const limit = isFirst ? rowsPerFirstPage : rowsPerNextPage;
      const pageRows = [];

      for (let i = 0; i < limit && currentIdx < rows.length; i++) {
        pageRows.push(rows[currentIdx]);
        if (pageBreakAfterRows.includes(rows[currentIdx].empIdx)) {
          currentIdx++;
          break;
        }
        currentIdx++;
      }

      pages.push(pageRows);
      pageNum++;
    }

    return pages;
  };

  const tablePages = splitRowsIntoPages(allRowsData);

  let bodyContent = '';
  if (splitPages) {
    bodyContent += `<div class="page-container">
      ${headerBlock}
      <div class="page-content">
        ${titleBlock}
        ${narrativeHtml}
        ${finalRequest ? `<div class="request-box">${finalRequest}</div>` : ''}
        ${signatureBlock}
      </div>
      ${footerBlock}
    </div>`;
    tablePages.forEach((pageRows, pageIdx) => {
      const isLastTablePage = pageIdx === tablePages.length - 1;
      const tbodyHtml = renderPageRowsHtml(pageRows) + (isLastTablePage ? managerRowsHtml.join('') : '');
      bodyContent += `<div class="page-container" style="page-break-before: always;">
        ${headerBlock}
        <div class="page-content">
          ${titleBlock}
          <table>
            ${theadHtml}
            <tbody>${tbodyHtml}</tbody>
          </table>
          ${isLastTablePage ? signatureBlock : ''}
        </div>
        ${footerBlock}
      </div>`;
    });
  } else {
    tablePages.forEach((pageRows, pageIdx) => {
      const isFirst = pageIdx === 0;
      const isLast = pageIdx === tablePages.length - 1;
      const tbodyHtml = renderPageRowsHtml(pageRows) + (isLast ? managerRowsHtml.join('') : '');
      bodyContent += `<div class="page-container"${!isFirst ? ' style="page-break-before: always;"' : ''}>
        ${headerBlock}
        <div class="page-content">
          ${isFirst ? titleBlock : `<div class="report-title"><h1>${reportTitle} (تابع ${pageIdx + 1})</h1></div>`}
          ${isFirst && narrativePosition === 'before' ? narrativeHtml : ''}
          <table>
            ${theadHtml}
            <tbody>${tbodyHtml}</tbody>
          </table>
          ${isLast && narrativePosition === 'after' ? narrativeHtml : ''}
          ${isLast && finalRequest ? `<div class="request-box">${finalRequest}</div>` : ''}
          ${isLast ? signatureBlock : ''}
        </div>
        ${footerBlock}
      </div>`;
    });
  }

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>${reportTitle}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=PT+Sans+Caption:wght@400;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Changa:wght@400;500;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Lateef:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Harmattan:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Mada:wght@400;500;600;700;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cairo', sans-serif; background: #fff; color: #000; }
  @page { size: A4; margin: 0; }
  .page-container { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 0 20mm; display: flex; flex-direction: column; position: relative; overflow: hidden; background: #fff; }
  .page-container::before { content: ''; position: absolute; inset: 0; background-image: url('${MHC_ASSETS.officialLetterhead}'); background-size: 100% 100%; background-position: center; background-repeat: no-repeat; z-index: 0; }
  .page-content { flex: 1; padding-top: 0; padding-bottom: 110px; position: relative; z-index: 1; }
  .header-spacer { height: 130px; position: relative; }
  .header-side-text { position: absolute; top: 35px; right: 130px; max-width: 380px; text-align: right; font-family: 'Tajawal','Cairo',sans-serif; color: #0B3D91; font-weight: 700; font-size: 13px; line-height: 1.7; white-space: pre-wrap; }
  .report-title { text-align: center; margin-bottom: 20px; margin-top: 60px; }
  .report-title h1 { font-size: 16px; color: #0B3D91; font-weight: 800; margin-bottom: 6px; }
  .narrative-box { background: transparent; border: none; border-radius: 0; padding: 10px 0; margin-bottom: 20px; line-height: ${fontSettings.lineHeight || '2.0'}; white-space: pre-wrap; }
  .narrative-box .paragraph { margin-bottom: ${fontSettings.paragraphSpacing || 10}px; }
  .narrative-bold { font-family: '${fontSettings.narrativeBold.font}', 'Cairo', sans-serif; font-weight: ${fontSettings.narrativeBold.weight}; font-size: ${fontSettings.narrativeBold.size}px; display: block; line-height: 1.0; }
  .narrative-greeting { font-family: '${fontSettings.narrativeGreeting.font}', 'Cairo', sans-serif; font-weight: ${fontSettings.narrativeGreeting.weight}; font-size: ${fontSettings.narrativeGreeting.size}px; display: block; line-height: 1.0; }
  .narrative-body { font-family: '${fontSettings.narrativeBody.font}', 'Cairo', sans-serif; font-weight: ${fontSettings.narrativeBody.weight}; font-size: ${fontSettings.narrativeBody.size}px; display: inline; line-height: ${fontSettings.lineHeight || '2.0'}; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th { background: transparent; color: #0B3D91; border: 1px solid #000; padding: 6px 10px; text-align: center; font-family: '${fontSettings.tableHeader.font}', 'Tajawal', 'Cairo', sans-serif; font-weight: ${fontSettings.tableHeader.weight}; font-size: ${fontSettings.tableHeader.size}px; }
  tr, td, th { background-color: transparent !important; }
  td { border: 1px solid #000; padding: 2px 6px; text-align: center; font-family: '${fontSettings.tableBody.font}', 'Tajawal', 'Cairo', sans-serif; font-size: ${fontSettings.tableBody.size}px; font-weight: ${fontSettings.tableBody.weight}; vertical-align: middle; color: #0F172A; background-color: transparent !important; }
  .request-box { background: transparent; border-right: 4px solid #1E63D6; border-radius: 8px; padding: 15px 20px; margin: 20px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.8; color: #0F172A; }
  .signature-section { text-align: ${sigAlign}; margin-top: 50px; padding: 15px 0; }
  .signature-section .sig-name { font-family: 'PT Sans Caption', 'Cairo', sans-serif; font-weight: 700; font-size: 18px; margin-top: 8px; color: #000; }
  .signature-section .sig-title { font-weight: 700; font-size: 15px; color: #000; margin-top: 0; }
  .signature-section img { max-height: 120px; ${sigAlign === 'center' ? 'margin: 0 auto;' : ''} display: block; margin-top: -2px; mix-blend-mode: multiply; background: transparent; }
  .footer-banner { text-align: center; padding-top: 15px; border-top: 3px solid #0B3D91; margin-top: auto; }
  .footer-banner p { margin: 4px 0; font-size: 14px; color: #0B3D91; }
  .footer-banner .main-text { font-weight: 800; color: #0B3D91; font-size: 15px; }
  .footer-banner .date-text { font-size: 11px; color: #1E63D6; margin-top: 8px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-container { min-height: 100vh; }
    .footer-banner { margin-top: auto; }
  }
</style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;

  return html;
};