import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus } from 'lucide-react';

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
}) {
  const containerRef = useRef(null);
  
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
  
  // Separate draggable positions
  const [signaturePos, setSignaturePos] = useState({ x: 150, y: 0 });
  const [stampPos, setStampPos] = useState({ x: 50, y: -50 });
  const [managerNamePos, setManagerNamePos] = useState({ x: 0, y: 0 });
  const [tablePos, setTablePos] = useState({ x: 0, y: 0 });
  const [freeTextPos, setFreeTextPos] = useState({ x: 0, y: 0 });
  
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  // Dragging for signature/stamp/managerName
  const handleItemMouseDown = (itemType, e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDraggingItem(itemType);
  };

  useEffect(() => {
    if (!draggingItem) return;

    const handleMouseMove = (e) => {
      const parent = e.target.closest('.signature-container');
      if (!parent) return;
      
      const parentRect = parent.getBoundingClientRect();
      const newX = e.clientX - parentRect.left - dragOffset.x;
      const newY = e.clientY - parentRect.top - dragOffset.y;
      
      if (draggingItem === 'signature') {
        setSignaturePos({ x: newX, y: newY });
      } else if (draggingItem === 'stamp') {
        setStampPos({ x: newX, y: newY });
      } else if (draggingItem === 'managerName') {
        setManagerNamePos({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => setDraggingItem(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingItem, dragOffset]);

  // Keyboard shortcut for font size
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.toString()) {
          const range = selection.getRangeAt(0);
          const span = document.createElement('span');
          span.style.fontSize = '1.2em';
          range.surroundContents(span);
        }
      } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.toString()) {
          const range = selection.getRangeAt(0);
          const span = document.createElement('span');
          span.style.fontSize = '0.85em';
          range.surroundContents(span);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const letterheadUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/20b408cf3_.png";

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
    >
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          .no-print { display: none !important; }
          .print-area { 
            width: 210mm !important; 
            min-height: 297mm !important;
            box-shadow: none !important;
          }
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

      {/* Controls Panel */}
      {onAssignmentsChange && (
        <div className="no-print absolute top-2 left-2 bg-white/90 backdrop-blur rounded-lg shadow-lg p-2 z-50 flex gap-2 items-center text-xs">
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
          <span className="text-gray-600">Ctrl+ تكبير | Ctrl- تصغير</span>
          <span className="text-gray-400">|</span>
          <span className="text-blue-600">اسحب التوقيع والختم والاسم</span>
        </div>
      )}

      <div style={{ marginTop: '50px' }}>
        {/* Title */}
        <div className="mb-6">
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

        {/* Intro */}
        <div className="mb-4">
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

        {/* Table Container */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="relative">
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

                            {onAssignmentsChange && col.isCustom && (
                              <button 
                                onClick={() => removeColumn(col.id)}
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

        {/* Decision Points */}
        <div className="mb-6 px-2">
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

        {/* Closing */}
        <div className="mb-6">
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
        <div className="signature-container relative mt-10 px-8 flex justify-end" style={{ minHeight: '200px' }}>
          <div className="text-center relative" style={{ minWidth: '300px' }}>
            
            {/* Manager Title & Name - Draggable */}
            <div
              className={`draggable-item no-print ${draggingItem === 'managerName' ? 'opacity-70' : ''}`}
              style={{ 
                position: managerNamePos.x !== 0 || managerNamePos.y !== 0 ? 'absolute' : 'relative',
                left: managerNamePos.x !== 0 || managerNamePos.y !== 0 ? `${managerNamePos.x}px` : 'auto',
                top: managerNamePos.x !== 0 || managerNamePos.y !== 0 ? `${managerNamePos.y}px` : 'auto',
                zIndex: draggingItem === 'managerName' ? 100 : 10,
                background: 'rgba(255,255,255,0.9)',
                padding: '8px',
                borderRadius: '4px',
                border: '1px dashed #ccc'
              }}
              onMouseDown={(e) => handleItemMouseDown('managerName', e)}
            >
              <p className="font-bold text-lg mb-2">{managerTitle}</p>
              <p className="font-bold text-lg">{managerName}</p>
            </div>

            {/* Print version - static */}
            <div className="hidden print:block">
              <p className="font-bold text-lg mb-2">{managerTitle}</p>
              <p className="font-bold text-lg mt-6">{managerName}</p>
            </div>

            {/* Signature Image - Draggable */}
            <div
              className={`draggable-item no-print ${draggingItem === 'signature' ? 'opacity-70' : ''}`}
              style={{ 
                position: 'absolute',
                left: `${signaturePos.x}px`, 
                top: `${signaturePos.y}px`,
                zIndex: draggingItem === 'signature' ? 100 : 20,
                padding: '4px',
                border: '1px dashed transparent',
                borderRadius: '4px'
              }}
              onMouseDown={(e) => handleItemMouseDown('signature', e)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png"
                alt="التوقيع"
                style={{ 
                  width: '150px', 
                  mixBlendMode: 'darken',
                  transform: 'rotate(-5deg)',
                  pointerEvents: 'none'
                }}
                draggable={false}
              />
            </div>

            {/* Stamp Image - Draggable */}
            <div
              className={`draggable-item no-print ${draggingItem === 'stamp' ? 'opacity-70' : ''}`}
              style={{ 
                position: 'absolute',
                left: `${stampPos.x}px`, 
                top: `${stampPos.y}px`,
                zIndex: draggingItem === 'stamp' ? 100 : 15,
                padding: '4px',
                border: '1px dashed transparent',
                borderRadius: '4px'
              }}
              onMouseDown={(e) => handleItemMouseDown('stamp', e)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png"
                alt="الختم"
                style={{ 
                  width: `${stampSize}px`, 
                  opacity: 0.9,
                  mixBlendMode: 'multiply',
                  pointerEvents: 'none'
                }}
                draggable={false}
              />
            </div>

            {/* Print versions - static */}
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png"
              alt="التوقيع"
              className="hidden print:block"
              style={{ 
                position: 'absolute',
                left: `${signaturePos.x}px`, 
                top: `${signaturePos.y}px`,
                width: '150px', 
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
                left: `${stampPos.x}px`, 
                top: `${stampPos.y}px`,
                width: `${stampSize}px`, 
                opacity: 0.9,
                mixBlendMode: 'multiply'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}