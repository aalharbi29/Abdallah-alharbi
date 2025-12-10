import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Employee } from '@/entities/Employee';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Printer, Save, ArrowRight, Settings2, Plus, GripVertical, Trash2, Eye, Download, AlignCenter, Type } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EmployeeSelector from '@/components/health_centers/EmployeeSelector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ParagraphBlock,
  GenericGridBlock,
  LayoutRowBlock,
  SignatureGridBlock,
  CenterTextBlock
} from "@/components/clearance_form/FormBlocks";
import { FreeTextBlock } from "@/components/clearance_form/FreeTextBlock";

// Re-defined Initial Blocks using Granular Components
const initialBlocks = [
  {
    id: 'header_layout',
    type: 'layout_row',
    data: {
      rightContent: 'إدارة الموارد البشرية بالرعاية الأولية\nتجمع المدينة المنورة الصحي',
      centerContent: 'براءة ذمة',
      imageUrl: 'https://cdn.worldvectorlogo.com/logos/ministry-of-health-saudi-arabia-1.svg'
    }
  },
  {
    id: 'employee_data_grid',
    type: 'generic_grid',
    data: {
      columns: [
        { label: "الاســــــــــــم", name: "employee_name", width: "20%" },
        { label: "الوظيفة", name: "position", width: "15%" },
        { label: "رقم الوظيفة", name: "job_number", width: "15%" },
        { label: "الجنسية", name: "nationality", width: "15%" },
        { label: "رقم الهوية", name: "national_id", width: "15%" },
        { label: "جهة العمل", name: "workplace", width: "20%" }
      ]
    }
  },
  {
    id: 'intro_paragraph',
    type: 'paragraph',
    data: {
      items: [
        { id: 1, type: 'text', value: 'تشهد الموارد البشرية بالرعاية الاولية بتجمع المدينة المنورة الصحي بأن الموضح اسمه وبياناته أعلاه برئ الذمة من الناحية الإدارية والمالية وقد سلم جميع ما بعهدته وذلك نظراً' },
      ]
    }
  },
  {
    id: 'decision_details',
    type: 'paragraph',
    data: {
      items: [
        { id: 1, type: 'text', value: 'لقرار' },
        { id: 2, type: 'field', key: 'decision_reason', width: '150px', placeholder: 'سبب القرار' },
        { id: 3, type: 'text', value: 'ورقم' },
        { id: 4, type: 'field', key: 'decision_number', width: '100px', placeholder: 'الرقم' },
        { id: 5, type: 'text', value: 'وتاريخ' },
        { id: 6, type: 'field', key: 'decision_date', width: '80px', placeholder: 'DD/MM' },
        { id: 7, type: 'text', value: '/' },
        { id: 8, type: 'field', key: 'decision_year', width: '60px', placeholder: '1445' },
        { id: 9, type: 'text', value: 'هـ .' },
      ]
    }
  },
  {
    id: 'signatures_section',
    type: 'signature_grid',
    data: {
      title: 'وعلى ذلك جرى التوقيع :',
      rows: [
        { role: 'الرئيس المباشر', nameField: 'direct_manager_name' },
        { role: 'امين العهده في المركز / ادارة', nameField: 'custody_keeper_name' },
        { role: 'محاسب الرواتب بالموارد البشرية بالرعاية الاولية', nameField: 'payroll_accountant_name' }
      ]
    }
  },
  {
    id: 'footer_manager',
    type: 'center_text',
    data: {
      text: 'أ.تركي بن عبدالرحمن الغامدي',
      subText: 'مدير إدارة الموارد البشرية بالرعاية الأولية'
    }
  }
];

