import ExcelJS from 'exceljs';
import { MHC_TEXTS, MHC_ASSETS } from '../branding/madinahCluster';
import { getBrandBackgroundPref } from '../branding/useBrandBackground';

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

  const rows = [];
  if (displayMode === 'normal') {
    selectedEmployees.forEach((emp) => {
      rows.push(selectedFields.map((key) => getFieldValue ? getFieldValue(emp, key) : (emp[key] || '')));
    });
  } else {
    selectedEmployees.forEach((emp) => {
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
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MHC_XL.managerLabel } };
        cell.font = { name: 'Tajawal', size: 11, bold: true, color: { argb: MHC_XL.navy } };
      } else if (isManagerData) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MHC_XL.managerBg } };
      } else {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: row.number % 2 === 0 ? MHC_XL.rowAlt : MHC_XL.white }
        };
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
      const bgColor = idx % 2 === 0 ? '#FFFFFF' : '#F1F8FF';
      tableRows += `<tr style="background-color: ${bgColor};">`;
      selectedFields.forEach(key => {
        const val = getFieldValue ? getFieldValue(emp, key) : (emp[key] || '-');
        tableRows += `<td style="border: 1px solid #5BC2C7; padding: 8px 16px; text-align: center; white-space: pre-wrap; color: #0F172A;">${val}</td>`;
      });
      tableRows += '</tr>';
    });
  } else {
    selectedEmployees.forEach(emp => {
      tableRows += '<tr style="background-color: #F1F8FF;">';
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
          tableRows += `<tr style="background-color: #BAE6FD;"><td colspan="${selectedFields.length}" style="border: 1px solid #0B3D91; padding: 8px 16px; text-align: center; font-weight: bold; color: #0B3D91;">بيانات المدير المباشر</td></tr>`;
          tableRows += '<tr style="background-color: #E0F2FE;">';
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
    body { font-family: 'Tajawal', 'Cairo', sans-serif; padding: 30px; background: #F1F8FF; color: #0F172A; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 0; border-radius: 16px; box-shadow: 0 8px 24px rgba(11, 61, 145, 0.15); overflow: hidden; }
    .brand-header { background: linear-gradient(135deg, #0A2A5E 0%, #0B3D91 40%, #1E63D6 75%, #3FA9F5 100%); padding: 24px 40px; color: white; display: flex; align-items: center; gap: 18px; position: relative; overflow: hidden; }
    .brand-header::before { content: ''; position: absolute; top: -60px; left: -40px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%; }
    .brand-header::after { content: ''; position: absolute; bottom: -80px; right: -30px; width: 260px; height: 260px; background: rgba(255,255,255,0.07); border-radius: 50%; }
    .brand-logo { background: rgba(255,255,255,0.95); padding: 8px; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.2); flex-shrink: 0; position: relative; z-index: 2; }
    .brand-logo img { width: 80px; height: 80px; object-fit: contain; display: block; }
    .brand-text { flex: 1; position: relative; z-index: 2; }
    .brand-text .ar { font-size: 22px; font-weight: 900; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .brand-text .en { font-size: 13px; opacity: 0.92; margin-top: 4px; letter-spacing: 0.5px; }
    .divider-bar { height: 4px; background: linear-gradient(90deg, #0F7884 0%, #5BC2C7 50%, #3FA9F5 100%); }
    .body-content { padding: 30px 40px; }
    h2 { text-align: center; color: #0B3D91; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 61, 145, 0.08); }
    th { background: linear-gradient(180deg, #0B3D91 0%, #1E63D6 100%); color: #FFFFFF; border: 1px solid #0B3D91; padding: 12px 16px; text-align: center; font-weight: 800; }
    td { border: 1px solid #5BC2C7; padding: 8px 16px; text-align: center; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #0B3D91; }
    .request-text { background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%); border-right: 4px solid #1E63D6; padding: 16px 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; color: #0F172A; }
    .closing { margin-top: 30px; }
    .brand-footer { background: linear-gradient(90deg, #0B3D91 0%, #1E63D6 50%, #3FA9F5 100%); padding: 14px 40px; color: white; text-align: center; font-size: 12px; }
    @media print { body { background: white; padding: 0; } .container { box-shadow: none; border-radius: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand-header">
      <div class="brand-logo"><img src="${MHC_ASSETS.logo}" alt="شعار التجمع" crossorigin="anonymous" /></div>
      <div class="brand-text">
        <div class="ar">${MHC_TEXTS.arabicName}</div>
        <div class="en">${MHC_TEXTS.englishName}</div>
      </div>
    </div>
    <div class="divider-bar"></div>

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

    <div class="brand-footer">${MHC_TEXTS.arabicName} • ${MHC_TEXTS.englishName} • ${MHC_TEXTS.socialHandle}</div>
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
  mergeWorkplace, mergeWorkplaceOrientation, mergeAssignment, mergeAssignmentOrientation, splitPages, rowsPerFirstPage, rowsPerNextPage,
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

  const footerBlock = logoSettings.show_footer ? `<div class="footer-banner">
    ${logoSettings.footer_text_1 ? `<p class="main-text">${logoSettings.footer_text_1}</p>` : ''}
    ${logoSettings.footer_text_2 ? `<p>${logoSettings.footer_text_2}</p>` : ''}
    <p class="date-text">${dateStr}</p>
  </div>` : '';

  const headerBlock = logoSettings.show_logo && logoSettings.logo_url ? `<div class="header-banner">
    <img src="${logoSettings.logo_url}" alt="شعار المؤسسة" />
  </div>` : '';

  const titleBlock = `<div class="report-title"><h1>${reportTitle}</h1></div>`;

  const buildRowsData = (empList, bgFn) => {
    const rows = [];
    if (!hasAssignmentCol || !assignmentGroups || assignmentGroups.length === 0) {
      empList.forEach((emp, idx) => {
        const bg = bgFn ? bgFn(idx) : (idx % 2 === 0 ? '#FFFFFF' : '#F1F8FF');
        rows.push({ emp, bg, empIdx: idx, group: null, groupId: null });
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
        const bg = bgFn ? bgFn(globalIdx) : (globalIdx % 2 === 0 ? '#FFFFFF' : '#F1F8FF');
        rows.push({ emp, bg, empIdx: globalIdx, group, groupId: group ? group.id : null });
        globalIdx++;
      });
    });
    return rows;
  };

  let allRowsData = buildRowsData(selectedEmployees, displayMode === 'with-manager' ? () => '#E0F2FE' : undefined);

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
          let mhRow = `<tr style="background-color: #BAE6FD;"><td colspan="${selectedFields.length}" style="border: 1px solid #0B3D91; padding: 8px 12px; text-align: center; font-weight: bold; color: #0B3D91;">بيانات المدير المباشر</td></tr>`;
          let mdRow = '<tr style="background-color: #E0F2FE;">';
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
    const pageWSpans = {}; const pageASpans = {};
    if (mergeWorkplace || mergeAssignment) {
      let cw = null, ws = 0, ca = null, as = 0;
      pageRows.forEach((r, i) => {
        const w = getFieldValue(r.emp, 'المركز_الصحي'); const a = getFieldValue(r.emp, 'جهة_التكليف');
        if (mergeWorkplace) { if (w !== cw) { cw = w; ws = i; pageWSpans[i] = 1; } else { pageWSpans[ws]++; pageWSpans[i] = 0; } }
        if (mergeAssignment) { if (a !== ca) { ca = a; as = i; pageASpans[i] = 1; } else { pageASpans[as]++; pageASpans[i] = 0; } }
      });
    }

    const getMergedCellStyle = (spanCount, orientation) => {
      let styleStr = 'border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px; vertical-align: middle;';
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
          html += `<td style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px;">${getFieldValue(r.emp, key)}</td>`;
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
      let periodText = '-';
      if (seg.group) {
        const suffix = seg.group.dateType === 'hijri' ? 'هـ' : 'م';
        if (seg.group.periodType === 'duration') {
          periodText = `<div>${seg.group.durationText || '...'}</div><div>اعتباراً من ${seg.group.fromDate || '...'} ${suffix}</div>`;
        } else if (seg.group.fromDate || seg.group.toDate) {
          periodText = `<div>من ${seg.group.fromDate || '...'}</div><div>إلى ${seg.group.toDate || '...'} ${suffix}</div>`;
        }
        if (seg.group.specificDays && seg.group.specificDays.length > 0) {
          periodText += `<div style="font-size: 10px; margin-top: 4px; color: #4b5563;">(أيام: ${seg.group.specificDays.join('، ')})</div>`;
        }
      }

      seg.rows.forEach((r, li) => {
        html += `<tr style="background-color: ${r.bg};">`;
        selectedFields.forEach(key => {
          if (key === 'فترة_التكليف') {
            if (li === 0) {
              html += `<td rowspan="${seg.rows.length}" style="border: 1px solid #d1d5db; padding: 6px 4px; text-align: center; font-size: 11px; font-weight: bold; background-color: #fff; min-width: 80px; line-height: 1.6;">${periodText}</td>`;
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
          html += `<td style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px;">${getFieldValue(r.emp, key)}</td>`;
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
  @page { size: A4; margin: 5mm 15mm 15mm 15mm; }
  .page-container { max-width: 210mm; margin: 0 auto; padding: 0 10px; min-height: 100vh; display: flex; flex-direction: column; position: relative; ${getBrandBackgroundPref('report', true) ? `background-image: url('${MHC_ASSETS.backgroundClean}'); background-size: cover; background-position: center; background-repeat: no-repeat;` : ''} }
  ${getBrandBackgroundPref('report', true) ? `.page-container::before { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.88); z-index: 0; pointer-events: none; } .page-container > * { position: relative; z-index: 1; }` : ''}
  .page-content { flex: 1; padding-top: 15px; }
  .header-banner { border-bottom: 3px solid #0B3D91; padding: 0 0 8px; margin-bottom: 15px; overflow: hidden; display: flex; justify-content: ${logoJustify}; align-items: center; }
  .header-banner img { max-height: ${logoSettings.max_height}px; margin: ${logoSettings.margin_top}px 0 ${logoSettings.margin_bottom}px 0; display: block; }
  .report-title { text-align: center; margin-bottom: 20px; margin-top: 10px; }
  .report-title h1 { font-size: 22px; color: #0B3D91; font-weight: 800; margin-bottom: 6px; }
  .narrative-box { background: #fff; border: none; border-radius: 0; padding: 10px 0; margin-bottom: 20px; line-height: ${fontSettings.lineHeight || '2.0'}; white-space: pre-wrap; }
  .narrative-box .paragraph { margin-bottom: ${fontSettings.paragraphSpacing || 10}px; }
  .narrative-bold { font-family: '${fontSettings.narrativeBold.font}', 'Cairo', sans-serif; font-weight: ${fontSettings.narrativeBold.weight}; font-size: ${fontSettings.narrativeBold.size}px; display: block; line-height: 1.0; }
  .narrative-greeting { font-family: '${fontSettings.narrativeGreeting.font}', 'Cairo', sans-serif; font-weight: ${fontSettings.narrativeGreeting.weight}; font-size: ${fontSettings.narrativeGreeting.size}px; display: block; line-height: 1.0; }
  .narrative-body { font-family: '${fontSettings.narrativeBody.font}', 'Cairo', sans-serif; font-weight: ${fontSettings.narrativeBody.weight}; font-size: ${fontSettings.narrativeBody.size}px; display: inline; line-height: ${fontSettings.lineHeight || '2.0'}; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th { background: linear-gradient(180deg, #0B3D91 0%, #1E63D6 100%); color: #FFFFFF; border: 1px solid #0B3D91; padding: 10px 12px; text-align: center; font-family: '${fontSettings.tableHeader.font}', 'Tajawal', 'Cairo', sans-serif; font-weight: ${fontSettings.tableHeader.weight}; font-size: ${fontSettings.tableHeader.size}px; }
  td { border: 1px solid #5BC2C7; padding: 4px 8px; text-align: center; font-family: '${fontSettings.tableBody.font}', 'Tajawal', 'Cairo', sans-serif; font-size: ${fontSettings.tableBody.size}px; font-weight: ${fontSettings.tableBody.weight}; vertical-align: middle; color: #0F172A; }
  .request-box { background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%); border-right: 4px solid #1E63D6; border-radius: 8px; padding: 15px 20px; margin: 20px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.8; color: #0F172A; }
  .signature-section { text-align: ${sigAlign}; margin-top: 50px; padding: 15px 0; }
  .signature-section .sig-name { font-family: 'PT Sans Caption', 'Cairo', sans-serif; font-weight: 700; font-size: 18px; margin-top: 8px; color: #000; }
  .signature-section .sig-title { font-weight: 700; font-size: 15px; color: #000; margin-top: 0; }
  .signature-section img { max-height: 120px; ${sigAlign === 'center' ? 'margin: 0 auto;' : ''} display: block; margin-top: -2px; mix-blend-mode: multiply; }
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