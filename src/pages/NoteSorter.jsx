import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Sparkles, FileText, Clock, User, CheckCircle2, AlertTriangle,
  Loader2, Trash2, Edit2, Filter, Search, Download, Plus,
  ArrowUpCircle, ArrowDownCircle, Circle, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function NoteSorter() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sortedNotes, setSortedNotes] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('new');

  const categories = ['إداري', 'فني', 'طبي', 'مالي', 'موارد بشرية', 'صيانة', 'تجهيزات', 'خدمات', 'أخرى'];
  const priorities = ['عاجل', 'مهم', 'متوسط', 'منخفض'];
  const statuses = ['جديد', 'قيد المعالجة', 'مكتمل', 'معلق'];

  useEffect(() => {
    loadSavedNotes();
  }, []);

  const loadSavedNotes = async () => {
    setIsLoading(true);
    try {
      const notes = await base44.entities.SortedNote.list('-created_date', 100);
      setSavedNotes(Array.isArray(notes) ? notes : []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeNotes = async () => {
    if (!inputText.trim()) {
      toast.error('الرجاء إدخال ملاحظات للتحليل');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت محلل متخصص في تصنيف وفرز الملاحظات الإدارية والصحية. قم بتحليل النص التالي واستخراج الملاحظات منه وتصنيفها:

النص المُدخل:
${inputText}

المطلوب:
1. فصل كل ملاحظة على حدة (قد يحتوي النص على ملاحظة واحدة أو عدة ملاحظات)
2. لكل ملاحظة، حدد:
   - title: عنوان مختصر وواضح (5-10 كلمات)
   - original_text: النص الأصلي للملاحظة
   - category: التصنيف (إداري، فني، طبي، مالي، موارد بشرية، صيانة، تجهيزات، خدمات، أخرى)
   - priority: الأولوية (عاجل، مهم، متوسط، منخفض)
   - suggested_responsible: الجهة المقترحة للمسؤولية
   - suggested_action: الإجراء المقترح
   - suggested_duration: المدة المتوقعة للإنجاز
   - analysis: تحليل مختصر للملاحظة

أرجع النتيجة بصيغة JSON array.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            notes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  original_text: { type: "string" },
                  category: { type: "string" },
                  priority: { type: "string" },
                  suggested_responsible: { type: "string" },
                  suggested_action: { type: "string" },
                  suggested_duration: { type: "string" },
                  analysis: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response && response.notes) {
        const processedNotes = response.notes.map((note, index) => ({
          id: `temp-${Date.now()}-${index}`,
          ...note,
          responsible_party: note.suggested_responsible || '',
          action_taken: '',
          expected_duration: note.suggested_duration || '',
          status: 'جديد',
          ai_analysis: note.analysis || ''
        }));
        setSortedNotes(processedNotes);
        setActiveTab('sorted');
        toast.success(`تم تحليل وفرز ${processedNotes.length} ملاحظة`);
      }
    } catch (error) {
      console.error('Error analyzing notes:', error);
      toast.error('فشل في تحليل الملاحظات');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveNote = async (note) => {
    try {
      await base44.entities.SortedNote.create({
        original_text: note.original_text,
        title: note.title,
        category: note.category,
        priority: note.priority,
        responsible_party: note.responsible_party,
        action_taken: note.action_taken,
        expected_duration: note.expected_duration,
        status: note.status,
        ai_analysis: note.ai_analysis
      });
      toast.success('تم حفظ الملاحظة');
      loadSavedNotes();
      setSortedNotes(prev => prev.filter(n => n.id !== note.id));
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('فشل في حفظ الملاحظة');
    }
  };

  const saveAllNotes = async () => {
    try {
      for (const note of sortedNotes) {
        await base44.entities.SortedNote.create({
          original_text: note.original_text,
          title: note.title,
          category: note.category,
          priority: note.priority,
          responsible_party: note.responsible_party,
          action_taken: note.action_taken,
          expected_duration: note.expected_duration,
          status: note.status,
          ai_analysis: note.ai_analysis
        });
      }
      toast.success(`تم حفظ ${sortedNotes.length} ملاحظة`);
      loadSavedNotes();
      setSortedNotes([]);
      setInputText('');
      setActiveTab('saved');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('فشل في حفظ الملاحظات');
    }
  };

  const updateSortedNote = (noteId, field, value) => {
    setSortedNotes(prev => prev.map(note =>
      note.id === noteId ? { ...note, [field]: value } : note
    ));
  };

  const updateSavedNote = async (noteId, updates) => {
    try {
      await base44.entities.SortedNote.update(noteId, updates);
      toast.success('تم تحديث الملاحظة');
      loadSavedNotes();
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('فشل في تحديث الملاحظة');
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) return;
    try {
      await base44.entities.SortedNote.delete(noteId);
      toast.success('تم حذف الملاحظة');
      loadSavedNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('فشل في حذف الملاحظة');
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'عاجل': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'مهم': return <ArrowUpCircle className="w-4 h-4 text-orange-600" />;
      case 'متوسط': return <Circle className="w-4 h-4 text-blue-600" />;
      case 'منخفض': return <ArrowDownCircle className="w-4 h-4 text-gray-600" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'عاجل': return 'bg-red-100 text-red-800 border-red-300';
      case 'مهم': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'متوسط': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'منخفض': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'إداري': 'bg-purple-100 text-purple-800',
      'فني': 'bg-blue-100 text-blue-800',
      'طبي': 'bg-green-100 text-green-800',
      'مالي': 'bg-yellow-100 text-yellow-800',
      'موارد بشرية': 'bg-pink-100 text-pink-800',
      'صيانة': 'bg-orange-100 text-orange-800',
      'تجهيزات': 'bg-cyan-100 text-cyan-800',
      'خدمات': 'bg-indigo-100 text-indigo-800',
      'أخرى': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'جديد': return 'bg-blue-100 text-blue-800';
      case 'قيد المعالجة': return 'bg-yellow-100 text-yellow-800';
      case 'مكتمل': return 'bg-green-100 text-green-800';
      case 'معلق': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSavedNotes = savedNotes.filter(note => {
    const matchesSearch = !searchQuery ||
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.original_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.responsible_party?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || note.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['العنوان', 'التصنيف', 'الأولوية', 'المسؤول', 'الإجراء', 'المدة المتوقعة', 'الحالة', 'النص الأصلي'];
    const rows = filteredSavedNotes.map(note => [
      note.title,
      note.category,
      note.priority,
      note.responsible_party,
      note.action_taken,
      note.expected_duration,
      note.status,
      note.original_text
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ملاحظات-مفرزة-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            فرز وتصنيف الملاحظات
          </h1>
          <p className="text-gray-600">
            أدخل ملاحظاتك وسيقوم النظام بتحليلها وتصنيفها تلقائياً
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="new" className="gap-2">
              <Plus className="w-4 h-4" />
              إدخال جديد
            </TabsTrigger>
            <TabsTrigger value="sorted" className="gap-2">
              <FileText className="w-4 h-4" />
              مفرزة ({sortedNotes.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              محفوظة ({savedNotes.length})
            </TabsTrigger>
          </TabsList>

          {/* تبويب الإدخال الجديد */}
          <TabsContent value="new">
            <Card className="border-2 border-indigo-200">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  إدخال الملاحظات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label>أدخل ملاحظاتك هنا (يمكنك إدخال ملاحظة واحدة أو عدة ملاحظات)</Label>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="مثال:
- يوجد تسريب في سقف غرفة الانتظار يحتاج إصلاح عاجل
- نحتاج تعيين موظف استقبال إضافي للفترة المسائية
- جهاز الأشعة يحتاج صيانة دورية
- تأخر وصول مستلزمات المختبر..."
                    rows={8}
                    className="text-lg"
                  />
                </div>

                <Button
                  onClick={analyzeNotes}
                  disabled={isAnalyzing || !inputText.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-6 text-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التحليل والفرز...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      تحليل وفرز الملاحظات
                    </>
                  )}
                </Button>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">💡 نصائح:</h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• يمكنك إدخال ملاحظات متعددة في نص واحد</li>
                    <li>• استخدم نقاط (-) أو أرقام لفصل الملاحظات</li>
                    <li>• كلما كانت الملاحظة واضحة، كان التصنيف أدق</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الملاحظات المفرزة */}
          <TabsContent value="sorted">
            {sortedNotes.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">لا توجد ملاحظات مفرزة</p>
                  <p className="text-sm text-gray-400">أدخل ملاحظات في التبويب الأول للبدء</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">الملاحظات المفرزة ({sortedNotes.length})</h3>
                  <Button onClick={saveAllNotes} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                    حفظ الكل
                  </Button>
                </div>

                <div className="grid gap-4">
                  {sortedNotes.map((note, index) => (
                    <Card key={note.id} className="border-2 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 space-y-4">
                        {/* العنوان والشارات */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                              <Input
                                value={note.title}
                                onChange={(e) => updateSortedNote(note.id, 'title', e.target.value)}
                                className="font-semibold text-lg border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                              />
                            </div>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{note.original_text}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getCategoryColor(note.category)}>{note.category}</Badge>
                            <Badge className={getPriorityColor(note.priority)}>
                              {getPriorityIcon(note.priority)}
                              <span className="mr-1">{note.priority}</span>
                            </Badge>
                          </div>
                        </div>

                        {/* تحليل AI */}
                        {note.ai_analysis && (
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2 text-purple-700 text-sm font-medium mb-1">
                              <Sparkles className="w-4 h-4" />
                              تحليل الذكاء الاصطناعي
                            </div>
                            <p className="text-sm text-purple-800">{note.ai_analysis}</p>
                          </div>
                        )}

                        {/* حقول الإدخال */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">التصنيف</Label>
                            <Select
                              value={note.category}
                              onValueChange={(value) => updateSortedNote(note.id, 'category', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">الأولوية</Label>
                            <Select
                              value={note.priority}
                              onValueChange={(value) => updateSortedNote(note.id, 'priority', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {priorities.map(p => (
                                  <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">الحالة</Label>
                            <Select
                              value={note.status}
                              onValueChange={(value) => updateSortedNote(note.id, 'status', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map(s => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              المسؤول
                            </Label>
                            <Input
                              value={note.responsible_party}
                              onChange={(e) => updateSortedNote(note.id, 'responsible_party', e.target.value)}
                              placeholder="الجهة أو الشخص المسؤول"
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              الإجراء المتخذ
                            </Label>
                            <Input
                              value={note.action_taken}
                              onChange={(e) => updateSortedNote(note.id, 'action_taken', e.target.value)}
                              placeholder="الإجراء المتخذ"
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              المدة المتوقعة
                            </Label>
                            <Input
                              value={note.expected_duration}
                              onChange={(e) => updateSortedNote(note.id, 'expected_duration', e.target.value)}
                              placeholder="مثال: 3 أيام"
                            />
                          </div>
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSortedNotes(prev => prev.filter(n => n.id !== note.id))}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 ml-1" />
                            حذف
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveNote(note)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 ml-1" />
                            حفظ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* تبويب الملاحظات المحفوظة */}
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    الملاحظات المحفوظة ({filteredSavedNotes.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="بحث..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {statuses.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={exportToCSV}>
                      <Download className="w-4 h-4 ml-1" />
                      تصدير
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : filteredSavedNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد ملاحظات محفوظة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSavedNotes.map((note) => (
                      <div
                        key={note.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{note.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{note.original_text}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <Badge className={getCategoryColor(note.category)}>{note.category}</Badge>
                            <Badge className={getPriorityColor(note.priority)}>
                              {getPriorityIcon(note.priority)}
                              <span className="mr-1">{note.priority}</span>
                            </Badge>
                            <Badge className={getStatusColor(note.status)}>{note.status}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-3 pt-3 border-t">
                          <div>
                            <span className="text-gray-500">المسؤول:</span>
                            <span className="font-medium mr-1">{note.responsible_party || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">الإجراء:</span>
                            <span className="font-medium mr-1">{note.action_taken || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">المدة:</span>
                            <span className="font-medium mr-1">{note.expected_duration || '-'}</span>
                          </div>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingNote(note)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNote(note.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog تعديل الملاحظة */}
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تعديل الملاحظة</DialogTitle>
            </DialogHeader>
            {editingNote && (
              <div className="space-y-4">
                <div>
                  <Label>العنوان</Label>
                  <Input
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>التصنيف</Label>
                    <Select
                      value={editingNote.category}
                      onValueChange={(value) => setEditingNote({ ...editingNote, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>الأولوية</Label>
                    <Select
                      value={editingNote.priority}
                      onValueChange={(value) => setEditingNote({ ...editingNote, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>الحالة</Label>
                    <Select
                      value={editingNote.status}
                      onValueChange={(value) => setEditingNote({ ...editingNote, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>المدة المتوقعة</Label>
                    <Input
                      value={editingNote.expected_duration}
                      onChange={(e) => setEditingNote({ ...editingNote, expected_duration: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>المسؤول</Label>
                  <Input
                    value={editingNote.responsible_party}
                    onChange={(e) => setEditingNote({ ...editingNote, responsible_party: e.target.value })}
                  />
                </div>

                <div>
                  <Label>الإجراء المتخذ</Label>
                  <Textarea
                    value={editingNote.action_taken}
                    onChange={(e) => setEditingNote({ ...editingNote, action_taken: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingNote(null)}>إلغاء</Button>
              <Button
                onClick={() => updateSavedNote(editingNote.id, editingNote)}
                className="bg-green-600 hover:bg-green-700"
              >
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}