import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Save, Image as ImageIcon, Type, Table, Settings, Upload, Download, Printer, Minus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TableCellEditor from '../components/form_editor/TableCellEditor';

const ElementSidebar = ({ element, onUpdate, onRemove, dataSource, employees, selectedEmployee, assignments, selectedAssignment }) => {
    if (!element) return <div className="p-4 text-sm text-gray-500">حدد عنصراً لتعديله.</div>;

    const handleStyleChange = (prop, value) => {
        onUpdate(element.id, { style: { ...element.style, [prop]: value } });
    };

    const handleDataChange = (prop, value) => {
        onUpdate(element.id, { data: { ...element.data, [prop]: value } });
    };

    const handleContentChange = (e) => {
        onUpdate(element.id, { content: e.target.value });
    };

    const handleDataFieldChange = (field) => {
        onUpdate(element.id, { dataField: field });
        // تطبيق القيمة مباشرة
        if (dataSource === 'employee' && selectedEmployee && field) {
            const value = selectedEmployee[field] || '';
            onUpdate(element.id, { content: value });
        } else if (dataSource === 'assignment' && element.assignmentData && field) {
            const value = element.assignmentData[field] || '';
            onUpdate(element.id, { content: value });
        }
    };

    // حقول البيانات المتاحة
    const getDataFields = () => {
        if (dataSource === 'employee') {
            return [
                { value: 'full_name_arabic', label: 'اسم الموظف' },
                { value: 'رقم_الموظف', label: 'رقم الموظف' },
                { value: 'position', label: 'المسمى الوظيفي' },
                { value: 'المركز_الصحي', label: 'المركز الصحي' },
                { value: 'رقم_الهوية', label: 'رقم الهوية' },
                { value: 'phone', label: 'رقم الهاتف' },
                { value: 'email', label: 'البريد الإلكتروني' }
            ];
        } else if (dataSource === 'assignment') {
            return [
                { value: 'employee_name', label: 'اسم الموظف' },
                { value: 'employee_position', label: 'المسمى الوظيفي' },
                { value: 'from_health_center', label: 'جهة العمل' },
                { value: 'assigned_to_health_center', label: 'جهة التكليف' },
                { value: 'start_date', label: 'تاريخ البداية' },
                { value: 'end_date', label: 'تاريخ النهاية' },
                { value: 'duration_days', label: 'عدد الأيام' },
                { value: 'assignment_type', label: 'نوع التكليف' }
            ];
        }
        return [];
    };

    const addRow = () => {
        const colCount = element.data.rows[0].length;
        const newRow = Array(colCount).fill().map(() => ({ 
            content: '', 
            colspan: 1, 
            rowspan: 1, 
            align: 'right', 
            fontSize: '14px', 
            color: '#000000' 
        }));
        handleDataChange('rows', [...element.data.rows, newRow]);
    };
    
    const removeRow = () => {
        if (element.data.rows.length > 1) {
            const newRows = [...element.data.rows];
            newRows.pop();
            handleDataChange('rows', newRows);
        }
    };
    
    const addCol = () => {
        const newRows = element.data.rows.map(row => [...row, { 
            content: '', 
            colspan: 1, 
            rowspan: 1, 
            align: 'right', 
            fontSize: '14px', 
            color: '#000000' 
        }]);
        const newWidths = [...(element.data.columnWidths || []), 150];
        onUpdate(element.id, { data: { ...element.data, rows: newRows, columnWidths: newWidths } });
    };
    
    const removeCol = () => {
        if (element.data.rows[0].length > 1) {
            const newRows = element.data.rows.map(row => {
                const newRow = [...row];
                newRow.pop();
                return newRow;
            });
            const newWidths = [...(element.data.columnWidths || [])];
            newWidths.pop();
            onUpdate(element.id, { data: { ...element.data, rows: newRows, columnWidths: newWidths } });
        }
    };
    
    return (
        <div className="p-4 space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">خصائص العنصر</h3>
            
            {/* ربط البيانات */}
            {element.type === 'text' && dataSource !== 'manual' && (
                <div className="space-y-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <Label className="text-blue-900 font-semibold">ربط بحقل بيانات</Label>
                    <Select value={element.dataField || ''} onValueChange={handleDataFieldChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="اختر حقل..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={null}>بدون ربط</SelectItem>
                            {getDataFields().map(field => (
                                <SelectItem key={field.value} value={field.value}>
                                    {field.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {element.dataField && (
                        <p className="text-xs text-blue-700">✓ مرتبط بـ: {getDataFields().find(f => f.value === element.dataField)?.label}</p>
                    )}
                </div>
            )}
            
            {element.type === 'text' && (
                <div className="space-y-2">
                    <Label>النص</Label>
                    <Textarea value={element.content} onChange={handleContentChange} rows={4}/>
                    <Label>حجم الخط (px)</Label>
                    <Input type="number" value={parseInt(element.style.fontSize) || 16} onChange={e => handleStyleChange('fontSize', `${e.target.value}px`)} />
                    <Label>لون الخط</Label>
                    <Input type="color" value={element.style.color || '#000000'} onChange={e => handleStyleChange('color', e.target.value)} />
                </div>
            )}
            {element.type === 'image' && (
                <div className="space-y-2">
                    <Label>رابط الصورة</Label>
                    <Input value={element.content} onChange={handleContentChange} placeholder="https://example.com/image.png"/>
                </div>
            )}
            {element.type === 'table' && (
                <div className="space-y-4">
                    <div>
                        <Label>التحكم في الجدول</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={addRow}><Plus className="w-3 h-3 ml-1" /> إضافة صف</Button>
                            <Button size="sm" variant="outline" onClick={removeRow}><Minus className="w-3 h-3 ml-1" /> إزالة صف</Button>
                            <Button size="sm" variant="outline" onClick={addCol}><Plus className="w-3 h-3 ml-1" /> إضافة عمود</Button>
                            <Button size="sm" variant="outline" onClick={removeCol}><Minus className="w-3 h-3 ml-1" /> إزالة عمود</Button>
                        </div>
                    </div>
                     <div>
                        <Label>تصميم الجدول</Label>
                        <div className="mt-2 space-y-2">
                            <Label className="text-xs">سمك الحدود (px)</Label>
                            <Input type="number" value={element.data.borderWidth || 1} onChange={e => handleDataChange('borderWidth', e.target.value)} />
                            <Label className="text-xs">لون الحدود</Label>
                            <Input type="color" value={element.data.borderColor || '#000000'} onChange={e => handleDataChange('borderColor', e.target.value)} />
                            <Label className="text-xs">لون خلفية الرأس</Label>
                            <Input type="color" value={element.data.headerBgColor || '#f0f0f0'} onChange={e => handleDataChange('headerBgColor', e.target.value)} />
                            <Label className="text-xs">لون الصفوف الزوجية</Label>
                            <Input type="color" value={element.data.evenRowBgColor || '#ffffff'} onChange={e => handleDataChange('evenRowBgColor', e.target.value)} />
                            <Label className="text-xs">لون الصفوف الفردية</Label>
                            <Input type="color" value={element.data.oddRowBgColor || '#f9f9f9'} onChange={e => handleDataChange('oddRowBgColor', e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="border-t pt-3">
                        <Label className="font-semibold">💡 نصائح استخدام الجدول</Label>
                        <ul className="text-xs text-gray-600 space-y-1 mt-2 mr-4">
                            <li>• انقر على خلية لتحريرها</li>
                            <li>• انقر مرتين لتنسيق الخلية</li>
                            <li>• اسحب حواف الأعمدة لتغيير العرض</li>
                        </ul>
                    </div>
                </div>
            )}
            <Button variant="destructive" size="sm" onClick={() => onRemove(element.id)} className="w-full">
                <Trash2 className="w-4 h-4 ml-2" />
                حذف العنصر
            </Button>
        </div>
    );
};

const ResizableDiv = ({ el, onUpdate, isSelected, onMouseDown, onResizeStart, children }) => {
    const resizeHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    return (
        <div
            onMouseDown={onMouseDown}
            onClick={(e) => e.stopPropagation()}
            style={{
                position: 'absolute',
                left: `${el.position.x}px`,
                top: `${el.position.y}px`,
                width: `${el.size.width}px`,
                height: `${el.size.height}px`,
                border: `2px dashed ${isSelected ? '#007bff' : 'transparent'}`,
                cursor: 'move',
                userSelect: 'none',
                ...el.style
            }}
        >
            <div className="w-full h-full overflow-hidden">
                {children}
            </div>
            {isSelected && resizeHandles.map(handle => (
                <div
                    key={handle}
                    onMouseDown={(e) => onResizeStart(e, handle)}
                    style={{
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#007bff',
                        border: '1px solid white',
                        borderRadius: '50%',
                        top: handle.includes('bottom') ? 'auto' : '-5px',
                        bottom: handle.includes('bottom') ? '-5px' : 'auto',
                        left: handle.includes('right') ? 'auto' : '-5px',
                        right: handle.includes('right') ? '-5px' : 'auto',
                        cursor: `${handle.startsWith('top') ? 'n' : 's'}${handle.endsWith('left') ? 'w' : 'e'}-resize`
                    }}
                />
            ))}
        </div>
    );
};


export default function FormEditor() {
    const [elements, setElements] = useState([]);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [backgroundType, setBackgroundType] = useState('url'); // 'url', 'upload', 'pdf'
    const [templateName, setTemplateName] = useState('نموذج جديد');
    const [dataSource, setDataSource] = useState('manual'); // 'manual', 'employee', 'assignment'
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [editingCell, setEditingCell] = useState(null); // { elementId, rowIndex, cellIndex, cell }
    const [resizingColumn, setResizingColumn] = useState(null); // { elementId, columnIndex, startX, startWidth }
    const pageRef = useRef(null);
    const fileInputRef = useRef(null);
    const [dragInfo, setDragInfo] = useState(null);
    const [resizeInfo, setResizeInfo] = useState(null);

    const updateElement = useCallback((id, props) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...props } : el));
    }, []);

    const addElement = (type) => {
        if (!pageRef.current) return;
        const pageBounds = pageRef.current.getBoundingClientRect();
        
        let newElement = {
            id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            content: type === 'text' ? 'نص جديد' : '',
            position: { x: pageBounds.width / 2 - 100, y: pageBounds.height / 2 - 50 },
            size: { width: 200, height: 100 },
            style: { fontSize: '16px', color: '#000000' },
            dataField: null // للربط بحقل بيانات
        };

        if (type === 'table') {
            newElement = {
                ...newElement,
                content: '',
                data: {
                    rows: [
                        [
                            { content: 'رأس 1', colspan: 1, rowspan: 1, align: 'center', fontSize: '14px', color: '#000000' }, 
                            { content: 'رأس 2', colspan: 1, rowspan: 1, align: 'center', fontSize: '14px', color: '#000000' }
                        ],
                        [
                            { content: 'خلية 1', colspan: 1, rowspan: 1, align: 'right', fontSize: '14px', color: '#000000' }, 
                            { content: 'خلية 2', colspan: 1, rowspan: 1, align: 'right', fontSize: '14px', color: '#000000' }
                        ]
                    ],
                    columnWidths: [150, 150],
                    borderWidth: 1,
                    borderColor: '#000000',
                    headerBgColor: '#f0f0f0',
                    evenRowBgColor: '#ffffff',
                    oddRowBgColor: '#f9f9f9',
                }
            };
        }

        setElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    };

    // تحميل البيانات
    useEffect(() => {
        const loadData = async () => {
            try {
                const [emps, assigns, templates] = await Promise.all([
                    base44.entities.Employee.list(),
                    base44.entities.Assignment.list(),
                    base44.entities.CustomFormTemplate.list()
                ]);
                setEmployees(emps || []);
                setAssignments(assigns || []);
                setSavedTemplates(templates || []);
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };
        loadData();
    }, []);

    // تحميل خلفية من ملف
    const handleBackgroundUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const isPDF = file.type === 'application/pdf';
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setBackgroundUrl(file_url);
            setBackgroundType('upload');
            
            if (isPDF) {
                alert('✅ تم رفع PDF كخلفية. يمكنك الآن إضافة نصوص وجداول فوقه واستدعاء بيانات الموظفين.');
            }
        } catch (error) {
            alert('فشل رفع الملف: ' + error.message);
        }
    };

    // طباعة أو تصدير PDF
    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        if (!pageRef.current) return;
        
        try {
            // استخدام html2canvas و jsPDF للتصدير
            const canvas = await window.html2canvas(pageRef.current, {
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
            
            // حفظ كملف أو رفع للتخزين
            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], `${templateName}.pdf`, { type: 'application/pdf' });
            
            // رفع إلى التخزين
            const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfFile });
            
            // حفظ في سجل الموظف أو التكليف
            if (dataSource === 'employee' && selectedEmployee) {
                await base44.entities.EmployeeDocument.create({
                    employee_id: selectedEmployee.id,
                    employee_name: selectedEmployee.full_name_arabic,
                    document_title: templateName,
                    document_type: 'official',
                    file_url: file_url,
                    file_name: `${templateName}.pdf`
                });
                alert('✅ تم حفظ PDF في ملف الموظف');
            } else if (dataSource === 'assignment' && selectedAssignment) {
                // حفظ في ملاحظات التكليف
                await base44.entities.Assignment.update(selectedAssignment.id, {
                    notes: (selectedAssignment.notes || '') + `\n\nتم إنشاء ${templateName}: ${file_url}`
                });
                alert('✅ تم حفظ PDF وربطه بالتكليف');
            } else {
                // تنزيل مباشر
                pdf.save(`${templateName}.pdf`);
            }
            
        } catch (error) {
            console.error('Export failed:', error);
            alert('فشل التصدير. جرب الطباعة العادية.');
            window.print();
        }
    };

    const removeElement = (id) => {
        setElements(prev => prev.filter(el => el.id !== id));
        if (selectedElementId === id) {
            setSelectedElementId(null);
        }
    };

    const handleSave = async () => {
        if (!templateName.trim()) {
            alert('يرجى إدخال اسم للقالب.');
            return;
        }
        
        try {
            await base44.entities.CustomFormTemplate.create({
                name: templateName,
                elements: elements,
                background_url: backgroundUrl,
                data_source: dataSource,
                description: `قالب تفاعلي - ${elements.length} عنصر`
            });
            
            alert('✅ تم حفظ القالب بنجاح! يمكنك الآن استخدامه من صفحة "إنشاء قرار من قالب"');
            
            // تحديث القائمة
            const templates = await base44.entities.CustomFormTemplate.list();
            setSavedTemplates(templates || []);
        } catch (error) {
            console.error("Failed to save template:", error);
            alert('فشل حفظ القالب: ' + error.message);
        }
    };

    const handleElementMouseDown = (e, element) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedElementId(element.id);

        if (!pageRef.current) return;
        const canvasRect = pageRef.current.getBoundingClientRect();

        setDragInfo({
            id: element.id,
            offsetX: e.clientX - canvasRect.left - element.position.x,
            offsetY: e.clientY - canvasRect.top - element.position.y
        });
    };

     const handleResizeStart = (e, element, handle) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedElementId(element.id);

        setResizeInfo({
            id: element.id,
            handle: handle,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: element.size.width,
            startHeight: element.size.height,
            startLeft: element.position.x,
            startTop: element.position.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!pageRef.current) return;
            const canvasRect = pageRef.current.getBoundingClientRect();

            if (dragInfo) {
                let newX = e.clientX - canvasRect.left - dragInfo.offsetX;
                let newY = e.clientY - canvasRect.top - dragInfo.offsetY;
                const el = elements.find(el => el.id === dragInfo.id);

                newX = Math.max(0, Math.min(newX, canvasRect.width - el.size.width));
                newY = Math.max(0, Math.min(newY, canvasRect.height - el.size.height));
                
                updateElement(dragInfo.id, { position: { x: newX, y: newY } });
            }

            if (resizeInfo) {
                let { startX, startY, startWidth, startHeight, startLeft, startTop, handle } = resizeInfo;
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (handle.includes('right')) {
                    newWidth = Math.max(50, startWidth + dx);
                }
                if (handle.includes('left')) {
                    newWidth = Math.max(50, startWidth - dx);
                    newLeft = startLeft + dx;
                }
                if (handle.includes('bottom')) {
                    newHeight = Math.max(50, startHeight + dy);
                }
                if (handle.includes('top')) {
                    newHeight = Math.max(50, startHeight - dy);
                    newTop = startTop + dy;
                }

                updateElement(resizeInfo.id, { size: { width: newWidth, height: newHeight }, position: { x: newLeft, y: newTop } });
            }

            if (resizingColumn) {
                const dx = e.clientX - resizingColumn.startX;
                const newWidth = Math.max(50, resizingColumn.startWidth + dx);
                handleColumnResize(resizingColumn.elementId, resizingColumn.columnIndex, newWidth);
            }
        };

        const handleMouseUp = () => {
            setDragInfo(null);
            setResizeInfo(null);
            setResizingColumn(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragInfo, resizeInfo, resizingColumn, updateElement, elements]);

    const handleTableCellChange = (elementId, rowIndex, cellIndex, newContent) => {
        const newElements = elements.map(el => {
            if (el.id === elementId) {
                const newRows = [...el.data.rows];
                if (newRows[rowIndex] && typeof newRows[rowIndex][cellIndex] !== 'undefined') {
                    newRows[rowIndex][cellIndex] = { ...newRows[rowIndex][cellIndex], content: newContent };
                }
                return { ...el, data: { ...el.data, rows: newRows } };
            }
            return el;
        });
        setElements(newElements);
    };

    const handleCellUpdate = (elementId, rowIndex, cellIndex, updatedCell) => {
        setElements(prev => prev.map(el => {
            if (el.id === elementId) {
                const newRows = [...el.data.rows];
                newRows[rowIndex][cellIndex] = updatedCell;
                return { ...el, data: { ...el.data, rows: newRows } };
            }
            return el;
        }));
    };

    const handleColumnResize = (elementId, columnIndex, newWidth) => {
        setElements(prev => prev.map(el => {
            if (el.id === elementId) {
                const newWidths = [...(el.data.columnWidths || [])];
                newWidths[columnIndex] = newWidth;
                return { ...el, data: { ...el.data, columnWidths: newWidths } };
            }
            return el;
        }));
    };

    const handleColumnResizeStart = (e, elementId, columnIndex) => {
        e.preventDefault();
        e.stopPropagation();
        const el = elements.find(e => e.id === elementId);
        const currentWidth = el.data.columnWidths?.[columnIndex] || 150;
        setResizingColumn({
            elementId,
            columnIndex,
            startX: e.clientX,
            startWidth: currentWidth
        });
    };

    useEffect(() => {
        const handlePaste = (event) => {
            const items = event.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setBackgroundUrl(e.target.result);
                    };
                    reader.readAsDataURL(blob);
                    event.preventDefault(); // Prevent default paste behavior
                }
            }
        };

        // Attach listener to the parent of pageRef, which is the main editor canvas area
        const editorArea = pageRef.current?.parentElement;
        if (editorArea) {
            editorArea.addEventListener('paste', handlePaste);
        }

        return () => {
            if (editorArea) {
                editorArea.removeEventListener('paste', handlePaste);
            }
        };
    }, []);

    const selectedElement = elements.find(el => el.id === selectedElementId);

    return (
        <div className="flex h-screen bg-gray-200" dir="rtl">
            <style>{`
                @media print {
                    .print-hide { display: none !important; }
                    body { background: white !important; }
                    .print-area { 
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                }
            `}</style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
            <div className="w-80 bg-white shadow-lg flex flex-col h-full print-hide">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">محرر النماذج</h2>
                </div>
                <div className="p-4 border-b space-y-2">
                     <h3 className="font-semibold text-lg">إضافة عناصر</h3>
                     <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => addElement('text')}><Type className="w-4 h-4 ml-2"/> نص</Button>
                        <Button variant="outline" onClick={() => addElement('image')}><ImageIcon className="w-4 h-4 ml-2"/> صورة</Button>
                        <Button variant="outline" onClick={() => addElement('table')}><Table className="w-4 h-4 ml-2"/> جدول</Button>
                     </div>
                </div>
                 <div className="p-4 border-b space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Settings className="w-5 h-5"/> إعدادات الصفحة</h3>
                    
                    <div>
                        <Label>اسم القالب</Label>
                        <Input value={templateName} onChange={e => setTemplateName(e.target.value)} />
                    </div>

                    <div>
                        <Label>مصدر البيانات</Label>
                        <Select value={dataSource} onValueChange={setDataSource}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manual">يدوي</SelectItem>
                                <SelectItem value="employee">موظف</SelectItem>
                                <SelectItem value="assignment">تكليف</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {dataSource === 'employee' && (
                        <div>
                            <Label>اختر موظف</Label>
                            <Select value={selectedEmployee?.id || ''} onValueChange={(id) => {
                                const emp = employees.find(e => e.id === id);
                                setSelectedEmployee(emp);
                                setElements(prev => prev.map(el => {
                                    if (el.dataField && emp[el.dataField]) {
                                        return { ...el, content: emp[el.dataField] };
                                    }
                                    return el;
                                }));
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر موظف..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.full_name_arabic || emp.رقم_الموظف}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {dataSource === 'assignment' && (
                        <div>
                            <Label>اختر تكليف</Label>
                            <Select value={selectedAssignment?.id || ''} onValueChange={(id) => {
                                const assign = assignments.find(a => a.id === id);
                                setSelectedAssignment(assign);
                                setElements(prev => prev.map(el => {
                                    if (el.dataField && assign[el.dataField]) {
                                        return { ...el, content: String(assign[el.dataField]) };
                                    }
                                    return el;
                                }));
                            }}>
                                <SelectTrigger>
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
                    
                    <div>
                        <Label>تحميل قالب محفوظ</Label>
                        <Select value={selectedTemplate || ''} onValueChange={(id) => {
                            const template = savedTemplates.find(t => t.id === id);
                            if (template) {
                                setSelectedTemplate(id);
                                setElements(template.elements || []);
                                setBackgroundUrl(template.background_url || '');
                                setTemplateName(template.name || 'نموذج جديد');
                            }
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر قالب..." />
                            </SelectTrigger>
                            <SelectContent>
                                {savedTemplates.map(template => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label>نوع الخلفية</Label>
                        <Select value={backgroundType} onValueChange={setBackgroundType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="url">رابط URL</SelectItem>
                                <SelectItem value="upload">رفع ملف (صورة/PDF)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {backgroundType === 'url' && (
                        <div>
                            <Label>رابط الخلفية</Label>
                            <Textarea 
                                value={backgroundUrl} 
                                onChange={e => setBackgroundUrl(e.target.value)} 
                                placeholder="https://..." 
                                rows={2}
                            />
                        </div>
                    )}

                    {backgroundType === 'upload' && (
                        <div>
                            <Label>رفع ملف خلفية</Label>
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*,application/pdf"
                                onChange={handleBackgroundUpload}
                                className="hidden"
                            />
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-4 h-4 ml-2" />
                                اختر ملف (PNG/JPG/PDF)
                            </Button>
                            {backgroundUrl && (
                                <p className="text-xs text-green-600 mt-1">✓ تم رفع الخلفية</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex-grow overflow-y-auto">
                    <ElementSidebar 
                        element={selectedElement} 
                        onUpdate={updateElement} 
                        onRemove={removeElement}
                        dataSource={dataSource}
                        employees={employees}
                        selectedEmployee={selectedEmployee}
                        assignments={assignments}
                        selectedAssignment={selectedAssignment}
                    />
                </div>
                 <div className="p-4 border-t space-y-2">
                    <Button className="w-full" onClick={handleSave}>
                        <Save className="w-4 h-4 ml-2" /> حفظ التصميم
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="w-4 h-4 ml-2" /> طباعة
                        </Button>
                        <Button variant="outline" onClick={handleExportPDF}>
                            <Download className="w-4 h-4 ml-2" /> PDF
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                <div 
                    ref={pageRef}
                    className="bg-white shadow-2xl relative print-area"
                    style={{ 
                        width: '210mm', 
                        height: '297mm',
                        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                    onClick={() => setSelectedElementId(null)}
                >
                    {elements.map(el => (
                       <ResizableDiv
                            key={el.id}
                            el={el}
                            onUpdate={updateElement}
                            isSelected={selectedElementId === el.id}
                            onMouseDown={(e) => handleElementMouseDown(e, el)}
                            onResizeStart={(e, handle) => handleResizeStart(e, el, handle)}
                       >
                            {el.type === 'text' && 
                                <div 
                                    className="p-2 w-full h-full whitespace-pre-wrap break-words outline-none"
                                    contentEditable={selectedElementId === el.id}
                                    onBlur={e => updateElement(el.id, {content: e.currentTarget.innerText})}
                                    suppressContentEditableWarning={true}
                                >{el.content}</div>
                            }
                            {el.type === 'image' && el.content && <img src={el.content} alt="custom" className="w-full h-full object-contain pointer-events-none" />}
                            {el.type === 'table' && el.data && el.data.rows && el.data.rows.length > 0 && (
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
                                                        className="p-1 outline-none relative"
                                                        style={{ 
                                                            borderWidth: `${el.data.borderWidth || 1}px`, 
                                                            borderColor: el.data.borderColor || '#000000',
                                                            textAlign: cell.align || 'right',
                                                            fontSize: cell.fontSize || '14px',
                                                            color: cell.color || '#000000',
                                                            backgroundColor: cell.bgColor || (el.data.headerBgColor || '#f0f0f0'),
                                                            colSpan: cell.colspan || 1,
                                                            rowSpan: cell.rowspan || 1
                                                        }}
                                                        colSpan={cell.colspan || 1}
                                                        rowSpan={cell.rowspan || 1}
                                                        contentEditable={selectedElementId === el.id}
                                                        suppressContentEditableWarning={true}
                                                        onBlur={e => handleTableCellChange(el.id, 0, cellIndex, e.currentTarget.innerText)}
                                                        onDoubleClick={selectedElementId === el.id ? () => setEditingCell({ elementId: el.id, rowIndex: 0, cellIndex, cell }) : undefined}
                                                    >
                                                        {cell.content}
                                                        {selectedElementId === el.id && (
                                                            <div 
                                                                className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                                                                onMouseDown={(e) => handleColumnResizeStart(e, el.id, cellIndex)}
                                                            />
                                                        )}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {el.data.rows.slice(1).map((row, rowIndex) => (
                                            <tr 
                                                key={rowIndex} 
                                                style={{ backgroundColor: (rowIndex + 1) % 2 === 0 ? el.data.evenRowBgColor : el.data.oddRowBgColor }}
                                            >
                                                {row.map((cell, cellIndex) => {
                                                    if (cell.hidden) return null;
                                                    return (
                                                        <td 
                                                            key={cellIndex} 
                                                            className="p-1 outline-none relative"
                                                            style={{ 
                                                                borderWidth: `${el.data.borderWidth || 1}px`, 
                                                                borderColor: el.data.borderColor || '#000000',
                                                                textAlign: cell.align || 'right',
                                                                fontSize: cell.fontSize || '14px',
                                                                color: cell.color || '#000000',
                                                                backgroundColor: cell.bgColor || ((rowIndex + 1) % 2 === 0 ? el.data.evenRowBgColor : el.data.oddRowBgColor),
                                                                colSpan: cell.colspan || 1,
                                                                rowSpan: cell.rowspan || 1
                                                            }}
                                                            colSpan={cell.colspan || 1}
                                                            rowSpan={cell.rowspan || 1}
                                                            contentEditable={selectedElementId === el.id}
                                                            suppressContentEditableWarning={true}
                                                            onBlur={e => handleTableCellChange(el.id, rowIndex + 1, cellIndex, e.currentTarget.innerText)}
                                                            onDoubleClick={selectedElementId === el.id ? () => setEditingCell({ elementId: el.id, rowIndex: rowIndex + 1, cellIndex, cell }) : undefined}
                                                        >
                                                            {cell.content}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                       </ResizableDiv>
                    ))}
                </div>
            </div>
            
            {editingCell && (
                <TableCellEditor 
                    cell={editingCell.cell}
                    rowIndex={editingCell.rowIndex}
                    cellIndex={editingCell.cellIndex}
                    onUpdate={(rowIdx, cellIdx, updatedCell) => {
                        handleCellUpdate(editingCell.elementId, rowIdx, cellIdx, updatedCell);
                    }}
                    onClose={() => setEditingCell(null)}
                />
            )}
        </div>
    );
}