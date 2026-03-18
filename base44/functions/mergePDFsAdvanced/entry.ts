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
        const { files } = body;

        if (!files || !Array.isArray(files) || files.length < 2) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير ملفين على الأقل للدمج' 
            }, { status: 400 });
        }

        console.log(`📥 طلب دمج متقدم لـ ${files.length} ملفات`);

        const mergedPdf = await PDFDocument.create();
        let totalPagesMerged = 0;

        for (let i = 0; i < files.length; i++) {
            const fileData = files[i];
            const { fileUrl, selectedPages } = fileData;

            console.log(`📄 معالجة الملف ${i + 1}/${files.length}`);

            try {
                const response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error(`فشل تحميل الملف: ${response.statusText}`);
                }

                const pdfBytes = await response.arrayBuffer();
                const pdf = await PDFDocument.load(pdfBytes);
                const totalPages = pdf.getPageCount();

                let pageIndices;
                if (selectedPages && selectedPages.length > 0) {
                    // دمج صفحات محددة فقط
                    pageIndices = selectedPages.map(p => p - 1);
                    console.log(`  ✓ اختيار ${selectedPages.length} صفحة من ${totalPages}`);
                } else {
                    // دمج جميع الصفحات
                    pageIndices = pdf.getPageIndices();
                    console.log(`  ✓ دمج جميع الـ ${totalPages} صفحة`);
                }

                const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
                copiedPages.forEach(page => mergedPdf.addPage(page));
                
                totalPagesMerged += pageIndices.length;
            } catch (fileError) {
                console.error(`❌ خطأ في الملف ${i + 1}:`, fileError);
                throw new Error(`فشل معالجة الملف ${i + 1}: ${fileError.message}`);
            }
        }

        const mergedPdfBytes = await mergedPdf.save();
        
        // تحويل إلى Base64
        const uint8Array = new Uint8Array(mergedPdfBytes);
        const chunks = [];
        const chunkSize = 0x8000;
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
            chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        const base64 = btoa(chunks.join(''));

        console.log(`✅ تم الدمج بنجاح! إجمالي ${totalPagesMerged} صفحة`);

        return Response.json({
            success: true,
            pdfBase64: base64,
            fileSize: mergedPdfBytes.length,
            totalPages: totalPagesMerged,
            message: `تم دمج ${files.length} ملفات (${totalPagesMerged} صفحة) بنجاح`
        });

    } catch (error) {
        console.error('❌ خطأ في الدمج:', error);
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء الدمج' 
        }, { status: 500 });
    }
});