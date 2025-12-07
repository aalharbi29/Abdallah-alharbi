import React, { useState, useEffect } from 'react';
import { Notification } from '@/entities/Notification';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadNotifications = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await Notification.list('-created_date', 10);
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load notifications:", err);
            setError("فشل التحميل");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if(isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    const unreadCount = (notifications || []).filter(n => !n.is_read).length;

    const markAllAsRead = async () => {
        try {
            const updates = (notifications || []).filter(n => !n.is_read).map(n => Notification.update(n.id, { is_read: true }));
            await Promise.all(updates);
            loadNotifications();
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative p-2 mobile-button">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-red-500 flex items-center justify-center p-0">{unreadCount}</Badge>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 mr-4">
                <div className="flex justify-between items-center mb-2 pb-2 border-b">
                    <h4 className="font-medium text-sm">الإشعارات</h4>
                    {unreadCount > 0 && 
                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={markAllAsRead}>
                            <CheckCheck className="w-3 h-3 ml-1" />
                            وضع علامة مقروء
                        </Button>}
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : error ? (
                        <div className="text-center p-4 text-red-600">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm font-semibold">{error}</p>
                            <Button variant="link" size="sm" onClick={loadNotifications}>
                                <RefreshCw className="w-3 h-3 ml-1" />
                                إعادة المحاولة
                            </Button>
                        </div>
                    ) : (notifications || []).length > 0 ? (
                        (notifications || []).map(n => (
                            <div key={n.id} className={`p-2 rounded-md ${!n.is_read ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                <Link to={n.link || '#'} onClick={() => setIsOpen(false)}>
                                    <p className="font-semibold text-sm">{n.title}</p>
                                    <p className="text-xs text-gray-500">{n.description}</p>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">لا توجد إشعارات جديدة.</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}