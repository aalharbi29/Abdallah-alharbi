import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllEmployeeRoles } from '@/components/utils/employeeRoles';
import { Button } from '@/components/ui/button';

export default function EmployeeRoleBadges({ 
  employee, 
  healthCenters = [], 
  showCenterName = false,
  maxVisible = 2, // عدد الأدوار المرئية بشكل افتراضي
  compact = false // وضع مضغوط للقائمة الرئيسية
}) {
  const [expanded, setExpanded] = useState(false);

  // استخدام useMemo لتحسين الأداء
  const allRoles = useMemo(() => {
    if (!employee || !Array.isArray(healthCenters)) return [];
    return getAllEmployeeRoles(employee, healthCenters);
  }, [employee, healthCenters]);

  if (allRoles.length === 0) {
    return null;
  }

  // في الوضع المضغوط، عرض فقط الأدوار القيادية (مدير، نائب، مشرف فني)
  const displayRoles = compact ? 
    allRoles.filter(role => ['manager', 'deputy', 'supervisor'].includes(role.roleType)) :
    allRoles;

  // تحديد الأدوار المرئية
  const visibleRoles = expanded ? displayRoles : displayRoles.slice(0, maxVisible);
  const hiddenCount = displayRoles.length - visibleRoles.length;

  // إذا كان الوضع مضغوط وعدد الأدوار أكثر من الحد، عرض عداد فقط
  if (compact && displayRoles.length > maxVisible && !expanded) {
    return (
      <div className="flex items-center gap-1">
        {visibleRoles.map((roleObj, index) => {
          const isAutoRole = roleObj.source === 'auto';
          const isManagerRole = roleObj.roleType === 'manager';
          
          return (
            <Badge
              key={index}
              className={`text-xs ${
                isManagerRole
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : roleObj.roleType === 'deputy'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : roleObj.roleType === 'supervisor'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-gray-100 text-gray-800 border-gray-300'
              }`}
              variant="outline"
            >
              {isAutoRole ? <Building2 className="w-3 h-3 ml-1" /> : <Shield className="w-3 h-3 ml-1" />}
              {roleObj.role}
            </Badge>
          );
        })}
        
        {hiddenCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            className="h-6 px-2 text-xs text-gray-600 hover:text-gray-900"
          >
            +{hiddenCount}
            <ChevronDown className="w-3 h-3 mr-1" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        {visibleRoles.map((roleObj, index) => {
          const isAutoRole = roleObj.source === 'auto';
          const isManagerRole = roleObj.roleType === 'manager';
          
          return (
            <Badge
              key={index}
              className={`text-xs ${
                isManagerRole
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : roleObj.roleType === 'deputy'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : roleObj.roleType === 'supervisor'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-gray-100 text-gray-800 border-gray-300'
              }`}
              variant="outline"
            >
              {isAutoRole ? <Building2 className="w-3 h-3 ml-1" /> : <Shield className="w-3 h-3 ml-1" />}
              {roleObj.role}
              {showCenterName && roleObj.centerName && (
                <span className="mr-1 opacity-75 text-[10px]">({roleObj.centerName})</span>
              )}
            </Badge>
          );
        })}
      </div>
      
      {hiddenCount > 0 && !compact && !expanded && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setExpanded(true)}
          className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
        >
          عرض {hiddenCount} أدوار أخرى
          <ChevronDown className="w-3 h-3 mr-1" />
        </Button>
      )}
      
      {expanded && displayRoles.length > maxVisible && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setExpanded(false)}
          className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
        >
          إخفاء
          <ChevronUp className="w-3 h-3 mr-1" />
        </Button>
      )}
    </div>
  );
}