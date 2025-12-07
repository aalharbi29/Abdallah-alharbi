import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // محاكاة جلب الإشعارات - يمكن ربطها لاحقاً بقاعدة البيانات
    const mockNotifications = [
      {
        id: 1,
        type: "warning",
        title: "نقص في التمريض",
        message: "مركز صحي الشقرة يحتاج إلى فني تمريض إضافي",
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString('ar-SA'),
        priority: "عالية",
        unread: true
      },
      {
        id: 2,
        type: "info", 
        title: "إجازة جديدة",
        message: "طلب إجازة من أحمد محمد - مركز العقدة",
        time: new Date(Date.now() - 30 * 60 * 1000).toLocaleString('ar-SA'),
        priority: "متوسطة",
        unread: true
      },
      {
        id: 3,
        type: "success",
        title: "تم اعتماد الإجازة",
        message: "تم اعتماد إجازة فاطمة أحمد من مركز الهميج",
        time: new Date(Date.now() - 60 * 60 * 1000).toLocaleString('ar-SA'),
        priority: "منخفضة",
        unread: false
      },
      {
        id: 4,
        type: "warning",
        title: "تذكير مهم",
        message: "انتهاء عقد محمد السلمي خلال 30 يوماً",
        time: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString('ar-SA'),
        priority: "عالية",
        unread: true
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 hover:bg-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 md:w-96">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              الإشعارات
            </div>
            {notifications.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                className="text-xs"
              >
                مسح الكل
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            آخر التحديثات والإشعارات المهمة
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>لا توجد إشعارات جديدة</p>
            </div>
          ) : (
            notifications.map(notification => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 leading-relaxed">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{notification.time}</span>
                        <Badge 
                          variant={notification.priority === 'عالية' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}