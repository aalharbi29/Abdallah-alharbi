import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { format } from "npm:date-fns@3.6.0";
import { ar } from "npm:date-fns@3.6.0/locale";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { 
            assignmentId, 
            templateMode = 'standard',
            showDurationInTable = true, 
            showDurationInParagraph = true,
            customDurationText = '',
            customParagraph1 = '',
            customParagraph2 = '',
            customParagraph3 = '',
            customParagraph4 = '',
            customParagraph5 = '',
            customAssignmentType = '',
            customClosing = '',
            customTitle = 'تكليف',
            customIntro = '',
            tableLayout = 'horizontal',
            customTableHeaders = null,
            signaturePosition = { x: 420, y: 520 },
            stampPosition = { x: 350, y: 600 },
            managerNamePosition = { x: 250, y: 550 },
            stampSize = 150,
            textStyles = {
                title: { size: 24, font: 'Arial', bold: true },
                intro: { size: 16, font: 'Arial', bold: true },
                paragraph1: { size: 16, font: 'Arial', bold: false },
                paragraph2: { size: 16, font: 'Arial', bold: false },
                paragraph3: { size: 16, font: 'Arial', bold: false },
                paragraph4: { size: 16, font: 'Arial', bold: false },
                paragraph5: { size: 16, font: 'Arial', bold: false },
                closing: { size: 16, font: 'Arial', bold: true },
                managerName: { size: 16, font: 'Arial', bold: true },
                tableHeaders: { size: 14, font: 'Arial', bold: true },
                tableData: { size: 14, font: 'Arial', bold: false }
            },
            pdfMargins = { top: 20, right: 20, bottom: 20, left: 20 },
            showHeaderFooter = false,
            customHeader = '',
            customFooter = '',
            decisionPoints = [] // For multiple template
        } = await req.json();

        if (!assignmentId) {
            return new Response(JSON.stringify({ success: false, error: 'assignmentId is required' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const assignment = await base44.entities.Assignment.get(assignmentId);
        if (!assignment) {
            return new Response(JSON.stringify({ success: false, error: 'Assignment not found' }), { 
                status: 404, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Handle Multiple Assignment Mode
        let multipleAssignmentsList = [];
        if (templateMode === 'multiple' && assignment.group_id) {
            const siblings = await base44.entities.Assignment.filter({ group_id: assignment.group_id });
            multipleAssignmentsList = siblings.map(sib => ({
                id: sib.id,
                name: sib.employee_name,
                national_id: sib.employee_national_id,
                current_work: sib.from_health_center,
                assigned_work: sib.assigned_to_health_center,
                duration: sib.duration_days,
                start_date: sib.start_date ? format(new Date(sib.start_date), "yyyy-MM-dd") : '',
                end_date: sib.end_date ? format(new Date(sib.end_date), "yyyy-MM-dd") : '',
                full_duration: (sib.notes && sib.notes.startsWith('المدة: ')) ? sib.notes.replace('المدة: ', '') : null
            }));
        }
        
        const getDayName = (dateString) => {
            try { 
                return format(new Date(dateString), 'EEEE', { locale: ar }); 
            } catch (error) { 
                return ''; 
            }
        };

        const formatDate = (dateString) => {
            if (!dateString) return '____-___-____';
            return format(new Date(dateString), "dd-MM-yyyy");
        };

        const isFemale = assignment.gender === 'أنثى';
        const formattedStartDate = formatDate(assignment.start_date);
        const formattedEndDate = formatDate(assignment.end_date);
        const startDayName = getDayName(assignment.start_date);
        const endDayName = getDayName(assignment.end_date);

        const getDurationTextForPrint = () => {
            if (customDurationText) {
                return customDurationText;
            }
            const days = assignment.duration_days;
            if (!days) return '';
            if (days === 1) return `لمدة يوم واحد والموافق يوم ${startDayName} ${formattedStartDate}م.`;
            if (days === 2) return `لمدة يومين، اعتباراً من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م.`;
            if (days >= 3 && days <= 10) return `لمدة ${days} أيام، اعتباراً من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م.`;
            return `لمدة ${days} يوم، اعتباراً من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م.`;
        };
    
        const getSingleLineDurationText = () => {
            if (customDurationText) {
                return customDurationText.replace(/<br\s*\/?>/gi, ' ');
            }
            const days = assignment.duration_days;
            if (!days) return '';
            if (days === 1) return `لمدة يوم واحد والموافق يوم ${startDayName} ${formattedStartDate}م`;
            if (days === 2) return `لمدة يومين، اعتباراً من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م`;
            return `لمدة ${days} أيام، اعتباراً من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م`;
        };

        const headers = customTableHeaders || {
            name: 'الاسم',
            position: 'المسمى الوظيفي',
            assignmentType: 'نوع التكليف',
            fromCenter: 'جهة العمل',
            toCenter: 'جهة التكليف',
            duration: 'مدة التكليف'
        };

        const letterheadUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/20b408cf3_.png";

        let tableHtml = '';
        let contentHtml = '';

        if (templateMode === 'multiple') {
            // Generate Multiple Assignment Table
            let rowsHtml = '';
            multipleAssignmentsList.forEach(item => {
                let displayDuration = item.full_duration;
                if (!displayDuration) {
                    if (item.start_date) {
                        displayDuration = `من ${item.start_date}`;
                        if (item.end_date) displayDuration += `<br/>إلى ${item.end_date}`;
                        if (item.duration) displayDuration = `(${item.duration} يوم)<br/>` + displayDuration;
                    } else {
                        displayDuration = '-';
                    }
                }

                rowsHtml += `
                    <tr>
                        <td style="padding: 8px; text-align: center; border: 1px solid black;">${item.name || ''}</td>
                        <td style="padding: 8px; text-align: center; border: 1px solid black;">${item.current_work || ''}</td>
                        <td style="padding: 8px; text-align: center; border: 1px solid black;">${item.assigned_work || ''}</td>
                        <td style="padding: 8px; text-align: center; border: 1px solid black; white-space: pre-wrap;">${displayDuration}</td>
                    </tr>
                `;
            });

            tableHtml = `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
                    <thead style="background-color: #e0f2fe;">
                        <tr>
                            <th style="padding: 8px; border: 1px solid black; width: 25%;">الاسم</th>
                            <th style="padding: 8px; border: 1px solid black; width: 20%;">جهة العمل</th>
                            <th style="padding: 8px; border: 1px solid black; width: 20%;">جهة التكليف</th>
                            <th style="padding: 8px; border: 1px solid black; width: 35%;">مدة التكليف</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            `;

            // Decision Points
            const points = (decisionPoints && decisionPoints.length > 0) ? decisionPoints : [
                'تكليف الموضح بياناتهم أعلاه بالعمل في الجهات الموضحة قرين اسم كل منهم خلال الفترة المحددة.',
                'لا يترتب على هذا التكليف أي ميزة مالية إلا ما يقره النظام.',
                'يتم تنفيذ هذا القرار كلاً فيما يخصه.'
            ];

            let pointsHtml = '';
            points.forEach((point, idx) => {
                pointsHtml += `<div style="margin-bottom: 8px; font-weight: bold; font-size: 14px;">${idx + 1}- ${point}</div>`;
            });

            contentHtml = `
                <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px; white-space: pre-wrap;">${customIntro || 'إن مدير شؤون المراكز الصحية بالحناكية وبناء على الصلاحيات الممنوحة لنا نظاماً\nعليه يقرر ما يلي:'}</div>
                ${tableHtml}
                <div style="text-align: right; margin-right: 20px;">
                    ${pointsHtml}
                </div>
                <div style="text-align: center; font-weight: bold; font-size: 16px; margin-top: 30px;">${customClosing || 'خالص التحايا ،،،'}</div>
            `;

        } else if (tableLayout === 'vertical' && templateMode === 'flexible') {
            tableHtml = `
                <table>
                    <thead>
                        <tr class="table-header">
                            <th style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.name}</th>
                            <th style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.position}</th>
                            <th style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.assignmentType}</th>
                            <th style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.fromCenter}</th>
                            <th style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.toCenter}</th>
                            ${showDurationInTable ? `<th style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.duration}</th>` : ''}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${assignment.employee_name || ''}</td>
                            <td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${assignment.employee_position || ''}</td>
                            <td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${customAssignmentType || assignment.assignment_type || 'تكليف داخلي - مؤقت'}</td>
                            <td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${assignment.from_health_center || ''}</td>
                            <td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${assignment.assigned_to_health_center || ''}</td>
                            ${showDurationInTable ? `<td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${getSingleLineDurationText()}</td>` : ''}
                        </tr>
                    </tbody>
                </table>
            `;
        } else {
            tableHtml = `
                <table>
                    <tr><td class="table-header" style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.name}</td><td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${assignment.employee_name || ''}</td></tr>
                    <tr><td class="table-header" style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.position}</td><td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${assignment.employee_position || ''}</td></tr>
                    <tr><td class="table-header" style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.assignmentType}</td><td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${customAssignmentType || assignment.assignment_type || 'تكليف داخلي - مؤقت'}</td></tr>
                    <tr><td class="table-header" style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.fromCenter}</td><td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${assignment.from_health_center || ''}</td></tr>
                    <tr><td class="table-header" style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.toCenter}</td><td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${assignment.assigned_to_health_center || ''}</td></tr>
                    ${showDurationInTable ? `<tr><td class="table-header" style="font-size: ${textStyles.tableHeaders.size}px; font-family: ${textStyles.tableHeaders.font}; font-weight: ${textStyles.tableHeaders.bold ? 'bold' : 'normal'};">${headers.duration}</td><td style="font-size: ${textStyles.tableData.size}px; font-family: ${textStyles.tableData.font}; font-weight: ${textStyles.tableData.bold ? 'bold' : 'normal'};">${getSingleLineDurationText()}</td></tr>` : ''}
                </table>
            `;
        }

        const getParagraph1 = () => {
            if (customParagraph1) return customParagraph1;
            return `تكليف الموضح${isFemale ? 'ة' : ''} بيانات${isFemale ? 'ها' : 'ه'} أعلاه لتغطية العمل في <strong>(${assignment.assigned_to_health_center || 'غير محدد'})</strong> ${showDurationInParagraph ? getDurationTextForPrint() : ''}`;
        };

        const getParagraph2 = () => {
            if (customParagraph2) return customParagraph2;
            return 'لا يترتب على هذا القرار أي ميزة مالية إلا ما يقره النظام.';
        };

        const getParagraph3 = () => {
            if (customParagraph3 === '') return '';
            if (customParagraph3) return customParagraph3;
            return `نسخة لـ <strong>(${assignment.from_health_center || 'غير محدد'})</strong> لإبلاغ المذكور${isFemale ? 'ة' : ''} وتزويد${isFemale ? 'ها' : 'ه'} بنسخة من القرار.`;
        };

        const getParagraph4 = () => {
            if (customParagraph4 === '') return '';
            if (customParagraph4) return customParagraph4;
            return `نسخة لـ <strong>(${assignment.assigned_to_health_center || 'غير محدد'})</strong> لتمكين${isFemale ? 'ها' : 'ه'} من المباشرة وأداء مهام عمل${isFemale ? 'ها' : 'ه'}.`;
        };

        const getParagraph5 = () => {
            if (customParagraph5) return customParagraph5;
            return 'يتم تنفيذ هذا القرار كلاً فيما يخصه.';
        };

        const getClosing = () => {
            if (customClosing) return customClosing;
            return 'خالص التحايا ،،،';
        };

        let paragraphsHtml = `<p style="margin-bottom: 0.75rem; font-size: ${textStyles.paragraph1.size}px; font-family: ${textStyles.paragraph1.font}; font-weight: ${textStyles.paragraph1.bold ? 'bold' : 'normal'}; line-height: 1.7;"><strong>١-</strong> ${getParagraph1()}</p>`;
        
        if (getParagraph2()) {
            paragraphsHtml += `<p style="margin-bottom: 0.75rem; font-size: ${textStyles.paragraph2.size}px; font-family: ${textStyles.paragraph2.font}; font-weight: ${textStyles.paragraph2.bold ? 'bold' : 'normal'}; line-height: 1.7;"><strong>٢-</strong> ${getParagraph2()}</p>`;
        }
        
        if (getParagraph3()) {
            paragraphsHtml += `<p style="margin-bottom: 0.75rem; font-size: ${textStyles.paragraph3.size}px; font-family: ${textStyles.paragraph3.font}; font-weight: ${textStyles.paragraph3.bold ? 'bold' : 'normal'}; line-height: 1.7;"><strong>٣-</strong> ${getParagraph3()}</p>`;
        }
        
        if (getParagraph4()) {
            paragraphsHtml += `<p style="margin-bottom: 0.75rem; font-size: ${textStyles.paragraph4.size}px; font-family: ${textStyles.paragraph4.font}; font-weight: ${textStyles.paragraph4.bold ? 'bold' : 'normal'}; line-height: 1.7;"><strong>٤-</strong> ${getParagraph4()}</p>`;
        }
        
        if (getParagraph5()) {
            paragraphsHtml += `<p style="margin-bottom: 0.75rem; font-size: ${textStyles.paragraph5.size}px; font-family: ${textStyles.paragraph5.font}; font-weight: ${textStyles.paragraph5.bold ? 'bold' : 'normal'}; line-height: 1.7;"><strong>٥-</strong> ${getParagraph5()}</p>`;
        }

        // Email format is now handled in frontend with templates
        if (format === 'email') {
            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Email templates are handled on the frontend' 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="utf-8">
                <title>${customTitle || 'تكليف'} - ${assignment.employee_name || ''}</title>
                <style>
                    * { 
                        margin: 0; 
                        padding: 0; 
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        size: A4;
                        margin: ${pdfMargins.top}mm ${pdfMargins.right}mm ${pdfMargins.bottom}mm ${pdfMargins.left}mm;
                        ${showHeaderFooter && customHeader ? `@top-center { content: "${customHeader}"; font-size: 10pt; }` : ''}
                        ${showHeaderFooter && customFooter ? `@bottom-center { content: "${customFooter}"; font-size: 10pt; }` : ''}
                    }
                    html, body { 
                        width: 210mm;
                        height: 297mm;
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                    }
                    body { 
                        font-family: 'Times New Roman', serif; 
                        direction: rtl; 
                        font-size: 14pt; 
                        position: relative;
                        background-image: url(${letterheadUrl});
                        background-size: 100% 100%;
                        background-repeat: no-repeat;
                        background-position: top center;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    .content-wrapper {
                        width: 210mm;
                        height: 297mm;
                        padding: ${pdfMargins.top}mm ${pdfMargins.right}mm ${pdfMargins.bottom}mm ${pdfMargins.left}mm;
                        position: relative;
                        page-break-inside: avoid;
                    }
                    ${showHeaderFooter && customHeader ? `.custom-header { position: fixed; top: ${pdfMargins.top - 10}mm; left: 0; right: 0; text-align: center; font-size: 10pt; color: #666; }` : ''}
                    ${showHeaderFooter && customFooter ? `.custom-footer { position: fixed; bottom: ${pdfMargins.bottom - 10}mm; left: 0; right: 0; text-align: center; font-size: 10pt; color: #666; }` : ''}
                    .main-content { margin-top: 60px; }
                    .title { color: #38bdf8; text-align: center; font-size: ${textStyles.title.size}px; font-family: '${textStyles.title.font}', serif; font-weight: ${textStyles.title.bold ? 'bold' : 'normal'}; margin: 0 0 15px 0; }
                    table { 
                        border-collapse: collapse; 
                        width: 90%; 
                        max-width: 600px; 
                        margin: 0 auto 15px auto;
                        page-break-inside: avoid;
                    }
                    td, th { 
                        border: 2px solid black; 
                        padding: 8px; 
                    }
                    td {
                        text-align: center;
                    }
                    .table-header { 
                        background-color: #f5f5f5 !important; 
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        width: 25%;
                        text-align: center !important;
                    }
                    thead { background-color: #f5f5f5 !important; }
                    .content-text { 
                        text-align: right; 
                        margin: 15px 12px 15px 4px; 
                        line-height: 1.6;
                        page-break-inside: avoid;
                    }
                    .intro { text-align: center; font-size: ${textStyles.intro.size}px; font-family: '${textStyles.intro.font}', serif; font-weight: ${textStyles.intro.bold ? 'bold' : 'normal'}; margin-bottom: 1rem; }
                    .paragraphs { margin-right: 80px; }
                    .closing { text-align: center; margin-top: 1.5rem; font-size: ${textStyles.closing.size}px; font-family: '${textStyles.closing.font}', serif; font-weight: ${textStyles.closing.bold ? 'bold' : 'normal'}; }
                    .signature-block {
                        position: absolute;
                        left: ${managerNamePosition.x}px;
                        top: ${managerNamePosition.y}px;
                        text-align: center;
                        font-size: ${textStyles.managerName.size}px;
                        font-family: '${textStyles.managerName.font}', serif;
                        font-weight: bold;
                    }
                    .signature-block p { margin: 4px 0; font-weight: bold; }
                    .stamp {
                        position: absolute;
                        left: ${stampPosition.x}px;
                        top: ${stampPosition.y}px;
                        width: ${stampSize}px;
                        opacity: 0.85;
                        mix-blend-mode: multiply;
                        z-index: 100;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .signature {
                        position: absolute;
                        left: ${signaturePosition.x}px;
                        top: ${signaturePosition.y}px;
                        width: 170px;
                        mix-blend-mode: darken;
                        z-index: 1;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page { 
                        size: A4; 
                        margin: 0;
                    }
                    @media print { 
                        * {
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important;
                        }
                        html, body { 
                            width: 210mm !important;
                            height: 297mm !important;
                            margin: 0 !important; 
                            padding: 0 !important;
                            overflow: hidden !important;
                            background-image: url(${letterheadUrl}) !important;
                            background-size: 100% 100% !important;
                        }
                        .content-wrapper {
                            page-break-inside: avoid;
                            page-break-after: avoid;
                        }
                        .stamp, .signature {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                </style>
            </head>
            <body>
                ${showHeaderFooter && customHeader ? `<div class="custom-header">${customHeader}</div>` : ''}
                ${showHeaderFooter && customFooter ? `<div class="custom-footer">${customFooter}</div>` : ''}
                <div class="content-wrapper">
                    <div class="main-content">
                        <h1 class="title">${customTitle || 'تكليف'}</h1>
                        ${templateMode === 'multiple' ? contentHtml : `
                            ${tableHtml}
                            <div class="content-text">
                                <p class="intro">
                                    ${customIntro || 'إن مدير شؤون المراكز الصحية بالحناكية وبناءً على الصلاحيات الممنوحة له نظاماً ونظراً لما تقتضيه حاجة العمل عليه يقرر ما يلي:'}
                                </p>
                                <div class="paragraphs">
                                    ${paragraphsHtml}
                                </div>
                                <p class="closing">${getClosing()}</p>
                            </div>
                        `}
                    </div>

                    <div class="signature-block">
                        <p>مدير إدارة شؤون المراكز الصحية بالحناكية</p>
                        <p>أ/عبدالمجيد سعود الربيقي</p>
                    </div>

                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png" alt="الختم" class="stamp">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png" alt="التوقيع" class="signature">
                </div>
            </body>
            </html>
        `;
        
        return new Response(JSON.stringify({ success: true, html_content: htmlContent }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        console.error('Export function error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
});