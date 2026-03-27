import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Trash2, CheckCircle, XCircle, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function MobileAssignmentCard({ assignment, isArchive, isDraft, isSelected, onToggleSelection, onExportPDF, onStatusUpdate, onDelete, isLoading, isArchiving, statusBadge }) {
  return (
    <Card className={`md:hidden border-0 shadow-sm rounded-2xl overflow-hidden ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-white'}`}>
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1" onClick={() => onToggleSelection(assignment.id)}>
            <div className="flex items-center gap-2 mb-1">
              {assignment.assignment_template_type === 'multiple' && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 p-1">
                  <Layers className="w-3 h-3" />
                </Badge>
              )}
              <h3 className="font-bold text-sm text-gray-900 truncate">{assignment.employee_name || '-'}</h3>
            </div>
            <p className="text-xs text-gray-600 truncate">من {assignment.from_health_center || '-'} إلى {assignment.assigned_to_health_center || '-'}</p>
          </div>
          <div className="shrink-0">{statusBadge}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded-xl p-2">
            <div className="text-gray-500 mb-1">بداية</div>
            <div className="font-semibold text-gray-800">{assignment.start_date ? format(new Date(assignment.start_date), 'yyyy/MM/dd') : '-'}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2">
            <div className="text-gray-500 mb-1">نهاية</div>
            <div className="font-semibold text-gray-800">{assignment.end_date ? format(new Date(assignment.end_date), 'yyyy/MM/dd') : '-'}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <Badge variant="secondary">{assignment.duration_days || '-'} يوم</Badge>
          {isDraft && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">انتظار اعتماد</Badge>}
          {isArchive && assignment.completion_date && <span className="text-gray-500">الإنهاء: {format(new Date(assignment.completion_date), 'yyyy/MM/dd')}</span>}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Link to={createPageUrl(`ViewAssignment?id=${assignment.id}`)}>
            <Button variant="outline" size="sm" className="w-full h-9 rounded-xl"><Eye className="w-4 h-4" /></Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => onExportPDF(assignment)} className="h-9 rounded-xl bg-red-50" disabled={isLoading}><FileText className="w-4 h-4" /></Button>
          {!isArchive ? (
            <>
              <Button variant="outline" size="sm" onClick={() => onStatusUpdate(assignment.id, 'completed')} className="h-9 rounded-xl text-green-600" disabled={isArchiving}><CheckCircle className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(assignment.id)} className="h-9 rounded-xl text-red-600"><Trash2 className="w-4 h-4" /></Button>
            </>
          ) : (
            <Button variant="destructive" size="sm" onClick={() => onDelete(assignment.id)} className="col-span-2 h-9 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
          )}
        </div>

        {!isArchive && (
          <Button variant="ghost" size="sm" onClick={() => onStatusUpdate(assignment.id, 'cancelled')} className="w-full h-9 rounded-xl text-red-600 border border-red-100">
            <XCircle className="w-4 h-4 ml-1" />إلغاء التكليف
          </Button>
        )}
      </CardContent>
    </Card>
  );
}