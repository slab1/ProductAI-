// AI OKR Alignment Engine
// Provides suggestions for OKR alignment and progress tracking

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
        const { okrs, companyOkrs, teamGoals } = await req.json();

        if (!okrs || !Array.isArray(okrs)) {
            throw new Error('OKRs data is required');
        }

        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const prompt = `You are an OKR strategy expert. Analyze these OKRs and provide alignment suggestions:

Current OKRs:
${JSON.stringify(okrs, null, 2)}

Company-level OKRs: ${JSON.stringify(companyOkrs || [], null, 2)}
Team Goals: ${JSON.stringify(teamGoals || [], null, 2)}

Provide analysis in the following JSON format:
{
  "alignmentScore": 85,
  "alignmentInsights": [
    {
      "okrId": "id of the OKR",
      "alignmentStatus": "well-aligned/partially-aligned/misaligned",
      "reasoning": "Explanation of alignment status",
      "suggestions": ["suggestion 1", "suggestion 2"]
    }
  ],
  "missingConnections": [
    {
      "teamOkr": "Team OKR objective",
      "companyOkr": "Related company OKR",
      "suggestedKeyResult": "Suggested key result to bridge the gap"
    }
  ],
  "improvementRecommendations": [
    {
      "category": "alignment/measurement/ambition",
      "recommendation": "Specific recommendation",
      "priority": "high/medium/low"
    }
  ],
  "keyResultQuality": [
    {
      "keyResultId": "id",
      "qualityScore": 80,
      "feedback": "What makes this good/bad",
      "improvement": "How to improve it"
    }
  ],
  "overallHealth": {
    "score": 75,
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"]
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
                        content: 'You are an OKR strategy expert who helps organizations create aligned, measurable objectives.',
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
        const alignment = JSON.parse(openaiData.choices[0].message.content);

        return new Response(
            JSON.stringify({ data: alignment }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('OKR alignment error:', error);
        return new Response(
            JSON.stringify({
                error: {
                    code: 'OKR_ALIGNMENT_FAILED',
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
