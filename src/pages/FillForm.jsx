import React, { useState, useEffect } from "react";
import { FormTemplate, FormSubmission } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Save, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function FillFormPage() {
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get("templateId");
    if (templateId) {
      loadTemplate(templateId);
    }
  }, []);

  const loadTemplate = async (id) => {
    setIsLoading(true);
    const templateData = await FormTemplate.get(id);
    setTemplate(templateData);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!template || !employeeName || !content) {
      alert("الرجاء تعبئة جميع الحقول");
      return;
    }
    
    await FormSubmission.create({
      form_template_title: template.title,
      submitted_by_employee_name: employeeName,
      submission_date: new Date().toISOString(),
      content: content,
      status: "جديد"
    });
    
    navigate(createPageUrl("Forms"));
  };
  
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <p>جاري تحميل النموذج...</p>;
  if (!template) return <p>لم يتم العثور على النموذج المطلوب.</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none;
            }
          }
        `}
      </style>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8 no-print">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(createPageUrl("Forms"))} size="icon">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{template.title}</h1>
              <p className="text-gray-600 mt-1">{template.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 ml-2" /> طباعة</Button>
            <Button onClick={handleSave}><Save className="w-4 h-4 ml-2" /> حفظ</Button>
          </div>
        </div>

        <div className="print-area">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{template.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="mb-8 no-print">
                <Label htmlFor="employeeName">اسم مقدم الطلب</Label>
                <Input
                  id="employeeName"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="ادخل اسمك الكامل"
                />
              </div>
              <div className="prose max-w-none">
                <ReactQuill theme="snow" value={content} onChange={setContent} style={{ height: '400px' }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}