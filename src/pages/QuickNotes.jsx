import React, { useState, useEffect, useMemo } from 'react';
import { Note } from '@/entities/Note';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, StickyNote, Edit2, Check, Search, X, Database, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const noteColors = {
    yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900', hoverBg: 'hover:bg-yellow-50', name: 'أصفر' },
    blue: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900', hoverBg: 'hover:bg-blue-50', name: 'أزرق' },
    green: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900', hoverBg: 'hover:bg-green-50', name: 'أخضر' },
    pink: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900', hoverBg: 'hover:bg-pink-50', name: 'وردي' },
    purple: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900', hoverBg: 'hover:bg-purple-50', name: 'بنفسجي' },
    orange: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900', hoverBg: 'hover:bg-orange-50', name: 'برتقالي' },
};

// مكون بطاقة الملاحظة
const NoteCard = ({ note, onDelete, onUpdate, onSelect, isSelected, searchQuery }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(note.content);
    const color = noteColors[note.color] || noteColors.yellow;

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;
        await onUpdate(note.id, { content: editContent });
        setIsEditing(false);
    };

    // تظليل نص البحث
    const highlightText = (text) => {
        if (!searchQuery.trim()) return text;
        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === searchQuery.toLowerCase() 
                ? <mark key={i} className="bg-yellow-300 px-0.5 rounded">{part}</mark>
                : part
        );
    };

    return (
        <Card 
            className={`${color.bg} ${color.border} border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                isSelected ? 'ring-2 ring-blue-500 shadow-xl' : ''
            }`}
            onClick={() => !isEditing && onSelect(note)}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className={`text-xs ${color.bg}`}>
                        {color.name}
                    </Badge>
                    <div className="flex items-center gap-1">
                        {!isEditing ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-green-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveEdit();
                                }}
                            >
                                <Check className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-600 hover:text-red-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('هل تريد حذف هذه الملاحظة؟')) {
                                    onDelete(note.id);
                                }
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {isEditing ? (
                    <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={`${color.bg} border-none resize-none text-sm leading-relaxed`}
                        rows={4}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                    />
                ) : (
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap line-clamp-4 ${color.text}`}>
                        {highlightText(note.content)}
                    </p>
                )}

                <div className={`mt-3 pt-2 border-t ${color.border} flex items-center gap-2 text-xs opacity-70`}>
                    <Clock className="w-3 h-3" />
                    {format(new Date(note.created_date), 'dd MMM yyyy - HH:mm', { locale: ar })}
                </div>
            </CardContent>
        </Card>
    );
};

export default function QuickNotes() {
    const [notes, setNotes] = useState([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newNote, setNewNote] = useState({ content: '', color: 'yellow' });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [filterColor, setFilterColor] = useState('all');

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        setIsLoading(true);
        try {
            const data = await Note.list('-created_date', 500);
            setNotes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading notes:', error);
            setNotes([]);
        } finally {
            setIsLoading(false);
        }
    };

    // فلترة الملاحظات حسب البحث واللون
    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const matchesSearch = !searchQuery.trim() || 
                note.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesColor = filterColor === 'all' || note.color === filterColor;
            return matchesSearch && matchesColor;
        });
    }, [notes, searchQuery, filterColor]);

    const addNote = async () => {
        if (!newNote.content.trim()) return;
        try {
            await Note.create(newNote);
            setNewNote({ content: '', color: 'yellow' });
            setShowAddDialog(false);
            loadNotes();
        } catch (error) {
            console.error('Error adding note:', error);
            alert('حدث خطأ أثناء إضافة الملاحظة');
        }
    };

    const updateNote = async (id, updates) => {
        try {
            await Note.update(id, updates);
            loadNotes();
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const deleteNote = async (id) => {
        try {
            await Note.delete(id);
            if (selectedNote?.id === id) setSelectedNote(null);
            loadNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('حدث خطأ أثناء حذف الملاحظة');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg flex items-center justify-center">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">📌 قاعدة الملاحظات</h1>
                                <p className="text-sm text-gray-600">ابحث بكلمة أو كلمتين لاسترجاع البيانات المحفوظة</p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => setShowAddDialog(true)}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg h-11 px-6"
                        >
                            <Plus className="w-5 h-5 ml-2" />
                            ملاحظة جديدة
                        </Button>
                    </div>

                    {/* شريط البحث والفلاتر */}
                    <Card className="p-4 bg-white shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* حقل البحث */}
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    placeholder="ابحث في الملاحظات... (كلمة أو كلمتين)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pr-10 h-11 text-base"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            {/* فلتر اللون */}
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-gray-500" />
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setFilterColor('all')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                            filterColor === 'all' 
                                                ? 'bg-gray-800 text-white' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        الكل
                                    </button>
                                    {Object.entries(noteColors).map(([key, color]) => (
                                        <button
                                            key={key}
                                            onClick={() => setFilterColor(key)}
                                            className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-all ${
                                                filterColor === key 
                                                    ? 'border-gray-700 scale-110 shadow-md' 
                                                    : 'border-transparent hover:scale-105'
                                            }`}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* نتائج البحث */}
                        {searchQuery && (
                            <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    <strong>{filteredNotes.length}</strong> نتيجة للبحث عن "{searchQuery}"
                                </span>
                                {filteredNotes.length > 0 && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        تم العثور على بيانات
                                    </Badge>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* عرض الملاحظات */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-600">جاري تحميل البيانات...</p>
                        </div>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <Card className="p-12 text-center bg-white">
                        <StickyNote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        {searchQuery ? (
                            <>
                                <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد نتائج</h3>
                                <p className="text-gray-500 mb-4">لم يتم العثور على ملاحظات تحتوي على "{searchQuery}"</p>
                                <Button variant="outline" onClick={() => setSearchQuery('')}>
                                    مسح البحث
                                </Button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد ملاحظات بعد</h3>
                                <p className="text-gray-500 mb-4">ابدأ بإضافة ملاحظتك الأولى لحفظها في قاعدة البيانات</p>
                                <Button onClick={() => setShowAddDialog(true)} className="bg-yellow-500 hover:bg-yellow-600">
                                    <Plus className="w-5 h-5 ml-2" />
                                    أضف ملاحظة
                                </Button>
                            </>
                        )}
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredNotes.map(note => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onDelete={deleteNote}
                                onUpdate={updateNote}
                                onSelect={setSelectedNote}
                                isSelected={selectedNote?.id === note.id}
                                searchQuery={searchQuery}
                            />
                        ))}
                    </div>
                )}

                {/* إحصائيات سريعة */}
                {notes.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card className="p-4 bg-white text-center">
                            <p className="text-2xl font-bold text-gray-800">{notes.length}</p>
                            <p className="text-xs text-gray-500">إجمالي الملاحظات</p>
                        </Card>
                        <Card className="p-4 bg-yellow-50 text-center">
                            <p className="text-2xl font-bold text-yellow-700">{notes.filter(n => n.color === 'yellow').length}</p>
                            <p className="text-xs text-yellow-600">ملاحظات صفراء</p>
                        </Card>
                        <Card className="p-4 bg-blue-50 text-center">
                            <p className="text-2xl font-bold text-blue-700">{notes.filter(n => n.color === 'blue').length}</p>
                            <p className="text-xs text-blue-600">ملاحظات زرقاء</p>
                        </Card>
                        <Card className="p-4 bg-green-50 text-center">
                            <p className="text-2xl font-bold text-green-700">{notes.filter(n => n.color === 'green').length}</p>
                            <p className="text-xs text-green-600">ملاحظات خضراء</p>
                        </Card>
                    </div>
                )}
            </div>

            {/* Dialog إضافة ملاحظة */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>✨ حفظ ملاحظة جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea
                            placeholder="اكتب ملاحظتك أو بياناتك هنا للحفظ..."
                            value={newNote.content}
                            onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                            rows={6}
                            className="text-base"
                        />
                        <div>
                            <label className="block text-sm font-medium mb-2">🎨 اللون:</label>
                            <div className="flex gap-2 flex-wrap">
                                {Object.entries(noteColors).map(([key, color]) => (
                                    <button
                                        key={key}
                                        onClick={() => setNewNote({...newNote, color: key})}
                                        className={`w-10 h-10 rounded-xl ${color.bg} border-2 ${
                                            newNote.color === key ? 'border-gray-700 scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                                        } transition-all`}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={addNote} className="bg-yellow-500 hover:bg-yellow-600">
                            <Database className="w-4 h-4 ml-2" />
                            حفظ في القاعدة
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog عرض الملاحظة المختارة */}
            <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <StickyNote className="w-5 h-5" />
                            عرض الملاحظة
                        </DialogTitle>
                    </DialogHeader>
                    {selectedNote && (
                        <div className="py-4">
                            <div className={`p-4 rounded-lg ${noteColors[selectedNote.color]?.bg || 'bg-gray-100'} mb-4`}>
                                <p className="text-base leading-relaxed whitespace-pre-wrap">
                                    {selectedNote.content}
                                </p>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>
                                    تم الإنشاء: {format(new Date(selectedNote.created_date), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                                </span>
                                <Badge className={noteColors[selectedNote.color]?.bg}>
                                    {noteColors[selectedNote.color]?.name}
                                </Badge>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedNote(null)}>
                            إغلاق
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}