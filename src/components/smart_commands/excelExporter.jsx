// مُصدّر Excel احترافي لصفحة الأوامر الذكية
// يستخدم مكتبة exceljs لإنتاج ملفات .xlsx بتنسيق عالي الجودة

import ExcelJS from 'exceljs';
import { getFieldLabel } from './entitiesCatalog';

// يدعم القراءة من حقول متداخلة مثل "سيارة_خدمات.رقم_اللوحة_عربي"
export const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
};

// تحويل الأرقام العربية/الهندية إلى لاتينية (0-9) في أي نص
export const toLatinDigits = (input) => {
  if (input === null || input === undefined) return '';
  const str = String(input);
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  const persianIndic = '۰۱۲۳۴۵۶۷۸۹';
  return str.replace(/[٠-٩۰-۹]/g, (d) => {
    const i1 = arabicIndic.indexOf(d);
    if (i1 !== -1) return String(i1);
    const i2 = persianIndic.indexOf(d);
    if (i2 !== -1) return String(i2);
    return d;
  });
};

// تاريخ بأرقام لاتينية فقط
export const formatLatinDate = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy}`;
};

const formatCell = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'نعم' : 'لا';
  if (Array.isArray(val)) return toLatinDigits(val.join('، '));
  if (typeof val === 'object') {
    if (val['رقم_اللوحة_عربي']) {
      return toLatinDigits(`لوحة: ${val['رقم_اللوحة_عربي']} | حالة: ${val['حالة_السيارة'] || '-'}`);
    }
    if (val['متوفرة'] !== undefined) return val['متوفرة'] ? 'متوفرة' : 'غير متوفرة';
    return toLatinDigits(JSON.stringify(val));
  }
  return toLatinDigits(val);
};

export async function exportToExcel({ title, entity, fields, results }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'نظام المراكز الصحية';
  workbook.created = new Date();
  workbook.views = [{ rightToLeft: true, firstSheet: 0, activeTab: 0, visibility: 'visible' }];

  const sheet = workbook.addWorksheet((title || 'تقرير').substring(0, 30), {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 3 }],
    properties: { defaultRowHeight: 22 },
  });

  const totalColumns = fields.length + 1;
  sheet.mergeCells(1, 1, 1, totalColumns);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { name: 'Cairo', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
  sheet.getRow(1).height = 34;

  sheet.mergeCells(2, 1, 2, totalColumns);
  const infoCell = sheet.getCell(2, 1);
  infoCell.value = `عدد السجلات: ${results.length} | تاريخ التقرير: ${formatLatinDate()}`;
  infoCell.font = { name: 'Cairo', size: 11, italic: true, color: { argb: 'FF475569' } };
  infoCell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
  infoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  sheet.getRow(2).height = 22;

  const headers = ['م', ...fields.map((f) => getFieldLabel(entity, f))];
  const headerRow = sheet.getRow(3);
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Cairo', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      left: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      bottom: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      right: { style: 'thin', color: { argb: 'FF1E3A8A' } },
    };
  });
  headerRow.height = 32;

  results.forEach((row, rIdx) => {
    const dataRow = sheet.getRow(rIdx + 4);
    const rowValues = [rIdx + 1, ...fields.map((f) => formatCell(getNestedValue(row, f)))];
    rowValues.forEach((v, idx) => {
      const cell = dataRow.getCell(idx + 1);
      cell.value = v;
      cell.font = { name: 'Cairo', size: 11, color: { argb: 'FF1E293B' } };
      cell.alignment = {
        horizontal: idx === 0 ? 'center' : 'right',
        vertical: 'middle',
        readingOrder: 'rtl',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      if (rIdx % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    });
    dataRow.height = 22;
  });

  sheet.columns.forEach((col, idx) => {
    if (idx === 0) {
      col.width = 6;
      return;
    }
    let maxLength = headers[idx]?.length || 10;
    results.forEach((row) => {
      const val = formatCell(getNestedValue(row, fields[idx - 1]));
      if (val && val.length > maxLength) maxLength = val.length;
    });
    col.width = Math.min(Math.max(maxLength + 4, 14), 45);
  });

  sheet.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.5, right: 0.5, top: 0.7, bottom: 0.7, header: 0.3, footer: 0.3 },
  };
  sheet.headerFooter.oddHeader = `&C&"Cairo"&14&B${title}`;
  sheet.headerFooter.oddFooter = `&L&"Cairo"&10تم الإنشاء: ${formatLatinDate()}&R&"Cairo"&10صفحة &P من &N`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title || 'تقرير'}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}