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
  ArrowUpCircle, ArrowDownCircle, Circle, AlertCircle, Printer, FileCode
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

  const generateHTMLReport = () => {
    const today = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // إحصائيات
    const stats = {
      total: filteredSavedNotes.length,
      byCategory: categories.reduce((acc, cat) => {
        acc[cat] = filteredSavedNotes.filter(n => n.category === cat).length;
        return acc;
      }, {}),
      byPriority: priorities.reduce((acc, p) => {
        acc[p] = filteredSavedNotes.filter(n => n.priority === p).length;
        return acc;
      }, {}),
      byStatus: statuses.reduce((acc, s) => {
        acc[s] = filteredSavedNotes.filter(n => n.status === s).length;
        return acc;
      }, {})
    };

    const priorityColors = {
      'عاجل': '#dc2626',
      'مهم': '#ea580c',
      'متوسط': '#2563eb',
      'منخفض': '#6b7280'
    };

    const statusColors = {
      'جديد': '#3b82f6',
      'قيد المعالجة': '#f59e0b',
      'مكتمل': '#22c55e',
      'معلق': '#ef4444'
    };

    const categoryColors = {
      'إداري': '#9333ea',
      'فني': '#3b82f6',
      'طبي': '#22c55e',
      'مالي': '#eab308',
      'موارد بشرية': '#ec4899',
      'صيانة': '#f97316',
      'تجهيزات': '#06b6d4',
      'خدمات': '#6366f1',
      'أخرى': '#6b7280'
    };

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير الملاحظات المفرزة - ${today}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: #1e293b;
      line-height: 1.6;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      padding: 40px;
      border-radius: 20px;
      margin-bottom: 30px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(79, 70, 229, 0.3);
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .header .subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
    }
    
    .header .date {
      margin-top: 15px;
      padding: 10px 20px;
      background: rgba(255,255,255,0.2);
      border-radius: 30px;
      display: inline-block;
      font-weight: 600;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
    }
    
    .stat-number {
      font-size: 3rem;
      font-weight: 800;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .stat-label {
      color: #64748b;
      font-weight: 600;
      margin-top: 5px;
    }
    
    .section {
      background: white;
      border-radius: 16px;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    
    .section-header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 20px 30px;
      font-size: 1.3rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-content {
      padding: 25px;
    }
    
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
      margin-bottom: 30px;
    }
    
    .chart-card {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    
    .chart-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .bar-item {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .bar-label {
      min-width: 100px;
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    .bar-container {
      flex: 1;
      height: 30px;
      background: #f1f5f9;
      border-radius: 15px;
      overflow: hidden;
      position: relative;
    }
    
    .bar-fill {
      height: 100%;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      color: white;
      font-weight: 700;
      font-size: 0.85rem;
      min-width: 40px;
      transition: width 0.5s ease;
    }
    
    .notes-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }
    
    .notes-table th {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: white;
      padding: 15px 12px;
      text-align: right;
      font-weight: 700;
      font-size: 0.95rem;
    }
    
    .notes-table th:first-child {
      border-radius: 0 12px 0 0;
    }
    
    .notes-table th:last-child {
      border-radius: 12px 0 0 0;
    }
    
    .notes-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.9rem;
    }
    
    .notes-table tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .notes-table tr:hover {
      background: #ede9fe;
    }
    
    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
    }
    
    .priority-عاجل { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .priority-مهم { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
    .priority-متوسط { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
    .priority-منخفض { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }
    
    .status-جديد { background: #eff6ff; color: #3b82f6; }
    .status-قيد-المعالجة { background: #fef3c7; color: #d97706; }
    .status-مكتمل { background: #dcfce7; color: #16a34a; }
    .status-معلق { background: #fef2f2; color: #dc2626; }
    
    .category-badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .footer {
      text-align: center;
      padding: 30px;
      color: #64748b;
      font-size: 0.9rem;
      border-top: 2px solid #e2e8f0;
      margin-top: 30px;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .summary-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    
    .summary-card h4 {
      font-size: 1rem;
      color: #64748b;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .summary-list {
      list-style: none;
    }
    
    .summary-list li {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    
    .summary-list li:last-child {
      border-bottom: none;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .header {
        box-shadow: none;
        border: 2px solid #4f46e5;
      }
      
      .section, .stat-card, .chart-card, .summary-card {
        box-shadow: none;
        border: 1px solid #e2e8f0;
        break-inside: avoid;
      }
      
      .notes-table tr {
        break-inside: avoid;
      }
    }
    
    @media (max-width: 768px) {
      .header h1 {
        font-size: 1.8rem;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .stat-number {
        font-size: 2rem;
      }
      
      .notes-table {
        font-size: 0.8rem;
      }
      
      .notes-table th, .notes-table td {
        padding: 10px 8px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 تقرير الملاحظات المفرزة</h1>
      <p class="subtitle">تحليل شامل ومتابعة للملاحظات والإجراءات</p>
      <div class="date">📅 ${today}</div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${stats.total}</div>
        <div class="stat-label">إجمالي الملاحظات</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="background: linear-gradient(135deg, #dc2626, #f87171); -webkit-background-clip: text;">${stats.byPriority['عاجل'] || 0}</div>
        <div class="stat-label">عاجلة</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="background: linear-gradient(135deg, #f59e0b, #fbbf24); -webkit-background-clip: text;">${stats.byStatus['قيد المعالجة'] || 0}</div>
        <div class="stat-label">قيد المعالجة</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="background: linear-gradient(135deg, #22c55e, #4ade80); -webkit-background-clip: text;">${stats.byStatus['مكتمل'] || 0}</div>
        <div class="stat-label">مكتملة</div>
      </div>
    </div>
    
    <div class="charts-grid">
      <div class="chart-card">
        <h3 class="chart-title">📊 التوزيع حسب التصنيف</h3>
        <div class="bar-chart">
          ${categories.filter(cat => stats.byCategory[cat] > 0).map(cat => `
            <div class="bar-item">
              <span class="bar-label">${cat}</span>
              <div class="bar-container">
                <div class="bar-fill" style="width: ${Math.max((stats.byCategory[cat] / stats.total) * 100, 15)}%; background: ${categoryColors[cat]};">
                  ${stats.byCategory[cat]}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="chart-card">
        <h3 class="chart-title">⚡ التوزيع حسب الأولوية</h3>
        <div class="bar-chart">
          ${priorities.filter(p => stats.byPriority[p] > 0).map(p => `
            <div class="bar-item">
              <span class="bar-label">${p}</span>
              <div class="bar-container">
                <div class="bar-fill" style="width: ${Math.max((stats.byPriority[p] / stats.total) * 100, 15)}%; background: ${priorityColors[p]};">
                  ${stats.byPriority[p]}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="chart-card">
        <h3 class="chart-title">📈 التوزيع حسب الحالة</h3>
        <div class="bar-chart">
          ${statuses.filter(s => stats.byStatus[s] > 0).map(s => `
            <div class="bar-item">
              <span class="bar-label">${s}</span>
              <div class="bar-container">
                <div class="bar-fill" style="width: ${Math.max((stats.byStatus[s] / stats.total) * 100, 15)}%; background: ${statusColors[s]};">
                  ${stats.byStatus[s]}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-header">
        📝 جدول الملاحظات التفصيلي
      </div>
      <div class="section-content" style="overflow-x: auto;">
        <table class="notes-table">
          <thead>
            <tr>
              <th>#</th>
              <th>العنوان</th>
              <th>التصنيف</th>
              <th>الأولوية</th>
              <th>الحالة</th>
              <th>المسؤول</th>
              <th>الإجراء</th>
              <th>المدة</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSavedNotes.map((note, idx) => `
              <tr>
                <td style="font-weight: 700; color: #4f46e5;">${idx + 1}</td>
                <td>
                  <strong>${note.title}</strong>
                  <div style="font-size: 0.8rem; color: #64748b; margin-top: 5px;">${note.original_text?.substring(0, 100)}${note.original_text?.length > 100 ? '...' : ''}</div>
                </td>
                <td><span class="category-badge" style="background: ${categoryColors[note.category]}20; color: ${categoryColors[note.category]};">${note.category}</span></td>
                <td><span class="badge priority-${note.priority}">${note.priority}</span></td>
                <td><span class="badge status-${note.status?.replace(' ', '-')}">${note.status}</span></td>
                <td>${note.responsible_party || '-'}</td>
                <td>${note.action_taken || '-'}</td>
                <td>${note.expected_duration || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="footer">
      <p>تم إنشاء هذا التقرير بواسطة نظام فرز الملاحظات الذكي</p>
      <p style="margin-top: 5px;">وزارة الصحة - قطاع الحناكية الصحي</p>
    </div>
  </div>
</body>
</html>`;

    return html;
  };

  const exportToHTML = () => {
    const html = generateHTMLReport();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-الملاحظات-${new Date().toISOString().split('T')[0]}.html`;
    link.click();
  };

  const printReport = () => {
    const html = generateHTMLReport();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
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
                      CSV
                    </Button>
                    <Button variant="outline" onClick={exportToHTML} className="text-purple-600 hover:bg-purple-50">
                      <FileCode className="w-4 h-4 ml-1" />
                      HTML
                    </Button>
                    <Button variant="outline" onClick={printReport} className="text-green-600 hover:bg-green-50">
                      <Printer className="w-4 h-4 ml-1" />
                      طباعة
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