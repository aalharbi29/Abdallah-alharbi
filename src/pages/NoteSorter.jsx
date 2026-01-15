import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Stethoscope, Wrench, Building2, Search, Download, Plus, Minus,
  Loader2, Trash2, FileCode, Printer, FileSpreadsheet, Package,
  CheckCircle2, AlertCircle, Filter, X, Save, List, Upload, FileUp, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// قوائم الأدوات الطبية
const medicalEquipmentList = [
  // أجهزة طبية رئيسية
  { id: 'defibrillator', name: 'جهاز صدمات كهربائية (Defibrillator)', category: 'أجهزة طبية' },
  { id: 'ecg', name: 'جهاز تخطيط القلب (ECG)', category: 'أجهزة طبية' },
  { id: 'suction', name: 'جهاز شفط', category: 'أجهزة طبية' },
  { id: 'nebulizer', name: 'جهاز بخار (Nebulizer)', category: 'أجهزة طبية' },
  { id: 'pulse_oximeter', name: 'جهاز قياس الأكسجين (Pulse Oximeter)', category: 'أجهزة طبية' },
  { id: 'bp_monitor', name: 'جهاز قياس ضغط الدم', category: 'أجهزة طبية' },
  { id: 'bp_monitor_digital', name: 'جهاز قياس ضغط رقمي', category: 'أجهزة طبية' },
  { id: 'bp_monitor_manual', name: 'جهاز قياس ضغط زئبقي', category: 'أجهزة طبية' },
  { id: 'thermometer_digital', name: 'ميزان حرارة رقمي', category: 'أجهزة طبية' },
  { id: 'thermometer_infrared', name: 'ميزان حرارة بالأشعة تحت الحمراء', category: 'أجهزة طبية' },
  { id: 'glucometer', name: 'جهاز قياس السكر', category: 'أجهزة طبية' },
  { id: 'glucometer_strips', name: 'شرائط قياس السكر', category: 'أجهزة طبية' },
  { id: 'infant_scale', name: 'ميزان أطفال', category: 'أجهزة طبية' },
  { id: 'adult_scale', name: 'ميزان بالغين', category: 'أجهزة طبية' },
  { id: 'height_measure', name: 'جهاز قياس الطول', category: 'أجهزة طبية' },
  { id: 'bmi_scale', name: 'ميزان قياس كتلة الجسم', category: 'أجهزة طبية' },
  { id: 'autoclave', name: 'جهاز تعقيم (Autoclave)', category: 'أجهزة طبية' },
  { id: 'centrifuge', name: 'جهاز طرد مركزي', category: 'أجهزة طبية' },
  { id: 'microscope', name: 'مجهر', category: 'أجهزة طبية' },
  { id: 'doppler', name: 'جهاز دوبلر للجنين', category: 'أجهزة طبية' },
  { id: 'ctg', name: 'جهاز تخطيط نبض الجنين (CTG)', category: 'أجهزة طبية' },
  { id: 'spirometer', name: 'جهاز قياس وظائف الرئة', category: 'أجهزة طبية' },
  { id: 'audiometer', name: 'جهاز قياس السمع', category: 'أجهزة طبية' },
  { id: 'vision_chart', name: 'لوحة فحص النظر', category: 'أجهزة طبية' },
  { id: 'snellen_chart', name: 'لوحة سنلن', category: 'أجهزة طبية' },
  { id: 'hba1c', name: 'جهاز قياس السكر التراكمي', category: 'أجهزة طبية' },
  { id: 'cholesterol_meter', name: 'جهاز قياس الكوليسترول', category: 'أجهزة طبية' },
  { id: 'hemoglobin_meter', name: 'جهاز قياس الهيموجلوبين', category: 'أجهزة طبية' },
  { id: 'urine_analyzer', name: 'جهاز تحليل البول', category: 'أجهزة طبية' },
  { id: 'infant_warmer', name: 'جهاز تدفئة الأطفال', category: 'أجهزة طبية' },
  { id: 'phototherapy', name: 'جهاز العلاج الضوئي', category: 'أجهزة طبية' },
  
  // أدوات الفحص
  { id: 'stethoscope', name: 'سماعة طبية', category: 'أدوات الفحص' },
  { id: 'otoscope', name: 'منظار الأذن', category: 'أدوات الفحص' },
  { id: 'ophthalmoscope', name: 'منظار العين', category: 'أدوات الفحص' },
  { id: 'dermatoscope', name: 'منظار الجلد', category: 'أدوات الفحص' },
  { id: 'tongue_depressor', name: 'خافض لسان', category: 'أدوات الفحص' },
  { id: 'reflex_hammer', name: 'مطرقة الانعكاسات', category: 'أدوات الفحص' },
  { id: 'tape_measure', name: 'شريط قياس طبي', category: 'أدوات الفحص' },
  { id: 'pen_light', name: 'قلم ضوئي للفحص', category: 'أدوات الفحص' },
  { id: 'tuning_fork', name: 'شوكة رنانة', category: 'أدوات الفحص' },
  { id: 'nasal_speculum', name: 'منظار أنف', category: 'أدوات الفحص' },
  { id: 'vaginal_speculum', name: 'منظار مهبلي', category: 'أدوات الفحص' },
  { id: 'proctoscope', name: 'منظار شرجي', category: 'أدوات الفحص' },
  
  // أدوات الإسعافات الأولية
  { id: 'emergency_cart', name: 'عربة طوارئ', category: 'إسعافات أولية' },
  { id: 'oxygen_cylinder', name: 'اسطوانة أكسجين', category: 'إسعافات أولية' },
  { id: 'oxygen_regulator', name: 'منظم أكسجين', category: 'إسعافات أولية' },
  { id: 'oxygen_mask', name: 'قناع أكسجين', category: 'إسعافات أولية' },
  { id: 'nasal_cannula', name: 'قنية أنفية', category: 'إسعافات أولية' },
  { id: 'ambu_bag', name: 'جهاز تنفس يدوي (Ambu Bag)', category: 'إسعافات أولية' },
  { id: 'ambu_bag_pediatric', name: 'جهاز تنفس يدوي أطفال', category: 'إسعافات أولية' },
  { id: 'first_aid_kit', name: 'حقيبة إسعافات أولية', category: 'إسعافات أولية' },
  { id: 'stretcher', name: 'نقالة', category: 'إسعافات أولية' },
  { id: 'scoop_stretcher', name: 'نقالة مجرفية', category: 'إسعافات أولية' },
  { id: 'spine_board', name: 'لوح العمود الفقري', category: 'إسعافات أولية' },
  { id: 'wheelchair', name: 'كرسي متحرك', category: 'إسعافات أولية' },
  { id: 'splints', name: 'جبائر', category: 'إسعافات أولية' },
  { id: 'sam_splint', name: 'جبيرة سام', category: 'إسعافات أولية' },
  { id: 'cervical_collar', name: 'طوق رقبة', category: 'إسعافات أولية' },
  { id: 'head_immobilizer', name: 'مثبت رأس', category: 'إسعافات أولية' },
  { id: 'ked', name: 'جهاز استخراج كيندريك', category: 'إسعافات أولية' },
  { id: 'aed', name: 'جهاز الصدمات الآلي (AED)', category: 'إسعافات أولية' },
  { id: 'laryngoscope', name: 'منظار حنجرة', category: 'إسعافات أولية' },
  { id: 'endotracheal_tube', name: 'أنبوب رغامي', category: 'إسعافات أولية' },
  { id: 'airway_oral', name: 'مجرى هوائي فموي', category: 'إسعافات أولية' },
  { id: 'airway_nasal', name: 'مجرى هوائي أنفي', category: 'إسعافات أولية' },
  
  // أدوات التطعيم
  { id: 'vaccine_fridge', name: 'ثلاجة لقاحات', category: 'التطعيمات' },
  { id: 'vaccine_freezer', name: 'فريزر لقاحات', category: 'التطعيمات' },
  { id: 'vaccine_carrier', name: 'حافظة لقاحات', category: 'التطعيمات' },
  { id: 'cold_box', name: 'صندوق تبريد', category: 'التطعيمات' },
  { id: 'ice_pack', name: 'أكياس ثلج', category: 'التطعيمات' },
  { id: 'temp_monitor', name: 'جهاز مراقبة درجة الحرارة', category: 'التطعيمات' },
  { id: 'data_logger', name: 'جهاز تسجيل درجات الحرارة', category: 'التطعيمات' },
  { id: 'vaccine_tray', name: 'صينية لقاحات', category: 'التطعيمات' },
  
  // أدوات المختبر
  { id: 'blood_collection_tubes', name: 'أنابيب جمع الدم', category: 'المختبر' },
  { id: 'edta_tubes', name: 'أنابيب EDTA', category: 'المختبر' },
  { id: 'serum_tubes', name: 'أنابيب سيرم', category: 'المختبر' },
  { id: 'citrate_tubes', name: 'أنابيب سترات', category: 'المختبر' },
  { id: 'syringes', name: 'محاقن (سرنجات)', category: 'المختبر' },
  { id: 'syringes_1ml', name: 'سرنجات 1 مل', category: 'المختبر' },
  { id: 'syringes_3ml', name: 'سرنجات 3 مل', category: 'المختبر' },
  { id: 'syringes_5ml', name: 'سرنجات 5 مل', category: 'المختبر' },
  { id: 'syringes_10ml', name: 'سرنجات 10 مل', category: 'المختبر' },
  { id: 'insulin_syringes', name: 'سرنجات إنسولين', category: 'المختبر' },
  { id: 'needles', name: 'إبر طبية', category: 'المختبر' },
  { id: 'butterfly_needles', name: 'إبر فراشة', category: 'المختبر' },
  { id: 'iv_cannula', name: 'كانيولا وريدية', category: 'المختبر' },
  { id: 'tourniquet', name: 'رباط ضاغط', category: 'المختبر' },
  { id: 'alcohol_swabs', name: 'مسحات كحول', category: 'المختبر' },
  { id: 'cotton_balls', name: 'كرات قطن', category: 'المختبر' },
  { id: 'gauze', name: 'شاش طبي', category: 'المختبر' },
  { id: 'bandages', name: 'ضمادات', category: 'المختبر' },
  { id: 'urine_cups', name: 'أكواب عينات البول', category: 'المختبر' },
  { id: 'stool_cups', name: 'أكواب عينات البراز', category: 'المختبر' },
  { id: 'swabs', name: 'مسحات قطنية', category: 'المختبر' },
  { id: 'lancets', name: 'وخازات', category: 'المختبر' },
  { id: 'slides', name: 'شرائح مجهرية', category: 'المختبر' },
  { id: 'cover_slips', name: 'أغطية شرائح', category: 'المختبر' },
  { id: 'pipettes', name: 'ماصات', category: 'المختبر' },
  { id: 'test_tubes', name: 'أنابيب اختبار', category: 'المختبر' },
  { id: 'test_tube_rack', name: 'حامل أنابيب', category: 'المختبر' },
  
  // أثاث طبي
  { id: 'exam_bed', name: 'سرير فحص', category: 'أثاث طبي' },
  { id: 'gyneco_bed', name: 'سرير نسائية', category: 'أثاث طبي' },
  { id: 'pediatric_bed', name: 'سرير أطفال', category: 'أثاث طبي' },
  { id: 'exam_light', name: 'إضاءة فحص', category: 'أثاث طبي' },
  { id: 'surgical_light', name: 'إضاءة جراحية', category: 'أثاث طبي' },
  { id: 'instrument_table', name: 'طاولة أدوات', category: 'أثاث طبي' },
  { id: 'mayo_stand', name: 'طاولة مايو', category: 'أثاث طبي' },
  { id: 'medicine_cabinet', name: 'خزانة أدوية', category: 'أثاث طبي' },
  { id: 'medicine_trolley', name: 'عربة أدوية', category: 'أثاث طبي' },
  { id: 'iv_stand', name: 'حامل محاليل', category: 'أثاث طبي' },
  { id: 'sharps_container', name: 'حاوية الأدوات الحادة', category: 'أثاث طبي' },
  { id: 'medical_waste_bin', name: 'سلة نفايات طبية', category: 'أثاث طبي' },
  { id: 'screen_divider', name: 'ستارة فاصلة', category: 'أثاث طبي' },
  { id: 'step_stool', name: 'درج صعود', category: 'أثاث طبي' },
  { id: 'footstool', name: 'مسند قدم', category: 'أثاث طبي' },
  
  // أدوات الأسنان
  { id: 'dental_chair', name: 'كرسي أسنان', category: 'طب الأسنان' },
  { id: 'dental_unit', name: 'وحدة أسنان متكاملة', category: 'طب الأسنان' },
  { id: 'dental_xray', name: 'جهاز أشعة أسنان', category: 'طب الأسنان' },
  { id: 'panoramic_xray', name: 'جهاز أشعة بانورامية', category: 'طب الأسنان' },
  { id: 'dental_instruments', name: 'أدوات أسنان أساسية', category: 'طب الأسنان' },
  { id: 'dental_sterilizer', name: 'جهاز تعقيم أسنان', category: 'طب الأسنان' },
  { id: 'dental_compressor', name: 'ضاغط هواء أسنان', category: 'طب الأسنان' },
  { id: 'dental_suction', name: 'جهاز شفط أسنان', category: 'طب الأسنان' },
  { id: 'ultrasonic_scaler', name: 'جهاز تنظيف بالموجات', category: 'طب الأسنان' },
  { id: 'light_cure', name: 'جهاز تصليب الحشوات', category: 'طب الأسنان' },
  { id: 'amalgamator', name: 'جهاز خلط الحشوات', category: 'طب الأسنان' },
  
  // أدوات الجراحة الصغرى
  { id: 'surgical_set', name: 'طقم جراحة صغرى', category: 'الجراحة الصغرى' },
  { id: 'suture_kit', name: 'طقم خياطة', category: 'الجراحة الصغرى' },
  { id: 'suture_threads', name: 'خيوط جراحية', category: 'الجراحة الصغرى' },
  { id: 'scalpel', name: 'مشرط', category: 'الجراحة الصغرى' },
  { id: 'scalpel_blades', name: 'شفرات مشرط', category: 'الجراحة الصغرى' },
  { id: 'scissors_surgical', name: 'مقص جراحي', category: 'الجراحة الصغرى' },
  { id: 'forceps', name: 'ملقط جراحي', category: 'الجراحة الصغرى' },
  { id: 'needle_holder', name: 'ماسك إبر', category: 'الجراحة الصغرى' },
  { id: 'retractors', name: 'مباعدات', category: 'الجراحة الصغرى' },
  { id: 'artery_forceps', name: 'ملقط شرياني', category: 'الجراحة الصغرى' },
  { id: 'tissue_forceps', name: 'ملقط أنسجة', category: 'الجراحة الصغرى' },
  { id: 'dressing_set', name: 'طقم غيار', category: 'الجراحة الصغرى' },
  { id: 'kidney_dish', name: 'طبق كلوي', category: 'الجراحة الصغرى' },
  { id: 'gallipot', name: 'وعاء محاليل', category: 'الجراحة الصغرى' },
  
  // مستلزمات التعقيم والنظافة
  { id: 'gloves_sterile', name: 'قفازات معقمة', category: 'التعقيم والنظافة' },
  { id: 'gloves_exam', name: 'قفازات فحص', category: 'التعقيم والنظافة' },
  { id: 'gloves_nitrile', name: 'قفازات نيتريل', category: 'التعقيم والنظافة' },
  { id: 'masks_surgical', name: 'كمامات جراحية', category: 'التعقيم والنظافة' },
  { id: 'masks_n95', name: 'كمامات N95', category: 'التعقيم والنظافة' },
  { id: 'gowns', name: 'عباءات طبية', category: 'التعقيم والنظافة' },
  { id: 'caps', name: 'قبعات طبية', category: 'التعقيم والنظافة' },
  { id: 'shoe_covers', name: 'أغطية أحذية', category: 'التعقيم والنظافة' },
  { id: 'face_shield', name: 'واقي وجه', category: 'التعقيم والنظافة' },
  { id: 'goggles', name: 'نظارات واقية', category: 'التعقيم والنظافة' },
  { id: 'aprons', name: 'مرايل بلاستيكية', category: 'التعقيم والنظافة' },
  { id: 'hand_sanitizer', name: 'معقم يدين', category: 'التعقيم والنظافة' },
  { id: 'disinfectant', name: 'مطهر سطحي', category: 'التعقيم والنظافة' },
  { id: 'sterilization_pouches', name: 'أكياس تعقيم', category: 'التعقيم والنظافة' },
  { id: 'indicator_tape', name: 'شريط مؤشر تعقيم', category: 'التعقيم والنظافة' },
];

