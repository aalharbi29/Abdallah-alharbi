import React from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmployeeForm from '@/components/employees/EmployeeForm';
import QuickLeaveForm from '@/components/leaves/QuickLeaveForm';
import QuickAssignmentForm from '@/components/assignments/QuickAssignmentForm';
import HolidayAssignmentForm from '@/components/assignments/HolidayAssignmentForm';
import BulkHolidayAssignmentDialog from '@/components/assignments/BulkHolidayAssignmentDialog';
import BulkWhatsAppDialog from '@/components/employees/BulkWhatsAppDialog';

export default function HumanResourcesDialogs({
  showEmployeeForm,
  setShowEmployeeForm,
  editingEmployee,
  setEditingEmployee,
  handleUpdateEmployee,
  handleCreateEmployee,
  healthCenters,
  showLeaveForm,
  setShowLeaveForm,
  selectedEmployee,
  setSelectedEmployee,
  loadData,
  showAssignmentForm,
  setShowAssignmentForm,
  showHolidayForm,
  setShowHolidayForm,
  showBulkAssignmentDialog,
  setShowBulkAssignmentDialog,
  selectedEmployees,
  employees,
  showBulkWhatsAppDialog,
  setShowBulkWhatsAppDialog,
}) {
  return (
    <>
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
            onCancel={() => {
              setShowEmployeeForm(false);
              setEditingEmployee(null);
            }}
            healthCenters={healthCenters}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة إجازة</DialogTitle>
          </DialogHeader>
          <QuickLeaveForm
            employee={selectedEmployee}
            onSubmit={async (leaveData) => {
              await base44.entities.Leave.create(leaveData);
              setShowLeaveForm(false);
              setSelectedEmployee(null);
              loadData();
            }}
            onCancel={() => {
              setShowLeaveForm(false);
              setSelectedEmployee(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignmentForm} onOpenChange={setShowAssignmentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة تكليف</DialogTitle>
          </DialogHeader>
          <QuickAssignmentForm
            employee={selectedEmployee}
            onSubmit={async (assignmentData) => {
              await base44.entities.Assignment.create(assignmentData);
              setShowAssignmentForm(false);
              setSelectedEmployee(null);
              loadData();
            }}
            onCancel={() => {
              setShowAssignmentForm(false);
              setSelectedEmployee(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showHolidayForm} onOpenChange={setShowHolidayForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تكليف العمل خلال إجازة</DialogTitle>
          </DialogHeader>
          <HolidayAssignmentForm
            employee={selectedEmployee}
            healthCenters={healthCenters}
            onClose={() => {
              setShowHolidayForm(false);
              setSelectedEmployee(null);
              loadData();
            }}
          />
        </DialogContent>
      </Dialog>

      <BulkHolidayAssignmentDialog
        open={showBulkAssignmentDialog}
        onOpenChange={setShowBulkAssignmentDialog}
        selectedEmployeeIds={Array.from(selectedEmployees)}
        employees={employees}
        healthCenters={healthCenters}
        onComplete={() => {
          setShowBulkAssignmentDialog(false);
          loadData();
        }}
      />

      <BulkWhatsAppDialog
        open={showBulkWhatsAppDialog}
        onOpenChange={setShowBulkWhatsAppDialog}
        selectedEmployees={Array.from(selectedEmployees)}
        employees={employees}
      />
    </>
  );
}