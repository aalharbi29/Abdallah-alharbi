
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
        const { fileUrls } = body;

        console.log('📥 طلب دمج جديد:', fileUrls);

        if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length < 2) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير ملفين PDF على الأقل للدمج' 
            }, { status: 400 });
        }

        console.log(`🔄 بدء دمج ${fileUrls.length} ملفات PDF...`);

        // إنشاء مستند PDF جديد
        const mergedPdf = await PDFDocument.create();

        // تحميل ودمج كل ملف PDF
        for (let i = 0; i < fileUrls.length; i++) {
            const url = fileUrls[i];
            console.log(`📥 تحميل الملف ${i + 1}/${fileUrls.length}: ${url}`);

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`فشل تحميل الملف: ${response.status} ${response.statusText}`);
                }

                const pdfBytes = await response.arrayBuffer();
                console.log(`📦 تم تحميل ${pdfBytes.byteLength} بايت`);

                const pdf = await PDFDocument.load(pdfBytes);
                const pageCount = pdf.getPageCount();
                
                console.log(`📄 الملف ${i + 1} يحتوي على ${pageCount} صفحة`);

                // نسخ جميع الصفحات
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });

                console.log(`✅ تم دمج الملف ${i + 1}`);
            } catch (error) {
                console.error(`❌ خطأ في الملف ${i + 1}:`, error);
                throw new Error(`فشل معالجة الملف ${i + 1}: ${error.message}`);
            }
        }

        // حفظ ملف PDF المدمج
        console.log('💾 حفظ ملف PDF المدمج...');
        const mergedPdfBytes = await mergedPdf.save();

        // تحويل إلى Base64 بطريقة محسنة
        const uint8Array = new Uint8Array(mergedPdfBytes);
        const chunks = [];
        const chunkSize = 0x8000; // 32KB chunks
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
            // Using Array.from for older environments where apply doesn't like Uint8Array directly
            chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        const binaryString = chunks.join('');
        const base64 = btoa(binaryString);

        console.log(`✅ تم الدمج بنجاح! الحجم: ${(mergedPdfBytes.length / 1024).toFixed(2)} KB`);

        return Response.json({
            success: true,
            pdfBase64: base64,
            fileSize: mergedPdfBytes.length,
            totalPages: mergedPdf.getPageCount(),
            message: `تم دمج ${fileUrls.length} ملفات بنجاح`
        });

    } catch (error) {
        console.error('❌ خطأ في دمج PDF:', error);
        console.error('Stack trace:', error.stack);
        
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء دمج الملفات',
            details: error.stack
        }, { status: 500 });
    }
});
