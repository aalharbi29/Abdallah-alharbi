import React, { useState, useEffect } from "react";
import { MonthlyStatisticTask } from "@/entities/MonthlyStatisticTask";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, AlertCircle, Clock, FileText, Plus, Loader2, Download, Printer, Trash2 } from "lucide-react";
import { differenceInDays } from "date-fns";
import { UploadFile } from "@/integrations/Core";
import { Progress } from "@/components/ui/progress";
import { downloadFileWithName } from "@/components/files/InlineFileReplacer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MonthlyStatistics() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [user, setUser] = useState(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    template_file: null,
    notes: ''
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadStatus, setCurrentUploadStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const allTasks = await MonthlyStatisticTask.list("-due_date", 100);
      
      const relevantTasks = allTasks.filter(task => {
        if (!task) return false;
        const isCurrentMonth = task.month === currentMonth && task.year === currentYear;
        const isPreviousMonth = task.month === (currentMonth === 1 ? 12 : currentMonth - 1) && 
                               task.year === (currentMonth === 1 ? currentYear - 1 : currentYear);
        return isCurrentMonth || isPreviousMonth;
      });

      setTasks(relevantTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sanitizeFilename = (filename) => {
    if (!filename) return `file_${Date.now()}.dat`;
    
    const extension = filename.split(".").pop() || 'dat';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    let safeName = nameWithoutExt
      .normalize('NFD')
      .replace(/[\u0600-\u06FF]/g, '')
      .replace(/[\u0750-\u077F]/g, '')
      .replace(/[\u08A0-\u08FF]/g, '')
      .replace(/[\uFB50-\uFDFF]/g, '')
      .replace(/[\uFE70-\uFEFF]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 30);
    
    if (!safeName || safeName.length < 3) {
      safeName = `file_${Date.now()}`;
    }
    
    return `${safeName}.${extension}`;
  };

  const uploadFileWithRetry = async (file, maxRetries = 2) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setCurrentUploadStatus(`محاولة ${attempt}/${maxRetries}: جاري رفع ${file.name}`);
        setUploadProgress(30 * attempt);
        
        const safeFileName = sanitizeFilename(file.name);
        const fileToUpload = new File([file], safeFileName, { 
          type: file.type,
          lastModified: file.lastModified 
        });

        const uploadResult = await UploadFile({ file: fileToUpload });
        
        if (uploadResult && uploadResult.file_url) {
          setUploadProgress(70);
          return uploadResult;
        } else {
          throw new Error('رد غير صالح من الخادم');
        }
      } catch (err) {
        console.error(`المحاولة ${attempt} فشلت:`, err);
        
        if (attempt === maxRetries) {
          throw new Error(`فشل رفع الملف: ${err.message || 'خطأ غير معروف'}`);
        }
        
        const delay = 2000 * attempt;
        setCurrentUploadStatus(`جاري إعادة المحاولة بعد ${delay / 1000} ثانية...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.due_date) {
      alert('الرجاء إدخال العنوان وتاريخ الاستحقاق');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setCurrentUploadStatus('جاري إضافة التذكير...');

      let templateUrl = null;
      let templateName = null;

      if (newTask.template_file) {
        setCurrentUploadStatus('جاري رفع نموذج الإحصائية...');
        const uploadResult = await uploadFileWithRetry(newTask.template_file);
        templateUrl = uploadResult.file_url;
        templateName = newTask.template_file.name;
      }

      setUploadProgress(80);
      setCurrentUploadStatus('جاري الحفظ...');

      await MonthlyStatisticTask.create({
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.due_date,
        month: newTask.month,
        year: newTask.year,
        template_file_url: templateUrl,
        template_file_name: templateName,
        notes: newTask.notes
      });

      setUploadProgress(100);
      setCurrentUploadStatus('تم بنجاح!');
      
      setTimeout(() => {
        setShowAddDialog(false);
        setNewTask({
          title: '',
          description: '',
          due_date: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          template_file: null,
          notes: ''
        });
        setUploadProgress(0);
        setCurrentUploadStatus('');
        loadData();
      }, 1000);
      
    } catch (error) {
      console.error("Error adding task:", error);
      alert(`فشل إضافة التذكير:\n\n${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await MonthlyStatisticTask.delete(taskId);
      loadData();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("فشل في حذف التذكير");
    }
  };

  const getStatusBadge = (task) => {
    if (!task) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const daysRemaining = differenceInDays(dueDate, today);

    if (daysRemaining < 0) {
      return <Badge className="bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 ml-1" />فات موعدها</Badge>;
    }
    
    if (daysRemaining === 0) {
      return <Badge className="bg-orange-100 text-orange-700"><Clock className="w-3 h-3 ml-1" />اليوم</Badge>;
    }
    
    if (daysRemaining <= 3) {
      return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 ml-1" />قريباً</Badge>;
    }
    
    return <Badge className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 ml-1" />قادمة</Badge>;
  };

  const getDaysInfo = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const days = differenceInDays(due, today);
    
    if (days < 0) return `تأخر ${Math.abs(days)} يوم`;
    if (days === 0) return 'موعدها اليوم';
    if (days === 1) return 'موعدها غداً';
    return `بعد ${days} يوم`;
  };

  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  const sortedTasks = [...tasks].sort((a, b) => {
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const handlePrintTemplate = (task) => {
    if (task.template_file_url) {
      window.open(task.template_file_url, '_blank');
    }
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="text-blue-600 w-5 h-5" />
            تذكير الإحصائيات المطلوبة شهرياً
          </CardTitle>
          {user?.role === 'admin' && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة تذكير
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إضافة تذكير بإحصائية شهرية</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>اسم الإحصائية *</Label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="مثال: إحصائية الزيارات اليومية"
                      disabled={uploading}
                    />
                  </div>
                  <div>
                    <Label>وصف مختصر (اختياري)</Label>
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="تفاصيل عن الإحصائية..."
                      rows={2}
                      disabled={uploading}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>الشهر *</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={newTask.month}
                        onChange={(e) => setNewTask(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <Label>السنة *</Label>
                      <Input
                        type="number"
                        value={newTask.year}
                        onChange={(e) => setNewTask(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <Label>تاريخ الاستحقاق *</Label>
                      <Input
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <Label className="text-blue-600 font-semibold flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      النموذج الفارغ (اختياري)
                    </Label>
                    <p className="text-xs text-gray-500 mb-2">
                      قم برفع نموذج الإحصائية الفارغ ليتمكن الموظفون من تحميله وطباعته
                    </p>
                    <Input
                      type="file"
                      onChange={(e) => setNewTask(prev => ({ ...prev, template_file: e.target.files?.[0] || null }))}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      disabled={uploading}
                    />
                    {newTask.template_file && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {newTask.template_file.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>ملاحظات إضافية (اختياري)</Label>
                    <Textarea
                      value={newTask.notes}
                      onChange={(e) => setNewTask(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="أي ملاحظات مهمة..."
                      rows={2}
                      disabled={uploading}
                    />
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-xs text-gray-600 text-center">{currentUploadStatus}</p>
                      <p className="text-xs text-center text-gray-500">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddDialog(false)}
                    disabled={uploading}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleAddTask}
                    disabled={uploading || !newTask.title || !newTask.due_date}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        جاري الإضافة...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">لا توجد تذكيرات حالياً</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {sortedTasks.map((task) => {
              if (!task) return null;
              
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dueDate = new Date(task.due_date);
              dueDate.setHours(0, 0, 0, 0);
              const isPastDue = dueDate < today;
              
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isPastDue ? 'bg-red-50 border-red-200' :
                    'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{task.title}</h4>
                        {getStatusBadge(task)}
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>📅 {monthNames[task.month - 1]} {task.year}</span>
                        <span className={isPastDue ? 'text-red-600 font-medium' : ''}>
                          {getDaysInfo(task.due_date)}
                        </span>
                      </div>
                      {task.notes && (
                        <p className="text-xs text-gray-500 mt-2 italic">💡 {task.notes}</p>
                      )}
                    </div>

                    {user?.role === 'admin' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 px-2">
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذا التذكير؟
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(task.id)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  {task.template_file_url && (
                    <div className="pt-2 border-t flex items-center gap-2">
                      <div className="flex items-center gap-2 text-xs text-blue-700 flex-1">
                        <FileText className="w-4 h-4" />
                        <span>نموذج فارغ متاح</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFileWithName(task.template_file_url, task.template_file_name || 'template.pdf')}
                        className="h-7 gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span className="hidden sm:inline">تحميل</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintTemplate(task)}
                        className="h-7 gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span className="hidden sm:inline">طباعة</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}