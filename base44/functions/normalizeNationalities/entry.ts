import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // التحقق من صلاحيات المستخدم
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // جلب جميع الموظفين
    const employees = await base44.asServiceRole.entities.Employee.list();
    
    const nationalityMap = {
      // السعودية
      'سعودي': 'السعودية',
      'سعودية': 'السعودية',
      'سعوديه': 'السعودية',
      // مصر
      'مصري': 'مصر',
      'مصرية': 'مصر',
      'مصريه': 'مصر',
      // السودان
      'سوداني': 'السودان',
      'سودانية': 'السودان',
      'سودانيه': 'السودان',
      // الهند
      'هندي': 'الهند',
      'هندية': 'الهند',
      'هنديه': 'الهند',
      // الفلبين
      'فلبيني': 'الفلبين',
      'فلبينية': 'الفلبين',
      'فلبينيه': 'الفلبين',
    };

    let updatedCount = 0;
    const updates = [];

    for (const emp of employees) {
      if (emp.nationality && nationalityMap[emp.nationality]) {
        updates.push({
          id: emp.id,
          old: emp.nationality,
          new: nationalityMap[emp.nationality]
        });
        await base44.asServiceRole.entities.Employee.update(emp.id, {
          nationality: nationalityMap[emp.nationality]
        });
        updatedCount++;
      }
    }

    return Response.json({ 
      success: true, 
      updatedCount,
      updates 
    });

  } catch (error) {
    console.error('Error normalizing nationalities:', error);
    return Response.json({ 
      error: error.message || 'حدث خطأ أثناء تحديث الجنسيات' 
    }, { status: 500 });
  }
});