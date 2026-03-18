import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { PDFDocument, degrees } from 'npm:pdf-lib@1.17.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl, pageNumber = 1, cropArea, scale = 1, rotation = 0 } = await req.json();

    if (!fileUrl) {
      return Response.json({ error: 'fileUrl is required' }, { status: 400 });
    }

    // تحميل ملف PDF
    const pdfResponse = await fetch(fileUrl);
    const pdfBytes = await pdfResponse.arrayBuffer();

    // تحميل المستند
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // إنشاء مستند جديد
    const newPdfDoc = await PDFDocument.create();
    
    // نسخ الصفحة المحددة
    const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
    
    // الحصول على أبعاد الصفحة الأصلية
    const { width: originalWidth, height: originalHeight } = copiedPage.getSize();
    
    // تطبيق التكبير
    const newWidth = originalWidth * scale;
    const newHeight = originalHeight * scale;
    copiedPage.setSize(newWidth, newHeight);
    
    // تطبيق الدوران
    if (rotation !== 0) {
      copiedPage.setRotation(degrees(rotation));
    }
    
    // إضافة الصفحة
    newPdfDoc.addPage(copiedPage);
    
    // حفظ المستند
    const modifiedPdfBytes = await newPdfDoc.save();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(modifiedPdfBytes)));

    return Response.json({
      success: true,
      pdfBase64: base64,
      message: `تم تطبيق التعديلات بنجاح (التكبير: ${Math.round(scale * 100)}%, الدوران: ${rotation}°)`
    });

  } catch (error) {
    console.error('Crop PDF error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'حدث خطأ أثناء معالجة الملف' 
    }, { status: 500 });
  }
});