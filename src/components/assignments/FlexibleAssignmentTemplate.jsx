import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const getDayName = (dateString) => {
  try {
    const date = new Date(dateString);
    return format(date, 'EEEE', { locale: ar });
  } catch (error) {
    return '';
  }
};

export default function FlexibleAssignmentTemplate({ 
  assignment, 
  employee, 
  showDurationInTable = true, 
  showDurationInParagraph = true,
  customDurationText = null,
  customParagraph1 = null,
  customAssignmentType = null,
  customParagraph2 = null,
  customParagraph3 = null,
  customParagraph4 = null,
  customParagraph5 = null,
  customClosing = null,
  customTitle = 'تكليف',
  customIntro = null,
  showNumbering = true,
  customTextBefore = null,
  customTextAfter = null,
  customTextAfterPosition = { x: 300, y: 750 },
  customTextAfterStyle = { size: 14, font: 'Arial', bold: false, align: 'center' },
  paragraphAlign = 'right',
  multiplePeriods = false,
  additionalPeriods = [],
  tableLayout = 'horizontal',
  customTableHeaders = null,
  signaturePosition = { x: 420, y: 520 },
  stampPosition = { x: 350, y: 600 },
  managerNamePosition = { x: 300, y: 480 },
  stampSize = 150,
  tableBorderWidth = 2,
  tableBorderColor = '#000000',
  tableColumnWidths = {},
  tableRowHeights = {},
  onTableColumnWidthChange = null,
  onTableRowHeightChange = null,
  enableTableResize = false,
  cellBorders = {},
  onCellBorderChange = null,
  customCellValues = {},
  onCellValueChange = null,
  textStyles = {
    title: { size: 24, font: 'Arial', bold: true },
    intro: { size: 16, font: 'Arial', bold: true },
    paragraph1: { size: 16, font: 'Arial', bold: false },
    paragraph2: { size: 16, font: 'Arial', bold: false },
    paragraph3: { size: 16, font: 'Arial', bold: false },
    paragraph4: { size: 16, font: 'Arial', bold: false },
    paragraph5: { size: 16, font: 'Arial', bold: false },
    closing: { size: 16, font: 'Arial', bold: true },
    managerName: { size: 16, font: 'Arial', bold: true },
    tableHeaders: { size: 14, font: 'Arial', bold: true },
    tableData: { size: 14, font: 'Arial', bold: false }
  },
  paragraphPositions = {},
  enableParagraphDrag = false
}) {
  // حالة السحب للأعمدة والصفوف
  const [resizing, setResizing] = useState({ type: null, key: null });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState(0);

  // Effect للسحب
  useEffect(() => {
    if (!resizing.type) return;

    const handleMouseMove = (e) => {
      if (resizing.type === 'col') {
        // In RTL: 
        // Right edge (side='right'): Dragging Right (increasing clientX) should INCREASE width.
        // Left edge (side='left'): Dragging Left (decreasing clientX) should INCREASE width.
        
        let diff = 0;
        if (resizing.side === 'right') {
           diff = e.clientX - startPos.x;
        } else {
           diff = startPos.x - e.clientX;
        }
        
        const newWidth = Math.max(50, Math.min(800, startSize + diff));
        if (onTableColumnWidthChange) {
          onTableColumnWidthChange(resizing.key, newWidth);
        }
      } else if (resizing.type === 'row') {
        const diff = e.clientY - startPos.y;
        const newHeight = Math.max(25, startSize + diff); // Removed max height limit
        if (onTableRowHeightChange) {
          onTableRowHeightChange(resizing.key, newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setResizing({ type: null, key: null });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, startPos, startSize, onTableColumnWidthChange, onTableRowHeightChange]);

  if (!assignment) {
    return <div className="p-6 text-center">لا توجد بيانات تكليف لعرضها</div>;
  }

  const isFemale = assignment.gender === 'أنثى';
  const formattedStartDate = assignment.start_date ? format(new Date(assignment.start_date), "dd-MM-yyyy") : '____-___-____';
  const formattedEndDate = assignment.end_date ? format(new Date(assignment.end_date), "dd-MM-yyyy") : '____-___-____';
  const startDayName = assignment.start_date ? getDayName(assignment.start_date) : '';
  const endDayName = assignment.end_date ? getDayName(assignment.end_date) : '';

  const headers = customTableHeaders || {
    name: 'الاسم',
    position: 'المسمى الوظيفي',
    employeeNumber: 'الرقم الوظيفي',
    assignmentType: 'نوع التكليف',
    fromCenter: 'جهة العمل',
    toCenter: 'جهة التكليف',
    duration: 'مدة التكليف'
  };

  const showEmployeeNumber = customTableHeaders?.showEmployeeNumber !== false;

  const handleColMouseDown = (e, colKey, side) => {
    if (!enableTableResize) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing({ type: 'col', key: colKey, side });
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize(tableColumnWidths[colKey] || 150);
  };

  const handleRowMouseDown = (e, rowKey) => {
    if (!enableTableResize) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing({ type: 'row', key: rowKey });
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize(tableRowHeights[rowKey] || 40);
  };

  const getColWidth = (colKey, defaultWidth = 150) => tableColumnWidths[colKey] || defaultWidth;
  const getRowHeight = (rowKey, defaultHeight = 40) => tableRowHeights[rowKey] || defaultHeight;
  
  // دالة للحصول على حدود الخلية
  const getCellBorder = (cellKey) => {
    const defaultBorder = `${tableBorderWidth}px solid ${tableBorderColor}`;
    if (cellBorders[cellKey]) {
      const cb = cellBorders[cellKey];
      return `${cb.width || tableBorderWidth}px ${cb.style || 'solid'} ${cb.color || tableBorderColor}`;
    }
    return defaultBorder;
  };
  
  // مكون للتعامل مع الضغط على الخلية
  const handleCellClick = (e, cellKey) => {
    if (!onCellBorderChange) return;
    e.stopPropagation();
    
    // الحصول على الإعدادات الحالية للخلية
    const currentBorder = cellBorders[cellKey] || { 
      width: tableBorderWidth, 
      color: tableBorderColor, 
      style: 'solid' 
    };
    
    // إرسال معلومات الخلية للصفحة الأب
    onCellBorderChange(cellKey, currentBorder, e);
  };

  const ColResizer = ({ colKey, side = 'left' }) => enableTableResize ? (
    <div 
      className="no-print"
      style={{ 
        position: 'absolute', 
        [side]: '-3px', 
        top: 0, 
        bottom: 0, 
        width: '6px', 
        cursor: 'col-resize', 
        backgroundColor: resizing.key === colKey ? '#3b82f6' : 'transparent',
        zIndex: 10
      }}
      onMouseDown={(e) => handleColMouseDown(e, colKey, side)}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#93c5fd'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = resizing.key === colKey ? '#3b82f6' : 'transparent'}
    />
  ) : null;

  const RowResizer = ({ rowKey }) => enableTableResize ? (
    <div 
      className="no-print row-resizer"
      style={{ 
        position: 'absolute', 
        left: 0, 
        right: 0, 
        bottom: '-4px', 
        height: '8px', 
        cursor: 'row-resize', 
        backgroundColor: resizing.key === rowKey ? '#3b82f6' : 'transparent',
        zIndex: 20,
        transition: 'background-color 0.15s'
      }}
      onMouseDown={(e) => handleRowMouseDown(e, rowKey)}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#60a5fa'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = resizing.key === rowKey ? '#3b82f6' : 'transparent'}
    />
  ) : null;

  const formatPeriod = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const startFormatted = format(start, "dd-MM-yyyy");
    const endFormatted = format(end, "dd-MM-yyyy");
    const startDay = format(start, 'EEEE', { locale: ar });
    const endDay = format(end, 'EEEE', { locale: ar });
    
    if (days === 1) {
      return `يوم ${startDay} ${startFormatted}م`;
    } else {
      return `من ${startDay} ${startFormatted}م حتى ${endDay} ${endFormatted}م`;
    }
  };

  const getDurationText = () => {
    if (customDurationText) {
      return <span dangerouslySetInnerHTML={{ __html: customDurationText.replace(/\n/g, '<br/>') }} />;
    }

    const days = assignment.duration_days;
    if (!days) return '';
    
    // إذا كانت هناك فترات متعددة
    if (multiplePeriods && additionalPeriods.length > 0) {
      const allPeriods = [
        { start_date: assignment.start_date, end_date: assignment.end_date },
        ...additionalPeriods.filter(p => p.start_date && p.end_date)
      ];
      
      return (
        <>
          على الفترات التالية:<br />
          {allPeriods.map((period, index) => (
            <span key={index}>
              {index + 1}- {formatPeriod(period.start_date, period.end_date)}
              {index < allPeriods.length - 1 && <br />}
            </span>
          ))}
        </>
      );
    }
    
    if (days === 1) {
      return <>لمدة يوم&nbsp;واحد والموافق يوم {startDayName} {formattedStartDate}م.</>;
    } else if (days === 2) {
      return <>لمدة يومين،<br />اعتباراً&nbsp;من {startDayName} {formattedStartDate}م حتى {endDayName} {formattedEndDate}م.</>;
    } else if (days >= 3 && days <= 10) {
      return <>لمدة {days}&nbsp;أيام،<br />اعتباراً&nbsp;من {startDayName} {formattedStartDate}م حتى {endDayName} {formattedEndDate}م.</>;
    } else {
      return <>لمدة {days}&nbsp;يوم،<br />اعتباراً&nbsp;من {startDayName} {formattedStartDate}م حتى {endDayName} {formattedEndDate}م.</>;
    }
  };

  const getSingleLineDurationText = () => {
    if (customDurationText) {
      return customDurationText.replace(/<br\s*\/?>/gi, ' ');
    }
    
    const days = assignment.duration_days;
    if (!days) return '';
    
    // إذا كانت هناك فترات متعددة
    if (multiplePeriods && additionalPeriods.length > 0) {
      const allPeriods = [
        { start_date: assignment.start_date, end_date: assignment.end_date },
        ...additionalPeriods.filter(p => p.start_date && p.end_date)
      ];
      
      return `فترات متعددة (${allPeriods.length} فترات)`;
    }
    
    if (days === 1) {
      return `لمدة يوم\u00A0واحد والموافق يوم ${startDayName} ${formattedStartDate}م`;
    } else if (days === 2) {
      return `لمدة يومين، اعتباراً\u00A0من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م`;
    } else if (days >= 3 && days <= 10) {
      return `لمدة ${days}\u00A0أيام، اعتباراً\u00A0من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م`;
    } else {
      return `لمدة ${days}\u00A0يوم، اعتباراً\u00A0من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م`;
    }
  };

  const getParagraph1Text = () => {
    if (customParagraph1) {
      return <span dangerouslySetInnerHTML={{ __html: customParagraph1.replace(/\n/g, '<br/>') }} />;
    }
    
    return (
      <>
        تكليف الموضح{isFemale ? 'ة' : ''} بيانات{isFemale ? 'ها' : 'ه'} أعلاه لتغطية العمل في <strong>({assignment.assigned_to_health_center || 'غير محدد'})</strong> {showDurationInParagraph && getDurationText()}
      </>
    );
  };

  const getParagraph2Text = () => {
    if (customParagraph2) {
      return <span dangerouslySetInnerHTML={{ __html: customParagraph2.replace(/\n/g, '<br/>') }} />;
    }
    return 'لا يترتب على هذا القرار أي ميزة مالية إلا ما يقره النظام.';
  };

  const getParagraph3Text = () => {
    if (customParagraph3) {
      return <span dangerouslySetInnerHTML={{ __html: customParagraph3.replace(/\n/g, '<br/>') }} />;
    }
    return (
      <>
        نسخة لـ <strong>({assignment.from_health_center || 'غير محدد'})</strong> لإبلاغ المذكور{isFemale ? 'ة' : ''} وتزويد{isFemale ? 'ها' : 'ه'} بنسخة من القرار.
      </>
    );
  };

  const getParagraph4Text = () => {
    if (customParagraph4) {
      return <span dangerouslySetInnerHTML={{ __html: customParagraph4.replace(/\n/g, '<br/>') }} />;
    }
    return (
      <>
        نسخة لـ <strong>({assignment.assigned_to_health_center || 'غير محدد'})</strong> لتمكين{isFemale ? 'ها' : 'ه'} من المباشرة وأداء مهام عمل{isFemale ? 'ها' : 'ه'}.
      </>
    );
  };

  const getParagraph5Text = () => {
    if (customParagraph5) {
      return <span dangerouslySetInnerHTML={{ __html: customParagraph5.replace(/\n/g, '<br/>') }} />;
    }
    return 'يتم تنفيذ هذا القرار كلاً فيما يخصه.';
  };

  const getClosingText = () => {
    if (customClosing) {
      return customClosing;
    }
    return 'خالص التحايا ،،،';
  };

  const letterheadUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/20b408cf3_.png";

  const renderHorizontalTable = () => (
    <table className="text-sm" style={{ 
      minWidth: '100%',
      width: 'max-content', 
      borderCollapse: 'collapse',
      borderSpacing: 0,
      position: 'relative',
      tableLayout: 'fixed'
    }}>
      <tbody>
        <tr style={{ height: `${getRowHeight('row-name')}px`, position: 'relative' }}>
                        <td 
                          className="bg-gray-100 text-center" 
                          style={{ 
                            fontSize: `${textStyles.tableHeaders.size}px`, 
                            fontFamily: textStyles.tableHeaders.font,
                            fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
                            border: getCellBorder('name-header'),
                            width: `${getColWidth('col-header', 120)}px`,
                            padding: '6px 8px',
                            position: 'relative',
                            whiteSpace: 'nowrap',
                            cursor: onCellBorderChange ? 'pointer' : 'default'
                          }}
                          onClick={(e) => handleCellClick(e, 'name-header')}
                        >
                          {headers.name}
                          <ColResizer colKey="col-header" side="left" />
                          <ColResizer colKey="col-header-right" side="right" />
                          <RowResizer rowKey="row-name-top" side="top" />
                        </td>
                        <td 
                          className="text-center" 
                          colSpan={showEmployeeNumber ? 3 : 1} 
                          style={{ 
                            fontSize: `${textStyles.tableData.size}px`, 
                            fontFamily: textStyles.tableData.font,
                            fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
                            border: getCellBorder('name-data'),
                            padding: '6px 8px',
                            position: 'relative',
                            whiteSpace: 'pre-wrap',
                            cursor: onCellBorderChange ? 'pointer' : 'default'
                          }}
                          onClick={(e) => handleCellClick(e, 'name-data')}
                        >
                          {onCellValueChange ? (
                            <textarea
                              value={customCellValues['name-data'] !== undefined ? customCellValues['name-data'] : (assignment.employee_name || 'غير محدد')}
                              onChange={(e) => onCellValueChange('name-data', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full text-center bg-transparent border-none outline-none focus:bg-blue-50 rounded resize-none overflow-hidden"
                              style={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', whiteSpace: 'pre-wrap' }}
                              rows={1}
                              onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                            />
                          ) : (customCellValues['name-data'] !== undefined ? customCellValues['name-data'] : (assignment.employee_name || 'غير محدد'))}
                          <ColResizer colKey="col-data" side="left" />
                          <ColResizer colKey="col-data-right" side="right" />
                          <RowResizer rowKey="row-name" />
                        </td>
                      </tr>
        <tr style={{ height: `${getRowHeight('row-position')}px`, position: 'relative' }}>
            <td 
              className="bg-gray-100 text-center" 
              style={{ 
                fontSize: `${textStyles.tableHeaders.size}px`, 
                fontFamily: textStyles.tableHeaders.font,
                fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
                border: getCellBorder('position-header'),
                padding: '6px 8px',
                width: showEmployeeNumber ? '15%' : '25%',
                position: 'relative',
                whiteSpace: 'nowrap',
                cursor: onCellBorderChange ? 'pointer' : 'default'
              }}
              onClick={(e) => handleCellClick(e, 'position-header')}
            >
              {headers.position}
              <ColResizer colKey="col-pos-header" />
            </td>
            <td 
              className="text-center" 
              style={{ 
                fontSize: `${textStyles.tableData.size}px`, 
                fontFamily: textStyles.tableData.font,
                fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
                border: getCellBorder('position-data'),
                padding: '6px 8px',
                position: 'relative',
                width: showEmployeeNumber ? '35%' : '75%',
                whiteSpace: 'pre-wrap',
                cursor: onCellBorderChange ? 'pointer' : 'default'
                }}
                onClick={(e) => handleCellClick(e, 'position-data')}
                >
                {onCellValueChange ? (
                <textarea
                  value={customCellValues['position-data'] !== undefined ? customCellValues['position-data'] : (assignment.employee_position || 'غير محدد')}
                  onChange={(e) => onCellValueChange('position-data', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center bg-transparent border-none outline-none focus:bg-blue-50 rounded resize-none overflow-hidden"
                  style={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', whiteSpace: 'pre-wrap' }}
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
              ) : (customCellValues['position-data'] !== undefined ? customCellValues['position-data'] : (assignment.employee_position || 'غير محدد'))}
              <ColResizer colKey="col-pos-data" />
            </td>
            {showEmployeeNumber && (
            <>
            <td 
              className="bg-gray-100 text-center" 
              style={{ 
                fontSize: `${textStyles.tableHeaders.size}px`, 
                fontFamily: textStyles.tableHeaders.font,
                fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
                border: getCellBorder('empnum-header'),
                padding: '6px 8px',
                width: '15%',
                position: 'relative',
                whiteSpace: 'nowrap',
                cursor: onCellBorderChange ? 'pointer' : 'default'
              }}
              onClick={(e) => handleCellClick(e, 'empnum-header')}
            >
              {headers.employeeNumber || 'الرقم الوظيفي'}
              <ColResizer colKey="col-emp-header" />
            </td>
            <td 
              className="text-center" 
              style={{ 
                fontSize: `${textStyles.tableData.size}px`, 
                fontFamily: textStyles.tableData.font,
                fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
                border: getCellBorder('empnum-data'),
                padding: '6px 8px',
                position: 'relative',
                width: '35%',
                whiteSpace: 'pre-wrap',
                cursor: onCellBorderChange ? 'pointer' : 'default'
                }}
                onClick={(e) => handleCellClick(e, 'empnum-data')}
                >
                {onCellValueChange ? (
                <textarea
                  value={customCellValues['empnum-data'] !== undefined ? customCellValues['empnum-data'] : (employee?.رقم_الموظف || assignment.employee_national_id || 'غير محدد')}
                  onChange={(e) => onCellValueChange('empnum-data', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center bg-transparent border-none outline-none focus:bg-blue-50 rounded resize-none overflow-hidden"
                  style={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', whiteSpace: 'pre-wrap' }}
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
              ) : (customCellValues['empnum-data'] !== undefined ? customCellValues['empnum-data'] : (employee?.رقم_الموظف || assignment.employee_national_id || 'غير محدد'))}
              <RowResizer rowKey="row-position" />
              <ColResizer colKey="col-emp-data" />
            </td>
            </>
            )}
          </tr>
          <tr style={{ height: `${getRowHeight('row-type')}px`, position: 'relative' }}>
                          <td 
                            className="bg-gray-100 text-center" 
                            style={{ 
                              fontSize: `${textStyles.tableHeaders.size}px`, 
                              fontFamily: textStyles.tableHeaders.font,
                              fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
                              border: getCellBorder('type-header'),
                              padding: '6px 8px',
                              whiteSpace: 'nowrap',
                              cursor: onCellBorderChange ? 'pointer' : 'default'
                            }}
                            onClick={(e) => handleCellClick(e, 'type-header')}
                          >{headers.assignmentType}</td>
                          <td 
                            className="text-center" 
                            colSpan={showEmployeeNumber ? 3 : 1} 
                            style={{ 
                              fontSize: `${textStyles.tableData.size}px`, 
                              fontFamily: textStyles.tableData.font,
                              fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
                              border: getCellBorder('type-data'),
                              padding: '6px 8px',
                              position: 'relative',
                              whiteSpace: 'pre-wrap',
                              cursor: onCellBorderChange ? 'pointer' : 'default'
                              }}
                              onClick={(e) => handleCellClick(e, 'type-data')}
                              >
                              {onCellValueChange ? (
                              <textarea
                                value={customCellValues['type-data'] !== undefined ? customCellValues['type-data'] : (customAssignmentType || assignment.assignment_type || 'تكليف داخلي - مؤقت')}
                                onChange={(e) => onCellValueChange('type-data', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full text-center bg-transparent border-none outline-none focus:bg-blue-50 rounded resize-none overflow-hidden"
                                style={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', whiteSpace: 'pre-wrap' }}
                                rows={1}
                                onInput={(e) => {
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                              />
                            ) : (customCellValues['type-data'] !== undefined ? customCellValues['type-data'] : (customAssignmentType || assignment.assignment_type || 'تكليف داخلي - مؤقت'))}
                            <RowResizer rowKey="row-type" />
                          </td>
                        </tr>
        <tr style={{ height: `${getRowHeight('row-from')}px`, position: 'relative' }}>
                        <td 
                          className="bg-gray-100 text-center" 
                          style={{ 
                            fontSize: `${textStyles.tableHeaders.size}px`, 
                            fontFamily: textStyles.tableHeaders.font,
                            fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
                            border: getCellBorder('from-header'),
                            padding: '6px 8px',
                            whiteSpace: 'nowrap',
                            cursor: onCellBorderChange ? 'pointer' : 'default'
                          }}
                          onClick={(e) => handleCellClick(e, 'from-header')}
                        >{headers.fromCenter}</td>
                        <td 
                          className="text-center" 
                          colSpan={showEmployeeNumber ? 3 : 1} 
                          style={{ 
                            fontSize: `${textStyles.tableData.size}px`, 
                            fontFamily: textStyles.tableData.font,
                            fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
                            border: getCellBorder('from-data'),
                            padding: '6px 8px',
                            position: 'relative',
                            whiteSpace: 'pre-wrap',
                            cursor: onCellBorderChange ? 'pointer' : 'default'
                          }}
                          onClick={(e) => handleCellClick(e, 'from-data')}
                        >
                          {onCellValueChange ? (
                            <textarea
                              value={customCellValues['from-data'] !== undefined ? customCellValues['from-data'] : (assignment.from_health_center || 'غير محدد')}
                              onChange={(e) => onCellValueChange('from-data', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full text-center bg-transparent border-none outline-none focus:bg-blue-50 rounded resize-none overflow-hidden"
                              style={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', whiteSpace: 'pre-wrap' }}
                              rows={1}
                              onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                            />
                          ) : (customCellValues['from-data'] !== undefined ? customCellValues['from-data'] : (assignment.from_health_center || 'غير محدد'))}
                          <RowResizer rowKey="row-from" />
                        </td>
                      </tr>
        <tr style={{ height: `${getRowHeight('row-to')}px`, position: 'relative' }}>
                        <td 
                          className="bg-gray-100 text-center" 
                          style={{ 
                            fontSize: `${textStyles.tableHeaders.size}px`, 
                            fontFamily: textStyles.tableHeaders.font,
                            fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
                            border: getCellBorder('to-header'),
                            padding: '6px 8px',
                            whiteSpace: 'nowrap',
                            cursor: onCellBorderChange ? 'pointer' : 'default'
                          }}
                          onClick={(e) => handleCellClick(e, 'to-header')}
                        >{headers.toCenter}</td>
                        <td 
                          className="text-center" 
                          colSpan={showEmployeeNumber ? 3 : 1} 
                          style={{ 
                            fontSize: `${textStyles.tableData.size}px`, 
                            fontFamily: textStyles.tableData.font,
                            fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
                            border: getCellBorder('to-data'),
                            padding: '6px 8px',
                            position: 'relative',
                            whiteSpace: 'pre-wrap',
                            cursor: onCellBorderChange ? 'pointer' : 'default'
                          }}
                          onClick={(e) => handleCellClick(e, 'to-data')}
                        >
                          {onCellValueChange ? (
                            <textarea
                              value={customCellValues['to-data'] !== undefined ? customCellValues['to-data'] : (assignment.assigned_to_health_center || 'غير محدد')}
                              onChange={(e) => onCellValueChange('to-data', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full text-center bg-transparent border-none outline-none focus:bg-blue-50 rounded resize-none overflow-hidden"
                              style={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', whiteSpace: 'pre-wrap' }}
                              rows={1}
                              onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                            />
                          ) : (customCellValues['to-data'] !== undefined ? customCellValues['to-data'] : (assignment.assigned_to_health_center || 'غير محدد'))}
                          <RowResizer rowKey="row-to" />
                        </td>
                      </tr>
        {showDurationInTable && (
                        <tr style={{ height: `${getRowHeight('row-duration')}px`, position: 'relative' }}>
                          <td 
                            className="bg-gray-100 text-center" 
                            style={{ 
                              fontSize: `${textStyles.tableHeaders.size}px`, 
                              fontFamily: textStyles.tableHeaders.font,
                              fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
                              border: getCellBorder('duration-header'),
                              padding: '6px 8px',
                              position: 'relative',
                              whiteSpace: 'nowrap',
                              cursor: onCellBorderChange ? 'pointer' : 'default'
                            }}
                            onClick={(e) => handleCellClick(e, 'duration-header')}
                          >
                            {headers.duration}
                            <ColResizer colKey="col-header" side="left" />
                          </td>
                          <td 
                            className="text-center" 
                            colSpan={showEmployeeNumber ? 3 : 1} 
                            style={{ 
                              fontSize: `${textStyles.tableData.size}px`, 
                              fontFamily: textStyles.tableData.font,
                              fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
                              border: getCellBorder('duration-data'),
                              padding: '6px 8px',
                              position: 'relative',
                              whiteSpace: 'pre-wrap',
                              cursor: onCellBorderChange ? 'pointer' : 'default'
                              }}
                              onClick={(e) => handleCellClick(e, 'duration-data')}
                              >
                              {onCellValueChange ? (
                              <textarea
                                value={customCellValues['duration-data'] !== undefined ? customCellValues['duration-data'] : getSingleLineDurationText()}
                                onChange={(e) => onCellValueChange('duration-data', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full text-center bg-transparent border-none outline-none focus:bg-blue-50 rounded resize-none overflow-hidden"
                                style={{ fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', whiteSpace: 'pre-wrap' }}
                                rows={1}
                                onInput={(e) => {
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                              />
                            ) : (customCellValues['duration-data'] !== undefined ? customCellValues['duration-data'] : getSingleLineDurationText())}
                            <ColResizer colKey="col-data-right" side="right" />
                            <RowResizer rowKey="row-duration" />
                          </td>
                        </tr>
                      )}
      </tbody>
    </table>
  );

  const renderVerticalTable = () => (
    <table className="text-sm" style={{ 
      minWidth: '90%',
      width: 'max-content', 
      borderCollapse: 'collapse',
      borderSpacing: 0,
      tableLayout: 'fixed'
    }}>
      <thead>
        <tr className="bg-gray-100" style={{ height: `${getRowHeight('row-header')}px`, position: 'relative' }}>
          <th className="text-center" style={{ 
            fontSize: `${textStyles.tableHeaders.size}px`, 
            fontFamily: textStyles.tableHeaders.font,
            fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
            border: `${tableBorderWidth}px solid ${tableBorderColor}`,
            width: `${getColWidth('col-name', 100)}px`,
            padding: '8px',
            position: 'relative'
          }}>
            {headers.name}
            <ColResizer colKey="col-name" />
          </th>
          <th className="text-center" style={{ 
            fontSize: `${textStyles.tableHeaders.size}px`, 
            fontFamily: textStyles.tableHeaders.font,
            fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
            border: `${tableBorderWidth}px solid ${tableBorderColor}`,
            width: `${getColWidth('col-position', 100)}px`,
            padding: '8px',
            position: 'relative'
          }}>
            {headers.position}
            <ColResizer colKey="col-position" />
          </th>
          <th className="text-center" style={{ 
            fontSize: `${textStyles.tableHeaders.size}px`, 
            fontFamily: textStyles.tableHeaders.font,
            fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
            border: `${tableBorderWidth}px solid ${tableBorderColor}`,
            width: `${getColWidth('col-type', 100)}px`,
            padding: '8px',
            position: 'relative'
          }}>
            {headers.assignmentType}
            <ColResizer colKey="col-type" />
          </th>
          <th className="text-center" style={{ 
            fontSize: `${textStyles.tableHeaders.size}px`, 
            fontFamily: textStyles.tableHeaders.font,
            fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
            border: `${tableBorderWidth}px solid ${tableBorderColor}`,
            width: `${getColWidth('col-from', 100)}px`,
            padding: '8px',
            position: 'relative'
          }}>
            {headers.fromCenter}
            <ColResizer colKey="col-from" />
          </th>
          <th className="text-center" style={{ 
            fontSize: `${textStyles.tableHeaders.size}px`, 
            fontFamily: textStyles.tableHeaders.font,
            fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
            border: `${tableBorderWidth}px solid ${tableBorderColor}`,
            width: `${getColWidth('col-to', 100)}px`,
            padding: '8px',
            position: 'relative'
          }}>
            {headers.toCenter}
            <ColResizer colKey="col-to" />
          </th>
          {showDurationInTable && (
            <th className="text-center" style={{ 
              fontSize: `${textStyles.tableHeaders.size}px`, 
              fontFamily: textStyles.tableHeaders.font,
              fontWeight: textStyles.tableHeaders.bold ? 'bold' : 'normal',
              border: `${tableBorderWidth}px solid ${tableBorderColor}`,
              width: `${getColWidth('col-duration', 150)}px`,
              padding: '8px',
              position: 'relative'
            }}>
              {headers.duration}
              <ColResizer colKey="col-duration" />
              <RowResizer rowKey="row-header" />
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        <tr style={{ height: `${getRowHeight('row-data')}px`, position: 'relative' }}>
          <td className="text-center" style={{ 
            fontSize: `${textStyles.tableData.size}px`, 
            fontFamily: textStyles.tableData.font,
            fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
            border: `${tableBorderWidth}px solid ${tableBorderColor}`,
            padding: '8px'
          }}>{assignment.employee_name || 'غير محدد'}</td>
          <td className="text-center" style={{ 
            fontSize: `${textStyles.tableData.size}px`, 
            fontFamily: textStyles.tableData.font,
            fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
            border: `${tableBorderWidth}px solid ${tableBorderColor}`,
            padding: '8px'
          }}>{assignment.employee_position || 'غير محدد'}</td>
          <td className="text-center" style={{ 
            fontSize: `${textStyles.tableData.size}px`, 
            fontFamily: textStyles.tableData.font,
            fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
            border: `${tableBorderWidth}px solid ${tableBorderColor}`,
            padding: '8px'
          }}>{customAssignmentType || assignment.assignment_type || 'تكليف داخلي - مؤقت'}</td>
          <td className="text-center" style={{ 
            fontSize: `${textStyles.tableData.size}px`, 
            fontFamily: textStyles.tableData.font,
            fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
            border: `${tableBorderWidth}px solid ${tableBorderColor}`,
            padding: '8px'
          }}>{assignment.from_health_center || 'غير محدد'}</td>
          <td className="text-center" style={{ 
            fontSize: `${textStyles.tableData.size}px`, 
            fontFamily: textStyles.tableData.font,
            fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
            border: `${tableBorderWidth}px solid ${tableBorderColor}`,
            padding: '8px'
          }}>{assignment.assigned_to_health_center || 'غير محدد'}</td>
          {showDurationInTable && (
            <td className="text-center" style={{ 
              fontSize: `${textStyles.tableData.size}px`, 
              fontFamily: textStyles.tableData.font,
              fontWeight: textStyles.tableData.bold ? 'bold' : 'normal',
              border: `${tableBorderWidth}px solid ${tableBorderColor}`,
              padding: '8px',
              position: 'relative'
            }}>
              {getSingleLineDurationText()}
              <RowResizer rowKey="row-data" />
            </td>
          )}
        </tr>
      </tbody>
    </table>
  );

  return (
    <div 
      className="bg-white mx-auto print-area shadow-2xl" 
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        maxWidth: '210mm', 
        position: 'relative', 
        padding: '20mm', 
        boxSizing: 'border-box',
        backgroundImage: `url(${letterheadUrl})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#ffffff'
      }}
    >
      
      <div style={{ marginTop: '60px' }}>
        {/* العنوان */}
        <h1 
          className="text-center mb-4 text-sky-400" 
          style={{ 
            fontSize: `${textStyles.title.size}px`,
            fontFamily: textStyles.title.font,
            fontWeight: textStyles.title.bold ? 'bold' : 'normal',
            ...(enableParagraphDrag && paragraphPositions.title?.enabled ? {
              position: 'absolute',
              left: `${paragraphPositions.title.x}px`,
              top: `${paragraphPositions.title.y}px`
            } : {})
          }}
          data-draggable={enableParagraphDrag ? 'title' : undefined}
        >
          {customTitle || 'تكليف'}
        </h1>

        {customTextBefore && (
        <div className="mb-4 text-center" style={{ 
          fontSize: `${textStyles.intro.size}px`,
          fontFamily: textStyles.intro.font,
          lineHeight: '1.6'
        }}>
          <span dangerouslySetInnerHTML={{ __html: customTextBefore.replace(/\n/g, '<br/>') }} />
        </div>
        )}

        {/* الجدول */}
        <div 
          className="mb-4 flex justify-center"
          style={{
            ...(enableParagraphDrag && paragraphPositions.table?.enabled ? {
              position: 'absolute',
              left: `${paragraphPositions.table.x}px`,
              top: `${paragraphPositions.table.y}px`
            } : {})
          }}
          data-draggable={enableParagraphDrag ? 'table' : undefined}
        >
          {tableLayout === 'vertical' ? renderVerticalTable() : renderHorizontalTable()}
        </div>

        <div style={{ textAlign: 'right', marginRight: '12px', marginLeft: '4px', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {/* المقدمة */}
          <p 
            className="mb-3 text-center" 
            style={{ 
              fontSize: `${textStyles.intro.size}px`,
              fontFamily: textStyles.intro.font,
              fontWeight: textStyles.intro.bold ? 'bold' : 'normal',
              ...(enableParagraphDrag && paragraphPositions.intro?.enabled ? {
                position: 'absolute',
                left: `${paragraphPositions.intro.x}px`,
                top: `${paragraphPositions.intro.y}px`,
                maxWidth: '600px'
              } : {})
            }}
            data-draggable={enableParagraphDrag ? 'intro' : undefined}
          >
            {customIntro ? (
              <span dangerouslySetInnerHTML={{ __html: customIntro.replace(/\n/g, '<br/>') }} />
            ) : (
              'إن مدير شؤون المراكز الصحية بالحناكية وبناءً على الصلاحيات الممنوحة له نظاماً ونظراً لما تقتضيه حاجة العمل عليه يقرر ما يلي:'
            )}
          </p>
          <div style={{ marginRight: '80px', textAlign: paragraphAlign }}>
            {/* الفقرة 1 */}
            <p 
              style={{ 
                marginBottom: '0.75rem',
                fontSize: `${textStyles.paragraph1.size}px`,
                fontFamily: textStyles.paragraph1.font,
                fontWeight: textStyles.paragraph1.bold ? 'bold' : 'normal',
                lineHeight: '1.6',
                textAlign: paragraphAlign,
                ...(enableParagraphDrag && paragraphPositions.paragraph1?.enabled ? {
                  position: 'absolute',
                  left: `${paragraphPositions.paragraph1.x}px`,
                  top: `${paragraphPositions.paragraph1.y}px`,
                  maxWidth: '600px'
                } : {})
              }}
              data-draggable={enableParagraphDrag ? 'paragraph1' : undefined}
            >
              {showNumbering && <strong>١- </strong>}{getParagraph1Text()}
            </p>

            {/* الفقرة 2 */}
            {(customParagraph2 || !customParagraph2) && (
              <p 
                style={{ 
                  marginBottom: '0.75rem',
                  fontSize: `${textStyles.paragraph2.size}px`,
                  fontFamily: textStyles.paragraph2.font,
                  fontWeight: textStyles.paragraph2.bold ? 'bold' : 'normal',
                  lineHeight: '1.6',
                  textAlign: paragraphAlign,
                  ...(enableParagraphDrag && paragraphPositions.paragraph2?.enabled ? {
                    position: 'absolute',
                    left: `${paragraphPositions.paragraph2.x}px`,
                    top: `${paragraphPositions.paragraph2.y}px`,
                    maxWidth: '600px'
                  } : {})
                }}
                data-draggable={enableParagraphDrag ? 'paragraph2' : undefined}
              >
                {showNumbering && <strong>٢- </strong>}{getParagraph2Text()}
              </p>
            )}

            {/* الفقرة 3 */}
            {(customParagraph3 !== '' || !customParagraph3) && (
              <p 
                style={{ 
                  marginBottom: '0.75rem',
                  fontSize: `${textStyles.paragraph3.size}px`,
                  fontFamily: textStyles.paragraph3.font,
                  fontWeight: textStyles.paragraph3.bold ? 'bold' : 'normal',
                  lineHeight: '1.6',
                  textAlign: paragraphAlign,
                  ...(enableParagraphDrag && paragraphPositions.paragraph3?.enabled ? {
                    position: 'absolute',
                    left: `${paragraphPositions.paragraph3.x}px`,
                    top: `${paragraphPositions.paragraph3.y}px`,
                    maxWidth: '600px'
                  } : {})
                }}
                data-draggable={enableParagraphDrag ? 'paragraph3' : undefined}
              >
                {showNumbering && <strong>٣- </strong>}{getParagraph3Text()}
              </p>
            )}

            {/* الفقرة 4 */}
            {(customParagraph4 !== '' || !customParagraph4) && (
              <p 
                style={{ 
                  marginBottom: '0.75rem',
                  fontSize: `${textStyles.paragraph4.size}px`,
                  fontFamily: textStyles.paragraph4.font,
                  fontWeight: textStyles.paragraph4.bold ? 'bold' : 'normal',
                  lineHeight: '1.6',
                  textAlign: paragraphAlign,
                  ...(enableParagraphDrag && paragraphPositions.paragraph4?.enabled ? {
                    position: 'absolute',
                    left: `${paragraphPositions.paragraph4.x}px`,
                    top: `${paragraphPositions.paragraph4.y}px`,
                    maxWidth: '600px'
                  } : {})
                }}
                data-draggable={enableParagraphDrag ? 'paragraph4' : undefined}
              >
                {showNumbering && <strong>٤- </strong>}{getParagraph4Text()}
              </p>
            )}

            {/* الفقرة 5 */}
            {(customParagraph5 || !customParagraph5) && (
              <p 
                style={{ 
                  marginBottom: '0.75rem',
                  fontSize: `${textStyles.paragraph5.size}px`,
                  fontFamily: textStyles.paragraph5.font,
                  fontWeight: textStyles.paragraph5.bold ? 'bold' : 'normal',
                  lineHeight: '1.6',
                  textAlign: paragraphAlign,
                  ...(enableParagraphDrag && paragraphPositions.paragraph5?.enabled ? {
                    position: 'absolute',
                    left: `${paragraphPositions.paragraph5.x}px`,
                    top: `${paragraphPositions.paragraph5.y}px`,
                    maxWidth: '600px'
                  } : {})
                }}
                data-draggable={enableParagraphDrag ? 'paragraph5' : undefined}
              >
                {showNumbering && <strong>٥- </strong>}{getParagraph5Text()}
              </p>
            )}
          </div>
          {/* الختام */}
          <p 
            className="text-center mt-6" 
            style={{ 
              fontSize: `${textStyles.closing.size}px`,
              fontFamily: textStyles.closing.font,
              fontWeight: textStyles.closing.bold ? 'bold' : 'normal',
              ...(enableParagraphDrag && paragraphPositions.closing?.enabled ? {
                position: 'absolute',
                left: `${paragraphPositions.closing.x}px`,
                top: `${paragraphPositions.closing.y}px`
              } : {})
            }}
            data-draggable={enableParagraphDrag ? 'closing' : undefined}
          >
            {getClosingText()}
          </p>

        </div>

      {/* النص الإضافي بعد الختام - موضع مطلق قابل للسحب */}
      {customTextAfter && (
        <div 
          className="print-only"
          style={{ 
            position: 'absolute',
            left: `${customTextAfterPosition.x}px`, 
            top: `${customTextAfterPosition.y}px`,
            fontSize: `${customTextAfterStyle.size}px`,
            fontFamily: customTextAfterStyle.font,
            fontWeight: customTextAfterStyle.bold ? 'bold' : 'normal',
            textAlign: customTextAfterStyle.align || 'center',
            maxWidth: '400px'
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: customTextAfter.replace(/\n/g, '<br/>') }} />
        </div>
      )}
      </div>

      <div 
        style={{ 
          position: 'absolute',
          left: `${managerNamePosition.x}px`, 
          top: `${managerNamePosition.y}px`,
          textAlign: 'center',
          fontSize: `${textStyles.managerName.size}px`,
          fontFamily: textStyles.managerName.font,
          fontWeight: 'bold'
        }}
      >
        <p style={{ marginBottom: '4px', fontWeight: 'bold' }}>
          مدير إدارة شؤون المراكز الصحية بالحناكية
        </p>
        <p style={{ fontWeight: 'bold' }}>
          أ/عبدالمجيد سعود الربيقي
        </p>
      </div>

      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png"
        alt="الختم"
        style={{ 
          position: 'absolute',
          left: `${stampPosition.x}px`, 
          top: `${stampPosition.y}px`,
          width: `${stampSize}px`, 
          opacity: 0.85,
          mixBlendMode: 'multiply',
          zIndex: 100
        }}
      />

      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png"
        alt="التوقيع"
        style={{ 
          position: 'absolute',
          left: `${signaturePosition.x}px`, 
          top: `${signaturePosition.y}px`,
          width: '170px', 
          mixBlendMode: 'darken' 
        }}
      />
    </div>
  );
}