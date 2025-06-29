
import formidable from 'formidable';
import fs from 'fs';
import { ACTIVE_WEBHOOKS } from '../../src/config/webhooks';

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
    
    const webhookUrl = ACTIVE_WEBHOOKS.USER_CREATION;
    
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

    // Create FormData for binary file upload (reverted to original working format)
    const formData = new FormData();
    
    // Add metadata fields
    if (adminUserId) formData.append('adminUserId', adminUserId);
    if (companyId) formData.append('companyId', companyId);
    if (companyName) formData.append('companyName', companyName);
    if (industry) formData.append('industry', industry);
    if (filename) formData.append('filename', filename);
    formData.append('batch_id', `BATCH_${Date.now()}`);

    // Add CSV file as binary
    const fileContent = fs.readFileSync(csvFile.filepath);
    const fileBlob = new Blob([fileContent], { type: csvFile.mimetype || 'text/csv' });
    formData.append('file', fileBlob, csvFile.originalFilename || 'upload.csv');

    console.log('Sending binary CSV with FormData to webhook:', webhookUrl);

    // Send to n8n webhook (no custom headers - let browser set multipart/form-data)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
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
      candidates_count: result.candidates_count,
      admin_user_id: adminUserId,
      company_name: companyName
    });
  } catch (error: any) {
    console.error('Error in csv-upload API:', error);
    res.status(500).json({ error: error.message });
  }
}
