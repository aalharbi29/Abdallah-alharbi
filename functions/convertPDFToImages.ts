import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ success: false, error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { fileUrl, format = 'png', quality = 95, scale = 2 } = body;

        console.log('📥 طلب تحويل PDF إلى صور:', fileUrl, 'نسق:', format);

        if (!fileUrl) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير رابط ملف PDF' 
            }, { status: 400 });
        }

        // استخدام iLovePDF API للتحويل
        const iLoveAPIKey = Deno.env.get('iLoveAPI');
        
        if (!iLoveAPIKey) {
            return Response.json({ 
                success: false, 
                error: 'API key غير متوفر' 
            }, { status: 500 });
        }

        // 1. طلب رمز المهمة
        const authResponse = await fetch('https://api.ilovepdf.com/v1/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                public_key: iLoveAPIKey
            })
        });

        if (!authResponse.ok) {
            throw new Error('فشل المصادقة مع iLovePDF');
        }

        const authData = await authResponse.json();
        const token = authData.token;

        // 2. بدء مهمة التحويل
        const taskResponse = await fetch('https://api.ilovepdf.com/v1/start/pdfjpg', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!taskResponse.ok) {
            throw new Error('فشل إنشاء مهمة التحويل');
        }

        const taskData = await taskResponse.json();
        const taskId = taskData.task;
        const serverUrl = taskData.server;

        // 3. رفع الملف
        const uploadResponse = await fetch(`${serverUrl}/v1/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                task: taskId,
                cloud_file: fileUrl
            })
        });

        if (!uploadResponse.ok) {
            throw new Error('فشل رفع الملف');
        }

        const uploadData = await uploadResponse.json();
        const serverFilename = uploadData.server_filename;

        // 4. تطبيق عملية التحويل
        const processResponse = await fetch(`${serverUrl}/v1/process`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task: taskId,
                tool: 'pdfjpg',
                files: [{
                    server_filename: serverFilename,
                    filename: 'document.pdf'
                }]
            })
        });

        if (!processResponse.ok) {
            throw new Error('فشل معالجة الملف');
        }

        const processData = await processResponse.json();

        // 5. تحميل الملفات الناتجة
        const downloadResponse = await fetch(`${serverUrl}/v1/download/${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!downloadResponse.ok) {
            throw new Error('فشل تحميل النتيجة');
        }

        // تحميل ملف ZIP الذي يحتوي على الصور
        const zipBytes = await downloadResponse.arrayBuffer();
        
        // فك ضغط ZIP (استخدام JSZip)
        const JSZip = (await import('npm:jszip@3.10.1')).default;
        const zip = await JSZip.loadAsync(zipBytes);
        
        const images = [];
        let pageNumber = 1;
        
        for (const [filename, file] of Object.entries(zip.files)) {
            if (!file.dir && (filename.endsWith('.jpg') || filename.endsWith('.png'))) {
                const imageBytes = await file.async('uint8array');
                
                // تحويل إلى Base64
                const base64 = btoa(
                    Array.from(imageBytes)
                        .map(byte => String.fromCharCode(byte))
                        .join('')
                );
                
                // رفع الصورة
                const imageBlob = new Blob([imageBytes], { type: `image/${format}` });
                const imageFile = new File([imageBlob], `page_${pageNumber}.${format}`, { type: `image/${format}` });
                
                const uploadResult = await base44.integrations.Core.UploadFile({ 
                    file: imageFile 
                });
                
                images.push({
                    pageNumber: pageNumber,
                    imageDataUrl: `data:image/${format};base64,${base64}`,
                    base64: base64,
                    filename: `page_${pageNumber}.${format}`,
                    downloadUrl: uploadResult.file_url,
                    format: format
                });
                
                pageNumber++;
            }
        }

        console.log('✅ تم تحويل ' + images.length + ' صفحة إلى صور');

        return Response.json({
            success: true,
            images: images,
            totalPages: images.length,
            processedPages: images.length,
            message: `تم تحويل ${images.length} صفحة إلى ${format.toUpperCase()}`
        });

    } catch (error) {
        console.error('❌ خطأ في تحويل PDF:', error);
        
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء التحويل',
            details: error.stack
        }, { status: 500 });
    }
});