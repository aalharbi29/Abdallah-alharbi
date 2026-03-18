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
                error: 'يجب توفير رابط الملف وأرقام الصفحات المراد حذفها' 
            }, { status: 400 });
        }

        console.log(`📥 طلب حذف صفحات: ${pageNumbers.join(', ')}`);

        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`فشل تحميل الملف: ${response.statusText}`);
        }

        const pdfBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();

        // إنشاء قائمة بالصفحات المراد الاحتفاظ بها
        const pagesToKeep = [];
        for (let i = 1; i <= totalPages; i++) {
            if (!pageNumbers.includes(i)) {
                pagesToKeep.push(i);
            }
        }

        if (pagesToKeep.length === 0) {
            throw new Error('لا يمكن حذف جميع الصفحات');
        }

        const newPdf = await PDFDocument.create();
        const pageIndices = pagesToKeep.map(p => p - 1);

        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const newPdfBytes = await newPdf.save();
        
        // تحويل إلى Base64
        const uint8Array = new Uint8Array(newPdfBytes);
        const chunks = [];
        const chunkSize = 0x8000;
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
            chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        const base64 = btoa(chunks.join(''));

        console.log(`✅ تم حذف ${pageNumbers.length} صفحة، تبقى ${pagesToKeep.length} صفحة`);

        return Response.json({
            success: true,
            pdfBase64: base64,
            remainingPages: pagesToKeep.length,
            message: `تم حذف ${pageNumbers.length} صفحة بنجاح`
        });

    } catch (error) {
        console.error('❌ خطأ في حذف الصفحات:', error);
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء حذف الصفحات' 
        }, { status: 500 });
    }
});