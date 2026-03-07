import React, { useState, useEffect, useCallback } from "react";
import { HealthCenter } from "@/entities/HealthCenter";
import { Employee } from "@/entities/Employee";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Building2, MapPin, Phone, Mail, Users, ArrowRight, Printer, AlertCircle,
  Edit, Search, Eye, Car, Calendar, CheckCircle2, XCircle, Hash, Building,
  DollarSign, FileText, Hospital, Activity, UserPlus, Briefcase
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import QuickRoleAssignment from "@/components/employees/QuickRoleAssignment";
import ClinicsSummary from "@/components/health_centers/ClinicsSummary";
import CenterEmployeeExporter from "@/components/health_centers/CenterEmployeeExporter";
import CenterDocuments from "@/components/health_centers/CenterDocuments";
import CenterMedicalEquipmentNew from "@/components/health_centers/CenterMedicalEquipmentNew";


export default function HealthCenterDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const [center, setCenter] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [centerEmployees, setCenterEmployees] = useState([]);
  const [manager, setManager] = useState(null);
  const [deputyManager, setDeputyManager] = useState(null);
  const [technicalSupervisor, setTechnicalSupervisor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");

  // خيارات الطباعة
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [selectedEmployeeForRole, setSelectedEmployeeForRole] = useState(null);
  const [showEmployeeExporter, setShowEmployeeExporter] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    outputFormat: 'detailed', // New print option
    basicInfo: true,
    contactInfo: true,
    ownership: true, // New print option
    sabahi: true, // New print option
    clinics: true, // New print option
    leadership: true,
    statistics: true,
    employees: true,
    vehicles: true,
    additionalInfo: true,
    showEmployeeDetails: true,
  });

  const getCenterId = useCallback(() => {
    let id = null;
    if (location && location.search) {
      const params = new URLSearchParams(location.search);
      id = params.get('id');
      if (id) return id;
    }
    if (window.location.href.includes('?')) {
      const url = new URL(window.location.href);
      id = url.searchParams.get('id');
      if (id) return id;
    }
    if (window.location.hash && window.location.hash.includes('?')) {
      const hashSearch = window.location.hash.substring(window.location.hash.indexOf('?'));
      const params = new URLSearchParams(hashSearch);
      id = params.get('id');
      if (id) return id;
    }
    return null;
  }, [location]);

  useEffect(() => {
    const id = getCenterId();

    if (!id) {
      setError("لم يتم العثور على معرف المركز الصحي في الرابط.");
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const centerData = await HealthCenter.get(id);
        if (centerData) {
          setCenter(centerData);

          const allEmployees = await Employee.list();
          const safeEmployees = Array.isArray(allEmployees) ? allEmployees : [];
          setEmployees(safeEmployees);

          const centerEmps = safeEmployees.filter(emp => emp.المركز_الصحي === centerData.اسم_المركز);
          setCenterEmployees(centerEmps);

          setManager(safeEmployees.find(emp => emp.id === centerData.المدير) || null);
          setDeputyManager(safeEmployees.find(emp => emp.id === centerData.نائب_المدير) || null);
          setTechnicalSupervisor(safeEmployees.find(emp => emp.id === centerData.المشرف_الفني) || null);
        } else {
          setError(`لم يتم العثور على مركز صحي بالمعرف: ${id}`);
        }
      } catch (err) {
        console.error("Failed to load center details:", err);
        setError("فشل تحميل بيانات المركز الصحي.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getCenterId]);

  const handlePrint = () => {
    setShowPrintDialog(true);
  };

  const handlePrintConfirm = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintContent());
    printWindow.document.close();
    printWindow.print();
    setShowPrintDialog(false);
  };

  const generatePrintContent = () => {
    if (!center) return '';

    // حساب الإحصائيات من البيانات الفعلية
    const actualJobCategoryCounts = centerEmployees.reduce((acc, emp) => {
      let category = emp.job_category || 'غير محدد';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // تجميع التخصصات (المناصب) مع العدد
    const positionCounts = centerEmployees.reduce((acc, emp) => {
      const position = emp.position || 'غير محدد';
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {});

    // تجميع أنواع العقود
    const contractTypeCounts = centerEmployees.reduce((acc, emp) => {
      const contractType = emp.contract_type || 'غير محدد';
      acc[contractType] = (acc[contractType] || 0) + 1;
      return acc;
    }, {});

    let content = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>الملف التفصيلي - ${center.اسم_المركز}</title>
        <style>
          body {
            font-family: 'Arial', 'Times New Roman', serif;
            direction: rtl;
            margin: 0;
            padding: 15mm;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
            background: white;
          }

          @page {
            size: A4;
            margin: 10mm;
          }

          .logo-header {
            text-align: center;
            padding: 5px;
            border-bottom: 2px solid #0d9488;
            margin-bottom: 20px;
          }

          .logo-header img {
            max-height: 200px;
            margin: 0 auto;
            display: block;
          }

          .header {
            text-align: center;
            padding-bottom: 15px;
            margin-bottom: 25px;
            position: relative;
          }

          .header h1 {
            font-size: 26px;
            font-weight: bold;
            color: #0f766e;
            margin: 0 0 8px 0;
          }

          .header h2 {
            font-size: 16px;
            color: #374151;
            margin: 5px 0;
            font-weight: normal;
          }

          .header .meta {
            display: none;
          }

          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }

          .section-title {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            padding: 15px 20px;
            font-weight: bold;
            font-size: 16px;
            margin: 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .section-content {
            padding: 20px;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }

          .info-item {
            display: flex;
            align-items: flex-start;
            padding: 12px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
          }

          .info-label {
            font-weight: bold;
            color: #374151;
            margin-left: 10px;
            min-width: 100px;
            font-size: 11px;
          }

          .info-value {
            color: #1f2937;
            flex: 1;
            font-size: 11px;
          }

          .full-width {
            grid-column: 1 / -1;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }

          .stat-card {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border: 2px solid #0ea5e9;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
          }

          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #0369a1;
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: 10px;
            color: #075985;
            font-weight: bold;
          }

          .employees-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-top: 20px;
          }

          .employees-table th,
          .employees-table td {
            padding: 10px 8px;
            text-align: center;
            border: 1px solid #374151;
          }

          .employees-table th {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            font-weight: bold;
            font-size: 11px;
          }

          .employees-table tr:nth-child(even) {
            background: #f8fafc;
          }

          .employees-table tr:hover {
            background: #e0f2fe;
          }

          .vehicle-section {
            background: #fefefe;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
          }

          .vehicle-title {
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .vehicle-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
          }

          .vehicle-plate-info {
            grid-column: 1 / -1;
            background: #e0f2fe;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #90cdf4;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
          .vehicle-plate-info .label {
            font-weight: bold;
            color: #2b6cb0;
            margin-bottom: 5px;
          }
          .vehicle-plate-info .badges {
            display: flex;
            gap: 8px;
          }
          .vehicle-plate-info .badge {
            background: #bfdbfe;
            color: #1e40af;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }

          .vehicle-driver-info {
            grid-column: 1 / -1;
            background: #f5f3ff;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #d8b4fe;
            color: #6d28d9;
          }
          .vehicle-driver-info .driver-name {
            font-weight: bold;
            margin-bottom: 5px;
          }


          .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .map-link {
            color: #2563eb;
            text-decoration: underline;
            word-break: break-all;
          }

          .badge-available {
            background: #dcfce7;
            color: #166534;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
          }

          .badge-unavailable {
            background: #fef2f2;
            color: #dc2626;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
          }

          .signature-section {
            margin-top: 50px;
            text-align: center;
            border-top: 2px solid #e5e7eb;
            padding-top: 30px;
          }

          .signature-title {
            font-weight: bold;
            color: #374151;
            margin-bottom: 20px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>

        <div class="logo-header">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/ebae7336b_1407.png" alt="تجمع المدينة المنورة الصحي" />
        </div>
        <div class="header">
          <h1>${center.اسم_المركز}</h1>
          <h2>الملف التفصيلي الشامل للمركز الصحي</h2>
          <div class="meta">
            <div>تاريخ الإعداد: ${new Date().toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</div>
          </div>
        </div>
    `;

    if (printOptions.basicInfo) {
      content += `
        <!-- المعلومات الأساسية -->
        <div class="section">
          <div class="section-title">المعلومات الأساسية والهوية</div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">اسم المركز:</span>
                <span class="info-value">${center.اسم_المركز}</span>
              </div>
              ${center.seha_id ? `
              <div class="info-item" style="background: #dcfce7; border-color: #86efac;">
                <span class="info-label" style="color: #16a34a;">SEHA ID:</span>
                <span class="info-value" style="color: #15803d; font-weight: bold;">${center.seha_id}</span>
              </div>
              ` : ''}
              <div class="info-item">
                <span class="info-label">كود المركز:</span>
                <span class="info-value">${center.center_code || 'غير محدد'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">الرقم الوزاري:</span>
                <span class="info-value">${center.organization_code || 'غير محدد'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">حالة التشغيل:</span>
                <span class="info-value">${center.حالة_التشغيل || 'نشط'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">الموقع:</span>
                <span class="info-value">${center.الموقع || 'غير محدد'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">نوع الملكية:</span>
                <span class="info-value">${center.حالة_المركز || 'حكومي'}</span>
              </div>
              ${center.موقع_الخريطة ? `
              <div class="info-item full-width">
                <span class="info-label">الموقع على الخريطة:</span>
                <span class="info-value"><a href="${center.موقع_الخريطة}" class="map-link">${center.موقع_الخريطة}</a></span>
              </div>
              ` : ''}
              ${center.خط_الطول || center.خط_العرض ? `
              <div class="info-item">
                <span class="info-label">خط الطول:</span>
                <span class="info-value">${center.خط_الطول || 'غير محدد'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">خط العرض:</span>
                <span class="info-value">${center.خط_العرض || 'غير محدد'}</span>
              </div>
              ` : ''}
              ${center.مركز_نائي ? `
              <div class="info-item">
                <span class="info-label">تصنيف خاص:</span>
                <span class="info-value">مركز نائي ${center.بدل_نأي ? `(بدل النأي: ${center.بدل_نأي} ر.س)` : ''}</span>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }

    if (printOptions.contactInfo) {
      content += `
        <!-- بيانات التواصل -->
        <div class="section">
          <div class="section-title">بيانات التواصل</div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">الهاتف الأرضي:</span>
                <span class="info-value">${center.هاتف_المركز || 'غير محدد'}</span>
              </div>
              ${center.رقم_الشريحة ? `
              <div class="info-item" style="background: #e0f2fe; border-color: #90cdf4;">
                <span class="info-label" style="color: #2b6cb0;">رقم الشريحة:</span>
                <span class="info-value" style="color: #1a4f7f;">${center.رقم_الشريحة}</span>
              </div>
              ` : ''}
              ${center.رقم_الجوال ? `
              <div class="info-item" style="background: #e0f2fe; border-color: #90cdf4;">
                <span class="info-label" style="color: #2b6cb0;">رقم الجوال:</span>
                <span class="info-value" style="color: #1a4f7f;">${center.رقم_الجوال}</span>
              </div>
              ` : ''}
              ${center.رقم_الهاتف_الثابت ? `
              <div class="info-item" style="background: #e0f2fe; border-color: #90cdf4;">
                <span class="info-label" style="color: #2b6cb0;">الهاتف الثابت الإضافي:</span>
                <span class="info-value" style="color: #1a4f7f;">${center.رقم_الهاتف_الثابت}</span>
              </div>
              ` : ''}
              <div class="info-item">
                <span class="info-label">الفاكس:</span>
                <span class="info-value">${center.فاكس_المركز || 'غير محدد'}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">البريد الإلكتروني:</span>
                <span class="info-value">${center.ايميل_المركز || 'غير محدد'}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (printOptions.ownership && (center.حالة_المركز === 'مستأجر' || center.قيمة_عقد_الايجار || center.اسم_المؤجر)) {
      content += `
        <!-- بيانات الملكية والعقود -->
        <div class="section" style="border-color: #f97316;">
          <div class="section-title" style="background: linear-gradient(135deg, #f97316, #fb923c);">بيانات الملكية والعقود</div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-item" style="background: #fff7ed; border-color: #fed7aa;">
                <span class="info-label" style="color: #f97316;">حالة الملكية:</span>
                <span class="info-value" style="color: #ea580c;">${center.حالة_المركز || 'غير محدد'}</span>
              </div>
              ${center.قيمة_عقد_الايجار ? `
              <div class="info-item">
                <span class="info-label">قيمة الإيجار السنوية:</span>
                <span class="info-value">${center.قيمة_عقد_الايجار.toLocaleString('ar-SA')} ر.س</span>
              </div>
              ` : ''}
              ${center.رقم_العقد ? `
              <div class="info-item">
                <span class="info-label">رقم العقد:</span>
                <span class="info-value">${center.رقم_العقد}</span>
              </div>
              ` : ''}
              ${center.تاريخ_بداية_العقد ? `
              <div class="info-item">
                <span class="info-label">تاريخ بداية العقد:</span>
                <span class="info-value">${new Date(center.تاريخ_بداية_العقد).toLocaleDateString('ar-SA')}</span>
              </div>
              ` : ''}
              ${center.تاريخ_انتهاء_العقد ? `
              <div class="info-item" style="background: #fef2f2; border-color: #fecaca;">
                <span class="info-label" style="color: #ef4444;">تاريخ انتهاء العقد:</span>
                <span class="info-value" style="color: #dc2626;">${new Date(center.تاريخ_انتهاء_العقد).toLocaleDateString('ar-SA')}</span>
              </div>
              ` : ''}
              ${center.اسم_المؤجر ? `
              <div class="info-item">
                <span class="info-label">اسم المؤجر:</span>
                <span class="info-value">${center.اسم_المؤجر}</span>
              </div>
              ` : ''}
              ${center.هاتف_المؤجر ? `
              <div class="info-item">
                <span class="info-label">هاتف المؤجر:</span>
                <span class="info-value">${center.هاتف_المؤجر}</span>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }

    if (printOptions.sabahi && center.معتمد_سباهي) {
      content += `
        <!-- اعتماد سباهي -->
        <div class="section" style="border-color: #22c55e;">
          <div class="section-title" style="background: linear-gradient(135deg, #22c55e, #4ade80);">اعتماد سباهي</div>
          <div class="section-content">
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0;">
              <span style="font-size: 24px; color: #10b981;">&#10003;</span>
              <div>
                <p style="font-weight: bold; color: #065f46; margin: 0;">المركز حاصل على اعتماد سباهي</p>
                ${center.تاريخ_اعتماد_سباهي ? `
                <p style="font-size: 10px; color: #047857; margin: 5px 0 0 0;">تاريخ الاعتماد: ${new Date(center.تاريخ_اعتماد_سباهي).toLocaleDateString('ar-SA')}</p>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (printOptions.clinics && (center.العيادات_المتوفرة?.length > 0 || center.الخدمات_المقدمة?.length > 0)) {
      content += `
        <!-- العيادات والخدمات -->
        <div class="section">
          <div class="section-title">العيادات والخدمات المقدمة</div>
          <div class="section-content">
            ${center.العيادات_المتوفرة?.length > 0 ? `
            <h4 style="font-weight: bold; margin-bottom: 10px; color: #374151;">العيادات المتوفرة:</h4>
            <div class="info-grid">
              ${center.العيادات_المتوفرة.map(clinic => `
                <div class="info-item" style="background: #f5f3ff; border-color: #d8b4fe;">
                  <span class="info-label" style="color: #6d28d9;">${clinic.اسم_العيادة || 'غير محدد'}</span>
                  <div class="info-value">
                    ${clinic.نوع_العيادة ? `<div><span style="font-weight: bold;">النوع:</span> ${clinic.نوع_العيادة}</div>` : ''}
                    ${clinic.الطبيب_المسؤول ? `<div><span style="font-weight: bold;">الطبيب المسؤول:</span> ${clinic.الطبيب_المسؤول}</div>` : ''}
                    ${clinic.ساعات_العمل ? `<div><span style="font-weight: bold;">ساعات العمل:</span> ${clinic.ساعات_العمل}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${center.الخدمات_المقدمة?.length > 0 ? `
            <h4 style="font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #374151;">الخدمات المقدمة:</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${center.الخدمات_المقدمة.map(service => `
                <span style="background: #eff6ff; color: #1e40af; padding: 6px 10px; border-radius: 4px; font-size: 10px; border: 1px solid #bfdbfe;">${service}</span>
              `).join('')}
            </div>
            ` : ''}
          </div>
        </div>
      `;
    }


    if (printOptions.leadership) {
      content += `
        <!-- القيادة والإدارة -->
        <div class="section">
          <div class="section-title">القيادة والإدارة</div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">مدير المركز:</span>
                <span class="info-value">${manager?.full_name_arabic || 'غير محدد'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">هاتف المدير:</span>
                <span class="info-value">${manager?.phone || 'غير محدد'}</span>
              </div>
              ${deputyManager ? `
              <div class="info-item">
                <span class="info-label">نائب المدير:</span>
                <span class="info-value">${deputyManager.full_name_arabic}</span>
              </div>
              <div class="info-item">
                <span class="info-label">هاتف نائب المدير:</span>
                <span class="info-value">${deputyManager.phone || 'غير محدد'}</span>
              </div>
              ` : ''}
              ${technicalSupervisor ? `
              <div class="info-item">
                <span class="info-label">المشرف الفني:</span>
                <span class="info-value">${technicalSupervisor.full_name_arabic}</span>
              </div>
              <div class="info-item">
                <span class="info-label">هاتف المشرف الفني:</span>
                <span class="info-value">${technicalSupervisor.phone || 'غير محدد'}</span>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }

    if (printOptions.statistics) {
      content += `
        <!-- إحصائيات الموظفين -->
        <div class="section">
          <div class="section-title">إحصائيات وتحليل الموارد البشرية</div>
          <div class="section-content">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${centerEmployees.length}</div>
                <div class="stat-label">إجمالي الموظفين</div>
              </div>
              ${Object.entries(actualJobCategoryCounts).map(([category, count]) => `
                <div class="stat-card">
                  <div class="stat-number">${count}</div>
                  <div class="stat-label">${category}</div>
                </div>
              `).join('')}
            </div>

            <div class="two-column">
              <div>
                <h4 style="font-weight: bold; margin-bottom: 10px; color: #374151;">التوزيع حسب التخصص:</h4>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
                  ${Object.entries(positionCounts).map(([position, count]) => `
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e5e7eb;">
                      <span>${position}</span>
                      <span style="font-weight: bold;">${count}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div>
                <h4 style="font-weight: bold; margin-bottom: 10px; color: #374151;">التوزيع حسب نوع العقد:</h4>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
                  ${Object.entries(contractTypeCounts).map(([contractType, count]) => `
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e5e7eb;">
                      <span>${contractType}</span>
                      <span style="font-weight: bold;">${count}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (printOptions.vehicles) {
      content += `
        <!-- المركبات والمعدات -->
        <div class="section">
          <div class="section-title">المركبات والمعدات</div>
          <div class="section-content">
            <!-- سيارة الخدمات -->
            <div class="vehicle-section">
              <div class="vehicle-title">
                🚗 سيارة الخدمات:
                <span class="${center.سيارة_خدمات?.متوفرة ? 'badge-available' : 'badge-unavailable'}">
                  ${center.سيارة_خدمات?.متوفرة ? 'متوفرة' : 'غير متوفرة'}
                </span>
              </div>
              ${center.سيارة_خدمات?.متوفرة ? `
              <div class="vehicle-info">
                ${(center.سيارة_خدمات.رقم_اللوحة_عربي || center.سيارة_خدمات.رقم_اللوحة_انجليزي) ? `
                <div class="vehicle-plate-info">
                  <span class="label">اللوحة:</span>
                  <div class="badges">
                    ${center.سيارة_خدمات.رقم_اللوحة_عربي ? `<span class="badge">${center.سيارة_خدمات.رقم_اللوحة_عربي}</span>` : ''}
                    ${center.سيارة_خدمات.رقم_اللوحة_انجليزي ? `<span class="badge">${center.سيارة_خدمات.رقم_اللوحة_انجليزي}</span>` : ''}
                  </div>
                </div>
                ` : ''}
                ${center.سيارة_خدمات.رقم_الهيكل ? `<div><strong>رقم الهيكل:</strong> ${center.سيارة_خدمات.رقم_الهيكل}</div>` : ''}
                ${center.سيارة_خدمات.الرقم_التسلسلي ? `<div><strong>الرقم التسلسلي:</strong> ${center.سيارة_خدمات.الرقم_التسلسلي}</div>` : ''}
                <div><strong>النوع:</strong> ${center.سيارة_خدمات.نوع_السيارة || 'غير محدد'}</div>
                <div><strong>الموديل:</strong> ${center.سيارة_خدمات.موديل || 'غير محدد'}</div>
                ${center.سيارة_خدمات.المسافة_المقطوعة > 0 ? `<div><strong>المسافة المقطوعة:</strong> ${center.سيارة_خدمات.المسافة_المقطوعة.toLocaleString()} كم</div>` : ''}
                ${center.سيارة_خدمات.رقم_جهاز_اللاسلكي ? `<div><strong>جهاز اللاسلكي:</strong> ${center.سيارة_خدمات.رقم_جهاز_اللاسلكي}</div>` : ''}
                <div><strong>الحالة:</strong> ${center.سيارة_خدمات.حالة_السيارة || 'غير محدد'}</div>
                ${center.سيارة_خدمات.اسم_السائق ? `
                <div class="vehicle-driver-info">
                  <div class="driver-name">👤 السائق: ${center.سيارة_خدمات.اسم_السائق}</div>
                  ${center.سيارة_خدمات.رخصة_السائق ? `<div>رخصة القيادة: ${center.سيارة_خدمات.رخصة_السائق}</div>` : ''}
                </div>
                ` : ''}
              </div>
              ` : '<div style="color: #6b7280; font-style: italic;">لا توجد سيارة خدمات متاحة في هذا المركز</div>'}
            </div>

            <!-- سيارة الإسعاف -->
            <div class="vehicle-section">
              <div class="vehicle-title">
                🚑 سيارة الإسعاف:
                <span class="${center.سيارة_اسعاف?.متوفرة ? 'badge-available' : 'badge-unavailable'}">
                  ${center.سيارة_اسعاف?.متوفرة ? 'متوفرة' : 'غير متوفرة'}
                </span>
                ${center.سيارة_اسعاف?.مجهزة_بالكامل ? '<span class="badge-available" style="margin-right: 10px;">مجهزة بالكامل</span>' : ''}
              </div>
              ${center.سيارة_اسعاف?.متوفرة ? `
              <div class="vehicle-info">
                ${(center.سيارة_اسعاف.رقم_اللوحة_عربي || center.سيارة_اسعاف.رقم_اللوحة_انجليزي) ? `
                <div class="vehicle-plate-info" style="background: #ffebeb; border-color: #ffcaca;">
                  <span class="label" style="color: #dc2626;">اللوحة:</span>
                  <div class="badges">
                    ${center.سيارة_اسعاف.رقم_اللوحة_عربي ? `<span class="badge" style="background: #fecaca; color: #dc2626;">${center.سيارة_اسعاف.رقم_اللوحة_عربي}</span>` : ''}
                    ${center.سيارة_اسعاف.رقم_اللوحة_انجليزي ? `<span class="badge" style="background: #fecaca; color: #dc2626;">${center.سيارة_اسعاف.رقم_اللوحة_انجليزي}</span>` : ''}
                  </div>
                </div>
                ` : ''}
                ${center.سيارة_اسعاف.رقم_الهيكل ? `<div><strong>رقم الهيكل:</strong> ${center.سيارة_اسعاف.رقم_الهيكل}</div>` : ''}
                ${center.سيارة_اسعاف.الرقم_التسلسلي ? `<div><strong>الرقم التسلسلي:</strong> ${center.سيارة_اسعاف.الرقم_التسلسلي}</div>` : ''}
                <div><strong>النوع:</strong> ${center.سيارة_اسعاف.نوع_السيارة || 'غير محدد'}</div>
                <div><strong>الموديل:</strong> ${center.سيارة_اسعاف.موديل || 'غير محدد'}</div>
                ${(center.سيارة_اسعاف.المسافة_المقطوعة && center.سيارة_اسعاف.المسافة_المقطوعة > 0) ? `<div><strong>المسافة المقطوعة:</strong> ${center.سيارة_اسعاف.المسافة_المقطوعة.toLocaleString()} كم</div>` : ''}
                ${center.سيارة_اسعاف.رقم_جهاز_اللاسلكي ? `<div><strong>جهاز اللاسلكي:</strong> ${center.سيارة_اسعاف.رقم_جهاز_اللاسلكي}</div>` : ''}
                <div><strong>الحالة:</strong> ${center.سيارة_اسعاف.حالة_السيارة || 'غير محدد'}</div>
                ${center.سيارة_اسعاف.اسم_السائق ? `
                <div class="vehicle-driver-info">
                  <div class="driver-name">👤 السائق: ${center.سيارة_اسعاف.اسم_السائق}</div>
                  ${center.سيارة_اسعاف.رخصة_السائق ? `<div>رخصة القيادة: ${center.سيارة_اسعاف.رخصة_السائق}</div>` : ''}
                </div>
                ` : ''}
              </div>
              ` : '<div style="color: #6b7280; font-style: italic;">لا توجد سيارة إسعاف متاحة في هذا المركز</div>'}
            </div>
          </div>
        </div>
      `;
    }

    if (printOptions.employees && centerEmployees.length > 0) {
      content += `
        <!-- قائمة الموظفين التفصيلية -->
        <div class="section">
          <div class="section-title">قائمة الموظفين التفصيلية (${centerEmployees.length} موظف)</div>
          <div class="section-content">
            <table class="employees-table">
              <thead>
                <tr>
                  <th>م</th>
                  <th>الاسم الكامل</th>
                  ${printOptions.showEmployeeDetails ? `
                  <th>رقم الهوية</th>
                  <th>الرقم الوظيفي</th>
                  <th>التخصص</th>
                  <th>ملاك الوظيفة</th>
                  <th>نوع العقد</th>
                  <th>الهاتف</th>
                  <th>الإيميل</th>
                  ` : ''}
                </tr>
              </thead>
              <tbody>
                ${centerEmployees.map((emp, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight: bold;">${emp.full_name_arabic}</td>
                    ${printOptions.showEmployeeDetails ? `
                    <td>${emp.رقم_الهوية || 'غير محدد'}</td>
                    <td>${emp.رقم_الموظف || 'غير محدد'}</td>
                    <td>${emp.position || 'غير محدد'}</td>
                    <td>${emp.job_category || 'غير محدد'}</td>
                    <td>${emp.contract_type || 'غير محدد'}</td>
                    <td>${emp.phone || 'غير محدد'}</td>
                    <td style="font-size: 9px;">${emp.email || 'غير محدد'}</td>
                    ` : ''}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (printOptions.additionalInfo && (center.الوصف || center.معلومات_اضافية)) {
      content += `
        <!-- معلومات إضافية -->
        <div class="section">
          <div class="section-title">معلومات إضافية</div>
          <div class="section-content">
            ${center.الوصف ? `
            <div style="margin-bottom: 20px;">
              <h4 style="font-weight: bold; color: #374151; margin-bottom: 10px;">وصف المركز:</h4>
              <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-right: 4px solid #2563eb;">
                ${center.الوصف}
              </div>
            </div>
            ` : ''}
            ${center.معلومات_اضافية ? `
            <div>
              <h4 style="font-weight: bold; color: #374151; margin-bottom: 10px;">ملاحظات:</h4>
              <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-right: 4px solid #059669;">
                ${center.معلومات_اضافية}
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    content += `
        <!-- التوقيع والختم -->
        <div class="signature-section">
          <div class="signature-title">شؤون المراكز الصحية بالحسو</div>
          <div style="margin-top: 40px;">
            <div style="display: inline-block; text-align: center; margin: 0 50px;">
              <div style="border-top: 1px solid #000; width: 200px; margin-bottom: 10px;"></div>
              <div style="font-size: 12px; font-weight: bold;">التوقيع والختم</div>
            </div>
          </div>
        </div>

        <!-- التذييل -->
        <div style="margin-top: 40px; padding-top: 15px; border-top: 2px solid #0d9488; font-size: 10px; color: #6b7280; text-align: center;">
          <p style="margin: 0; font-weight: bold; color: #0d9488;">شؤون المراكز الصحية بالحسو - مستشفى الحسو العام</p>
          <p style="margin: 3px 0 0 0;">تجمع المدينة المنورة الصحي - وزارة الصحة</p>
          <p style="margin: 8px 0 0 0; font-size: 9px; color: #94a3b8;">${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </body>
    </html>
    `;

    return content;
  };

  const filteredCenterEmployees = centerEmployees.filter(emp =>
    !employeeSearchQuery ||
    emp.full_name_arabic?.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.position?.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.رقم_الموظف?.includes(employeeSearchQuery)
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-1/4 mb-4" />
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-600 mb-2">حدث خطأ</h2>
        <p className="text-gray-700 max-w-md">{error}</p>
        <Button onClick={() => navigate(createPageUrl("HealthCenters"))} className="mt-6">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى قائمة المراكز
        </Button>
      </div>
    );
  }

  if (!center) {
    return <div className="p-6 text-center">لم يتم العثور على المركز الصحي.</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'نشط': return 'bg-green-100 text-green-800';
      case 'متوقف مؤقتاً': return 'bg-yellow-100 text-yellow-800';
      case 'قيد الصيانة': return 'bg-blue-100 text-blue-800';
      case 'مغلق': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOwnershipColor = (ownership) => {
    switch (ownership) {
      case 'حكومي': return 'bg-green-100 text-green-800';
      case 'مستأجر': return 'bg-orange-100 text-orange-800';
      case 'ملك خاص': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print-hide">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("HealthCenters"))}>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="text-green-600" />
                {center.اسم_المركز}
              </h1>
              <p className="text-gray-600">الملف التفصيلي للمركز الصحي</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowEmployeeExporter(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="w-4 h-4 ml-2" />
              استخراج بيان موظفين
            </Button>
            <Button onClick={() => navigate(createPageUrl(`HealthCenterEdit?id=${center.id}`))} className="bg-green-600 hover:bg-green-700">
              <Edit className="w-4 h-4 ml-2" />
              تعديل البيانات
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* المعلومات الأساسية */}
          <div className="lg:col-span-2 space-y-6">
            {/* بطاقة المعلومات العامة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="text-blue-600" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {center.seha_id && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-300">
                    <Hash className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 font-semibold">SEHA ID</p>
                      <p className="font-bold text-green-700 text-lg">{center.seha_id}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">الموقع</p>
                    <p className="font-semibold">{center.الموقع || "غير محدد"}</p>
                  </div>
                </div>
                {center.موقع_الخريطة && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">رابط الخريطة</p>
                      <a href={center.موقع_الخريطة} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 break-all hover:underline">
                        فتح في الخرائط
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">حالة التشغيل</p>
                    <Badge className={getStatusColor(center.حالة_التشغيل)}>
                      {center.حالة_التشغيل || "غير محدد"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">نوع الملكية</p>
                    <Badge className={getOwnershipColor(center.حالة_المركز)}>
                      {center.حالة_المركز || "غير محدد"}
                    </Badge>
                  </div>
                </div>
                {center.خط_الطول && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">خط الطول</p>
                      <p className="font-semibold">{center.خط_الطول}</p>
                    </div>
                  </div>
                )}
                {center.خط_العرض && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">خط العرض</p>
                      <p className="font-semibold">{center.خط_العرض}</p>
                    </div>
                  </div>
                )}
                {center.مركز_نائي && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-yellow-600">تصنيف خاص</p>
                      <Badge className="bg-yellow-100 text-yellow-800">مركز نائي</Badge>
                      {center.بدل_نأي && (
                        <p className="text-xs text-yellow-600 mt-1">بدل النأي: {center.بدل_نأي} ر.س</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* بيانات التواصل والأكواد */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="text-green-600" />
                  التواصل والأكواد التعريفية
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {center.هاتف_المركز && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">الهاتف الأرضي</p>
                      <p className="font-semibold">{center.هاتف_المركز}</p>
                    </div>
                  </div>
                )}

                {center.رقم_الشريحة && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">رقم الشريحة</p>
                      <p className="font-semibold text-green-700">{center.رقم_الشريحة}</p>
                    </div>
                  </div>
                )}

                {center.رقم_الجوال && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">رقم الجوال</p>
                      <p className="font-semibold text-blue-700">
                        <a href={`tel:${center.رقم_الجوال}`} className="hover:underline">
                          {center.رقم_الجوال}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {center.رقم_الهاتف_الثابت && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">الهاتف الثابت الإضافي</p>
                      <p className="font-semibold text-purple-700">
                        <a href={`tel:${center.رقم_الهاتف_الثابت}`} className="hover:underline">
                          {center.رقم_الهاتف_الثابت}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {center.فاكس_المركز && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">الفاكس</p>
                      <p className="font-semibold">{center.فاكس_المركز}</p>
                    </div>
                  </div>
                )}
                {center.ايميل_المركز && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">الإيميل الرسمي</p>
                      <p className="font-semibold text-blue-600">{center.ايميل_المركز}</p>
                    </div>
                  </div>
                )}
                {center.seha_id && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-300">
                    <Hash className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 font-semibold">SEHA ID</p>
                      <Badge className="bg-green-600 text-white text-lg">{center.seha_id}</Badge>
                    </div>
                  </div>
                )}
                {center.center_code && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">كود المركز</p>
                      <Badge variant="outline">{center.center_code}</Badge>
                    </div>
                  </div>
                )}
                {center.organization_code && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">كود المؤسسة</p>
                      <Badge variant="outline">{center.organization_code}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* بيانات الملكية والعقود - يظهر فقط إذا كان المركز مستأجر */}
            {center.حالة_المركز === 'مستأجر' && (
              <Card className="border-2 border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="text-orange-600" />
                    بيانات الملكية والعقود
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-orange-600">حالة الملكية</p>
                      <Badge className="bg-orange-600 text-white">{center.حالة_المركز}</Badge>
                    </div>
                  </div>

                  {center.قيمة_عقد_الايجار && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">قيمة الإيجار السنوية</p>
                        <p className="font-bold text-orange-700">{center.قيمة_عقد_الايجار.toLocaleString('ar-SA')} ر.س</p>
                      </div>
                    </div>
                  )}

                  {center.رقم_العقد && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">رقم العقد</p>
                        <p className="font-semibold">{center.رقم_العقد}</p>
                      </div>
                    </div>
                  )}

                  {center.تاريخ_بداية_العقد && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">تاريخ بداية العقد</p>
                        <p className="font-semibold">{new Date(center.تاريخ_بداية_العقد).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                  )}

                  {center.تاريخ_انتهاء_العقد && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <Calendar className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm text-red-600 font-medium">تاريخ انتهاء العقد</p>
                        <p className="font-bold text-red-700">{new Date(center.تاريخ_انتهاء_العقد).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                  )}

                  {center.اسم_المؤجر && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">اسم المؤجر</p>
                        <p className="font-semibold">{center.اسم_المؤجر}</p>
                      </div>
                    </div>
                  )}

                  {center.هاتف_المؤجر && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">هاتف المؤجر</p>
                        <p className="font-semibold">
                          <a href={`tel:${center.هاتف_المؤجر}`} className="text-blue-600 hover:underline">
                            {center.هاتف_المؤجر}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* اعتماد سباهي */}
            {center.معتمد_سباهي && (
              <Card className="border-2 border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" />
                    اعتماد سباهي
                  </CardTitle>
                </CardHeader>
                <CardContent className="mt-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-300">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-bold text-green-900">المركز حاصل على اعتماد سباهي ✓</p>
                      {center.تاريخ_اعتماد_سباهي && (
                        <p className="text-sm text-green-700">تاريخ الاعتماد: {new Date(center.تاريخ_اعتماد_سباهي).toLocaleDateString('ar-SA')}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* العيادات والخدمات */}
            {(center.العيادات_المتوفرة?.length > 0 || center.الخدمات_المقدمة?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hospital className="text-purple-600" />
                    العيادات والخدمات المقدمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* العيادات */}
                  {center.العيادات_المتوفرة?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Building className="w-4 h-4 text-purple-600" />
                        العيادات المتوفرة
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {center.العيادات_المتوفرة.map((clinic, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-purple-50">
                            <div className="font-semibold text-purple-900">{clinic.اسم_العيادة}</div>
                            {clinic.نوع_العيادة && (
                              <Badge className="mt-1 bg-purple-600">{clinic.نوع_العيادة}</Badge>
                            )}
                            {clinic.الطبيب_المسؤول && (
                              <p className="text-sm text-gray-600 mt-1">الطبيب: {clinic.الطبيب_المسؤول}</p>
                            )}
                            {clinic.ساعات_العمل && (
                              <p className="text-xs text-gray-500 mt-1">⏰ {clinic.ساعات_العمل}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* الخدمات */}
                  {center.الخدمات_المقدمة?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        الخدمات المقدمة
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {center.الخدمات_المقدمة.map((service, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* المركبات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="text-blue-600" />
                  المركبات والمعدات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* سيارة الخدمات */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Car className="w-5 h-5 text-gray-500" />
                    <h4 className="font-semibold">سيارة الخدمات 🚗</h4>
                    {center.سيارة_خدمات?.متوفرة ? (
                      <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 ml-1" />متوفرة</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 ml-1" />غير متوفرة</Badge>
                    )}
                  </div>
                  {center.سيارة_خدمات?.متوفرة && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {(center.سيارة_خدمات.رقم_اللوحة_عربي || center.سيارة_خدمات.رقم_اللوحة_انجليزي) && (
                          <div className="col-span-2 md:col-span-3 bg-blue-50 p-3 rounded">
                            <span className="text-gray-500 font-medium">اللوحة:</span>
                            <div className="flex gap-2 mt-1">
                              {center.سيارة_خدمات.رقم_اللوحة_عربي && (
                                <Badge variant="outline" className="text-base">{center.سيارة_خدمات.رقم_اللوحة_عربي}</Badge>
                              )}
                              {center.سيارة_خدمات.رقم_اللوحة_انجليزي && (
                                <Badge variant="outline" className="text-base">{center.سيارة_خدمات.رقم_اللوحة_انجليزي}</Badge>
                              )}
                            </div>
                          </div>
                        )}
                        {center.سيارة_خدمات.رقم_الهيكل && <div><span className="text-gray-500">رقم الهيكل:</span> {center.سيارة_خدمات.رقم_الهيكل}</div>}
                        {center.سيارة_خدمات.الرقم_التسلسلي && <div><span className="text-gray-500">الرقم التسلسلي:</span> {center.سيارة_خدمات.الرقم_التسلسلي}</div>}
                        {center.سيارة_خدمات.نوع_السيارة && <div><span className="text-gray-500">النوع:</span> {center.سيارة_خدمات.نوع_السيارة}</div>}
                        {center.سيارة_خدمات.موديل && <div><span className="text-gray-500">الموديل:</span> {center.سيارة_خدمات.موديل}</div>}
                        {center.سيارة_خدمات.المسافة_المقطوعة > 0 && <div><span className="text-gray-500">المسافة المقطوعة:</span> {center.سيارة_خدمات.المسافة_المقطوعة.toLocaleString()} كم</div>}
                        {center.سيارة_خدمات.رقم_جهاز_اللاسلكي && <div><span className="text-gray-500">جهاز اللاسلكي:</span> {center.سيارة_خدمات.رقم_جهاز_اللاسلكي}</div>}
                        {center.سيارة_خدمات.حالة_السيارة && <div><span className="text-gray-500">الحالة:</span> {center.سيارة_خدمات.حالة_السيارة}</div>}
                      </div>
                      {center.سيارة_خدمات.اسم_السائق && (
                        <div className="bg-purple-50 p-3 rounded border border-purple-200">
                          <div className="font-medium text-purple-900">👤 السائق</div>
                          <div className="text-sm mt-1">
                            <div>الاسم: {center.سيارة_خدمات.اسم_السائق}</div>
                            {center.سيارة_خدمات.رخصة_السائق && (
                              <div>رخصة القيادة: {center.سيارة_خدمات.رخصة_السائق}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* سيارة الإسعاف */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Car className="w-5 h-5 text-red-500" />
                    <h4 className="font-semibold">سيارة الإسعاف 🚑</h4>
                    {center.سيارة_اسعاف?.متوفرة ? (
                      <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 ml-1" />متوفرة</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 ml-1" />غير متوفرة</Badge>
                    )}
                  </div>
                  {center.سيارة_اسعاف?.متوفرة && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {(center.سيارة_اسعاف.رقم_اللوحة_عربي || center.سيارة_اسعاف.رقم_اللوحة_انجليزي) && (
                          <div className="col-span-2 md:col-span-3 bg-red-50 p-3 rounded">
                            <span className="text-gray-500 font-medium">اللوحة:</span>
                            <div className="flex gap-2 mt-1">
                              {center.سيارة_اسعاف.رقم_اللوحة_عربي && (
                                <Badge variant="outline" className="text-base">{center.سيارة_اسعاف.رقم_اللوحة_عربي}</Badge>
                              )}
                              {center.سيارة_اسعاف.رقم_اللوحة_انجليزي && (
                                <Badge variant="outline" className="text-base">{center.سيارة_اسعاف.رقم_اللوحة_انجليزي}</Badge>
                              )}
                            </div>
                          </div>
                        )}
                        {center.سيارة_اسعاف.رقم_الهيكل && <div><span className="text-gray-500">رقم الهيكل:</span> {center.سيارة_اسعاف.رقم_الهيكل}</div>}
                        {center.سيارة_اسعاف.الرقم_التسلسلي && <div><span className="text-gray-500">الرقم التسلسلي:</span> {center.سيارة_اسعاف.الرقم_التسلسلي}</div>}
                        {center.سيارة_اسعاف.نوع_السيارة && <div><span className="text-gray-500">النوع:</span> {center.سيارة_اسعاف.نوع_السيارة}</div>}
                        {center.سيارة_اسعاف.موديل && <div><span className="text-gray-500">الموديل:</span> {center.سيارة_اسعاف.موديل}</div>}
                        {(center.سيارة_اسعاف.المسافة_المقطوعة && center.سيارة_اسعاف.المسافة_المقطوعة > 0) && <div><span className="text-gray-500">المسافة المقطوعة:</span> {center.سيارة_اسعاف.المسافة_المقطوعة.toLocaleString()} كم</div>}
                        {center.سيارة_اسعاف.رقم_جهاز_اللاسلكي && <div><span className="text-gray-500">جهاز اللاسلكي:</span> {center.سيارة_اسعاف.رقم_جهاز_اللاسلكي}</div>}
                        {center.سيارة_اسعاف.حالة_السيارة && <div><span className="text-gray-500">الحالة:</span> {center.سيارة_اسعاف.حالة_السيارة}</div>}
                      </div>
                      {center.سيارة_اسعاف?.مجهزة_بالكامل && (
                        <Badge className="bg-blue-100 text-blue-800">مجهزة بالكامل ✓</Badge>
                      )}
                      {center.سيارة_اسعاف.اسم_السائق && (
                        <div className="bg-purple-50 p-3 rounded border border-purple-200">
                          <div className="font-medium text-purple-900">👤 السائق</div>
                          <div className="text-sm mt-1">
                            <div>الاسم: {center.سيارة_اسعاف.اسم_السائق}</div>
                            {center.سيارة_اسعاف.رخصة_السائق && (
                              <div>رخصة القيادة: {center.سيارة_اسعاف.رخصة_السائق}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* القيادة والإحصائيات */}
          <div className="space-y-6">
            {/* بطاقة القيادة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-green-600" />
                  قيادة المركز
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* المدير */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-1">مدير المركز</p>
                  <p className="font-bold text-gray-900">{manager?.full_name_arabic || 'غير محدد'}</p>
                  {manager?.phone && <p className="text-sm text-gray-600">📱 {manager.phone}</p>}
                  {manager?.email && <p className="text-sm text-blue-600">✉️ {manager.email}</p>}
                </div>

                {/* نائب المدير */}
                {deputyManager && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium mb-1">نائب المدير</p>
                    <p className="font-bold text-gray-900">{deputyManager.full_name_arabic}</p>
                    {deputyManager.phone && <p className="text-sm text-gray-600">📱 {deputyManager.phone}</p>}
                  </div>
                )}

                {/* المشرف الفني */}
                {technicalSupervisor && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium mb-1">المشرف الفني</p>
                    <p className="font-bold text-gray-900">{technicalSupervisor.full_name_arabic}</p>
                    {technicalSupervisor.phone && <p className="text-sm text-gray-600">📱 {technicalSupervisor.phone}</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* إحصائيات الموظفين */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-blue-600" />
                  إحصائيات الموظفين (محسوبة من النظام)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* العدد الإجمالي */}
                <div className="text-center mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{centerEmployees.length}</div>
                  <div className="text-sm text-blue-500">إجمالي الموظفين المسجلين فعلياً</div>
                </div>

                {/* التقسيم بالتخصصات الفعلية */}
                {centerEmployees.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-700">التوزيع حسب ملاك الوظيفة</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {['طبيب', 'ممرض', 'صيدلي', 'فني', 'إداري', 'خدمات مساندة', 'أخرى'].map(category => {
                        const count = centerEmployees.filter(emp =>
                          emp.job_category === category ||
                          (category === 'أخرى' && !['طبيب', 'ممرض', 'صيدلي', 'فني', 'إداري', 'خدمات مساندة'].includes(emp.job_category))
                        ).length;
                        return count > 0 ? (
                          <div key={category} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span>{category}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ملخص العيادات */}
        <div className="mt-6">
          <ClinicsSummary healthCenterId={center.id} healthCenterName={center.اسم_المركز} />
        </div>

        {/* مستندات المركز */}
        <div className="mt-6">
          <CenterDocuments centerId={center.id} centerName={center.اسم_المركز} />
        </div>

        {/* الأجهزة الطبية */}
        <div className="mt-6">
          <CenterMedicalEquipmentNew centerId={center.id} centerName={center.اسم_المركز} />
        </div>

        {/* قسم موظفي المركز */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="flex items-center gap-2">
                <Users className="text-blue-600" />
                موظفو المركز ({centerEmployees.length} موظف)
              </span>
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="البحث في الموظفين..."
                  value={employeeSearchQuery}
                  onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                  className="pl-8"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCenterEmployees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-3 text-right">الاسم</th>
                      <th className="border p-3 text-right">الرقم الوظيفي</th>
                      <th className="border p-3 text-right">التخصص</th>
                      <th className="border p-3 text-right">نوع العقد</th>
                      <th className="border p-3 text-right">الهاتف</th>
                      <th className="border p-3 text-right">المهام والأدوار</th>
                      <th className="border p-3 text-center print-hide">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCenterEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="border p-3 font-semibold">{emp.full_name_arabic}</td>
                        <td className="border p-3">{emp.رقم_الموظف || 'غير محدد'}</td>
                        <td className="border p-3">{emp.position || 'غير محدد'}</td>
                        <td className="border p-3">{emp.contract_type || 'غير محدد'}</td>
                        <td className="border p-3">{emp.phone || 'غير محدد'}</td>
                        <td className="border p-3">
                          <div className="flex flex-wrap gap-1">
                            {(emp.special_roles || []).map(role => (
                              <Badge key={role} className="bg-green-100 text-green-800 text-xs">{role}</Badge>
                            ))}
                            {(emp.assigned_tasks || []).slice(0, 2).map(task => (
                              <Badge key={task} variant="outline" className="bg-blue-50 text-blue-700 text-xs">{task}</Badge>
                            ))}
                            {(emp.assigned_tasks || []).length > 2 && (
                              <Badge variant="outline" className="text-xs">+{emp.assigned_tasks.length - 2}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="border p-3 text-center print-hide">
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedEmployeeForRole(emp);
                                setShowRoleAssignment(true);
                              }}
                              className="gap-1 text-blue-600 hover:bg-blue-50"
                            >
                              <UserPlus className="w-4 h-4" />
                              أدوار
                            </Button>
                            <Link to={createPageUrl(`EmployeeProfile?id=${emp.id}`)}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 ml-1" />
                                الملف
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {employeeSearchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد موظفون مسجلون في هذا المركز'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* معلومات إضافية */}
        {(center.الوصف || center.معلومات_اضافية) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {center.الوصف && (
                <div>
                  <h4 className="font-semibold mb-2">وصف المركز</h4>
                  <p className="text-gray-700">{center.الوصف}</p>
                </div>
              )}
              {center.معلومات_اضافية && (
                <div>
                  <h4 className="font-semibold mb-2">ملاحظات</h4>
                  <p className="text-gray-700">{center.معلومات_اضافية}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog إضافة أدوار */}
      <QuickRoleAssignment
        employee={selectedEmployeeForRole}
        open={showRoleAssignment}
        onOpenChange={setShowRoleAssignment}
        onSuccess={() => {
          // إعادة تحميل بيانات الموظفين
          const id = getCenterId();
          if (id) {
            Employee.list().then(allEmployees => {
              const safeEmployees = Array.isArray(allEmployees) ? allEmployees : [];
              setEmployees(safeEmployees);
              HealthCenter.get(id).then(centerData => {
                if (centerData) {
                  const centerEmps = safeEmployees.filter(emp => emp.المركز_الصحي === centerData.اسم_المركز);
                  setCenterEmployees(centerEmps);
                }
              });
            });
          }
        }}
      />

      {/* Dialog استخراج بيان الموظفين */}
      <CenterEmployeeExporter
        open={showEmployeeExporter}
        onOpenChange={setShowEmployeeExporter}
        employees={centerEmployees}
        centerName={center.اسم_المركز}
        manager={manager}
      />

      {/* Dialog تخصيص الطباعة */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تخصيص الطباعة</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* شكل الإخراج */}
            <div>
              <Label className="text-base font-bold mb-3 block">شكل الإخراج</Label>
              <RadioGroup
                value={printOptions.outputFormat}
                onValueChange={(value) => setPrintOptions(prev => ({ ...prev, outputFormat: value }))}
                className="grid grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="detailed" id="format-detailed" />
                  <Label htmlFor="format-detailed" className="cursor-pointer flex-1">
                    <div className="font-medium">📄 تفصيلي وصفي</div>
                    <div className="text-xs text-gray-500">بطاقات ومعلومات مفصلة</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="table" id="format-table" />
                  <Label htmlFor="format-table" className="cursor-pointer flex-1">
                    <div className="font-medium">📊 جداول</div>
                    <div className="text-xs text-gray-500">عرض منظم في جداول</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="compact" id="format-compact" />
                  <Label htmlFor="format-compact" className="cursor-pointer flex-1">
                    <div className="font-medium">📋 مختصر</div>
                    <div className="text-xs text-gray-500">معلومات أساسية فقط</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="presentation" id="format-presentation" />
                  <Label htmlFor="format-presentation" className="cursor-pointer flex-1">
                    <div className="font-medium">🎨 عرض تقديمي</div>
                    <div className="text-xs text-gray-500">للعروض والاجتماعات</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* الأقسام المراد طباعتها */}
            <div>
              <Label className="text-base font-bold mb-3 block">الأقسام المراد طباعتها</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="basicInfo"
                    checked={printOptions.basicInfo}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, basicInfo: checked }))}
                  />
                  <Label htmlFor="basicInfo" className="cursor-pointer">المعلومات الأساسية</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="contactInfo"
                    checked={printOptions.contactInfo}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, contactInfo: checked }))}
                  />
                  <Label htmlFor="contactInfo" className="cursor-pointer">بيانات التواصل</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="ownership"
                    checked={printOptions.ownership}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, ownership: checked }))}
                  />
                  <Label htmlFor="ownership" className="cursor-pointer">بيانات الملكية والعقود</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="sabahi"
                    checked={printOptions.sabahi}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, sabahi: checked }))}
                  />
                  <Label htmlFor="sabahi" className="cursor-pointer">اعتماد سباهي</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="clinics"
                    checked={printOptions.clinics}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, clinics: checked }))}
                  />
                  <Label htmlFor="clinics" className="cursor-pointer">العيادات والخدمات</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="leadership"
                    checked={printOptions.leadership}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, leadership: checked }))}
                  />
                  <Label htmlFor="leadership" className="cursor-pointer">القيادة والإدارة</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="statistics"
                    checked={printOptions.statistics}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, statistics: checked }))}
                  />
                  <Label htmlFor="statistics" className="cursor-pointer">الإحصائيات</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="vehicles"
                    checked={printOptions.vehicles}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, vehicles: checked }))}
                  />
                  <Label htmlFor="vehicles" className="cursor-pointer">المركبات</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="employees"
                    checked={printOptions.employees}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, employees: checked }))}
                  />
                  <Label htmlFor="employees" className="cursor-pointer">قائمة الموظفين</Label>
                </div>

                {printOptions.employees && (
                  <div className="flex items-center space-x-2 space-x-reverse col-span-2">
                    <Checkbox
                      id="showEmployeeDetails"
                      checked={printOptions.showEmployeeDetails}
                      onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, showEmployeeDetails: checked }))}
                    />
                    <Label htmlFor="showEmployeeDetails" className="cursor-pointer">تفاصيل الموظفين الكاملة</Label>
                  </div>
                )}

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="additionalInfo"
                    checked={printOptions.additionalInfo}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, additionalInfo: checked }))}
                  />
                  <Label htmlFor="additionalInfo" className="cursor-pointer">المعلومات الإضافية</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrintDialog(false)}>إلغاء</Button>
            <Button onClick={handlePrintConfirm} className="gap-2">
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}