// قوائم الأدوات غير الطبية
const nonMedicalEquipmentList = [
  // أثاث مكتبي
  { id: 'desk', name: 'مكتب', category: 'أثاث مكتبي' },
  { id: 'desk_manager', name: 'مكتب مدير', category: 'أثاث مكتبي' },
  { id: 'desk_secretary', name: 'مكتب سكرتارية', category: 'أثاث مكتبي' },
  { id: 'office_chair', name: 'كرسي مكتبي', category: 'أثاث مكتبي' },
  { id: 'executive_chair', name: 'كرسي مدير', category: 'أثاث مكتبي' },
  { id: 'visitor_chair', name: 'كرسي زوار', category: 'أثاث مكتبي' },
  { id: 'waiting_chair', name: 'كرسي انتظار', category: 'أثاث مكتبي' },
  { id: 'bench_3seat', name: 'كنب انتظار 3 مقاعد', category: 'أثاث مكتبي' },
  { id: 'bench_4seat', name: 'كنب انتظار 4 مقاعد', category: 'أثاث مكتبي' },
  { id: 'filing_cabinet', name: 'خزانة ملفات', category: 'أثاث مكتبي' },
  { id: 'filing_cabinet_4drawer', name: 'خزانة ملفات 4 أدراج', category: 'أثاث مكتبي' },
  { id: 'bookshelf', name: 'رف كتب', category: 'أثاث مكتبي' },
  { id: 'bookcase', name: 'مكتبة', category: 'أثاث مكتبي' },
  { id: 'counter', name: 'كاونتر استقبال', category: 'أثاث مكتبي' },
  { id: 'meeting_table', name: 'طاولة اجتماعات', category: 'أثاث مكتبي' },
  { id: 'coffee_table', name: 'طاولة قهوة', category: 'أثاث مكتبي' },
  { id: 'side_table', name: 'طاولة جانبية', category: 'أثاث مكتبي' },
  { id: 'drawer_unit', name: 'وحدة أدراج', category: 'أثاث مكتبي' },
  { id: 'coat_hanger', name: 'علاقة ملابس', category: 'أثاث مكتبي' },
  { id: 'notice_board', name: 'لوحة إعلانات', category: 'أثاث مكتبي' },
  { id: 'whiteboard', name: 'سبورة بيضاء', category: 'أثاث مكتبي' },
  { id: 'corkboard', name: 'لوحة فلين', category: 'أثاث مكتبي' },
  
  // أجهزة إلكترونية
  { id: 'computer', name: 'جهاز كمبيوتر', category: 'أجهزة إلكترونية' },
  { id: 'computer_desktop', name: 'كمبيوتر مكتبي', category: 'أجهزة إلكترونية' },
  { id: 'laptop', name: 'لابتوب', category: 'أجهزة إلكترونية' },
  { id: 'monitor', name: 'شاشة كمبيوتر', category: 'أجهزة إلكترونية' },
  { id: 'keyboard', name: 'لوحة مفاتيح', category: 'أجهزة إلكترونية' },
  { id: 'mouse', name: 'فأرة', category: 'أجهزة إلكترونية' },
  { id: 'printer', name: 'طابعة', category: 'أجهزة إلكترونية' },
  { id: 'printer_laser', name: 'طابعة ليزر', category: 'أجهزة إلكترونية' },
  { id: 'printer_color', name: 'طابعة ملونة', category: 'أجهزة إلكترونية' },
  { id: 'printer_label', name: 'طابعة ملصقات', category: 'أجهزة إلكترونية' },
  { id: 'scanner', name: 'ماسح ضوئي', category: 'أجهزة إلكترونية' },
  { id: 'copier', name: 'آلة تصوير', category: 'أجهزة إلكترونية' },
  { id: 'multifunction', name: 'طابعة متعددة الوظائف', category: 'أجهزة إلكترونية' },
  { id: 'phone', name: 'هاتف أرضي', category: 'أجهزة إلكترونية' },
  { id: 'phone_cordless', name: 'هاتف لاسلكي', category: 'أجهزة إلكترونية' },
  { id: 'fax', name: 'جهاز فاكس', category: 'أجهزة إلكترونية' },
  { id: 'projector', name: 'جهاز عرض (بروجكتور)', category: 'أجهزة إلكترونية' },
  { id: 'projector_screen', name: 'شاشة عرض بروجكتور', category: 'أجهزة إلكترونية' },
  { id: 'tv_screen', name: 'شاشة تلفزيون', category: 'أجهزة إلكترونية' },
  { id: 'tv_bracket', name: 'حامل شاشة', category: 'أجهزة إلكترونية' },
  { id: 'cctv', name: 'كاميرات مراقبة', category: 'أجهزة إلكترونية' },
  { id: 'dvr', name: 'جهاز تسجيل DVR', category: 'أجهزة إلكترونية' },
  { id: 'fingerprint', name: 'جهاز بصمة', category: 'أجهزة إلكترونية' },
  { id: 'intercom', name: 'جهاز اتصال داخلي', category: 'أجهزة إلكترونية' },
  { id: 'router', name: 'راوتر', category: 'أجهزة إلكترونية' },
  { id: 'switch', name: 'سويتش شبكة', category: 'أجهزة إلكترونية' },
  { id: 'access_point', name: 'أكسس بوينت', category: 'أجهزة إلكترونية' },
  { id: 'barcode_reader', name: 'قارئ باركود', category: 'أجهزة إلكترونية' },
  { id: 'queue_system', name: 'نظام انتظار', category: 'أجهزة إلكترونية' },
  { id: 'speaker', name: 'سماعة إعلان', category: 'أجهزة إلكترونية' },
  { id: 'microphone', name: 'ميكروفون', category: 'أجهزة إلكترونية' },
  
  // تكييف وتبريد
  { id: 'ac_split', name: 'مكيف سبليت', category: 'تكييف وتبريد' },
  { id: 'ac_split_1ton', name: 'مكيف سبليت 1 طن', category: 'تكييف وتبريد' },
  { id: 'ac_split_1.5ton', name: 'مكيف سبليت 1.5 طن', category: 'تكييف وتبريد' },
  { id: 'ac_split_2ton', name: 'مكيف سبليت 2 طن', category: 'تكييف وتبريد' },
  { id: 'ac_window', name: 'مكيف شباك', category: 'تكييف وتبريد' },
  { id: 'ac_central', name: 'تكييف مركزي', category: 'تكييف وتبريد' },
  { id: 'ac_cassette', name: 'مكيف كاسيت', category: 'تكييف وتبريد' },
  { id: 'ac_floor', name: 'مكيف أرضي', category: 'تكييف وتبريد' },
  { id: 'water_cooler', name: 'برادة ماء', category: 'تكييف وتبريد' },
  { id: 'water_dispenser', name: 'موزع مياه', category: 'تكييف وتبريد' },
  { id: 'fridge', name: 'ثلاجة', category: 'تكييف وتبريد' },
  { id: 'fridge_small', name: 'ثلاجة صغيرة', category: 'تكييف وتبريد' },
  { id: 'freezer', name: 'فريزر', category: 'تكييف وتبريد' },
  { id: 'fan', name: 'مروحة', category: 'تكييف وتبريد' },
  { id: 'fan_ceiling', name: 'مروحة سقف', category: 'تكييف وتبريد' },
  { id: 'fan_stand', name: 'مروحة عامود', category: 'تكييف وتبريد' },
  { id: 'heater', name: 'دفاية', category: 'تكييف وتبريد' },
  { id: 'air_purifier', name: 'جهاز تنقية الهواء', category: 'تكييف وتبريد' },
  { id: 'dehumidifier', name: 'جهاز إزالة الرطوبة', category: 'تكييف وتبريد' },
  
  // إضاءة
  { id: 'ceiling_light', name: 'إضاءة سقف', category: 'إضاءة' },
  { id: 'fluorescent', name: 'لمبات فلورسنت', category: 'إضاءة' },
  { id: 'fluorescent_2ft', name: 'نيون 2 قدم', category: 'إضاءة' },
  { id: 'fluorescent_4ft', name: 'نيون 4 قدم', category: 'إضاءة' },
  { id: 'led_lights', name: 'إضاءة LED', category: 'إضاءة' },
  { id: 'led_panel', name: 'لوحة LED', category: 'إضاءة' },
  { id: 'led_bulb', name: 'لمبة LED', category: 'إضاءة' },
  { id: 'spotlight', name: 'سبوت لايت', category: 'إضاءة' },
  { id: 'downlight', name: 'داون لايت', category: 'إضاءة' },
  { id: 'emergency_light', name: 'إضاءة طوارئ', category: 'إضاءة' },
  { id: 'exit_light', name: 'إضاءة مخرج', category: 'إضاءة' },
  { id: 'outdoor_light', name: 'إضاءة خارجية', category: 'إضاءة' },
  { id: 'desk_lamp', name: 'مصباح مكتب', category: 'إضاءة' },
  { id: 'wall_light', name: 'إضاءة جدارية', category: 'إضاءة' },
  
  // سلامة وأمان
  { id: 'fire_extinguisher_co2', name: 'طفاية ثاني أكسيد الكربون', category: 'سلامة وأمان' },
  { id: 'fire_extinguisher_powder', name: 'طفاية بودرة', category: 'سلامة وأمان' },
  { id: 'fire_extinguisher_foam', name: 'طفاية رغوة', category: 'سلامة وأمان' },
  { id: 'fire_extinguisher', name: 'طفاية حريق', category: 'سلامة وأمان' },
  { id: 'fire_hose', name: 'خرطوم إطفاء', category: 'سلامة وأمان' },
  { id: 'fire_blanket', name: 'بطانية إطفاء', category: 'سلامة وأمان' },
  { id: 'fire_alarm', name: 'جهاز إنذار حريق', category: 'سلامة وأمان' },
  { id: 'fire_alarm_panel', name: 'لوحة إنذار حريق', category: 'سلامة وأمان' },
  { id: 'smoke_detector', name: 'كاشف دخان', category: 'سلامة وأمان' },
  { id: 'heat_detector', name: 'كاشف حرارة', category: 'سلامة وأمان' },
  { id: 'manual_call_point', name: 'نقطة نداء يدوية', category: 'سلامة وأمان' },
  { id: 'first_aid_sign', name: 'لوحة إسعافات أولية', category: 'سلامة وأمان' },
  { id: 'exit_sign', name: 'لوحة مخرج طوارئ', category: 'سلامة وأمان' },
  { id: 'safety_cabinet', name: 'خزانة معدات السلامة', category: 'سلامة وأمان' },
  { id: 'fire_door', name: 'باب مقاوم للحريق', category: 'سلامة وأمان' },
  { id: 'safety_signs', name: 'لوحات إرشادية', category: 'سلامة وأمان' },
  { id: 'emergency_shower', name: 'دش طوارئ', category: 'سلامة وأمان' },
  { id: 'eyewash_station', name: 'محطة غسيل عيون', category: 'سلامة وأمان' },
  
  // نظافة وصيانة
  { id: 'vacuum_cleaner', name: 'مكنسة كهربائية', category: 'نظافة وصيانة' },
  { id: 'vacuum_wet_dry', name: 'مكنسة رطب وجاف', category: 'نظافة وصيانة' },
  { id: 'floor_polisher', name: 'ماكينة تلميع أرضيات', category: 'نظافة وصيانة' },
  { id: 'floor_scrubber', name: 'ماكينة غسيل أرضيات', category: 'نظافة وصيانة' },
  { id: 'pressure_washer', name: 'ماكينة غسيل بالضغط', category: 'نظافة وصيانة' },
  { id: 'cleaning_cart', name: 'عربة نظافة', category: 'نظافة وصيانة' },
  { id: 'trash_bin', name: 'سلة مهملات', category: 'نظافة وصيانة' },
  { id: 'trash_bin_pedal', name: 'سلة مهملات بدواسة', category: 'نظافة وصيانة' },
  { id: 'trash_bin_large', name: 'حاوية نفايات كبيرة', category: 'نظافة وصيانة' },
  { id: 'recycling_bin', name: 'سلة إعادة تدوير', category: 'نظافة وصيانة' },
  { id: 'mop_bucket', name: 'دلو ممسحة', category: 'نظافة وصيانة' },
  { id: 'mop', name: 'ممسحة', category: 'نظافة وصيانة' },
  { id: 'broom', name: 'مكنسة يدوية', category: 'نظافة وصيانة' },
  { id: 'dustpan', name: 'جاروف', category: 'نظافة وصيانة' },
  { id: 'soap_dispenser', name: 'موزع صابون', category: 'نظافة وصيانة' },
  { id: 'paper_towel_dispenser', name: 'موزع مناديل', category: 'نظافة وصيانة' },
  { id: 'hand_dryer', name: 'مجفف أيدي', category: 'نظافة وصيانة' },
  { id: 'toilet_brush', name: 'فرشاة مرحاض', category: 'نظافة وصيانة' },
  
  // معدات متنوعة
  { id: 'generator', name: 'مولد كهربائي', category: 'معدات متنوعة' },
  { id: 'generator_small', name: 'مولد صغير', category: 'معدات متنوعة' },
  { id: 'ups', name: 'جهاز UPS', category: 'معدات متنوعة' },
  { id: 'ups_rack', name: 'UPS للخوادم', category: 'معدات متنوعة' },
  { id: 'stabilizer', name: 'منظم جهد', category: 'معدات متنوعة' },
  { id: 'water_tank', name: 'خزان مياه', category: 'معدات متنوعة' },
  { id: 'water_tank_ground', name: 'خزان أرضي', category: 'معدات متنوعة' },
  { id: 'water_tank_elevated', name: 'خزان علوي', category: 'معدات متنوعة' },
  { id: 'water_pump', name: 'مضخة مياه', category: 'معدات متنوعة' },
  { id: 'booster_pump', name: 'مضخة ضغط', category: 'معدات متنوعة' },
  { id: 'water_heater', name: 'سخان مياه', category: 'معدات متنوعة' },
  { id: 'ladder', name: 'سلم', category: 'معدات متنوعة' },
  { id: 'ladder_folding', name: 'سلم قابل للطي', category: 'معدات متنوعة' },
  { id: 'ladder_extension', name: 'سلم تمديد', category: 'معدات متنوعة' },
  { id: 'toolbox', name: 'صندوق أدوات', category: 'معدات متنوعة' },
  { id: 'tool_set', name: 'طقم أدوات', category: 'معدات متنوعة' },
  { id: 'drill', name: 'دريل', category: 'معدات متنوعة' },
  { id: 'safe', name: 'خزنة', category: 'معدات متنوعة' },
  { id: 'key_cabinet', name: 'خزانة مفاتيح', category: 'معدات متنوعة' },
  { id: 'clock', name: 'ساعة حائط', category: 'معدات متنوعة' },
  { id: 'curtains', name: 'ستائر', category: 'معدات متنوعة' },
  { id: 'blinds', name: 'ستائر معدنية', category: 'معدات متنوعة' },
  { id: 'carpet', name: 'سجاد', category: 'معدات متنوعة' },
  { id: 'mat', name: 'ممسحة أرجل', category: 'معدات متنوعة' },
  { id: 'mirror', name: 'مرآة', category: 'معدات متنوعة' },
  
  // مستلزمات مكتبية
  { id: 'paper_a4', name: 'ورق A4', category: 'مستلزمات مكتبية' },
  { id: 'paper_a3', name: 'ورق A3', category: 'مستلزمات مكتبية' },
  { id: 'ink_cartridge', name: 'حبر طابعة', category: 'مستلزمات مكتبية' },
  { id: 'toner', name: 'حبر ليزر', category: 'مستلزمات مكتبية' },
  { id: 'stapler', name: 'دباسة', category: 'مستلزمات مكتبية' },
  { id: 'staples', name: 'دبابيس', category: 'مستلزمات مكتبية' },
  { id: 'hole_punch', name: 'خرامة', category: 'مستلزمات مكتبية' },
  { id: 'scissors', name: 'مقص', category: 'مستلزمات مكتبية' },
  { id: 'tape', name: 'شريط لاصق', category: 'مستلزمات مكتبية' },
  { id: 'glue', name: 'صمغ', category: 'مستلزمات مكتبية' },
  { id: 'pens', name: 'أقلام', category: 'مستلزمات مكتبية' },
  { id: 'pencils', name: 'أقلام رصاص', category: 'مستلزمات مكتبية' },
  { id: 'markers', name: 'أقلام ماركر', category: 'مستلزمات مكتبية' },
  { id: 'highlighters', name: 'أقلام تحديد', category: 'مستلزمات مكتبية' },
  { id: 'folders', name: 'ملفات', category: 'مستلزمات مكتبية' },
  { id: 'binders', name: 'كلاسيرات', category: 'مستلزمات مكتبية' },
  { id: 'paper_clips', name: 'مشابك ورق', category: 'مستلزمات مكتبية' },
  { id: 'rubber_bands', name: 'أربطة مطاطية', category: 'مستلزمات مكتبية' },
  { id: 'envelopes', name: 'مظاريف', category: 'مستلزمات مكتبية' },
  { id: 'stamp_pad', name: 'وسادة أختام', category: 'مستلزمات مكتبية' },
  { id: 'calculator', name: 'آلة حاسبة', category: 'مستلزمات مكتبية' },
  { id: 'desk_organizer', name: 'منظم مكتب', category: 'مستلزمات مكتبية' },
  { id: 'letter_tray', name: 'صينية أوراق', category: 'مستلزمات مكتبية' },
];

