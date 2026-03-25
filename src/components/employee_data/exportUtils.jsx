export const exportToCSV = ({
  headers,
  displayMode,
  selectedEmployees,
  selectedFields,
  groupedByManager,
  getManagerWithCenters,
  getFieldValue,
  availableFields
}) => {
  let csvContent = "\ufeff" + headers.join(',') + '\n';

  if (displayMode === 'normal') {
    const rows = selectedEmployees.map(emp =>
      selectedFields.map(key => {
        const val = getFieldValue ? getFieldValue(emp, key) : (emp[key] || '');
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');
    csvContent += rows;
  } else {
    const rows = [];
    selectedEmployees.forEach(emp => {
      rows.push(selectedFields.map(key => {
        const val = getFieldValue ? getFieldValue(emp, key) : (emp[key] || '');
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(','));
    });

    const processedManagers = new Set();
    Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
      if (!processedManagers.has(managerId)) {
        const manager = getManagerWithCenters(managerId, employeeIds);
        if (manager) {
          rows.push('"بيانات المدير المباشر"' + ','.repeat(selectedFields.length - 1));
          rows.push(selectedFields.map(key => {
            const val = getFieldValue ? getFieldValue(manager, key) : (manager[key] || '');
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(','));
          processedManagers.add(managerId);
        }
      }
    });

    csvContent += rows.join('\n');
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `بيانات_الموظفين_${new Date().toLocaleDateString('ar-SA')}.csv`;
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
      const bgColor = idx % 2 === 0 ? '#fff' : '#f9fafb';
      tableRows += `<tr style="background-color: ${bgColor};">`;
      selectedFields.forEach(key => {
        const val = getFieldValue ? getFieldValue(emp, key) : (emp[key] || '-');
        tableRows += `<td style="border: 1px solid #000; padding: 8px 16px; text-align: center; white-space: pre-wrap;">${val}</td>`;
      });
      tableRows += '</tr>';
    });
  } else {
    selectedEmployees.forEach(emp => {
      tableRows += '<tr style="background-color: #dbeafe;">';
      selectedFields.forEach(key => {
        const val = getFieldValue ? getFieldValue(emp, key) : (emp[key] || '-');
        tableRows += `<td style="border: 1px solid #000; padding: 8px 16px; text-align: center; white-space: pre-wrap;">${val}</td>`;
      });
      tableRows += '</tr>';
    });

    const processedManagers = new Set();
    Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
      if (!processedManagers.has(managerId)) {
        const manager = getManagerWithCenters(managerId, employeeIds);
        if (manager) {
          tableRows += `<tr style="background-color: #d1fae5;"><td colspan="${selectedFields.length}" style="border: 1px solid #000; padding: 8px 16px; text-align: center; font-weight: bold;">بيانات المدير المباشر</td></tr>`;
          tableRows += '<tr style="background-color: #ecfdf5;">';
          selectedFields.forEach(key => {
            const val = getFieldValue ? getFieldValue(manager, key) : (manager[key] || '-');
            tableRows += `<td style="border: 1px solid #000; padding: 8px 16px; text-align: center; white-space: pre-wrap;">${val}</td>`;
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
  <title>طلب بيانات الموظفين</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    body { font-family: 'Cairo', sans-serif; padding: 30px; background: #f8fafc; color: #000; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    h2 { text-align: center; color: #1e40af; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background-color: #f3f4f6; border: 1px solid #000; padding: 12px 16px; text-align: center; font-weight: bold; }
    td { border: 1px solid #000; padding: 8px 16px; text-align: center; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
    .request-text { background: #fef3c7; border: 2px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }
    .closing { margin-top: 30px; }
    .closing p { margin: 10px 0; font-size: 16px; }
    @media print { body { background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
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
    
    <div class="closing">
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
  selectedFields, availableFields, reportTitle, reportNarrative, lineStyles, fontSettings,
  logoSettings, logoPosition, showSignature, selectedSignatureId, signatures,
  signerName, signerTitle, signaturePosition, assignmentGroups, selectedEmployees,
  displayMode, groupedByManager, getManagerWithCenters, getFieldValue,
  mergeWorkplace, mergeAssignment, splitPages, rowsPerFirstPage, rowsPerNextPage,
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
        const marginBottom = customStyle.spacing ? `${customStyle.spacing}px` : '0';
        
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
        const bg = bgFn ? bgFn(idx) : (idx % 2 === 0 ? '#fff' : '#f9fafb');
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
        const bg = bgFn ? bgFn(globalIdx) : (globalIdx % 2 === 0 ? '#fff' : '#f9fafb');
        rows.push({ emp, bg, empIdx: globalIdx, group, groupId: group ? group.id : null });
        globalIdx++;
      });
    });
    return rows;
  };

  let allRowsData = buildRowsData(selectedEmployees, displayMode === 'with-manager' ? () => '#dbeafe' : undefined);

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
          let mhRow = `<tr style="background-color: #d1fae5;"><td colspan="${selectedFields.length}" style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-weight: bold;">بيانات المدير المباشر</td></tr>`;
          let mdRow = '<tr style="background-color: #ecfdf5;">';
          selectedFields.forEach(key => {
            mdRow += `<td style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px;">${getFieldValue(manager, key)}</td>`;
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

    if (!hasAssignmentCol || !assignmentGroups || assignmentGroups.length === 0) {
      return pageRows.map((r, idxInPage) => {
        let html = `<tr style="background-color: ${r.bg};">`;
        selectedFields.forEach(key => {
          if (mergeWorkplace && key === 'المركز_الصحي') {
            if (pageWSpans[idxInPage] === 0) return;
            html += `<td rowspan="${pageWSpans[idxInPage]}" style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px; writing-mode: ${pageWSpans[idxInPage] > 1 ? 'vertical-rl' : 'horizontal-tb'}; transform: ${pageWSpans[idxInPage] > 1 ? 'rotate(180deg)' : 'none'}; white-space: nowrap; vertical-align: middle;">${getFieldValue(r.emp, key)}</td>`;
            return;
          }
          if (mergeAssignment && key === 'جهة_التكليف') {
            if (pageASpans[idxInPage] === 0) return;
            html += `<td rowspan="${pageASpans[idxInPage]}" style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px; writing-mode: ${pageASpans[idxInPage] > 1 ? 'vertical-rl' : 'horizontal-tb'}; transform: ${pageASpans[idxInPage] > 1 ? 'rotate(180deg)' : 'none'}; white-space: nowrap; vertical-align: middle;">${getFieldValue(r.emp, key)}</td>`;
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
        otherFieldsExport.forEach(key => {
          if (mergeWorkplace && key === 'المركز_الصحي') {
            if (pageWSpans[idxInPage] === 0) return;
            html += `<td rowspan="${pageWSpans[idxInPage]}" style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px; writing-mode: ${pageWSpans[idxInPage] > 1 ? 'vertical-rl' : 'horizontal-tb'}; transform: ${pageWSpans[idxInPage] > 1 ? 'rotate(180deg)' : 'none'}; white-space: nowrap; vertical-align: middle;">${getFieldValue(r.emp, key)}</td>`;
            return;
          }
          if (mergeAssignment && key === 'جهة_التكليف') {
            if (pageASpans[idxInPage] === 0) return;
            html += `<td rowspan="${pageASpans[idxInPage]}" style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px; writing-mode: ${pageASpans[idxInPage] > 1 ? 'vertical-rl' : 'horizontal-tb'}; transform: ${pageASpans[idxInPage] > 1 ? 'rotate(180deg)' : 'none'}; white-space: nowrap; vertical-align: middle;">${getFieldValue(r.emp, key)}</td>`;
            return;
          }
          html += `<td style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px;">${getFieldValue(r.emp, key)}</td>`;
        });
        if (li === 0) {
          html += `<td rowspan="${seg.rows.length}" style="border: 1px solid #d1d5db; padding: 6px 4px; text-align: center; font-size: 11px; font-weight: bold; background-color: #fff; min-width: 80px; line-height: 1.6;">${periodText}</td>`;
        }
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
  .page-container { max-width: 210mm; margin: 0 auto; padding: 0 10px; min-height: 100vh; display: flex; flex-direction: column; }
  .page-content { flex: 1; padding-top: 15px; }
  .header-banner { border-bottom: 2px solid #0284c7; padding: 0 0 8px; margin-bottom: 15px; overflow: hidden; display: flex; justify-content: ${logoJustify}; align-items: center; }
  .header-banner img { max-height: ${logoSettings.max_height}px; margin: ${logoSettings.margin_top}px 0 ${logoSettings.margin_bottom}px 0; display: block; }
  .report-title { text-align: center; margin-bottom: 20px; margin-top: 10px; }
  .report-title h1 { font-size: 22px; color: #0284c7; font-weight: 700; margin-bottom: 6px; }
  .narrative-box { background: #fff; border: none; border-radius: 0; padding: 10px 0; margin-bottom: 20px; line-height: ${fontSettings.lineHeight || '2.0'}; white-space: pre-wrap; }
  .narrative-box .paragraph { margin-bottom: ${fontSettings.paragraphSpacing || 10}px; }
  .narrative-bold { font-family: '${fontSettings.narrativeBold.font}', 'Cairo', sans-serif; font-weight: ${fontSettings.narrativeBold.weight}; font-size: ${fontSettings.narrativeBold.size}px; display: block; line-height: 1.0; }
  .narrative-greeting { font-family: '${fontSettings.narrativeGreeting.font}', 'Cairo', sans-serif; font-weight: ${fontSettings.narrativeGreeting.weight}; font-size: ${fontSettings.narrativeGreeting.size}px; display: block; line-height: 1.0; }
  .narrative-body { font-family: '${fontSettings.narrativeBody.font}', 'Cairo', sans-serif; font-weight: ${fontSettings.narrativeBody.weight}; font-size: ${fontSettings.narrativeBody.size}px; display: inline; line-height: ${fontSettings.lineHeight || '2.0'}; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th { background: #e0f2fe; color: #000; border: 1px solid #d1d5db; padding: 10px 12px; text-align: center; font-family: '${fontSettings.tableHeader.font}', 'Cairo', sans-serif; font-weight: ${fontSettings.tableHeader.weight}; font-size: ${fontSettings.tableHeader.size}px; }
  td { border: 1px solid #d1d5db; padding: 4px 8px; text-align: center; font-family: '${fontSettings.tableBody.font}', 'Cairo', sans-serif; font-size: ${fontSettings.tableBody.size}px; font-weight: ${fontSettings.tableBody.weight}; vertical-align: middle; }
  .request-box { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px 20px; margin: 20px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.8; }
  .signature-section { text-align: ${sigAlign}; margin-top: 50px; padding: 15px 0; }
  .signature-section .sig-name { font-family: 'PT Sans Caption', 'Cairo', sans-serif; font-weight: 700; font-size: 18px; margin-top: 8px; color: #000; }
  .signature-section .sig-title { font-weight: 700; font-size: 15px; color: #000; margin-top: 0; }
  .signature-section img { max-height: 120px; ${sigAlign === 'center' ? 'margin: 0 auto;' : ''} display: block; margin-top: -2px; mix-blend-mode: multiply; }
  .footer-banner { text-align: center; padding-top: 15px; border-top: 2px solid #0284c7; margin-top: auto; }
  .footer-banner p { margin: 4px 0; font-size: 14px; color: #0284c7; }
  .footer-banner .main-text { font-weight: bold; color: #0284c7; font-size: 15px; }
  .footer-banner .date-text { font-size: 11px; color: #0284c7; margin-top: 8px; }
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