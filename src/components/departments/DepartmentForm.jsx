import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Save, Building2 } from "lucide-react";

export default function DepartmentForm({ department, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(department || {
    name_arabic: "",
    name_english: "",
    manager: "",
    location: "",
    budget: "",
    description: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onCancel} size="icon">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {department ? "تعديل بيانات القسم" : "إضافة قسم جديد"}
            </h1>
            <p className="text-gray-600 mt-1">املأ بيانات القسم</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              بيانات القسم
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name_arabic">اسم القسم بالعربية *</Label>
                  <Input
                    id="name_arabic"
                    value={formData.name_arabic}
                    onChange={(e) => handleChange("name_arabic", e.target.value)}
                    required
                    placeholder="مثل: إدارة الموارد البشرية"
                  />
                </div>
                <div>
                  <Label htmlFor="name_english">اسم القسم بالإنجليزية</Label>
                  <Input
                    id="name_english"
                    value={formData.name_english}
                    onChange={(e) => handleChange("name_english", e.target.value)}
                    placeholder="Human Resources"
                  />
                </div>
                <div>
                  <Label htmlFor="manager">مدير القسم</Label>
                  <Input
                    id="manager"
                    value={formData.manager}
                    onChange={(e) => handleChange("manager", e.target.value)}
                    placeholder="اسم مدير القسم"
                  />
                </div>
                <div>
                  <Label htmlFor="location">موقع القسم</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="الطابق الثالث - مبنى الإدارة"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">الميزانية (ريال)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    placeholder="1000000"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">وصف القسم</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  placeholder="وصف مختصر عن القسم ومهامه..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                  إلغاء
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ البيانات
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}