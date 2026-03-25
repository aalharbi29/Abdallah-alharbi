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