import React, { useState, useRef } from "react";
import { Printer, Download, Plus, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

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
      "جهاز سماع طبي (سماعة طبية)",
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
    items: ["جهاز غير مصنف - حدد في الملاحظات"]
  }
];

const EQUIPMENT_CONDITIONS = ["ممتاز", "جيد", "مقبول", "بحاجة صيانة", "معطل", "مفقود"];
const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function InventoryHandoverForm() {
  const printRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Page 1
  const [meetingDay, setMeetingDay] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingHijriDate, setMeetingHijriDate] = useState("");
  const [department, setDepartment] = useState("");
  const [fromPerson, setFromPerson] = useState("");
  const [toPerson, setToPerson] = useState("");
  const [generalNotes2, setGeneralNotes2] = useState("");

  const [attendees, setAttendees] = useState([
    { name: "", employeeId: "", civilId: "", workplace: "", jobNature: "", role: "" }
  ]);

  const [committeeMembers, setCommitteeMembers] = useState([
    { name: "", title: "رئيس اللجنة", responsibility: "الإشراف العام على عملية الجرد" },
    { name: "", title: "عضو", responsibility: "جرد الأجهزة الطبية" },
    { name: "", title: "عضو", responsibility: "جرد الأجهزة المكتبية والتقنية" },
  ]);

  // Page 2
  const [equipmentItems, setEquipmentItems] = useState([
    { category: "", type: "", brand: "", model: "", serialNumber: "", quantity: 1, condition: "جيد", size: "", notes: "" }
  ]);

  const addAttendee = () =>
    setAttendees([...attendees, { name: "", employeeId: "", civilId: "", workplace: "", jobNature: "", role: "" }]);

  const removeAttendee = (i) => setAttendees(attendees.filter((_, idx) => idx !== i));

  const updateAttendee = (i, field, value) => {
    const updated = [...attendees];
    updated[i][field] = value;
    setAttendees(updated);
  };

  const addCommitteeMember = () =>
    setCommitteeMembers([...committeeMembers, { name: "", title: "عضو", responsibility: "" }]);

  const removeCommitteeMember = (i) => setCommitteeMembers(committeeMembers.filter((_, idx) => idx !== i));

  const updateCommitteeMember = (i, field, value) => {
    const updated = [...committeeMembers];
    updated[i][field] = value;
    setCommitteeMembers(updated);
  };

  const addEquipmentItem = () =>
    setEquipmentItems([...equipmentItems, { category: "", type: "", brand: "", model: "", serialNumber: "", quantity: 1, condition: "جيد", size: "", notes: "" }]);

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

  const inputCls = "border-b border-gray-400 bg-transparent focus:outline-none focus:border-green-600 text-center px-1";

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        * { font-family: 'Cairo', Arial, sans-serif; }
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; left: 0; top: 0; width: 210mm; margin: 0; padding: 0; }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>

      {/* Controls */}
      <div className="no-print max-w-5xl mx-auto mb-4 bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">نموذج جرد عهدة</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
              <Printer className="w-4 h-4" /> طباعة
            </button>
            <button onClick={handleExportPDF} className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
        <div className="flex gap-2 border-t pt-3">
          <button
            onClick={() => setCurrentPage(1)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${currentPage === 1 ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            الصفحة الأولى — التوطئة والحضور
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${currentPage === 2 ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            الصفحة الثانية — قائمة الأجهزة
          </button>
        </div>
      </div>

      {/* Print Area */}
      <div ref={printRef} className="print-area max-w-5xl mx-auto">

        {/* ===== PAGE 1 ===== */}
        {currentPage === 1 && (
          <div className="bg-white shadow-lg p-10 min-h-[297mm]">
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
              <p className="text-sm text-gray-500">المملكة العربية السعودية &nbsp;|&nbsp; وزارة الصحة &nbsp;|&nbsp; تجمع المدينة المنورة الصحي</p>
              <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-1">محضر جرد ونقل عهدة</h1>
            </div>

            {/* Preamble */}
            <div className="mb-6 text-[15px] leading-[2.2]">
              <p className="mb-3">
                في يوم{' '}
                <select className={`${inputCls} w-24`} value={meetingDay} onChange={e => setMeetingDay(e.target.value)}>
                  <option value="">اليوم</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {' '}الموافق{' '}
                <input className={`${inputCls} w-32`} placeholder="التاريخ الميلادي" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} />
                {' '}م / {' '}
                <input className={`${inputCls} w-32`} placeholder="التاريخ الهجري" value={meetingHijriDate} onChange={e => setMeetingHijriDate(e.target.value)} />
                {' '}هـ ،
              </p>

              <p className="mb-3">
                اجتمعت لجنة الجرد للقيام بجرد ونقل عهدة إدارة{' '}
                <input className={`${inputCls} w-52 font-bold`} placeholder="اسم الإدارة / المركز" value={department} onChange={e => setDepartment(e.target.value)} />
                {' '}من الأجهزة الطبية وغير الطبية والمستلزمات والتجهيزات المختلفة.
              </p>

              <div className="flex flex-wrap gap-8 mb-3">
                <span>
                  <span className="font-bold">تسليم من :</span>{' '}
                  <input className={`${inputCls} w-44`} placeholder="اسم المُسلِّم" value={fromPerson} onChange={e => setFromPerson(e.target.value)} />
                </span>
                <span>
                  <span className="font-bold">تسلُّم إلى :</span>{' '}
                  <input className={`${inputCls} w-44`} placeholder="اسم المُستلِّم" value={toPerson} onChange={e => setToPerson(e.target.value)} />
                </span>
              </div>

              <p className="font-bold text-[16px]">وذلك بحضور كل من :</p>
            </div>

            {/* Attendees Table */}
            <div className="mb-8">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-2 py-2 text-center">#</th>
                    <th className="border border-gray-400 px-2 py-2 text-center">الاسم الكامل</th>
                    <th className="border border-gray-400 px-2 py-2 text-center">الرقم الوظيفي</th>
                    <th className="border border-gray-400 px-2 py-2 text-center">السجل المدني</th>
                    <th className="border border-gray-400 px-2 py-2 text-center">جهة العمل</th>
                    <th className="border border-gray-400 px-2 py-2 text-center">طبيعة العمل</th>
                    <th className="border border-gray-400 px-2 py-2 text-center">الدور في اللجنة</th>
                    <th className="border border-gray-400 px-1 py-2 text-center no-print w-8">×</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((att, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border border-gray-400 px-1 py-1 text-center text-gray-500 text-xs">{i + 1}</td>
                      {['name','employeeId','civilId','workplace','jobNature','role'].map(field => (
                        <td key={field} className="border border-gray-400 px-1 py-1">
                          <input
                            className="w-full focus:outline-none bg-transparent text-xs text-center"
                            placeholder={field === 'name' ? 'الاسم' : field === 'employeeId' ? 'الرقم' : field === 'civilId' ? 'السجل' : field === 'workplace' ? 'جهة العمل' : field === 'jobNature' ? 'طبيعة العمل' : 'رئيس/عضو'}
                            value={att[field]}
                            onChange={e => updateAttendee(i, field, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className="border border-gray-400 px-1 py-1 text-center no-print">
                        <button onClick={() => removeAttendee(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addAttendee} className="no-print mt-2 text-sm text-green-700 hover:text-green-900 flex items-center gap-1 font-semibold">
                <Plus className="w-4 h-4" /> إضافة حاضر
              </button>
            </div>

            {/* Committee Signatures */}
            <div className="mt-6">
              <h3 className="text-[15px] font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">توقيعات أعضاء لجنة الجرد</h3>
              <div className="grid grid-cols-3 gap-4">
                {committeeMembers.map((member, i) => (
                  <div key={i} className="border border-gray-300 rounded-lg p-4 text-center relative">
                    <button onClick={() => removeCommitteeMember(i)} className="no-print absolute top-1 left-1 text-red-300 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <input
                      className="no-print w-full text-center border-b border-gray-300 focus:outline-none focus:border-green-500 font-bold text-sm mb-2 bg-transparent"
                      placeholder="المسمى (رئيس/عضو...)"
                      value={member.title}
                      onChange={e => updateCommitteeMember(i, 'title', e.target.value)}
                    />
                    <input
                      className="no-print w-full text-center border-b border-gray-300 focus:outline-none focus:border-green-500 text-sm mb-2 bg-transparent"
                      placeholder="الاسم"
                      value={member.name}
                      onChange={e => updateCommitteeMember(i, 'name', e.target.value)}
                    />
                    <input
                      className="no-print w-full text-center border-b border-gray-300 focus:outline-none focus:border-green-500 text-xs text-gray-500 bg-transparent"
                      placeholder="المسؤولية"
                      value={member.responsibility}
                      onChange={e => updateCommitteeMember(i, 'responsibility', e.target.value)}
                    />
                    {/* Print display */}
                    <div className="hidden" style={{display:'none'}}>
                      <p className="font-bold text-sm">{member.title}</p>
                      <p className="text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.responsibility}</p>
                    </div>
                    <div className="border-t border-gray-300 mt-6 pt-3">
                      <p className="text-xs text-gray-400">التوقيع</p>
                      <div className="h-10"></div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addCommitteeMember} className="no-print mt-3 text-sm text-green-700 hover:text-green-900 flex items-center gap-1 font-semibold">
                <Plus className="w-4 h-4" /> إضافة عضو لجنة
              </button>
            </div>
          </div>
        )}

        {/* ===== PAGE 2 ===== */}
        {currentPage === 2 && (
          <div className="bg-white shadow-lg p-8 min-h-[297mm]">
            {/* Header */}
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
              <p className="text-sm text-gray-500">المملكة العربية السعودية &nbsp;|&nbsp; وزارة الصحة &nbsp;|&nbsp; تجمع المدينة المنورة الصحي</p>
              <h1 className="text-xl font-bold text-gray-800 mt-2">قائمة الأجهزة والتجهيزات المجرودة</h1>
              {department && <p className="text-sm text-gray-500 mt-1">إدارة / مركز: <strong>{department}</strong></p>}
            </div>

            {/* Equipment Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-gray-100 text-[11px]">
                    <th className="border border-gray-400 px-1 py-2 text-center w-7">#</th>
                    <th className="border border-gray-400 px-1 py-2 text-center">الفئة</th>
                    <th className="border border-gray-400 px-1 py-2 text-center">نوع الجهاز</th>
                    <th className="border border-gray-400 px-1 py-2 text-center">الماركة</th>
                    <th className="border border-gray-400 px-1 py-2 text-center">الموديل</th>
                    <th className="border border-gray-400 px-1 py-2 text-center">الرقم التسلسلي</th>
                    <th className="border border-gray-400 px-1 py-2 text-center w-10">الكمية</th>
                    <th className="border border-gray-400 px-1 py-2 text-center">الحالة</th>
                    <th className="border border-gray-400 px-1 py-2 text-center">مواصفات إضافية</th>
                    <th className="border border-gray-400 px-1 py-2 text-center">ملاحظات</th>
                    <th className="border border-gray-400 px-1 py-2 text-center no-print w-7">×</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentItems.map((item, i) => (
                    <tr key={i} className="hover:bg-blue-50">
                      <td className="border border-gray-400 px-1 py-1 text-center text-gray-400">{i + 1}</td>
                      <td className="border border-gray-400 px-0.5 py-0.5">
                        <select
                          className="w-full focus:outline-none bg-transparent text-[11px] py-1"
                          value={item.category}
                          onChange={e => updateEquipmentItem(i, 'category', e.target.value)}
                        >
                          <option value="">-- الفئة --</option>
                          {EQUIPMENT_CATEGORIES.map(c => (
                            <option key={c.category} value={c.category}>{c.category}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-400 px-0.5 py-0.5">
                        {item.category ? (
                          <select
                            className="w-full focus:outline-none bg-transparent text-[11px] py-1"
                            value={item.type}
                            onChange={e => updateEquipmentItem(i, 'type', e.target.value)}
                          >
                            <option value="">-- نوع الجهاز --</option>
                            {getItemsForCategory(item.category).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                            <option value="أخرى - حدد في الملاحظات">أخرى</option>
                          </select>
                        ) : (
                          <input className="w-full focus:outline-none bg-transparent text-[11px] text-center" placeholder="نوع الجهاز" value={item.type} onChange={e => updateEquipmentItem(i, 'type', e.target.value)} />
                        )}
                      </td>
                      <td className="border border-gray-400 px-0.5 py-0.5">
                        <input className="w-full focus:outline-none bg-transparent text-[11px] text-center" placeholder="الماركة" value={item.brand} onChange={e => updateEquipmentItem(i, 'brand', e.target.value)} />
                      </td>
                      <td className="border border-gray-400 px-0.5 py-0.5">
                        <input className="w-full focus:outline-none bg-transparent text-[11px] text-center" placeholder="الموديل" value={item.model} onChange={e => updateEquipmentItem(i, 'model', e.target.value)} />
                      </td>
                      <td className="border border-gray-400 px-0.5 py-0.5">
                        <input className="w-full focus:outline-none bg-transparent text-[11px] text-center" placeholder="الرقم التسلسلي" value={item.serialNumber} onChange={e => updateEquipmentItem(i, 'serialNumber', e.target.value)} />
                      </td>
                      <td className="border border-gray-400 px-0.5 py-0.5">
                        <input type="number" className="w-full focus:outline-none bg-transparent text-[11px] text-center" min="1" value={item.quantity} onChange={e => updateEquipmentItem(i, 'quantity', e.target.value)} />
                      </td>
                      <td className="border border-gray-400 px-0.5 py-0.5">
                        <select className="w-full focus:outline-none bg-transparent text-[11px]" value={item.condition} onChange={e => updateEquipmentItem(i, 'condition', e.target.value)}>
                          {EQUIPMENT_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="border border-gray-400 px-0.5 py-0.5">
                        <input className="w-full focus:outline-none bg-transparent text-[11px] text-center" placeholder="الحجم/السعة..." value={item.size} onChange={e => updateEquipmentItem(i, 'size', e.target.value)} />
                      </td>
                      <td className="border border-gray-400 px-0.5 py-0.5">
                        <input className="w-full focus:outline-none bg-transparent text-[11px] text-center" placeholder="ملاحظات" value={item.notes} onChange={e => updateEquipmentItem(i, 'notes', e.target.value)} />
                      </td>
                      <td className="border border-gray-400 px-1 py-0.5 text-center no-print">
                        <button onClick={() => removeEquipmentItem(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={addEquipmentItem} className="no-print mt-3 text-sm text-green-700 hover:text-green-900 flex items-center gap-1 font-semibold">
              <Plus className="w-4 h-4" /> إضافة جهاز
            </button>

            {/* Summary counts */}
            <div className="mt-4 text-sm text-gray-600 font-semibold">
              إجمالي الأصناف: {equipmentItems.filter(e => e.type).length} &nbsp;|&nbsp;
              إجمالي الأجهزة: {equipmentItems.reduce((sum, e) => sum + (parseInt(e.quantity) || 0), 0)}
            </div>

            {/* General notes */}
            <div className="mt-6 border-t pt-4">
              <p className="font-bold text-sm mb-2">ملاحظات عامة :</p>
              <textarea
                className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-green-500 min-h-[60px]"
                placeholder="أي ملاحظات إضافية..."
                value={generalNotes2}
                onChange={e => setGeneralNotes2(e.target.value)}
              />
            </div>

            {/* Page signatures repeated */}
            <div className="mt-8 border-t pt-4">
              <p className="font-bold text-sm mb-3">توقيعات أعضاء اللجنة</p>
              <div className="grid grid-cols-3 gap-4">
                {committeeMembers.map((member, i) => (
                  <div key={i} className="border border-gray-200 rounded p-3 text-center">
                    <p className="font-bold text-xs">{member.title || 'العضو'}</p>
                    <p className="text-xs text-gray-600">{member.name || '...'}</p>
                    <p className="text-[10px] text-gray-400">{member.responsibility}</p>
                    <div className="border-t border-gray-200 mt-4 pt-2">
                      <p className="text-[10px] text-gray-400">التوقيع</p>
                      <div className="h-8"></div>
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