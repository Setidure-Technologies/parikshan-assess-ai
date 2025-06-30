
import { ACTIVE_WEBHOOKS } from '@/config/webhooks';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== CSV UPLOAD API ROUTE ===');
    console.log('Headers:', req.headers);
    
    // For FormData handling in Next.js API routes, we need to use a form parser
    // Since we're dealing with binary file uploads, we'll forward the request directly
    
    // Create a new FormData object to forward to n8n
    const formData = new FormData();
    
    // Add all the fields from the request body
    // Note: In a real implementation, you'd need to parse the multipart form data
    // For now, we'll reconstruct it from what we expect
    
    console.log('Forwarding request to n8n webhook:', ACTIVE_WEBHOOKS.USER_CREATION);
    
    // Forward the request to n8n webhook using fetch
    const response = await fetch(ACTIVE_WEBHOOKS.USER_CREATION, {
      method: 'POST',
      body: req.body,
      headers: {
        'User-Agent': 'Parikshan-AI/1.0',
        'Content-Type': req.headers['content-type'],
      },
    });

    console.log('N8N response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook error:', errorText);
      throw new Error(`N8N webhook failed: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('N8N webhook response:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText, success: true };
    }

    res.status(200).json({
      success: true,
      message: 'CSV uploaded successfully',
      ...responseData
    });

  } catch (error: any) {
    console.error('CSV upload API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to upload CSV file',
      success: false 
    });
  }
}

// Configure to handle larger file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
