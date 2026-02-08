import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Search, 
  Filter,
  Calendar,
  User,
  Briefcase,
  FileSignature,
  AlertCircle,
  Eye,
  Check,
  X,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const REQUEST_TYPES = {
  introduction_letter: { label: 'خطابات تعريف', icon: FileText, color: 'blue' },
  assignment: { label: 'تكليفات', icon: Briefcase, color: 'purple' },
  leave: { label: 'إجازات', icon: Calendar, color: 'green' },
  allowance: { label: 'بدلات', icon: TrendingUp, color: 'orange' },
  other: { label: 'أخرى', icon: FileSignature, color: 'gray' }
};

const STATUS_CONFIG = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'معتمد', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function ApprovalRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.ApprovalRequest.list('-created_date', 200);
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // توليد الرقم المعتمد
  const generateApprovedNumber = async (requestType) => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    // حساب عدد الطلبات المعتمدة في هذا الشهر
    const approvedThisMonth = requests.filter(r => {
      if (r.status !== 'approved' || !r.approved_date) return false;
      const approvedDate = new Date(r.approved_date);
      return approvedDate.getMonth() === now.getMonth() && 
             approvedDate.getFullYear() === now.getFullYear() &&
             r.request_type === requestType;
    }).length;
    
    const sequence = String(approvedThisMonth + 1).padStart(3, '0');
    return `47-${month}${year}-${sequence}`;
  };

  // اعتماد الطلب
  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      const approvedNumber = await generateApprovedNumber(selectedRequest.request_type);
      
      await base44.entities.ApprovalRequest.update(selectedRequest.id, {
        status: 'approved',
        approved_number: approvedNumber,
        approved_date: new Date().toISOString(),
        approved_by: 'المستخدم الحالي'
      });
      
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      loadRequests();
      alert(`تم اعتماد الطلب بنجاح\nالرقم المعتمد: ${approvedNumber}`);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('حدث خطأ أثناء الاعتماد');
    } finally {
      setIsProcessing(false);
    }
  };

  // رفض الطلب
  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }
    setIsProcessing(true);
    try {
      await base44.entities.ApprovalRequest.update(selectedRequest.id, {
        status: 'rejected',
        rejection_reason: rejectionReason,
        approved_date: new Date().toISOString(),
        approved_by: 'المستخدم الحالي'
      });
      
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason('');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('حدث خطأ أثناء الرفض');
    } finally {
      setIsProcessing(false);
    }
  };

  // فلترة الطلبات
  const filteredRequests = requests.filter(req => {
    const matchesSearch = !searchQuery || 
      req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.request_number?.includes(searchQuery);
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && req.status === 'pending') ||
      (activeTab === 'approved' && req.status === 'approved') ||
      (activeTab === 'rejected' && req.status === 'rejected') ||
      req.request_type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // إحصائيات
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  const typeStats = Object.keys(REQUEST_TYPES).reduce((acc, type) => {
    acc[type] = requests.filter(r => r.request_type === type && r.status === 'pending').length;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">اعتماد الطلبات</h1>
              <p className="text-sm text-gray-600">إدارة ومراجعة طلبات الاعتماد</p>
            </div>
          </div>
          <Button onClick={loadRequests} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">قيد الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">معتمدة</p>
                  <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">مرفوضة</p>
                  <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="بحث بالعنوان أو اسم الموظف أو رقم الطلب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-2 bg-transparent p-0">
            <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              الكل ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              قيد الانتظار ({stats.pending})
            </TabsTrigger>
            {Object.entries(REQUEST_TYPES).map(([key, config]) => (
              <TabsTrigger 
                key={key} 
                value={key}
                className={`data-[state=active]:bg-${config.color}-600 data-[state=active]:text-white rounded-lg px-4 py-2`}
              >
                <config.icon className="w-4 h-4 ml-1" />
                {config.label}
                {typeStats[key] > 0 && (
                  <Badge variant="secondary" className="mr-2 text-xs">
                    {typeStats[key]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-gray-600">جاري التحميل...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">لا توجد طلبات</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map(request => {
                  const typeConfig = REQUEST_TYPES[request.request_type] || REQUEST_TYPES.other;
                  const statusConfig = STATUS_CONFIG[request.status];
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${typeConfig.color}-100`}>
                              <typeConfig.icon className={`w-6 h-6 text-${typeConfig.color}-600`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900">{request.title}</h3>
                                <Badge className={statusConfig.color}>
                                  <StatusIcon className="w-3 h-3 ml-1" />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {request.employee_name || 'غير محدد'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(request.created_date).toLocaleDateString('ar-SA')}
                                </span>
                                {request.request_number && (
                                  <span className="text-indigo-600 font-medium">
                                    #{request.request_number}
                                  </span>
                                )}
                                {request.approved_number && (
                                  <Badge variant="outline" className="text-green-600 border-green-300">
                                    الرقم المعتمد: {request.approved_number}
                                  </Badge>
                                )}
                              </div>
                              {request.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                  {request.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="w-4 h-4 ml-1" />
                              عرض
                            </Button>
                            
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowApprovalDialog(true);
                                  }}
                                >
                                  <Check className="w-4 h-4 ml-1" />
                                  اعتماد
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <X className="w-4 h-4 ml-1" />
                                  رفض
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* View Request Dialog */}
        <Dialog open={!!selectedRequest && !showApprovalDialog && !showRejectDialog} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل الطلب</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">نوع الطلب</Label>
                    <p className="font-medium">{REQUEST_TYPES[selectedRequest.request_type]?.label || 'أخرى'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">الحالة</Label>
                    <Badge className={STATUS_CONFIG[selectedRequest.status].color}>
                      {STATUS_CONFIG[selectedRequest.status].label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">العنوان</Label>
                    <p className="font-medium">{selectedRequest.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">الموظف</Label>
                    <p className="font-medium">{selectedRequest.employee_name || 'غير محدد'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">تاريخ الطلب</Label>
                    <p>{new Date(selectedRequest.created_date).toLocaleDateString('ar-SA')}</p>
                  </div>
                  {selectedRequest.approved_number && (
                    <div>
                      <Label className="text-xs text-gray-500">الرقم المعتمد</Label>
                      <p className="font-bold text-green-600">{selectedRequest.approved_number}</p>
                    </div>
                  )}
                </div>
                
                {selectedRequest.description && (
                  <div>
                    <Label className="text-xs text-gray-500">الوصف</Label>
                    <p className="text-sm">{selectedRequest.description}</p>
                  </div>
                )}
                
                {selectedRequest.rejection_reason && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <Label className="text-xs text-red-600">سبب الرفض</Label>
                    <p className="text-red-800">{selectedRequest.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تأكيد الاعتماد</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                هل أنت متأكد من اعتماد هذا الطلب؟
              </p>
              <p className="text-sm text-gray-500 mt-2">
                <strong>العنوان:</strong> {selectedRequest?.title}
              </p>
              <p className="text-sm text-gray-500">
                <strong>الموظف:</strong> {selectedRequest?.employee_name || 'غير محدد'}
              </p>
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  سيتم توليد رقم اعتماد تلقائي بصيغة: 47-الشهر-التسلسل
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)} disabled={isProcessing}>
                إلغاء
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" disabled={isProcessing}>
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Check className="w-4 h-4 ml-2" />
                )}
                تأكيد الاعتماد
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>رفض الطلب</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-gray-600">
                يرجى إدخال سبب الرفض:
              </p>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="سبب الرفض..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
                إلغاء
              </Button>
              <Button onClick={handleReject} variant="destructive" disabled={isProcessing || !rejectionReason.trim()}>
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <X className="w-4 h-4 ml-2" />
                )}
                تأكيد الرفض
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}