export default function CenterDeficiencyTool() {
  const [healthCenters, setHealthCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [activeTab, setActiveTab] = useState('medical');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [fileAnalysisResult, setFileAnalysisResult] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [showMultiCenterExport, setShowMultiCenterExport] = useState(false);
  const [selectedCentersForExport, setSelectedCentersForExport] = useState([]);

  useEffect(() => {
    loadHealthCenters();
    loadSavedReports();
  }, []);

  const loadHealthCenters = async () => {
    setIsLoading(true);
    try {
      const centers = await base44.entities.HealthCenter.list('-updated_date', 100);
      setHealthCenters(Array.isArray(centers) ? centers : []);
    } catch (error) {
      console.error('Error loading health centers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedReports = async () => {
    // يمكن حفظ التقارير في localStorage أو في قاعدة البيانات
    const saved = localStorage.getItem('deficiency_reports');
    if (saved) {
      setSavedReports(JSON.parse(saved));
    }
  };

  const saveReport = () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء اختيار مركز وإضافة عناصر للتقرير');
      return;
    }

    const report = {
      id: Date.now(),
      title: reportTitle || `تقرير نواقص ${selectedCenter}`,
      center: selectedCenter,
      items: selectedItems,
      date: new Date().toISOString(),
    };

    const updated = [...savedReports, report];
    setSavedReports(updated);
    localStorage.setItem('deficiency_reports', JSON.stringify(updated));
    toast.success('تم حفظ التقرير');
  };

  const deleteReport = (reportId) => {
    const updated = savedReports.filter(r => r.id !== reportId);
    setSavedReports(updated);
    localStorage.setItem('deficiency_reports', JSON.stringify(updated));
    toast.success('تم حذف التقرير');
  };

  const loadReport = (report) => {
    setSelectedCenter(report.center);
    setSelectedItems(report.items);
    setReportTitle(report.title);
    setShowSavedReports(false);
    toast.success('تم تحميل التقرير');
  };

  const toggleItem = (item, quantity = 1) => {
    const existingIndex = selectedItems.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      setSelectedItems(prev => [...prev, { ...item, quantity, type: activeTab }]);
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) quantity = 1;
    setSelectedItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const isSelected = (itemId) => selectedItems.some(i => i.id === itemId);
  const getSelectedQuantity = (itemId) => selectedItems.find(i => i.id === itemId)?.quantity || 1;

  const currentList = activeTab === 'medical' ? medicalEquipmentList : nonMedicalEquipmentList;
  const categories = [...new Set(currentList.map(item => item.category))];

  const filteredItems = searchQuery
    ? currentList.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentList;

  const medicalItems = selectedItems.filter(i => i.type === 'medical');
  const nonMedicalItems = selectedItems.filter(i => i.type === 'nonmedical');

  const exportToExcel = () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء اختيار مركز وإضافة عناصر للتقرير');
      return;
    }

    const headers = ['#', 'اسم العنصر', 'التصنيف', 'النوع', 'العدد المطلوب'];
    const rows = selectedItems.map((item, idx) => [
      idx + 1,
      item.name,
      item.category,
      item.type === 'medical' ? 'طبي' : 'غير طبي',
      item.quantity
    ]);

    // إضافة معلومات المركز
    const centerInfo = [
      ['تقرير نواقص المركز الصحي'],
      ['المركز:', selectedCenter],
      ['التاريخ:', new Date().toLocaleDateString('ar-SA')],
      [''],
    ];

    const csvContent = [
      ...centerInfo.map(row => row.join(',')),
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نواقص-${selectedCenter}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('تم تصدير التقرير');
  };

  const exportToHTML = () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء اختيار مركز وإضافة عناصر للتقرير');
      return;
    }

    const today = new Date().toLocaleDateString('ar-SA', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير نواقص ${selectedCenter}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Cairo', sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: #1e293b;
      line-height: 1.6;
      padding: 30px;
    }
    
    .container { max-width: 900px; margin: 0 auto; }
    
    .header {
      background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
      color: white;
      padding: 40px;
      border-radius: 20px;
      margin-bottom: 30px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(15, 118, 110, 0.3);
    }
    
    .header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 10px; }
    .header .center-name { font-size: 1.5rem; margin-bottom: 15px; opacity: 0.95; }
    .header .date { background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; display: inline-block; }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    
    .stat-number { font-size: 2.5rem; font-weight: 800; color: #0f766e; }
    .stat-label { color: #64748b; font-weight: 600; }
    
    .section {
      background: white;
      border-radius: 16px;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    
    .section-header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 15px 25px;
      font-size: 1.2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-header.medical { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); }
    .section-header.non-medical { background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); }
    
    table { width: 100%; border-collapse: collapse; }
    
    th {
      background: #f1f5f9;
      padding: 15px 12px;
      text-align: right;
      font-weight: 700;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    tr:hover { background: #f8fafc; }
    
    .category-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      background: #e2e8f0;
      color: #475569;
    }
    
    .quantity { 
      font-weight: 800; 
      color: #0f766e; 
      font-size: 1.1rem;
      text-align: center;
    }
    
    .footer {
      text-align: center;
      padding: 30px;
      color: #64748b;
      font-size: 0.9rem;
      border-top: 2px solid #e2e8f0;
      margin-top: 30px;
    }
    
    @media print {
      body { background: white; padding: 10px; }
      .header { box-shadow: none; border: 2px solid #0f766e; }
      .section, .stat-card { box-shadow: none; border: 1px solid #e2e8f0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 تقرير نواقص التجهيزات</h1>
      <div class="center-name">🏥 ${selectedCenter}</div>
      <div class="date">📅 ${today}</div>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${selectedItems.length}</div>
        <div class="stat-label">إجمالي العناصر</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="color: #0f766e;">${medicalItems.length}</div>
        <div class="stat-label">أدوات طبية</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="color: #7c3aed;">${nonMedicalItems.length}</div>
        <div class="stat-label">أدوات غير طبية</div>
      </div>
    </div>
    
    ${medicalItems.length > 0 ? `
    <div class="section">
      <div class="section-header medical">
        🏥 الأدوات الطبية المطلوبة (${medicalItems.length})
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>اسم العنصر</th>
            <th>التصنيف</th>
            <th>العدد</th>
          </tr>
        </thead>
        <tbody>
          ${medicalItems.map((item, idx) => `
            <tr>
              <td style="font-weight: 700; color: #0f766e;">${idx + 1}</td>
              <td>${item.name}</td>
              <td><span class="category-badge">${item.category}</span></td>
              <td class="quantity">${item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    ${nonMedicalItems.length > 0 ? `
    <div class="section">
      <div class="section-header non-medical">
        🔧 الأدوات غير الطبية المطلوبة (${nonMedicalItems.length})
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>اسم العنصر</th>
            <th>التصنيف</th>
            <th>العدد</th>
          </tr>
        </thead>
        <tbody>
          ${nonMedicalItems.map((item, idx) => `
            <tr>
              <td style="font-weight: 700; color: #7c3aed;">${idx + 1}</td>
              <td>${item.name}</td>
              <td><span class="category-badge">${item.category}</span></td>
              <td class="quantity">${item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    <div class="footer">
      <p>تم إنشاء هذا التقرير بواسطة نظام إدارة المراكز الصحية</p>
      <p style="margin-top: 5px;">وزارة الصحة - قطاع الحناكية الصحي</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-نواقص-${selectedCenter}-${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    toast.success('تم تصدير التقرير');
  };

  const openMultiCenterExport = () => {
    if (savedReports.length === 0) {
      toast.error('لا توجد تقارير محفوظة للتصدير');
      return;
    }
    // جمع المراكز الفريدة
    const uniqueCenters = [...new Set(savedReports.map(r => r.center))];
    setSelectedCentersForExport(uniqueCenters); // تحديد الكل افتراضياً
    setShowMultiCenterExport(true);
  };

  const toggleCenterForExport = (center) => {
    setSelectedCentersForExport(prev => 
      prev.includes(center) 
        ? prev.filter(c => c !== center)
        : [...prev, center]
    );
  };

  const exportSelectedCentersReport = () => {
    if (selectedCentersForExport.length === 0) {
      toast.error('الرجاء اختيار مركز واحد على الأقل');
      return;
    }

    const today = new Date().toLocaleDateString('ar-SA', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // تجميع البيانات للمراكز المختارة فقط
    const centerData = {};
    savedReports
      .filter(report => selectedCentersForExport.includes(report.center))
      .forEach(report => {
        if (!centerData[report.center]) {
          centerData[report.center] = [];
        }
        centerData[report.center].push(...report.items);
      });

    // إزالة التكرارات وجمع الكميات
    Object.keys(centerData).forEach(center => {
      const uniqueItems = {};
      centerData[center].forEach(item => {
        if (uniqueItems[item.id]) {
          uniqueItems[item.id].quantity += item.quantity;
        } else {
          uniqueItems[item.id] = { ...item };
        }
      });
      centerData[center] = Object.values(uniqueItems);
    });

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير نواقص جميع المراكز</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; background: #f8fafc; padding: 30px; color: #1e293b; }
    .container { max-width: 1000px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: white; padding: 40px; border-radius: 20px; margin-bottom: 30px; text-align: center; }
    .header h1 { font-size: 2rem; margin-bottom: 10px; }
    .header .date { background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; display: inline-block; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .summary-card { background: white; padding: 25px; border-radius: 16px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    .summary-number { font-size: 2.5rem; font-weight: 800; color: #0f766e; }
    .summary-label { color: #64748b; font-weight: 600; }
    .center-section { background: white; border-radius: 16px; margin-bottom: 25px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    .center-header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 15px 25px; font-size: 1.2rem; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f5f9; padding: 12px; text-align: right; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:hover { background: #f8fafc; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge-medical { background: #d1fae5; color: #065f46; }
    .badge-nonmedical { background: #ede9fe; color: #5b21b6; }
    .quantity { font-weight: 800; color: #0f766e; text-align: center; }
    .footer { text-align: center; padding: 30px; color: #64748b; border-top: 2px solid #e2e8f0; margin-top: 30px; }
    @media print { body { background: white; padding: 10px; } .header, .center-section, .summary-card { box-shadow: none; border: 1px solid #e2e8f0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 تقرير نواقص جميع المراكز الصحية</h1>
      <div class="date">📅 ${today}</div>
    </div>
    
    <div class="summary">
      <div class="summary-card">
        <div class="summary-number">${Object.keys(centerData).length}</div>
        <div class="summary-label">مركز صحي</div>
      </div>
      <div class="summary-card">
        <div class="summary-number">${Object.values(centerData).flat().length}</div>
        <div class="summary-label">إجمالي العناصر</div>
      </div>
      <div class="summary-card">
        <div class="summary-number">${savedReports.length}</div>
        <div class="summary-label">تقرير محفوظ</div>
      </div>
    </div>
    
    ${Object.entries(centerData).map(([center, items]) => `
    <div class="center-section">
      <div class="center-header">🏥 ${center} (${items.length} عنصر)</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>اسم العنصر</th>
            <th>التصنيف</th>
            <th>النوع</th>
            <th>العدد</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${item.name}</td>
              <td>${item.category}</td>
              <td><span class="badge ${item.type === 'medical' ? 'badge-medical' : 'badge-nonmedical'}">${item.type === 'medical' ? 'طبي' : 'غير طبي'}</span></td>
              <td class="quantity">${item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    `).join('')}
    
    <div class="footer">
      <p>وزارة الصحة - قطاع الحناكية الصحي</p>
      <p style="margin-top: 5px;">تم إنشاء هذا التقرير بواسطة نظام إدارة المراكز الصحية</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = selectedCentersForExport.length === 1 
      ? `تقرير-نواقص-${selectedCentersForExport[0]}-${new Date().toISOString().split('T')[0]}.html`
      : `تقرير-نواقص-${selectedCentersForExport.length}-مراكز-${new Date().toISOString().split('T')[0]}.html`;
    link.download = fileName;
    link.click();
    toast.success(`تم تصدير تقرير ${selectedCentersForExport.length} مركز`);
    setShowMultiCenterExport(false);
  };

  const printReport = () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء اختيار مركز وإضافة عناصر للتقرير');
      return;
    }

    const printWindow = window.open('', '_blank');
    // نفس HTML الخاص بالتصدير
    const today = new Date().toLocaleDateString('ar-SA', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير نواقص ${selectedCenter}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; padding: 20px; color: #1e293b; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #0f766e; }
    .header h1 { font-size: 1.8rem; color: #0f766e; margin-bottom: 10px; }
    .header .center-name { font-size: 1.3rem; color: #475569; }
    .header .date { color: #64748b; margin-top: 10px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 15px; padding: 10px; background: #f1f5f9; border-radius: 8px; }
    .section-title.medical { color: #0f766e; border-right: 4px solid #0f766e; }
    .section-title.non-medical { color: #7c3aed; border-right: 4px solid #7c3aed; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 12px; text-align: right; border: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 700; }
    .quantity { text-align: center; font-weight: 700; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>تقرير نواقص التجهيزات</h1>
    <div class="center-name">${selectedCenter}</div>
    <div class="date">${today}</div>
  </div>
  
  ${medicalItems.length > 0 ? `
  <div class="section">
    <div class="section-title medical">الأدوات الطبية المطلوبة (${medicalItems.length})</div>
    <table>
      <thead><tr><th>#</th><th>اسم العنصر</th><th>التصنيف</th><th>العدد</th></tr></thead>
      <tbody>
        ${medicalItems.map((item, idx) => `
          <tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.category}</td><td class="quantity">${item.quantity}</td></tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
  
  ${nonMedicalItems.length > 0 ? `
  <div class="section">
    <div class="section-title non-medical">الأدوات غير الطبية المطلوبة (${nonMedicalItems.length})</div>
    <table>
      <thead><tr><th>#</th><th>اسم العنصر</th><th>التصنيف</th><th>العدد</th></tr></thead>
      <tbody>
        ${nonMedicalItems.map((item, idx) => `
          <tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.category}</td><td class="quantity">${item.quantity}</td></tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
  
  <div class="footer">
    <p>وزارة الصحة - قطاع الحناكية الصحي</p>
  </div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const clearSelection = () => {
    setSelectedItems([]);
    setReportTitle('');
    toast.success('تم مسح التحديد');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    toast.info(`جاري تحليل الملف: ${file.name}`);
    
    try {
      // رفع الملف أولاً
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      console.log('File uploaded:', file_url);

      // إنشاء قائمة بأسماء الأدوات المتاحة للمطابقة
      const allEquipment = [
        ...medicalEquipmentList.map(e => ({ ...e, type: 'medical' })),
        ...nonMedicalEquipmentList.map(e => ({ ...e, type: 'nonmedical' }))
      ];

      // تقليل حجم القوائم للـ AI
      const equipmentSample = allEquipment.slice(0, 100).map(e => e.name).join('، ');
      const centerNames = healthCenters.map(c => c.اسم_المركز).join('، ');

      // تحليل الملف باستخدام الذكاء الاصطناعي
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل هذا الملف واستخرج:
1. اسم المركز الصحي (إن وجد)
2. النص الكامل للملف (أو ملخص إذا كان طويلاً)
3. قائمة بكل الأدوات/المعدات/النواقص المذكورة

أمثلة على المراكز: ${centerNames}
أمثلة على الأدوات: ${equipmentSample}

مهم جداً:
- اكتب في file_content كل النص الذي تقرأه من الملف
- استخرج كل عنصر مذكور حتى لو لم يكن في الأمثلة
- الكمية = 1 إذا لم تذكر`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            center_name: { type: "string", description: "اسم المركز الصحي" },
            file_content: { type: "string", description: "محتوى الملف الكامل أو ملخصه" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  original_name: { type: "string" },
                  quantity: { type: "number" }
                }
              }
            }
          }
        }
      });

      console.log('AI Response:', response);
      
      if (response) {
        // معالجة النتائج
        const processedItems = [];
        const addedIds = new Set();
        
        const extractedItems = response.items || [];
        console.log('Extracted items:', extractedItems);
        
        extractedItems.forEach(item => {
          const itemName = item.name || item.original_name || '';
          if (!itemName.trim()) return;
          
          const searchName = itemName.toLowerCase().trim();
          
          // البحث عن الأداة في القوائم بطرق متعددة
          const matchedEquipment = allEquipment.find(e => {
            const eName = e.name.toLowerCase();
            // مطابقة تامة
            if (eName === searchName) return true;
            // مطابقة جزئية
            if (eName.includes(searchName) || searchName.includes(eName)) return true;
            // مطابقة كلمات
            const eWords = eName.split(/[\s\-\(\)]+/).filter(w => w.length > 2);
            const sWords = searchName.split(/[\s\-\(\)]+/).filter(w => w.length > 2);
            return eWords.some(ew => sWords.some(sw => ew.includes(sw) || sw.includes(ew)));
          });

          const uniqueKey = matchedEquipment ? matchedEquipment.id : searchName;
          
          if (!addedIds.has(uniqueKey)) {
            addedIds.add(uniqueKey);
            
            if (matchedEquipment) {
              processedItems.push({
                ...matchedEquipment,
                quantity: item.quantity || 1,
                original_name: itemName,
                matched: true,
                selected: true
              });
            } else {
              processedItems.push({
                id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: itemName,
                original_name: itemName,
                category: 'غير مصنف',
                type: 'unknown',
                quantity: item.quantity || 1,
                matched: false,
                selected: false
              });
            }
          }
        });

        console.log('Processed items:', processedItems);

        // حفظ النتائج وعرض نافذة المعاينة
        setFileAnalysisResult({
          center_name: response.center_name || '',
          file_content: response.file_content || 'لم يتم استخراج محتوى نصي من الملف',
          items: processedItems,
          raw_response: response
        });
        setPendingItems(processedItems);
        setShowFilePreview(true);

        // تحديد المركز إن وجد
        if (response.center_name) {
          const matchedCenter = healthCenters.find(c => 
            c.اسم_المركز?.includes(response.center_name) || 
            response.center_name.includes(c.اسم_المركز || '')
          );
          if (matchedCenter) {
            setSelectedCenter(matchedCenter.اسم_المركز);
          }
        }
        
        toast.success(`تم تحليل الملف - وجدنا ${processedItems.length} عنصر`);
      } else {
        toast.error('لم يتم الحصول على نتائج من التحليل');
        setFileAnalysisResult({
          center_name: '',
          file_content: 'فشل في قراءة الملف',
          items: []
        });
        setShowFilePreview(true);
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
      toast.error('فشل في تحليل الملف: ' + (error.message || 'خطأ غير معروف'));
      setFileAnalysisResult({
        center_name: '',
        file_content: `خطأ: ${error.message || 'فشل في قراءة الملف'}`,
        items: []
      });
      setShowFilePreview(true);
    } finally {
      setIsAnalyzing(false);
      event.target.value = '';
    }
  };

  const togglePendingItem = (index) => {
    setPendingItems(prev => prev.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  const confirmFileItems = () => {
    const itemsToAdd = pendingItems.filter(item => item.selected && item.matched);
    
    if (itemsToAdd.length > 0) {
      setSelectedItems(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewItems = itemsToAdd.filter(n => !existingIds.has(n.id));
        return [...prev, ...uniqueNewItems];
      });
      toast.success(`تم إضافة ${itemsToAdd.length} عنصر`);
    }
    
    setShowFilePreview(false);
    setFileAnalysisResult(null);
    setPendingItems([]);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-teal-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-xl mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            نواقص المراكز الصحية
          </h1>
          <p className="text-gray-600">
            استخراج وتوثيق نواقص الأدوات الطبية وغير الطبية للمراكز الصحية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* اختيار المركز والقائمة */}
          <div className="lg:col-span-2 space-y-6">
            {/* اختيار المركز */}
            <Card className="border-2 border-teal-200">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  اختر المركز الصحي
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="اختر المركز الصحي..." />
                      </SelectTrigger>
                      <SelectContent>
                        {healthCenters.map(center => (
                          <SelectItem key={center.id} value={center.اسم_المركز}>
                            {center.اسم_المركز}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                      onChange={handleFileUpload}
                      disabled={isAnalyzing}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        asChild
                        variant="outline"
                        disabled={isAnalyzing}
                        className="h-12 cursor-pointer bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-400"
                      >
                        <span>
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                              جاري التحليل...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 ml-2 text-purple-600" />
                              رفع ملف نواقص
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSavedReports(true)}
                      className="h-12"
                    >
                      <List className="w-4 h-4 ml-2" />
                      المحفوظة ({savedReports.length})
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={openMultiCenterExport}
                      disabled={savedReports.length === 0}
                      className="h-12 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200 hover:border-teal-400"
                      title="تصدير تقرير شامل لمراكز مختارة"
                    >
                      <Download className="w-4 h-4 ml-2 text-teal-600" />
                      تقرير شامل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* قائمة الأدوات */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="medical" className="gap-2">
                      <Stethoscope className="w-4 h-4" />
                      أدوات طبية
                      <Badge className="bg-teal-100 text-teal-800">{medicalEquipmentList.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="nonmedical" className="gap-2">
                      <Wrench className="w-4 h-4" />
                      أدوات غير طبية
                      <Badge className="bg-purple-100 text-purple-800">{nonMedicalEquipmentList.length}</Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {/* البحث */}
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="ابحث عن أداة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {/* القائمة */}
                <div className="max-h-[500px] overflow-y-auto space-y-4">
                  {categories.map(category => {
                    const categoryItems = filteredItems.filter(item => item.category === category);
                    if (categoryItems.length === 0) return null;

                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="font-semibold text-gray-700 bg-gray-100 px-3 py-2 rounded-lg sticky top-0 z-10">
                          {category} ({categoryItems.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryItems.map(item => {
                            const selected = isSelected(item.id);
                            return (
                              <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                  selected 
                                    ? 'border-teal-500 bg-teal-50' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => toggleItem(item)}
                              >
                                <Checkbox
                                  checked={selected}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="flex-1 text-sm">{item.name}</span>
                                {selected && (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => updateQuantity(item.id, getSelectedQuantity(item.id) - 1)}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={getSelectedQuantity(item.id)}
                                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                      className="w-14 h-7 text-center text-sm p-1"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => updateQuantity(item.id, getSelectedQuantity(item.id) + 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ملخص التقرير */}
          <div className="space-y-6">
            <Card className="border-2 border-teal-200 sticky top-4">
              <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    ملخص التقرير
                  </span>
                  <Badge className="bg-white/20 text-white">{selectedItems.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* المركز المحدد */}
                {selectedCenter && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">المركز الصحي:</p>
                    <p className="font-semibold">{selectedCenter}</p>
                  </div>
                )}

                {/* عنوان التقرير */}
                <div>
                  <Label>عنوان التقرير (اختياري)</Label>
                  <Input
                    placeholder="مثال: نواقص الربع الأول 2024"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />
                </div>

                {/* إحصائيات */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-teal-50 p-3 rounded-lg text-center">
                    <Stethoscope className="w-6 h-6 mx-auto text-teal-600 mb-1" />
                    <p className="text-2xl font-bold text-teal-700">{medicalItems.length}</p>
                    <p className="text-xs text-teal-600">أداة طبية</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <Wrench className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                    <p className="text-2xl font-bold text-purple-700">{nonMedicalItems.length}</p>
                    <p className="text-xs text-purple-600">أداة غير طبية</p>
                  </div>
                </div>

                {/* قائمة العناصر المحددة */}
                {selectedItems.length > 0 && (
                  <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                    {selectedItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          {item.type === 'medical' ? (
                            <Stethoscope className="w-3 h-3 text-teal-600" />
                          ) : (
                            <Wrench className="w-3 h-3 text-purple-600" />
                          )}
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.quantity}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:bg-red-50"
                            onClick={() => toggleItem(item)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* أزرار الإجراءات */}
                <div className="space-y-2">
                  <Button
                    onClick={saveReport}
                    disabled={!selectedCenter || selectedItems.length === 0}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التقرير
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={exportToExcel}
                      disabled={selectedItems.length === 0}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={exportToHTML}
                      disabled={selectedItems.length === 0}
                      className="text-purple-600 hover:bg-purple-50"
                    >
                      <FileCode className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={printReport}
                      disabled={selectedItems.length === 0}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>

                  {selectedItems.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearSelection}
                      className="w-full text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      مسح التحديد
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* نافذة معاينة الملف */}
      <Dialog open={showFilePreview} onOpenChange={setShowFilePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              تحليل محتوى الملف
            </DialogTitle>
          </DialogHeader>
          
          {fileAnalysisResult && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* المركز المكتشف */}
              {fileAnalysisResult.center_name && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <p className="text-sm text-teal-600 font-medium">المركز المكتشف:</p>
                  <p className="font-bold text-teal-800">{fileAnalysisResult.center_name}</p>
                </div>
              )}

              {/* محتوى الملف */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-2">محتوى الملف:</p>
                <div className="bg-white border rounded p-3 max-h-[150px] overflow-y-auto text-sm whitespace-pre-wrap">
                  {fileAnalysisResult.file_content || 'لا يوجد محتوى نصي'}
                </div>
              </div>

              {/* النواقص المستخرجة */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  النواقص المستخرجة ({pendingItems.length})
                </p>
                <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                  {pendingItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      لم يتم العثور على نواقص في الملف
                    </div>
                  ) : (
                    pendingItems.map((item, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-3 p-3 ${
                          item.matched ? 'bg-white' : 'bg-yellow-50'
                        }`}
                      >
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => togglePendingItem(index)}
                          disabled={!item.matched}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            {item.matched ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle2 className="w-3 h-3 ml-1" />
                                مطابق
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                <AlertCircle className="w-3 h-3 ml-1" />
                                غير موجود بالقائمة
                              </Badge>
                            )}
                          </div>
                          {item.original_name && item.original_name !== item.name && (
                            <p className="text-xs text-gray-500">الاسم الأصلي: {item.original_name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.quantity}</Badge>
                          {item.type === 'medical' && <Stethoscope className="w-4 h-4 text-teal-600" />}
                          {item.type === 'nonmedical' && <Wrench className="w-4 h-4 text-purple-600" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ملاحظة */}
              {pendingItems.some(i => !i.matched) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                  <p className="text-yellow-800">
                    <AlertCircle className="w-4 h-4 inline ml-1" />
                    بعض العناصر غير موجودة في القائمة، يمكنك إضافتها يدوياً من قائمة الأدوات.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowFilePreview(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={confirmFileItems}
              className="bg-teal-600 hover:bg-teal-700"
              disabled={!pendingItems.some(i => i.selected && i.matched)}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة العناصر المحددة ({pendingItems.filter(i => i.selected && i.matched).length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة اختيار المراكز للتصدير */}
      <Dialog open={showMultiCenterExport} onOpenChange={setShowMultiCenterExport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              تصدير تقرير شامل
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">اختر المراكز التي تريد تضمينها في التقرير:</p>
            
            <div className="flex gap-2 mb-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedCentersForExport([...new Set(savedReports.map(r => r.center))])}
              >
                تحديد الكل
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedCentersForExport([])}
              >
                إلغاء الكل
              </Button>
            </div>

            <div className="max-h-[300px] overflow-y-auto border rounded-lg divide-y">
              {[...new Set(savedReports.map(r => r.center))].map(center => {
                const centerReports = savedReports.filter(r => r.center === center);
                const totalItems = centerReports.reduce((sum, r) => sum + r.items.length, 0);
                const isSelected = selectedCentersForExport.includes(center);
                
                return (
                  <div 
                    key={center}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-teal-50' : ''}`}
                    onClick={() => toggleCenterForExport(center)}
                  >
                    <Checkbox checked={isSelected} />
                    <div className="flex-1">
                      <p className="font-medium">{center}</p>
                      <p className="text-xs text-gray-500">{centerReports.length} تقرير - {totalItems} عنصر</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="text-gray-600">
                المراكز المختارة: <span className="font-bold text-teal-600">{selectedCentersForExport.length}</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMultiCenterExport(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={exportSelectedCentersReport}
              disabled={selectedCentersForExport.length === 0}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير ({selectedCentersForExport.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة التقارير المحفوظة */}
      <Dialog open={showSavedReports} onOpenChange={setShowSavedReports}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              التقارير المحفوظة ({savedReports.length})
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {savedReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>لا توجد تقارير محفوظة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedReports.map(report => (
                  <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{report.title}</h4>
                        <p className="text-sm text-gray-500">{report.center}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(report.date).toLocaleDateString('ar-SA')} - {report.items.length} عنصر
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => loadReport(report)}>
                          تحميل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600"
                          onClick={() => deleteReport(report.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}