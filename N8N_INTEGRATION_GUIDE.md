
# N8N Integration Guide for Parikshan AI

## Overview
This guide explains how to set up n8n workflows to automate candidate management and question generation for Parikshan AI.

## Required n8n Workflows

### 1. Candidate Creation Workflow
**Trigger**: Webhook - `/webhook/create-candidate`
**Purpose**: Create candidate records and generate questions

#### Workflow Steps:
1. **Webhook Trigger**
   - Method: POST
   - Expected payload:
   ```json
   {
     "email": "candidate@example.com",
     "full_name": "John Doe",
     "user_id": "uuid",
     "company_id": "uuid",
     "action": "create_candidate"
   }
   ```

2. **Supabase - Check Existing Candidate**
   - Query: `SELECT id FROM candidates WHERE email = '{{ $json.email }}'`
   - Skip if candidate already exists

3. **Supabase - Insert Candidate**
   ```sql
   INSERT INTO candidates (email, full_name, user_id, company_id, test_status)
   VALUES ('{{ $json.email }}', '{{ $json.full_name }}', '{{ $json.user_id }}', '{{ $json.company_id }}', 'pending')
   RETURNING id
   ```

4. **Supabase - Get Sections**
   ```sql
   SELECT * FROM sections ORDER BY display_order
   ```

5. **For Each Section - Get Question Templates**
   ```sql
   SELECT * FROM question_templates 
   WHERE section_id = '{{ $json.id }}'
   ORDER BY question_number
   ```

6. **For Each Template - Generate Question**
   ```sql
   INSERT INTO questions (
     template_id, section_id, candidate_id, company_id,
     question_number, question_text, question_type,
     options, time_limit_seconds, metadata, created_by_flow
   ) VALUES (
     '{{ $json.id }}', '{{ $json.section_id }}', '{{ $parent.candidate_id }}',
     '{{ $parent.company_id }}', {{ $json.question_number }},
     '{{ $json.question_text }}', '{{ $json.question_type }}',
     '{{ JSON.stringify($json.options) }}', {{ $json.time_to_answer_seconds }},
     '{{ JSON.stringify($json.metadata) }}', true
   )
   ```

7. **Update Candidate Status**
   ```sql
   UPDATE candidates 
   SET test_status = 'questions_generated'
   WHERE id = '{{ $json.candidate_id }}'
   ```

### 2. CSV Upload Workflow
**Trigger**: Webhook - `/webhook/csv-upload`
**Purpose**: Process CSV files and create multiple candidates

#### Workflow Steps:
1. **Webhook Trigger**
   - Method: POST
   - Expected payload:
   ```json
   {
     "csvContent": "full_name,email,phone\nJohn Doe,john@example.com,123-456-7890",
     "filename": "candidates.csv",
     "company_id": "uuid"
   }
   ```

2. **Parse CSV**
   - Use n8n's built-in CSV parser
   - Map columns: full_name, email, phone

3. **For Each Row - Create Candidate**
   - Call the candidate creation workflow for each row
   - Include company_id from the original request

4. **Send Notification**
   - Optional: Send email/slack notification when processing is complete

### 3. Question Generation Workflow (Standalone)
**Trigger**: Manual/Scheduled
**Purpose**: Generate questions for candidates with 'pending' status

#### Workflow Steps:
1. **Get Pending Candidates**
   ```sql
   SELECT id, company_id FROM candidates 
   WHERE test_status = 'pending'
   ```

2. **For Each Candidate**
   - Follow steps 4-7 from the Candidate Creation Workflow

## Setting Up n8n

### 1. Install n8n
```bash
npm install n8n -g
# or
npx n8n
```

### 2. Configure Supabase Connection
- Add Supabase credentials in n8n settings
- Use the service role key for database operations
- Set up the connection string: `postgresql://postgres:[password]@[host]:5432/postgres`

### 3. Create Webhooks
1. Create new workflow in n8n
2. Add "Webhook" trigger node
3. Set webhook URL (e.g., `/webhook/create-candidate`)
4. Configure HTTP method as POST
5. Enable "Respond to Webhook" option

### 4. Environment Variables Needed
```env
SUPABASE_URL=https://xpmqzpqfeaokvugworla.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
N8N_WEBHOOK_BASE_URL=http://localhost:5678
```

## Integration with Parikshan AI

### 1. Update API Routes
The following API routes in your app should call n8n webhooks:

#### `/api/n8n/create-candidate.ts`
```typescript
const webhookUrl = `${process.env.N8N_WEBHOOK_BASE_URL}/webhook/create-candidate`;
await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(candidateData)
});
```

#### `/api/n8n/csv-upload.ts`
```typescript
const webhookUrl = `${process.env.N8N_WEBHOOK_BASE_URL}/webhook/csv-upload`;
await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ csvContent, filename, company_id })
});
```

### 2. Test the Integration
1. Sign up as a new candidate → Should trigger candidate creation
2. Upload CSV as admin → Should create multiple candidates
3. Check database to ensure questions are generated
4. Verify candidate status changes from 'pending' to 'questions_generated'

## Troubleshooting

### Common Issues:
1. **Webhook not triggered**: Check n8n is running and webhook URL is correct
2. **Database errors**: Verify Supabase credentials and RLS policies
3. **Questions not generated**: Check if question templates exist in database
4. **Candidate status not updating**: Verify the workflow completes successfully

### Debugging Steps:
1. Check n8n execution logs
2. Monitor Supabase real-time logs
3. Test webhooks manually using curl/Postman
4. Verify database constraints and foreign keys

## Production Deployment

### 1. Deploy n8n
- Use Docker or cloud service (AWS, Digital Ocean, etc.)
- Set up SSL certificates for webhooks
- Configure environment variables securely

### 2. Update Webhook URLs
- Replace localhost URLs with production n8n instance
- Update environment variables in your app

### 3. Monitoring
- Set up n8n workflow monitoring
- Add error handling and notifications
- Monitor database performance and query execution

## Sample Question Templates

Before testing, ensure you have question templates in your database:

```sql
-- Insert sample sections
INSERT INTO sections (name, description, display_order, time_limit_minutes) VALUES
('Cognitive Ability', 'Assess reasoning and problem-solving skills', 1, 30),
('Personality Assessment', 'Evaluate personality traits and behavior', 2, 20);

-- Insert sample question templates
INSERT INTO question_templates (
  section_id, question_number, question_text, question_type,
  options, time_to_answer_seconds, scale_dimension
) VALUES
(
  (SELECT id FROM sections WHERE name = 'Cognitive Ability'),
  1, 'What is 2 + 2?', 'mcq',
  '["2", "3", "4", "5"]', 60, 'numerical_reasoning'
),
(
  (SELECT id FROM sections WHERE name = 'Personality Assessment'),
  1, 'I enjoy working in teams', 'likert_scale',
  '["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]',
  30, 'teamwork'
);
```

This setup will ensure that when candidates are created through n8n, they automatically get questions generated based on your templates.
