// RICE Score Calculator
// Calculates RICE prioritization scores for features

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
        const { features } = await req.json();

        if (!features || !Array.isArray(features)) {
            throw new Error('Features array is required');
        }

        // Calculate RICE score for each feature
        const calculatedFeatures = features.map(feature => {
            const { reach, impact, confidence, effort } = feature;
            
            // Validate inputs
            if (!reach || !impact || !confidence || !effort || effort === 0) {
                return {
                    ...feature,
                    riceScore: 0,
                    error: 'Invalid input values'
                };
            }

            // RICE Formula: (Reach × Impact × Confidence) / Effort
            // Confidence should be in percentage (0-100), convert to decimal
            const confidenceDecimal = confidence / 100;
            const riceScore = (reach * impact * confidenceDecimal) / effort;

            return {
                ...feature,
                riceScore: Math.round(riceScore * 100) / 100, // Round to 2 decimal places
            };
        });

        // Sort by RICE score descending
        const sortedFeatures = calculatedFeatures.sort((a, b) => 
            (b.riceScore || 0) - (a.riceScore || 0)
        );

        // Add priority rank
        const rankedFeatures = sortedFeatures.map((feature, index) => ({
            ...feature,
            priorityRank: index + 1,
        }));

        return new Response(
            JSON.stringify({ data: rankedFeatures }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('RICE calculation error:', error);
        return new Response(
            JSON.stringify({
                error: {
                    code: 'RICE_CALCULATION_FAILED',
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
