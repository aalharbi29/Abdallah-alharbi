import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, GripVertical, X, AlignCenter, AlignRight, AlignLeft, Image as ImageIcon, Type, Bold, Italic, Underline } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Shared styles
const getInputStyle = (isEditMode) => 
  `w-full bg-transparent transition-all duration-200 ${isEditMode ? 'border border-dashed border-gray-400 p-1 rounded hover:bg-gray-50' : 'border-none p-0 font-inherit'}`;

// --- Generic Building Blocks ---

// 1. Paragraph Block: Allows mixing text and input fields inline
export const ParagraphBlock = ({ block, isEditMode, formData, onInputChange, onUpdateBlock }) => {
  const addItem = (type) => {
    const newItems = [...(block.data.items || []), { 
      id: Date.now(), 
      type, 
      value: type === 'text' ? 'نص جديد' : '', 
      key: type === 'field' ? `field_${Date.now()}` : undefined,
      width: type === 'field' ? '100px' : undefined
    }];
    onUpdateBlock(block.id, { ...block.data, items: newItems });
  };

  const updateItem = (idx, updates) => {
    const newItems = [...block.data.items];
    newItems[idx] = { ...newItems[idx], ...updates };
    onUpdateBlock(block.id, { ...block.data, items: newItems });
  };

  const removeItem = (idx) => {
    const newItems = block.data.items.filter((_, i) => i !== idx);
    onUpdateBlock(block.id, { ...block.data, items: newItems });
  };

  return (
    <div className="mb-6 relative">
      <div className={`flex flex-wrap items-center gap-2 leading-loose text-base md:text-lg ${isEditMode ? 'p-4 border border-dashed border-gray-200 rounded' : ''}`}>
        {(block.data.items || []).map((item, idx) => (
          <div key={item.id} className="relative group flex items-center">
            {item.type === 'text' ? (
              <span
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => updateItem(idx, { value: e.target.innerText })}
                className={`outline-none ${isEditMode ? 'hover:bg-blue-50 cursor-text min-w-[20px]' : ''}`}
              >
                {item.value}
              </span>
            ) : (
              <div className={`flex flex-col items-center ${isEditMode ? 'bg-yellow-50 p-1 rounded' : ''}`}>
                <input
                  type="text"
                  name={item.key}
                  value={formData[item.key] || ''}
                  onChange={onInputChange}
                  placeholder={item.placeholder || '...'}
                  className="text-center bg-transparent border-b border-dotted border-black outline-none"
                  style={{ width: item.width || '100px' }}
                  readOnly={isEditMode} // In edit mode, prevent typing in the data input to focus on config
                />
                {isEditMode && (
                  <div className="flex gap-1 mt-1">
                    <input 
                      className="text-[10px] w-16 border border-gray-300 rounded px-1" 
                      value={item.key} 
                      onChange={(e) => updateItem(idx, { key: e.target.value })}
                      placeholder="اسم الحقل"
                    />
                    <input 
                      className="text-[10px] w-12 border border-gray-300 rounded px-1" 
                      value={item.width} 
                      onChange={(e) => updateItem(idx, { width: e.target.value })}
                      placeholder="العرض"
                    />
                  </div>
                )}
              </div>
            )}
            
            {isEditMode && (
              <button 
                onClick={() => removeItem(idx)} 
                className="absolute -top-3 -right-2 bg-red-100 text-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {isEditMode && (
        <div className="flex gap-2 mt-2 justify-center">
          <Button variant="ghost" size="sm" onClick={() => addItem('text')} className="text-xs gap-1 h-7">
            <Type className="w-3 h-3" /> نص
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addItem('field')} className="text-xs gap-1 h-7">
            <Plus className="w-3 h-3" /> حقل إدخال
          </Button>
        </div>
      )}
    </div>
  );
};

// 2. Generic Grid Block: Dynamic columns and rows
export const GenericGridBlock = ({ block, isEditMode, formData, onInputChange, onUpdateBlock }) => {
  const addColumn = () => {
    const newCols = [...(block.data.columns || []), { label: 'جديد', name: `col_${Date.now()}`, width: 'auto' }];
    onUpdateBlock(block.id, { ...block.data, columns: newCols });
  };

  const removeColumn = (idx) => {
    const newCols = block.data.columns.filter((_, i) => i !== idx);
    onUpdateBlock(block.id, { ...block.data, columns: newCols });
  };

  const updateColumn = (idx, updates) => {
    const newCols = [...block.data.columns];
    newCols[idx] = { ...newCols[idx], ...updates };
    onUpdateBlock(block.id, { ...block.data, columns: newCols });
  };

  return (
    <div className="mb-8 overflow-x-auto -mx-2 md:mx-0">
      <table className="w-full border-collapse border border-black text-xs md:text-sm lg:text-base">
        <thead>
          <tr className="bg-gray-100">
            {(block.data.columns || []).map((col, idx) => (
              <th key={idx} className="border border-black p-2 relative group" style={{ width: col.width }}>
                <input
                  value={col.label}
                  onChange={(e) => updateColumn(idx, { label: e.target.value })}
                  disabled={!isEditMode}
                  className={`w-full text-center font-bold bg-transparent ${isEditMode ? 'border-b border-dashed border-gray-500' : ''}`}
                />
                {isEditMode && (
                  <div className="absolute -top-2 right-0 flex gap-1 opacity-0 group-hover:opacity-100 bg-white shadow-sm rounded border p-1 z-10">
                    <input 
                      className="text-[10px] w-16 border border-gray-300 px-1"
                      value={col.name}
                      onChange={(e) => updateColumn(idx, { name: e.target.value })}
                      placeholder="Variable Name"
                    />
                    <button onClick={() => removeColumn(idx)} className="text-red-500"><X className="w-3 h-3" /></button>
                  </div>
                )}
              </th>
            ))}
            {isEditMode && (
              <th className="border border-black p-2 w-10 bg-blue-50 cursor-pointer hover:bg-blue-100" onClick={addColumn}>
                <Plus className="w-4 h-4 mx-auto text-blue-600" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {/* Single Row Mode (like Employee Data) or Multi Row Mode (like Signatures)? Let's support single row for now based on data type */}
          <tr>
            {(block.data.columns || []).map((col, idx) => (
              <td key={idx} className="border border-black p-2">
                <input 
                  type="text" 
                  name={col.name}
                  value={formData[col.name] || ''}
                  onChange={onInputChange}
                  className="w-full text-center bg-transparent outline-none"
                  readOnly={isEditMode}
                />
              </td>
            ))}
            {isEditMode && <td className="border border-black p-2 bg-gray-50"></td>}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// 3. Layout Row Block: 3 Columns (Right, Center, Left)
export const LayoutRowBlock = ({ block, isEditMode, onUpdateBlock }) => {
  const updateContent = (section, value) => {
    onUpdateBlock(block.id, { ...block.data, [section]: value });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-8 md:mb-8 gap-4 md:gap-0">
      {/* Right Section */}
      <div className="w-full md:w-1/3 text-right order-2 md:order-1">
        <textarea
          value={block.data.rightContent || ''}
          onChange={(e) => updateContent('rightContent', e.target.value)}
          disabled={!isEditMode}
          className={`w-full h-full min-h-[60px] resize-none bg-transparent font-bold text-blue-600 text-xs md:text-sm lg:text-base ${getInputStyle(isEditMode)}`}
          placeholder="النص الأيمن..."
        />
      </div>

      {/* Center Section */}
      <div className="w-full md:w-1/3 text-center order-3 md:order-2 mt-8 md:mt-0">
        <textarea
          value={block.data.centerContent || ''}
          onChange={(e) => updateContent('centerContent', e.target.value)}
          disabled={!isEditMode}
          className={`w-full h-full min-h-[60px] resize-none bg-transparent font-bold text-xl md:text-2xl underline decoration-2 underline-offset-4 text-center ${getInputStyle(isEditMode)}`}
          placeholder="العنوان..."
        />
      </div>

      {/* Left Section (Image/Logo) */}
      <div className="w-full md:w-1/3 flex justify-center md:justify-end order-1 md:order-3">
        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 relative group">
          <img 
            src={block.data.imageUrl || "https://cdn.worldvectorlogo.com/logos/ministry-of-health-saudi-arabia-1.svg"} 
            alt="Logo" 
            className="w-full h-full object-contain opacity-80 grayscale"
            onError={(e) => e.target.style.display = 'none'}
          />
          {isEditMode && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <input 
                type="text"
                className="w-full text-[10px] p-1 bg-white border"
                placeholder="URL الصورة"
                value={block.data.imageUrl || ''}
                onChange={(e) => updateContent('imageUrl', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Signature Grid Block (Specialized Grid)
export const SignatureGridBlock = ({ block, isEditMode, formData, onInputChange, onUpdateBlock }) => {
  // Reuse the SignaturesBlock logic but exposed as generic component
  const addRow = () => {
    const newRows = [...(block.data.rows || []), { role: 'جديد', nameField: `sig_${Date.now()}` }];
    onUpdateBlock(block.id, { ...block.data, rows: newRows });
  };

  const removeRow = (idx) => {
    const newRows = block.data.rows.filter((_, i) => i !== idx);
    onUpdateBlock(block.id, { ...block.data, rows: newRows });
  };

  const updateRow = (idx, field, value) => {
    const newRows = [...block.data.rows];
    newRows[idx][field] = value;
    onUpdateBlock(block.id, { ...block.data, rows: newRows });
  };

  return (
    <div className="mb-16">
      <div className="text-right mb-6 px-4">
        <input 
          value={block.data.title || ''}
          onChange={(e) => onUpdateBlock(block.id, { ...block.data, title: e.target.value })}
          disabled={!isEditMode}
          className={`font-bold text-lg w-full ${getInputStyle(isEditMode)}`}
          placeholder="عنوان القسم (مثلاً: وعلى ذلك جرى التوقيع)"
        />
      </div>
      <table className="w-full border-collapse border border-black">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2 w-12">م</th>
            <th className="border border-black p-2">الوظيفة</th>
            <th className="border border-black p-2">الاسم</th>
            <th className="border border-black p-2">التوقيع</th>
            {isEditMode && <th className="border border-black p-2 w-10 bg-red-50"></th>}
          </tr>
        </thead>
        <tbody>
          {(block.data.rows || []).map((row, idx) => (
            <tr key={idx}>
              <td className="border border-black p-2 text-center">{idx + 1}</td>
              <td className="border border-black p-2 text-right">
                <input
                  value={row.role}
                  onChange={(e) => updateRow(idx, 'role', e.target.value)}
                  disabled={!isEditMode}
                  className={`w-full ${getInputStyle(isEditMode)}`}
                />
              </td>
              <td className="border border-black p-2">
                <input 
                  type="text" 
                  name={row.nameField}
                  value={formData[row.nameField] || ''}
                  onChange={onInputChange}
                  className="w-full text-center bg-transparent outline-none"
                  placeholder="الاسم"
                  readOnly={isEditMode}
                />
              </td>
              <td className="border border-black p-2"></td>
              {isEditMode && (
                <td className="border border-black p-2 text-center bg-red-50">
                  <button onClick={() => removeRow(idx)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {isEditMode && (
        <Button variant="outline" size="sm" onClick={addRow} className="mt-2 w-full border-dashed">
          <Plus className="w-4 h-4 mr-2" /> إضافة توقيع
        </Button>
      )}
    </div>
  );
};

// 5. Simple Center Text Block (Footer)
export const CenterTextBlock = ({ block, isEditMode, onUpdateBlock }) => {
  return (
    <div className="text-center mt-8 mb-8">
      <div className="inline-block text-center w-full">
        <textarea
          value={block.data.text || ''}
          onChange={(e) => onUpdateBlock(block.id, { ...block.data, text: e.target.value })}
          disabled={!isEditMode}
          className={`text-base md:text-xl font-bold mb-2 text-center w-full resize-none bg-transparent ${getInputStyle(isEditMode)}`}
          rows={2}
        />
        <textarea
          value={block.data.subText || ''}
          onChange={(e) => onUpdateBlock(block.id, { ...block.data, subText: e.target.value })}
          disabled={!isEditMode}
          className={`text-sm md:text-lg text-center w-full resize-none bg-transparent ${getInputStyle(isEditMode)}`}
          rows={1}
        />
      </div>
    </div>
  );
};