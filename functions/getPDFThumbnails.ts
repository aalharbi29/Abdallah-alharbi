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
        const totalPages = pdfDoc.getPageCount();

        console.log(`📄 الملف يحتوي على ${totalPages} صفحة`);

        // Get first page dimensions
        const firstPage = pdfDoc.getPages()[0];
        const { width: pageWidth, height: pageHeight } = firstPage.getSize();

        const maxPagesToProcess = 50;
        const pagesToProcess = Math.min(totalPages, maxPagesToProcess);

        const thumbnails = [];

        for (let i = 0; i < pagesToProcess; i++) {
            try {
                const pageDoc = await PDFDocument.create();
                const [copiedPage] = await pageDoc.copyPages(pdfDoc, [i]);
                pageDoc.addPage(copiedPage);

                const pdfDataBytes = await pageDoc.save();
                
                // Convert to Base64 in chunks to avoid stack overflow
                const uint8Array = new Uint8Array(pdfDataBytes);
                const chunkSize = 0x8000; // 32KB chunks
                const chunks = [];
                
                for (let j = 0; j < uint8Array.length; j += chunkSize) {
                    const chunk = uint8Array.subarray(j, Math.min(j + chunkSize, uint8Array.length));
                    chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
                }
                
                const binaryString = chunks.join('');
                const base64 = btoa(binaryString);
                const pdfDataUrl = `data:application/pdf;base64,${base64}`;

                thumbnails.push({
                    pageNumber: i + 1,
                    pdfDataUrl: pdfDataUrl
                });
                
                console.log(`✅ تمت معالجة الصفحة ${i + 1} من ${pagesToProcess}`);
            } catch (pageError) {
                console.error(`❌ خطأ في معالجة الصفحة ${i + 1}:`, pageError);
                // Continue with other pages instead of failing completely
            }
        }

        console.log(`✅ تم إنشاء ${thumbnails.length} صورة مصغرة`);

        return Response.json({
            success: true,
            thumbnails: thumbnails,
            totalPages: totalPages,
            displayedPages: thumbnails.length,
            processedPages: pagesToProcess,
            pageWidth: pageWidth,
            pageHeight: pageHeight
        });

    } catch (error) {
        console.error('❌ خطأ في إنشاء الصور المصغرة:', error);
        console.error('Stack:', error.stack);
        
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء إنشاء الصور المصغرة',
            details: error.stack
        }, { status: 500 });
    }
});