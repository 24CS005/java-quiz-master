const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtractedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64, fileName, mode } = await req.json();

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'No PDF data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing PDF:', fileName, 'Mode:', mode);

    let systemPrompt = '';
    let userPrompt = '';

    if (mode === 'notes') {
      // Notes-to-Quiz Mode
      systemPrompt = `You are an expert Professor. I will provide you with chapter notes.
1. Read and analyze the notes thoroughly.
2. Create 10 high-quality quiz questions that test the student's understanding of these specific notes.
3. Provide the output in strict JSON format.

For each question, ensure there is exactly one correct answer and distractors are plausible.

Return a JSON array of questions in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "The correct option text",
      "explanation": "Brief explanation from the notes"
    }
  ]
}

Only return valid JSON, no other text.`;

      userPrompt = 'Create a quiz from these notes.';

    } else {
      // QA Mode (Default)
      systemPrompt = `You are a quiz question extractor. Extract Java programming quiz questions from the provided PDF content. 
            
For each question, identify:
1. The question text
2. Multiple choice options (A, B, C, D)
3. The correct answer
4. An explanation if available

Return a JSON array of questions in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "The correct option text",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

If no valid questions can be extracted, return: {"questions": []}
Only return valid JSON, no other text.`;

      userPrompt = 'Extract all Java quiz questions from this PDF document. Focus on multiple choice questions with 4 options.';
    }

    // Use AI to extract/generate questions
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';

    console.log('AI response received');

    // Parse the JSON response
    let extractedQuestions: ExtractedQuestion[] = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        extractedQuestions = parsed.questions || [];
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }

    // Save questions to database
    if (extractedQuestions.length > 0) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const questionsToInsert = extractedQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        source: fileName || 'PDF Upload',
      }));

      const { error: insertError } = await supabase
        .from('custom_questions')
        .insert(questionsToInsert);

      if (insertError) {
        console.error('Error saving questions:', insertError);
      } else {
        console.log(`Saved ${questionsToInsert.length} questions to database`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        questions: extractedQuestions,
        count: extractedQuestions.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
