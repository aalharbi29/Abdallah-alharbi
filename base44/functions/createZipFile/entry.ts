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
        const { files, zipName = 'files' } = body;

        console.log('📥 طلب إنشاء ملف مضغوط:', { filesCount: files?.length, zipName });

        if (!files || !Array.isArray(files) || files.length === 0) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير ملف واحد على الأقل' 
            }, { status: 400 });
        }

        const zip = new JSZip();

        // إضافة الملفات إلى الأرشيف
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (file.base64) {
                // تحويل Base64 إلى bytes
                const binaryString = atob(file.base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let j = 0; j < binaryString.length; j++) {
                    bytes[j] = binaryString.charCodeAt(j);
                }
                
                zip.file(file.name || `file_${i + 1}.pdf`, bytes);
                console.log(`✅ تمت إضافة: ${file.name}`);
            } else if (file.url) {
                // تحميل الملف من URL
                const response = await fetch(file.url);
                const arrayBuffer = await response.arrayBuffer();
                zip.file(file.name || `file_${i + 1}.pdf`, arrayBuffer);
                console.log(`✅ تمت إضافة: ${file.name}`);
            }
        }

        // إنشاء الملف المضغوط
        const zipBytes = await zip.generateAsync({ 
            type: 'arraybuffer',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        });

        // تحويل إلى Base64
        const uint8Array = new Uint8Array(zipBytes);
        const chunks = [];
        const chunkSize = 0x8000;
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
            chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        const base64 = btoa(chunks.join(''));

        console.log(`✅ تم إنشاء ملف مضغوط: ${(zipBytes.byteLength / 1024 / 1024).toFixed(2)} MB`);

        return Response.json({
            success: true,
            zipBase64: base64,
            size: zipBytes.byteLength,
            filesCount: files.length,
            message: `تم إنشاء ملف مضغوط يحتوي على ${files.length} ملف`
        });

    } catch (error) {
        console.error('❌ خطأ في إنشاء الملف المضغوط:', error);
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء إنشاء الملف المضغوط' 
        }, { status: 500 });
    }
});