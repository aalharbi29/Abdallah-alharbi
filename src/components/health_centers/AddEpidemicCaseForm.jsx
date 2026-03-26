import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddEpidemicCaseForm({ center, onCreated, selectedLocation }) {
  const [form, setForm] = useState({
    case_title: '',
    disease_name: '',
    status: 'suspected',
    report_date: '',
    notes: '',
    latitude: center?.['خط_العرض'] || '',
    longitude: center?.['خط_الطول'] || '',
  });

  useEffect(() => {
    if (selectedLocation) {
      setForm((prev) => ({
        ...prev,
        latitude: String(selectedLocation.latitude),
        longitude: String(selectedLocation.longitude),
      }));
    }
  }, [selectedLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await base44.entities.EpidemicCasePoint.create({
      health_center_id: center.id,
      health_center_name: center['اسم_المركز'],
      case_title: form.case_title,
      disease_name: form.disease_name,
      status: form.status,
      report_date: form.report_date,
      notes: form.notes,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    });
    setForm({ ...form, case_title: '', disease_name: '', report_date: '', notes: '' });
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4">
      <div className="font-semibold">إضافة تفشٍ أو بؤرة</div>
      <Input placeholder="عنوان الحالة" value={form.case_title} onChange={(e) => setForm({ ...form, case_title: e.target.value })} />
      <Input placeholder="اسم المرض" value={form.disease_name} onChange={(e) => setForm({ ...form, disease_name: e.target.value })} />
      <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
        <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="suspected">مشتبه</SelectItem>
          <SelectItem value="confirmed">مؤكد</SelectItem>
          <SelectItem value="resolved">منتهي</SelectItem>
        </SelectContent>
      </Select>
      <Input type="date" value={form.report_date} onChange={(e) => setForm({ ...form, report_date: e.target.value })} />
      <Textarea placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="خط العرض" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
        <Input placeholder="خط الطول" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
      </div>
      <Button type="submit" className="w-full">حفظ التفشي</Button>
    </form>
  );
}