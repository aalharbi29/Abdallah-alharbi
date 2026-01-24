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
  CheckCircle2, AlertCircle, Filter, X, Save, List, Upload, FileUp, Sparkles,
  Edit2, Check, ArrowLeftRight, EyeOff, Eye, RotateCcw
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
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
  { id: 'ultrasound', name: 'جهاز (Ultrasound)', category: 'أجهزة طبية' },
  { id: 'blood_separator', name: 'جهاز فصل العينات', category: 'أجهزة طبية' },
  { id: 'temp_indicator_svaksin', name: 'جهاز قياس مؤشر درجة حرارة سلسلة الأوردية', category: 'أجهزة طبية' },
  { id: 'blood_bank_fridge', name: 'ثلاجة الحافظة بنك الدم (الدم الآريوي والدقنيات)', category: 'أجهزة طبية' },
  { id: 'medical_fridge', name: 'ثلاجة الأدوية', category: 'أجهزة طبية' },
  { id: 'sample_lab_transfer', name: 'طقم نقل العينات للمختبر المركزي', category: 'أجهزة طبية' },
  
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
  { id: 'doctor_per_family_program', name: 'برنامج طبيب لكل أسرة', category: 'برامج صحية' },
  { id: 'know_your_numbers_program', name: 'برنامج اعرف أرقامك', category: 'برامج صحية' },
  { id: 'school_health_program', name: 'برنامج الصحة المدرسية', category: 'برامج صحية' },
  { id: 'ihtimam_program', name: 'برنامج اهتمام', category: 'برامج صحية' },
  { id: 'virtual_health_coach', name: 'مدرب صحي افتراضي وحضوري', category: 'برامج صحية' },
  { id: 'fitness_test', name: 'فحص اللياقة', category: 'برامج صحية' },
  { id: 'colon_cancer_screening', name: 'فحص سرطان القولون', category: 'برامج صحية' },
  { id: 'breast_cancer_screening', name: 'فحص سرطان الثدي', category: 'برامج صحية' },
  { id: 'flu_vaccination', name: 'تطعيم الأنفلونزا', category: 'برامج صحية' },
  { id: 'vaccination_documentation', name: 'توثيق التطعيمات', category: 'برامج صحية' },
  { id: 'infection_control', name: 'مكافحة العدوى', category: 'برامج صحية' },
  { id: 'corona_vaccination', name: 'تطعيم كورونا', category: 'برامج صحية' },
  { id: 'rsv_vaccine', name: 'لقاح الفيروس التنفسي', category: 'برامج صحية' },
  { id: 'premarital_screening', name: 'فحص الزواج', category: 'برامج صحية' },
  { id: 'midwifery_pathway', name: 'مسار القبالة', category: 'برامج صحية' },
  { id: 'shingles_vaccine', name: 'تطعيم الحزام الناري', category: 'برامج صحية' },
  { id: 'community_empowerment', name: 'التمكين المجتمعي', category: 'برامج صحية' },
  
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
  { id: 'patient_transfer_bed', name: 'سرير نقل مريض', category: 'إسعافات أولية' },
  { id: 'laryngoscope', name: 'منظار حنجرة', category: 'إسعافات أولية' },
  { id: 'endotracheal_tube', name: 'أنبوب رغامي', category: 'إسعافات أولية' },
  { id: 'airway_oral', name: 'مجرى هوائي فموي', category: 'إسعافات أولية' },
  { id: 'airway_nasal', name: 'مجرى هوائي أنفي', category: 'إسعافات أولية' },

  
  // أدوات التطعيم
  { id: 'vaccine_fridge', name: 'ثلاجة لقاحات', category: 'التطعيمات' },
  { id: 'vaccine_freezer', name: 'فريزر لقاحات', category: 'التطعيمات' },
  { id: 'serum_fridge', name: 'ثلاجة أمصال مخصصة', category: 'التطعيمات' },
  { id: 'vaccine_carrier', name: 'حافظة لقاحات', category: 'التطعيمات' },
  { id: 'cold_box', name: 'صندوق تبريد', category: 'التطعيمات' },
  { id: 'ice_pack', name: 'أكياس ثلج', category: 'التطعيمات' },
  { id: 'temp_monitor', name: 'جهاز مراقبة درجة الحرارة', category: 'التطعيمات' },
  { id: 'data_logger', name: 'جهاز تسجيل درجات الحرارة', category: 'التطعيمات' },
  { id: 'vaccine_tray', name: 'صينية لقاحات', category: 'التطعيمات' },

  // عربة الطوارئ
  { id: 'crash_cart', name: 'عربة طوارئ كاملة', category: 'عربة الطوارئ' },
  { id: 'crash_cart_defibrillator', name: 'جهاز صدمات كهربائية لعربة الطوارئ', category: 'عربة الطوارئ' },
  { id: 'crash_cart_monitor', name: 'جهاز مراقبة علامات حيوية لعربة الطوارئ', category: 'عربة الطوارئ' },
  { id: 'crash_cart_suction', name: 'جهاز شفط إفرازات صغير لعربة الطوارئ', category: 'عربة الطوارئ' },
  { id: 'crash_cart_suction_catheter', name: 'قساطر شفط متعددة المقاسات', category: 'عربة الطوارئ' },
  { id: 'crash_cart_ambu_adult', name: 'جهاز تنفس يدوي للبالغين', category: 'عربة الطوارئ' },
  { id: 'crash_cart_ambu_child', name: 'جهاز تنفس يدوي للأطفال', category: 'عربة الطوارئ' },
  { id: 'crash_cart_ambu_infant', name: 'جهاز تنفس يدوي للرضع', category: 'عربة الطوارئ' },
  { id: 'crash_cart_oxygen_cylinder', name: 'اسطوانة أكسجين لعربة الطوارئ', category: 'عربة الطوارئ' },
  { id: 'crash_cart_oxygen_mask', name: 'أقنعة أكسجين متعددة المقاسات', category: 'عربة الطوارئ' },
  { id: 'crash_cart_nasal_cannula', name: 'قنيات أنفية متعددة المقاسات', category: 'عربة الطوارئ' },
  { id: 'crash_cart_laryngoscope', name: 'منظار حنجرة مع شفرات متعددة', category: 'عربة الطوارئ' },
  { id: 'crash_cart_ett', name: 'أنابيب رغامية متعددة المقاسات', category: 'عربة الطوارئ' },
  { id: 'crash_cart_oral_airway', name: 'مجاري هوائية فموية متعددة المقاسات', category: 'عربة الطوارئ' },
  { id: 'crash_cart_nasal_airway', name: 'مجاري هوائية أنفية متعددة المقاسات', category: 'عربة الطوارئ' },
  { id: 'crash_cart_lma', name: 'قناع حنجري (LMA) متعدد المقاسات', category: 'عربة الطوارئ' },
  { id: 'crash_cart_iv_cannula', name: 'كانيولات وريدية متعددة المقاسات', category: 'عربة الطوارئ' },
  { id: 'crash_cart_iv_set', name: 'أطقم محاليل وريدية', category: 'عربة الطوارئ' },
  { id: 'crash_cart_syringes', name: 'محاقن متعددة المقاسات', category: 'عربة الطوارئ' },
  { id: 'crash_cart_tourniquet', name: 'رباط ضاغط', category: 'عربة الطوارئ' },
  { id: 'crash_cart_bp_cuff', name: 'جهاز قياس ضغط', category: 'عربة الطوارئ' },
  { id: 'crash_cart_stethoscope', name: 'سماعة طبية', category: 'عربة الطوارئ' },
  { id: 'crash_cart_pulse_oximeter', name: 'جهاز قياس الأكسجين', category: 'عربة الطوارئ' },
  { id: 'crash_cart_glucometer', name: 'جهاز قياس السكر', category: 'عربة الطوارئ' },
  { id: 'crash_cart_ecg_electrodes', name: 'أقطاب تخطيط القلب', category: 'عربة الطوارئ' },
  { id: 'crash_cart_defib_pads', name: 'لاصقات جهاز الصدمات', category: 'عربة الطوارئ' },
  { id: 'crash_cart_ng_tube', name: 'أنابيب أنفية معدية', category: 'عربة الطوارئ' },
  { id: 'crash_cart_urinary_catheter', name: 'قساطر بولية', category: 'عربة الطوارئ' },
  { id: 'crash_cart_gloves', name: 'قفازات معقمة وغير معقمة', category: 'عربة الطوارئ' },
  { id: 'crash_cart_tape', name: 'شريط لاصق طبي', category: 'عربة الطوارئ' },
  { id: 'crash_cart_gauze', name: 'شاش معقم', category: 'عربة الطوارئ' },
  { id: 'crash_cart_alcohol_swabs', name: 'مسحات كحول', category: 'عربة الطوارئ' },
  // أدوية عربة الطوارئ
  { id: 'crash_cart_adrenaline', name: 'أدرينالين (Epinephrine)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_atropine', name: 'أتروبين (Atropine)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_amiodarone', name: 'أميودارون (Amiodarone)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_adenosine', name: 'أدينوسين (Adenosine)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_lidocaine', name: 'ليدوكايين (Lidocaine)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_dopamine', name: 'دوبامين (Dopamine)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_dobutamine', name: 'دوبيوتامين (Dobutamine)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_noradrenaline', name: 'نورأدرينالين (Norepinephrine)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_sodium_bicarbonate', name: 'بيكربونات الصوديوم', category: 'عربة الطوارئ' },
  { id: 'crash_cart_calcium_gluconate', name: 'جلوكونات الكالسيوم', category: 'عربة الطوارئ' },
  { id: 'crash_cart_magnesium_sulfate', name: 'كبريتات المغنيسيوم', category: 'عربة الطوارئ' },
  { id: 'crash_cart_dextrose_50', name: 'دكستروز 50%', category: 'عربة الطوارئ' },
  { id: 'crash_cart_normal_saline', name: 'محلول ملحي 0.9%', category: 'عربة الطوارئ' },
  { id: 'crash_cart_ringer_lactate', name: 'محلول رينجر لاكتات', category: 'عربة الطوارئ' },
  { id: 'crash_cart_diazepam', name: 'ديازيبام (Diazepam)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_midazolam', name: 'ميدازولام (Midazolam)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_morphine', name: 'مورفين (Morphine)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_naloxone', name: 'نالوكسون (Naloxone)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_flumazenil', name: 'فلومازينيل (Flumazenil)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_hydrocortisone', name: 'هيدروكورتيزون (Hydrocortisone)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_dexamethasone', name: 'ديكساميثازون (Dexamethasone)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_salbutamol', name: 'سالبيوتامول (Salbutamol)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_ipratropium', name: 'إبراتروبيوم (Ipratropium)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_furosemide', name: 'فيوروسيمايد (Furosemide)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_nitroglycerin', name: 'نيتروجليسرين (Nitroglycerin)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_aspirin', name: 'أسبرين (Aspirin)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_heparin', name: 'هيبارين (Heparin)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_diphenhydramine', name: 'ديفينهيدرامين (Diphenhydramine)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_promethazine', name: 'بروميثازين (Promethazine)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_ondansetron', name: 'أوندانسيترون (Ondansetron)', category: 'عربة الطوارئ' },
  { id: 'crash_cart_metoclopramide', name: 'ميتوكلوبراميد (Metoclopramide)', category: 'عربة الطوارئ' },
  
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
  { id: 'lab_tech_for_blood_draw', name: 'وجود طبيب في العيادة وقت الوصول أو توفر ممرض مدرب لسحب العينات', category: 'المختبر' },
  { id: 'phlebotomist', name: 'مختص لسحب العينات', category: 'المختبر' },
  
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
  { id: 'separate_clinic', name: 'عيادة ليست مدمجة مع أي عيادة أخرى', category: 'أثاث طبي' },
  { id: 'emergency_patient_reception', name: 'وجود موظف مخصص للإستقبال وقت الوصول', category: 'أثاث طبي' },
  { id: 'sick_patient_waiting', name: 'توفير مريض (ق) في العيادة وقت الوصول', category: 'أثاث طبي' },
  
  // أدوات الأسنان
  { id: 'dental_chair', name: 'كرسي أسنان', category: 'طب الأسنان' },
  { id: 'dental_unit', name: 'وحدة أسنان متكاملة', category: 'طب الأسنان' },
  { id: 'dental_xray', name: 'جهاز أشعة أسنان', category: 'طب الأسنان' },
  { id: 'panoramic_xray', name: 'جهاز أشعة بانورامية', category: 'طب الأسنان' },
  { id: 'dental_lead_apron', name: 'دروع واقية من الأشعة لعيادة الأسنان', category: 'طب الأسنان' },
  { id: 'dental_lead_thyroid_collar', name: 'واقي الغدة الدرقية من الأشعة', category: 'طب الأسنان' },
  { id: 'dental_lead_glasses', name: 'نظارات واقية من الأشعة', category: 'طب الأسنان' },
  { id: 'dental_instruments', name: 'أدوات أسنان أساسية', category: 'طب الأسنان' },
  { id: 'dental_sterilizer', name: 'جهاز تعقيم أسنان', category: 'طب الأسنان' },
  { id: 'dental_compressor', name: 'ضاغط هواء أسنان', category: 'طب الأسنان' },
  { id: 'dental_suction', name: 'جهاز شفط أسنان', category: 'طب الأسنان' },
  { id: 'ultrasonic_scaler', name: 'جهاز تنظيف بالموجات', category: 'طب الأسنان' },
  { id: 'light_cure', name: 'جهاز تصليب الحشوات', category: 'طب الأسنان' },
  { id: 'amalgamator', name: 'جهاز خلط الحشوات', category: 'طب الأسنان' },
  
  // تجهيزات سيارة الإسعاف الطبية
  { id: 'ambulance_monitor', name: 'جهاز مراقبة علامات حيوية (مونيتور) لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_defibrillator', name: 'جهاز صدمات كهربائية لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_aed', name: 'جهاز الصدمات الآلي (AED) لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_ventilator', name: 'جهاز تنفس صناعي محمول', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_suction', name: 'جهاز شفط محمول لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_oxygen_system', name: 'نظام أكسجين متكامل لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_oxygen_cylinder_main', name: 'اسطوانة أكسجين رئيسية لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_oxygen_cylinder_portable', name: 'اسطوانة أكسجين محمولة لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_oxygen_regulator', name: 'منظم أكسجين لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_ambu_bag_adult', name: 'جهاز تنفس يدوي للبالغين (Ambu Bag)', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_ambu_bag_child', name: 'جهاز تنفس يدوي للأطفال (Ambu Bag)', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_ambu_bag_infant', name: 'جهاز تنفس يدوي للرضع (Ambu Bag)', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_laryngoscope_set', name: 'طقم منظار حنجرة كامل', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_intubation_kit', name: 'طقم تنبيب رغامي', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_airway_set', name: 'طقم مجاري هوائية متعددة المقاسات', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_iv_kit', name: 'طقم محاليل وريدية', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_infusion_pump', name: 'مضخة محاليل وريدية', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_bp_monitor', name: 'جهاز قياس ضغط لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_pulse_oximeter', name: 'جهاز قياس الأكسجين لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_glucometer', name: 'جهاز قياس السكر لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_thermometer', name: 'ميزان حرارة لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_stethoscope', name: 'سماعة طبية لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_ecg_portable', name: 'جهاز تخطيط قلب محمول', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_stretcher_main', name: 'نقالة رئيسية لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_stretcher_scoop', name: 'نقالة مجرفية لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_spine_board', name: 'لوح العمود الفقري لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_head_immobilizer', name: 'مثبت رأس لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_cervical_collar_set', name: 'طقم أطواق رقبة متعددة المقاسات', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_ked', name: 'جهاز استخراج كيندريك (KED)', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_splint_set', name: 'طقم جبائر متعددة المقاسات', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_traction_splint', name: 'جبيرة شد لكسور الفخذ', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_vacuum_splint', name: 'جبائر هوائية/فراغية', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_burn_kit', name: 'طقم إسعاف الحروق', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_trauma_kit', name: 'طقم إسعاف الإصابات', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_obstetric_kit', name: 'طقم ولادة طارئة', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_medication_box', name: 'صندوق أدوية الطوارئ', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_first_aid_kit', name: 'حقيبة إسعافات أولية كاملة', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_dressing_kit', name: 'طقم ضمادات وغيارات', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_tourniquet', name: 'رباط ضاغط لوقف النزيف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_sharps_container', name: 'حاوية الأدوات الحادة لسيارة الإسعاف', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_medical_waste_bag', name: 'أكياس نفايات طبية', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_blanket_thermal', name: 'بطانية حرارية للطوارئ', category: 'سيارة الإسعاف - طبي' },
  { id: 'ambulance_sheet_disposable', name: 'ملاءات استخدام واحد', category: 'سيارة الإسعاف - طبي' },

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
  { id: 'desk_employee', name: 'مكتب موظف', category: 'أثاث مكتبي' },
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
  { id: 'bookcase', name: 'دولاب مكتبي واجهة زجاج', category: 'أثاث مكتبي' },
  { id: 'counter', name: 'كاونتر استقبال', category: 'أثاث مكتبي' },
  { id: 'meeting_table', name: 'طاولة اجتماعات', category: 'أثاث مكتبي' },
  { id: 'coffee_table', name: 'طاولة قهوة', category: 'أثاث مكتبي' },
  { id: 'side_table', name: 'طاولة جانبية', category: 'أثاث مكتبي' },
  { id: 'drawer_unit', name: 'وحدة أدراج', category: 'أثاث مكتبي' },
  { id: 'coat_hanger', name: 'علاقة ملابس', category: 'أثاث مكتبي' },
  { id: 'notice_board', name: 'لوحة إعلانات', category: 'أثاث مكتبي' },
  { id: 'whiteboard', name: 'سبورة بيضاء', category: 'أثاث مكتبي' },
  { id: 'corkboard', name: 'لوحة فلين', category: 'أثاث مكتبي' },
  { id: 'nursing_staff_training', name: 'طاقم التمريض مدرب على استخدام جهاز التصوير التلفزيوني', category: 'التدريب والكوادر' },
  { id: 'good_lab_samples', name: 'كرسي سحب عينات', category: 'التدريب والكوادر' },
  { id: 'lab_transfer_confirmation', name: 'لا يوجد تأخير في نقل العينات المختبر المركزي أو المستشفى', category: 'التدريب والكوادر' },
  { id: 'door_glass_frosting', name: 'زجاج شفاف فقط لدخالات مكافحة العدوى', category: 'التدريب والكوادر' },
  { id: 'infection_control_reports', name: 'تقارير دورية صادرة من موظف الأمن والسلامة', category: 'التدريب والكوادر' },
  { id: 'patient_safety_procedures', name: 'وجود اشتراطات وسلامة تخزين المواد', category: 'التدريب والكوادر' },
  { id: 'medication_storage_safety', name: 'وجود اشتراطات وسلامة تخزين المواد المخدرة', category: 'التدريب والكوادر' },
  { id: 'expired_medicines_list', name: 'وجود قائمة بإنتهاء صلاحية الأدوية', category: 'التدريب والكوادر' },
  { id: 'iqama_system', name: 'عدم استخدام نظام عينى الإلكتروني', category: 'التدريب والكوادر' },
  
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
  { id: 'projector_screen', name: 'شاشة عرض', category: 'أجهزة إلكترونية' },
  { id: 'tv_screen', name: 'شاشة تلفزيون', category: 'أجهزة إلكترونية' },
  { id: 'tv_bracket', name: 'حامل شاشة', category: 'أجهزة إلكترونية' },
  { id: 'cctv', name: 'كاميرات مراقبة', category: 'أجهزة إلكترونية' },
  { id: 'dvr', name: 'جهاز تسجيل DVR', category: 'أجهزة إلكترونية' },
  { id: 'fingerprint', name: 'جهاز بصمة', category: 'أجهزة إلكترونية' },
  { id: 'intercom', name: 'نظام اتصال داخلي', category: 'أجهزة إلكترونية' },
  { id: 'paging_system', name: 'نظام نداء داخلي كامل', category: 'أجهزة إلكترونية' },
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
  { id: 'security_system_full', name: 'نظام أمني كامل (كاميرات وجهاز تسجيل وجهاز إنذار ضد السرقة)', category: 'الأمن والسلامة' },
  { id: 'fire_alarm_panel', name: 'لوحة إنذار حريق', category: 'سلامة وأمان' },
  { id: 'smoke_detector', name: 'كاشف دخان', category: 'سلامة وأمان' },
  { id: 'heat_detector', name: 'كاشف حرارة', category: 'سلامة وأمان' },
  { id: 'manual_call_point', name: 'نقطة نداء يدوية', category: 'سلامة وأمان' },
  { id: 'first_aid_sign', name: 'لوحة إسعافات أولية', category: 'سلامة وأمان' },
  { id: 'exit_sign', name: 'لوحة مخرج طوارئ', category: 'سلامة وأمان' },
  { id: 'safety_cabinet', name: 'خزانة معدات السلامة', category: 'سلامة وأمان' },
  { id: 'fire_door', name: 'باب مقاوم للحريق', category: 'سلامة وأمان' },
  { id: 'safety_signs_emergency_exit', name: 'لوحات إرشادية لمخرج الطوارئ', category: 'سلامة وأمان' },
  { id: 'safety_signs_assembly_point', name: 'لوحات إرشادية لنقطة التجمع', category: 'سلامة وأمان' },
  { id: 'safety_signs_clinic_locations', name: 'لوحات إرشادية لمواقع العيادات', category: 'سلامة وأمان' },
  { id: 'safety_signs_working_hours', name: 'لوحات إرشادية لوقت العمل بالمركز (معلقة في السقف)', category: 'سلامة وأمان' },
  { id: 'safety_signs_working_hours_wall', name: 'لوحات إرشادية لوقت العمل', category: 'سلامة وأمان' },
  { id: 'emergency_shower', name: 'دش طوارئ', category: 'سلامة وأمان' },
  { id: 'eyewash_station', name: 'محطة غسيل عيون', category: 'سلامة وأمان' },
  { id: 'clinic_glass_no_barrier', name: 'الصيدلية بدون حاجز أو حاجز زجاجي شفاف مع فتحات للتواصل', category: 'سلامة وأمان' },
  { id: 'pharmacy_good_outside', name: 'مستوى النظافة العامة جيد في المحيط الخارجي', category: 'سلامة وأمان' },
  { id: 'pharmacy_good_inside', name: 'الصيدلية النظافة العامة جيد في المحيط الخارجي والداخلي', category: 'سلامة وأمان' },
  { id: 'emergency_case_handling', name: 'يتم تضمين الحال جيد مع وجوب إحالة الانتقال والي في أماكن الإنتقال في الممرات', category: 'سلامة وأمان' },
  { id: 'equipment_tracking', name: 'توفير طوراً وفق الاشتراطات', category: 'سلامة وأمان' },
  { id: 'operating_hours_display', name: 'توفير لوحة ساعات العمل على المدخل الرئيسي', category: 'سلامة وأمان' },
  { id: 'welcoming_sign', name: 'توفير لوحة تعريفية يحدد المريض بمكان واضح', category: 'سلامة وأمان' },
  { id: 'disability_sign', name: 'يتوفر مخصص للعلامات الأرضية (يلي مدمج مع أي عيادة أخرى)', category: 'سلامة وأمان' },
  { id: 'disability_wheelchair_pathway', name: 'توفر طريق للذوي الإعاقة حسب الاشتراطات', category: 'سلامة وأمان' },
  { id: 'tv_display', name: 'توفر شاشة عرض أثناء الزيارة بها محتوى تثقيف صحي واضح', category: 'سلامة وأمان' },
  { id: 'patient_rights_display', name: 'توفر لوحة لحقوق المريض واضح (ليس منفذ عيادة الضماد)', category: 'سلامة وأمان' },
  { id: 'ground_paths_disability', name: 'وجود مسارات أرضية لمساعدة ذوي الإعاقة البصرية للوصول إلى محطة الاستقبال', category: 'سلامة وأمان' },
  { id: 'seha_id_display', name: 'توفر موقع الكترون قبل أساسي المختبر المركز أو المستشفى', category: 'سلامة وأمان' },
  { id: 'sign_language_translation', name: 'توفر ترجمة لغة إشارة أو وسائل تواصل بلغة الإشارة', category: 'سلامة وأمان' },
  { id: 'active_speaker_sign', name: 'نشاطات ناطقة في مكان انتظار المراجعين لتوجيه المستفيدين إلى محطات الخدمة', category: 'سلامة وأمان' },
  { id: 'public_area_cleanliness', name: 'جيد مستوى النظافة العامة جيد في المحيط الخارجي', category: 'سلامة وأمان' },
  
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
  { id: 'toilet_arabic', name: 'كرسي دورة مياه (عربي)', category: 'معدات متنوعة' },
  { id: 'toilet_western', name: 'كرسي دورة مياه (افرنجي)', category: 'معدات متنوعة' },
  { id: 'sink_regular', name: 'مغسلة أيدي عادية', category: 'معدات متنوعة' },
  { id: 'sink_accessible', name: 'مغسلة أيدي مخصصة لذوي الاحتياجات الخاصة', category: 'معدات متنوعة' },
  { id: 'electronic_queue_system', name: 'نظام انتظار الكتروني', category: 'معدات متنوعة' },
  { id: 'id_nationality_number_badge', name: 'بطاقة إبراز الهوية الوطنية - الإقامة', category: 'معدات متنوعة' },
  { id: 'national_id_request_stamp', name: 'طلب طلب إبراز الهوية الوطنية - الإقامة', category: 'معدات متنوعة' },
  { id: 'disability_toilet_water', name: 'دورات مياه ذوي الإعاقة نقطة للخارج', category: 'معدات متنوعة' },
  { id: 'vital_signs_area', name: 'قياس جميع العلامات الحيوية (الوزن، الطول، الحرارة، والضغط) في موقع مخصص', category: 'معدات متنوعة' },
  { id: 'health_awareness_screen', name: 'شاشة توعية صحية أو إعلانات في مكان انتظار المراجعين', category: 'معدات متنوعة' },
  { id: 'sample_draw_available', name: 'سحب العينات متاح طوال فترة الدوام', category: 'معدات متنوعة' },
  { id: 'pregnancy_followup_clinic', name: 'عيادة متابعة الحمل متاحة طوال أيام الأسبوع', category: 'معدات متنوعة' },
  { id: 'lab_check_results', name: 'غرفة فحص الأخبار', category: 'معدات متنوعة' },
  { id: 'all_vital_measurements', name: 'قياس جميع العلامات الحيوية (اللون، الطول، والضغط والحرارة)', category: 'معدات متنوعة' },
  { id: 'special_clinic_hours', name: 'عيادات تخصصية', category: 'معدات متنوعة' },
  { id: 'added_clinic', name: 'عيادة مضافة', category: 'معدات متنوعة' },
  { id: 'leather_waiting_chairs', name: 'كراسي انتظار مريحة (جلد)', category: 'معدات متنوعة' },
  
  // سهولة الوصول
  { id: 'wheelchair_path_disability', name: 'ممر جانبي لموقع ذوي الإعاقة يساعد للمركز المتحرك', category: 'سهولة الوصول' },
  { id: 'wheelchair_ramp_disability', name: 'مساحة دورات مياه ذوي الإعاقة مناسبة لدخول الكرسي المتحرك', category: 'سهولة الوصول' },
  { id: 'wheelchair_toilet_disability', name: 'مقابض ذوي الإعاقة بدورات المياه', category: 'سهولة الوصول' },
  { id: 'automatic_main_gate', name: 'بوابة رئيسية تفتح آلياً', category: 'سهولة الوصول' },
  { id: 'bathroom_support_handles', name: 'مقابض مساندة في دورات المياه', category: 'سهولة الوصول' },
  
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

  // تجهيزات عامة
  { id: 'national_flag', name: 'العلم الوطني السعودي', category: 'تجهيزات عامة' },
  { id: 'royal_photos', name: 'صور ملكية', category: 'تجهيزات عامة' },
  { id: 'center_visual_identity', name: 'هوية بصرية للمركز (اسم المركز وشعار التجمع الجديد)', category: 'تجهيزات عامة' },
  { id: 'center_name_board', name: 'لوحة اسم المركز الخارجية', category: 'تجهيزات عامة' },
  { id: 'cluster_logo', name: 'شعار التجمع الصحي', category: 'تجهيزات عامة' },
  { id: 'moh_logo', name: 'شعار وزارة الصحة', category: 'تجهيزات عامة' },
  { id: 'vision_2030_logo', name: 'شعار رؤية 2030', category: 'تجهيزات عامة' },

  // تجهيزات سيارة الإسعاف غير الطبية
  { id: 'ambulance_vehicle', name: 'سيارة إسعاف', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_siren_system', name: 'نظام صافرة وإنذار', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_lights_emergency', name: 'أضواء طوارئ (فلاشر)', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_radio_system', name: 'جهاز اتصال لاسلكي', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_gps', name: 'جهاز تحديد المواقع (GPS)', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_camera', name: 'كاميرا مراقبة داخلية', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_dvr', name: 'جهاز تسجيل فيديو', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_ac', name: 'مكيف هواء للمقصورة الخلفية', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_heater', name: 'نظام تدفئة للمقصورة الخلفية', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_interior_lights', name: 'إضاءة داخلية LED', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_spotlight', name: 'كشاف إضاءة خارجي', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_inverter', name: 'محول كهرباء (Inverter)', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_power_outlets', name: 'مقابس كهرباء 220 فولت', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_usb_charger', name: 'شواحن USB', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_storage_cabinet', name: 'خزائن تخزين داخلية', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_drawer_unit', name: 'وحدة أدراج للمعدات', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_iv_hook', name: 'علاقة محاليل وريدية', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_oxygen_holder', name: 'حامل اسطوانة أكسجين', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_stretcher_mount', name: 'نظام تثبيت النقالة', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_seat_attendant', name: 'مقعد المسعف', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_seat_patient', name: 'مقعد مرافق المريض', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_handrails', name: 'مقابض يد داخلية', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_step', name: 'درجة صعود خلفية', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_ramp', name: 'منحدر تحميل النقالة', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_partition', name: 'فاصل بين مقصورة القيادة والمريض', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_window_tint', name: 'تظليل نوافذ المقصورة الخلفية', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_floor_mat', name: 'أرضية قابلة للتنظيف', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_fire_extinguisher', name: 'طفاية حريق لسيارة الإسعاف', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_warning_triangle', name: 'مثلث تحذير', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_reflective_vest', name: 'سترات عاكسة للطاقم', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_flashlight', name: 'كشاف يدوي', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_tool_kit', name: 'طقم أدوات صيانة', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_spare_tire', name: 'إطار احتياطي', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_jack', name: 'رافعة سيارة', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_tow_rope', name: 'حبل سحب', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_jumper_cables', name: 'كوابل شحن البطارية', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_first_aid_sign', name: 'لوحة الهلال الأحمر/الإسعاف', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_phone_holder', name: 'حامل هاتف/جهاز اتصال', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_clipboard', name: 'لوحة كتابة للتقارير', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_forms', name: 'نماذج تقارير الإسعاف', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_driver_license', name: 'رخصة قيادة سيارة إسعاف', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_registration', name: 'استمارة السيارة سارية', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_insurance', name: 'تأمين السيارة ساري', category: 'سيارة الإسعاف - غير طبي' },
  { id: 'ambulance_inspection', name: 'فحص دوري ساري', category: 'سيارة الإسعاف - غير طبي' },
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
  const [editingItem, setEditingItem] = useState(null);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState('');
  const [showAddCustomItem, setShowAddCustomItem] = useState(false);
  const [showHiddenItems, setShowHiddenItems] = useState(false);
  const [customMedicalItems, setCustomMedicalItems] = useState([]);
  const [customNonMedicalItems, setCustomNonMedicalItems] = useState([]);
  const [hiddenItems, setHiddenItems] = useState([]);
  const [editingReportId, setEditingReportId] = useState(null);

  useEffect(() => {
    loadHealthCenters();
    loadSavedReports();
    loadCustomItems();
    loadHiddenItems();
    loadPreviouslySelectedItems();
  }, []);

  // حفظ العناصر المختارة تلقائياً عند التغيير
  useEffect(() => {
    if (selectedItems.length > 0) {
      localStorage.setItem('previously_selected_deficiency_items', JSON.stringify(selectedItems));
    }
  }, [selectedItems]);

  const loadPreviouslySelectedItems = () => {
    const saved = localStorage.getItem('previously_selected_deficiency_items');
    if (saved) {
      try {
        const items = JSON.parse(saved);
        setSelectedItems(items);
      } catch (e) {
        console.error('Error loading previously selected items:', e);
      }
    }
  };

  const loadCustomItems = async () => {
    try {
      // تحميل من قاعدة البيانات
      const items = await base44.entities.DeficiencyCustomItem.list();
      const medical = items.filter(i => i.item_type === 'medical').map(i => ({
        id: i.id,
        name: i.name,
        category: i.category || 'مخصص'
      }));
      const nonMedical = items.filter(i => i.item_type === 'nonmedical').map(i => ({
        id: i.id,
        name: i.name,
        category: i.category || 'مخصص'
      }));
      setCustomMedicalItems(medical);
      setCustomNonMedicalItems(nonMedical);
    } catch (error) {
      console.error('Error loading custom items:', error);
      // fallback to localStorage
      const savedMedical = localStorage.getItem('custom_medical_items');
      const savedNonMedical = localStorage.getItem('custom_nonmedical_items');
      if (savedMedical) setCustomMedicalItems(JSON.parse(savedMedical));
      if (savedNonMedical) setCustomNonMedicalItems(JSON.parse(savedNonMedical));
    }
  };

  const loadHiddenItems = () => {
    const saved = localStorage.getItem('hidden_deficiency_items');
    if (saved) setHiddenItems(JSON.parse(saved));
  };

  const hideItemPermanently = (itemId) => {
    const updated = [...hiddenItems, itemId];
    setHiddenItems(updated);
    localStorage.setItem('hidden_deficiency_items', JSON.stringify(updated));
    // إزالة العنصر من المحددات إن كان موجوداً
    setSelectedItems(prev => prev.filter(i => i.id !== itemId));
    toast.success('تم إخفاء العنصر نهائياً');
  };

  const restoreHiddenItem = (itemId) => {
    const updated = hiddenItems.filter(id => id !== itemId);
    setHiddenItems(updated);
    localStorage.setItem('hidden_deficiency_items', JSON.stringify(updated));
    toast.success('تم استعادة العنصر');
  };

  const saveCustomItemToList = async (item) => {
    try {
      // حفظ في قاعدة البيانات
      const created = await base44.entities.DeficiencyCustomItem.create({
        name: item.name,
        category: item.category || 'مخصص',
        item_type: item.type
      });
      
      const newItem = {
        id: created.id,
        name: item.name,
        category: item.category || 'مخصص',
      };
      
      if (item.type === 'medical') {
        setCustomMedicalItems(prev => [...prev, newItem]);
      } else {
        setCustomNonMedicalItems(prev => [...prev, newItem]);
      }
      toast.success('تم إضافة العنصر للقائمة الثابتة');
    } catch (error) {
      console.error('Error saving custom item:', error);
      toast.error('فشل في حفظ العنصر');
    }
  };

  const removeCustomItemFromList = async (itemId, type) => {
    try {
      // حذف من قاعدة البيانات
      await base44.entities.DeficiencyCustomItem.delete(itemId);
      
      if (type === 'medical') {
        setCustomMedicalItems(prev => prev.filter(i => i.id !== itemId));
      } else {
        setCustomNonMedicalItems(prev => prev.filter(i => i.id !== itemId));
      }
      toast.success('تم حذف العنصر من القائمة');
    } catch (error) {
      console.error('Error removing custom item:', error);
      toast.error('فشل في حذف العنصر');
    }
  };

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
    try {
      // تحميل التقارير من قاعدة البيانات
      const reports = await base44.entities.DeficiencyReport.list('-created_date', 100);
      const formattedReports = reports.map(r => ({
        id: r.id,
        title: r.title,
        center: r.center_name,
        items: JSON.parse(r.items || '[]'),
        date: r.created_date,
      }));
      setSavedReports(formattedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      // fallback to localStorage
      const saved = localStorage.getItem('deficiency_reports');
      if (saved) {
        setSavedReports(JSON.parse(saved));
      }
    }
  };

  const saveReport = async () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء اختيار مركز وإضافة عناصر للتقرير');
      return;
    }

    try {
      const medicalCount = selectedItems.filter(i => i.type === 'medical').length;
      const nonMedicalCount = selectedItems.filter(i => i.type === 'nonmedical').length;
      
      // حفظ في قاعدة البيانات
      const created = await base44.entities.DeficiencyReport.create({
        title: reportTitle || `تقرير نواقص ${selectedCenter}`,
        center_name: selectedCenter,
        items: JSON.stringify(selectedItems),
        medical_count: medicalCount,
        nonmedical_count: nonMedicalCount,
        total_count: selectedItems.length,
      });

      const report = {
        id: created.id,
        title: created.title,
        center: selectedCenter,
        items: selectedItems,
        date: new Date().toISOString(),
      };

      setSavedReports(prev => [...prev, report]);
      toast.success('تم حفظ التقرير');
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('فشل في حفظ التقرير');
    }
  };

  const deleteReport = async (reportId) => {
    try {
      // حذف من قاعدة البيانات
      await base44.entities.DeficiencyReport.delete(reportId);
      setSavedReports(prev => prev.filter(r => r.id !== reportId));
      toast.success('تم حذف التقرير');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('فشل في حذف التقرير');
    }
  };

  const loadReport = (report, forEditing = false) => {
    setSelectedCenter(report.center);
    setSelectedItems(report.items);
    setReportTitle(report.title);
    if (forEditing) {
      setEditingReportId(report.id);
    } else {
      setEditingReportId(null);
    }
    setShowSavedReports(false);
    toast.success(forEditing ? 'تم تحميل التقرير للتعديل' : 'تم تحميل التقرير');
  };

  const updateExistingReport = async () => {
    if (!editingReportId || !selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء التأكد من وجود بيانات للحفظ');
      return;
    }

    try {
      const medicalCount = selectedItems.filter(i => i.type === 'medical').length;
      const nonMedicalCount = selectedItems.filter(i => i.type === 'nonmedical').length;
      
      await base44.entities.DeficiencyReport.update(editingReportId, {
        title: reportTitle || `تقرير نواقص ${selectedCenter}`,
        center_name: selectedCenter,
        items: JSON.stringify(selectedItems),
        medical_count: medicalCount,
        nonmedical_count: nonMedicalCount,
        total_count: selectedItems.length,
      });

      setSavedReports(prev => prev.map(r => 
        r.id === editingReportId 
          ? { ...r, title: reportTitle || `تقرير نواقص ${selectedCenter}`, center: selectedCenter, items: selectedItems }
          : r
      ));
      
      toast.success('تم تحديث التقرير بنجاح');
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('فشل في تحديث التقرير');
    }
  };

  const cancelEditing = () => {
    setEditingReportId(null);
    setSelectedItems([]);
    setSelectedCenter('');
    setReportTitle('');
    toast.info('تم إلغاء التعديل');
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

  const updateItemName = (itemId, newName) => {
    setSelectedItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, name: newName } : item
    ));
    setEditingItem(null);
  };

  const moveItemToOtherType = (itemId) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newType = item.type === 'medical' ? 'nonmedical' : 'medical';
        return { ...item, type: newType };
      }
      return item;
    }));
    toast.success('تم نقل العنصر');
  };

  const addCustomItem = (addToMainList = true) => {
    if (!customItemName.trim()) {
      toast.error('الرجاء إدخال اسم العنصر');
      return;
    }
    
    const newItem = {
      id: `custom_${Date.now()}`,
      name: customItemName.trim(),
      category: customItemCategory.trim() || 'مخصص',
      type: activeTab,
      quantity: 1,
      isCustom: true
    };
    
    // إضافة للقائمة المحددة
    setSelectedItems(prev => [...prev, newItem]);
    
    // إضافة للقائمة الثابتة لاستخدامها مستقبلاً
    if (addToMainList) {
      saveCustomItemToList(newItem);
    }
    
    setCustomItemName('');
    setCustomItemCategory('');
    setShowAddCustomItem(false);
    toast.success('تم إضافة العنصر للقائمة');
  };

  const isSelected = (itemId) => selectedItems.some(i => i.id === itemId);
  const getSelectedQuantity = (itemId) => selectedItems.find(i => i.id === itemId)?.quantity || 1;

  const currentList = (activeTab === 'medical' 
    ? [...medicalEquipmentList, ...customMedicalItems] 
    : [...nonMedicalEquipmentList, ...customNonMedicalItems]
  ).filter(item => !hiddenItems.includes(item.id));
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

    // تحديد نوع التجهيزات (طبية/غير طبية/مختلطة)
    const allItems = Object.values(centerData).flat();
    const hasMedical = allItems.some(i => i.type === 'medical');
    const hasNonMedical = allItems.some(i => i.type === 'nonmedical');
    const equipmentType = hasMedical && hasNonMedical 
      ? 'التجهيزات الطبية وغير الطبية'
      : hasMedical 
        ? 'التجهيزات الطبية'
        : 'التجهيزات غير الطبية';

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير نواقص المراكز الصحية</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; background: #f8fafc; padding: 30px; color: #1e293b; }
    .container { max-width: 1000px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: white; padding: 40px; border-radius: 20px; margin-bottom: 30px; text-align: center; }
    .header h1 { font-size: 2rem; margin-bottom: 10px; }
    .header h2 { font-size: 1.3rem; opacity: 0.9; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); margin-bottom: 30px; }
    th { background: #1e293b; color: white; padding: 15px 12px; text-align: right; font-weight: 700; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    tr:hover { background: #f8fafc; }
    tr:nth-child(even) { background: #f8fafc; }
    .quantity { font-weight: 800; color: #0f766e; text-align: center; }
    .footer { text-align: center; padding: 30px; color: #64748b; border-top: 2px solid #e2e8f0; margin-top: 30px; }
    @media print { body { background: white; padding: 10px; } .header, .center-section { box-shadow: none; border: 1px solid #e2e8f0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>المراكز الصحية بالحناكية</h1>
      <h2>النواقص في ${equipmentType}</h2>
    </div>
    
    <table>
      <thead>
        <tr>
          <th style="width: 60px;">#</th>
          <th style="width: 200px;">المركز</th>
          <th>اسم الجهاز</th>
          <th style="width: 100px;">الكمية</th>
        </tr>
      </thead>
      <tbody>
        ${(() => {
          let counter = 0;
          return Object.entries(centerData).map(([center, items]) => 
            items.map(item => {
              counter++;
              return `
                <tr>
                  <td>${counter}</td>
                  <td>${center}</td>
                  <td>${item.name}</td>
                  <td class="quantity">${item.quantity}</td>
                </tr>
              `;
            }).join('')
          ).join('');
        })()}
      </tbody>
    </table>
    
    <div class="footer">
      <p>وزارة الصحة - قطاع الحناكية الصحي</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/40">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
                <Package className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-1">نواقص المراكز الصحية</h1>
                <p className="text-teal-100 text-sm md:text-base">توثيق وإدارة نواقص التجهيزات الطبية وغير الطبية</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/20">
                <p className="text-2xl md:text-3xl font-bold">{healthCenters.length}</p>
                <p className="text-xs text-teal-100">مركز صحي</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/20">
                <p className="text-2xl md:text-3xl font-bold">{savedReports.length}</p>
                <p className="text-xs text-teal-100">تقرير محفوظ</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/20">
                <p className="text-2xl md:text-3xl font-bold">{selectedItems.length}</p>
                <p className="text-xs text-teal-100">عنصر محدد</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* اختيار المركز والقائمة */}
          <div className="lg:col-span-2 space-y-5">
            {/* شريط الأدوات */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* اختيار المركز */}
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500 mb-1 block">المركز الصحي</Label>
                    <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                      <SelectTrigger className="h-12 bg-white border-2 border-gray-200 focus:border-teal-500 transition-colors">
                        <SelectValue placeholder="اختر المركز الصحي..." />
                      </SelectTrigger>
                      <SelectContent>
                        {healthCenters.map(center => (
                          <SelectItem key={center.id} value={center.اسم_المركز}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-teal-600" />
                              {center.اسم_المركز}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* أزرار الإجراءات */}
                  <div className="flex flex-wrap gap-2 items-end">
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
                        disabled={isAnalyzing}
                        className="h-12 cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200"
                      >
                        <span>
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                              جاري التحليل...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 ml-2" />
                              تحليل ملف
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSavedReports(true)}
                      className="h-12 border-2"
                    >
                      <List className="w-4 h-4 ml-2" />
                      المحفوظة
                      <Badge className="mr-2 bg-gray-100">{savedReports.length}</Badge>
                    </Button>
                    {hiddenItems.length > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowHiddenItems(true)}
                        className="h-12 border-2 border-gray-300"
                        title="العناصر المخفية"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        مخفي
                        <Badge className="mr-2 bg-gray-100">{hiddenItems.length}</Badge>
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={openMultiCenterExport}
                      disabled={savedReports.length === 0}
                      className="h-12 border-2 border-teal-200 text-teal-700 hover:bg-teal-50"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تقرير شامل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* قائمة الأدوات */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b bg-gradient-to-r from-gray-50 to-gray-100 p-2">
                  <TabsList className="grid grid-cols-2 w-full bg-white/50 p-1 h-auto">
                    <TabsTrigger value="medical" className="gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                      <Stethoscope className="w-5 h-5" />
                      <span className="font-semibold">التجهيزات الطبية</span>
                      <Badge className="bg-white/20 text-inherit border-0">{medicalEquipmentList.length + customMedicalItems.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="nonmedical" className="gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                      <Wrench className="w-5 h-5" />
                      <span className="font-semibold">التجهيزات غير الطبية</span>
                      <Badge className="bg-white/20 text-inherit border-0">{nonMedicalEquipmentList.length + customNonMedicalItems.length}</Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <CardContent className="p-4">
                  {/* البحث */}
                  <div className="relative mb-4">
                    <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="ابحث عن أداة أو تصنيف..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-11 h-12 bg-gray-50 border-2 border-gray-200 focus:border-teal-500 focus:bg-white transition-all text-base"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* عدد النتائج */}
                  {searchQuery && (
                    <div className="mb-3 text-sm text-gray-500">
                      عرض {filteredItems.length} من {currentList.length} عنصر
                    </div>
                  )}

                  {/* القائمة */}
                  <div className="max-h-[500px] overflow-y-auto space-y-4 custom-scrollbar">
                    {/* قسم العناصر المختارة سابقاً */}
                    {(() => {
                      const selectedInCurrentTab = selectedItems.filter(item => item.type === activeTab);
                      if (selectedInCurrentTab.length === 0) return null;
                      
                      return (
                        <div className="space-y-2">
                          <div className={`sticky top-0 z-20 flex items-center justify-between px-4 py-3 rounded-xl ${
                            activeTab === 'medical' 
                              ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300' 
                              : 'bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300'
                          }`}>
                            <h4 className="font-bold text-amber-800 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-amber-600" />
                              تم اختيارها سابقاً
                            </h4>
                            <Badge className="bg-amber-600 text-white">
                              {selectedInCurrentTab.length} محدد
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {selectedInCurrentTab.map(item => (
                              <div
                                key={`selected-${item.id}`}
                                className={`group flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer relative ${
                                  activeTab === 'medical'
                                    ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50 shadow-md shadow-teal-100' 
                                    : 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-md shadow-purple-100'
                                }`}
                                onClick={() => toggleItem(item)}
                              >
                                <Checkbox
                                  checked={true}
                                  onClick={(e) => e.stopPropagation()}
                                  className={activeTab === 'medical' ? 'border-teal-600 data-[state=checked]:bg-teal-600' : 'border-purple-600 data-[state=checked]:bg-purple-600'}
                                />
                                <span className="flex-1 text-sm font-medium text-gray-900">
                                  {item.name}
                                  {item.isCustom && <span className="text-xs text-orange-500 mr-1">(مخصص)</span>}
                                </span>
                                <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-gray-100"
                                    onClick={() => updateQuantity(item.id, getSelectedQuantity(item.id) - 1)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={getSelectedQuantity(item.id)}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                    className="w-12 h-7 text-center text-sm p-1 border-0 bg-gray-50 font-bold"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-gray-100"
                                    onClick={() => updateQuantity(item.id, getSelectedQuantity(item.id) + 1)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                    {categories.map(category => {
                      const categoryItems = filteredItems.filter(item => item.category === category);
                      if (categoryItems.length === 0) return null;

                      const selectedInCategory = categoryItems.filter(item => isSelected(item.id)).length;

                      return (
                        <div key={category} className="space-y-2">
                          <div className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3 rounded-xl ${
                            activeTab === 'medical' 
                              ? 'bg-gradient-to-r from-teal-100 to-emerald-100 border border-teal-200' 
                              : 'bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200'
                          }`}>
                            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                              {activeTab === 'medical' ? (
                                <Stethoscope className="w-4 h-4 text-teal-600" />
                              ) : (
                                <Wrench className="w-4 h-4 text-purple-600" />
                              )}
                              {category}
                            </h4>
                            <div className="flex items-center gap-2">
                              {selectedInCategory > 0 && (
                                <Badge className={activeTab === 'medical' ? 'bg-teal-600' : 'bg-purple-600'}>
                                  {selectedInCategory} محدد
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-white/80">{categoryItems.length}</Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {categoryItems.map(item => {
                              const selected = isSelected(item.id);
                              return (
                                <div
                                  key={item.id}
                                  className={`group flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer relative ${
                                    selected 
                                      ? activeTab === 'medical'
                                        ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50 shadow-md shadow-teal-100' 
                                        : 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-md shadow-purple-100'
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                                  }`}
                                  onClick={() => toggleItem(item)}
                                >
                                  <Checkbox
                                    checked={selected}
                                    onClick={(e) => e.stopPropagation()}
                                    className={selected ? (activeTab === 'medical' ? 'border-teal-600 data-[state=checked]:bg-teal-600' : 'border-purple-600 data-[state=checked]:bg-purple-600') : ''}
                                  />
                                  <span className={`flex-1 text-sm font-medium ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {item.name}
                                    {(customMedicalItems.some(c => c.id === item.id) || customNonMedicalItems.some(c => c.id === item.id)) && (
                                      <span className="text-xs text-orange-500 mr-1">(مخصص)</span>
                                    )}
                                  </span>
                                  {/* زر إخفاء العنصر نهائياً */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity absolute left-1 top-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (customMedicalItems.some(c => c.id === item.id) || customNonMedicalItems.some(c => c.id === item.id)) {
                                        removeCustomItemFromList(item.id, activeTab);
                                      } else {
                                        hideItemPermanently(item.id);
                                      }
                                    }}
                                    title="إخفاء نهائياً"
                                  >
                                    <EyeOff className="w-3 h-3" />
                                  </Button>
                                  {selected && (
                                    <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:bg-gray-100"
                                        onClick={() => updateQuantity(item.id, getSelectedQuantity(item.id) - 1)}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={getSelectedQuantity(item.id)}
                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                        className="w-12 h-7 text-center text-sm p-1 border-0 bg-gray-50 font-bold"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:bg-gray-100"
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
              </Tabs>
            </Card>
          </div>

          {/* ملخص التقرير */}
          <div className="space-y-5">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm sticky top-4 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 text-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    ملخص التقرير
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 text-white text-lg px-3 py-1 border-0">
                      {selectedItems.length} عنصر
                    </Badge>
                  </div>
                </div>
                
                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                    <Stethoscope className="w-6 h-6 mx-auto mb-1 opacity-80" />
                    <p className="text-2xl font-bold">{medicalItems.length}</p>
                    <p className="text-xs opacity-80">طبي</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                    <Wrench className="w-6 h-6 mx-auto mb-1 opacity-80" />
                    <p className="text-2xl font-bold">{nonMedicalItems.length}</p>
                    <p className="text-xs opacity-80">غير طبي</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4 space-y-4">
                {/* المركز المحدد */}
                {selectedCenter ? (
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-200">
                    <p className="text-xs text-teal-600 font-medium mb-1">المركز الصحي</p>
                    <p className="font-bold text-teal-800 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {selectedCenter}
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                    <p className="text-sm text-amber-700">اختر مركزاً صحياً للبدء</p>
                  </div>
                )}

                {/* عنوان التقرير */}
                <div>
                  <Label className="text-xs text-gray-500">عنوان التقرير (اختياري)</Label>
                  <Input
                    placeholder="مثال: نواقص الربع الأول 2024"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="mt-1 h-11 border-2"
                  />
                </div>

                {/* قائمة العناصر المحددة */}
                {selectedItems.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-gray-500">العناصر المحددة</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-teal-600 hover:text-teal-700"
                        onClick={() => setShowAddCustomItem(true)}
                      >
                        <Plus className="w-3 h-3 ml-1" />
                        إضافة مخصص
                      </Button>
                    </div>
                    <div className="max-h-[250px] overflow-y-auto rounded-xl border-2 border-gray-100 divide-y">
                      {selectedItems.map((item) => {
                        const isInCustomList = item.type === 'medical' 
                          ? customMedicalItems.some(c => c.id === item.id)
                          : customNonMedicalItems.some(c => c.id === item.id);

                        return (
                        <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              item.type === 'medical' ? 'bg-teal-500' : 'bg-purple-500'
                            }`} />
                            {editingItem === item.id ? (
                              <div className="flex items-center gap-1 flex-1">
                                <Input
                                  value={item.name}
                                  onChange={(e) => setSelectedItems(prev => prev.map(i => 
                                    i.id === item.id ? { ...i, name: e.target.value } : i
                                  ))}
                                  className="h-7 text-sm flex-1"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditingItem(null);
                                    if (e.key === 'Escape') setEditingItem(null);
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-green-600"
                                  onClick={() => setEditingItem(null)}
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <span 
                                className="text-sm truncate cursor-pointer hover:text-teal-600"
                                onDoubleClick={() => setEditingItem(item.id)}
                                title="انقر مرتين للتعديل"
                              >
                                {item.name}
                                {(item.isCustom || isInCustomList) && <span className="text-xs text-orange-500 mr-1">(مخصص)</span>}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setEditingItem(item.id)}
                              title="تعديل"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${
                                item.type === 'medical' 
                                  ? 'text-purple-400 hover:bg-purple-50 hover:text-purple-600' 
                                  : 'text-teal-400 hover:bg-teal-50 hover:text-teal-600'
                              }`}
                              onClick={() => moveItemToOtherType(item.id)}
                              title={item.type === 'medical' ? 'نقل للتجهيزات غير الطبية' : 'نقل للتجهيزات الطبية'}
                            >
                              <ArrowLeftRight className="w-3 h-3" />
                            </Button>
                            {isInCustomList && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-orange-400 hover:bg-orange-50 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeCustomItemFromList(item.id, item.type)}
                                title="حذف من القائمة الثابتة"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                            <Badge className={`${
                              item.type === 'medical' 
                                ? 'bg-teal-100 text-teal-700' 
                                : 'bg-purple-100 text-purple-700'
                            } border-0 min-w-[28px] justify-center`}>
                              {item.quantity}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-400 hover:bg-red-50 hover:text-red-600"
                              onClick={() => toggleItem(item)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );})}
                    </div>
                  </div>
                )}

                {/* نافذة إضافة عنصر مخصص */}
                {showAddCustomItem && (
                  <div className="bg-gray-50 rounded-xl p-3 border-2 border-dashed border-gray-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">إضافة عنصر مخصص</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setShowAddCustomItem(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="اسم العنصر..."
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="h-10"
                    />
                    <Input
                      placeholder="التصنيف (اختياري)..."
                      value={customItemCategory}
                      onChange={(e) => setCustomItemCategory(e.target.value)}
                      className="h-10"
                    />
                    <Button
                      onClick={() => addCustomItem(true)}
                      className="w-full h-9 bg-teal-600 hover:bg-teal-700"
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة للقائمة الثابتة
                    </Button>
                  </div>
                )}

                {/* أزرار الإجراءات */}
                <div className="space-y-3 pt-2">
                  {editingReportId ? (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        أنت تعدل تقريراً محفوظاً
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={updateExistingReport}
                          disabled={!selectedCenter || selectedItems.length === 0}
                          className="h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg text-base font-semibold"
                        >
                          <Save className="w-5 h-5 ml-2" />
                          حفظ التعديلات
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          variant="outline"
                          className="h-12 border-2 border-gray-300"
                        >
                          <X className="w-5 h-5 ml-2" />
                          إلغاء
                        </Button>
                      </div>
                      <Button
                        onClick={() => { setEditingReportId(null); saveReport(); }}
                        disabled={!selectedCenter || selectedItems.length === 0}
                        variant="outline"
                        className="w-full h-10 border-2 border-teal-200 text-teal-600 hover:bg-teal-50"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        حفظ كتقرير جديد
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={saveReport}
                      disabled={!selectedCenter || selectedItems.length === 0}
                      className="w-full h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-200 text-base font-semibold"
                    >
                      <Save className="w-5 h-5 ml-2" />
                      حفظ التقرير
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={exportToExcel}
                      disabled={selectedItems.length === 0}
                      className="h-11 border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                      title="تصدير Excel"
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={exportToHTML}
                      disabled={selectedItems.length === 0}
                      className="h-11 border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                      title="تصدير HTML"
                    >
                      <FileCode className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={printReport}
                      disabled={selectedItems.length === 0}
                      className="h-11 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      title="طباعة"
                    >
                      <Printer className="w-5 h-5" />
                    </Button>
                  </div>

                  {selectedItems.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => { clearSelection(); setEditingReportId(null); }}
                      className="w-full h-11 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      مسح الكل ({selectedItems.length})
                    </Button>
                  )}
                </div>
                }
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

      {/* نافذة العناصر المخفية */}
      <Dialog open={showHiddenItems} onOpenChange={setShowHiddenItems}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-gray-600" />
              العناصر المخفية ({hiddenItems.length})
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {hiddenItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>لا توجد عناصر مخفية</p>
              </div>
            ) : (
              <div className="space-y-2">
                {hiddenItems.map(itemId => {
                  const item = [...medicalEquipmentList, ...nonMedicalEquipmentList].find(i => i.id === itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreHiddenItem(itemId)}
                        className="text-teal-600 border-teal-200 hover:bg-teal-50"
                      >
                        <RotateCcw className="w-4 h-4 ml-1" />
                        استعادة
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHiddenItems(false)}>
              إغلاق
            </Button>
            {hiddenItems.length > 0 && (
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  setHiddenItems([]);
                  localStorage.removeItem('hidden_deficiency_items');
                  toast.success('تم استعادة جميع العناصر');
                }}
              >
                استعادة الكل
              </Button>
            )}
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-teal-600 border-teal-200 hover:bg-teal-50"
                          onClick={() => loadReport(report)}
                        >
                          نسخ
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-amber-500 hover:bg-amber-600"
                          onClick={() => loadReport(report, true)}
                        >
                          <Edit2 className="w-4 h-4 ml-1" />
                          تعديل
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