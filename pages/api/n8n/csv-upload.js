
import formidable from 'formidable';
import fs from 'fs';
import { ACTIVE_WEBHOOKS } from '../../../src/config/webhooks.js';

// Disable Next.js body parser to handle file uploads with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('CSV upload request received');
    
    const webhookUrl = ACTIVE_WEBHOOKS.USER_CREATION;
    
    if (!webhookUrl) {
      console.error('N8N webhook URL not configured');
      return res.status(500).json({ error: 'N8N webhook URL not configured' });
    }

    const form = formidable({});
    const [fields, files] = await form.parse(req);

    // Extract fields from arrays (formidable puts them in arrays)
    const adminUserId = Array.isArray(fields.adminUserId) ? fields.adminUserId[0] : fields.adminUserId;
    const companyId = Array.isArray(fields.companyId) ? fields.companyId[0] : fields.companyId;
    const companyName = Array.isArray(fields.companyName) ? fields.companyName[0] : fields.companyName;
    const industry = Array.isArray(fields.industry) ? fields.industry[0] : fields.industry;
    const filename = Array.isArray(fields.filename) ? fields.filename[0] : fields.filename;

    // Extract the CSV file
    const csvFile = Array.isArray(files.csvFile) ? files.csvFile[0] : files.csvFile;

    if (!csvFile) {
      console.error('No CSV file found in form data');
      return res.status(400).json({ error: 'No CSV file uploaded.' });
    }

    console.log('Processing CSV upload:', { 
      adminUserId, 
      companyId, 
      companyName, 
      filename: filename || csvFile.originalFilename,
      fileSize: csvFile.size 
    });

    if (!companyId || !adminUserId) {
      return res.status(400).json({ 
        error: 'Missing required data: companyId or adminUserId' 
      });
    }

    // Read the CSV file content as buffer
    const fileBuffer = fs.readFileSync(csvFile.filepath);

    // Create FormData for binary file upload
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add metadata fields
    formData.append('adminUserId', adminUserId);
    formData.append('companyId', companyId);
    formData.append('companyName', companyName || '');
    formData.append('industry', industry || '');
    formData.append('filename', filename || csvFile.originalFilename || 'upload.csv');
    formData.append('batch_id', `BATCH_${Date.now()}`);

    // Add the CSV file as binary buffer
    formData.append('file', fileBuffer, {
      filename: csvFile.originalFilename || 'upload.csv',
      contentType: csvFile.mimetype || 'text/csv'
    });

    console.log('Sending binary CSV to webhook:', webhookUrl);

    // Send to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log('N8N webhook response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook failed:', response.status, errorText);
      return res.status(500).json({ 
        error: `Webhook failed: ${response.status}`,
        details: errorText
      });
    }

    const result = await response.text();
    console.log('N8N response:', result);

    // Clean up temporary file
    fs.unlinkSync(csvFile.filepath);

    res.status(200).json({ 
      success: true, 
      message: 'CSV upload processed successfully',
      admin_user_id: adminUserId,
      company_name: companyName,
      webhook_response: result
    });

  } catch (error) {
    console.error('Error in csv-upload API:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
}
