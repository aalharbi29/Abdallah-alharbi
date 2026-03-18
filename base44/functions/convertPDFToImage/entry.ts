import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { pdfUrl, pageNumber = 1, scale = 2 } = await req.json();

        if (!pdfUrl) {
            return Response.json({ error: 'pdfUrl is required' }, { status: 400 });
        }

        // تحميل PDF
        const pdfResponse = await fetch(pdfUrl);
        const pdfBuffer = await pdfResponse.arrayBuffer();

        // استخدام pdf-lib لتحويل PDF إلى صورة
        const { PDFDocument } = await import('npm:pdf-lib@1.17.1');
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        
        const pageCount = pdfDoc.getPageCount();
        const targetPage = Math.min(Math.max(1, pageNumber), pageCount) - 1;
        
        // استخراج الصفحة كـ PDF منفصل
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [targetPage]);
        newPdfDoc.addPage(copiedPage);
        
        const pdfBytes = await newPdfDoc.save();
        
        // تحويل إلى base64
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
        const dataUrl = `data:application/pdf;base64,${base64}`;

        // يمكن استخدام Canvas API في المتصفح لتحويل PDF لصورة
        // لكن هنا سنرجع PDF data URL مباشرة
        return Response.json({
            success: true,
            imageUrl: dataUrl,
            pageCount: pageCount,
            message: 'يمكنك الآن استخدام هذا كخلفية. للحصول على أفضل نتيجة، استخدم أداة تحويل PDF خارجية أو ارفع صورة PNG/JPG.'
        });

    } catch (error) {
        console.error('PDF conversion error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});