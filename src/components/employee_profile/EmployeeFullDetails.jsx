import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  IdCard, 
  Calendar, 
  Globe, 
  Phone, 
  Mail, 
  Building2, 
  Briefcase, 
  GraduationCap,
  Award,
  TrendingUp,
  FileText,
  ShieldCheck,
  ClipboardCheck
} from "lucide-react";

const FIELD_ICONS = {
  "full_name_arabic": User,
  "رقم_الموظف": IdCard,
  "رقم_الهوية": IdCard,
  "birth_date": Calendar,
  "gender": User,
  "nationality": Globe,
  "phone": Phone,
  "email": Mail,
  "المركز_الصحي": Building2,
  "position": Briefcase,
  "department": Building2,
  "job_category": FileText,
  "qualification": GraduationCap,
  "rank": TrendingUp,
  "sequence": TrendingUp,
  "hire_date": Calendar,
  "contract_type": FileText,
  "special_roles": ShieldCheck,
  "assigned_tasks": ClipboardCheck,
};

const LABELS = {
  "full_name_arabic": "الاسم الكامل",
  "رقم_الموظف": "الرقم الوظيفي",
  "رقم_الهوية": "رقم الهوية",
  "birth_date": "تاريخ الميلاد",
  "gender": "الجنس",
  "nationality": "الجنسية",
  "phone": "رقم الجوال",
  "email": "البريد الإلكتروني",
  "المركز_الصحي": "المركز الصحي",
  "position": "التخصص",
  "department": "القسم",
  "job_category": "ملاك الوظيفة",
  "qualification": "المؤهل",
  "rank": "المرتبة",
  "sequence": "التسلسل",
  "hire_date": "تاريخ التوظيف",
  "contract_type": "نوع العقد",
  "special_roles": "الأدوار الإشرافية والقيادية",
  "assigned_tasks": "المهام المكلف بها",
  "is_externally_assigned": "مكلف خارجياً",
  "external_assignment_center": "المركز المكلف به خارجياً",
  "external_assignment_reason": "سبب التكليف",
  "external_assignment_reason_other": "سبب آخر",
  "external_assignment_indefinite": "حتى إشعار آخر",
  "external_assignment_end_date": "نهاية التكليف الخارجي",
};

const HIDDEN_KEYS = new Set(["id", "created_date", "updated_date", "created_by"]);

const EXTRA_HIDDEN = ["salary", "emergency_contact", "emergency_phone", "notes", "is_sample", "isSample", "تم_انشاؤه_بواسطة", "الراتب", "الاتصال_في_حالة_الطارئ", "ملاحظات"];
EXTRA_HIDDEN.forEach(k => HIDDEN_KEYS.add(k));

const CATEGORY_ORDER = [
  { title: "المعلومات الشخصية", icon: User, color: "blue", fields: ["full_name_arabic", "رقم_الموظف", "رقم_الهوية", "birth_date", "gender", "nationality"] },
  { title: "معلومات التواصل", icon: Phone, color: "green", fields: ["phone", "email"] },
  { title: "معلومات العمل", icon: Briefcase, color: "purple", fields: ["المركز_الصحي", "position", "department", "job_category", "qualification", "rank", "sequence", "hire_date", "contract_type"] },
  { title: "الأدوار والمهام", icon: Award, color: "amber", fields: ["special_roles", "assigned_tasks"] },
  { title: "التكليفات الخارجية", icon: Building2, color: "orange", fields: ["is_externally_assigned", "external_assignment_center", "external_assignment_reason", "external_assignment_reason_other", "external_assignment_indefinite", "external_assignment_end_date"] },
];

function formatValue(key, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value : ["—"];
  if (typeof value === "object") return JSON.stringify(value, null, 0);
  if (key.toLowerCase().includes("date") || key.includes("تاريخ")) {
    try { return new Date(value).toLocaleDateString("ar-SA"); } catch { return value; }
  }
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  return String(value);
}

export default function EmployeeFullDetails({ employee }) {
  if (!employee) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
      {CATEGORY_ORDER.map(category => {
        const categoryFields = category.fields.filter(field => 
          employee.hasOwnProperty(field) && 
          !HIDDEN_KEYS.has(field) &&
          (employee[field] !== null && employee[field] !== undefined && employee[field] !== "")
        );

        if (categoryFields.length === 0) return null;

        const Icon = category.icon;
        const colorClasses = {
          blue: "bg-blue-50 border-blue-200 text-blue-700",
          green: "bg-green-50 border-green-200 text-green-700",
          purple: "bg-purple-50 border-purple-200 text-purple-700",
          amber: "bg-amber-50 border-amber-200 text-amber-700",
          orange: "bg-orange-50 border-orange-200 text-orange-700",
        };

        return (
          <Card key={category.title} className={`border ${colorClasses[category.color]} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
            <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg leading-tight">
                <Icon className="w-5 h-5" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-2.5 md:px-6 pb-3 md:pb-6">
              {categoryFields.map(key => {
                const FieldIcon = FIELD_ICONS[key] || FileText;
                const value = employee[key];

                if (key === "special_roles" || key === "assigned_tasks") {
                  const items = Array.isArray(value) ? value : [];
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <FieldIcon className="w-4 h-4" />
                        {LABELS[key]}
                      </div>
                      <div className="flex flex-wrap gap-2 pr-6">
                        {items.length > 0 ? items.map((item, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm">
                            {item}
                          </Badge>
                        )) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={key} className="flex items-start gap-2 p-2.5 md:p-3 bg-white rounded-lg border min-w-0 overflow-hidden">
                    <FieldIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] md:text-xs text-gray-500">{LABELS[key] || key}</p>
                      <p className="text-sm md:text-base font-medium text-gray-900 break-words">{formatValue(key, value)}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}