import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Stethoscope, Wrench, Building2, Search, Download, Plus, Minus,
  Loader2, Trash2, FileCode, Printer, FileSpreadsheet, Package,
  CheckCircle2, AlertCircle, Filter, X, Save, List, Upload, FileUp, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// قوائم الأدوات الطبية
const medicalEquipmentList = [
  // أجهزة طبية رئيسية
  { id: 'defibrillator', name: 'جهاز صدمات كهربائية (Defibrillator)', category: 'أجهزة طبية' },
  { id: 'ecg', name: 'جهاز تخطيط القلب (ECG)', category: 'أجهزة طبية' },
  { id: 'suction', name: 'جهاز شفط', category: 'أجهزة طبية' },
  { id: 'nebulizer', name: 'جهاز بخار (Nebulizer)', category: 'أجهزة طبية' },
  { id: 'pulse_oximeter', name: 'جهاز قياس الأكسجين (Pulse Oximeter)', category: 'أجهزة طبية' },
  { id: 'bp_monitor', name: 'جهاز قياس ضغط الدم', category: 'أجهزة طبية' },
  { id: 'thermometer_digital', name: 'ميزان حرارة رقمي', category: 'أجهزة طبية' },
  { id: 'glucometer', name: 'جهاز قياس السكر', category: 'أجهزة طبية' },
  { id: 'infant_scale', name: 'ميزان أطفال', category: 'أجهزة طبية' },
  { id: 'adult_scale', name: 'ميزان بالغين', category: 'أجهزة طبية' },
  { id: 'height_measure', name: 'جهاز قياس الطول', category: 'أجهزة طبية' },
  { id: 'autoclave', name: 'جهاز تعقيم (Autoclave)', category: 'أجهزة طبية' },
  { id: 'centrifuge', name: 'جهاز طرد مركزي', category: 'أجهزة طبية' },
  { id: 'microscope', name: 'مجهر', category: 'أجهزة طبية' },
  
  // أدوات الفحص
  { id: 'stethoscope', name: 'سماعة طبية', category: 'أدوات الفحص' },
  { id: 'otoscope', name: 'منظار الأذن', category: 'أدوات الفحص' },
  { id: 'ophthalmoscope', name: 'منظار العين', category: 'أدوات الفحص' },
  { id: 'tongue_depressor', name: 'خافض لسان', category: 'أدوات الفحص' },
  { id: 'reflex_hammer', name: 'مطرقة الانعكاسات', category: 'أدوات الفحص' },
  { id: 'tape_measure', name: 'شريط قياس طبي', category: 'أدوات الفحص' },
  { id: 'pen_light', name: 'قلم ضوئي للفحص', category: 'أدوات الفحص' },
  
  // أدوات الإسعافات الأولية
  { id: 'emergency_cart', name: 'عربة طوارئ', category: 'إسعافات أولية' },
  { id: 'oxygen_cylinder', name: 'اسطوانة أكسجين', category: 'إسعافات أولية' },
  { id: 'ambu_bag', name: 'جهاز تنفس يدوي (Ambu Bag)', category: 'إسعافات أولية' },
  { id: 'first_aid_kit', name: 'حقيبة إسعافات أولية', category: 'إسعافات أولية' },
  { id: 'stretcher', name: 'نقالة', category: 'إسعافات أولية' },
  { id: 'wheelchair', name: 'كرسي متحرك', category: 'إسعافات أولية' },
  { id: 'splints', name: 'جبائر', category: 'إسعافات أولية' },
  { id: 'cervical_collar', name: 'طوق رقبة', category: 'إسعافات أولية' },
  
  // أدوات التطعيم
  { id: 'vaccine_fridge', name: 'ثلاجة لقاحات', category: 'التطعيمات' },
  { id: 'vaccine_carrier', name: 'حافظة لقاحات', category: 'التطعيمات' },
  { id: 'ice_pack', name: 'أكياس ثلج', category: 'التطعيمات' },
  { id: 'temp_monitor', name: 'جهاز مراقبة درجة الحرارة', category: 'التطعيمات' },
  
  // أدوات المختبر
  { id: 'blood_collection_tubes', name: 'أنابيب جمع الدم', category: 'المختبر' },
  { id: 'syringes', name: 'محاقن (سرنجات)', category: 'المختبر' },
  { id: 'needles', name: 'إبر طبية', category: 'المختبر' },
  { id: 'tourniquet', name: 'رباط ضاغط', category: 'المختبر' },
  { id: 'alcohol_swabs', name: 'مسحات كحول', category: 'المختبر' },
  { id: 'cotton_balls', name: 'كرات قطن', category: 'المختبر' },
  { id: 'urine_cups', name: 'أكواب عينات البول', category: 'المختبر' },
  
  // أثاث طبي
  { id: 'exam_bed', name: 'سرير فحص', category: 'أثاث طبي' },
  { id: 'exam_light', name: 'إضاءة فحص', category: 'أثاث طبي' },
  { id: 'instrument_table', name: 'طاولة أدوات', category: 'أثاث طبي' },
  { id: 'medicine_cabinet', name: 'خزانة أدوية', category: 'أثاث طبي' },
  { id: 'sharps_container', name: 'حاوية الأدوات الحادة', category: 'أثاث طبي' },
  { id: 'medical_waste_bin', name: 'سلة نفايات طبية', category: 'أثاث طبي' },
  
  // أدوات الأسنان
  { id: 'dental_chair', name: 'كرسي أسنان', category: 'طب الأسنان' },
  { id: 'dental_unit', name: 'وحدة أسنان متكاملة', category: 'طب الأسنان' },
  { id: 'dental_xray', name: 'جهاز أشعة أسنان', category: 'طب الأسنان' },
  { id: 'dental_instruments', name: 'أدوات أسنان أساسية', category: 'طب الأسنان' },
  { id: 'dental_sterilizer', name: 'جهاز تعقيم أسنان', category: 'طب الأسنان' },
];

