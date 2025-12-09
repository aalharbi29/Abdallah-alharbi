import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Image as ImageIcon, Trash2, Search, Upload, Sparkles, 
  Filter, X, Check, Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ImageLibrary({ onSelectImage, onClose }) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.AnnouncementImage.list('-created_date', 100);
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار ملف صورة');
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.AnnouncementImage.create({
        title: file.name,
        description: 'صورة مرفوعة من المستخدم',
        image_url: uploadResult.file_url,
        source: 'uploaded',
        tags: ['مرفوع']
      });

      loadImages();
      alert('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('فشل في رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    try {
      await base44.entities.AnnouncementImage.delete(id);
      loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('فشل في حذف الصورة');
    }
  };

  const filteredImages = images.filter(img => {
    const searchMatch = !searchQuery ||
      img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const sourceMatch = filterSource === 'all' || img.source === filterSource;

    return searchMatch && sourceMatch;
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            مكتبة الصور
          </DialogTitle>
        </DialogHeader>

        {/* شريط البحث والفلاتر */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="بحث في الصور..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الصور</SelectItem>
              <SelectItem value="generated">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  مولدة بالذكاء الاصطناعي
                </div>
              </SelectItem>
              <SelectItem value="uploaded">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  صور مرفوعة
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <label htmlFor="upload-image">
            <Button variant="outline" disabled={isUploading} asChild>
              <span className="cursor-pointer">
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 ml-2" />
                    رفع صورة
                  </>
                )}
              </span>
            </Button>
          </label>
          <input
            id="upload-image"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {/* شبكة الصور */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
            ))
          ) : filteredImages.length > 0 ? (
            filteredImages.map(img => (
              <div
                key={img.id}
                className="group relative border-2 rounded-lg overflow-hidden hover:border-purple-400 transition-all cursor-pointer"
                onClick={() => onSelectImage(img)}
              >
                <img
                  src={img.image_url}
                  alt={img.title}
                  className="w-full aspect-square object-cover"
                />
                
                {/* طبقة عند التمرير */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectImage(img);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(img.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* شارة المصدر */}
                <div className="absolute top-2 left-2">
                  <Badge className={img.source === 'generated' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                    {img.source === 'generated' ? (
                      <><Sparkles className="w-3 h-3 ml-1" /> AI</>
                    ) : (
                      <><Upload className="w-3 h-3 ml-1" /> مرفوع</>
                    )}
                  </Badge>
                </div>

                {/* معلومات الصورة */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <p className="text-white text-xs truncate">{img.title}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>لا توجد صور في المكتبة</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}