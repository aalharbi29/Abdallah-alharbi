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
        const { imageUrls } = body;

        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير صورة واحدة على الأقل' 
            }, { status: 400 });
        }

        console.log(`📥 طلب تحويل ${imageUrls.length} صورة إلى PDF`);

        const pdfDoc = await PDFDocument.create();

        for (let i = 0; i < imageUrls.length; i++) {
            const imageUrl = imageUrls[i];
            console.log(`📷 معالجة الصورة ${i + 1}/${imageUrls.length}: ${imageUrl}`);

            try {
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`فشل تحميل الصورة: ${response.statusText}`);
                }

                const imageBytes = await response.arrayBuffer();
                
                // تحديد نوع الصورة
                let image;
                if (imageUrl.toLowerCase().endsWith('.png')) {
                    image = await pdfDoc.embedPng(imageBytes);
                } else {
                    image = await pdfDoc.embedJpg(imageBytes);
                }

                // إنشاء صفحة بحجم الصورة
                const page = pdfDoc.addPage([image.width, image.height]);
                
                // رسم الصورة على الصفحة
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                });

                console.log(`✅ تم إضافة الصورة ${i + 1}`);
            } catch (imageError) {
                console.error(`❌ خطأ في الصورة ${i + 1}:`, imageError);
                throw new Error(`فشل معالجة الصورة ${i + 1}: ${imageError.message}`);
            }
        }

        const pdfBytes = await pdfDoc.save();
        
        // تحويل إلى Base64
        const uint8Array = new Uint8Array(pdfBytes);
        const chunks = [];
        const chunkSize = 0x8000;
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
            chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        const binaryString = chunks.join('');
        const base64 = btoa(binaryString);

        console.log(`✅ تم تحويل ${imageUrls.length} صورة إلى PDF بنجاح`);

        return Response.json({
            success: true,
            pdfBase64: base64,
            fileSize: pdfBytes.length,
            totalPages: imageUrls.length,
            message: `تم تحويل ${imageUrls.length} صورة إلى PDF بنجاح`
        });

    } catch (error) {
        console.error('❌ خطأ في تحويل الصور:', error);
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء التحويل' 
        }, { status: 500 });
    }
});