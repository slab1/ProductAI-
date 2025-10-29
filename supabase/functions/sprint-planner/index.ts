// Sprint Planning Assistant
// Helps with task breakdown, estimation, and sprint planning

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
        const { userStories, teamCapacity, sprintGoal, historicalVelocity } = await req.json();

        if (!userStories || !Array.isArray(userStories)) {
            throw new Error('User stories are required');
        }

        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const prompt = `You are an expert Agile coach. Help plan a sprint based on these user stories:

User Stories:
${JSON.stringify(userStories, null, 2)}

Team Capacity: ${teamCapacity || 'Not specified'} hours
Sprint Goal: ${sprintGoal || 'Not specified'}
Historical Velocity: ${historicalVelocity || 'Not available'} story points per sprint

Provide sprint planning recommendations in the following JSON format:
{
  "recommendedStories": [
    {
      "storyId": "id of user story",
      "title": "Story title",
      "priority": 1,
      "estimatedHours": 8,
      "reasoning": "Why this story should be included"
    }
  ],
  "taskBreakdown": [
    {
      "storyId": "id of user story",
      "tasks": [
        {
          "title": "Task title",
          "description": "Task description",
          "estimatedHours": 4,
          "skillRequired": "Frontend/Backend/Design/QA"
        }
      ]
    }
  ],
  "capacityAnalysis": {
    "totalStoryPoints": 25,
    "totalHours": 120,
    "utilizationPercentage": 80,
    "buffer": "20%",
    "recommendation": "Capacity recommendation"
  },
  "risks": [
    {
      "description": "Potential risk",
      "mitigation": "How to mitigate",
      "impact": "high/medium/low"
    }
  ],
  "sprintGoalAlignment": {
    "score": 85,
    "feedback": "How well stories align with sprint goal"
  },
  "dependencies": [
    {
      "task": "Task name",
      "dependsOn": "Other task name",
      "type": "blocking/related"
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
                        content: 'You are an expert Agile coach who helps teams plan effective sprints.',
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
        const sprintPlan = JSON.parse(openaiData.choices[0].message.content);

        return new Response(
            JSON.stringify({ data: sprintPlan }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Sprint planning error:', error);
        return new Response(
            JSON.stringify({
                error: {
                    code: 'SPRINT_PLANNING_FAILED',
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
