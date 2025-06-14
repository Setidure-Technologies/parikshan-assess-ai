
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('CSV upload request received:', req.body);
    
    // Use your actual n8n webhook URL
    const webhookUrl = 'https://n8n.erudites.in/webhook-test/476f1370-870d-459e-8be0-8ab3d86ff69a';
    
    if (!webhookUrl) {
      return res.status(500).json({ error: 'N8N webhook URL not configured' });
    }

    // Parse CSV content into candidate records
    const { csvContent, companyId } = req.body;
    
    if (!csvContent || !companyId) {
      return res.status(400).json({ error: 'Missing csvContent or companyId' });
    }

    // Parse CSV into array of candidates
    const lines = csvContent.split('\n').filter((line: string) => line.trim());
    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    
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

    // Send to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'bulk_create_candidates',
        candidates: candidates,
        company_id: companyId
      }),
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
      candidates_count: candidates.length
    });
  } catch (error: any) {
    console.error('Error in csv-upload API:', error);
    res.status(500).json({ error: error.message });
  }
}
