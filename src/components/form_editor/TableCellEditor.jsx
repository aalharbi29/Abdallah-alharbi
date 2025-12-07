import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export default function TableCellEditor({ cell, rowIndex, cellIndex, onUpdate, onClose }) {
    const [localCell, setLocalCell] = useState(cell);

    const handleSave = () => {
        onUpdate(rowIndex, cellIndex, localCell);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">تنسيق الخلية</h3>
                
                <div className="space-y-4">
                    {/* Merge Options */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">دمج أفقي (أعمدة)</Label>
                            <Input 
                                type="number" 
                                min="1"
                                value={localCell.colspan || 1}
                                onChange={e => setLocalCell({...localCell, colspan: parseInt(e.target.value) || 1})}
                            />
                        </div>
                        <div>
                            <Label className="text-xs">دمج عمودي (صفوف)</Label>
                            <Input 
                                type="number" 
                                min="1"
                                value={localCell.rowspan || 1}
                                onChange={e => setLocalCell({...localCell, rowspan: parseInt(e.target.value) || 1})}
                            />
                        </div>
                    </div>

                    {/* Text Alignment */}
                    <div>
                        <Label className="text-xs">المحاذاة</Label>
                        <div className="flex gap-2 mt-1">
                            <Button 
                                size="sm" 
                                variant={localCell.align === 'right' ? 'default' : 'outline'}
                                onClick={() => setLocalCell({...localCell, align: 'right'})}
                            >
                                <AlignRight className="w-4 h-4" />
                            </Button>
                            <Button 
                                size="sm" 
                                variant={localCell.align === 'center' ? 'default' : 'outline'}
                                onClick={() => setLocalCell({...localCell, align: 'center'})}
                            >
                                <AlignCenter className="w-4 h-4" />
                            </Button>
                            <Button 
                                size="sm" 
                                variant={localCell.align === 'left' ? 'default' : 'outline'}
                                onClick={() => setLocalCell({...localCell, align: 'left'})}
                            >
                                <AlignLeft className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Font Size */}
                    <div>
                        <Label className="text-xs">حجم الخط (px)</Label>
                        <Input 
                            type="number"
                            value={parseInt(localCell.fontSize) || 14}
                            onChange={e => setLocalCell({...localCell, fontSize: `${e.target.value}px`})}
                        />
                    </div>

                    {/* Font Color */}
                    <div>
                        <Label className="text-xs">لون النص</Label>
                        <Input 
                            type="color"
                            value={localCell.color || '#000000'}
                            onChange={e => setLocalCell({...localCell, color: e.target.value})}
                        />
                    </div>

                    {/* Background Color */}
                    <div>
                        <Label className="text-xs">لون خلفية الخلية</Label>
                        <Input 
                            type="color"
                            value={localCell.bgColor || '#ffffff'}
                            onChange={e => setLocalCell({...localCell, bgColor: e.target.value})}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button onClick={handleSave} className="flex-1">حفظ</Button>
                        <Button variant="outline" onClick={onClose} className="flex-1">إلغاء</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}