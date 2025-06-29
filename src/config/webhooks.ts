
export const WEBHOOKS = {
  PROD: {
    USER_CREATION: 'https://n8n.erudites.in/webhook/usercreation',
    TEST_EVALUATION: 'https://n8n.erudites.in/webhook/testevaluation',
  },
  TEST: {
    USER_CREATION: 'https://n8n.erudites.in/webhook-test/usercreation',
    TEST_EVALUATION: 'https://n8n.erudites.in/webhook-test/testevaluation',
  },
};

export const CURRENT_ENV = process.env.NODE_ENV === 'production' ? 'PROD' : 'TEST';
export const ACTIVE_WEBHOOKS = WEBHOOKS[CURRENT_ENV];
