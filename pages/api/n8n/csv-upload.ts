import formidable from 'formidable';
import fs from 'fs';

// Disable Next.js body parser to handle file uploads with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('CSV upload request received, processing with formidable.');
    
    // Updated production webhook URL
    const webhookUrl = 'https://n8n.erudites.in/webhook-test/usercreation';
    
    if (!webhookUrl) {
      console.error('N8N webhook URL not configured');
      return res.status(500).json({ error: 'N8N webhook URL not configured' });
    }

    const form = formidable({});
    const [fields, files] = await form.parse(req);

    // Extract fields. Formidable puts them in arrays.
    const adminUserId = fields.adminUserId?.[0];
    const companyId = fields.companyId?.[0];
    const companyName = fields.companyName?.[0];
    const industry = fields.industry?.[0];
    const filename = fields.filename?.[0];

    // Extract file
    const csvFile = files.csvFile?.[0];

    if (!csvFile) {
        console.error('No CSV file found in form data');
        return res.status(400).json({ error: 'No CSV file uploaded.' });
    }

    console.log('Extracted data:', { 
      adminUserId, 
      companyId, 
      companyName, 
      industry, 
      filename: filename || csvFile.originalFilename,
      uploadedFile: csvFile.originalFilename
    });

    if (!companyId || !adminUserId) {
      return res.status(400).json({ 
        error: 'Missing required data: companyId, or adminUserId' 
      });
    }

    // Read the content of the uploaded CSV file
    const csvContent = fs.readFileSync(csvFile.filepath, 'utf8');

    if (!csvContent) {
      return res.status(400).json({ error: 'CSV file is empty.' });
    }

    // Parse CSV content into candidate records
    const lines = csvContent.split('\n').filter((line: string) => line.trim());
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV must have a header and at least one data row.' });
    }
    
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

    console.log(`Parsed ${candidates.length} candidates from CSV.`);

    // Prepare payload for n8n webhook
    const webhookPayload = {
      action: 'bulk_create_candidates',
      candidates: candidates,
      company_id: companyId,
      admin_user_id: adminUserId,
      company_name: companyName,
      industry: industry,
      filename: filename || csvFile.originalFilename, // Use original filename if available
      timestamp: new Date().toISOString()
    };

    console.log('Sending to production n8n webhook:', JSON.stringify(webhookPayload, null, 2));

    // Send to production n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Admin-ID': adminUserId,
        'X-Company-ID': companyId,
        'X-Timestamp': new Date().toISOString(),
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('Production webhook response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Production webhook failed:', errorText);
      throw new Error(`Production webhook failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Production webhook response:', result);

    res.status(202).json({ 
      success: true, 
      message: 'CSV upload initiated successfully',
      candidates_count: candidates.length,
      admin_user_id: adminUserId,
      company_name: companyName,
      webhook_url: webhookUrl
    });
  } catch (error: any) {
    console.error('Error in csv-upload API:', error);
    res.status(500).json({ error: error.message });
  }
}