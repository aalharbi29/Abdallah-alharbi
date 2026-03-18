import React, { useState, useRef, useEffect } from "react";
import { Printer, Download, Plus, Trash2, Package, Search } from "lucide-react";
import HijriDatePicker from "@/components/ui/HijriDatePicker";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import useLogoSettings from "@/components/settings/useLogoSettings";
import DraggableLogo from "@/components/common/DraggableLogo";
import OfficialFooter from "@/components/common/OfficialFooter";
import { Settings } from "lucide-react";

const EQUIPMENT_CATEGORIES = [
  {
    category: "أجهزة الكمبيوتر",
    items: [
      "حاسب مكتبي (Desktop)",
      "حاسب محمول (Laptop)",
      "جهاز لوحي (Tablet)",
      "شاشة عرض (Monitor)",
      "لوحة مفاتيح وفأرة",
      "طرفية طباعة (Thin Client)",
      "مجموعة حاسب كاملة",
    ]
  },
  {
    category: "الطابعات والماسحات",
    items: [
      "طابعة Canon",
      "طابعة HP",
      "طابعة Epson",
      "طابعة Brother",
      "طابعة Samsung",
      "طابعة Xerox",
      "طابعة متعددة الوظائف",
      "ماسح ضوئي (Scanner)",
      "طابعة شبكية",
    ]
  },
  {
    category: "الأجهزة الطبية",
    items: [
      "جهاز قياس السكر (Glucometer)",
      "جهاز قياس ضغط الدم",
      "جهاز قياس نبض الأكسجين (Pulse Oximeter)",
      "جهاز شفط",
      "جهاز رسم القلب (ECG)",
      "جهاز قياس الحرارة",
      "ميزان طبي",
      "سرير كشف",
      "منظار أذن وحنجرة",
      "سماعة طبية",
      "جهاز تنفس صناعي",
    ]
  },
  {
    category: "ثلاجات التطعيم والحفظ",
    items: [
      "ثلاجة تطعيم بارد (Vaccine Refrigerator)",
      "ثلاجة حفظ أدوية",
      "صندوق ثلج (Ice Box)",
      "حافظة تطعيم محمولة",
      "فريزر طبي",
    ]
  },
  {
    category: "أجهزة الاتصالات والشبكات",
    items: [
      "هاتف أرضي",
      "جهاز فاكس",
      "راديو لاسلكي",
      "جهاز توجيه (Router)",
      "مبدل شبكة (Switch)",
      "نقطة وصول لاسلكية (Access Point)",
      "جهاز UPS (احتياطي طاقة)",
    ]
  },
  {
    category: "أثاث ومعدات مكتبية",
    items: [
      "مكتب",
      "كرسي مكتبي",
      "خزانة ملفات",
      "رف كتب",
      "طاولة اجتماعات",
      "كرسي زوار",
      "خزانة حديدية",
    ]
  },
  {
    category: "أجهزة كهربائية",
    items: [
      "جهاز تكييف",
      "جهاز تدفئة",
      "مبرد مياه",
      "ثلاجة",
      "مكيف متكامل (سبليت)",
      "مروحة",
    ]
  },
  {
    category: "أخرى",
    items: ["جهاز غير مصنف - حدد نوعه"]
  }
];

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function EmployeeSelect({ value, onChange, onSelect, placeholder, className }) {
  const [employees, setEmployees] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchEmps = async () => {
      if (!value || value.length < 2) {
        setEmployees([]);
        return;
      }
      setLoading(true);
      try {
        const res = await base44.entities.Employee.list(undefined, 20);
        // Simple client side filter for demonstration
        const filtered = res.filter(e => e.full_name_arabic && e.full_name_arabic.includes(value));
        setEmployees(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchEmps, 300);
    return () => clearTimeout(timeoutId);
  }, [value]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && employees.length > 0 && (
        <div className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto no-print">
          {employees.map((emp, i) => (
            <div
              key={i}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-0 text-right"
              onClick={() => {
                onSelect(emp);
                setIsOpen(false);
              }}
            >
              <div className="text-sm font-bold">{emp.full_name_arabic}</div>
              <div className="text-xs text-gray-500">{emp["المركز_الصحي"]} - {emp.position}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InventoryHandoverForm() {
  const printRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { logoSettings } = useLogoSettings();

  // Page 1
  const [formTitle, setFormTitle] = useState(localStorage.getItem('inventory_formTitle') || "محضر جرد ونقل عهدة");
  const [customText, setCustomText] = useState(localStorage.getItem('inventory_customText') || "");
  const [meetingDay, setMeetingDay] = useState("");
  const [meetingHijriDate, setMeetingHijriDate] = useState("");
  const [department, setDepartment] = useState("");
  const [fromPerson, setFromPerson] = useState("");
  const [toPerson, setToPerson] = useState("");
  const [fromEmpNumber, setFromEmpNumber] = useState("");
  const [toEmpNumber, setToEmpNumber] = useState("");
  
  const [headerText1, setHeaderText1] = useState(localStorage.getItem('inventory_header1') || "المملكة العربية السعودية | وزارة الصحة | تجمع المدينة المنورة الصحي");

  const handleSaveSettings = () => {
    localStorage.setItem('inventory_formTitle', formTitle);
    localStorage.setItem('inventory_customText', customText);
    localStorage.setItem('inventory_header1', headerText1);
    toast.success("تم حفظ الإعدادات المخصصة كنمط افتراضي");
  };

  const [attendees, setAttendees] = useState([
    { name: "", employeeId: "", workplace: "", jobRole: "", role: "عضو لجنة" }
  ]);

  const [committeeMembers, setCommitteeMembers] = useState([
    { name: "", title: "عضو لجنة", responsibility: "" },
    { name: "", title: "عضو لجنة", responsibility: "" },
  ]);

  // Page 2
  const [equipmentItems, setEquipmentItems] = useState([
    { category: "", type: "", brand: "", quantity: 1 }
  ]);

  const addAttendee = () =>
    setAttendees([...attendees, { name: "", employeeId: "", workplace: "", jobRole: "", role: "عضو لجنة" }]);

  const removeAttendee = (i) => setAttendees(attendees.filter((_, idx) => idx !== i));

  const updateAttendee = (i, field, value) => {
    const updated = [...attendees];
    updated[i][field] = value;
    setAttendees(updated);
  };

  const handleSelectAttendee = (i, emp) => {
    const updated = [...attendees];
    updated[i] = {
      ...updated[i],
      name: emp.full_name_arabic || "",
      employeeId: emp["رقم_الموظف"] || "",
      workplace: emp["المركز_الصحي"] || "",
      jobRole: emp.position || "",
    };
    setAttendees(updated);
  };

  const addCommitteeMember = () =>
    setCommitteeMembers([...committeeMembers, { name: "", title: "عضو لجنة", responsibility: "" }]);

  const removeCommitteeMember = (i) => setCommitteeMembers(committeeMembers.filter((_, idx) => idx !== i));

  const updateCommitteeMember = (i, field, value) => {
    const updated = [...committeeMembers];
    updated[i][field] = value;
    setCommitteeMembers(updated);
  };

  const handleSelectCommittee = (i, emp) => {
    const updated = [...committeeMembers];
    updated[i] = {
      ...updated[i],
      name: emp.full_name_arabic || "",
      jobRole: emp.position || "",
    };
    setCommitteeMembers(updated);
  };

  const addEquipmentItem = () =>
    setEquipmentItems([...equipmentItems, { category: "", type: "", brand: "", quantity: 1 }]);

  const removeEquipmentItem = (i) => setEquipmentItems(equipmentItems.filter((_, idx) => idx !== i));

  const updateEquipmentItem = (i, field, value) => {
    const updated = [...equipmentItems];
    updated[i][field] = value;
    if (field === 'category') updated[i].type = '';
    setEquipmentItems(updated);
  };

  const getItemsForCategory = (cat) => {
    const found = EQUIPMENT_CATEGORIES.find(c => c.category === cat);
    return found ? found.items : [];
  };

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    const dateStr = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Build attendees rows
    let attendeesRows = '';
    attendees.forEach((att, i) => {
      attendeesRows += `<tr>
        <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:500;color:#64748b;">${i+1}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:500;">${att.name || '-'}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:400;">${att.employeeId || '-'}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:400;">${att.workplace || '-'}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:400;">${att.jobRole || '-'}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:500;">${att.role || '-'}</td>
      </tr>`;
    });

    // Build equipment rows
    let equipmentRows = '';
    equipmentItems.forEach((item, i) => {
      equipmentRows += `<tr>
        <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:500;color:#64748b;">${i+1}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:500;">${item.category || '-'}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:400;">${item.type || '-'}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:400;">${item.brand || '-'}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;font-weight:500;">${item.quantity || 1}</td>
      </tr>`;
    });

    // Build committee signatures
    let committeeSigs = committeeMembers.map(m => `
      <div style="border:2px dashed #e2e8f0;border-radius:12px;padding:20px;text-align:center;background:#f8fafc;flex:1;min-width:180px;">
        <p style="font-weight:800;font-size:14px;margin-bottom:6px;">${m.title || 'عضو لجنة'}</p>
        <p style="font-weight:700;font-size:15px;color:#1e40af;margin-bottom:4px;">${m.name || '................................'}</p>
        ${m.responsibility ? `<p style="font-size:12px;color:#64748b;">${m.responsibility}</p>` : ''}
        <div style="border-top:1px solid #cbd5e1;margin-top:20px;padding-top:12px;">
          <p style="font-size:11px;color:#94a3b8;margin-bottom:6px;">التوقيع</p>
          <div style="height:40px;"></div>
        </div>
      </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${formTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Tajawal', Arial, sans-serif; }
    body { background: #fff; color: #1e293b; }
    @page { size: A4; margin: 5mm 15mm 15mm 15mm; }
    .page { max-width: 210mm; margin: 0 auto; padding: 0 10px; }
    .header-banner { text-align: center; border-bottom: 2px solid #0284c7; padding: 0 0 8px; margin-bottom: 15px; overflow: hidden; }
    .header-banner img { max-height: 300px; margin: -80px auto -30px auto; display: block; }
    .title-section { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e293b; padding-bottom: 15px; }
    .title-section p.sub { font-size: 12px; color: #64748b; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px; }
    .title-section h1 { font-size: 24px; font-weight: 800; color: #1e293b; }
    .custom-text { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px 18px; margin-bottom: 18px; font-size: 14px; line-height: 1.9; white-space: pre-wrap; }
    .preamble { font-size: 15px; line-height: 2.4; margin-bottom: 20px; }
    .preamble .highlight { font-weight: 700; color: #1e40af; border-bottom: 1px solid #93c5fd; padding-bottom: 1px; }
    .from-to { display: flex; gap: 30px; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 12px 0; }
    .from-to span { font-weight: 700; color: #475569; }
    .from-to .name { font-weight: 800; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; font-weight: 600; font-size: 13px; }
    td { font-size: 13px; }
    .section-title { font-size: 16px; font-weight: 800; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 25px 0 15px; }
    .sigs-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .handover-row { display: flex; gap: 20px; margin-top: 25px; }
    .handover-box { flex: 1; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; background: #f8fafc; }
    .handover-box .label { font-size: 13px; font-weight: 800; color: #475569; margin-bottom: 8px; }
    .handover-box .name { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .handover-box .emp-num { font-size: 12px; color: #64748b; }
    .footer-banner { text-align: center; margin-top: 40px; padding-top: 15px; border-top: 2px solid #0284c7; }
    .footer-banner p { margin: 3px 0; font-size: 11px; color: #0284c7; }
    .footer-banner .main-text { font-weight: bold; color: #0284c7; font-size: 12px; }
    .footer-banner .date-text { font-size: 9px; color: #94a3b8; margin-top: 8px; }
    .page-break { page-break-before: always; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <!-- PAGE 1 -->
  <div class="page">
    ${logoSettings.show_logo ? `
    <div class="header-banner" style="text-align: center; border-bottom: 2px solid #0284c7; padding: 0 0 8px; margin-bottom: 15px; overflow: hidden;">
      <img src="${logoSettings.logo_url}" alt="تجمع المدينة المنورة الصحي" style="max-height: ${logoSettings.max_height || 300}px; margin-top: ${logoSettings.margin_top || -80}px; margin-bottom: ${logoSettings.margin_bottom || -30}px; display: block; margin-left: auto; margin-right: auto;" />
    </div>
    ` : ''}
    <div class="title-section">
      <p class="sub">المملكة العربية السعودية | وزارة الصحة | تجمع المدينة المنورة الصحي</p>
      <h1>${formTitle}</h1>
    </div>

    ${customText ? `<div class="custom-text">${customText}</div>` : ''}

    <div class="preamble">
      <p>في يوم <span class="highlight">${meetingDay || '............'}</span> الموافق <span class="highlight">${meetingHijriDate || '............'}</span> هـ ،</p>
      <p>اجتمعت لجنة الجرد للقيام بجرد ونقل عهدة إدارة <span class="highlight">${department || '............'}</span> من الأجهزة والمستلزمات.</p>
    </div>

    <div class="from-to">
      <div><span>تسليم من : </span><span class="name">${fromPerson || '............'}</span></div>
      <div><span>تسلُّم إلى : </span><span class="name">${toPerson || '............'}</span></div>
    </div>

    <p class="section-title">وذلك بحضور كل من :</p>
    <table>
      <thead><tr>
        <th>#</th><th>الاسم الكامل</th><th>الرقم الوظيفي</th><th>جهة العمل</th><th>الدور الوظيفي</th><th>الدور في اللجنة</th>
      </tr></thead>
      <tbody>${attendeesRows}</tbody>
    </table>

    <p class="section-title">توقيعات أعضاء لجنة الجرد</p>
    <div class="sigs-row">${committeeSigs}</div>

    <p class="section-title">المُسلّم والمُستلم</p>
    <div class="handover-row">
      <div class="handover-box">
        <p class="label">المُسلّم</p>
        <p class="name">${fromPerson || '................................'}</p>
        <p class="emp-num">${fromEmpNumber || ''}</p>
        <div style="border-top:1px solid #cbd5e1;margin-top:20px;padding-top:12px;"><p style="font-size:11px;color:#94a3b8;">التوقيع</p><div style="height:40px;"></div></div>
      </div>
      <div class="handover-box">
        <p class="label">المُستلم</p>
        <p class="name">${toPerson || '................................'}</p>
        <p class="emp-num">${toEmpNumber || ''}</p>
        <div style="border-top:1px solid #cbd5e1;margin-top:20px;padding-top:12px;"><p style="font-size:11px;color:#94a3b8;">التوقيع</p><div style="height:40px;"></div></div>
      </div>
    </div>

    <div class="footer-banner">
      <p class="main-text">شؤون المراكز الصحية بالحسو - مستشفى الحسو العام</p>
      <p>تجمع المدينة المنورة الصحي - وزارة الصحة</p>
      <p class="date-text">${dateStr}</p>
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page page-break">
    ${logoSettings.show_logo ? `
    <div class="header-banner" style="text-align: center; border-bottom: 2px solid #0284c7; padding: 0 0 8px; margin-bottom: 15px; overflow: hidden;">
      <img src="${logoSettings.logo_url}" alt="تجمع المدينة المنورة الصحي" style="max-height: ${logoSettings.max_height || 300}px; margin-top: ${logoSettings.margin_top || -80}px; margin-bottom: ${logoSettings.margin_bottom || -30}px; display: block; margin-left: auto; margin-right: auto;" />
    </div>
    ` : ''}
    <div class="title-section">
      <p class="sub">المملكة العربية السعودية | وزارة الصحة | تجمع المدينة المنورة الصحي</p>
      <h1>قائمة الأجهزة المجرودة</h1>
      ${department ? `<p style="font-size:16px;color:#475569;font-weight:700;margin-top:6px;">إدارة / مركز: <span style="color:#1e40af;">${department}</span></p>` : ''}
    </div>

    <table>
      <thead><tr>
        <th>#</th><th>الفئة</th><th>نوع الجهاز</th><th>الشركة المصنعة</th><th>الكمية</th>
      </tr></thead>
      <tbody>${equipmentRows}</tbody>
    </table>

    <p class="section-title">توقيعات أعضاء اللجنة</p>
    <div class="sigs-row">${committeeSigs}</div>

    <div class="footer-banner">
      <p class="main-text">شؤون المراكز الصحية بالحسو - مستشفى الحسو العام</p>
      <p>تجمع المدينة المنورة الصحي - وزارة الصحة</p>
      <p class="date-text">${dateStr}</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => setTimeout(() => printWindow.print(), 500);
    }
    setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  };

  const inputCls = "border-b border-gray-400 bg-transparent focus:outline-none focus:border-blue-600 text-center px-1 font-semibold text-gray-800 transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        * { font-family: 'Tajawal', Arial, sans-serif; }
        
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          @page { size: A4; margin: 15mm; }
          
          input, select, textarea {
            border: none !important;
            background: transparent !important;
            color: black !important;
            box-shadow: none !important;
            resize: none !important;
          }
          /* Ensure selects don't show arrows in print */
          select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: none !important;
          }
        }
      `}</style>

      {/* Controls */}
      <div className="no-print max-w-5xl mx-auto mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">نموذج جرد عهدة</h2>
              <p className="text-sm text-slate-500">إدارة وتوثيق العهد والأجهزة</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveSettings} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              <Settings className="w-4 h-4" /> حفظ النمط
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              <Printer className="w-4 h-4" /> طباعة النموذج
            </button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
              <Download className="w-4 h-4" /> تصدير PDF رسمي
            </button>
          </div>
        </div>

        {/* عنوان النموذج ونص إضافي */}
        <div className="space-y-3 mb-4 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">عنوان النموذج</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="محضر جرد ونقل عهدة"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">نص إضافي (اختياري)</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-none"
              rows={3}
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="مثال: نظراً لانتهاء خدمات الموظف فقد تم تشكيل لجنة لجرد العهدة..."
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => setCurrentPage(1)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${currentPage === 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            الصفحة الأولى — التوطئة والحضور
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${currentPage === 2 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            الصفحة الثانية — قائمة الأجهزة المجرودة
          </button>
        </div>
      </div>

      {/* Print Area */}
      <div ref={printRef} className="print-area max-w-5xl mx-auto bg-white shadow-xl min-h-[297mm] relative overflow-hidden">
        <DraggableLogo className="top-8 right-8" />

        {/* ===== PAGE 1 ===== */}
        {currentPage === 1 && (
          <div className="p-12">
            {/* Header */}
            <div className="text-center mb-10 pb-6 border-b-2 border-slate-800 pt-16">
              <input 
                value={headerText1} 
                onChange={(e) => setHeaderText1(e.target.value)} 
                className="w-full text-center bg-transparent border-none focus:ring-0 p-0 m-0 text-sm text-slate-600 font-semibold tracking-wide mb-1" 
              />
              <h1 className="text-3xl font-extrabold text-slate-900 mt-6 mb-2">{formTitle}</h1>
            </div>

            {/* نص إضافي */}
            {customText && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                {customText}
              </div>
            )}

            {/* Preamble */}
            <div className="mb-10 text-[16px] leading-[2.5] text-slate-800">
              <p className="mb-4">
                في يوم{' '}
                <select className={`${inputCls} w-28 text-lg`} value={meetingDay} onChange={e => setMeetingDay(e.target.value)}>
                  <option value="">اليوم</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {' '}الموافق{' '}
                <HijriDatePicker
                  value={meetingHijriDate}
                  onChange={setMeetingHijriDate}
                  placeholder="التاريخ الهجري"
                  className={`${inputCls} w-44 text-lg`}
                />
                {' '}هـ ،
              </p>

              <p className="mb-4">
                اجتمعت لجنة الجرد للقيام بجرد ونقل عهدة إدارة{' '}
                <input className={`${inputCls} w-64 text-lg text-blue-800`} placeholder="اسم الإدارة / المركز" value={department} onChange={e => setDepartment(e.target.value)} />
                {' '}من الأجهزة والمستلزمات.
              </p>

              <div className="flex flex-wrap gap-12 mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">تسليم من :</span>{' '}
                  <EmployeeSelect
                    className={`${inputCls} w-64 text-lg`}
                    placeholder="ابحث عن اسم المُسلِّم..."
                    value={fromPerson}
                    onChange={setFromPerson}
                    onSelect={(emp) => setFromPerson(emp.full_name_arabic || "")}
                  />
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">تسلُّم إلى :</span>{' '}
                  <EmployeeSelect
                    className={`${inputCls} w-64 text-lg`}
                    placeholder="ابحث عن اسم المُستلِّم..."
                    value={toPerson}
                    onChange={setToPerson}
                    onSelect={(emp) => setToPerson(emp.full_name_arabic || "")}
                  />
                </span>
              </div>

              <p className="font-bold text-lg mt-8 text-slate-800 border-b border-slate-200 pb-2 inline-block">وذلك بحضور كل من :</p>
            </div>

            {/* Attendees Table */}
            <div className="mb-10">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-300 px-3 py-3 text-center w-12 font-semibold">#</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-semibold">الاسم الكامل</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-semibold">الرقم الوظيفي</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-semibold">جهة العمل</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-semibold">الدور الوظيفي</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-semibold">الدور في اللجنة</th>
                    <th className="border border-slate-300 px-2 py-3 text-center no-print w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((att, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="border border-slate-300 px-2 py-2 text-center text-slate-500 font-medium">{i + 1}</td>
                      <td className="border border-slate-300 px-2 py-2">
                        <EmployeeSelect
                          className="w-full focus:outline-none bg-transparent text-center font-medium text-slate-800"
                          placeholder="الاسم"
                          value={att.name}
                          onChange={(val) => updateAttendee(i, 'name', val)}
                          onSelect={(emp) => handleSelectAttendee(i, emp)}
                        />
                      </td>
                      {['employeeId','workplace','jobRole'].map(field => (
                        <td key={field} className="border border-slate-300 px-2 py-2">
                          <input
                            className="w-full focus:outline-none bg-transparent text-center font-normal text-slate-700"
                            placeholder={field === 'employeeId' ? 'الرقم' : field === 'workplace' ? 'جهة العمل' : 'الدور الوظيفي'}
                            value={att[field]}
                            onChange={e => updateAttendee(i, field, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className="border border-slate-300 px-2 py-2">
                        <input
                          className="w-full focus:outline-none bg-transparent text-center font-medium text-slate-800"
                          placeholder="عضو لجنة"
                          value={att.role}
                          onChange={e => updateAttendee(i, 'role', e.target.value)}
                        />
                      </td>
                      <td className="border border-slate-300 px-2 py-2 text-center no-print">
                        <button onClick={() => removeAttendee(i)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addAttendee} className="no-print mt-4 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors">
                <Plus className="w-4 h-4" /> إضافة حاضر
              </button>
            </div>

            {/* Committee Signatures */}
            <div className="mt-12">
              <h3 className="text-lg font-bold mb-6 text-slate-800 border-b-2 border-slate-200 pb-2">توقيعات أعضاء لجنة الجرد</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {committeeMembers.map((member, i) => (
                  <div key={i} className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center relative bg-slate-50">
                    <button onClick={() => removeCommitteeMember(i)} className="no-print absolute top-3 left-3 text-slate-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <input
                      className="w-full text-center border-b border-slate-300 focus:outline-none focus:border-blue-500 font-extrabold text-base mb-3 bg-transparent text-slate-800"
                      placeholder="عضو لجنة"
                      value={member.title}
                      onChange={e => updateCommitteeMember(i, 'title', e.target.value)}
                    />
                    
                    <EmployeeSelect
                      className="w-full text-center border-b border-slate-300 focus:outline-none focus:border-blue-500 font-bold text-base mb-3 bg-transparent text-slate-700"
                      placeholder="ابحث عن الاسم..."
                      value={member.name}
                      onChange={(val) => updateCommitteeMember(i, 'name', val)}
                      onSelect={(emp) => handleSelectCommittee(i, emp)}
                    />

                    <input
                      className="w-full text-center border-b border-slate-300 focus:outline-none focus:border-blue-500 text-sm text-slate-500 bg-transparent mb-4"
                      placeholder="المسؤولية (اختياري)"
                      value={member.responsibility}
                      onChange={e => updateCommitteeMember(i, 'responsibility', e.target.value)}
                    />
                    
                    <div className="border-t border-slate-300 mt-6 pt-4">
                      <p className="text-sm font-semibold text-slate-400 mb-2">التوقيع</p>
                      <div className="h-12"></div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addCommitteeMember} className="no-print mt-5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors">
                <Plus className="w-4 h-4" /> إضافة عضو لجنة
              </button>
            </div>

            {/* المُسلّم والمُستلم */}
            <div className="mt-12">
              <h3 className="text-lg font-bold mb-6 text-slate-800 border-b-2 border-slate-200 pb-2">المُسلّم والمُستلم</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 bg-slate-50">
                  <p className="text-sm font-extrabold text-slate-700 mb-3">المُسلّم</p>
                  <input className="w-full text-center border-b border-slate-300 focus:outline-none focus:border-blue-500 font-bold text-base mb-3 bg-transparent text-slate-800" placeholder="الاسم" value={fromPerson} onChange={e => setFromPerson(e.target.value)} />
                  <input className="w-full text-center border-b border-slate-300 focus:outline-none focus:border-blue-500 text-sm text-slate-600 bg-transparent mb-4" placeholder="الرقم الوظيفي" value={fromEmpNumber} onChange={e => setFromEmpNumber(e.target.value)} />
                  <div className="border-t border-slate-300 mt-6 pt-4">
                    <p className="text-sm font-semibold text-slate-400 mb-2">التوقيع</p>
                    <div className="h-12"></div>
                  </div>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 bg-slate-50">
                  <p className="text-sm font-extrabold text-slate-700 mb-3">المُستلم</p>
                  <input className="w-full text-center border-b border-slate-300 focus:outline-none focus:border-blue-500 font-bold text-base mb-3 bg-transparent text-slate-800" placeholder="الاسم" value={toPerson} onChange={e => setToPerson(e.target.value)} />
                  <input className="w-full text-center border-b border-slate-300 focus:outline-none focus:border-blue-500 text-sm text-slate-600 bg-transparent mb-4" placeholder="الرقم الوظيفي" value={toEmpNumber} onChange={e => setToEmpNumber(e.target.value)} />
                  <div className="border-t border-slate-300 mt-6 pt-4">
                    <p className="text-sm font-semibold text-slate-400 mb-2">التوقيع</p>
                    <div className="h-12"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== PAGE 2 ===== */}
        {currentPage === 2 && (
          <div className="p-12">
            {/* Header */}
            <div className="text-center mb-8 pb-5 border-b-2 border-slate-800 pt-16">
              <input 
                value={headerText1} 
                onChange={(e) => setHeaderText1(e.target.value)} 
                className="w-full text-center bg-transparent border-none focus:ring-0 p-0 m-0 text-sm text-slate-600 font-semibold tracking-wide" 
              />
              <h1 className="text-2xl font-extrabold text-slate-900 mt-4">قائمة الأجهزة المجرودة</h1>
              {department && <p className="text-lg text-slate-700 font-bold mt-2">إدارة / مركز: <span className="text-blue-800">{department}</span></p>}
            </div>

            {/* Equipment Table */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-300 px-2 py-3 text-center w-12 font-semibold">#</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-semibold w-1/4">الفئة</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-semibold w-1/3">نوع الجهاز</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-semibold">الشركة المصنعة</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-semibold w-24">الكمية</th>
                    <th className="border border-slate-300 px-2 py-3 text-center no-print w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentItems.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="border border-slate-300 px-2 py-3 text-center text-slate-500 font-medium">{i + 1}</td>
                      <td className="border border-slate-300 px-2 py-3">
                        <select
                          className="w-full focus:outline-none bg-transparent text-center font-medium text-slate-800 appearance-none print:appearance-none cursor-pointer"
                          value={item.category}
                          onChange={e => updateEquipmentItem(i, 'category', e.target.value)}
                        >
                          <option value="">-- الفئة --</option>
                          {EQUIPMENT_CATEGORIES.map(c => (
                            <option key={c.category} value={c.category}>{c.category}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-slate-300 px-2 py-3">
                        {item.category ? (
                          <select
                            className="w-full focus:outline-none bg-transparent text-center font-normal text-slate-700 appearance-none print:appearance-none cursor-pointer"
                            value={item.type}
                            onChange={e => updateEquipmentItem(i, 'type', e.target.value)}
                          >
                            <option value="">-- نوع الجهاز --</option>
                            {getItemsForCategory(item.category).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                            <option value="أخرى - حدد">أخرى</option>
                          </select>
                        ) : (
                          <input className="w-full focus:outline-none bg-transparent text-center font-normal text-slate-700" placeholder="نوع الجهاز" value={item.type} onChange={e => updateEquipmentItem(i, 'type', e.target.value)} />
                        )}
                      </td>
                      <td className="border border-slate-300 px-2 py-3">
                        <input className="w-full focus:outline-none bg-transparent text-center font-normal text-slate-700" placeholder="الشركة" value={item.brand} onChange={e => updateEquipmentItem(i, 'brand', e.target.value)} />
                      </td>
                      <td className="border border-slate-300 px-2 py-3">
                        <input type="number" className="w-full focus:outline-none bg-transparent text-center font-medium text-slate-900" min="1" value={item.quantity} onChange={e => updateEquipmentItem(i, 'quantity', e.target.value)} />
                      </td>
                      <td className="border border-slate-300 px-2 py-3 text-center no-print">
                        <button onClick={() => removeEquipmentItem(i)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addEquipmentItem} className="no-print mt-4 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors">
                <Plus className="w-4 h-4" /> إضافة جهاز
              </button>
            </div>


            {/* Page signatures repeated */}
            <div className="mt-12 pt-8 border-t-2 border-slate-200">
              <h3 className="text-lg font-bold mb-6 text-slate-800">توقيعات أعضاء اللجنة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {committeeMembers.slice(0,3).map((member, i) => (
                  <div key={i} className="border border-slate-300 rounded-xl p-4 text-center bg-white shadow-sm">
                    <p className="font-extrabold text-slate-800 text-sm mb-1">{member.title || 'عضو لجنة'}</p>
                    <p className="text-base font-bold text-blue-800 mb-1">{member.name || '................................'}</p>
                    {member.jobRole && <p className="text-xs font-semibold text-slate-600">{member.jobRole}</p>}
                    {member.responsibility && <p className="text-xs font-semibold text-slate-500">{member.responsibility}</p>}
                    <div className="border-t border-slate-200 mt-4 pt-3">
                      <p className="text-xs font-semibold text-slate-400 mb-2">التوقيع</p>
                      <div className="h-10"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <OfficialFooter />
          </div>
        )}
      </div>
    </div>
  );
}