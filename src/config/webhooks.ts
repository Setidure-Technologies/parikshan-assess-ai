
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

console.log('Webhook config:', {
  ENV: CURRENT_ENV,
  USER_CREATION_URL: ACTIVE_WEBHOOKS.USER_CREATION
});
