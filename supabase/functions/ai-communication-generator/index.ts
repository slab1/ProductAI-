// AI Communication Generator
// Generates stakeholder communications and reports

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
        const { communicationType, projectData, audience, keyPoints } = await req.json();

        if (!communicationType) {
            throw new Error('Communication type is required');
        }

        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const typeInstructions = {
            'executive_summary': 'Create a concise executive summary focusing on key metrics, decisions needed, and strategic implications.',
            'product_update': 'Create an engaging product update highlighting progress, achievements, and upcoming milestones.',
            'board_presentation': 'Create a board-level presentation outline with strategic insights, financial implications, and risk assessment.',
            'stakeholder_report': 'Create a comprehensive stakeholder report with detailed progress, challenges, and next steps.',
        };

        const instruction = typeInstructions[communicationType] || 'Create a professional communication.';

        const prompt = `You are an expert product communication specialist. ${instruction}

Communication Type: ${communicationType}
Target Audience: ${audience || 'General stakeholders'}

Project Data:
${JSON.stringify(projectData || {}, null, 2)}

Key Points to Include:
${JSON.stringify(keyPoints || [], null, 2)}

Generate the communication in the following JSON format:
{
  "title": "Communication title",
  "subtitle": "Brief subtitle or tagline",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content in markdown format",
      "type": "text/metrics/list"
    }
  ],
  "keyMetrics": [
    {
      "label": "Metric name",
      "value": "Metric value",
      "trend": "up/down/stable",
      "change": "+15%"
    }
  ],
  "callToAction": "What action is needed from recipients",
  "nextSteps": [
    "Next step 1",
    "Next step 2"
  ]
}

Provide only the JSON response, no additional text.`;

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
                        content: 'You are an expert product communication specialist who creates compelling stakeholder communications.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.text();
            throw new Error(`OpenAI API error: ${errorData}`);
        }

        const openaiData = await openaiResponse.json();
        const communication = JSON.parse(openaiData.choices[0].message.content);

        return new Response(
            JSON.stringify({ data: communication }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Communication generation error:', error);
        return new Response(
            JSON.stringify({
                error: {
                    code: 'COMMUNICATION_GENERATION_FAILED',
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
