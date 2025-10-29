// AI Roadmap Optimizer
// Provides intelligent suggestions for roadmap planning and optimization

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
        const { roadmapItems, projectGoals, timeline } = await req.json();

        if (!roadmapItems || !Array.isArray(roadmapItems)) {
            throw new Error('Roadmap items are required');
        }

        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const prompt = `You are an expert product strategist. Analyze this product roadmap and provide optimization suggestions:

Roadmap Items:
${JSON.stringify(roadmapItems, null, 2)}

Project Goals: ${projectGoals || 'Not specified'}
Timeline: ${timeline || 'Not specified'}

Provide strategic insights in the following JSON format:
{
  "optimizations": [
    {
      "itemId": "id of the roadmap item",
      "suggestion": "specific optimization suggestion",
      "reasoning": "why this optimization is recommended",
      "impact": "high/medium/low"
    }
  ],
  "overallInsights": [
    "General insight about the roadmap",
    "Another strategic recommendation"
  ],
  "risks": [
    {
      "description": "Potential risk identified",
      "mitigation": "Suggested mitigation strategy"
    }
  ],
  "dependencies": [
    {
      "items": ["item1", "item2"],
      "relationship": "description of dependency"
    }
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
                        content: 'You are an expert product strategist who provides actionable roadmap optimization insights.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1500,
            }),
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.text();
            throw new Error(`OpenAI API error: ${errorData}`);
        }

        const openaiData = await openaiResponse.json();
        const insights = JSON.parse(openaiData.choices[0].message.content);

        return new Response(
            JSON.stringify({ data: insights }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Roadmap optimization error:', error);
        return new Response(
            JSON.stringify({
                error: {
                    code: 'ROADMAP_OPTIMIZATION_FAILED',
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
