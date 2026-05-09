import ExcelJS from 'exceljs';

export const exportComparisonExcel = async ({ specialties, statsA, statsB, totalA, totalB, labelA, labelB, centersA, centersB, showTotal = true }) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('مقارنة الكوادر', { views: [{ rightToLeft: true }] });

  const lastCol = showTotal ? 'E' : 'D';
  ws.mergeCells(`A1:${lastCol}1`);
  ws.getCell('A1').value = `مقارنة الكوادر — ${labelA} مقابل ${labelB}`;
  ws.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF1E40AF' } };
  ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  ws.mergeCells(`A2:${lastCol}2`);
  ws.getCell('A2').value = `تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}`;
  ws.getCell('A2').alignment = { horizontal: 'center' };
  ws.getCell('A2').font = { size: 10, color: { argb: 'FF64748B' } };

  // معلومات المجموعات
  ws.addRow([]);
  const infoRowA = ws.addRow([`${labelA} (${centersA.length} مركز):`, centersA.join('، ')]);
  infoRowA.getCell(1).font = { bold: true, color: { argb: 'FF1E40AF' } };
  ws.mergeCells(`B${infoRowA.number}:${lastCol}${infoRowA.number}`);
  const infoRowB = ws.addRow([`${labelB} (${centersB.length} مركز):`, centersB.join('، ')]);
  infoRowB.getCell(1).font = { bold: true, color: { argb: 'FF047857' } };
  ws.mergeCells(`B${infoRowB.number}:${lastCol}${infoRowB.number}`);
  ws.addRow([]);

  // رؤوس
  const headers = ['م', 'التخصص', labelA, labelB];
  if (showTotal) headers.push('الإجمالي');
  const headerRow = ws.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });

  specialties.forEach((sp, i) => {
    const a = statsA[sp] || 0;
    const b = statsB[sp] || 0;
    const rowData = [i + 1, sp, a, b];
    if (showTotal) rowData.push(a + b);
    const row = ws.addRow(rowData);
    row.eachCell((cell, col) => {
      cell.alignment = { horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      if (col === 3) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
      if (col === 4) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
    });
  });

  const totalRowData = ['', 'الإجمالي', totalA, totalB];
  if (showTotal) totalRowData.push(totalA + totalB);
  const totalRow = ws.addRow(totalRowData);
  totalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.alignment = { horizontal: 'center' };
    cell.border = { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });

  ws.columns = showTotal
    ? [{ width: 6 }, { width: 28 }, { width: 18 }, { width: 18 }, { width: 14 }]
    : [{ width: 6 }, { width: 28 }, { width: 18 }, { width: 18 }];

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `مقارنة_${labelA}_${labelB}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
};

export const printComparison = ({ specialties, statsA, statsB, totalA, totalB, labelA, labelB, centersA, centersB, showTotal = true }) => {
  const win = window.open('', '', 'width=1000,height=750');
  const rows = specialties.map((sp, i) => {
    const a = statsA[sp] || 0;
    const b = statsB[sp] || 0;
    return `<tr><td>${i + 1}</td><td>${sp}</td><td>${a}</td><td>${b}</td>${showTotal ? `<td>${a + b}</td>` : ''}</tr>`;
  }).join('');

  win.document.write(`<html dir="rtl"><head><title>مقارنة الكوادر</title>
    <style>
      body { font-family: 'Cairo', Arial; padding: 20px; direction: rtl; }
      h1 { text-align: center; color: #1E40AF; border-bottom: 3px solid #3B82F6; padding-bottom: 8px; }
      .info { font-size: 12px; color: #64748B; margin: 8px 0; }
      .info b { color: #1E40AF; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
      th, td { border: 1px solid #CBD5E1; padding: 8px; text-align: center; }
      th { background-color: #3B82F6; color: white; }
      tr:nth-child(even) { background-color: #F8FAFC; }
      tfoot td { background-color: #E2E8F0; font-weight: bold; }
      @media print { @page { size: A4 landscape; margin: 12mm; } }
    </style></head><body>
    <h1>مقارنة الكوادر — ${labelA} مقابل ${labelB}</h1>
    <div class="info"><b>${labelA}:</b> ${centersA.join('، ')}</div>
    <div class="info"><b>${labelB}:</b> ${centersB.join('، ')}</div>
    <div class="info">تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</div>
    <table>
      <thead><tr><th>م</th><th>التخصص</th><th>${labelA}</th><th>${labelB}</th>${showTotal ? '<th>الإجمالي</th>' : ''}</tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="2">الإجمالي</td><td>${totalA}</td><td>${totalB}</td>${showTotal ? `<td>${totalA + totalB}</td>` : ''}</tr></tfoot>
    </table>
    <script>window.onload=()=>{window.print();};</script>
    </body></html>`);
  win.document.close();
};