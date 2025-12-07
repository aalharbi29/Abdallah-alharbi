import React, { useState } from 'react';
import PDFViewer from '@/components/files/PDFViewer';
import { FormTemplate } from '@/entities/FormTemplate';

export default function FormViewer({ forms, onRefresh }) {
    const [selectedForm, setSelectedForm] = useState(null);
    const [isViewing, setIsViewing] = useState(false);

    const handleView = (form) => {
        setSelectedForm(form);
        setIsViewing(true);
    };

    // تشغيل العارض تلقائياً إذا كان هناك نموذج واحد
    React.useEffect(() => {
        if (forms && forms.length === 1) {
            handleView(forms[0]);
        }
    }, [forms]);

    return (
        <>
            <PDFViewer
                file={isViewing ? selectedForm : null}
                open={isViewing}
                onOpenChange={(open) => {
                    setIsViewing(open);
                    if (!open) {
                        setSelectedForm(null);
                    }
                }}
                entitySDK={FormTemplate}
                recordId={selectedForm?.id}
                fileUrlField="file_url"
                fileNameField="file_name"
                onFileUpdated={onRefresh}
            />
        </>
    );
}