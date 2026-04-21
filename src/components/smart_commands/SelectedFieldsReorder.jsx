import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { GripVertical, X, Filter } from 'lucide-react';
import { getFieldLabel } from './entitiesCatalog';

// يعرض الحقول المختارة في قائمة قابلة للسحب والإفلات لتغيير ترتيب الأعمدة
export default function SelectedFieldsReorder({
  entity, // entity value string
  selectedFields,
  onReorder,
  onRemove,
  activeValueFilters = {},
  onFilterClick,
}) {
  if (!selectedFields || selectedFields.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 bg-white rounded-lg border border-dashed text-sm">
        لم يتم اختيار أي حقول بعد. اختر حقولاً من الأعلى لتظهر هنا قابلة للترتيب.
      </div>
    );
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(selectedFields);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onReorder(items);
  };

  return (
    <div className="bg-white border border-indigo-200 rounded-lg p-3">
      <p className="text-xs text-indigo-700 mb-2 font-medium">
        🖐️ اسحب الحقول لإعادة ترتيب الأعمدة في التقرير النهائي:
      </p>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="selected-fields" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-wrap gap-2"
            >
              {selectedFields.map((fk, idx) => {
                const label = getFieldLabel(entity, fk);
                const hasFilter = activeValueFilters[fk]?.length > 0;
                return (
                  <Draggable key={fk} draggableId={fk} index={idx}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`flex items-center gap-1 bg-gradient-to-l from-indigo-50 to-white border rounded-lg px-2 py-1 transition-all ${snapshot.isDragging ? 'shadow-lg border-indigo-400 scale-105' : 'border-indigo-200'}`}
                      >
                        <span {...dragProvided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700">
                          <GripVertical className="w-4 h-4" />
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{idx + 1}.</span>
                        <span className="text-sm text-slate-800">{label}</span>
                        {hasFilter && onFilterClick && (
                          <Badge
                            className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-[10px] px-1.5"
                            onClick={() => onFilterClick(fk, label)}
                          >
                            <Filter className="w-2.5 h-2.5 ml-0.5" />
                            {activeValueFilters[fk].length}
                          </Badge>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemove(fk)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="إزالة"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}