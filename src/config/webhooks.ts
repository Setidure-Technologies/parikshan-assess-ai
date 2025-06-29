
// Simplified webhook configuration
const WEBHOOK_BASE_URL = 'https://n8n.erudites.in';

export const WEBHOOKS = {
  PROD: {
    USER_CREATION: `${WEBHOOK_BASE_URL}/webhook-test/usercreation`,
    TEST_EVALUATION: `${WEBHOOK_BASE_URL}/webhook-test/testevaluation`,
  },
  TEST: {
    USER_CREATION: `${WEBHOOK_BASE_URL}/webhook-test/usercreation`,
    TEST_EVALUATION: `${WEBHOOK_BASE_URL}/webhook-test/testevaluation`,
  },
};

export const CURRENT_ENV = process.env.NODE_ENV === 'production' ? 'PROD' : 'TEST';
export const ACTIVE_WEBHOOKS = WEBHOOKS[CURRENT_ENV];

console.log('Webhook config loaded:', {
  ENV: CURRENT_ENV,
  USER_CREATION_URL: ACTIVE_WEBHOOKS.USER_CREATION,
  TEST_EVALUATION_URL: ACTIVE_WEBHOOKS.TEST_EVALUATION
});

// Helper function to make webhook requests with consistent configuration
export const makeWebhookRequest = async (url: string, data: FormData | Record<string, any>) => {
  console.log(`Making webhook request to: ${url}`);
  
  let body: FormData | string;
  let contentType: string | undefined;
  
  if (data instanceof FormData) {
    body = data;
    // Don't set Content-Type for FormData, let browser set it with boundary
  } else {
    body = JSON.stringify(data);
    contentType = 'application/json';
  }
  
  const headers: Record<string, string> = {
    'User-Agent': 'Parikshan-AI/1.0',
  };
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    body,
    headers,
    mode: 'cors',
  });
  
  console.log(`Webhook response status: ${response.status}`);
  console.log(`Webhook response headers:`, Object.fromEntries(response.headers.entries()));
  
  return response;
};
