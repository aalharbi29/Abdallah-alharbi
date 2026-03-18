import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ success: false, error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { fileUrl, compressionLevel = 'recommended' } = body;

        console.log('📥 طلب ضغط PDF:', { fileUrl, compressionLevel });

        if (!fileUrl) {
            return Response.json({ 
                success: false, 
                error: 'يجب توفير رابط ملف PDF' 
            }, { status: 400 });
        }

        // تحميل ملف PDF الأصلي
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`فشل تحميل الملف: ${response.status}`);
        }

        const originalBytes = await response.arrayBuffer();
        const originalSize = originalBytes.byteLength;
        
        console.log(`📦 الحجم الأصلي: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

        // استخدام Stirling PDF API (مجاني ومفتوح المصدر)
        // أو استخدام pdflite.co API
        
        try {
            console.log('🚀 استخدام خدمة الضغط...');
            
            // محاولة استخدام API.PDF.co (مجاني لـ 500 طلب/شهر)
            const PDF_CO_API_KEY = Deno.env.get("PDF_CO_API_KEY");
            
            if (PDF_CO_API_KEY) {
                // استخدام PDF.co API
                const uploadFormData = new FormData();
                uploadFormData.append('file', new Blob([originalBytes], { type: 'application/pdf' }), 'document.pdf');

                // رفع الملف أولاً
                const uploadResponse = await fetch('https://api.pdf.co/v1/file/upload', {
                    method: 'POST',
                    headers: {
                        'x-api-key': PDF_CO_API_KEY
                    },
                    body: uploadFormData
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    
                    // ضغط الملف
                    const compressResponse = await fetch('https://api.pdf.co/v1/pdf/optimize', {
                        method: 'POST',
                        headers: {
                            'x-api-key': PDF_CO_API_KEY,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            url: uploadData.url,
                            name: 'compressed.pdf'
                        })
                    });

                    if (compressResponse.ok) {
                        const compressData = await compressResponse.json();
                        
                        // تحميل الملف المضغوط
                        const downloadResponse = await fetch(compressData.url);
                        const compressedBytes = await downloadResponse.arrayBuffer();
                        const compressedSize = compressedBytes.byteLength;

                        const actualReduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                        console.log(`✅ تم الضغط: ${actualReduction}%`);

                        // تحويل إلى Base64
                        const uint8Array = new Uint8Array(compressedBytes);
                        const base64 = arrayBufferToBase64(uint8Array);

                        return Response.json({
                            success: true,
                            pdfBase64: base64,
                            originalSize: originalSize,
                            compressedSize: compressedSize,
                            reductionPercentage: parseFloat(actualReduction),
                            compressionLevel: compressionLevel,
                            message: `تم ضغط الملف بنجاح! تم تقليل الحجم بنسبة ${actualReduction}%`
                        });
                    }
                }
            }

            // إذا لم يكن هناك API key، نستخدم طريقة بديلة
            // استخدام Ghostscript-like compression عبر خدمة مجانية
            
            // نحاول استخدام smallpdf API أو iLovePDF
            const ILOVEPDF_PUBLIC_KEY = Deno.env.get("publickeylovepdf");
            const ILOVEPDF_SECRET_KEY = Deno.env.get("iLoveAPI");
            
            if (ILOVEPDF_PUBLIC_KEY && ILOVEPDF_SECRET_KEY) {
                console.log('🔄 استخدام iLovePDF API...');
                
                // الحصول على JWT token
                const authResponse = await fetch('https://api.ilovepdf.com/v1/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        public_key: ILOVEPDF_PUBLIC_KEY
                    })
                });

                if (!authResponse.ok) {
                    throw new Error('فشل المصادقة مع iLovePDF');
                }

                const authData = await authResponse.json();
                const token = authData.token;

                // بدء مهمة الضغط
                const startResponse = await fetch('https://api.ilovepdf.com/v1/start/compress', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!startResponse.ok) {
                    throw new Error('فشل بدء مهمة الضغط');
                }

                const startData = await startResponse.json();
                const server = startData.server;
                const task = startData.task;

                // رفع الملف
                const uploadFormData = new FormData();
                uploadFormData.append('task', task);
                uploadFormData.append('file', new Blob([originalBytes], { type: 'application/pdf' }), 'document.pdf');

                const uploadResponse = await fetch(`https://${server}/v1/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: uploadFormData
                });

                if (!uploadResponse.ok) {
                    throw new Error('فشل رفع الملف');
                }

                const uploadData = await uploadResponse.json();
                const serverFilename = uploadData.server_filename;

                // تحديد مستوى الضغط
                let ilovepdfLevel = 'recommended';
                if (compressionLevel === 'extreme' || compressionLevel === 'low') {
                    ilovepdfLevel = 'extreme';
                } else if (compressionLevel === 'low_quality') {
                    ilovepdfLevel = 'low';
                }

                // معالجة الملف
                const processResponse = await fetch(`https://${server}/v1/process`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        task: task,
                        tool: 'compress',
                        files: [{ server_filename: serverFilename, filename: 'document.pdf' }],
                        compression_level: ilovepdfLevel
                    })
                });

                if (!processResponse.ok) {
                    throw new Error('فشل معالجة الملف');
                }

                // تحميل النتيجة
                const downloadResponse = await fetch(`https://${server}/v1/download/${task}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!downloadResponse.ok) {
                    throw new Error('فشل تحميل الملف المضغوط');
                }

                const compressedBytes = await downloadResponse.arrayBuffer();
                const compressedSize = compressedBytes.byteLength;

                const actualReduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                console.log(`✅ تم الضغط بواسطة iLovePDF: ${actualReduction}%`);

                const uint8Array = new Uint8Array(compressedBytes);
                const base64 = arrayBufferToBase64(uint8Array);

                return Response.json({
                    success: true,
                    pdfBase64: base64,
                    originalSize: originalSize,
                    compressedSize: compressedSize,
                    reductionPercentage: parseFloat(actualReduction),
                    compressionLevel: ilovepdfLevel,
                    message: `تم ضغط الملف بنجاح! تم تقليل الحجم من ${(originalSize / 1024 / 1024).toFixed(2)}MB إلى ${(compressedSize / 1024 / 1024).toFixed(2)}MB (${actualReduction}%)`
                });
            }

            // إذا لم تتوفر أي خدمة خارجية، نرجع خطأ مع توجيهات
            return Response.json({
                success: false,
                error: 'لضغط الملفات الكبيرة بشكل فعال، يرجى إضافة مفتاح API لخدمة ضغط PDF. يمكنك استخدام iLovePDF أو PDF.co',
                suggestion: 'أضف ILOVEPDF_PUBLIC_KEY و ILOVEPDF_SECRET_KEY أو PDF_CO_API_KEY في إعدادات البيئة',
                originalSize: originalSize,
                originalSizeMB: (originalSize / 1024 / 1024).toFixed(2)
            }, { status: 400 });

        } catch (apiError) {
            console.error('❌ خطأ في API الضغط:', apiError);
            throw apiError;
        }

    } catch (error) {
        console.error('❌ خطأ عام في ضغط PDF:', error);
        
        return Response.json({ 
            success: false, 
            error: error.message || 'حدث خطأ أثناء ضغط الملف'
        }, { status: 500 });
    }
});

function arrayBufferToBase64(uint8Array) {
    const chunks = [];
    const chunkSize = 0x8000;

    for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
    }

    return btoa(chunks.join(''));
}