import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Copy, 
  Move,
  Table as TableIcon,
  Type,
  Image as ImageIcon,
  Square,
  Printer,
  Eye,
  Settings,
  Palette
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function AdvancedFormEditor() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [templateName, setTemplateName] = useState('نموذج جديد');
  const [templates, setTemplates] = useState([]);
  const [resizing, setResizing] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const saved = await base44.entities.CustomFormTemplate.list();
      setTemplates(saved);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const addElement = (type) => {
    const newElement = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? 'نص جديد' : type === 'table' ? { rows: 2, cols: 2 } : '',
      style: {
        position: 'relative',
        width: type === 'table' ? '100%' : 'auto',
        height: 'auto',
        fontSize: '14px',
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
        border: type === 'table' ? '1px solid #000' : 'none',
        padding: '8px',
        margin: '4px',
        textAlign: 'right'
      }
    };
    setElements([...elements, newElement]);
  };

  const addTable = () => {
    const rows = parseInt(prompt('عدد الصفوف:', '3'));
    const cols = parseInt(prompt('عدد الأعمدة:', '3'));
    
    if (rows && cols) {
      const newTable = {
        id: Date.now().toString(),
        type: 'table',
        rows: rows,
        cols: cols,
        cells: Array(rows).fill(null).map(() => 
          Array(cols).fill(null).map(() => ({
            content: '',
            style: {
              padding: '8px',
              minWidth: '100px',
              minHeight: '40px',
              textAlign: 'right',
              fontSize: '11px'
            }
          }))
        ),
        style: {
          width: '100%',
          borderCollapse: 'collapse',
          margin: '8px 0',
          borderColor: '#000000',
          borderWidth: '1px',
          borderStyle: 'solid'
        }
      };
      setElements([...elements, newTable]);
    }
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const updateCellContent = (tableId, rowIndex, colIndex, content) => {
    setElements(elements.map(el => {
      if (el.id === tableId && el.type === 'table') {
        const newCells = [...el.cells];
        newCells[rowIndex][colIndex].content = content;
        return { ...el, cells: newCells };
      }
      return el;
    }));
  };

  const updateCellStyle = (tableId, rowIndex, colIndex, style) => {
    setElements(elements.map(el => {
      if (el.id === tableId && el.type === 'table') {
        const newCells = [...el.cells];
        newCells[rowIndex][colIndex].style = { ...newCells[rowIndex][colIndex].style, ...style };
        return { ...el, cells: newCells };
      }
      return el;
    }));
  };

  const addRow = (tableId) => {
    setElements(elements.map(el => {
      if (el.id === tableId && el.type === 'table') {
        const newRow = Array(el.cols).fill(null).map(() => ({
          content: '',
          style: {
            border: '1px solid #000',
            padding: '8px',
            minWidth: '100px',
            minHeight: '40px',
            textAlign: 'right'
          }
        }));
        return { 
          ...el, 
          rows: el.rows + 1, 
          cells: [...el.cells, newRow] 
        };
      }
      return el;
    }));
  };

  const addColumn = (tableId) => {
    setElements(elements.map(el => {
      if (el.id === tableId && el.type === 'table') {
        const newCells = el.cells.map(row => [
          ...row,
          {
            content: '',
            style: {
              border: '1px solid #000',
              padding: '8px',
              minWidth: '100px',
              minHeight: '40px',
              textAlign: 'right'
            }
          }
        ]);
        return { 
          ...el, 
          cols: el.cols + 1, 
          cells: newCells 
        };
      }
      return el;
    }));
  };

  const removeRow = (tableId, rowIndex) => {
    setElements(elements.map(el => {
      if (el.id === tableId && el.type === 'table' && el.rows > 1) {
        const newCells = el.cells.filter((_, idx) => idx !== rowIndex);
        return { 
          ...el, 
          rows: el.rows - 1, 
          cells: newCells 
        };
      }
      return el;
    }));
  };

  const removeColumn = (tableId, colIndex) => {
    setElements(elements.map(el => {
      if (el.id === tableId && el.type === 'table' && el.cols > 1) {
        const newCells = el.cells.map(row => row.filter((_, idx) => idx !== colIndex));
        return { 
          ...el, 
          cols: el.cols - 1, 
          cells: newCells 
        };
      }
      return el;
    }));
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement?.id === id) setSelectedElement(null);
  };

  const duplicateElement = (id) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const duplicate = {
        ...element,
        id: Date.now().toString()
      };
      setElements([...elements, duplicate]);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setElements(items);
  };

  const saveTemplate = async () => {
    try {
      await base44.entities.CustomFormTemplate.create({
        name: templateName,
        elements: JSON.stringify(elements),
        created_date: new Date().toISOString()
      });
      alert('✅ تم حفظ القالب بنجاح');
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('❌ فشل حفظ القالب');
    }
  };

  const loadTemplate = async (templateId) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setElements(JSON.parse(template.elements));
        setTemplateName(template.name);
        alert('✅ تم تحميل القالب');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      alert('❌ فشل تحميل القالب');
    }
  };

  const exportAsHTML = () => {
    const html = `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${templateName}</title>
  <style>
    body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #000; padding: 8px; }
  </style>
</head>
<body>
  ${elements.map(el => renderElementHTML(el)).join('\n')}
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}.html`;
    a.click();
  };

  const renderElementHTML = (element) => {
    if (element.type === 'text') {
      return `<div style="${Object.entries(element.style).map(([k, v]) => `${k}: ${v}`).join('; ')}">${element.content}</div>`;
    } else if (element.type === 'table') {
      return `
        <table style="${Object.entries(element.style).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          ${element.cells.map(row => `
            <tr>
              ${row.map(cell => `
                <td style="${Object.entries(cell.style).map(([k, v]) => `${k}: ${v}`).join('; ')}">${cell.content}</td>
              `).join('')}
            </tr>
          `).join('')}
        </table>
      `;
    }
    return '';
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>${templateName}</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; padding: 20mm; }
            table { border-collapse: collapse; width: 100%; }
            td { border: 1px solid #000; padding: 8px; }
          </style>
        </head>
        <body>
          ${elements.map(el => renderElementHTML(el)).join('\n')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCellResize = (tableId, rowIndex, colIndex, width, height) => {
    updateCellStyle(tableId, rowIndex, colIndex, {
      minWidth: width + 'px',
      minHeight: height + 'px'
    });
  };

  const mergeCells = (tableId, rowIndex, colIndex, direction) => {
    setElements(elements.map(el => {
      if (el.id === tableId && el.type === 'table') {
        const newCells = JSON.parse(JSON.stringify(el.cells));
        if (direction === 'right' && colIndex < el.cols - 1) {
          newCells[rowIndex][colIndex].colspan = (newCells[rowIndex][colIndex].colspan || 1) + 1;
          newCells[rowIndex].splice(colIndex + 1, 1);
        } else if (direction === 'down' && rowIndex < el.rows - 1) {
          newCells[rowIndex][colIndex].rowspan = (newCells[rowIndex][colIndex].rowspan || 1) + 1;
          newCells[rowIndex + 1].splice(colIndex, 1);
        }
        return { ...el, cells: newCells };
      }
      return el;
    }));
  };

  const updateTableStyle = (tableId, styleUpdates) => {
    setElements(elements.map(el => 
      el.id === tableId ? { ...el, style: { ...el.style, ...styleUpdates } } : el
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">محرر النماذج الاحترافي</CardTitle>
              <div className="flex gap-2">
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
                <Button onClick={exportAsHTML} variant="outline" size="sm">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير HTML
                </Button>
                <Button onClick={saveTemplate} className="bg-green-600 hover:bg-green-700" size="sm">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ كقالب
                </Button>
              </div>
            </div>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="اسم النموذج"
              className="mt-2"
            />
          </CardHeader>
        </Card>

        <div className="grid grid-cols-12 gap-4">
          {/* Toolbar */}
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">العناصر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={() => addElement('text')} variant="outline" size="sm" className="w-full justify-start">
                  <Type className="w-4 h-4 ml-2" />
                  نص
                </Button>
                <Button onClick={addTable} variant="outline" size="sm" className="w-full justify-start">
                  <TableIcon className="w-4 h-4 ml-2" />
                  جدول
                </Button>
                <Button onClick={() => addElement('image')} variant="outline" size="sm" className="w-full justify-start">
                  <ImageIcon className="w-4 h-4 ml-2" />
                  صورة
                </Button>
                <Button onClick={() => addElement('line')} variant="outline" size="sm" className="w-full justify-start">
                  <Square className="w-4 h-4 ml-2" />
                  خط أفقي
                </Button>
                <div className="pt-2 border-t mt-2">
                  <p className="text-xs text-gray-600 mb-2">جداول سريعة:</p>
                  <Button 
                    onClick={() => {
                      const table = {
                        id: Date.now().toString(),
                        type: 'table',
                        rows: 2,
                        cols: 4,
                        cells: Array(2).fill(null).map(() => 
                          Array(4).fill(null).map(() => ({
                            content: '',
                            style: { padding: '8px', minWidth: '80px', minHeight: '35px', textAlign: 'right', fontSize: '10px' }
                          }))
                        ),
                        style: { width: '100%', borderCollapse: 'collapse', margin: '4px 0', borderColor: '#000000', borderWidth: '1px', borderStyle: 'solid' }
                      };
                      setElements([...elements, table]);
                    }} 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                  >
                    جدول عادي 2×4
                  </Button>
                  <Button 
                    onClick={() => {
                      const table = {
                        id: Date.now().toString(),
                        type: 'table',
                        rows: 4,
                        cols: 2,
                        cells: Array(4).fill(null).map(() => 
                          Array(2).fill(null).map(() => ({
                            content: '',
                            style: { padding: '8px', minWidth: '150px', minHeight: '40px', textAlign: 'right', fontSize: '10px' }
                          }))
                        ),
                        style: { width: '100%', borderCollapse: 'collapse', margin: '4px 0', borderColor: '#000000', borderWidth: '1px', borderStyle: 'solid' }
                      };
                      setElements([...elements, table]);
                    }} 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                  >
                    جدول عادي 4×2
                  </Button>
                  <Button 
                    onClick={() => {
                      const table = {
                        id: Date.now().toString(),
                        type: 'table',
                        rows: 3,
                        cols: 3,
                        cells: Array(3).fill(null).map(() => 
                          Array(3).fill(null).map(() => ({
                            content: '',
                            style: { padding: '6px', minWidth: '100px', minHeight: '35px', textAlign: 'right', fontSize: '9px' }
                          }))
                        ),
                        style: { width: '100%', borderCollapse: 'collapse', margin: '4px 0', borderColor: '#000000', borderWidth: '0.5px', borderStyle: 'solid' }
                      };
                      setElements([...elements, table]);
                    }} 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                  >
                    جدول شعري 3×3
                  </Button>
                  <Button 
                    onClick={() => {
                      const table = {
                        id: Date.now().toString(),
                        type: 'table',
                        rows: 5,
                        cols: 4,
                        cells: Array(5).fill(null).map((_, rIdx) => 
                          Array(4).fill(null).map((_, cIdx) => ({
                            content: '',
                            style: { 
                              padding: '8px', 
                              minWidth: '100px', 
                              minHeight: '40px', 
                              textAlign: 'center', 
                              fontSize: '10px',
                              backgroundColor: rIdx === 0 ? '#f3f4f6' : '#ffffff',
                              fontWeight: rIdx === 0 ? 'bold' : 'normal'
                            }
                          }))
                        ),
                        style: { width: '100%', borderCollapse: 'collapse', margin: '4px 0', borderColor: '#1f2937', borderWidth: '1.5px', borderStyle: 'solid' }
                      };
                      setElements([...elements, table]);
                    }} 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                  >
                    جدول بترويسة 5×4
                  </Button>
                </div>
              </CardContent>
            </Card>

            {templates.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">القوالب المحفوظة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {templates.map(template => (
                    <Button
                      key={template.id}
                      onClick={() => loadTemplate(template.id)}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      {template.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Canvas */}
          <div className="col-span-7">
            <Card>
              <CardContent className="p-6 min-h-[600px] bg-white" ref={containerRef}>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="elements">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {elements.map((element, index) => (
                          <Draggable key={element.id} draggableId={element.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`mb-2 p-2 border-2 ${selectedElement?.id === element.id ? 'border-blue-500' : 'border-transparent'} hover:border-gray-300 rounded`}
                                onClick={() => setSelectedElement(element)}
                              >
                                <div {...provided.dragHandleProps} className="cursor-move mb-2 flex justify-between items-center">
                                  <Move className="w-4 h-4 text-gray-400" />
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => duplicateElement(element.id)}>
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => deleteElement(element.id)}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>

                                {element.type === 'text' && (
                                  <div style={element.style}>
                                    <textarea
                                      value={element.content}
                                      onChange={(e) => updateElement(element.id, { content: e.target.value })}
                                      className="w-full border-none focus:outline-none bg-transparent"
                                      rows={3}
                                      style={{ color: element.style.color, fontSize: element.style.fontSize }}
                                    />
                                  </div>
                                )}

                                {element.type === 'image' && (
                                  <div style={element.style} className="border-2 border-dashed border-gray-300 p-4 text-center">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          const result = await base44.integrations.Core.UploadFile({ file });
                                          updateElement(element.id, { content: result.file_url });
                                        }
                                      }}
                                      className="hidden"
                                      id={`image-${element.id}`}
                                    />
                                    {element.content ? (
                                      <img src={element.content} alt="صورة" className="max-w-full h-auto" />
                                    ) : (
                                      <label htmlFor={`image-${element.id}`} className="cursor-pointer">
                                        <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                                        <p className="text-sm text-gray-500 mt-2">اضغط لرفع صورة</p>
                                      </label>
                                    )}
                                  </div>
                                )}

                                {element.type === 'line' && (
                                  <div className="relative group" style={element.style}>
                                    <hr style={{ 
                                      borderTop: element.style.borderTop || '1px solid #000',
                                      margin: element.style.margin || '8px 0'
                                    }} />
                                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex gap-1 p-1 bg-white border shadow-lg rounded">
                                      <select
                                        value={element.style.borderTop?.split(' ')[0] || '1px'}
                                        onChange={(e) => {
                                          const [_, style, color] = (element.style.borderTop || '1px solid #000000').split(' ');
                                          updateElement(element.id, { 
                                            style: { ...element.style, borderTop: `${e.target.value} ${style || 'solid'} ${color || '#000000'}` }
                                          });
                                        }}
                                        className="border rounded px-1 h-6 text-xs"
                                      >
                                        <option value="0.5px">شعري</option>
                                        <option value="1px">رفيع</option>
                                        <option value="2px">متوسط</option>
                                        <option value="3px">سميك</option>
                                      </select>
                                      <select
                                        value={element.style.borderTop?.split(' ')[1] || 'solid'}
                                        onChange={(e) => {
                                          const [width, _, color] = (element.style.borderTop || '1px solid #000000').split(' ');
                                          updateElement(element.id, { 
                                            style: { ...element.style, borderTop: `${width || '1px'} ${e.target.value} ${color || '#000000'}` }
                                          });
                                        }}
                                        className="border rounded px-1 h-6 text-xs"
                                      >
                                        <option value="solid">متصل</option>
                                        <option value="dashed">متقطع</option>
                                        <option value="dotted">نقطي</option>
                                        <option value="double">مزدوج</option>
                                      </select>
                                      <Input
                                        type="color"
                                        value={element.style.borderTop?.split(' ')[2] || '#000000'}
                                        onChange={(e) => {
                                          const [width, style] = (element.style.borderTop || '1px solid #000000').split(' ');
                                          updateElement(element.id, { 
                                            style: { ...element.style, borderTop: `${width || '1px'} ${style || 'solid'} ${e.target.value}` }
                                          });
                                        }}
                                        className="w-12 h-6"
                                        title="لون الخط"
                                      />
                                    </div>
                                  </div>
                                )}

                                {element.type === 'table' && (
                                  <div>
                                    <div className="space-y-2 mb-3">
                                      <div className="flex gap-2 flex-wrap">
                                        <Button size="sm" onClick={() => addRow(element.id)} variant="outline">
                                          + صف
                                        </Button>
                                        <Button size="sm" onClick={() => addColumn(element.id)} variant="outline">
                                          + عمود
                                        </Button>
                                      </div>
                                      <div className="flex gap-2 items-center flex-wrap">
                                        <span className="text-xs text-gray-600">حدود الجدول:</span>
                                        <Input
                                          type="color"
                                          value={element.style.borderColor || '#000000'}
                                          onChange={(e) => updateTableStyle(element.id, { borderColor: e.target.value })}
                                          className="w-12 h-8"
                                          title="لون الحدود"
                                        />
                                        <select
                                          value={element.style.borderWidth || '1px'}
                                          onChange={(e) => updateTableStyle(element.id, { borderWidth: e.target.value })}
                                          className="border rounded px-2 h-8 text-xs"
                                        >
                                          <option value="0.5px">شعري (0.5px)</option>
                                          <option value="1px">رفيع (1px)</option>
                                          <option value="1.5px">متوسط (1.5px)</option>
                                          <option value="2px">سميك (2px)</option>
                                          <option value="3px">سميك جداً (3px)</option>
                                        </select>
                                        <select
                                          value={element.style.borderStyle || 'solid'}
                                          onChange={(e) => updateTableStyle(element.id, { borderStyle: e.target.value })}
                                          className="border rounded px-2 h-8 text-xs"
                                        >
                                          <option value="solid">متصل</option>
                                          <option value="dashed">متقطع</option>
                                          <option value="dotted">نقطي</option>
                                          <option value="double">مزدوج</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table style={{ 
                                        ...element.style, 
                                        border: `${element.style.borderWidth || '1px'} ${element.style.borderStyle || 'solid'} ${element.style.borderColor || '#000'}`,
                                        borderCollapse: 'collapse'
                                      }} className="w-full">
                                        <tbody>
                                          {element.cells.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                              {row.map((cell, colIndex) => (
                                                <td
                                                  key={`${rowIndex}-${colIndex}`}
                                                  style={{
                                                    ...cell.style,
                                                    border: `${element.style.borderWidth || '1px'} ${element.style.borderStyle || 'solid'} ${element.style.borderColor || '#000'}`,
                                                    resize: 'both',
                                                    overflow: 'auto'
                                                  }}
                                                  rowSpan={cell.rowspan || 1}
                                                  colSpan={cell.colspan || 1}
                                                  className="relative group hover:bg-blue-50/30 transition-colors"
                                                  onDoubleClick={() => {
                                                    const newWidth = prompt('عرض الخلية (مثال: 150px):', cell.style.minWidth || '100px');
                                                    const newHeight = prompt('ارتفاع الخلية (مثال: 60px):', cell.style.minHeight || '40px');
                                                    if (newWidth) updateCellStyle(element.id, rowIndex, colIndex, { minWidth: newWidth });
                                                    if (newHeight) updateCellStyle(element.id, rowIndex, colIndex, { minHeight: newHeight });
                                                  }}
                                                >
                                                  <div className="resize-handle absolute bottom-0 left-0 w-3 h-3 bg-blue-500 opacity-0 group-hover:opacity-50 cursor-se-resize"></div>
                                                  <textarea
                                                    value={cell.content}
                                                    onChange={(e) => updateCellContent(element.id, rowIndex, colIndex, e.target.value)}
                                                    className="w-full h-full border-none focus:outline-none bg-transparent resize-none p-1"
                                                    rows={2}
                                                    style={{ 
                                                      fontSize: cell.style.fontSize || '12px',
                                                      color: cell.style.color,
                                                      fontWeight: cell.style.fontWeight,
                                                      textAlign: cell.style.textAlign
                                                    }}
                                                  />
                                                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex flex-col gap-1 p-1 bg-white border shadow-lg z-10 rounded">
                                                    <div className="flex gap-1">
                                                      <Input
                                                        type="color"
                                                        value={cell.style.backgroundColor || '#ffffff'}
                                                        onChange={(e) => updateCellStyle(element.id, rowIndex, colIndex, { backgroundColor: e.target.value })}
                                                        className="w-8 h-6"
                                                        title="لون الخلفية"
                                                      />
                                                      <Input
                                                        type="color"
                                                        value={cell.style.color || '#000000'}
                                                        onChange={(e) => updateCellStyle(element.id, rowIndex, colIndex, { color: e.target.value })}
                                                        className="w-8 h-6"
                                                        title="لون النص"
                                                      />
                                                      <select
                                                        value={cell.style.fontSize || '12px'}
                                                        onChange={(e) => updateCellStyle(element.id, rowIndex, colIndex, { fontSize: e.target.value })}
                                                        className="border rounded px-1 h-6 text-xs w-16"
                                                      >
                                                        <option value="8px">8px</option>
                                                        <option value="9px">9px</option>
                                                        <option value="10px">10px</option>
                                                        <option value="11px">11px</option>
                                                        <option value="12px">12px</option>
                                                        <option value="14px">14px</option>
                                                      </select>
                                                    </div>
                                                    <div className="flex gap-1">
                                                      <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                          const newWeight = cell.style.fontWeight === 'bold' ? 'normal' : 'bold';
                                                          updateCellStyle(element.id, rowIndex, colIndex, { fontWeight: newWeight });
                                                        }}
                                                        className="h-6 px-2 text-xs"
                                                        title="غامق"
                                                      >
                                                        B
                                                      </Button>
                                                      <select
                                                        value={cell.style.textAlign || 'right'}
                                                        onChange={(e) => updateCellStyle(element.id, rowIndex, colIndex, { textAlign: e.target.value })}
                                                        className="border rounded px-1 h-6 text-xs w-16"
                                                      >
                                                        <option value="right">يمين</option>
                                                        <option value="center">وسط</option>
                                                        <option value="left">يسار</option>
                                                      </select>
                                                    </div>
                                                    <div className="flex gap-1 border-t pt-1">
                                                      <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => mergeCells(element.id, rowIndex, colIndex, 'right')}
                                                        className="h-6 px-2 text-xs"
                                                        title="دمج يمين"
                                                        disabled={colIndex >= element.cols - 1}
                                                      >
                                                        →
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => mergeCells(element.id, rowIndex, colIndex, 'down')}
                                                        className="h-6 px-2 text-xs"
                                                        title="دمج أسفل"
                                                        disabled={rowIndex >= element.rows - 1}
                                                      >
                                                        ↓
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => removeRow(element.id, rowIndex)}
                                                        className="h-6 px-2 text-xs"
                                                        title="حذف الصف"
                                                      >
                                                        ×
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </div>

          {/* Properties Panel */}
          <div className="col-span-3">
            {selectedElement && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">خصائص العنصر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>حجم الخط</Label>
                    <Input
                      value={selectedElement.style.fontSize}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, fontSize: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>سماكة الخط</Label>
                    <select
                      value={selectedElement.style.fontWeight}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, fontWeight: e.target.value }
                      })}
                      className="w-full border rounded p-2"
                    >
                      <option value="normal">عادي</option>
                      <option value="bold">عريض</option>
                      <option value="600">600</option>
                      <option value="700">700</option>
                    </select>
                  </div>
                  <div>
                    <Label>لون النص</Label>
                    <Input
                      type="color"
                      value={selectedElement.style.color}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, color: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>لون الخلفية</Label>
                    <Input
                      type="color"
                      value={selectedElement.style.backgroundColor === 'transparent' ? '#ffffff' : selectedElement.style.backgroundColor}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, backgroundColor: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>المحاذاة</Label>
                    <div className="flex gap-1">
                      {['right', 'center', 'left'].map(align => (
                        <Button
                          key={align}
                          size="sm"
                          variant={selectedElement.style.textAlign === align ? 'default' : 'outline'}
                          onClick={() => updateElement(selectedElement.id, {
                            style: { ...selectedElement.style, textAlign: align }
                          })}
                        >
                          {align === 'right' ? 'يمين' : align === 'center' ? 'وسط' : 'يسار'}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>المسافة الداخلية</Label>
                    <Input
                      value={selectedElement.style.padding}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, padding: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>الحدود</Label>
                    <Input
                      value={selectedElement.style.border}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, border: e.target.value }
                      })}
                      placeholder="1px solid #000"
                    />
                  </div>
                  <div>
                    <Label>العرض</Label>
                    <Input
                      value={selectedElement.style.width}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, width: e.target.value }
                      })}
                      placeholder="100%"
                    />
                  </div>
                  <div>
                    <Label>الارتفاع</Label>
                    <Input
                      value={selectedElement.style.height}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, height: e.target.value }
                      })}
                      placeholder="auto"
                    />
                  </div>
                  {selectedElement.type === 'table' && (
                    <>
                      <div>
                        <Label>لون حدود الجدول</Label>
                        <Input
                          type="color"
                          value={selectedElement.style.borderColor || '#000000'}
                          onChange={(e) => updateTableStyle(selectedElement.id, { borderColor: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>سمك حدود الجدول</Label>
                        <select
                          value={selectedElement.style.borderWidth || '1px'}
                          onChange={(e) => updateTableStyle(selectedElement.id, { borderWidth: e.target.value })}
                          className="w-full border rounded p-2"
                        >
                          <option value="0.5px">شعري (0.5px)</option>
                          <option value="1px">رفيع (1px)</option>
                          <option value="1.5px">متوسط (1.5px)</option>
                          <option value="2px">سميك (2px)</option>
                          <option value="3px">سميك جداً (3px)</option>
                          <option value="4px">سميك للغاية (4px)</option>
                        </select>
                      </div>
                      <div>
                        <Label>نمط حدود الجدول</Label>
                        <select
                          value={selectedElement.style.borderStyle || 'solid'}
                          onChange={(e) => updateTableStyle(selectedElement.id, { borderStyle: e.target.value })}
                          className="w-full border rounded p-2"
                        >
                          <option value="solid">متصل</option>
                          <option value="dashed">متقطع</option>
                          <option value="dotted">نقطي</option>
                          <option value="double">مزدوج</option>
                          <option value="groove">محفور</option>
                          <option value="ridge">بارز</option>
                        </select>
                      </div>
                      <div>
                        <Label>تباعد الخلايا</Label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={parseInt(selectedElement.style.borderSpacing) || 0}
                          onChange={(e) => updateTableStyle(selectedElement.id, { borderSpacing: e.target.value + 'px' })}
                          placeholder="0"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* لوحة الألوان السريعة */}
            <Card className="shadow-lg">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  ألوان سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">ألوان النصوص</Label>
                  <div className="grid grid-cols-5 gap-1 mt-1">
                    {['#000000', '#1f2937', '#dc2626', '#2563eb', '#16a34a', '#ea580c', '#8b5cf6', '#0891b2', '#be123c', '#7c3aed'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          if (selectedElement) {
                            if (selectedElement.type === 'text') {
                              updateElement(selectedElement.id, { style: { ...selectedElement.style, color } });
                            }
                          }
                        }}
                        className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">ألوان الخلفيات</Label>
                  <div className="grid grid-cols-5 gap-1 mt-1">
                    {['#ffffff', '#f3f4f6', '#dbeafe', '#fef3c7', '#dcfce7', '#fee2e2', '#f3e8ff', '#e0f2fe', '#fce7f3', '#fef9c3'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          if (selectedElement) {
                            updateElement(selectedElement.id, { style: { ...selectedElement.style, backgroundColor: color } });
                          }
                        }}
                        className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">حدود شعرية</Label>
                  <div className="space-y-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        if (selectedElement?.type === 'table') {
                          updateTableStyle(selectedElement.id, { borderWidth: '0.5px', borderStyle: 'solid', borderColor: '#000000' });
                        }
                      }}
                    >
                      تطبيق حدود شعرية
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        if (selectedElement?.type === 'table') {
                          updateTableStyle(selectedElement.id, { borderWidth: '1.5px', borderStyle: 'double', borderColor: '#1f2937' });
                        }
                      }}
                    >
                      حدود مزدوجة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}