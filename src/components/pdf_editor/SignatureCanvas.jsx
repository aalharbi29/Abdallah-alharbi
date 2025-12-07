
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Pen, 
  Eraser, 
  Download, 
  Loader2, 
  CheckCircle, 
  X,
  Save,
  FileSignature,
  Image as ImageIcon,
  Shield,
  AlertCircle,
  Move,
  Info,
  Eye,
  Type,
  Grid3x3,
  Magnet,
  MapPin,
  Bookmark,
  Plus, // Added Plus icon for adding signatures
  Trash2, // Added Trash2 icon for removing signatures
  Stamp, // NEW: Added Stamp icon for stamp mode
  Layers, // NEW: Added Layers icon for page selector
  Copy // NEW: Added Copy icon for batch processing
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// مواضع افتراضية شائعة للتوقيع
const PRESET_POSITIONS = [
  { id: 'bottom-right', name: 'أسفل اليمين', x: 400, y: 550, icon: '↘️' },
  { id: 'bottom-left', name: 'أسفل اليسار', x: 50, y: 550, icon: '↙️' },
  { id: 'bottom-center', name: 'أسفل الوسط', x: 225, y: 550, icon: '⬇️' },
  { id: 'top-right', name: 'أعلى اليمين', x: 400, y: 50, icon: '↗️' },
  { id: 'top-left', name: 'أعلى اليسار', x: 50, y: 50, icon: '↖️' },
  { id: 'center', name: 'المنتصف', x: 225, y: 300, icon: '🎯' }
];

// Built-in stamps library
const BUILT_IN_STAMPS = [
  { id: 'approved', name: 'موافق', emoji: '✅', color: '#10b981' }, // Tailwind green-500
  { id: 'rejected', name: 'مرفوض', emoji: '❌', color: '#ef4444' }, // Tailwind red-500
  { id: 'confidential', name: 'سري', emoji: '🔒', color: '#6b7280' }, // Tailwind gray-500
  { id: 'urgent', name: 'عاجل', emoji: '⚡', color: '#f59e0b' }, // Tailwind amber-500
  { id: 'draft', name: 'مسودة', emoji: '📝', color: '#6b7280' }, // Tailwind gray-500
  { id: 'reviewed', name: 'تمت المراجعة', emoji: '👁️', color: '#3b82f6' }, // Tailwind blue-500
  { id: 'paid', name: 'مدفوع', emoji: '💰', color: '#10b981' }, // Tailwind green-500
  { id: 'received', name: 'مستلم', emoji: '📥', color: '#8b5cf6' } // Tailwind violet-500
];

