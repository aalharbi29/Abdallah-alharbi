import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function ComparisonChart({ specialties, statsA, statsB, labelA, labelB }) {
  const data = specialties.map((sp) => ({
    name: sp,
    [labelA]: statsA[sp] || 0,
    [labelB]: statsB[sp] || 0,
  }));

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-l from-slate-50 to-white border-b py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-600" /> الرسم البياني للمقارنة
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div style={{ width: '100%', height: 360 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey={labelA} fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey={labelB} fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}