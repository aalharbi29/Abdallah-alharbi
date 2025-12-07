
import React, { useState, useEffect } from 'react';
import { Event } from '@/entities/Event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import SmartDualCalendar from '@/components/ui/SmartDualCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

// دالة تحويل التاريخ الميلادي إلى هجري
const toHijri = (gregorianDate) => {
    try {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(gregorianDate);
    } catch (error) {
        console.error('Error converting to Hijri:', error);
        return '';
    }
};

// دالة تحويل التاريخ الهجري إلى ميلادي (تقريبي)
const getHijriShort = (gregorianDate) => {
    try {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
            day: 'numeric',
            month: 'short'
        }).format(gregorianDate);
    } catch (error) {
        return '';
    }
};

const EventDialog = ({ event, onSave, onOpenChange, isOpen }) => {
    const [formData, setFormData] = useState(event || {
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        type: 'مهمة'
    });

    useEffect(() => {
        setFormData(event || {
            title: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            description: '',
            type: 'مهمة'
        });
    }, [event]);

    const handleSave = () => {
        if (!formData.title || !formData.title.trim()) {
            alert('يرجى إدخال عنوان الحدث');
            return;
        }
        if (!formData.date) {
            alert('يرجى إدخال تاريخ الحدث');
            return;
        }

        onSave(formData);
        onOpenChange(false);
    };

    // عرض التاريخ المحدد بالهجري والميلادي
    const getSelectedDateDisplay = () => {
        if (!formData.date) return '';
        const date = new Date(formData.date);
        const hijri = toHijri(date);
        const gregorian = format(date, 'dd MMMM yyyy', { locale: ar });
        return `${hijri} - ${gregorian}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{event?.id ? 'تعديل الحدث' : 'إضافة حدث جديد'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">عنوان الحدث *</label>
                        <Input
                            placeholder="أدخل عنوان الحدث..."
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className={!formData.title ? 'border-red-300' : ''}
                        />
                        {!formData.title && <p className="text-xs text-red-500 mt-1">هذا الحقل مطلوب</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">تاريخ الحدث *</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-right font-normal">
                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                    {formData.date ? format(new Date(formData.date), 'PPP', { locale: ar }) : <span>اختر تاريخاً</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                               <SmartDualCalendar
                                    selected={formData.date ? new Date(formData.date) : undefined}
                                    onSelect={(date) => setFormData({...formData, date: date ? format(date, 'yyyy-MM-dd') : ''})}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {formData.date && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm text-blue-700 font-medium">
                                    📅 التاريخ المحدد: {getSelectedDateDisplay()}
                                </p>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">نوع الحدث</label>
                        <Select value={formData.type} onValueChange={type => setFormData({ ...formData, type })}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الحدث" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="اجتماع">اجتماع</SelectItem>
                                <SelectItem value="موعد نهائي">موعد نهائي</SelectItem>
                                <SelectItem value="مناسبة">مناسبة</SelectItem>
                                <SelectItem value="مهمة">مهمة</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">وصف الحدث (اختياري)</label>
                        <Textarea
                            placeholder="أدخل تفاصيل الحدث..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
                    <Button onClick={handleSave}>حفظ</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const EventItem = ({ event, onEdit, onDelete }) => {
    const typeColors = {
        'اجتماع': 'bg-blue-100 text-blue-800',
        'موعد نهائي': 'bg-red-100 text-red-800',
        'مناسبة': 'bg-green-100 text-green-800',
        'مهمة': 'bg-yellow-100 text-yellow-800',
    };

    // عرض التاريخ بالهجري والميلادي
    const getEventDateDisplay = () => {
        if (!event.date) return 'تاريخ غير محدد';
        try {
            const date = new Date(event.date);
            const hijri = toHijri(date);
            const gregorian = format(date, 'dd MMMM yyyy', { locale: ar });
            return `${hijri} - ${gregorian}`;
        } catch (error) {
            return 'تاريخ غير صحيح';
        }
    };

    return (
        <div className="p-3 rounded-lg border bg-white flex justify-between items-start mobile-card">
            <div className="flex-1">
                <p className="font-semibold text-lg mb-2">{event.title}</p>
                <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 font-medium">{getEventDateDisplay()}</span>
                </div>
                {event.description && <p className="text-sm text-gray-600 mt-2">{event.description}</p>}
                <div className="flex items-center gap-4 mt-3 text-xs">
                    <span className={`px-3 py-1 rounded-full font-medium ${typeColors[event.type]}`}>{event.type}</span>
                </div>
            </div>
            <div className="flex gap-1 ml-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(event)}>
                    <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(event.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            </div>
        </div>
    );
};

// Helper function to safely parse dates
const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
};

const safeFormatDate = (dateString, formatStr, options = {}) => {
    if (!isValidDate(dateString)) return 'تاريخ غير صالح';
    try {
        return format(new Date(dateString), formatStr, options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'تاريخ غير صالح';
    }
};

export default function AgendaPage() {
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await Event.list('-date');
            const validEvents = Array.isArray(data) ? data.filter(event => {
                if (!event || !event.date) return false;
                return isValidDate(event.date);
            }) : [];
            setEvents(validEvents);
        } catch (error) {
            console.error('Error loading events:', error);
            setError("فشل تحميل الأحداث. قد يكون هناك مشكلة في الشبكة.");
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleSave = async (eventData) => {
        try {
            if (!isValidDate(eventData.date)) {
                alert('تاريخ غير صالح. يرجى اختيار تاريخ صحيح.');
                return;
            }

            if (eventData.id) {
                await Event.update(eventData.id, eventData);
            } else {
                await Event.create(eventData);
            }
            loadEvents();
        } catch (error) {
            console.error('Error saving event:', error);
            alert('فشل في حفظ الحدث. يرجى المحاولة مرة أخرى.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await Event.delete(id);
            loadEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('فشل في حذف الحدث. يرجى المحاولة مرة أخرى.');
        }
    };

    const openDialog = (event = null) => {
        const defaultDate = selectedDate && isValidDate(selectedDate) ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
        setEditingEvent(event || {
            title: '',
            date: defaultDate,
            description: '',
            type: 'مهمة'
        });
        setIsDialogOpen(true);
    };

    // Safely filter events for selected date
    const eventsOnSelectedDate = events.filter(e => {
        if (!e || !e.date || !selectedDate) return false;
        if (!isValidDate(e.date) || !isValidDate(selectedDate)) return false;
        try {
            const eventDateStr = format(new Date(e.date), 'yyyy-MM-dd');
            const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
            return eventDateStr === selectedDateStr;
        } catch (error) {
            console.error('Error comparing dates:', error, e);
            return false;
        }
    });

    // Safely create event markers for calendar (Note: SmartDualCalendar component might need specific prop for this)
    const eventsMarkers = events.map(e => {
        if (!e || !e.date) return null;
        try {
            return isValidDate(e.date) ? new Date(e.date) : null;
        } catch (error) {
            console.error('Error creating date marker:', error, e);
            return null;
        }
    }).filter(Boolean);

    // عرض التاريخ المحدد بالهجري والميلادي
    const getSelectedDateDisplay = () => {
        if (!selectedDate) return 'تاريخ غير صالح';
        try {
            const hijri = toHijri(selectedDate);
            const gregorian = format(selectedDate, 'd MMMM yyyy', { locale: ar });
            return `${hijri} - ${gregorian}`;
        } catch (error) {
            return 'تاريخ غير صالح';
        }
    };

    return (
        <div className="p-2 md:p-6 bg-gray-50 min-h-screen">
            <EventDialog isOpen={isDialogOpen} event={editingEvent} onSave={handleSave} onOpenChange={setIsDialogOpen} />
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <CalendarIcon className="w-7 h-7 text-blue-600" />
                            التقويم وجدول الأعمال
                        </h1>
                        <p className="text-gray-600">تنظيم المواعيد والأحداث بالتاريخين الهجري والميلادي</p>
                    </div>
                    <Button onClick={() => openDialog()} className="mobile-button">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة حدث
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button onClick={loadEvents} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 ml-2" />
                            إعادة المحاولة
                        </Button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                📅 التقويم
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                           <SmartDualCalendar
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (date && !isNaN(date.getTime())) {
                                        setSelectedDate(date);
                                    }
                                }}
                            />
                            {selectedDate && (
                                <div className="mt-4 p-3 m-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm font-medium text-green-800 mb-1">التاريخ المحدد:</p>
                                    <div className="space-y-1">
                                        <p className="text-sm text-green-700">🌙 هجري: {toHijri(selectedDate)}</p>
                                        <p className="text-sm text-green-700">📅 ميلادي: {format(selectedDate, 'd MMMM yyyy', { locale: ar })}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 shadow-lg">
                        <CardHeader>
                            <CardTitle>أحداث يوم: {getSelectedDateDisplay()}</CardTitle>
                            <p className="text-sm text-gray-600">
                                {isLoading ? "جاري البحث عن أحداث..." : (eventsOnSelectedDate.length > 0
                                    ? `${eventsOnSelectedDate.length} حدث مجدول`
                                    : "لا توجد أحداث مجدولة")}
                            </p>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4 py-8">
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ) : eventsOnSelectedDate.length > 0 ? (
                                <div className="space-y-3">
                                    {eventsOnSelectedDate.map(event =>
                                        <EventItem key={event.id} event={event} onEdit={openDialog} onDelete={handleDelete} />
                                    )}
                                </div>
                            ) : (
                                !error && <div className="text-center py-12 text-gray-500">
                                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                    <p className="text-lg font-medium mb-2">لا توجد أحداث في هذا اليوم</p>
                                    <p className="text-sm">اضغط على "إضافة حدث" لإنشاء حدث جديد</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
