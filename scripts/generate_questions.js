// Script to generate questions for candidates from question templates
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateQuestionsForCandidate(candidateId) {
  try {
    console.log(`Generating questions for candidate: ${candidateId}`);
    
    // Get candidate info
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*, companies(id)')
      .eq('id', candidateId)
      .single();
    
    if (candidateError) {
      console.error('Error fetching candidate:', candidateError);
      return;
    }
    
    if (!candidate) {
      console.error('Candidate not found');
      return;
    }
    
    console.log(`Found candidate: ${candidate.full_name} (${candidate.email})`);
    
    // Get all sections
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('*')
      .order('display_order');
    
    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return;
    }
    
    console.log(`Found ${sections.length} sections`);
    
    // For each section, get question templates and generate questions
    for (const section of sections) {
      console.log(`Processing section: ${section.name}`);
      
      // Get question templates for this section
      const { data: templates, error: templatesError } = await supabase
        .from('question_templates')
        .select('*')
        .eq('section_id', section.id)
        .order('question_number');
      
      if (templatesError) {
        console.error(`Error fetching templates for section ${section.name}:`, templatesError);
        continue;
      }
      
      console.log(`Found ${templates.length} question templates for section ${section.name}`);
      
      // Check if questions already exist for this candidate and section
      const { data: existingQuestions, error: existingQuestionsError } = await supabase
        .from('questions')
        .select('id')
        .eq('candidate_id', candidateId)
        .eq('section_id', section.id);
      
      if (existingQuestionsError) {
        console.error(`Error checking existing questions:`, existingQuestionsError);
        continue;
      }
      
      if (existingQuestions && existingQuestions.length > 0) {
        console.log(`Questions already exist for candidate ${candidateId} and section ${section.name} (${existingQuestions.length} questions)`);
        continue;
      }
      
      // Generate questions from templates
      const questionsToInsert = templates.map(template => ({
        template_id: template.id,
        section_id: section.id,
        candidate_id: candidateId,
        company_id: candidate.companies.id,
        question_number: template.question_number,
        question_text: template.question_text,
        question_type: template.question_type,
        options: template.options,
        time_limit_seconds: template.time_to_answer_seconds,
        metadata: template.metadata,
        created_by_flow: false
      }));
      
      if (questionsToInsert.length === 0) {
        console.log(`No questions to insert for section ${section.name}`);
        continue;
      }
      
      // Insert questions
      const { data: insertedQuestions, error: insertError } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select('id');
      
      if (insertError) {
        console.error(`Error inserting questions for section ${section.name}:`, insertError);
        continue;
      }
      
      console.log(`Successfully inserted ${insertedQuestions.length} questions for section ${section.name}`);
    }
    
    // Update candidate status
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ test_status: 'questions_generated' })
      .eq('id', candidateId);
    
    if (updateError) {
      console.error('Error updating candidate status:', updateError);
      return;
    }
    
    console.log(`Successfully generated questions for candidate ${candidateId}`);
  } catch (error) {
    console.error('Error in generateQuestionsForCandidate:', error);
  }
}

async function main() {
  try {
    // Get all candidates with 'pending' status
    const { data: pendingCandidates, error: pendingError } = await supabase
      .from('candidates')
      .select('id, full_name, email')
      .eq('test_status', 'pending');
    
    if (pendingError) {
      console.error('Error fetching pending candidates:', pendingError);
      return;
    }
    
    console.log(`Found ${pendingCandidates.length} pending candidates`);
    
    // Generate questions for each pending candidate
    for (const candidate of pendingCandidates) {
      await generateQuestionsForCandidate(candidate.id);
    }
    
    console.log('Finished generating questions for all pending candidates');
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// If candidateId is provided as an argument, generate questions for that candidate only
// Otherwise, generate questions for all pending candidates
const candidateId = process.argv[2];
if (candidateId) {
  generateQuestionsForCandidate(candidateId)
    .then(() => console.log('Done'))
    .catch(err => console.error('Error:', err));
} else {
  main()
    .then(() => console.log('Done'))
    .catch(err => console.error('Error:', err));
}