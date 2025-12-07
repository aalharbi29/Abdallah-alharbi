import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import JSZip from 'npm:jszip@3.10.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ success: false, error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { fileUrl } = body;

        console.log('📥 طلب فك ضغط ملف:', fileUrl);

        if (!fileUrl) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير رابط الملف المضغوط' 
            }, { status: 400 });
        }

        // تحميل الملف المضغوط
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`فشل تحميل الملف: ${response.status}`);
        }

        const zipBytes = await response.arrayBuffer();
        console.log(`📦 حجم الملف المضغوط: ${(zipBytes.byteLength / 1024 / 1024).toFixed(2)} MB`);

        // فك الضغط
        const zip = new JSZip();
        await zip.loadAsync(zipBytes);

        const extractedFiles = [];
        const filePromises = [];

        // استخراج جميع الملفات
        zip.forEach((relativePath, file) => {
            if (!file.dir) {
                filePromises.push(
                    file.async('arraybuffer').then(async (content) => {
                        const fileName = relativePath.split('/').pop();
                        const fileExtension = fileName.split('.').pop().toLowerCase();
                        
                        // تحويل إلى Base64
                        const uint8Array = new Uint8Array(content);
                        const chunks = [];
                        const chunkSize = 0x8000;
                        
                        for (let i = 0; i < uint8Array.length; i += chunkSize) {
                            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
                            chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
                        }
                        
                        const base64 = btoa(chunks.join(''));
                        
                        return {
                            name: fileName,
                            path: relativePath,
                            size: content.byteLength,
                            type: fileExtension === 'pdf' ? 'application/pdf' : 'application/octet-stream',
                            isPDF: fileExtension === 'pdf',
                            base64: base64
                        };
                    })
                );
            }
        });

        const files = await Promise.all(filePromises);
        
        console.log(`✅ تم استخراج ${files.length} ملف`);
        console.log(`📄 ملفات PDF: ${files.filter(f => f.isPDF).length}`);

        return Response.json({
            success: true,
            files: files,
            totalFiles: files.length,
            pdfFiles: files.filter(f => f.isPDF).length,
            message: `تم فك ضغط ${files.length} ملف بنجاح`
        });

    } catch (error) {
        console.error('❌ خطأ في فك الضغط:', error);
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء فك ضغط الملف' 
        }, { status: 500 });
    }
});