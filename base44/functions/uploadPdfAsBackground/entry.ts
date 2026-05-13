import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { pdfUrl } = await req.json();
        if (!pdfUrl) return Response.json({ error: 'pdfUrl required' }, { status: 400 });

        // 1) Convert PDF → JPG via iLovePDF (reuse existing flow)
        const iLoveAPIKey = Deno.env.get('publickeylovepdf');
        const authRes = await fetch('https://api.ilovepdf.com/v1/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_key: iLoveAPIKey })
        });
        const { token } = await authRes.json();

        const taskRes = await fetch('https://api.ilovepdf.com/v1/start/pdfjpg', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const { task, server } = await taskRes.json();

        const upRes = await fetch(`https://${server}/v1/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ task, cloud_file: pdfUrl })
        });
        const { server_filename } = await upRes.json();

        await fetch(`https://${server}/v1/process`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task,
                tool: 'pdfjpg',
                files: [{ server_filename, filename: 'document.pdf' }],
                pdfjpg_mode: 'pages'
            })
        });

        const dlRes = await fetch(`https://${server}/v1/download/${task}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const bytes = new Uint8Array(await dlRes.arrayBuffer());

        // Could be ZIP or direct JPG
        let imageBytes = bytes;
        try {
            const JSZip = (await import('npm:jszip@3.10.1')).default;
            const zip = await JSZip.loadAsync(bytes);
            const entries = Object.entries(zip.files).sort((a, b) => a[0].localeCompare(b[0]));
            for (const [name, file] of entries) {
                if (!file.dir && /\.(jpg|jpeg|png)$/i.test(name)) {
                    imageBytes = await file.async('uint8array');
                    break;
                }
            }
        } catch {
            // not a zip - use bytes directly
        }

        // 2) Upload to base44
        const blob = new Blob([imageBytes], { type: 'image/jpeg' });
        const file = new File([blob], 'assignment_form_bg.jpg', { type: 'image/jpeg' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        return Response.json({ success: true, file_url });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});