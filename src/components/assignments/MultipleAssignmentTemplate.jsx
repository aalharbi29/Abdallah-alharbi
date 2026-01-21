import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Printer, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const getDayName = (dateString) => {
  try {
    const date = new Date(dateString);
    return format(date, 'EEEE', { locale: ar });
  } catch (error) {
    return '';
  }
};

export default function MultipleAssignmentTemplate({ 
  assignments = [], 
  customTitle = 'قرار تكليف',
  customIntro = 'إن مدير شؤون المراكز الصحية بالحناكية وبناء على الصلاحيات الممنوحة لنا نظاماً\nعليه يقرر ما يلي:',
  decisionPoints = [
    'تكليف الموضح بياناتهم أعلاه بالعمل في الجهات الموضحة قرين اسم كل منهم خلال الفترة المحددة.',
    'لا يترتب على هذا التكليف أي ميزة مالية إلا ما يقره النظام.',
    'يتم تنفيذ هذا القرار كلاً فيما يخصه.'
  ],
  customClosing = 'خالص التحايا ،،،',
  managerName = 'أ/عبدالمجيد سعود الربيقي',
  managerTitle = 'مدير شؤون المراكز الصحية بالحناكية',
  stampSize = 150,
  showNumbering: initialShowNumbering = true,
  freeText: initialFreeText = '',
  onTitleChange,
  onIntroChange,
  onDecisionPointsChange,
  onClosingChange,
  onAssignmentsChange,
  onFreeTextChange,
  showActions = true,
}) {
  const containerRef = useRef(null);
  const [isSavingToEmployee, setIsSavingToEmployee] = useState(false);
  
  const defaultColumns = [
    { id: 'name', label: 'الاسم', width: 180 },
    { id: 'national_id', label: 'رقم الهوية', width: 120 },
    { id: 'employee_id', label: 'رقم الموظف', width: 100 },
    { id: 'current_work', label: 'جهة العمل', width: 140 },
    { id: 'assigned_work', label: 'جهة التكليف', width: 140 },
    { id: 'full_duration', label: 'مدة التكليف', width: 220 },
  ];

  const [columns, setColumns] = useState(defaultColumns);
  const [resizing, setResizing] = useState(null);
  const [startPos, setStartPos] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [showNumbering, setShowNumbering] = useState(initialShowNumbering);
  const [freeText, setFreeText] = useState(initialFreeText);
  
  // Separate draggable positions - using transform instead of position for better behavior
  const [signatureOffset, setSignatureOffset] = useState({ x: 0, y: 0 });
  const [stampOffset, setStampOffset] = useState({ x: 0, y: 0 });
  const [managerNameOffset, setManagerNameOffset] = useState({ x: 0, y: 0 });
  const [tableOffset, setTableOffset] = useState({ x: 0, y: 0 });
  const [freeTextOffset, setFreeTextOffset] = useState({ x: 0, y: 0 });
  const [titleOffset, setTitleOffset] = useState({ x: 0, y: 0 });
  const [introOffset, setIntroOffset] = useState({ x: 0, y: 0 });
  const [decisionPointsOffset, setDecisionPointsOffset] = useState({ x: 0, y: 0 });
  const [closingOffset, setClosingOffset] = useState({ x: 0, y: 0 });
  
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
  
  // Size controls for signature and stamp
  const [signatureSize, setSignatureSize] = useState(150);
  const [currentStampSize, setCurrentStampSize] = useState(stampSize);
  const [selectedElement, setSelectedElement] = useState(null); // 'signature' or 'stamp'

  const addColumn = () => {
    const newId = `col_${Date.now()}`;
    setColumns([...columns, { id: newId, label: 'عمود جديد', width: 120, isCustom: true }]);
  };

  const removeColumn = (colId) => {
    if (window.confirm('حذف هذا العمود؟')) {
      setColumns(columns.filter(c => c.id !== colId));
    }
  };

  const updateColumnLabel = (colId, newLabel) => {
    setColumns(columns.map(c => c.id === colId ? { ...c, label: newLabel } : c));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newColumns = Array.from(columns);
    const [reorderedItem] = newColumns.splice(result.source.index, 1);
    newColumns.splice(result.destination.index, 0, reorderedItem);
    setColumns(newColumns);
  };

  // Column resizing
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      const diff = startPos - e.clientX;
      const newWidth = Math.max(80, startWidth + diff);
      setColumns(cols => cols.map(col => 
        col.id === resizing ? { ...col, width: newWidth } : col
      ));
    };

    const handleMouseUp = () => setResizing(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, startPos, startWidth]);

  const handleResizeStart = (e, colId, currentWidth) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(colId);
    setStartPos(e.clientX);
    setStartWidth(currentWidth);
  };

  // Dragging for elements - using transform for smoother movement
  const handleItemMouseDown = (itemType, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    // Get current offset for this item
    let currentOffset = { x: 0, y: 0 };
    if (itemType === 'signature') currentOffset = signatureOffset;
    else if (itemType === 'stamp') currentOffset = stampOffset;
    else if (itemType === 'managerName') currentOffset = managerNameOffset;
    else if (itemType === 'table') currentOffset = tableOffset;
    else if (itemType === 'freeText') currentOffset = freeTextOffset;
    else if (itemType === 'title') currentOffset = titleOffset;
    else if (itemType === 'intro') currentOffset = introOffset;
    else if (itemType === 'decisionPoints') currentOffset = decisionPointsOffset;
    else if (itemType === 'closing') currentOffset = closingOffset;
    
    setDragStartOffset(currentOffset);
    setDraggingItem(itemType);
  };

  useEffect(() => {
    if (!draggingItem) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStartPos.x;
      const deltaY = e.clientY - dragStartPos.y;
      
      const newOffset = {
        x: dragStartOffset.x + deltaX,
        y: dragStartOffset.y + deltaY
      };
      
      if (draggingItem === 'signature') {
        setSignatureOffset(newOffset);
      } else if (draggingItem === 'stamp') {
        setStampOffset(newOffset);
      } else if (draggingItem === 'managerName') {
        setManagerNameOffset(newOffset);
      } else if (draggingItem === 'table') {
        setTableOffset(newOffset);
      } else if (draggingItem === 'freeText') {
        setFreeTextOffset(newOffset);
      } else if (draggingItem === 'title') {
        setTitleOffset(newOffset);
      } else if (draggingItem === 'intro') {
        setIntroOffset(newOffset);
      } else if (draggingItem === 'decisionPoints') {
        setDecisionPointsOffset(newOffset);
      } else if (draggingItem === 'closing') {
        setClosingOffset(newOffset);
      }
    };

    const handleMouseUp = () => setDraggingItem(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingItem, dragStartPos, dragStartOffset]);

  // Keyboard shortcut for font size, element resizing, and text alignment
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Resize selected element (signature or stamp)
      if (selectedElement && e.ctrlKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          if (selectedElement === 'signature') {
            setSignatureSize(prev => Math.min(prev + 20, 400));
          } else if (selectedElement === 'stamp') {
            setCurrentStampSize(prev => Math.min(prev + 20, 400));
          }
          return;
        } else if (e.key === '-') {
          e.preventDefault();
          if (selectedElement === 'signature') {
            setSignatureSize(prev => Math.max(prev - 20, 50));
          } else if (selectedElement === 'stamp') {
            setCurrentStampSize(prev => Math.max(prev - 20, 50));
          }
          return;
        }
      }
      
      // Text alignment - Ctrl+L (left), Ctrl+E (center), Ctrl+R (right)
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          try {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.display = 'block';
            span.style.textAlign = 'left';
            range.surroundContents(span);
          } catch (err) {
            console.log('Cannot align text:', err);
          }
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          try {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.display = 'block';
            span.style.textAlign = 'center';
            range.surroundContents(span);
          } catch (err) {
            console.log('Cannot align text:', err);
          }
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          try {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.display = 'block';
            span.style.textAlign = 'right';
            range.surroundContents(span);
          } catch (err) {
            console.log('Cannot align text:', err);
          }
        }
      }
      
      // Text font size - apply to selected text
      if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          try {
            const range = selection.getRangeAt(0);
            const parentSpan = range.commonAncestorContainer.parentElement;
            if (parentSpan && parentSpan.tagName === 'SPAN' && parentSpan.style.fontSize) {
              const currentSize = parseFloat(parentSpan.style.fontSize) || 1;
              parentSpan.style.fontSize = `${Math.min(currentSize + 0.15, 3)}em`;
            } else {
              const span = document.createElement('span');
              span.style.fontSize = '1.15em';
              span.style.display = 'inline';
              range.surroundContents(span);
            }
          } catch (err) {
            console.log('Cannot resize text:', err);
          }
        }
      } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          try {
            const range = selection.getRangeAt(0);
            const parentSpan = range.commonAncestorContainer.parentElement;
            if (parentSpan && parentSpan.tagName === 'SPAN' && parentSpan.style.fontSize) {
              const currentSize = parseFloat(parentSpan.style.fontSize) || 1;
              parentSpan.style.fontSize = `${Math.max(currentSize - 0.15, 0.5)}em`;
            } else {
              const span = document.createElement('span');
              span.style.fontSize = '0.85em';
              span.style.display = 'inline';
              range.surroundContents(span);
            }
          } catch (err) {
            console.log('Cannot resize text:', err);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  const letterheadUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/20b408cf3_.png";

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Save to employee files
  const handleSaveToEmployeeFiles = async () => {
    if (assignments.length === 0) {
      toast.error('لا يوجد موظفين في التكليف');
      return;
    }

    setIsSavingToEmployee(true);
    try {
      // Create a canvas from the template
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `تكليف-${new Date().toISOString().split('T')[0]}.png`, { type: 'image/png' });
      
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Save to each employee's documents
      for (const assignment of assignments) {
        if (assignment.employee_record_id) {
          await base44.entities.EmployeeDocument.create({
            employee_id: assignment.employee_record_id,
            employee_name: assignment.name,
            document_title: `تكليف - ${assignment.assigned_work} - ${new Date().toLocaleDateString('ar-SA')}`,
            document_type: 'official',
            description: `تكليف للعمل في ${assignment.assigned_work} من ${assignment.start_date} إلى ${assignment.end_date}`,
            file_url: file_url,
            file_name: `تكليف-${assignment.name}.png`,
            start_date: assignment.start_date,
            end_date: assignment.end_date
          });
        }
      }
      
      toast.success(`تم حفظ التكليف في ملفات ${assignments.length} موظف`);
    } catch (error) {
      console.error('Error saving to employee files:', error);
      toast.error('فشل في حفظ التكليف');
    } finally {
      setIsSavingToEmployee(false);
    }
  };

  const buildFullDuration = (row) => {
    if (row.full_duration) return row.full_duration;
    
    let result = '';
    if (row.start_date) {
      const startDay = getDayName(row.start_date);
      const endDay = row.end_date ? getDayName(row.end_date) : '';
      
      if (row.duration) {
        result = `(${row.duration} يوم)\n`;
      }
      result += `من ${startDay} ${row.start_date}`;
      if (row.end_date) {
        result += `\nإلى ${endDay} ${row.end_date}`;
      }
    }
    return result || '-';
  };

  return (
    <div 
      ref={containerRef}
      className="bg-white mx-auto print-area shadow-2xl" 
      style={{ 
        width: '210mm',
        minHeight: '297mm', 
        padding: '15mm 20mm', 
        boxSizing: 'border-box',
        backgroundImage: `url(${letterheadUrl})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        direction: 'rtl'
      }}
      onClick={() => setSelectedElement(null)}
    >
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important; 
            min-height: 297mm !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; visibility: hidden !important; }
        }
        .editable-cell {
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .draggable-item {
          cursor: grab;
          user-select: none;
        }
        .draggable-item:active {
          cursor: grabbing;
        }
      `}</style>

      {/* Action Buttons */}
      {showActions && (
        <div className="no-print absolute top-2 right-2 bg-white/90 backdrop-blur rounded-lg shadow-lg p-2 z-50 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="gap-1"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveToEmployeeFiles}
            disabled={isSavingToEmployee || assignments.length === 0}
            className="gap-1"
          >
            {isSavingToEmployee ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ بملف الموظف
          </Button>
        </div>
      )}

      {/* Controls Panel */}
      <div className="no-print absolute top-2 left-2 bg-white/90 backdrop-blur rounded-lg shadow-lg p-2 z-50 flex gap-2 items-center text-xs flex-wrap max-w-sm">
        {onAssignmentsChange && (
          <>
            <label className="flex items-center gap-1 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showNumbering} 
                onChange={(e) => setShowNumbering(e.target.checked)}
                className="w-4 h-4"
              />
              ترقيم
            </label>
            <span className="text-gray-400">|</span>
          </>
        )}
        <span className="text-blue-600">🖱️ اسحب العناصر</span>
        <span className="text-gray-400">|</span>
        <span className="text-purple-600">📝 ظلل: Ctrl+/- حجم | Ctrl+L يسار | Ctrl+E وسط | Ctrl+R يمين</span>
        {selectedElement && (
          <>
            <span className="text-gray-400">|</span>
            <span className="text-green-600 font-bold">✓ {selectedElement === 'signature' ? 'التوقيع' : 'الختم'} محدد</span>
          </>
        )}
      </div>

      <div style={{ marginTop: '50px' }}>
        {/* Title - Draggable */}
        <div 
          className={`mb-6 ${onTitleChange ? 'cursor-grab hover:bg-blue-50/50 rounded transition-colors' : ''}`}
          style={{
            transform: `translate(${titleOffset.x}px, ${titleOffset.y}px)`,
          }}
          onMouseDown={onTitleChange ? (e) => {
            if (e.target.tagName === 'INPUT') return;
            handleItemMouseDown('title', e);
          } : undefined}
        >
          {onTitleChange ? (
            <input
              value={customTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-center text-black text-2xl font-bold w-full bg-transparent border-none outline-none focus:bg-blue-50 rounded"
              style={{ direction: 'rtl' }}
            />
          ) : (
            <h1 className="text-center text-black text-2xl font-bold">{customTitle}</h1>
          )}
        </div>

        {/* Table Container - Draggable */}
        <div 
          className={`relative ${onAssignmentsChange ? 'cursor-grab' : ''}`}
          style={{
            transform: `translate(${tableOffset.x}px, ${tableOffset.y}px)`,
          }}
          onMouseDown={onAssignmentsChange ? (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('.no-drag')) return;
            handleItemMouseDown('table', e);
          } : undefined}
        >
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="relative no-drag">
            {onAssignmentsChange && (
              <button 
                onClick={addColumn}
                className="absolute -top-7 right-0 bg-green-500 text-white px-2 py-1 rounded text-xs no-print hover:bg-green-600 shadow-sm z-20 flex items-center gap-1"
              >
                <Plus size={12} /> عمود
              </button>
            )}

            <div className="border-2 border-black mb-6 overflow-visible rounded-sm shadow-sm">
              {/* Table Header */}
              <Droppable droppableId="columns" direction="horizontal">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="flex bg-sky-100 border-b-2 border-black"
                  >
                    {columns.map((col, index) => (
                      <Draggable key={col.id} draggableId={col.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative p-2 text-center font-bold text-xs border-l-2 border-black flex items-center justify-center last:border-l-0 ${snapshot.isDragging ? 'bg-blue-200' : ''} group/col`}
                            style={{ 
                              width: `${col.width}px`,
                              minWidth: `${col.width}px`,
                              ...provided.draggableProps.style,
                              flexShrink: 0,
                              backgroundColor: snapshot.isDragging ? '#bfdbfe' : '#e0f2fe',
                            }}
                          >
                            <div {...provided.dragHandleProps} className="no-print absolute right-0.5 top-0.5 cursor-grab text-gray-400 hover:text-gray-700">
                              <GripVertical size={10} />
                            </div>

                            {onAssignmentsChange ? (
                              <input 
                                value={col.label}
                                onChange={(e) => updateColumnLabel(col.id, e.target.value)}
                                className="bg-transparent text-center w-full font-bold outline-none focus:bg-white/50 rounded px-1 text-xs"
                              />
                            ) : (
                              <span className="text-xs">{col.label}</span>
                            )}

                            {onAssignmentsChange && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeColumn(col.id);
                                }}
                                className="absolute left-0.5 top-0.5 text-red-400 hover:text-red-600 no-print opacity-0 group-hover/col:opacity-100 transition-opacity text-xs"
                                title="حذف العمود"
                              >
                                ×
                              </button>
                            )}

                            <div 
                              className="no-print absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-400 z-10 opacity-0 hover:opacity-100"
                              onMouseDown={(e) => handleResizeStart(e, col.id, col.width)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Table Body */}
              <div className="bg-white">
                {assignments.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex border-b border-black last:border-b-0">
                    {columns.map((col) => {
                      let displayValue = row[col.id];
                      
                      if (col.id === 'full_duration' && !displayValue && !col.isCustom) {
                        displayValue = buildFullDuration(row);
                      }

                      return (
                        <div 
                          key={col.id}
                          className="editable-cell p-1 text-center text-xs border-l border-black last:border-l-0"
                          style={{ 
                            width: `${col.width}px`, 
                            minWidth: `${col.width}px`,
                            flexShrink: 0 
                          }}
                        >
                          <textarea
                            className={`w-full text-center bg-transparent border-none outline-none resize-none ${onAssignmentsChange ? 'focus:bg-blue-50 rounded cursor-text' : ''}`}
                            style={{ 
                              fontSize: '11px', 
                              fontFamily: 'inherit', 
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.4',
                              minHeight: '36px'
                            }}
                            rows={2}
                            value={displayValue || ''}
                            readOnly={!onAssignmentsChange}
                            onChange={(e) => {
                              if(onAssignmentsChange) {
                                onAssignmentsChange(rowIndex, col.id, e.target.value);
                              }
                            }}
                            onInput={(e) => {
                              e.target.style.height = 'auto';
                              e.target.style.height = Math.max(36, e.target.scrollHeight) + 'px';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
                {assignments.length === 0 && (
                  <div className="p-6 text-center text-gray-500 text-sm">لا توجد بيانات</div>
                )}
              </div>
            </div>
          </div>
        </DragDropContext>
        </div>

        {/* Intro - Draggable (moved below table) */}
        <div 
          className={`mb-4 ${onIntroChange ? 'cursor-grab hover:bg-blue-50/50 rounded transition-colors' : ''}`}
          style={{
            transform: `translate(${introOffset.x}px, ${introOffset.y}px)`,
          }}
          onMouseDown={onIntroChange ? (e) => {
            if (e.target.tagName === 'TEXTAREA') return;
            handleItemMouseDown('intro', e);
          } : undefined}
        >
          {onIntroChange ? (
            <textarea
              value={customIntro}
              onChange={(e) => onIntroChange(e.target.value)}
              className="w-full text-center text-base font-bold bg-transparent border-none outline-none focus:bg-blue-50 rounded p-2 resize-none"
              rows={3}
              style={{ lineHeight: '1.8' }}
            />
          ) : (
            <p className="text-center text-base font-bold leading-relaxed whitespace-pre-wrap">
              {customIntro}
            </p>
          )}
        </div>

        {/* Free Text Area - Draggable */}
        {(freeText || onFreeTextChange) && (
          <div 
            className={`relative mb-6 ${onFreeTextChange ? 'cursor-grab' : ''}`}
            style={{
              transform: `translate(${freeTextOffset.x}px, ${freeTextOffset.y}px)`,
            }}
            onMouseDown={onFreeTextChange ? (e) => {
              if (e.target.tagName === 'TEXTAREA') return;
              handleItemMouseDown('freeText', e);
            } : undefined}
          >
            {onFreeTextChange ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-yellow-50/50 hover:border-blue-400 transition-colors">
                <p className="text-xs text-gray-500 mb-2 no-print">خطاب حر (قابل للسحب والتحريك)</p>
                <textarea
                  value={freeText}
                  onChange={(e) => {
                    setFreeText(e.target.value);
                    if (onFreeTextChange) onFreeTextChange(e.target.value);
                  }}
                  className="w-full bg-transparent border-none outline-none resize-y text-sm leading-relaxed min-h-[100px]"
                  rows={4}
                  placeholder="اكتب هنا نص حر إضافي..."
                  style={{ lineHeight: '1.8' }}
                />
              </div>
            ) : freeText ? (
              <div className="px-2">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{freeText}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Decision Points - Draggable */}
        <div 
          className={`mb-6 px-2 ${onDecisionPointsChange ? 'cursor-grab hover:bg-blue-50/50 rounded transition-colors' : ''}`}
          style={{
            transform: `translate(${decisionPointsOffset.x}px, ${decisionPointsOffset.y}px)`,
          }}
          onMouseDown={onDecisionPointsChange ? (e) => {
            if (e.target.tagName === 'TEXTAREA') return;
            handleItemMouseDown('decisionPoints', e);
          } : undefined}
        >
          <div className="space-y-2 text-right mr-6 text-sm">
            {decisionPoints.map((point, idx) => (
              <div key={idx} className="flex gap-2">
                {showNumbering && <span className="font-bold flex-shrink-0">{idx + 1}-</span>}
                {onDecisionPointsChange ? (
                  <textarea
                    value={point}
                    onChange={(e) => {
                      const newPoints = [...decisionPoints];
                      newPoints[idx] = e.target.value;
                      onDecisionPointsChange(newPoints);
                    }}
                    className="flex-1 bg-transparent border-none outline-none focus:bg-blue-50 rounded resize-none text-sm"
                    rows={2}
                    style={{ lineHeight: '1.6' }}
                  />
                ) : (
                  <p className="leading-relaxed">{point}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Closing - Draggable */}
        <div 
          className={`mb-6 ${onClosingChange ? 'cursor-grab hover:bg-blue-50/50 rounded transition-colors' : ''}`}
          style={{
            transform: `translate(${closingOffset.x}px, ${closingOffset.y}px)`,
          }}
          onMouseDown={onClosingChange ? (e) => {
            if (e.target.tagName === 'INPUT') return;
            handleItemMouseDown('closing', e);
          } : undefined}
        >
          {onClosingChange ? (
            <input
              value={customClosing}
              onChange={(e) => onClosingChange(e.target.value)}
              className="w-full text-center text-base font-bold bg-transparent border-none outline-none focus:bg-blue-50 rounded"
            />
          ) : (
            <p className="text-center text-base font-bold">{customClosing}</p>
          )}
        </div>

        {/* Footer / Signature - with individual draggable elements */}
        <div className="relative mt-10 px-8" style={{ minHeight: '250px' }}>
            
            {/* Manager Title & Name - Draggable */}
            <div
              className={`draggable-item no-print ${draggingItem === 'managerName' ? 'opacity-70' : ''}`}
              style={{ 
                position: 'absolute',
                right: '50px',
                top: '0px',
                transform: `translate(${managerNameOffset.x}px, ${managerNameOffset.y}px)`,
                zIndex: draggingItem === 'managerName' ? 100 : 10,
                background: 'rgba(255,255,255,0.9)',
                padding: '8px',
                borderRadius: '4px',
                border: '1px dashed #ccc',
                cursor: 'grab',
                textAlign: 'center'
              }}
              onMouseDown={(e) => handleItemMouseDown('managerName', e)}
            >
              <p className="font-bold text-lg mb-2">{managerTitle}</p>
              <p className="font-bold text-lg">{managerName}</p>
            </div>

            {/* Print version - static */}
            <div className="hidden print:block absolute right-12 top-0 text-center">
              <p className="font-bold text-lg mb-2">{managerTitle}</p>
              <p className="font-bold text-lg mt-6">{managerName}</p>
            </div>

            {/* Signature Image - Draggable */}
            <div
              className={`draggable-item no-print ${draggingItem === 'signature' ? 'opacity-70' : ''} ${selectedElement === 'signature' ? 'ring-2 ring-blue-500' : ''}`}
              style={{ 
                position: 'absolute',
                right: '100px',
                top: '60px',
                transform: `translate(${signatureOffset.x}px, ${signatureOffset.y}px)`,
                zIndex: draggingItem === 'signature' ? 100 : 20,
                padding: '4px',
                border: selectedElement === 'signature' ? '2px solid #3b82f6' : '1px dashed transparent',
                borderRadius: '4px',
                cursor: 'grab'
              }}
              onMouseDown={(e) => handleItemMouseDown('signature', e)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(selectedElement === 'signature' ? null : 'signature');
              }}
              onMouseEnter={(e) => { if (selectedElement !== 'signature') e.currentTarget.style.borderColor = '#3b82f6'; }}
              onMouseLeave={(e) => { if (selectedElement !== 'signature') e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png"
                alt="التوقيع"
                style={{ 
                  width: `${signatureSize}px`, 
                  mixBlendMode: 'darken',
                  transform: 'rotate(-5deg)',
                  pointerEvents: 'none'
                }}
                draggable={false}
              />
              {selectedElement === 'signature' && (
                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-blue-600 bg-white/80 rounded px-1">
                  Ctrl+/- للتحكم بالحجم ({signatureSize}px)
                </div>
              )}
            </div>

            {/* Stamp Image - Draggable */}
            <div
              className={`draggable-item no-print ${draggingItem === 'stamp' ? 'opacity-70' : ''} ${selectedElement === 'stamp' ? 'ring-2 ring-red-500' : ''}`}
              style={{ 
                position: 'absolute',
                right: '20px',
                top: '80px',
                transform: `translate(${stampOffset.x}px, ${stampOffset.y}px)`,
                zIndex: draggingItem === 'stamp' ? 100 : 15,
                padding: '4px',
                border: selectedElement === 'stamp' ? '2px solid #ef4444' : '1px dashed transparent',
                borderRadius: '4px',
                cursor: 'grab'
              }}
              onMouseDown={(e) => handleItemMouseDown('stamp', e)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(selectedElement === 'stamp' ? null : 'stamp');
              }}
              onMouseEnter={(e) => { if (selectedElement !== 'stamp') e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseLeave={(e) => { if (selectedElement !== 'stamp') e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png"
                alt="الختم"
                style={{ 
                  width: `${currentStampSize}px`, 
                  opacity: 0.9,
                  mixBlendMode: 'multiply',
                  pointerEvents: 'none'
                }}
                draggable={false}
              />
              {selectedElement === 'stamp' && (
                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-red-600 bg-white/80 rounded px-1">
                  Ctrl+/- للتحكم بالحجم ({currentStampSize}px)
                </div>
              )}
            </div>

            {/* Print versions - static */}
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png"
              alt="التوقيع"
              className="hidden print:block"
              style={{ 
                position: 'absolute',
                right: '100px',
                top: '60px',
                width: `${signatureSize}px`, 
                mixBlendMode: 'darken',
                transform: 'rotate(-5deg)'
              }}
            />
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png"
              alt="الختم"
              className="hidden print:block"
              style={{ 
                position: 'absolute',
                right: '20px',
                top: '80px',
                width: `${currentStampSize}px`, 
                opacity: 0.9,
                mixBlendMode: 'multiply'
              }}
            />
        </div>
      </div>
    </div>
  );
}

export { MultipleAssignmentTemplate };