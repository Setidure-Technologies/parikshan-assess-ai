
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { ACTIVE_WEBHOOKS } from '../../src/config/webhooks';

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('CSV upload request received');
    
    const webhookUrl = ACTIVE_WEBHOOKS.USER_CREATION;
    console.log('Using webhook URL:', webhookUrl);

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await form.parse(req);

    // Extract fields from arrays
    const adminUserId = Array.isArray(fields.adminUserId) ? fields.adminUserId[0] : fields.adminUserId;
    const companyId = Array.isArray(fields.companyId) ? fields.companyId[0] : fields.companyId;
    const companyName = Array.isArray(fields.companyName) ? fields.companyName[0] : fields.companyName;
    const industry = Array.isArray(fields.industry) ? fields.industry[0] : fields.industry;
    const filename = Array.isArray(fields.filename) ? fields.filename[0] : fields.filename;

    // Get the CSV file
    const csvFile = Array.isArray(files.csvFile) ? files.csvFile[0] : files.csvFile;

    if (!csvFile) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    if (!companyId || !adminUserId) {
      return res.status(400).json({ 
        error: 'Missing required data: companyId or adminUserId' 
      });
    }

    console.log('Processing CSV:', { 
      adminUserId, 
      companyId, 
      companyName, 
      filename: filename || csvFile.originalFilename,
      fileSize: csvFile.size 
    });

    // Read file as buffer
    const fileBuffer = fs.readFileSync(csvFile.filepath);
    
    // Create form data for n8n
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add all required fields
    formData.append('adminUserId', adminUserId);
    formData.append('companyId', companyId);
    formData.append('companyName', companyName || '');
    formData.append('industry', industry || '');
    formData.append('filename', filename || csvFile.originalFilename || 'upload.csv');
    formData.append('batch_id', `BATCH_${Date.now()}`);
    
    // Add the binary file
    formData.append('file', fileBuffer, {
      filename: csvFile.originalFilename || 'upload.csv',
      contentType: 'text/csv'
    });

    console.log('Sending to n8n webhook...');

    // Send to n8n with proper headers
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        'User-Agent': 'Parikshan-AI/1.0',
      },
    });

    console.log('N8N Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N Error:', response.status, errorText);
      return res.status(500).json({ 
        error: `Webhook failed: ${response.status}`,
        details: errorText
      });
    }

    const result = await response.text();
    console.log('N8N Success Response:', result);

    // Clean up temp file
    try {
      fs.unlinkSync(csvFile.filepath);
    } catch (cleanupError) {
      console.warn('Cleanup warning:', cleanupError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: 'CSV processed successfully',
      admin_user_id: adminUserId,
      company_name: companyName,
      webhook_response: result
    });

  } catch (error: any) {
    console.error('CSV Upload Error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message
    });
  }
}
