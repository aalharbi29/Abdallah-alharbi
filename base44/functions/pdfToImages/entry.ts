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

        console.log('📥 طلب فصل صفحات PDF:', fileUrl);

        if (!fileUrl) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير رابط ملف PDF' 
            }, { status: 400 });
        }

        // تحميل ملف PDF
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error('فشل تحميل الملف: ' + response.status);
        }

        const pdfBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();

        console.log('📄 الملف يحتوي على ' + totalPages + ' صفحة');

        // الحد الأقصى للصفحات - تم زيادته إلى 100 صفحة
        const maxPages = Math.min(totalPages, 100);
        const images = [];
        
        // فصل كل صفحة إلى PDF منفصل
        for (let i = 0; i < maxPages; i++) {
            try {
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                newPdf.addPage(copiedPage);
                
                const pageBytes = await newPdf.save();
                
                // تحويل إلى Base64
                const uint8Array = new Uint8Array(pageBytes);
                const chunkSize = 0x8000;
                const chunks = [];
                
                for (let j = 0; j < uint8Array.length; j += chunkSize) {
                    const chunk = uint8Array.subarray(j, Math.min(j + chunkSize, uint8Array.length));
                    chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
                }
                
                const binaryString = chunks.join('');
                const base64 = btoa(binaryString);
                
                // رفع الصفحة كملف منفصل
                const pageBlob = new Blob([pageBytes], { type: 'application/pdf' });
                const pageFile = new File([pageBlob], 'page_' + (i + 1) + '.pdf', { type: 'application/pdf' });
                
                const uploadResult = await base44.integrations.Core.UploadFile({ 
                    file: pageFile 
                });
                
                images.push({
                    pageNumber: i + 1,
                    imageDataUrl: 'data:application/pdf;base64,' + base64,
                    base64: base64,
                    filename: 'page_' + (i + 1) + '.pdf',
                    downloadUrl: uploadResult.file_url,
                    format: 'pdf'
                });
                
                console.log('✅ تم معالجة الصفحة ' + (i + 1));
            } catch (pageError) {
                console.error('❌ خطأ في الصفحة ' + (i + 1) + ':', pageError);
                continue;
            }
        }

        if (images.length === 0) {
            throw new Error('فشل معالجة أي صفحة من الملف');
        }

        console.log('✅ تم فصل ' + images.length + ' صفحة');

        const message = maxPages < totalPages 
            ? `تم فصل أول ${images.length} صفحة من أصل ${totalPages} صفحة`
            : `تم فصل جميع الـ ${images.length} صفحة بنجاح`;

        return Response.json({
            success: true,
            images: images,
            totalPages: totalPages,
            processedPages: images.length,
            message: message
        });

    } catch (error) {
        console.error('❌ خطأ في معالجة PDF:', error);
        console.error('Stack:', error.stack);
        
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء معالجة الملف',
            details: error.stack
        }, { status: 500 });
    }
});