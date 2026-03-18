import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ success: false, error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { fileUrl } = body;

        if (!fileUrl) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير رابط الملف' 
            }, { status: 400 });
        }

        console.log('📥 تحميل ملف PDF من:', fileUrl);

        const pdfResponse = await fetch(fileUrl);
        if (!pdfResponse.ok) {
            throw new Error(`فشل تحميل الملف: ${pdfResponse.status}`);
        }

        const pdfBytes = await pdfResponse.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        
        console.log(`📋 تم اكتشاف ${fields.length} حقل في النموذج`);

        const detectedFields = fields.map((field, index) => {
            const fieldName = field.getName();
            const fieldType = field.constructor.name;
            
            let type = 'text';
            let options = null;
            
            if (fieldType.includes('TextField')) {
                type = 'text';
            } else if (fieldType.includes('CheckBox')) {
                type = 'checkbox';
            } else if (fieldType.includes('RadioGroup')) {
                type = 'radio';
                try {
                    options = field.getOptions();
                } catch (e) {
                    options = [];
                }
            } else if (fieldType.includes('Dropdown')) {
                type = 'select';
                try {
                    options = field.getOptions();
                } catch (e) {
                    options = [];
                }
            } else if (fieldType.includes('Button')) {
                type = 'button';
            }

            // تحديد القسم بناءً على الاسم
            let section = 'other';
            const nameLower = fieldName.toLowerCase();
            if (nameLower.includes('name') || nameLower.includes('اسم') || nameLower.includes('id') || nameLower.includes('هوية')) {
                section = 'personal';
            } else if (nameLower.includes('phone') || nameLower.includes('email') || nameLower.includes('هاتف') || nameLower.includes('بريد')) {
                section = 'contact';
            } else if (nameLower.includes('job') || nameLower.includes('work') || nameLower.includes('وظيفة') || nameLower.includes('عمل')) {
                section = 'work';
            } else if (nameLower.includes('agree') || nameLower.includes('موافقة') || nameLower.includes('terms')) {
                section = 'agreements';
            } else if (nameLower.includes('sign') || nameLower.includes('توقيع')) {
                section = 'signatures';
            }

            return {
                id: fieldName,
                label: fieldName,
                type: type,
                section: section,
                required: false,
                options: options,
                page: 1
            };
        });

        return Response.json({
            success: true,
            fields: detectedFields,
            totalFields: detectedFields.length,
            message: `تم اكتشاف ${detectedFields.length} حقل`
        });

    } catch (error) {
        console.error('❌ خطأ في اكتشاف حقول النموذج:', error);
        
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء اكتشاف الحقول',
            details: error.stack
        }, { status: 500 });
    }
});