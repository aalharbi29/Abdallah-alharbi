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
        const { 
            fileUrl, 
            signatureImageUrl, 
            x = 50, 
            y = 750, 
            width = 150, 
            height = 75,
            pageNumber = 1
        } = body;

        console.log('📥 طلب إضافة توقيع إلى PDF:', { fileUrl, signatureImageUrl, x, y, width, height, pageNumber });

        if (!fileUrl || !signatureImageUrl) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير رابط ملف PDF ورابط صورة التوقيع' 
            }, { status: 400 });
        }

        // تحميل ملف PDF
        const pdfResponse = await fetch(fileUrl);
        if (!pdfResponse.ok) {
            throw new Error(`فشل تحميل الملف: ${pdfResponse.status}`);
        }

        const pdfBytes = await pdfResponse.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();

        console.log(`📄 الملف يحتوي على ${totalPages} صفحة`);

        // التحقق من رقم الصفحة
        const targetPage = Math.max(1, Math.min(pageNumber, totalPages));
        console.log(`📍 سيتم إضافة التوقيع إلى الصفحة ${targetPage}`);

        // تحميل صورة التوقيع
        const signatureResponse = await fetch(signatureImageUrl);
        if (!signatureResponse.ok) {
            throw new Error(`فشل تحميل صورة التوقيع: ${signatureResponse.status}`);
        }

        const signatureBytes = await signatureResponse.arrayBuffer();
        
        // تحديد نوع الصورة وتضمينها
        let signatureImage;
        const contentType = signatureResponse.headers.get('content-type');
        
        try {
            if (contentType?.includes('png')) {
                signatureImage = await pdfDoc.embedPng(signatureBytes);
            } else if (contentType?.includes('jpeg') || contentType?.includes('jpg')) {
                signatureImage = await pdfDoc.embedJpg(signatureBytes);
            } else {
                // محاولة PNG أولاً (يدعم الشفافية)
                try {
                    signatureImage = await pdfDoc.embedPng(signatureBytes);
                } catch {
                    signatureImage = await pdfDoc.embedJpg(signatureBytes);
                }
            }
        } catch (embedError) {
            console.error('❌ خطأ في تضمين الصورة:', embedError);
            throw new Error('فشل في تضمين صورة التوقيع. تأكد من أن الصورة بصيغة PNG أو JPG');
        }

        console.log('✅ تم تحميل صورة التوقيع بنجاح');

        // الحصول على الصفحة المستهدفة
        const page = pdfDoc.getPages()[targetPage - 1];
        const { height: pageHeight } = page.getSize();

        // تحويل إحداثيات Y من نظام الإحداثيات العلوي إلى السفلي
        // في المعاينة: Y=0 في الأعلى
        // في PDF: Y=0 في الأسفل
        const pdfY = pageHeight - y - height;

        console.log(`📐 أبعاد الصفحة: ارتفاع=${pageHeight}`);
        console.log(`📍 الموضع المطلوب (من الأعلى): Y=${y}`);
        console.log(`📍 الموضع المحول (من الأسفل): Y=${pdfY}`);
        console.log(`📏 أبعاد التوقيع: عرض=${width}, ارتفاع=${height}`);

        // إضافة التوقيع إلى الصفحة
        page.drawImage(signatureImage, {
            x: x,
            y: pdfY,
            width: width,
            height: height,
            opacity: 1.0
        });

        console.log(`✅ تم إضافة التوقيع عند الموضع (${x}, ${pdfY})`);

        // حفظ PDF المعدل
        const modifiedPdfBytes = await pdfDoc.save();

        // تحويل إلى Base64
        const uint8Array = new Uint8Array(modifiedPdfBytes);
        const chunkSize = 0x8000;
        const chunks = [];

        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
            chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
        }

        const base64 = btoa(chunks.join(''));

        console.log('✅ تم إضافة التوقيع بنجاح');

        return Response.json({
            success: true,
            pdfBase64: base64,
            message: `تم إضافة التوقيع بنجاح إلى الصفحة ${targetPage}`,
            pageNumber: targetPage,
            totalPages: totalPages,
            position: { x, y: pdfY },
            size: { width, height }
        });

    } catch (error) {
        console.error('❌ خطأ في إضافة التوقيع:', error);
        console.error('Stack:', error.stack);
        
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء إضافة التوقيع إلى PDF',
            details: error.stack
        }, { status: 500 });
    }
});