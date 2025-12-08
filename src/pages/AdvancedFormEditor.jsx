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
  Settings
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
    const newTable = {
      id: Date.now().toString(),
      type: 'table',
      rows: 3,
      cols: 3,
      cells: Array(3).fill(null).map(() => 
        Array(3).fill(null).map(() => ({
          content: '',
          style: {
            border: '1px solid #000',
            padding: '8px',
            minWidth: '100px',
            minHeight: '40px',
            textAlign: 'right'
          }
        }))
      ),
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        margin: '8px 0'
      }
    };
    setElements([...elements, newTable]);
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
                <Button onClick={() => addElement('text')} variant="outline" size="sm" className="w-full">
                  <Type className="w-4 h-4 ml-2" />
                  نص
                </Button>
                <Button onClick={addTable} variant="outline" size="sm" className="w-full">
                  <TableIcon className="w-4 h-4 ml-2" />
                  جدول
                </Button>
                <Button onClick={() => addElement('image')} variant="outline" size="sm" className="w-full">
                  <ImageIcon className="w-4 h-4 ml-2" />
                  صورة
                </Button>
                <Button onClick={() => addElement('line')} variant="outline" size="sm" className="w-full">
                  <Square className="w-4 h-4 ml-2" />
                  خط أفقي
                </Button>
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
                                  <textarea
                                    value={element.content}
                                    onChange={(e) => updateElement(element.id, { content: e.target.value })}
                                    style={element.style}
                                    className="w-full border-none focus:outline-none"
                                    rows={3}
                                  />
                                )}

                                {element.type === 'table' && (
                                  <div>
                                    <div className="flex gap-2 mb-2">
                                      <Button size="sm" onClick={() => addRow(element.id)} variant="outline">
                                        + صف
                                      </Button>
                                      <Button size="sm" onClick={() => addColumn(element.id)} variant="outline">
                                        + عمود
                                      </Button>
                                    </div>
                                    <table style={element.style} className="w-full">
                                      <tbody>
                                        {element.cells.map((row, rowIndex) => (
                                          <tr key={rowIndex}>
                                            {row.map((cell, colIndex) => (
                                              <td
                                                key={`${rowIndex}-${colIndex}`}
                                                style={cell.style}
                                                className="relative group"
                                              >
                                                <textarea
                                                  value={cell.content}
                                                  onChange={(e) => updateCellContent(element.id, rowIndex, colIndex, e.target.value)}
                                                  className="w-full h-full border-none focus:outline-none bg-transparent resize-none"
                                                  rows={2}
                                                />
                                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex gap-1 p-1 bg-white border">
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => removeRow(element.id, rowIndex)}
                                                    className="h-6 w-6 p-0"
                                                  >
                                                    ×
                                                  </Button>
                                                </div>
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
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
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}