export default function SignatureCanvas({ onComplete }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [signatureMode, setSignatureMode] = useState('draw'); // 'draw', 'type', 'upload'
  const [signatureImage, setSignatureImage] = useState(null); // URL of the image to be placed
  const [signedPdf, setSignedPdf] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signaturePosition, setSignaturePosition] = useState({ x: 100, y: 100 });
  const [signatureSize, setSignatureSize] = useState(150); // Default width, height will be scaled
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pagePreview, setPagePreview] = useState(null); // URL for current page thumbnail
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previewSignedPdf, setPreviewSignedPdf] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  // Drawing customization options
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [lineStyle, setLineStyle] = useState('solid');
  
  // Typed signature options
  const [typedText, setTypedText] = useState('');
  const [fontFamily, setFontFamily] = useState('Dancing Script');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(48);

  // Grid and snapping state
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(true);
  const [alignmentGuides, setAlignmentGuides] = useState({ vertical: [], horizontal: [] });
  const [savedPositions, setSavedPositions] = useState([]);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 595, height: 842 }); // Default to A4 portrait points
  const [pdfViewBox, setPdfViewBox] = useState(null); // حدود PDF الفعلية داخل المعاينة

  // New states for multiple signatures
  const [addedSignatures, setAddedSignatures] = useState([]);
  const [currentPdfUrl, setCurrentPdfUrl] = useState(null); // Holds the base64 URL of the PDF after N signatures

  // New states for enhanced features
  const [pageThumbnails, setPageThumbnails] = useState([]); // List of all page thumbnails
  const [showPageSelector, setShowPageSelector] = useState(false); // Toggle visibility of page selector
  const [elementType, setElementType] = useState('signature'); // 'signature', 'stamp', 'custom'
  const [selectedStamp, setSelectedStamp] = useState(null); // Currently selected built-in stamp
  const [customStamps, setCustomStamps] = useState([]); // List of uploaded custom stamps
  
  // Batch processing states
  const [batchMode, setBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]); // List of files for batch processing
  const [batchProgress, setBatchProgress] = useState(0); // Progress of batch processing
  const [isBatchProcessing, setIsBatchProcessing] = useState(false); // Status of batch processing
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const previewRef = useRef(null);
  const typedCanvasRef = useRef(null);

  // Snap position to grid
  const snapPosition = (pos) => {
    if (!snapToGrid) return pos;
    // Snap relative to pdfViewBox if it exists, otherwise to general previewRef
    if (pdfViewBox) {
        const snappedX = Math.round((pos.x - pdfViewBox.x) / gridSize) * gridSize + pdfViewBox.x;
        const snappedY = Math.round((pos.y - pdfViewBox.y) / gridSize) * gridSize + pdfViewBox.y;
        return { x: snappedX, y: snappedY };
    }
    return {
      x: Math.round(pos.x / gridSize) * gridSize,
      y: Math.round(pos.y / gridSize) * gridSize
    };
  };

  // Check for alignment with preset positions and show guides
  const checkAlignment = (position) => {
    if (!showAlignmentGuides || !previewRef.current) {
        setAlignmentGuides({ vertical: [], horizontal: [] });
        return;
    }
    
    const threshold = 10; // pixels threshold for showing guides
    const guides = { vertical: [], horizontal: [] };
    
    const previewElement = previewRef.current;
    if (!previewElement) return;

    const currentWidth = previewElement.clientWidth;
    const currentHeight = previewElement.clientHeight;

    const centerX = currentWidth / 2;
    const centerY = currentHeight / 2;

    PRESET_POSITIONS.forEach(preset => {
      if (Math.abs(position.x - preset.x) < threshold) {
        guides.vertical.push(preset.x);
      }
      if (Math.abs(position.y - preset.y) < threshold) {
        guides.horizontal.push(preset.y);
      }
    });
    
    if (Math.abs(position.x - centerX) < threshold) {
      guides.vertical.push(centerX);
    }
    if (Math.abs(position.y - centerY) < threshold) {
      guides.horizontal.push(centerY);
    }
    
    setAlignmentGuides(guides);
  };

  useEffect(() => {
    // This effect should only run if the *current* element type is 'signature' and mode is 'draw'.
    if (elementType === 'signature' && signatureMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 400; // Fixed width for drawing canvas
      canvas.height = 200; // Fixed height for drawing canvas
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Apply line style
      if (lineStyle === 'dashed') {
        ctx.setLineDash([10, 5]);
      } else if (lineStyle === 'dotted') {
        ctx.setLineDash([2, 3]);
      } else {
        ctx.setLineDash([]);
      }
      
      ctxRef.current = ctx;
    }
  }, [elementType, signatureMode, drawingColor, lineWidth, lineStyle]);

  useEffect(() => {
    // Only load page preview thumbnails if no signatures have been added yet (i.e., currentPdfUrl is null)
    // Otherwise, the iframe will display the full currentPdfUrl, and pagePreview is not relevant for display.
    if (uploadedFile?.url && pageNumber && !currentPdfUrl) {
      loadPagePreview();
    }
  }, [uploadedFile, pageNumber, currentPdfUrl]);

  // حساب حدود PDF الفعلية داخل div المعاينة
  useEffect(() => {
    if (previewRef.current && pdfDimensions.width && pdfDimensions.height) {
      const calculatePdfViewBox = () => {
        const previewRect = previewRef.current.getBoundingClientRect();
        // Prevent division by zero if width/height are zero
        if (previewRect.width === 0 || previewRect.height === 0 || pdfDimensions.width === 0 || pdfDimensions.height === 0) {
            setPdfViewBox(null);
            return;
        }

        const pdfAspectRatio = pdfDimensions.width / pdfDimensions.height;
        const previewAspectRatio = previewRect.width / previewRect.height;

        let pdfWidth, pdfHeight, pdfX, pdfY;

        if (pdfAspectRatio > previewAspectRatio) {
          // PDF أعرض نسبياً - يملأ العرض
          pdfWidth = previewRect.width;
          pdfHeight = previewRect.width / pdfAspectRatio;
          pdfX = 0;
          pdfY = (previewRect.height - pdfHeight) / 2;
        } else {
          // PDF أطول نسبياً - يملأ الارتفاع
          pdfHeight = previewRect.height;
          pdfWidth = previewRect.height * pdfAspectRatio;
          pdfY = 0;
          pdfX = (previewRect.width - pdfWidth) / 2;
        }

        setPdfViewBox({ x: pdfX, y: pdfY, width: pdfWidth, height: pdfHeight });
        console.log('📦 حدود PDF داخل المعاينة:', { x: pdfX, y: pdfY, width: pdfWidth, height: pdfHeight });
      };

      // Recalculate whenever previewRef.current, pdfDimensions, or currentPdfUrl changes
      // currentPdfUrl might change the content of the iframe, hence affecting scaling
      calculatePdfViewBox();
      window.addEventListener('resize', calculatePdfViewBox);
      return () => window.removeEventListener('resize', calculatePdfViewBox);
    }
  }, [previewRef.current, pdfDimensions, pagePreview, currentPdfUrl]);

  const loadPagePreview = async () => {
    if (!uploadedFile?.url) return;
    
    setIsLoadingPreview(true);
    try {
      const response = await base44.functions.invoke('getPDFThumbnails', {
        fileUrl: uploadedFile.url,
        pageNumbers: [pageNumber] 
      });

      if (response.data?.success) {
        setTotalPages(response.data.totalPages || 0);
        
        // حفظ أبعاد PDF الحقيقية
        if (response.data.pageWidth && response.data.pageHeight) {
          setPdfDimensions({
            width: response.data.pageWidth,
            height: response.data.pageHeight
          });
          console.log('📏 أبعاد PDF:', response.data.pageWidth, 'x', response.data.pageHeight);
        }
        
        const pageThumb = response.data.thumbnails?.find(t => t.pageNumber === pageNumber);
        if (pageThumb) {
          setPagePreview(pageThumb.pdfDataUrl);
        }
      }
    } catch (error) {
      console.error('Preview error:', error);
      // alert('فشل تحميل معاينة الصفحة');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const startDrawing = (e) => {
    if (!canvasRef.current || !ctxRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current || !ctxRef.current) return;
    const canvas = canvas.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctxRef.current) {
      ctxRef.current.closePath();
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null); // Also clear the generated image if canvas is cleared
  };

  const generateTypedSignature = () => {
    if (!typedText.trim()) {
      alert('الرجاء كتابة نص التوقيع');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 500; // Fixed width for typed signature
    canvas.height = 150; // Fixed height
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px "${fontFamily}", cursive`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(typedText, canvas.width / 2, canvas.height / 2);

    setSignatureImage(canvas.toDataURL('image/png'));
    setElementType('signature'); // Ensure element type is set to signature
    setSignatureMode('type'); // Set signature mode to type
    alert('تم إنشاء التوقيع المكتوب بنجاح');
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('الرجاء اختيار ملف PDF فقط');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({
        id: Date.now(),
        name: file.name,
        url: result.file_url,
        size: file.size
      });
      setUploadProgress(100);
      alert('تم رفع الملف بنجاح');
      // After successful upload, immediately try to load page data
      // This will set totalPages and pdfDimensions
      await loadPagePreview(); 
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSignatureImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('الرجاء اختيار صورة (PNG, JPG, WEBP, GIF)');
      return;
    }

    try {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        img.src = event.target.result;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          const corners = [
            data.slice(0, 4), 
            data.slice((canvas.width - 1) * 4, (canvas.width - 1) * 4 + 4),
            data.slice((canvas.width * (canvas.height - 1)) * 4, (canvas.width * (canvas.height - 1)) * 4 + 4),
            data.slice((canvas.width * canvas.height - 1) * 4, (canvas.width * canvas.height - 1) * 4 + 4)
          ];
          
          let avgBg = { r: 0, g: 0, b: 0 };
          let validCorners = 0;
          corners.forEach(corner => {
            if (corner.length >= 3) {
                avgBg.r += corner[0];
                avgBg.g += corner[1];
                avgBg.b += corner[2];
                validCorners++;
            }
          });

          if (validCorners > 0) {
              avgBg.r /= validCorners;
              avgBg.g /= validCorners;
              avgBg.b /= validCorners;
          }
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const distance = Math.sqrt(
              Math.pow(r - avgBg.r, 2) +
              Math.pow(g - avgBg.g, 2) +
              Math.pow(b - avgBg.b, 2)
            );
            
            if (distance < 50 || (r > 240 && g > 240 && b > 240)) {
              data[i + 3] = 0;
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          canvas.toBlob(async (blob) => {
            if (blob) {
                const pngFile = new File([blob], 'signature.png', { type: 'image/png' });
                const result = await base44.integrations.Core.UploadFile({ file: pngFile });
                setSignatureImage(result.file_url);
                setElementType('signature'); // Ensure element type is set to signature
                setSignatureMode('upload'); // Set signature mode to upload
                alert('تم رفع التوقيع بنجاح مع إزالة الخلفية التلقائية');
            } else {
                alert('فشل تحويل الصورة إلى PNG.');
            }
          }, 'image/png');
        };
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع صورة التوقيع');
    }
  };

  const saveDrawnSignature = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      
      // إنشاء canvas جديد بخلفية شفافة
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // نسخ المحتوى من canvas الأصلي (بدون خلفية بيضاء)
      tempCtx.drawImage(canvas, 0, 0);
      
      const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
      if (!blob) {
          throw new Error('فشل إنشاء Blob من التوقيع المرسوم');
      }
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      
      const result = await base44.integrations.Core.UploadFile({ file });
      setSignatureImage(result.file_url);
      setElementType('signature'); // Ensure element type is set to signature
      setSignatureMode('draw'); // Set signature mode to draw
      alert('تم حفظ التوقيع بنجاح');
    } catch (error) {
      console.error('Save signature error:', error);
      alert('حدث خطأ أثناء حفظ التوقيع');
    }
  };

  const handleSignatureDragStart = (e) => {
    if (!previewRef.current) return;
    setIsDragging(true);
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragOffset({
      x: x - signaturePosition.x,
      y: y - signaturePosition.y
    });
  };

  const handleSignatureDrag = (e) => {
    if (!isDragging || !previewRef.current || !pdfViewBox) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;
    
    // Constrain signature movement within the pdfViewBox
    // Estimate signature height as a ratio of its width, e.g., 0.5 for signatures, 1 for stamps
    const effectiveSignatureHeight = signatureSize * (elementType === 'stamp' || elementType === 'custom' ? 1 : 0.5);

    newX = Math.max(pdfViewBox.x, Math.min(newX, pdfViewBox.x + pdfViewBox.width - signatureSize));
    newY = Math.max(pdfViewBox.y, Math.min(newY, pdfViewBox.y + pdfViewBox.height - effectiveSignatureHeight));

    const newPos = snapPosition({ x: newX, y: newY });
    checkAlignment(newPos);
    setSignaturePosition(newPos);
  };

  const handleSignatureDragEnd = () => {
    setIsDragging(false);
    setTimeout(() => setAlignmentGuides({ vertical: [], horizontal: [] }), 500); 
  };

  // New function to apply preset positions
  const applyPresetPosition = (preset) => {
    if (!pdfViewBox) {
      alert('المعاينة غير جاهزة لتطبيق المواقع المسبقة.');
      return;
    }
    
    const standardPdfWidth = 595;
    const standardPdfHeight = 842;

    const normalizedX = preset.x / standardPdfWidth;
    const normalizedY = preset.y / standardPdfHeight;

    const scaledX = normalizedX * pdfViewBox.width;
    const scaledY = normalizedY * pdfViewBox.height;

    const newX = pdfViewBox.x + scaledX;
    const newY = pdfViewBox.y + scaledY;

    const finalPos = { x: newX, y: newY };
    setSignaturePosition(finalPos);
    checkAlignment(finalPos);
  };

  // New function to save current position
  const saveCurrentPosition = () => {
    const name = prompt('أدخل اسماً لهذا الموضع:');
    if (name) {
      const newPosition = {
        id: Date.now().toString(),
        name,
        x: signaturePosition.x,
        y: signaturePosition.y,
        icon: '📌'
      };
      setSavedPositions(prev => [...prev, newPosition]);
      alert('✅ تم حفظ الموضع بنجاح');
    }
  };

  // New function to delete a saved position
  const deletePosition = (id) => {
    setSavedPositions(prev => prev.filter(p => p.id !== id));
  };

  const handleAddSignature = async () => {
    if (!uploadedFile && !currentPdfUrl) {
      alert('الرجاء رفع ملف PDF أولاً');
      return;
    }

    if (!signatureImage) {
      alert('الرجاء إضافة توقيع أو ختم أولاً (رسم أو رفع صورة)');
      return;
    }

    if (!pdfViewBox) {
      alert('جاري تحميل المعاينة، الرجاء المحاولة مرة أخرى');
      return;
    }

    setIsSigning(true);

    try {
      // تحويل موضع العنصر من إحداثيات div المعاينة إلى إحداثيات PDF الفعلية
      
      // 1. تحويل من إحداثيات div (previewRef) إلى إحداثيات PDF الفعلية داخل div (pdfViewBox)
      const sigXInPdf = signaturePosition.x - pdfViewBox.x;
      const sigYInPdf = signaturePosition.y - pdfViewBox.y;

      const effectiveSignatureHeight = signatureSize * (elementType === 'stamp' || elementType === 'custom' ? 1 : 0.5);

      // 2. التأكد من أن العنصر داخل حدود PDF (pdfViewBox)
      if (sigXInPdf < 0 || sigYInPdf < 0 || 
          sigXInPdf + signatureSize > pdfViewBox.width || 
          sigYInPdf + effectiveSignatureHeight > pdfViewBox.height) {
        alert('⚠️ التوقيع/الختم خارج حدود الصفحة! الرجاء وضعه داخل المنطقة المحددة.');
        setIsSigning(false);
        return;
      }

      // 3. حساب النسبة بين أبعاد pdfViewBox وأبعاد PDF الحقيقي (pdfDimensions)
      const scaleX = pdfDimensions.width / pdfViewBox.width;
      const scaleY = pdfDimensions.height / pdfViewBox.height;

      // 4. تحويل إلى إحداثيات PDF الحقيقية (بالنقاط)
      const pdfX = sigXInPdf * scaleX;
      const pdfY = sigYInPdf * scaleY;
      const pdfWidth = signatureSize * scaleX;
      const pdfHeight = effectiveSignatureHeight * scaleY;

      console.log('📐 معلومات التحويل التفصيلية:');
      console.log('- أبعاد PDF الحقيقية (نقاط):', pdfDimensions.width, 'x', pdfDimensions.height);
      console.log('- حدود PDF في المعاينة (بكسل):', pdfViewBox);
      console.log('- موضع العنصر في div المعاينة (بكسل):', signaturePosition.x, ',', signaturePosition.y);
      console.log('- موضع العنصر نسبة لـ PDF في المعاينة (بكسل):', sigXInPdf, ',', sigYInPdf);
      console.log('- معامل التحويل (بكسل إلى نقاط):', scaleX, ',', scaleY);
      console.log('- الموضع النهائي في PDF (نقاط):', pdfX, ',', pdfY);
      console.log('- الحجم النهائي في PDF (نقاط):', pdfWidth, 'x', pdfHeight);

      const response = await base44.functions.invoke('addSignatureToPDF', {
        fileUrl: currentPdfUrl || uploadedFile.url, // Use currentPdfUrl if available, else original uploadedFile
        signatureImageUrl: signatureImage,
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
        pageNumber: pageNumber
      });

      if (response.data?.success) {
        const newPdfBase64 = response.data.pdfBase64;
        const newPdfDataUrl = `data:application/pdf;base64,${newPdfBase64}`;

        // Save the added element details
        const newSignature = {
          id: Date.now(),
          imageUrl: signatureImage,
          position: { x: signaturePosition.x, y: signaturePosition.y }, // Position in preview pixels
          size: signatureSize,
          pageNumber: pageNumber,
          pdfCoords: { x: pdfX, y: pdfY, width: pdfWidth, height: pdfHeight }, // Position in PDF points
          type: elementType // Store the type of element for later reference (e.g., display)
        };
        
        setAddedSignatures(prev => [...prev, newSignature]);
        setCurrentPdfUrl(newPdfDataUrl); // Update the current PDF with the newly signed one
        
        // Reset for the next element
        setSignatureImage(null); // Clear current signature image
        setSelectedStamp(null); // Clear selected stamp
        setElementType('signature'); // Reset element type to default
        setSignatureMode('draw'); // Reset signature mode to default
        // Reset position to a default within the pdfViewBox
        setSignaturePosition({ x: pdfViewBox.x + 50, y: pdfViewBox.y + 50 }); 
        setSignatureSize(150); // Reset size
        clearCanvas(); // Clear drawn canvas if applicable
        setTypedText(''); // Clear typed text if applicable
        
        alert(`✅ تم إضافة ${elementType === 'signature' ? 'التوقيع' : 'الختم'} بنجاح!\nعدد العناصر المضافة: ${addedSignatures.length + 1}\n\nيمكنك الآن إضافة توقيع أو ختم آخر، أو حفظ الملف.`);
      } else {
        throw new Error(response.data?.error || 'فشل إضافة العنصر');
      }
    } catch (error) {
      console.error('Signing error:', error);
      alert(`حدث خطأ أثناء إضافة العنصر:\n${error.message}`);
    } finally {
      setIsSigning(false);
    }
  };

  const handleSaveTemporary = () => {
    if (addedSignatures.length === 0) {
      alert('لم يتم إضافة أي توقيعات أو أختام بعد.');
      return;
    }

    if (!currentPdfUrl) {
      alert('لا يوجد ملف محدث لحفظه. الرجاء إضافة توقيع واحد على الأقل.');
      return;
    }

    const pdfData = {
      base64: currentPdfUrl.replace('data:application/pdf;base64,', ''),
      filename: `signed_temp_${uploadedFile?.name.replace('.pdf', '') || 'document'}`,
      totalPages: totalPages,
      message: `ملف مؤقت - ${addedSignatures.length} توقيع/ختم`
    };
    
    setPreviewSignedPdf(pdfData);
    setShowPreviewDialog(true);
  };

  const handleFinalSave = () => {
    if (addedSignatures.length === 0) {
      alert('لم يتم إضافة أي توقيعات أو أختام بعد.');
      return;
    }

    if (!currentPdfUrl) {
      alert('لا يوجد ملف محدث لحفظه. الرجاء إضافة توقيع واحد على الأقل.');
      return;
    }

    const pdfData = {
      base64: currentPdfUrl.replace('data:application/pdf;base64,', ''),
      filename: `signed_final_${uploadedFile?.name.replace('.pdf', '') || Date.now()}`,
      totalPages: totalPages,
      message: `تم إضافة ${addedSignatures.length} توقيع/ختم بنجاح`
    };
    
    setSignedPdf(pdfData);
    
    if (onComplete) {
      onComplete(pdfData);
    }
    
    alert('✅ تم حفظ الملف النهائي بنجاح!');
  };

  const handleRemoveSignature = async (signatureIdToRemove) => {
    const confirmed = confirm('هل تريد حذف هذا العنصر؟ سيتم إعادة بناء الملف بالكامل بدونه.');
    if (!confirmed) return;

    setIsSigning(true);
    try {
      const remainingSignatures = addedSignatures.filter(sig => sig.id !== signatureIdToRemove);
      let tempPdfUrl = uploadedFile.url;

      for (const sig of remainingSignatures) {
        const effectiveSignatureHeight = sig.size * (sig.type === 'stamp' || sig.type === 'custom' ? 1 : 0.5); // Use saved type
        const response = await base44.functions.invoke('addSignatureToPDF', {
          fileUrl: tempPdfUrl,
          signatureImageUrl: sig.imageUrl,
          x: sig.pdfCoords.x,
          y: sig.pdfCoords.y,
          width: sig.pdfCoords.width,
          height: effectiveSignatureHeight * (pdfDimensions.height / pdfViewBox.height), // Use saved PDF coordinates and re-calculate height
          pageNumber: sig.pageNumber
        });

        if (response.data?.success) {
          tempPdfUrl = `data:application/pdf;base64,${response.data.pdfBase64}`;
        } else {
          throw new Error(response.data?.error || `فشل إعادة بناء العنصر ${sig.id}`);
        }
      }

      setAddedSignatures(remainingSignatures);
      setCurrentPdfUrl(remainingSignatures.length > 0 ? tempPdfUrl : null);
      
      if (remainingSignatures.length === 0) {
          loadPagePreview(); 
      }
      
      alert('تم حذف العنصر وإعادة بناء الملف بنجاح.');

    } catch (error) {
      console.error('Error rebuilding PDF after element removal:', error);
      alert(`حدث خطأ أثناء حذف وإعادة بناء العناصر:\n${error.message}`);
    } finally {
      setIsSigning(false);
    }
  };

  const handleConfirmSignature = () => {
    setSignedPdf(previewSignedPdf);
    setShowPreviewDialog(false);
    
    if (onComplete) {
      onComplete(previewSignedPdf);
    }
    
    alert('✅ تم تأكيد العنصر بنجاح!');
  };

  const handleCancelPreview = () => {
    setPreviewSignedPdf(null);
    setShowPreviewDialog(false);
  };

  const handleDownloadSigned = () => {
    if (!signedPdf) return;
    
    try {
      const binaryString = atob(signedPdf.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${signedPdf.filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('حدث خطأ أثناء التحميل');
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setSignedPdf(null);
    setPagePreview(null);
    setSignatureImage(null);
    setPreviewSignedPdf(null);
    setShowPreviewDialog(false);
    setSignaturePosition({ x: 100, y: 100 });
    setSignatureSize(150);
    setPageNumber(1);
    setTotalPages(0);
    setTypedText('');
    setDrawingColor('#000000');
    setLineWidth(2);
    setLineStyle('solid');
    setFontFamily('Dancing Script');
    setTextColor('#000000');
    setFontSize(48);

    setShowGrid(true);
    setSnapToGrid(true);
    setGridSize(20);
    setShowAlignmentGuides(true);
    setAlignmentGuides({ vertical: [], horizontal: [] });
    setSavedPositions([]);
    setPdfDimensions({ width: 595, height: 842 });
    setPdfViewBox(null);
    setAddedSignatures([]);
    setCurrentPdfUrl(null);

    // NEW: Reset for new features
    setPageThumbnails([]);
    setShowPageSelector(false);
    setElementType('signature');
    setSelectedStamp(null);
    setCustomStamps([]);
    setBatchMode(false);
    setBatchFiles([]);
    setBatchProgress(0);
    setIsBatchProcessing(false);

    if (canvasRef.current) {
      clearCanvas();
    }
  };

  // NEW: Function to load all page thumbnails for the selector
  const loadPageThumbnails = async () => {
    if (!uploadedFile?.url || pageThumbnails.length > 0) return; // Prevent re-fetching if already loaded
    
    try {
      const response = await base44.functions.invoke('getPDFThumbnails', {
        fileUrl: uploadedFile.url,
        pageNumbers: Array.from({ length: totalPages }, (_, i) => i + 1) // Request all page thumbnails
      });

      if (response.data?.success && response.data.thumbnails) {
        setPageThumbnails(response.data.thumbnails);
      }
    } catch (error) {
      console.error('Error loading page thumbnails:', error);
      alert('فشل تحميل صور مصغرة للصفحات.');
    }
  };

  // NEW: Function to generate an image from a built-in stamp
  const generateStampImage = async (stamp) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200; // Fixed size for stamp generation
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Transparent background
    
    // Draw circle border (optional, can be customized)
    ctx.beginPath();
    ctx.arc(100, 100, 80, 0, 2 * Math.PI);
    ctx.strokeStyle = stamp.color;
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Draw emoji
    ctx.font = '50px Arial'; // Or a font that supports emojis
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stamp.emoji, 100, 75); // Slightly adjust y for emoji
    
    // Draw text
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = stamp.color;
    ctx.fillText(stamp.name, 100, 125); // Slightly adjust y for text
    
    return canvas.toDataURL('image/png');
  };

  // NEW: Handler for selecting a built-in stamp
  const handleSelectStamp = async (stamp) => {
    setSelectedStamp(stamp);
    const stampImage = await generateStampImage(stamp);
    setSignatureImage(stampImage);
    setElementType('stamp');
    setSignatureSize(100); // Default stamp size
    alert(`تم تحديد الختم "${stamp.name}"`);
  };

  // NEW: Handler for uploading a custom stamp image
  const handleUploadCustomStamp = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('الرجاء اختيار صورة (PNG, JPG, SVG)');
      return;
    }

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      const newStamp = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: result.file_url,
        custom: true
      };
      setCustomStamps(prev => [...prev, newStamp]);
      setSignatureImage(result.file_url);
      setElementType('custom');
      setSignatureSize(150); // Default custom stamp size
      alert('تم رفع الختم المخصص بنجاح');
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الختم');
    }
  };

  // NEW: Handler for batch file upload
  const handleBatchFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      alert('الرجاء اختيار ملفات PDF فقط');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedList = [];
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedList.push({
          id: Date.now() + i,
          name: file.name,
          url: result.file_url,
          size: file.size,
          processed: false,
          downloadUrl: null // To store the URL of the processed file
        });
        setUploadProgress(((i + 1) / pdfFiles.length) * 100);
      }

      setBatchFiles(uploadedList);
      alert(`تم رفع ${uploadedList.length} ملف بنجاح`);
      // When batch files are uploaded, ensure we have pdf dimensions for calculations.
      // We can use the first file to get general PDF dimensions.
      if (uploadedList.length > 0 && (!pdfDimensions.width || !pdfDimensions.height)) {
        const response = await base44.functions.invoke('getPDFThumbnails', {
            fileUrl: uploadedList[0].url,
            pageNumbers: [1] // Just need page info, not actual thumbnails
        });
        if (response.data?.success && response.data.pageWidth && response.data.pageHeight) {
            setPdfDimensions({ width: response.data.pageWidth, height: response.data.pageHeight });
            setTotalPages(response.data.totalPages || 0); // This totalPages would be for the first file, might vary for others. For batch, we assume consistent dimensions/pages are handled by user.
        }
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملفات');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // NEW: Handler for batch processing
  const handleBatchProcess = async () => {
    if (batchFiles.length === 0) {
      alert('الرجاء رفع ملفات PDF للمعالجة الجماعية');
      return;
    }

    if (!signatureImage) {
      alert('الرجاء إضافة توقيع أو ختم أولاً');
      return;
    }

    if (!pdfViewBox) {
        alert('المعاينة غير جاهزة لتقدير الموضع. الرجاء التأكد من وجود ملف PDF واحد على الأقل في المعاينة الفردية أولاً لتحديد الأبعاد.');
        return;
    }

    setIsBatchProcessing(true);
    setBatchProgress(0);

    let updatedBatchFiles = [...batchFiles];
    
    try {
      for (let i = 0; i < updatedBatchFiles.length; i++) {
        const file = updatedBatchFiles[i];
        
        try {
          // Calculate signature position based on current settings and PDF dimensions
          const sigXInPdf = signaturePosition.x - pdfViewBox.x;
          const sigYInPdf = signaturePosition.y - pdfViewBox.y;
          
          const effectiveSignatureHeight = signatureSize * (elementType === 'stamp' || elementType === 'custom' ? 1 : 0.5);

          // We use the pdfDimensions obtained from the first PDF or the single mode PDF for scaling.
          // This assumes all batch PDFs have similar aspect ratios and dimensions.
          const scaleX = pdfDimensions.width / pdfViewBox.width;
          const scaleY = pdfDimensions.height / pdfViewBox.height;

          const pdfX = sigXInPdf * scaleX;
          const pdfY = sigYInPdf * scaleY;
          const pdfWidth = signatureSize * scaleX;
          const pdfHeight = effectiveSignatureHeight * scaleY;

          const response = await base44.functions.invoke('addSignatureToPDF', {
            fileUrl: file.url,
            signatureImageUrl: signatureImage,
            x: pdfX,
            y: pdfY,
            width: pdfWidth,
            height: pdfHeight,
            pageNumber: pageNumber // Apply to the selected page number
          });

          if (response.data?.success) {
            updatedBatchFiles[i] = {
                ...file,
                processed: true,
                downloadUrl: `data:application/pdf;base64,${response.data.pdfBase64}`
            };
          } else {
            updatedBatchFiles[i] = {
                ...file,
                processed: false,
                error: response.data?.error || 'فشل المعالجة'
            };
          }
        } catch (fileError) {
          console.error(`Error processing ${file.name}:`, fileError);
          updatedBatchFiles[i] = {
            ...file,
            processed: false,
            error: fileError.message
          };
        }

        setBatchFiles([...updatedBatchFiles]); // Update state to show progress for each file
        setBatchProgress(((i + 1) / updatedBatchFiles.length) * 100);
      }

      const successCount = updatedBatchFiles.filter(r => r.processed).length;
      const failCount = updatedBatchFiles.filter(r => !r.processed).length;
      
      alert(`✅ اكتملت المعالجة الجماعية!\n\nنجح: ${successCount}\nفشل: ${failCount}\n\nانقر "تحميل الكل" لتحميل الملفات الموقعة.`);
      
    } catch (error) {
      console.error('Batch processing error:', error);
      alert(`حدث خطأ أثناء المعالجة الجماعية:\n${error.message}`);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // NEW: Handler for downloading all processed batch files
  const handleDownloadAllBatch = () => {
    const processedFiles = batchFiles.filter(f => f.processed && f.downloadUrl);
    
    if (processedFiles.length === 0) {
      alert('لا توجد ملفات تمت معالجتها للتحميل');
      return;
    }

    processedFiles.forEach((file) => {
      try {
        const binaryString = atob(file.downloadUrl.replace('data:application/pdf;base64,', ''));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `signed_${file.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(`Error downloading ${file.name}:`, error);
        alert(`حدث خطأ أثناء تحميل ملف ${file.name}`);
      }
    });
    alert(`بدء تحميل ${processedFiles.length} ملفات موقعة.`);
  };

  return (
    <>
      {/* NEW: Root Tabs for Single vs Batch Mode */}
      <Tabs value={batchMode ? 'batch' : 'single'} onValueChange={(v) => setBatchMode(v === 'batch')} className="mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">توقيع فردي</TabsTrigger>
          <TabsTrigger value="batch">معالجة جماعية</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-4"> {/* Added mt-4 for spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-purple-600" />
                  إضافة العنصر الرقمي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* PDF Upload */}
                <div className="space-y-2">
                  <Label>1. رفع ملف PDF</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      id="pdf-upload-sign"
                      disabled={isUploading || isSigning || batchMode} // Disable if in batch mode
                    />
                    <label htmlFor="pdf-upload-sign" className="cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        اضغط لاختيار ملف PDF
                      </p>
                    </label>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-xs text-center">{Math.round(uploadProgress)}%</p>
                    </div>
                  )}

                  {uploadedFile && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileSignature className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{uploadedFile.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="h-6 w-6 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* NEW: Element Type Selection - wrapped existing signature options */}
                {uploadedFile && (
                  <div className="space-y-2">
                    <Label>2. اختيار نوع العنصر</Label>
                    <Tabs value={elementType} onValueChange={setElementType} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="signature">
                          <Pen className="w-4 h-4 ml-1" />
                          توقيع
                        </TabsTrigger>
                        <TabsTrigger value="stamp">
                          <Stamp className="w-4 h-4 ml-1" />
                          ختم
                        </TabsTrigger>
                        <TabsTrigger value="custom">
                          <Layers className="w-4 h-4 ml-1" />
                          مخصص
                        </TabsTrigger>
                      </TabsList>

                      {/* Existing Signature Tabs (Draw, Type, Upload Image) */}
                      <TabsContent value="signature" className="mt-3">
                        <Tabs value={signatureMode} onValueChange={setSignatureMode} className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="draw" className="gap-2">
                              <Pen className="w-4 h-4" />
                              رسم
                            </TabsTrigger>
                            <TabsTrigger value="type" className="gap-2">
                              <Type className="w-4 h-4" />
                              كتابة
                            </TabsTrigger>
                            <TabsTrigger value="upload" className="gap-2">
                              <ImageIcon className="w-4 h-4" />
                              رفع صورة
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="draw" className="space-y-3 mt-3">
                            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">لون الخط</Label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={drawingColor}
                                      onChange={(e) => setDrawingColor(e.target.value)}
                                      className="w-10 h-10 rounded cursor-pointer"
                                    />
                                    <Input
                                      type="text"
                                      value={drawingColor}
                                      onChange={(e) => setDrawingColor(e.target.value)}
                                      className="flex-1 text-xs"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <Label className="text-xs">نمط الخط</Label>
                                  <Select value={lineStyle} onValueChange={setLineStyle}>
                                    <SelectTrigger className="h-10 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="solid">متصل ━━━</SelectItem>
                                      <SelectItem value="dashed">متقطع ╍╍╍</SelectItem>
                                      <SelectItem value="dotted">منقط ┄┄┄</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">سمك الخط: {lineWidth}px</Label>
                                <Slider
                                  value={[lineWidth]}
                                  onValueChange={(value) => setLineWidth(value[0])}
                                  min={1}
                                  max={10}
                                  step={1}
                                />
                              </div>
                            </div>

                            <div className="border-2 border-gray-300 rounded-lg bg-white">
                              <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                className="w-full cursor-crosshair"
                                style={{ touchAction: 'none' }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={clearCanvas}
                                className="flex-1"
                              >
                                <Eraser className="w-4 h-4 ml-2" />
                                مسح
                              </Button>
                              <Button
                                size="sm"
                                onClick={saveDrawnSignature}
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                              >
                                <Save className="w-4 h-4 ml-2" />
                                حفظ التوقيع
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="type" className="space-y-3 mt-3">
                            <div className="space-y-3">
                              <div>
                                <Label>نص التوقيع</Label>
                                <Input
                                  value={typedText}
                                  onChange={(e) => setTypedText(e.target.value)}
                                  placeholder="اكتب اسمك هنا"
                                  className="text-lg"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">نوع الخط</Label>
                                  <Select value={fontFamily} onValueChange={setFontFamily}>
                                    <SelectTrigger className="text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Dancing Script" style={{ fontFamily: 'Dancing Script' }}>
                                        Dancing Script
                                      </SelectItem>
                                      <SelectItem value="Brush Script MT" style={{ fontFamily: 'Brush Script MT' }}>
                                        Brush Script
                                      </SelectItem>
                                      <SelectItem value="Lucida Handwriting" style={{ fontFamily: 'Lucida Handwriting' }}>
                                        Lucida Handwriting
                                      </SelectItem>
                                      <SelectItem value="Courier New" style={{ fontFamily: 'Courier New' }}>
                                        Courier New
                                      </SelectItem>
                                      <SelectItem value="Arial" style={{ fontFamily: 'Arial' }}>
                                        Arial
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label className="text-xs">لون النص</Label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={textColor}
                                      onChange={(e) => setTextColor(e.target.value)}
                                      className="w-10 h-10 rounded cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs">حجم الخط: {fontSize}px</Label>
                                <Slider
                                  value={[fontSize]}
                                  onValueChange={(value) => setFontSize(value[0])}
                                  min={24}
                                  max={96}
                                  step={4}
                                />
                              </div>

                              {typedText && (
                                <div className="border-2 border-gray-300 rounded-lg bg-white p-6 text-center min-h-[150px] flex items-center justify-center">
                                  <div
                                    style={{
                                      fontFamily: fontFamily,
                                      color: textColor,
                                      fontSize: `${fontSize}px`,
                                    }}
                                  >
                                    {typedText}
                                  </div>
                                </div>
                              )}

                              <Button
                                onClick={generateTypedSignature}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                disabled={!typedText.trim()}
                              >
                                <Type className="w-4 h-4 ml-2" />
                                إنشاء التوقيع
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="upload" className="space-y-3 mt-3">
                            <Alert className="bg-blue-50 border-blue-200">
                              <Info className="h-4 w-4 text-blue-600" />
                              <AlertDescription className="text-xs text-blue-800">
                                💡 سيتم إزالة الخلفية تلقائياً. يدعم PNG, JPG, WEBP, GIF
                              </AlertDescription>
                            </Alert>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                onChange={handleSignatureImageUpload}
                                className="hidden"
                                id="signature-upload"
                              />
                              <label htmlFor="signature-upload" className="cursor-pointer">
                                <ImageIcon className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  رفع صورة التوقيع
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  PNG, JPG, WEBP, GIF
                                </p>
                              </label>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </TabsContent>

                      {/* NEW: Built-in Stamps Tab */}
                      <TabsContent value="stamp" className="mt-3">
                        <div className="space-y-3">
                          <Label>الأختام الجاهزة</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {BUILT_IN_STAMPS.map(stamp => (
                              <Button
                                key={stamp.id}
                                variant={selectedStamp?.id === stamp.id ? 'default' : 'outline'}
                                className="h-auto py-3 flex flex-col items-center justify-center text-center"
                                onClick={() => handleSelectStamp(stamp)}
                                style={{ borderColor: selectedStamp?.id === stamp.id ? stamp.color : '' }}
                              >
                                <span className="text-2xl">{stamp.emoji}</span>
                                <span className="text-xs">{stamp.name}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      {/* NEW: Custom Stamps Tab */}
                      <TabsContent value="custom" className="mt-3">
                        <div className="space-y-3">
                          <Label>رفع ختم مخصص</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml"
                              onChange={handleUploadCustomStamp}
                              className="hidden"
                              id="custom-stamp-upload"
                            />
                            <label htmlFor="custom-stamp-upload" className="cursor-pointer">
                              <Stamp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-600">
                                رفع صورة ختم
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, SVG
                              </p>
                            </label>
                          </div>

                          {customStamps.length > 0 && (
                            <div className="space-y-2">
                              <Label>الأختام المخصصة</Label>
                              <div className="grid grid-cols-2 gap-2">
                                {customStamps.map(stamp => (
                                  <Button
                                    key={stamp.id}
                                    variant={signatureImage === stamp.url ? 'default' : 'outline'}
                                    className="h-20 flex items-center justify-center p-2"
                                    onClick={() => {
                                      setSignatureImage(stamp.url);
                                      setElementType('custom');
                                      setSignatureSize(150); // Default custom stamp size
                                    }}
                                  >
                                    <img src={stamp.url} alt={stamp.name} className="max-h-full max-w-full object-contain" />
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Unified signature/stamp image preview */}
                    {signatureImage && (
                      <div className="relative border-2 border-green-200 rounded-lg bg-green-50 p-2">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">
                            تم تحديد العنصر ({elementType === 'signature' ? 'توقيع' : (elementType === 'stamp' ? 'ختم جاهز' : 'ختم مخصص')})
                          </span>
                        </div>
                        <img 
                          src={signatureImage} 
                          alt="Selected element" 
                          className="max-w-full h-auto max-h-32 object-contain mx-auto"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSignatureImage(null)} // Allow clearing the selected image
                          className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* NEW: Page Selection with Thumbnails */}
                {uploadedFile && signatureImage && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>3. اختيار الصفحة</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowPageSelector(!showPageSelector);
                          if (!showPageSelector && pageThumbnails.length === 0 && totalPages > 0) {
                            loadPageThumbnails(); // Load all thumbnails only if selector is opened and not already loaded
                          }
                        }}
                      >
                        <Layers className="w-4 h-4 ml-2" />
                        {showPageSelector ? 'إخفاء' : 'عرض'} الصفحات ({totalPages})
                      </Button>
                    </div>

                    {showPageSelector && (
                      <div className="border rounded-lg p-3 max-h-64 overflow-y-auto bg-gray-50">
                        {pageThumbnails.length === 0 && totalPages > 0 ? (
                          <div className="text-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                            <p className="text-xs text-gray-600">جاري تحميل الصفحات...</p>
                          </div>
                        ) : pageThumbnails.length === 0 && totalPages === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-xs text-gray-600">لا توجد صفحات متاحة.</p>
                            </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {pageThumbnails.map((thumb) => (
                              <button
                                key={thumb.pageNumber}
                                onClick={() => {
                                    setPageNumber(thumb.pageNumber);
                                    setShowPageSelector(false); // Close selector after choosing page
                                }}
                                className={`relative group border-2 rounded overflow-hidden transition-all ${
                                  pageNumber === thumb.pageNumber
                                    ? 'border-purple-500 ring-2 ring-purple-300'
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                              >
                                {/* Thumbnail is an iframe showing a single page PDF */}
                                <div className="aspect-[3/4] bg-white"> {/* Aspect ratio for common PDF pages */}
                                    <iframe
                                      src={thumb.pdfDataUrl}
                                      className="w-full h-full pointer-events-none"
                                      title={`صفحة ${thumb.pageNumber}`}
                                      scrolling="no"
                                    />
                                </div>
                                <Badge
                                  className={`absolute bottom-1 left-1 right-1 text-center text-[10px] ${
                                    pageNumber === thumb.pageNumber
                                      ? 'bg-purple-600'
                                      : 'bg-gray-600'
                                  }`}
                                >
                                  {thumb.pageNumber}
                                </Badge>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-xs">رقم الصفحة {totalPages > 0 && `(من ${totalPages})`}</Label>
                      <Input
                        type="number"
                        min="1"
                        max={totalPages || 999}
                        value={pageNumber}
                        onChange={(e) => setPageNumber(Math.min(parseInt(e.target.value) || 1, totalPages || 999))}
                        className="text-sm"
                      />
                    </div>

                    {/* Position and Size settings */}
                    <Label>4. ضبط الموضع والحجم</Label>
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Grid3x3 className="w-4 h-4 text-blue-600" />
                            <Label className="text-xs">عرض الشبكة</Label>
                          </div>
                          <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Magnet className="w-4 h-4 text-purple-600" />
                            <Label className="text-xs">الالتصاق بالشبكة</Label>
                          </div>
                          <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
                        </div>

                        {showGrid && (
                          <div className="space-y-1">
                            <Label className="text-xs">حجم الشبكة: {gridSize}px</Label>
                            <Slider
                              value={[gridSize]}
                              onValueChange={(value) => setGridSize(value[0])}
                              min={10}
                              max={50}
                              step={5}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <Label className="text-xs">أدلة المحاذاة</Label>
                          </div>
                          <Switch checked={showAlignmentGuides} onCheckedChange={setShowAlignmentGuides} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Preset Positions */}
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-2">
                        <Bookmark className="w-3 h-3" />
                        مواضع سريعة
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESET_POSITIONS.map((preset) => (
                          <Button
                            key={preset.id}
                            variant="outline"
                            size="sm"
                            onClick={() => applyPresetPosition(preset)}
                            className="text-xs h-auto py-2 flex flex-col items-center gap-1"
                          >
                            <span className="text-lg">{preset.icon}</span>
                            <span className="text-[10px]">{preset.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Saved Positions */}
                    {savedPositions.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs">المواضع المحفوظة</Label>
                        <div className="space-y-1">
                          {savedPositions.map((pos) => (
                            <div key={pos.id} className="flex items-center gap-2 bg-amber-50 rounded p-2 border border-amber-200">
                              <span className="text-sm">{pos.icon}</span>
                              <span className="text-xs flex-1">{pos.name}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => applyPresetPosition(pos)}
                              >
                                <MapPin className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-600"
                                onClick={() => deletePosition(pos.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveCurrentPosition}
                      className="w-full text-xs"
                    >
                      <Bookmark className="w-3 h-3 ml-2" />
                      حفظ الموضع الحالي
                    </Button>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Move className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-xs text-blue-800">
                        💡 اسحب العنصر على المعاينة أو استخدم الشرائح للضبط الدقيق
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label className="text-xs">حجم العنصر</Label>
                      <Slider
                        value={[signatureSize]}
                        onValueChange={(value) => setSignatureSize(value[0])}
                        min={50}
                        max={300}
                        step={5}
                      />
                      <p className="text-xs text-gray-500">{signatureSize} بكسل</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">الموضع الأفقي (X)</Label>
                      <Slider
                        value={[signaturePosition.x]}
                        onValueChange={(value) => {
                          const newX = value[0];
                          let targetX = newX;
                          if (pdfViewBox) {
                            targetX = Math.max(pdfViewBox.x, Math.min(newX, pdfViewBox.x + pdfViewBox.width - signatureSize));
                          }
                          const newPos = snapPosition({ x: targetX, y: signaturePosition.y });
                          checkAlignment(newPos);
                          setSignaturePosition(newPos);
                        }}
                        min={pdfViewBox ? pdfViewBox.x : 0}
                        max={pdfViewBox ? pdfViewBox.x + pdfViewBox.width - signatureSize : 500}
                        step={snapToGrid ? gridSize : 1}
                      />
                      <p className="text-xs text-gray-500">{Math.round(signaturePosition.x)} بكسل</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">الموضع العمودي (Y)</Label>
                      <Slider
                        value={[signaturePosition.y]}
                        onValueChange={(value) => {
                          const newY = value[0];
                          let targetY = newY;
                          const effectiveSignatureHeight = signatureSize * (elementType === 'stamp' || elementType === 'custom' ? 1 : 0.5);
                          if (pdfViewBox) {
                            targetY = Math.max(pdfViewBox.y, Math.min(newY, pdfViewBox.y + pdfViewBox.height - effectiveSignatureHeight));
                          }
                          const newPos = snapPosition({ x: signaturePosition.x, y: targetY });
                          checkAlignment(newPos);
                          setSignaturePosition(newPos);
                        }}
                        min={pdfViewBox ? pdfViewBox.y : 0}
                        max={pdfViewBox ? pdfViewBox.y + pdfViewBox.height - (signatureSize * 0.5) : 600}
                        step={snapToGrid ? gridSize : 1}
                      />
                      <p className="text-xs text-gray-500">{Math.round(signaturePosition.y)} بكسل</p>
                    </div>

                    <Button
                      onClick={handleAddSignature}
                      disabled={isSigning}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      {isSigning ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جاري الإضافة...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 ml-2" />
                          إضافة {elementType === 'signature' ? 'توقيع' : 'ختم'}
                        </>
                      )}
                    </Button>

                    {addedSignatures.length > 0 && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm text-green-800">
                          <strong>تم إضافة {addedSignatures.length} عنصر/عناصر</strong>
                          <div className="mt-2 space-y-1">
                            {addedSignatures.map((sig, idx) => (
                              <div key={sig.id} className="flex items-center justify-between text-xs bg-white rounded p-1">
                                <span>#{idx + 1} - صفحة {sig.pageNumber} ({sig.type === 'signature' ? 'توقيع' : (sig.type === 'stamp' ? 'ختم' : 'مخصص')})</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 text-red-600"
                                  onClick={() => handleRemoveSignature(sig.id)}
                                  disabled={isSigning}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {addedSignatures.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveTemporary}
                          variant="outline"
                          className="flex-1"
                          disabled={isSigning}
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          معاينة وحفظ مؤقت
                        </Button>
                        <Button
                          onClick={handleFinalSave}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          disabled={isSigning}
                        >
                          <Save className="w-4 h-4 ml-2" />
                          حفظ نهائي
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{signedPdf ? 'الملف الموقّع' : 'معاينة مباشرة'}</span>
                  {addedSignatures.length > 0 && (
                    <Badge className="bg-green-600 text-white">
                      {addedSignatures.length} عنصر مضاف
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {signedPdf ? (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="flex items-center justify-between">
                        <div>
                          <strong className="text-green-900">{signedPdf.message}</strong>
                          <p className="text-sm text-green-700 mt-1">
                            تم إضافة العنصر الرقمي بنجاح إلى الملف
                          </p>
                        </div>
                        <Button
                          onClick={handleDownloadSigned}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="w-4 h-4 ml-2" />
                          تحميل
                        </Button>
                      </AlertDescription>
                    </Alert>

                    <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Shield className="w-8 h-8 text-purple-600" />
                          <div>
                            <h3 className="font-semibold text-purple-900">ملف PDF موقّع رقمياً</h3>
                            <p className="text-sm text-purple-700">تم إضافة العنصر بأمان</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-purple-800">
                          <p>📄 اسم الملف: {signedPdf.filename}.pdf</p>
                          <p>📍 الموضع: X: {Math.round(signaturePosition.x)}px, Y: {Math.round(signaturePosition.y)}px</p>
                          <p>📏 الحجم: {signatureSize}px</p>
                          <p>📑 رقم الصفحة: {pageNumber}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : uploadedFile && (signatureImage || addedSignatures.length > 0) && (pagePreview || currentPdfUrl) ? (
                  <div className="flex-1 flex flex-col space-y-3">
                    <Alert className="bg-purple-50 border-purple-200">
                      <Info className="h-4 w-4 text-purple-600" />
                      <AlertDescription className="text-xs text-purple-800">
                        <strong>معاينة دقيقة:</strong> المنطقة المحددة تمثل حدود الصفحة الفعلية. ضع العنصر داخلها فقط.
                        {snapToGrid && <span className="block mt-1">🧲 الالتصاق بالشبكة مفعّل</span>}
                        {showAlignmentGuides && <span className="block mt-1">📏 أدلة المحاذاة مفعّلة</span>}
                        {addedSignatures.length > 0 && (
                          <span className="block mt-1 text-green-700 font-semibold">
                            ✓ {addedSignatures.length} عنصر/عناصر مضافة. يمكنك إضافة المزيد أو الحفظ.
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>

                    <div 
                      ref={previewRef}
                      className="relative bg-gray-100 border-2 border-purple-300 rounded-lg overflow-hidden shadow-lg flex-1"
                      style={{ 
                        minHeight: '700px'
                      }}
                      onMouseMove={handleSignatureDrag}
                      onMouseUp={handleSignatureDragEnd}
                      onMouseLeave={handleSignatureDragEnd}
                    >
                      {isLoadingPreview ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        </div>
                      ) : (
                        <>
                          {pdfViewBox && (
                            <div
                              className="absolute border-4 border-red-500 border-dashed pointer-events-none"
                              style={{
                                left: `${pdfViewBox.x}px`,
                                top: `${pdfViewBox.y}px`,
                                width: `${pdfViewBox.width}px`,
                                height: `${pdfViewBox.height}px`,
                                zIndex: 0
                              }}
                            >
                              <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                منطقة PDF الفعلية - ضع العنصر هنا
                              </div>
                            </div>
                          )}

                          <iframe
                            src={currentPdfUrl || pagePreview}
                            className="absolute inset-0 w-full h-full pointer-events-none border-0"
                            title={`صفحة ${pageNumber}`}
                          />
                          
                          {/* Grid Overlay */}
                          {showGrid && pdfViewBox && (
                            <svg 
                              className="absolute pointer-events-none" 
                              style={{ 
                                left: `${pdfViewBox.x}px`,
                                top: `${pdfViewBox.y}px`,
                                width: `${pdfViewBox.width}px`,
                                height: `${pdfViewBox.height}px`,
                                zIndex: 1 
                              }}
                            >
                              <defs>
                                <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                                  <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(147, 51, 234, 0.1)" strokeWidth="0.5" />
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                          )}

                          {/* Alignment Guides */}
                          {showAlignmentGuides && pdfViewBox && (
                            <svg 
                              className="absolute pointer-events-none" 
                              style={{ 
                                left: `${pdfViewBox.x}px`,
                                top: `${pdfViewBox.y}px`,
                                width: `${pdfViewBox.width}px`,
                                height: `${pdfViewBox.height}px`,
                                zIndex: 2 
                              }}
                            >
                              {alignmentGuides.vertical.map((x, i) => (
                                <line
                                  key={`v-${i}`}
                                  x1={x - pdfViewBox.x}
                                  y1="0"
                                  x2={x - pdfViewBox.x}
                                  y2="100%"
                                  stroke="rgb(59, 130, 246)"
                                  strokeWidth="2"
                                  strokeDasharray="5,5"
                                  opacity="0.7"
                                />
                              ))}
                              {alignmentGuides.horizontal.map((y, i) => (
                                <line
                                  key={`h-${i}`}
                                  x1="0"
                                  y1={y - pdfViewBox.y}
                                  x2="100%"
                                  y2={y - pdfViewBox.y}
                                  stroke="rgb(59, 130, 246)"
                                  strokeWidth="2"
                                  strokeDasharray="5,5"
                                  opacity="0.7"
                                />
                              ))}
                            </svg>
                          )}

                          {/* Added elements (signatures/stamps) */}
                          {addedSignatures.map((sig) => (
                            sig.pageNumber === pageNumber && (
                              <div
                                key={sig.id}
                                className="absolute pointer-events-none opacity-50"
                                style={{
                                  left: `${sig.position.x}px`,
                                  top: `${sig.position.y}px`,
                                  width: `${sig.size}px`,
                                  height: `${sig.size * (sig.type === 'stamp' || sig.type === 'custom' ? 1 : 0.5)}px`,
                                  zIndex: 2
                                }}
                              >
                                <img
                                  src={sig.imageUrl}
                                  alt="توقيع مضاف"
                                  className="w-full h-full object-contain border border-green-400 rounded"
                                />
                              </div>
                            )
                          ))}
                          
                          {/* Current element (signature/stamp) */}
                          {signatureImage && (
                            <div
                              className="absolute cursor-move hover:ring-4 hover:ring-purple-400 transition-all"
                              style={{
                                left: `${signaturePosition.x}px`,
                                top: `${signaturePosition.y}px`,
                                width: `${signatureSize}px`,
                                height: `${signatureSize * (elementType === 'stamp' || elementType === 'custom' ? 1 : 0.5)}px`,
                                zIndex: 3
                              }}
                              onMouseDown={handleSignatureDragStart}
                            >
                              <img
                                src={signatureImage}
                                alt="Signature/Stamp Preview"
                                className="w-full h-full object-contain border-2 border-purple-500 rounded bg-white/80 backdrop-blur-sm"
                                draggable={false}
                              />
                              <div className="absolute -top-6 left-0 right-0 text-center">
                                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded shadow-lg flex items-center justify-center gap-1">
                                  <Move className="w-3 h-3" />
                                  اسحب لتحريك
                                </span>
                              </div>
                              <div className="absolute -bottom-6 left-0 right-0 text-center">
                                <Badge variant="secondary" className="text-[10px]">
                                  X: {Math.round(signaturePosition.x)} | Y: {Math.round(signaturePosition.y)}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                          <span className="text-purple-900 font-medium">معاينة دقيقة بحدود واضحة</span>
                        </div>
                        <span className="text-purple-700">الصفحة {pageNumber} من {totalPages}</span>
                      </div>
                    </div>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-gray-500">
                    <FileSignature className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">جاهز لإضافة عنصر</p>
                    <p className="text-sm">قم بإضافة توقيع أو ختم لرؤية المعاينة المباشرة</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-gray-500">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">ابدأ بإضافة العناصر</p>
                    <p className="text-sm">ارفع ملف PDF لإضافة توقيعك الرقمي أو الأختام</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* NEW: Batch Processing Tab Content */}
        <TabsContent value="batch" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="w-5 h-5 text-blue-600" />
                  المعالجة الجماعية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-800">
                    قم برفع عدة ملفات PDF وسيتم إضافة نفس العنصر (توقيع/ختم) لجميع الملفات في نفس الموضع والصفحة المحددة.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>1. رفع ملفات PDF متعددة</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleBatchFileUpload}
                      className="hidden"
                      id="batch-pdf-upload"
                      disabled={isUploading || isBatchProcessing}
                    />
                    <label htmlFor="batch-pdf-upload" className="cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600">اختر ملفات PDF متعددة</p>
                    </label>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-xs text-center">{Math.round(uploadProgress)}%</p>
                    </div>
                  )}

                  {batchFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>الملفات المرفوعة ({batchFiles.length})</Label>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {batchFiles.map(file => (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between p-2 rounded text-xs ${
                              file.processed
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <span className="truncate flex-1">{file.name}</span>
                            {file.processed && (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>2. العنصر المحدد وتكوينه</Label>
                  <p className="text-xs text-gray-600">
                    يتم تطبيق العنصر المحدد حاليًا من وضع "التوقيع الفردي" على جميع الملفات. تأكد من تحديد توقيع/ختم وتكوينه بشكل صحيح هناك.
                  </p>
                  
                  {signatureImage ? (
                    <div className="border-2 border-green-200 rounded-lg p-3 bg-green-50">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          العنصر المحدد: {elementType === 'signature' ? 'توقيع' : (elementType === 'stamp' ? 'ختم جاهز' : 'ختم مخصص')}
                        </span>
                      </div>
                      <img
                        src={signatureImage}
                        alt="Selected element"
                        className="max-h-20 mx-auto border rounded object-contain"
                      />
                      <p className="text-xs text-gray-700 text-center mt-2">
                        الموضع: X: {Math.round(signaturePosition.x)}, Y: {Math.round(signaturePosition.y)} | الحجم: {signatureSize}px | صفحة: {pageNumber}
                      </p>
                    </div>
                  ) : (
                    <Alert className="bg-orange-50 border-orange-200">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-xs text-orange-800">
                        الرجاء تحديد توقيع أو ختم في وضع "التوقيع الفردي" أولاً.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {isBatchProcessing && (
                  <div className="space-y-2">
                    <Label>جاري المعالجة...</Label>
                    <Progress value={batchProgress} />
                    <p className="text-xs text-center">{Math.round(batchProgress)}%</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleBatchProcess}
                    disabled={batchFiles.length === 0 || !signatureImage || isBatchProcessing}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {isBatchProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 ml-2" />
                        معالجة الكل
                      </>
                    )}
                  </Button>
                  
                  {batchFiles.some(f => f.processed) && (
                    <Button
                      onClick={handleDownloadAllBatch}
                      variant="outline"
                      className="flex-1"
                      disabled={isBatchProcessing}
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تحميل الكل
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>نتائج المعالجة الجماعية</CardTitle>
              </CardHeader>
              <CardContent>
                {batchFiles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Copy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">ابدأ بالمعالجة الجماعية</p>
                    <p className="text-sm">ارفع ملفات PDF متعددة لتطبيق نفس العنصر عليها جميعاً</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm text-blue-800">
                        <strong>ملخص المعالجة:</strong>
                        <ul className="list-disc pr-4 mt-2 space-y-1 text-xs">
                          <li>إجمالي الملفات: {batchFiles.length}</li>
                          <li>تمت معالجتها بنجاح: {batchFiles.filter(f => f.processed).length}</li>
                          <li>فشلت المعالجة: {batchFiles.filter(f => !f.processed && f.error).length}</li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 gap-3">
                      {batchFiles.map((file, index) => (
                        <div
                          key={file.id}
                          className={`p-4 rounded-lg border-2 ${
                            file.processed
                              ? 'bg-green-50 border-green-200'
                              : file.error
                                ? 'bg-red-50 border-red-200'
                                : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">#{index + 1}</Badge>
                              <div>
                                <p className="font-medium text-sm">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            {file.processed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : file.error ? (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                          {file.error && (
                            <p className="text-xs text-red-700 mt-2">خطأ: {file.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog (remains outside the Tabs, global) */}
      {showPreviewDialog && previewSignedPdf && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                معاينة PDF الموقّع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  تحقق من موضع {elementType === 'signature' ? 'التوقيع' : 'الختم'} قبل الحفظ النهائي. يمكنك إلغاء وتعديل الموضع إذا لزم الأمر.
                </AlertDescription>
              </Alert>

              <div className="border-2 border-purple-300 rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  src={`data:application/pdf;base64,${previewSignedPdf.base64}`}
                  className="w-full h-[600px]"
                  title="معاينة PDF الموقّع"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancelPreview}
                >
                  <X className="w-4 h-4 ml-2" />
                  إلغاء وتعديل الموضع
                </Button>
                <Button
                  onClick={handleConfirmSignature}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  تأكيد وحفظ العنصر
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
