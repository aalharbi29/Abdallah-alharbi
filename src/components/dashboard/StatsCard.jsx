import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function StatsCard(props) {
  // حماية من destructuring على undefined
  const { title = '', value = 0, icon: Icon = null, color = 'blue', isMobile = false } = props || {};
  
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600', 
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  };

  const bgGradient = colorClasses[color] || colorClasses.blue;

  return (
    <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 ${isMobile ? 'mobile-stats-card' : ''}`}>
      <CardContent className={`p-3 md:p-4 ${isMobile ? 'mobile-stats-card' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs md:text-sm text-gray-600 font-medium ${isMobile ? 'mobile-stats-title' : ''}`}>
              {title}
            </p>
            <p className={`text-lg md:text-2xl font-bold text-gray-900 mt-1 ${isMobile ? 'mobile-stats-value' : ''}`}>
              {typeof value === 'number' ? value.toLocaleString('ar-SA') : value || 0}
            </p>
          </div>
          {Icon && (
            <div className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br ${bgGradient} rounded-lg flex items-center justify-center shadow-lg`}>
              <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}