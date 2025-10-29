// AI-powered User Story Generator
// Generates user stories from product requirements using GPT-4

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { requirement, projectContext, featureTitle } = await req.json();

        if (!requirement) {
            throw new Error('Requirement is required');
        }

        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        // Construct prompt for user story generation
        const prompt = `You are an expert product manager. Generate a comprehensive user story from this requirement:

Requirement: ${requirement}
Feature: ${featureTitle || 'N/A'}
Project Context: ${projectContext || 'N/A'}

Generate a user story in the following JSON format:
{
  "title": "Brief title for the user story",
  "userRole": "As a [type of user]",
  "userGoal": "I want to [perform this action]",
  "userBenefit": "So that [achieve this benefit]",
  "acceptanceCriteria": [
    "Given [context], when [action], then [expected result]",
    "Given [context], when [action], then [expected result]"
  ],
  "storyPoints": 5,
  "priority": "high",
  "technicalNotes": "Any technical considerations"
}

Provide only the JSON response, no additional text.`;

        // Call OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert product manager who creates detailed, actionable user stories.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.text();
            throw new Error(`OpenAI API error: ${errorData}`);
        }

        const openaiData = await openaiResponse.json();
        const generatedContent = openaiData.choices[0].message.content;

        // Parse the JSON response
        const userStory = JSON.parse(generatedContent);

        return new Response(
            JSON.stringify({ data: userStory }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('User story generation error:', error);
        return new Response(
            JSON.stringify({
                error: {
                    code: 'USER_STORY_GENERATION_FAILED',
                    message: error.message,
                },
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
