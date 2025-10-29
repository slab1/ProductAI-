// AI Competitive Analysis
// Generates competitive intelligence and market insights

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
        const { competitors, productFeatures, analysisType } = await req.json();

        if (!competitors || !Array.isArray(competitors)) {
            throw new Error('Competitors data is required');
        }

        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const prompt = `You are a competitive intelligence analyst. Analyze these competitors and provide strategic insights:

Competitors:
${JSON.stringify(competitors, null, 2)}

Our Product Features: ${JSON.stringify(productFeatures || [], null, 2)}
Analysis Type: ${analysisType || 'comprehensive'}

Provide analysis in the following JSON format:
{
  "marketPositioning": {
    "ourPosition": "Description of our market position",
    "competitiveAdvantage": ["advantage 1", "advantage 2"],
    "gaps": ["gap 1", "gap 2"]
  },
  "featureComparison": [
    {
      "feature": "Feature name",
      "ourStatus": "available/planned/missing",
      "competitors": [
        {
          "name": "Competitor name",
          "hasFeature": true,
          "implementation": "How they implemented it"
        }
      ],
      "priority": "high/medium/low"
    }
  ],
  "strategicRecommendations": [
    {
      "category": "product/pricing/marketing",
      "recommendation": "Specific actionable recommendation",
      "reasoning": "Why this is important",
      "effort": "high/medium/low",
      "impact": "high/medium/low"
    }
  ],
  "marketTrends": [
    "Trend observation 1",
    "Trend observation 2"
  ],
  "threatsAndOpportunities": {
    "threats": ["threat 1", "threat 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  }
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
                        content: 'You are a competitive intelligence analyst who provides strategic market insights.',
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
        const analysis = JSON.parse(openaiData.choices[0].message.content);

        return new Response(
            JSON.stringify({ data: analysis }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Competitive analysis error:', error);
        return new Response(
            JSON.stringify({
                error: {
                    code: 'COMPETITIVE_ANALYSIS_FAILED',
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
