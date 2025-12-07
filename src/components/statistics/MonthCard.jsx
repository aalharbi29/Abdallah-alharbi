import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, Calendar, FileText, FolderOpen, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EditDocumentTitleDialog from '@/components/files/EditDocumentTitleDialog';
import { Statistic } from '@/entities/Statistic';

export default function MonthCard({
  month,
  statistics,
  onViewDetails,
  periodType,
  onRefresh
}) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);

  if (!month) {
    return null;
  }

  const hasFiles = statistics && Array.isArray(statistics) && statistics.length > 0;
  const fileCount = hasFiles ? statistics.length : 0;
  const firstFile = hasFiles ? statistics[0] : null;
  const monthLabel = month.label || month.name || 'شهر';

  return (
    <>
      <Card
        className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
          hasFiles ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''
        }`}
        onClick={() => onViewDetails(month)}
        title={hasFiles && firstFile ? `${fileCount} ملف - انقر للعرض` : monthLabel}
      >
        <CardHeader className="flex flex-row items-center justify-between space-x-4 p-4 pb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all ${
              hasFiles
                ? 'bg-gradient-to-br from-green-500 to-green-600'
                : 'bg-gradient-to-br from-gray-300 to-gray-400'
            }`}>
              {hasFiles ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <Calendar className="w-5 h-5 text-white" />
              )}
            </div>
            <h3 className="font-bold text-lg text-gray-800" title={monthLabel}>
              {monthLabel}
            </h3>
          </div>
          {hasFiles ? (
            <Badge className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
              <FileText className="w-3 h-3 ml-1" />
              {fileCount} {fileCount === 1 ? 'ملف' : 'ملفات'}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-gray-300 text-gray-500">
              <FolderOpen className="w-3 h-3 ml-1" />
              لا توجد ملفات
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="space-y-2">
            {hasFiles ? (
                statistics.slice(0, 3).map((stat) => (
                  <div
                    key={stat.id}
                    className="flex items-center gap-2 text-sm p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors relative group/stat"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="flex-1 truncate text-gray-700">{stat.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStat(stat);
                        setShowEditDialog(true);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover/stat:opacity-100 transition-opacity"
                      title="تعديل العنوان"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                ))
            ) : null}

            {fileCount > 3 && (
              <p className="text-center text-sm text-gray-500 pt-2 cursor-pointer hover:text-blue-600"
                 onClick={(e) => { e.stopPropagation(); onViewDetails(month); }}>
                +{fileCount - 3} المزيد من المستندات...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedStat && (
        <EditDocumentTitleDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          document={selectedStat}
          entitySDK={Statistic}
          onSuccess={() => {
            setShowEditDialog(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}