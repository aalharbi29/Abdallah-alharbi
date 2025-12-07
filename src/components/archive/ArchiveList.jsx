import React, { useState } from 'react';
import ArchivedFileItem from './ArchivedFileItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Move } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ArchiveList({ fileGroups, isLoading, onDelete, onMove, onRefresh, employees, allCategories }) {
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const [showBulkMoveDialog, setShowBulkMoveDialog] = useState(false);
  const [bulkMoveTarget, setBulkMoveTarget] = useState({ category: '', subCategory: '' });

  const toggleSelection = (groupId) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const selectAll = () => {
    if (selectedGroups.size === fileGroups.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(fileGroups.map(group => group[0].group_id || group[0].id)));
    }
  };

  const handleBulkMove = async () => {
    if (!bulkMoveTarget.category) {
      alert('يرجى اختيار الفئة الجديدة');
      return;
    }

    try {
      const selectedFileGroups = fileGroups.filter(group => 
        selectedGroups.has(group[0].group_id || group[0].id)
      );

      for (const group of selectedFileGroups) {
        for (const file of group) {
          await onMove(file.id, bulkMoveTarget.category, bulkMoveTarget.subCategory);
        }
      }

      setShowBulkMoveDialog(false);
      setSelectedGroups(new Set());
      alert(`تم نقل الملفات المحددة بنجاح`);
    } catch (error) {
      console.error('Error in bulk move:', error);
      alert('حدث خطأ أثناء نقل الملفات');
    }
  };

  const categoryOptions = Object.entries(allCategories).map(([key, cat]) => ({
    value: key,
    label: cat.name,
    subCategories: cat.subCategories
  }));

  const selectedCategoryData = categoryOptions.find(c => c.value === bulkMoveTarget.category);
  const hasSubCategories = selectedCategoryData?.subCategories;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (fileGroups.length === 0) {
    return (
      <div className="col-span-full text-center py-16 text-gray-500 border-2 border-dashed rounded-lg">
        <Archive className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium">لا توجد ملفات</h3>
        <p className="mt-1 text-sm text-gray-500">ابدأ برفع أول ملف إلى هذا القسم من الأرشيف.</p>
      </div>
    );
  }

  return (
    <>
      {/* شريط الأدوات للنقل الجماعي */}
      {fileGroups.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={selectAll}
            >
              {selectedGroups.size === fileGroups.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </Button>
            {selectedGroups.size > 0 && (
              <Badge variant="secondary">
                {selectedGroups.size} محدد
              </Badge>
            )}
          </div>
          {selectedGroups.size > 0 && (
            <Button
              size="sm"
              onClick={() => setShowBulkMoveDialog(true)}
              className="gap-2"
            >
              <Move className="w-4 h-4" />
              نقل المحدد
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {fileGroups.map((group, index) => (
          <ArchivedFileItem 
            key={group[0].id || index}
            fileGroup={group}
            onDelete={onDelete} 
            onMove={onMove} 
            onRefresh={onRefresh}
            employees={employees}
            allCategories={allCategories}
            isSelected={selectedGroups.has(group[0].group_id || group[0].id)}
            onSelect={toggleSelection}
          />
        ))}
      </div>

      {/* Dialog النقل الجماعي */}
      <Dialog open={showBulkMoveDialog} onOpenChange={setShowBulkMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>نقل {selectedGroups.size} مجموعة ملفات</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>الفئة الجديدة</Label>
              <Select
                value={bulkMoveTarget.category}
                onValueChange={(value) => setBulkMoveTarget({ category: value, subCategory: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasSubCategories && (
              <div>
                <Label>الفئة الفرعية (اختياري)</Label>
                <Select
                  value={bulkMoveTarget.subCategory}
                  onValueChange={(value) => setBulkMoveTarget(prev => ({ ...prev, subCategory: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة الفرعية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>لا يوجد</SelectItem>
                    {Object.entries(selectedCategoryData.subCategories).map(([key, sub]) => (
                      <SelectItem key={key} value={key}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkMoveDialog(false)}>إلغاء</Button>
            <Button onClick={handleBulkMove}>نقل الكل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}