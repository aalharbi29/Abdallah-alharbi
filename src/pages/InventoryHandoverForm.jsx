import React, { useState, useRef, useEffect } from "react";
import { Printer, Download, Plus, Trash2, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

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

  // Page 1
  const [meetingDay, setMeetingDay] = useState("");
  const [meetingHijriDate, setMeetingHijriDate] = useState("");
  const [department, setDepartment] = useState("");
  const [fromPerson, setFromPerson] = useState("");
  const [toPerson, setToPerson] = useState("");
  const [fromEmpNumber, setFromEmpNumber] = useState("");
  const [toEmpNumber, setToEmpNumber] = useState("");

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

  const handleExportPDF = async () => {
    try {
      toast.loading("جاري تصدير PDF...");
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const noPrintEls = printRef.current.querySelectorAll('.no-print');
      noPrintEls.forEach(el => { el.dataset.prev = el.style.display; el.style.display = 'none'; });
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      noPrintEls.forEach(el => { el.style.display = el.dataset.prev || ''; });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`جرد_عهدة_${department || 'نموذج'}.pdf`);
      toast.dismiss();
      toast.success("تم تصدير PDF بنجاح");
    } catch (e) {
      toast.dismiss();
      toast.error("فشل التصدير");
    }
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
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              <Printer className="w-4 h-4" /> طباعة النموذج
            </button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
              <Download className="w-4 h-4" /> تصدير PDF
            </button>
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
      <div ref={printRef} className="print-area max-w-5xl mx-auto bg-white shadow-xl min-h-[297mm]">

        {/* ===== PAGE 1 ===== */}
        {currentPage === 1 && (
          <div className="p-12">
            {/* Header */}
            <div className="text-center mb-10 pb-6 border-b-2 border-slate-800">
              <p className="text-sm text-slate-600 font-semibold tracking-wide mb-1">المملكة العربية السعودية | وزارة الصحة | تجمع المدينة المنورة الصحي</p>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-6 mb-2">محضر جرد ونقل عهدة</h1>
            </div>

            {/* Preamble */}
            <div className="mb-10 text-[16px] leading-[2.5] text-slate-800">
              <p className="mb-4">
                في يوم{' '}
                <select className={`${inputCls} w-28 text-lg`} value={meetingDay} onChange={e => setMeetingDay(e.target.value)}>
                  <option value="">اليوم</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {' '}الموافق{' '}
                <input className={`${inputCls} w-36 text-lg`} placeholder="التاريخ الهجري" value={meetingHijriDate} onChange={e => setMeetingHijriDate(e.target.value)} />
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
                    <th className="border border-slate-300 px-3 py-3 text-center w-12 font-bold">#</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-bold">الاسم الكامل</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-bold">الرقم الوظيفي</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-bold">جهة العمل</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-bold">الدور الوظيفي</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-bold">الدور في اللجنة</th>
                    <th className="border border-slate-300 px-2 py-3 text-center no-print w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((att, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="border border-slate-300 px-2 py-2 text-center text-slate-500 font-semibold">{i + 1}</td>
                      <td className="border border-slate-300 px-2 py-2">
                        <EmployeeSelect
                          className="w-full focus:outline-none bg-transparent text-center font-semibold text-slate-800"
                          placeholder="الاسم"
                          value={att.name}
                          onChange={(val) => updateAttendee(i, 'name', val)}
                          onSelect={(emp) => handleSelectAttendee(i, emp)}
                        />
                      </td>
                      {['employeeId','workplace','jobRole'].map(field => (
                        <td key={field} className="border border-slate-300 px-2 py-2">
                          <input
                            className="w-full focus:outline-none bg-transparent text-center font-medium text-slate-700"
                            placeholder={field === 'employeeId' ? 'الرقم' : field === 'workplace' ? 'جهة العمل' : 'الدور الوظيفي'}
                            value={att[field]}
                            onChange={e => updateAttendee(i, field, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className="border border-slate-300 px-2 py-2">
                        <input
                          className="w-full focus:outline-none bg-transparent text-center font-bold text-slate-800"
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
            <div className="text-center mb-8 pb-5 border-b-2 border-slate-800">
              <p className="text-sm text-slate-600 font-semibold tracking-wide">المملكة العربية السعودية | وزارة الصحة | تجمع المدينة المنورة الصحي</p>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-4">قائمة الأجهزة المجرودة</h1>
              {department && <p className="text-lg text-slate-700 font-bold mt-2">إدارة / مركز: <span className="text-blue-800">{department}</span></p>}
            </div>

            {/* Equipment Table */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-300 px-2 py-3 text-center w-12 font-bold">#</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-bold w-1/4">الفئة</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-bold w-1/3">نوع الجهاز</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-bold">الشركة المصنعة</th>
                    <th className="border border-slate-300 px-3 py-3 text-center font-bold w-24">الكمية</th>
                    <th className="border border-slate-300 px-2 py-3 text-center no-print w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentItems.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="border border-slate-300 px-2 py-3 text-center text-slate-500 font-bold">{i + 1}</td>
                      <td className="border border-slate-300 px-2 py-3">
                        <select
                          className="w-full focus:outline-none bg-transparent text-center font-bold text-slate-800 appearance-none print:appearance-none cursor-pointer"
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
                            className="w-full focus:outline-none bg-transparent text-center font-semibold text-slate-700 appearance-none print:appearance-none cursor-pointer"
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
                          <input className="w-full focus:outline-none bg-transparent text-center font-semibold text-slate-700" placeholder="نوع الجهاز" value={item.type} onChange={e => updateEquipmentItem(i, 'type', e.target.value)} />
                        )}
                      </td>
                      <td className="border border-slate-300 px-2 py-3">
                        <input className="w-full focus:outline-none bg-transparent text-center font-semibold text-slate-700" placeholder="الشركة" value={item.brand} onChange={e => updateEquipmentItem(i, 'brand', e.target.value)} />
                      </td>
                      <td className="border border-slate-300 px-2 py-3">
                        <input type="number" className="w-full focus:outline-none bg-transparent text-center font-bold text-slate-900" min="1" value={item.quantity} onChange={e => updateEquipmentItem(i, 'quantity', e.target.value)} />
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

            {/* Summary counts */}
            <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg font-bold text-slate-800 mb-10 border border-slate-200">
              <span className="flex items-center gap-2">
                <span className="text-slate-500">إجمالي الأصناف:</span> 
                <span className="text-xl">{equipmentItems.filter(e => e.type).length}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-slate-500">إجمالي الأجهزة والقطع:</span>
                <span className="text-xl text-blue-700">{equipmentItems.reduce((sum, e) => sum + (parseInt(e.quantity) || 0), 0)}</span>
              </span>
            </div>

            {/* Page signatures repeated */}
            <div className="mt-12 pt-8 border-t-2 border-slate-200">
              <h3 className="text-lg font-bold mb-6 text-slate-800">توقيعات أعضاء اللجنة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {committeeMembers.map((member, i) => (
                  <div key={i} className="border border-slate-300 rounded-xl p-4 text-center bg-white shadow-sm">
                    <p className="font-extrabold text-slate-800 text-sm mb-1">{member.title || 'عضو لجنة'}</p>
                    <p className="text-base font-bold text-blue-800 mb-1">{member.name || '................................'}</p>
                    {member.responsibility && <p className="text-xs font-semibold text-slate-500">{member.responsibility}</p>}
                    <div className="border-t border-slate-200 mt-4 pt-3">
                      <p className="text-xs font-semibold text-slate-400 mb-2">التوقيع</p>
                      <div className="h-10"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}