export default function FillClearanceForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [blocks, setBlocks] = useState(initialBlocks);
  
  const [formData, setFormData] = useState({
    employee_name: '',
    position: '',
    job_number: '',
    nationality: '',
    national_id: '',
    workplace: '',
    decision_reason: '',
    decision_number: '',
    decision_date: '',
    decision_year: '1445',
    direct_manager_name: '',
    custody_keeper_name: '',
    payroll_accountant_name: '',
  });
  
  const [employees, setEmployees] = useState([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Load employees for import
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await Employee.list();
        setEmployees(data || []);
      } catch (e) {
        console.error("Failed to load employees", e);
      }
    };
    loadEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImportEmployee = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employee_name: employee.full_name_arabic,
        position: employee.position,
        job_number: employee.رقم_الموظف, // Using the arabic key from entity
        nationality: employee.nationality,
        national_id: employee.رقم_الهوية, // Using the arabic key from entity
        workplace: employee.المركز_الصحي, // Using the arabic key from entity
      }));
      setImportDialogOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee_name || !formData.national_id) {
      alert('يرجى تعبئة البيانات الأساسية للموظف');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.ClearanceForm.create({
        ...formData,
        status: 'submitted',
        // Optionally save the layout/structure here if needed for future
        // layout: JSON.stringify(blocks) 
      });
      alert('تم حفظ النموذج بنجاح');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drag and Drop Handlers
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const newBlocks = Array.from(blocks);
    const [reorderedItem] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, reorderedItem);
    
    setBlocks(newBlocks);
  };

  const updateBlock = (id, newData) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data: newData } : b));
  };

  const deleteBlock = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الجزء؟')) {
      setBlocks(prev => prev.filter(b => b.id !== id));
    }
  };

  const addBlock = (type, index) => {
    const newBlock = {
      id: `block_${Date.now()}`,
      type,
      data: getDefaultDataForType(type)
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const getDefaultDataForType = (type) => {
    switch(type) {
      case 'paragraph': return { items: [{ id: 1, type: 'text', value: 'نص جديد...' }] };
      case 'layout_row': return { rightContent: 'نص أيمن', centerContent: 'عنوان', imageUrl: '' };
      case 'generic_grid': return { columns: [{ label: 'عمود 1', name: 'col1' }] };
      case 'signature_grid': return { title: 'التوقيعات', rows: [{ role: 'دور جديد', nameField: `sig_${Date.now()}` }] };
      case 'center_text': return { text: 'نص مركزي', subText: '' };
      case 'free_text': return { text: 'اكتب نصك الحر هنا...', fontSize: 16, align: 'right', bold: false, italic: false, underline: false };
      default: return {};
    }
  };

  const renderBlock = (block, index) => {
    const commonProps = {
      block,
      isEditMode,
      formData,
      onInputChange: handleInputChange,
      onUpdateBlock: updateBlock
    };

    let Component;
    switch(block.type) {
      case 'layout_row': Component = LayoutRowBlock; break;
      case 'generic_grid': Component = GenericGridBlock; break;
      case 'paragraph': Component = ParagraphBlock; break;
      case 'signature_grid': Component = SignatureGridBlock; break;
      case 'center_text': Component = CenterTextBlock; break;
      case 'free_text': Component = FreeTextBlock; break;
      default: return null;
    }

    return (
      <Draggable key={block.id} draggableId={block.id} index={index} isDragDisabled={!isEditMode}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`relative group transition-all ${
              isEditMode 
                ? 'mb-6 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 bg-white' 
                : ''
            } ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-400 z-50' : ''}`}
          >
            {isEditMode && (
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div 
                  {...provided.dragHandleProps}
                  className="p-2 bg-gray-100 rounded-full shadow cursor-grab hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                  title="سحب"
                >
                  <GripVertical className="w-4 h-4" />
                </div>
                <button 
                  onClick={() => deleteBlock(block.id)}
                  className="p-2 bg-red-50 rounded-full shadow cursor-pointer hover:bg-red-100 text-red-500"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* The Content */}
            <Component {...commonProps} />

            {/* Add Button Between Blocks */}
            {isEditMode && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="rounded-full h-9 px-4 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة عنصر
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addBlock('free_text', index)}
                        className="flex-col h-auto py-3"
                      >
                        <Type className="w-5 h-5 mb-1" />
                        <span className="text-xs">نص حر</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addBlock('paragraph', index)}
                        className="flex-col h-auto py-3"
                      >
                        <Plus className="w-5 h-5 mb-1" />
                        <span className="text-xs">فقرة</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addBlock('generic_grid', index)}
                        className="flex-col h-auto py-3"
                      >
                        <GripVertical className="w-5 h-5 mb-1" />
                        <span className="text-xs">جدول</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addBlock('center_text', index)}
                        className="flex-col h-auto py-3"
                      >
                        <AlignCenter className="w-5 h-5 mb-1" />
                        <span className="text-xs">نص مركزي</span>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4 lg:p-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto print:max-w-none">
        {/* Actions Bar - Hidden in Print */}
        <div className="mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 print:hidden bg-white p-3 md:p-4 rounded-lg shadow-sm border">
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => navigate(-1)} className="gap-2 touch-target flex-1 md:flex-initial">
              <ArrowRight className="w-4 h-4" />
              <span className="text-xs md:text-sm">عودة</span>
            </Button>
            <Button 
              variant={isEditMode ? "default" : "outline"}
              onClick={() => setIsEditMode(!isEditMode)} 
              className={`gap-2 touch-target flex-1 md:flex-initial ${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {isEditMode ? <Eye className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
              <span className="text-xs md:text-sm">{isEditMode ? 'معاينة' : 'تعديل'}</span>
            </Button>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 touch-target flex-1 md:flex-initial">
                  <Download className="w-4 h-4" />
                  <span className="text-xs md:text-sm">استيراد</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>استيراد بيانات موظف</DialogTitle>
                  <DialogDescription>
                    اختر موظفاً لتعبئة بياناته في النموذج تلقائياً
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <EmployeeSelector 
                    employees={employees} 
                    onSelect={handleImportEmployee}
                    placeholder="ابحث عن موظف..." 
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handlePrint} className="gap-2 touch-target flex-1 md:flex-initial">
              <Printer className="w-4 h-4" />
              <span className="text-xs md:text-sm">طباعة</span>
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || isEditMode} className="gap-2 bg-green-600 hover:bg-green-700 touch-target flex-1 md:flex-initial">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="text-xs md:text-sm">حفظ</span>
            </Button>
          </div>
        </div>

        {/* Warning for Edit Mode */}
        {isEditMode && (
          <div className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 text-blue-900 px-3 md:px-4 py-3 md:py-4 rounded-lg flex items-start gap-3 print:hidden shadow-md">
            <Settings2 className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm md:text-base font-bold mb-1">
                وضع التحرير المتقدم نشط
              </p>
              <ul className="text-xs md:text-sm space-y-1 text-blue-700">
                <li>• اسحب الأقسام لتغيير ترتيبها</li>
                <li>• انقر على أيقونات التنسيق لتعديل الخطوط والأحجام</li>
                <li>• استخدم زر "إضافة عنصر" بين الأقسام لإدراج نصوص وجداول جديدة</li>
                <li>• يمكنك تعديل أي نص مباشرة في النموذج</li>
              </ul>
            </div>
          </div>
        )}

        {/* Form Container */}
        <Card 
          className={`bg-white p-8 md:p-12 shadow-lg print:shadow-none print:border-0 print:p-0 transition-all ${isEditMode ? 'ring-4 ring-blue-50/50 scale-[0.99]' : ''} relative`} 
          id="clearance-form"
          style={{
            backgroundImage: `url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/c0d0cb403_.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #clearance-form, #clearance-form * { visibility: visible; }
              #clearance-form { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                margin: 0; 
                padding: 20mm; 
                transform: none !important;
                background-image: url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/c0d0cb403_.png) !important;
                background-size: cover !important;
                background-position: center !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print { display: none !important; }
              /* Make inputs look like text in print */
              input, textarea { border: none !important; background: transparent !important; resize: none; }
            }
          `}</style>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="form-blocks">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {blocks.map((block, index) => renderBlock(block, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

        </Card>
      </div>
    </div>
  );
}