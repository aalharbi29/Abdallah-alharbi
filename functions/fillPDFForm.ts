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
        const { fileUrl, fieldValues } = body;

        if (!fileUrl || !fieldValues) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير رابط الملف والبيانات' 
            }, { status: 400 });
        }

        console.log('📥 تحميل ملف PDF من:', fileUrl);

        const pdfResponse = await fetch(fileUrl);
        if (!pdfResponse.ok) {
            throw new Error(`فشل تحميل الملف: ${pdfResponse.status}`);
        }

        const pdfBytes = await pdfResponse.arrayBuffer();
        
        let pdfDoc;
        try {
            pdfDoc = await PDFDocument.load(pdfBytes);
        } catch (e) {
            throw new Error(`فشل فتح ملف PDF: ${e.message}`);
        }
        
        let form;
        try {
            form = pdfDoc.getForm();
        } catch (e) {
            throw new Error('الملف لا يحتوي على نموذج قابل للتعبئة');
        }

        let filledCount = 0;

        // تعبئة الحقول
        for (const [fieldId, value] of Object.entries(fieldValues)) {
            try {
                const field = form.getField(fieldId);
                const fieldType = field.constructor.name;

                if (fieldType.includes('TextField')) {
                    if (value !== null && value !== undefined) {
                        // تحويل القيمة إلى نص لتجنب الأخطاء
                        field.setText(String(value));
                        filledCount++;
                    }
                } else if (fieldType.includes('CheckBox')) {
                    if (value === true) {
                        field.check();
                        filledCount++;
                    } else {
                        field.uncheck();
                    }
                } else if (fieldType.includes('RadioGroup')) {
                    if (value) {
                        field.select(String(value));
                        filledCount++;
                    }
                } else if (fieldType.includes('Dropdown')) {
                    if (value) {
                        field.select(String(value));
                        filledCount++;
                    }
                }
            } catch (fieldError) {
                console.warn(`تحذير: فشل تعبئة الحقل ${fieldId}:`, fieldError.message);
            }
        }

        // ملاحظة: تم إزالة form.flatten() لأنه يسبب استهلاك عالي للذاكرة وأخطاء 500 في بعض البيئات
        // إذا كنت بحاجة إلى تسطيح النموذج، يمكن استخدام خدمة خارجية أو مكتبة أخرى

        // حفظ الملف
        const filledPdfBytes = await pdfDoc.save();
        
        // تحويل إلى Base64 بطريقة آمنة للذاكرة (Chunking)
        // هذا يتجنب خطأ "RangeError: Maximum call stack size exceeded" للملفات الكبيرة
        const chunks = [];
        const chunkSize = 32768; // 32KB chunks
        const uint8Array = new Uint8Array(filledPdfBytes);
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
            chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        const base64 = btoa(chunks.join(''));

        console.log(`✅ تم تعبئة ${filledCount} حقل`);

        return Response.json({
            success: true,
            pdfBase64: base64,
            filledFields: filledCount,
            message: `تم تعبئة ${filledCount} حقل بنجاح`
        });

    } catch (error) {
        console.error('❌ خطأ في تعبئة النموذج:', error);
        
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء تعبئة النموذج',
            details: error.stack
        }, { status: 500 });
    }
});