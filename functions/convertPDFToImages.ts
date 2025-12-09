import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ success: false, error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { fileUrl, format = 'png', quality = 95 } = body;

        console.log('📥 طلب تحويل PDF إلى صور:', fileUrl, 'صيغة:', format);

        if (!fileUrl) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير رابط ملف PDF' 
            }, { status: 400 });
        }

        const iLoveAPIKey = Deno.env.get('publickeylovepdf');
        
        if (!iLoveAPIKey) {
            return Response.json({ 
                success: false, 
                error: 'مفتاح API غير متوفر - تواصل مع المسؤول' 
            }, { status: 500 });
        }

        // 1. المصادقة والحصول على token
        const authResponse = await fetch('https://api.ilovepdf.com/v1/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_key: iLoveAPIKey })
        });

        if (!authResponse.ok) {
            const authError = await authResponse.text();
            console.error('Auth error:', authError);
            throw new Error('فشل المصادقة');
        }

        const { token } = await authResponse.json();

        // 2. إنشاء مهمة التحويل
        const taskResponse = await fetch('https://api.ilovepdf.com/v1/start/pdfjpg', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!taskResponse.ok) {
            throw new Error('فشل إنشاء المهمة');
        }

        const { task, server } = await taskResponse.json();

        // 3. رفع الملف من URL
        const uploadResponse = await fetch(`https://${server}/v1/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task: task,
                cloud_file: fileUrl
            })
        });

        if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.text();
            console.error('Upload error:', uploadError);
            throw new Error('فشل رفع الملف');
        }

        const { server_filename } = await uploadResponse.json();

        // 4. معالجة التحويل
        const processResponse = await fetch(`https://${server}/v1/process`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task: task,
                tool: 'pdfjpg',
                files: [{ server_filename: server_filename, filename: 'document.pdf' }],
                pdfjpg_mode: 'pages'
            })
        });

        if (!processResponse.ok) {
            const processError = await processResponse.text();
            console.error('Process error:', processError);
            throw new Error('فشل المعالجة');
        }

        await processResponse.json();

        // 5. تحميل النتائج
        const downloadResponse = await fetch(`https://${server}/v1/download/${task}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!downloadResponse.ok) {
            throw new Error('فشل تحميل النتائج');
        }

        const zipBytes = await downloadResponse.arrayBuffer();
        
        // فك ضغط الملفات
        const JSZip = (await import('npm:jszip@3.10.1')).default;
        const zip = await JSZip.loadAsync(zipBytes);
        
        const images = [];
        const entries = Object.entries(zip.files).sort((a, b) => a[0].localeCompare(b[0]));
        
        for (const [filename, file] of entries) {
            if (!file.dir && (filename.endsWith('.jpg') || filename.endsWith('.jpeg'))) {
                const imageBytes = await file.async('uint8array');
                
                const chunks = [];
                const chunkSize = 8192;
                for (let i = 0; i < imageBytes.length; i += chunkSize) {
                    const chunk = imageBytes.slice(i, i + chunkSize);
                    chunks.push(String.fromCharCode(...chunk));
                }
                const base64 = btoa(chunks.join(''));
                
                const ext = format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg';
                const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
                
                const imageBlob = new Blob([imageBytes], { type: mimeType });
                const imageFile = new File([imageBlob], `page_${images.length + 1}.${ext}`, { type: mimeType });
                
                const uploadResult = await base44.integrations.Core.UploadFile({ file: imageFile });
                
                images.push({
                    pageNumber: images.length + 1,
                    imageDataUrl: `data:${mimeType};base64,${base64}`,
                    base64: base64,
                    filename: `page_${images.length + 1}.${ext}`,
                    downloadUrl: uploadResult.file_url,
                    format: ext
                });
            }
        }

        console.log('✅ تم تحويل', images.length, 'صفحة');

        return Response.json({
            success: true,
            images: images,
            totalPages: images.length,
            processedPages: images.length,
            message: `تم تحويل ${images.length} صفحة إلى ${format.toUpperCase()}`
        });

    } catch (error) {
        console.error('❌ خطأ:', error);
        
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء التحويل'
        }, { status: 500 });
    }
});