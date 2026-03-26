import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddMapPointForm({ center, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    category: 'government',
    description: '',
    latitude: center?.['خط_العرض'] || '',
    longitude: center?.['خط_الطول'] || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await base44.entities.CenterMapPoint.create({
      health_center_id: center.id,
      health_center_name: center['اسم_المركز'],
      title: form.title,
      category: form.category,
      description: form.description,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    });
    setForm({ ...form, title: '', description: '' });
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4">
      <div className="font-semibold">إضافة نقطة جديدة</div>
      <Input placeholder="اسم النقطة" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
        <SelectTrigger><SelectValue placeholder="التصنيف" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="government">جهة حكومية</SelectItem>
          <SelectItem value="shop">منشأة تجارية</SelectItem>
          <SelectItem value="other">نقطة أخرى</SelectItem>
        </SelectContent>
      </Select>
      <Textarea placeholder="وصف مختصر" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="خط العرض" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
        <Input placeholder="خط الطول" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
      </div>
      <Button type="submit" className="w-full">حفظ النقطة</Button>
    </form>
  );
}