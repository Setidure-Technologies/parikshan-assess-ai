
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

    console.log('Processing CSV upload with data:', { 
      adminUserId, 
      companyId, 
      companyName, 
      industry, 
      filename: filename || csvFile.originalFilename,
      fileSize: csvFile.size,
      filePath: csvFile.filepath
    });

    if (!companyId || !adminUserId) {
      return res.status(400).json({ 
        error: 'Missing required data: companyId, or adminUserId' 
      });
    }

    // Read the CSV file content
    const fileContent = fs.readFileSync(csvFile.filepath);
    console.log('File content read, size:', fileContent.length);

    // Create FormData for binary file upload
    const formData = new FormData();
    
    // Add metadata fields
    formData.append('adminUserId', adminUserId);
    formData.append('companyId', companyId);
    formData.append('companyName', companyName || '');
    formData.append('industry', industry || '');
    formData.append('filename', filename || csvFile.originalFilename || 'upload.csv');
    formData.append('batch_id', `BATCH_${Date.now()}`);

    // Add the CSV file as binary blob
    const blob = new Blob([fileContent], { 
      type: csvFile.mimetype || 'text/csv' 
    });
    formData.append('file', blob, csvFile.originalFilename || 'upload.csv');

    console.log('Sending binary CSV to webhook:', webhookUrl);
    console.log('FormData entries:', [...formData.entries()].map(([key, value]) => [key, typeof value === 'object' ? 'File/Blob' : value]));

    // Send to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary
    });

    console.log('N8N webhook response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook failed:', response.status, errorText);
      return res.status(500).json({ 
        error: `Webhook failed: ${response.status} - ${errorText}`,
        details: errorText
      });
    }

    // Try to parse JSON response, but handle non-JSON responses
    let result;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const textResult = await response.text();
      console.log('N8N response (non-JSON):', textResult);
      result = { message: textResult, success: true };
    }

    console.log('N8N response data:', result);

    res.status(200).json({ 
      success: true, 
      message: 'CSV upload processed successfully',
      candidates_count: result.candidates_count || 'Unknown',
      admin_user_id: adminUserId,
      company_name: companyName,
      webhook_response: result
    });

  } catch (error: any) {
    console.error('Error in csv-upload API:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
}
