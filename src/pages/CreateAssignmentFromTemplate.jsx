import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowRight, Save } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function CreateAssignmentFromTemplate() {
    const navigate = useNavigate();
    const location = useLocation();
    const [templates, setTemplates] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [elements, setElements] = useState([]);
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [temps, assigns] = await Promise.all([
                base44.entities.CustomFormTemplate.list(),
                base44.entities.Assignment.list()
            ]);
            setTemplates(temps || []);
            setAssignments(assigns || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const handleTemplateSelect = (templateId) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplate(template);
            setElements(template.elements || []);
            setBackgroundUrl(template.background_url || '');
        }
    };

    const handleAssignmentSelect = (assignmentId) => {
        const assignment = assignments.find(a => a.id === assignmentId);
        if (assignment) {
            setSelectedAssignment(assignment);
            
            // ربط البيانات بالعناصر
            setElements(prev => prev.map(el => {
                if (el.dataField && assignment[el.dataField]) {
                    return { ...el, content: String(assignment[el.dataField]) };
                }
                return el;
            }));
        }
    };

    const handleSavePDF = async () => {
        if (!selectedAssignment) {
            alert('يرجى اختيار تكليف أولاً');
            return;
        }

        setIsLoading(true);
        try {
            const container = document.getElementById('assignment-preview');
            const canvas = await window.html2canvas(container, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], `قرار_تكليف_${selectedAssignment.employee_name}.pdf`, { type: 'application/pdf' });
            
            const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfFile });
            
            // حفظ في مستندات الموظف
            if (selectedAssignment.employee_record_id) {
                await base44.entities.EmployeeDocument.create({
                    employee_id: selectedAssignment.employee_record_id,
                    employee_name: selectedAssignment.employee_name,
                    document_title: `قرار تكليف - ${selectedAssignment.assigned_to_health_center}`,
                    document_type: 'official',
                    file_url: file_url,
                    file_name: `قرار_تكليف_${selectedAssignment.employee_name}.pdf`
                });
            }
            
            // تحديث التكليف
            await base44.entities.Assignment.update(selectedAssignment.id, {
                notes: (selectedAssignment.notes || '') + `\n\n📄 قرار تكليف تفاعلي: ${file_url} - ${new Date().toLocaleDateString('ar-SA')}`
            });
            
            alert('✅ تم حفظ قرار التكليف بنجاح في ملف الموظف');
            
        } catch (error) {
            console.error('Save failed:', error);
            alert('حدث خطأ في الحفظ: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderElement = (el) => {
        if (el.type === 'text') {
            return (
                <div 
                    className="p-2 w-full h-full whitespace-pre-wrap break-words"
                    style={{ 
                        fontSize: el.style.fontSize,
                        color: el.style.color
                    }}
                >
                    {el.content}
                </div>
            );
        }
        
        if (el.type === 'image' && el.content) {
            return <img src={el.content} alt="custom" className="w-full h-full object-contain" />;
        }
        
        if (el.type === 'table' && el.data?.rows) {
            return (
                <table className="w-full h-full border-collapse" style={{ 
                    borderWidth: `${el.data.borderWidth || 1}px`, 
                    borderColor: el.data.borderColor || '#000000',
                    tableLayout: 'fixed'
                }}>
                    <colgroup>
                        {el.data.rows[0].map((_, colIndex) => (
                            <col key={colIndex} style={{ width: `${el.data.columnWidths?.[colIndex] || 150}px` }} />
                        ))}
                    </colgroup>
                    <thead style={{ backgroundColor: el.data.headerBgColor || '#f0f0f0' }}>
                        <tr>
                            {el.data.rows[0].map((cell, cellIndex) => {
                                if (cell.hidden) return null;
                                return (
                                    <th 
                                        key={cellIndex}
                                        style={{ 
                                            borderWidth: `${el.data.borderWidth || 1}px`, 
                                            borderColor: el.data.borderColor || '#000000',
                                            textAlign: cell.align || 'right',
                                            fontSize: cell.fontSize || '14px',
                                            color: cell.color || '#000000',
                                            backgroundColor: cell.bgColor || (el.data.headerBgColor || '#f0f0f0'),
                                            padding: '4px'
                                        }}
                                        colSpan={cell.colspan || 1}
                                        rowSpan={cell.rowspan || 1}
                                    >
                                        {cell.content}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {el.data.rows.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => {
                                    if (cell.hidden) return null;
                                    return (
                                        <td 
                                            key={cellIndex}
                                            style={{ 
                                                borderWidth: `${el.data.borderWidth || 1}px`, 
                                                borderColor: el.data.borderColor || '#000000',
                                                textAlign: cell.align || 'right',
                                                fontSize: cell.fontSize || '14px',
                                                color: cell.color || '#000000',
                                                backgroundColor: cell.bgColor || ((rowIndex + 1) % 2 === 0 ? el.data.evenRowBgColor : el.data.oddRowBgColor),
                                                padding: '4px'
                                            }}
                                            colSpan={cell.colspan || 1}
                                            rowSpan={cell.rowspan || 1}
                                        >
                                            {cell.content}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6" dir="rtl">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
            
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => navigate(createPageUrl('Assignments'))}>
                            <ArrowRight className="w-4 h-4 ml-2" />
                            رجوع
                        </Button>
                        <h1 className="text-2xl font-bold">إنشاء قرار تكليف من قالب</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => window.print()} variant="outline">
                            طباعة
                        </Button>
                        <Button onClick={handleSavePDF} disabled={isLoading || !selectedAssignment}>
                            <Save className="w-4 h-4 ml-2" />
                            {isLoading ? 'جاري الحفظ...' : 'حفظ في ملف الموظف'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow">
                            <Label>اختر قالب نموذج</Label>
                            <Select value={selectedTemplate?.id || ''} onValueChange={handleTemplateSelect}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="اختر قالب..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(template => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedTemplate && (
                            <div className="bg-white rounded-lg p-4 shadow">
                                <Label>اختر تكليف</Label>
                                <Select value={selectedAssignment?.id || ''} onValueChange={handleAssignmentSelect}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="اختر تكليف..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assignments.map(assign => (
                                            <SelectItem key={assign.id} value={assign.id}>
                                                {assign.employee_name} - {assign.assigned_to_health_center}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-3">
                        <div 
                            id="assignment-preview"
                            className="bg-white shadow-2xl mx-auto print-area"
                            style={{
                                width: '210mm',
                                minHeight: '297mm',
                                backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                position: 'relative'
                            }}
                        >
                            <style>{`
                                @media print {
                                    .print-hide { display: none !important; }
                                    #assignment-preview {
                                        width: 210mm !important;
                                        height: 297mm !important;
                                        margin: 0 !important;
                                        padding: 0 !important;
                                        box-shadow: none !important;
                                    }
                                }
                            `}</style>
                            {elements.map(el => (
                                <div
                                    key={el.id}
                                    style={{
                                        position: 'absolute',
                                        left: `${el.position.x}px`,
                                        top: `${el.position.y}px`,
                                        width: `${el.size.width}px`,
                                        height: `${el.size.height}px`,
                                        ...el.style
                                    }}
                                >
                                    {renderElement(el)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}