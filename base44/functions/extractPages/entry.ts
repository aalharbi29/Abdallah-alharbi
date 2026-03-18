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
        const { fileUrl, pageNumbers } = body;

        if (!fileUrl || !pageNumbers || !Array.isArray(pageNumbers) || pageNumbers.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير رابط الملف وأرقام الصفحات' 
            }, { status: 400 });
        }

        console.log(`📥 طلب استخراج صفحات: ${pageNumbers.join(', ')}`);

        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`فشل تحميل الملف: ${response.statusText}`);
        }

        const pdfBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();

        // التحقق من صحة أرقام الصفحات
        const validPages = pageNumbers.filter(p => p >= 1 && p <= totalPages);
        if (validPages.length === 0) {
            throw new Error('لا توجد أرقام صفحات صالحة');
        }

        const newPdf = await PDFDocument.create();
        const pageIndices = validPages.map(p => p - 1); // تحويل من 1-based إلى 0-based

        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const extractedPdfBytes = await newPdf.save();
        
        // تحويل إلى Base64
        const uint8Array = new Uint8Array(extractedPdfBytes);
        const chunks = [];
        const chunkSize = 0x8000;
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
            chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        const base64 = btoa(chunks.join(''));

        console.log(`✅ تم استخراج ${validPages.length} صفحة بنجاح`);

        return Response.json({
            success: true,
            pdfBase64: base64,
            totalPages: validPages.length,
            message: `تم استخراج ${validPages.length} صفحة بنجاح`
        });

    } catch (error) {
        console.error('❌ خطأ في استخراج الصفحات:', error);
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء استخراج الصفحات' 
        }, { status: 500 });
    }
});