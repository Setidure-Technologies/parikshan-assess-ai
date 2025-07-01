
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('CSV upload request received');
    
    // Use your actual n8n webhook URL
    const webhookUrl = 'https://n8n.erudites.in/webhook-test/476f1370-870d-459e-8be0-8ab3d86ff69a';
    
    if (!webhookUrl) {
      return res.status(500).json({ error: 'N8N webhook URL not configured' });
    }

    // Handle FormData upload (binary file)
    let formData = new FormData();
    let csvContent = '';
    let adminUserId = '';
    let companyId = '';
    let companyName = '';
    let industry = '';
    let filename = '';

    // Check if it's FormData (binary upload) or JSON
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      // This is a FormData upload, extract the data
      // Note: In a real implementation, you'd use a multipart parser like 'multiparty' or 'formidable'
      // For now, let's handle it as a simpler approach by reading the raw body
      
      // Extract form fields from the request body
      const body = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => {
          data += chunk;
        });
        req.on('end', () => {
          resolve(data);
        });
      });

      // Parse the multipart data (simplified approach)
      const bodyStr = body.toString();
      
      // Extract admin details from form data
      const adminUserIdMatch = bodyStr.match(/name="adminUserId"\r?\n\r?\n([^\r\n]+)/);
      const companyIdMatch = bodyStr.match(/name="companyId"\r?\n\r?\n([^\r\n]+)/);
      const companyNameMatch = bodyStr.match(/name="companyName"\r?\n\r?\n([^\r\n]+)/);
      const industryMatch = bodyStr.match(/name="industry"\r?\n\r?\n([^\r\n]+)/);
      const filenameMatch = bodyStr.match(/name="filename"\r?\n\r?\n([^\r\n]+)/);
      
      adminUserId = adminUserIdMatch ? adminUserIdMatch[1] : '';
      companyId = companyIdMatch ? companyIdMatch[1] : '';
      companyName = companyNameMatch ? companyNameMatch[1] : '';
      industry = industryMatch ? industryMatch[1] : '';
      filename = filenameMatch ? filenameMatch[1] : '';

      // Extract CSV content
      const csvMatch = bodyStr.match(/filename="[^"]*\.csv"[^\r\n]*\r?\n[^\r\n]*\r?\n\r?\n([\s\S]*?)\r?\n------/);
      csvContent = csvMatch ? csvMatch[1].trim() : '';
      
    } else {
      // Handle JSON format (fallback)
      const body = req.body;
      csvContent = body.csvContent || '';
      companyId = body.companyId || '';
      adminUserId = body.adminUserId || '';
      companyName = body.companyName || '';
      industry = body.industry || '';
      filename = body.filename || '';
    }

    console.log('Extracted data:', { 
      adminUserId, 
      companyId, 
      companyName, 
      industry, 
      filename,
      csvContentLength: csvContent.length 
    });
    
    if (!csvContent || !companyId || !adminUserId) {
      return res.status(400).json({ 
        error: 'Missing required data: csvContent, companyId, or adminUserId' 
      });
    }

    // Parse CSV content into candidate records
    const lines = csvContent.split('\n').filter((line: string) => line.trim());
    const headers = lines[0] ? lines[0].split(',').map((h: string) => h.trim().toLowerCase()) : [];
    
    const candidates = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim());
      if (values.length >= 2) { // At least name and email
        const candidate = {
          full_name: values[0] || '',
          email: values[1] || '',
          phone: values[2] || null,
          company_id: companyId
        };
        candidates.push(candidate);
      }
    }

    console.log('Parsed candidates:', candidates);

    // Prepare payload for n8n webhook
    const webhookPayload = {
      action: 'bulk_create_candidates',
      candidates: candidates,
      company_id: companyId,
      admin_user_id: adminUserId,
      company_name: companyName,
      industry: industry,
      filename: filename,
      timestamp: new Date().toISOString()
    };

    console.log('Sending to n8n webhook:', webhookPayload);

    // Send to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('N8N response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook failed:', errorText);
      throw new Error(`N8N webhook failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('N8N response:', result);

    res.status(202).json({ 
      success: true, 
      message: 'CSV upload initiated successfully',
      candidates_count: candidates.length,
      admin_user_id: adminUserId,
      company_name: companyName
    });
  } catch (error: any) {
    console.error('Error in csv-upload API:', error);
    res.status(500).json({ error: error.message });
  }
}
