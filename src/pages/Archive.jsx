import React, { useState, useEffect, useMemo } from 'react';
import { ArchivedFile } from '@/entities/ArchivedFile';
import { Employee } from '@/entities/Employee';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Archive as ArchiveIcon, Search, FileText, BarChart, File, AlertTriangle, RefreshCw, Briefcase, Users, Box, Wrench, FileCheck } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import UploadArchiveForm from '../components/archive/UploadArchiveForm';
import ArchiveList from '../components/archive/ArchiveList';
import ExportManager from '../components/export/ExportManager';

const categories = {
  circulars: { 
    name: 'التعاميم المنظمة', 
    icon: FileText,
    subCategories: {
      policies_procedures: { name: 'نماذج السياسات والإجراءات', icon: FileCheck }
    }
  },
  inventory: { 
    name: 'ملفات الحصر', 
    icon: BarChart,
    subCategories: {
      human_resources: { name: 'حصر بشري', icon: Users },
      fixed_assets: { name: 'حصر أصول ثابتة', icon: Box },
      equipment: { name: 'حصر أجهزة', icon: Wrench }
    }
  },
  assignments: { name: 'التكاليف', icon: Briefcase, subCategories: null },
  other: { name: 'ملفات أخرى', icon: File, subCategories: null },
};

export default function ArchivePage() {
  const [files, setFiles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('circulars');
  const [activeSubTab, setActiveSubTab] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [filesData, employeesData] = await Promise.allSettled([
        ArchivedFile.list('-created_date', 500),
        Employee.list()
      ]);
      
      setFiles(filesData.status === 'fulfilled' && Array.isArray(filesData.value) ? filesData.value : []);
      setEmployees(employeesData.status === 'fulfilled' && Array.isArray(employeesData.value) ? employeesData.value : []);
      
    } catch (error) {
      console.error("Failed to load archive data:", error);
      setError("فشل في تحميل بيانات الأرشيف. تأكد من اتصالك بالإنترنت.");
      setFiles([]);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileMove = async (fileId, newCategory, newSubCategory = '') => {
    try {
      await ArchivedFile.update(fileId, { 
        category: newCategory,
        sub_category: newSubCategory 
      });
      loadData();
      alert('تم نقل الملف بنجاح!');
    } catch (err) {
      console.error('Failed to move file:', err);
      alert('فشل نقل الملف.');
    }
  };

  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeFiles = Array.isArray(files) ? files : [];

  const filteredFiles = useMemo(() => {
    return safeFiles
      .filter(file => {
        if (!file) return false;
        
        // Filter by main category
        if (file.category !== activeTab) return false;
        
        // Filter by sub-category if exists
        if (activeSubTab && file.sub_category !== activeSubTab) return false;
        
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            (file.title && file.title.toLowerCase().includes(query)) ||
            (file.description && file.description.toLowerCase().includes(query)) ||
            (file.file_name && file.file_name.toLowerCase().includes(query)) ||
            (file.tags && Array.isArray(file.tags) && file.tags.some(tag => tag && tag.toLowerCase().includes(query)))
          );
        }
        
        return true;
      });
  }, [safeFiles, activeTab, activeSubTab, searchQuery]);

  // Group files by group_id
  const groupedFiles = useMemo(() => {
    const groups = {};
    filteredFiles.forEach(file => {
      if (!file) return;
      const groupId = file.group_id || file.id;
      if (!groups[groupId]) {
        groups[groupId] = [];
      }
      groups[groupId].push(file);
    });
    return Object.values(groups);
  }, [filteredFiles]);

  const handleDelete = async (id) => {
    try {
      await ArchivedFile.delete(id);
      await loadData();
      alert('تم حذف الملف بنجاح.');
    } catch (err) {
      console.error('Failed to delete file:', err);
      alert('فشل حذف الملف.');
    }
  };

  const currentCategory = categories[activeTab];
  const hasSubCategories = currentCategory?.subCategories;

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4">
            <ArchiveIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">🗄️ الأرشيف المركزي</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">إدارة وتنظيم وأرشفة جميع المستندات الهامة بكفاءة وأمان.</p>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setActiveSubTab(''); }} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {Object.entries(categories).map(([key, categoryData]) => {
              const Icon = categoryData.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {categoryData.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {Object.keys(categories).map(key => {
            const category = categories[key];
            const Icon = category.icon;
            
            return (
              <TabsContent key={key} value={key}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          أرشيف: {category.name}
                        </CardTitle>
                        <CardDescription>
                          إجمالي: {filteredFiles.length} ملف
                          {groupedFiles.length !== filteredFiles.length && ` (${groupedFiles.length} مجموعة)`}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 items-center flex-wrap w-full md:w-auto">
                        <div className="relative flex-grow min-w-[200px]">
                          <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pr-10" />
                        </div>
                        <ExportManager data={filteredFiles} filename={`ارشيف_${category.name}`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <UploadArchiveForm 
                        category={key} 
                        subCategory={activeSubTab}
                        onUploadFinish={loadData} 
                      />
                    </div>

                    {hasSubCategories && category.subCategories && (
                      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="mb-4">
                        <TabsList className="w-full justify-start">
                          <TabsTrigger value={""} className="gap-2">
                            <Icon className="w-4 h-4" />
                            الكل
                          </TabsTrigger>
                          {Object.entries(category.subCategories || {}).map(([subKey, sub]) => {
                            const SubIcon = sub.icon;
                            const subFiles = safeFiles.filter(f => f && f.category === key && f.sub_category === subKey);
                            return (
                              <TabsTrigger key={subKey} value={subKey} className="gap-2">
                                <SubIcon className="w-4 h-4" />
                                {sub.name}
                                <Badge variant="secondary" className="ml-1">{subFiles.length}</Badge>
                              </TabsTrigger>
                            );
                          })}
                        </TabsList>
                      </Tabs>
                    )}

                    <ArchiveList 
                      fileGroups={groupedFiles}
                      isLoading={isLoading} 
                      onDelete={handleDelete} 
                      onMove={handleFileMove}
                      onRefresh={loadData}
                      employees={safeEmployees}
                      allCategories={categories}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}