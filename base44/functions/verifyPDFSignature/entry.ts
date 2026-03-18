import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
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

        console.log('🔍 طلب التحقق من توقيعات PDF:', fileUrl);

        if (!fileUrl) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير رابط ملف PDF' 
            }, { status: 400 });
        }

        // تحميل ملف PDF
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`فشل تحميل الملف: ${response.status}`);
        }

        const pdfBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        const totalPages = pdfDoc.getPageCount();
        const catalog = pdfDoc.catalog;

        console.log(`📄 الملف يحتوي على ${totalPages} صفحة`);

        // التحقق من وجود حقول التوقيع في PDF
        // ملاحظة: pdf-lib لا يدعم التحقق الكامل من التوقيعات الرقمية المشفرة
        // لكن يمكننا فحص وجود حقول AcroForm والصور
        
        const pages = pdfDoc.getPages();
        const detectedSignatures = [];

        // فحص كل صفحة للبحث عن صور (قد تكون توقيعات)
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();
            
            // في هذا التطبيق، نحن نضيف التوقيعات كصور
            // يمكننا عد الصور في كل صفحة كمؤشر على وجود توقيعات
            detectedSignatures.push({
                pageNumber: i + 1,
                pageSize: { width, height },
                note: 'تم فحص الصفحة'
            });
        }

        // معلومات عامة عن الملف
        const metadata = {
            title: pdfDoc.getTitle() || 'غير محدد',
            author: pdfDoc.getAuthor() || 'غير محدد',
            creator: pdfDoc.getCreator() || 'غير محدد',
            producer: pdfDoc.getProducer() || 'غير محدد',
            creationDate: pdfDoc.getCreationDate() || null,
            modificationDate: pdfDoc.getModificationDate() || null
        };

        console.log('✅ تم فحص الملف');

        // تحذير: هذا فحص أساسي فقط
        const hasModifications = metadata.modificationDate && 
                                metadata.creationDate && 
                                metadata.modificationDate > metadata.creationDate;

        return Response.json({
            success: true,
            fileInfo: {
                totalPages: totalPages,
                metadata: metadata,
                hasModifications: hasModifications
            },
            verification: {
                method: 'basic_inspection',
                note: 'هذا فحص أساسي للملف. التحقق الكامل من التوقيعات الرقمية المشفرة يتطلب أدوات متخصصة.',
                pagesInspected: detectedSignatures.length,
                recommendations: [
                    'للتحقق الكامل من التوقيعات المشفرة، استخدم Adobe Acrobat Reader',
                    'تأكد من أن التوقيع يطابق الشخص المتوقع',
                    'تحقق من تاريخ التوقيع وصلاحيته'
                ]
            },
            pages: detectedSignatures
        });

    } catch (error) {
        console.error('❌ خطأ في التحقق من التوقيعات:', error);
        console.error('Stack:', error.stack);
        
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء التحقق من توقيعات PDF',
            details: error.stack
        }, { status: 500 });
    }
});