// قوائم الأدوات غير الطبية
const nonMedicalEquipmentList = [
  // أثاث مكتبي
  { id: 'desk', name: 'مكتب', category: 'أثاث مكتبي' },
  { id: 'office_chair', name: 'كرسي مكتبي', category: 'أثاث مكتبي' },
  { id: 'visitor_chair', name: 'كرسي زوار', category: 'أثاث مكتبي' },
  { id: 'waiting_chair', name: 'كرسي انتظار', category: 'أثاث مكتبي' },
  { id: 'filing_cabinet', name: 'خزانة ملفات', category: 'أثاث مكتبي' },
  { id: 'bookshelf', name: 'رف كتب', category: 'أثاث مكتبي' },
  { id: 'counter', name: 'كاونتر استقبال', category: 'أثاث مكتبي' },
  
  // أجهزة إلكترونية
  { id: 'computer', name: 'جهاز كمبيوتر', category: 'أجهزة إلكترونية' },
  { id: 'laptop', name: 'لابتوب', category: 'أجهزة إلكترونية' },
  { id: 'printer', name: 'طابعة', category: 'أجهزة إلكترونية' },
  { id: 'scanner', name: 'ماسح ضوئي', category: 'أجهزة إلكترونية' },
  { id: 'copier', name: 'آلة تصوير', category: 'أجهزة إلكترونية' },
  { id: 'phone', name: 'هاتف أرضي', category: 'أجهزة إلكترونية' },
  { id: 'fax', name: 'جهاز فاكس', category: 'أجهزة إلكترونية' },
  { id: 'projector', name: 'جهاز عرض (بروجكتور)', category: 'أجهزة إلكترونية' },
  { id: 'tv_screen', name: 'شاشة عرض', category: 'أجهزة إلكترونية' },
  { id: 'cctv', name: 'كاميرات مراقبة', category: 'أجهزة إلكترونية' },
  { id: 'fingerprint', name: 'جهاز بصمة', category: 'أجهزة إلكترونية' },
  
  // تكييف وتبريد
  { id: 'ac_split', name: 'مكيف سبليت', category: 'تكييف وتبريد' },
  { id: 'ac_window', name: 'مكيف شباك', category: 'تكييف وتبريد' },
  { id: 'ac_central', name: 'تكييف مركزي', category: 'تكييف وتبريد' },
  { id: 'water_cooler', name: 'برادة ماء', category: 'تكييف وتبريد' },
  { id: 'fridge', name: 'ثلاجة', category: 'تكييف وتبريد' },
  { id: 'fan', name: 'مروحة', category: 'تكييف وتبريد' },
  
  // إضاءة
  { id: 'ceiling_light', name: 'إضاءة سقف', category: 'إضاءة' },
  { id: 'fluorescent', name: 'لمبات فلورسنت', category: 'إضاءة' },
  { id: 'led_lights', name: 'إضاءة LED', category: 'إضاءة' },
  { id: 'emergency_light', name: 'إضاءة طوارئ', category: 'إضاءة' },
  { id: 'outdoor_light', name: 'إضاءة خارجية', category: 'إضاءة' },
  
  // سلامة وأمان
  { id: 'fire_extinguisher', name: 'طفاية حريق', category: 'سلامة وأمان' },
  { id: 'fire_alarm', name: 'جهاز إنذار حريق', category: 'سلامة وأمان' },
  { id: 'smoke_detector', name: 'كاشف دخان', category: 'سلامة وأمان' },
  { id: 'first_aid_sign', name: 'لوحة إسعافات أولية', category: 'سلامة وأمان' },
  { id: 'exit_sign', name: 'لوحة مخرج طوارئ', category: 'سلامة وأمان' },
  { id: 'safety_cabinet', name: 'خزانة معدات السلامة', category: 'سلامة وأمان' },
  
  // نظافة وصيانة
  { id: 'vacuum_cleaner', name: 'مكنسة كهربائية', category: 'نظافة وصيانة' },
  { id: 'floor_polisher', name: 'ماكينة تلميع أرضيات', category: 'نظافة وصيانة' },
  { id: 'cleaning_cart', name: 'عربة نظافة', category: 'نظافة وصيانة' },
  { id: 'trash_bin', name: 'سلة مهملات', category: 'نظافة وصيانة' },
  { id: 'mop_bucket', name: 'دلو ممسحة', category: 'نظافة وصيانة' },
  
  // معدات متنوعة
  { id: 'generator', name: 'مولد كهربائي', category: 'معدات متنوعة' },
  { id: 'ups', name: 'جهاز UPS', category: 'معدات متنوعة' },
  { id: 'water_tank', name: 'خزان مياه', category: 'معدات متنوعة' },
  { id: 'water_pump', name: 'مضخة مياه', category: 'معدات متنوعة' },
  { id: 'ladder', name: 'سلم', category: 'معدات متنوعة' },
  { id: 'toolbox', name: 'صندوق أدوات', category: 'معدات متنوعة' },
];

