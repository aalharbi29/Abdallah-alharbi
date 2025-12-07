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
        const { fileUrl, splitType, pageRanges } = body;

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

        console.log(`📄 الملف يحتوي على ${totalPages} صفحة`);

        const splitPdfs = [];

        if (splitType === 'each') {
            // تقسيم كل صفحة لملف منفصل - دعم حتى 100 صفحة
            const maxPages = Math.min(totalPages, 100);
            
            for (let i = 0; i < maxPages; i++) {
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                newPdf.addPage(copiedPage);
                
                const pdfBytes = await newPdf.save();
                const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
                
                splitPdfs.push({
                    filename: `page_${i + 1}.pdf`,
                    pdfBase64: base64,
                    pageCount: 1,
                    pageRange: `${i + 1}`
                });

                if ((i + 1) % 20 === 0) {
                    console.log(`✅ تم معالجة ${i + 1} صفحة...`);
                }
            }

            const message = maxPages < totalPages
                ? `تم تقسيم أول ${maxPages} صفحة من أصل ${totalPages} صفحة`
                : `تم تقسيم جميع الـ ${totalPages} صفحة بنجاح`;

            return Response.json({
                success: true,
                splitPdfs: splitPdfs,
                message: message,
                totalPages: totalPages,
                processedPages: maxPages
            });

        } else if (splitType === 'ranges' && Array.isArray(pageRanges)) {
            // تقسيم حسب النطاقات المحددة
            for (let i = 0; i < pageRanges.length; i++) {
                const range = pageRanges[i];
                const start = Math.max(1, range.start) - 1; // Convert to 0-indexed
                const end = Math.min(totalPages, range.end);
                
                if (start >= end || start < 0 || end > totalPages) {
                    console.warn(`تجاوز النطاق غير الصالح: ${start + 1}-${end}`);
                    continue;
                }

                const newPdf = await PDFDocument.create();
                const pageIndices = [];
                for (let j = start; j < end; j++) {
                    pageIndices.push(j);
                }
                
                const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
                copiedPages.forEach(page => newPdf.addPage(page));
                
                const pdfBytes = await newPdf.save();
                const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
                
                splitPdfs.push({
                    filename: `pages_${start + 1}_to_${end}.pdf`,
                    pdfBase64: base64,
                    pageCount: pageIndices.length,
                    pageRange: `${start + 1}-${end}`
                });
            }

            return Response.json({
                success: true,
                splitPdfs: splitPdfs,
                message: `تم تقسيم الملف إلى ${splitPdfs.length} ملف حسب النطاقات المحددة`,
                totalPages: totalPages
            });
        }

        throw new Error('نوع تقسيم غير صحيح');

    } catch (error) {
        console.error('❌ خطأ في تقسيم PDF:', error);
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء تقسيم الملف'
        }, { status: 500 });
    }
});