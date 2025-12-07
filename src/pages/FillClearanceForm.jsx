import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Employee } from '@/entities/Employee';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Printer, Save, ArrowRight, Settings2, Plus, GripVertical, Trash2, Eye, Download } from "lucide-react";
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

// Re-defined Initial Blocks using Granular Components
const initialBlocks = [
  {
    id: 'header_layout',
    type: 'layout_row',
    data: {
      rightContent: 'إدارة الموارد البشرية بالرعاية الأولية بتجمع المدينة المنورة',
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
        { id: 1, type: 'text', value: 'تشهد الموارد البشرية بالرعاية الاولية بتجمع المدينة المنورة بأن الموضح اسمه وبياناته أعلاه برئ الذمة من الناحية الإدارية والمالية وقد سلم جميع ما بعهدته وذلك نظراً .' },
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
        { id: 9, type: 'text', value: 'هـ' },
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
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => addBlock('paragraph', index)}
                  className="rounded-full h-8 w-8 p-0 shadow-md bg-blue-50 hover:bg-blue-100 text-blue-600"
                  title="إضافة نص"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => addBlock('generic_grid', index)}
                  className="rounded-full h-8 w-8 p-0 shadow-md bg-green-50 hover:bg-green-100 text-green-600"
                  title="إضافة جدول"
                >
                  <GripVertical className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto print:max-w-none">
        {/* Actions Bar - Hidden in Print */}
        <div className="mb-6 flex justify-between items-center print:hidden bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
              <ArrowRight className="w-4 h-4" />
              عودة
            </Button>
            <Button 
              variant={isEditMode ? "default" : "outline"}
              onClick={() => setIsEditMode(!isEditMode)} 
              className={`gap-2 ${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {isEditMode ? <Eye className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
              {isEditMode ? 'معاينة النموذج' : 'تعديل النموذج'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  استيراد بيانات
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
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || isEditMode} className="gap-2 bg-green-600 hover:bg-green-700">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ
            </Button>
          </div>
        </div>

        {/* Warning for Edit Mode */}
        {isEditMode && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-center gap-2 print:hidden">
            <Settings2 className="w-5 h-5" />
            <p className="text-sm font-medium">
              أنت الآن في وضع التعديل. يمكنك سحب الأقسام لتغيير ترتيبها، الضغط على النصوص لتعديلها، أو إضافة وحذف الأجزاء.
            </p>
          </div>
        )}

        {/* Form Container */}
        <Card className={`bg-white p-8 md:p-12 shadow-lg print:shadow-none print:border-0 print:p-0 transition-all ${isEditMode ? 'ring-4 ring-blue-50/50 scale-[0.99]' : ''}`} id="clearance-form">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #clearance-form, #clearance-form * { visibility: visible; }
              #clearance-form { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20mm; transform: none !important; }
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