export default function CenterDeficiencyTool() {
  const [healthCenters, setHealthCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [activeTab, setActiveTab] = useState('medical');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadHealthCenters();
    loadSavedReports();
  }, []);

  const loadHealthCenters = async () => {
    setIsLoading(true);
    try {
      const centers = await base44.entities.HealthCenter.list('-updated_date', 100);
      setHealthCenters(Array.isArray(centers) ? centers : []);
    } catch (error) {
      console.error('Error loading health centers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedReports = async () => {
    // يمكن حفظ التقارير في localStorage أو في قاعدة البيانات
    const saved = localStorage.getItem('deficiency_reports');
    if (saved) {
      setSavedReports(JSON.parse(saved));
    }
  };

  const saveReport = () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء اختيار مركز وإضافة عناصر للتقرير');
      return;
    }

    const report = {
      id: Date.now(),
      title: reportTitle || `تقرير نواقص ${selectedCenter}`,
      center: selectedCenter,
      items: selectedItems,
      date: new Date().toISOString(),
    };

    const updated = [...savedReports, report];
    setSavedReports(updated);
    localStorage.setItem('deficiency_reports', JSON.stringify(updated));
    toast.success('تم حفظ التقرير');
  };

  const deleteReport = (reportId) => {
    const updated = savedReports.filter(r => r.id !== reportId);
    setSavedReports(updated);
    localStorage.setItem('deficiency_reports', JSON.stringify(updated));
    toast.success('تم حذف التقرير');
  };

  const loadReport = (report) => {
    setSelectedCenter(report.center);
    setSelectedItems(report.items);
    setReportTitle(report.title);
    setShowSavedReports(false);
    toast.success('تم تحميل التقرير');
  };

  const toggleItem = (item, quantity = 1) => {
    const existingIndex = selectedItems.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      setSelectedItems(prev => [...prev, { ...item, quantity, type: activeTab }]);
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) quantity = 1;
    setSelectedItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const isSelected = (itemId) => selectedItems.some(i => i.id === itemId);
  const getSelectedQuantity = (itemId) => selectedItems.find(i => i.id === itemId)?.quantity || 1;

  const currentList = activeTab === 'medical' ? medicalEquipmentList : nonMedicalEquipmentList;
  const categories = [...new Set(currentList.map(item => item.category))];

  const filteredItems = searchQuery
    ? currentList.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentList;

  const medicalItems = selectedItems.filter(i => i.type === 'medical');
  const nonMedicalItems = selectedItems.filter(i => i.type === 'nonmedical');

  const exportToExcel = () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء اختيار مركز وإضافة عناصر للتقرير');
      return;
    }

    const headers = ['#', 'اسم العنصر', 'التصنيف', 'النوع', 'العدد المطلوب'];
    const rows = selectedItems.map((item, idx) => [
      idx + 1,
      item.name,
      item.category,
      item.type === 'medical' ? 'طبي' : 'غير طبي',
      item.quantity
    ]);

    // إضافة معلومات المركز
    const centerInfo = [
      ['تقرير نواقص المركز الصحي'],
      ['المركز:', selectedCenter],
      ['التاريخ:', new Date().toLocaleDateString('ar-SA')],
      [''],
    ];

    const csvContent = [
      ...centerInfo.map(row => row.join(',')),
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نواقص-${selectedCenter}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('تم تصدير التقرير');
  };

  const exportToHTML = () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء اختيار مركز وإضافة عناصر للتقرير');
      return;
    }

    const today = new Date().toLocaleDateString('ar-SA', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير نواقص ${selectedCenter}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Cairo', sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: #1e293b;
      line-height: 1.6;
      padding: 30px;
    }
    
    .container { max-width: 900px; margin: 0 auto; }
    
    .header {
      background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
      color: white;
      padding: 40px;
      border-radius: 20px;
      margin-bottom: 30px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(15, 118, 110, 0.3);
    }
    
    .header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 10px; }
    .header .center-name { font-size: 1.5rem; margin-bottom: 15px; opacity: 0.95; }
    .header .date { background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; display: inline-block; }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    
    .stat-number { font-size: 2.5rem; font-weight: 800; color: #0f766e; }
    .stat-label { color: #64748b; font-weight: 600; }
    
    .section {
      background: white;
      border-radius: 16px;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    
    .section-header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 15px 25px;
      font-size: 1.2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-header.medical { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); }
    .section-header.non-medical { background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); }
    
    table { width: 100%; border-collapse: collapse; }
    
    th {
      background: #f1f5f9;
      padding: 15px 12px;
      text-align: right;
      font-weight: 700;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    tr:hover { background: #f8fafc; }
    
    .category-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      background: #e2e8f0;
      color: #475569;
    }
    
    .quantity { 
      font-weight: 800; 
      color: #0f766e; 
      font-size: 1.1rem;
      text-align: center;
    }
    
    .footer {
      text-align: center;
      padding: 30px;
      color: #64748b;
      font-size: 0.9rem;
      border-top: 2px solid #e2e8f0;
      margin-top: 30px;
    }
    
    @media print {
      body { background: white; padding: 10px; }
      .header { box-shadow: none; border: 2px solid #0f766e; }
      .section, .stat-card { box-shadow: none; border: 1px solid #e2e8f0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 تقرير نواقص التجهيزات</h1>
      <div class="center-name">🏥 ${selectedCenter}</div>
      <div class="date">📅 ${today}</div>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${selectedItems.length}</div>
        <div class="stat-label">إجمالي العناصر</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="color: #0f766e;">${medicalItems.length}</div>
        <div class="stat-label">أدوات طبية</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="color: #7c3aed;">${nonMedicalItems.length}</div>
        <div class="stat-label">أدوات غير طبية</div>
      </div>
    </div>
    
    ${medicalItems.length > 0 ? `
    <div class="section">
      <div class="section-header medical">
        🏥 الأدوات الطبية المطلوبة (${medicalItems.length})
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>اسم العنصر</th>
            <th>التصنيف</th>
            <th>العدد</th>
          </tr>
        </thead>
        <tbody>
          ${medicalItems.map((item, idx) => `
            <tr>
              <td style="font-weight: 700; color: #0f766e;">${idx + 1}</td>
              <td>${item.name}</td>
              <td><span class="category-badge">${item.category}</span></td>
              <td class="quantity">${item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    ${nonMedicalItems.length > 0 ? `
    <div class="section">
      <div class="section-header non-medical">
        🔧 الأدوات غير الطبية المطلوبة (${nonMedicalItems.length})
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>اسم العنصر</th>
            <th>التصنيف</th>
            <th>العدد</th>
          </tr>
        </thead>
        <tbody>
          ${nonMedicalItems.map((item, idx) => `
            <tr>
              <td style="font-weight: 700; color: #7c3aed;">${idx + 1}</td>
              <td>${item.name}</td>
              <td><span class="category-badge">${item.category}</span></td>
              <td class="quantity">${item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    <div class="footer">
      <p>تم إنشاء هذا التقرير بواسطة نظام إدارة المراكز الصحية</p>
      <p style="margin-top: 5px;">وزارة الصحة - قطاع الحناكية الصحي</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-نواقص-${selectedCenter}-${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    toast.success('تم تصدير التقرير');
  };

  const printReport = () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء اختيار مركز وإضافة عناصر للتقرير');
      return;
    }

    const printWindow = window.open('', '_blank');
    // نفس HTML الخاص بالتصدير
    const today = new Date().toLocaleDateString('ar-SA', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير نواقص ${selectedCenter}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; padding: 20px; color: #1e293b; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #0f766e; }
    .header h1 { font-size: 1.8rem; color: #0f766e; margin-bottom: 10px; }
    .header .center-name { font-size: 1.3rem; color: #475569; }
    .header .date { color: #64748b; margin-top: 10px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 15px; padding: 10px; background: #f1f5f9; border-radius: 8px; }
    .section-title.medical { color: #0f766e; border-right: 4px solid #0f766e; }
    .section-title.non-medical { color: #7c3aed; border-right: 4px solid #7c3aed; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 12px; text-align: right; border: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 700; }
    .quantity { text-align: center; font-weight: 700; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>تقرير نواقص التجهيزات</h1>
    <div class="center-name">${selectedCenter}</div>
    <div class="date">${today}</div>
  </div>
  
  ${medicalItems.length > 0 ? `
  <div class="section">
    <div class="section-title medical">الأدوات الطبية المطلوبة (${medicalItems.length})</div>
    <table>
      <thead><tr><th>#</th><th>اسم العنصر</th><th>التصنيف</th><th>العدد</th></tr></thead>
      <tbody>
        ${medicalItems.map((item, idx) => `
          <tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.category}</td><td class="quantity">${item.quantity}</td></tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
  
  ${nonMedicalItems.length > 0 ? `
  <div class="section">
    <div class="section-title non-medical">الأدوات غير الطبية المطلوبة (${nonMedicalItems.length})</div>
    <table>
      <thead><tr><th>#</th><th>اسم العنصر</th><th>التصنيف</th><th>العدد</th></tr></thead>
      <tbody>
        ${nonMedicalItems.map((item, idx) => `
          <tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.category}</td><td class="quantity">${item.quantity}</td></tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
  
  <div class="footer">
    <p>وزارة الصحة - قطاع الحناكية الصحي</p>
  </div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const clearSelection = () => {
    setSelectedItems([]);
    setReportTitle('');
    toast.success('تم مسح التحديد');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // رفع الملف أولاً
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // إنشاء قائمة بأسماء الأدوات المتاحة للمطابقة
      const allEquipment = [
        ...medicalEquipmentList.map(e => ({ ...e, type: 'medical' })),
        ...nonMedicalEquipmentList.map(e => ({ ...e, type: 'nonmedical' }))
      ];

      const equipmentNames = allEquipment.map(e => e.name).join('\n');
      const centerNames = healthCenters.map(c => c.اسم_المركز).join('\n');

      // تحليل الملف باستخدام الذكاء الاصطناعي
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل هذا الملف واستخراج النواقص/الاحتياجات من الأدوات الطبية وغير الطبية.

المطلوب:
1. استخرج اسم المركز الصحي إن وُجد في الملف
2. استخرج قائمة النواقص مع الكميات

قائمة المراكز الصحية المتاحة:
${centerNames}

قائمة الأدوات المتاحة للمطابقة:
${equipmentNames}

أرجع النتيجة بالشكل التالي:
- center_name: اسم المركز (من القائمة أعلاه إن وجد، أو فارغ)
- items: قائمة بالنواقص، كل عنصر يحتوي على:
  - name: اسم الأداة (من القائمة أعلاه)
  - quantity: العدد المطلوب (رقم)

ملاحظة: طابق أسماء الأدوات مع القائمة المتاحة قدر الإمكان.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            center_name: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" }
                }
              }
            }
          }
        }
      });

      if (response) {
        // تحديد المركز إن وجد
        if (response.center_name) {
          const matchedCenter = healthCenters.find(c => 
            c.اسم_المركز.includes(response.center_name) || 
            response.center_name.includes(c.اسم_المركز)
          );
          if (matchedCenter) {
            setSelectedCenter(matchedCenter.اسم_المركز);
          }
        }

        // إضافة النواقص
        if (response.items && response.items.length > 0) {
          const newItems = [];
          const addedIds = new Set();
          
          response.items.forEach(item => {
            // البحث عن الأداة في القوائم
            const matchedEquipment = allEquipment.find(e => 
              e.name === item.name || 
              e.name.includes(item.name) || 
              item.name.includes(e.name)
            );

            // تجنب التكرار
            if (matchedEquipment && !addedIds.has(matchedEquipment.id)) {
              addedIds.add(matchedEquipment.id);
              newItems.push({
                ...matchedEquipment,
                quantity: item.quantity || 1
              });
            }
          });

          if (newItems.length > 0) {
            // دمج مع العناصر الموجودة وتجنب التكرار
            setSelectedItems(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const uniqueNewItems = newItems.filter(n => !existingIds.has(n.id));
              return [...prev, ...uniqueNewItems];
            });
            toast.success(`تم استخراج ${newItems.length} عنصر من الملف`);
          } else {
            toast.warning('لم يتم العثور على أدوات مطابقة في الملف');
          }
        } else {
          toast.warning('لم يتم العثور على نواقص في الملف');
        }
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
      toast.error('فشل في تحليل الملف');
    } finally {
      setIsAnalyzing(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-teal-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-xl mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            نواقص المراكز الصحية
          </h1>
          <p className="text-gray-600">
            استخراج وتوثيق نواقص الأدوات الطبية وغير الطبية للمراكز الصحية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* اختيار المركز والقائمة */}
          <div className="lg:col-span-2 space-y-6">
            {/* اختيار المركز */}
            <Card className="border-2 border-teal-200">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  اختر المركز الصحي
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="اختر المركز الصحي..." />
                      </SelectTrigger>
                      <SelectContent>
                        {healthCenters.map(center => (
                          <SelectItem key={center.id} value={center.اسم_المركز}>
                            {center.اسم_المركز}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                      onChange={handleFileUpload}
                      disabled={isAnalyzing}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        asChild
                        variant="outline"
                        disabled={isAnalyzing}
                        className="h-12 cursor-pointer bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-400"
                      >
                        <span>
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                              جاري التحليل...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 ml-2 text-purple-600" />
                              رفع ملف نواقص
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSavedReports(true)}
                      className="h-12"
                    >
                      <List className="w-4 h-4 ml-2" />
                      المحفوظة ({savedReports.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* قائمة الأدوات */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="medical" className="gap-2">
                      <Stethoscope className="w-4 h-4" />
                      أدوات طبية
                      <Badge className="bg-teal-100 text-teal-800">{medicalEquipmentList.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="nonmedical" className="gap-2">
                      <Wrench className="w-4 h-4" />
                      أدوات غير طبية
                      <Badge className="bg-purple-100 text-purple-800">{nonMedicalEquipmentList.length}</Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {/* البحث */}
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="ابحث عن أداة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {/* القائمة */}
                <div className="max-h-[500px] overflow-y-auto space-y-4">
                  {categories.map(category => {
                    const categoryItems = filteredItems.filter(item => item.category === category);
                    if (categoryItems.length === 0) return null;

                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="font-semibold text-gray-700 bg-gray-100 px-3 py-2 rounded-lg sticky top-0 z-10">
                          {category} ({categoryItems.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryItems.map(item => {
                            const selected = isSelected(item.id);
                            return (
                              <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                  selected 
                                    ? 'border-teal-500 bg-teal-50' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => !selected && toggleItem(item)}
                              >
                                <Checkbox
                                  checked={selected}
                                  onCheckedChange={() => toggleItem(item)}
                                />
                                <span className="flex-1 text-sm">{item.name}</span>
                                {selected && (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => updateQuantity(item.id, getSelectedQuantity(item.id) - 1)}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={getSelectedQuantity(item.id)}
                                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                      className="w-14 h-7 text-center text-sm p-1"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => updateQuantity(item.id, getSelectedQuantity(item.id) + 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ملخص التقرير */}
          <div className="space-y-6">
            <Card className="border-2 border-teal-200 sticky top-4">
              <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    ملخص التقرير
                  </span>
                  <Badge className="bg-white/20 text-white">{selectedItems.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* المركز المحدد */}
                {selectedCenter && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">المركز الصحي:</p>
                    <p className="font-semibold">{selectedCenter}</p>
                  </div>
                )}

                {/* عنوان التقرير */}
                <div>
                  <Label>عنوان التقرير (اختياري)</Label>
                  <Input
                    placeholder="مثال: نواقص الربع الأول 2024"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />
                </div>

                {/* إحصائيات */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-teal-50 p-3 rounded-lg text-center">
                    <Stethoscope className="w-6 h-6 mx-auto text-teal-600 mb-1" />
                    <p className="text-2xl font-bold text-teal-700">{medicalItems.length}</p>
                    <p className="text-xs text-teal-600">أداة طبية</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <Wrench className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                    <p className="text-2xl font-bold text-purple-700">{nonMedicalItems.length}</p>
                    <p className="text-xs text-purple-600">أداة غير طبية</p>
                  </div>
                </div>

                {/* قائمة العناصر المحددة */}
                {selectedItems.length > 0 && (
                  <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                    {selectedItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          {item.type === 'medical' ? (
                            <Stethoscope className="w-3 h-3 text-teal-600" />
                          ) : (
                            <Wrench className="w-3 h-3 text-purple-600" />
                          )}
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.quantity}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:bg-red-50"
                            onClick={() => toggleItem(item)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* أزرار الإجراءات */}
                <div className="space-y-2">
                  <Button
                    onClick={saveReport}
                    disabled={!selectedCenter || selectedItems.length === 0}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التقرير
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={exportToExcel}
                      disabled={selectedItems.length === 0}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={exportToHTML}
                      disabled={selectedItems.length === 0}
                      className="text-purple-600 hover:bg-purple-50"
                    >
                      <FileCode className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={printReport}
                      disabled={selectedItems.length === 0}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>

                  {selectedItems.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearSelection}
                      className="w-full text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      مسح التحديد
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* نافذة التقارير المحفوظة */}
      <Dialog open={showSavedReports} onOpenChange={setShowSavedReports}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              التقارير المحفوظة ({savedReports.length})
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {savedReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>لا توجد تقارير محفوظة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedReports.map(report => (
                  <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{report.title}</h4>
                        <p className="text-sm text-gray-500">{report.center}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(report.date).toLocaleDateString('ar-SA')} - {report.items.length} عنصر
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => loadReport(report)}>
                          تحميل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600"
                          onClick={() => deleteReport(report.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}