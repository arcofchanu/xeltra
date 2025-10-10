const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function generateZoneChallenge(
    difficulty: 'easy' | 'medium' | 'hard',
    language: 'plaintext' | 'json' | 'xml' | 'yaml'
): Promise<string> {
    const difficultyDescriptions = {
        easy: 'simple and straightforward, suitable for beginners',
        medium: 'moderately complex, requiring some critical thinking',
        hard: 'advanced and challenging, requiring deep understanding of prompting techniques'
    };

    const languageInstructions = {
        plaintext: 'The challenge should be in plain text format.',
        json: 'The challenge should require the user to write a prompt in JSON format.',
        xml: 'The challenge should require the user to write a prompt in XML format.',
        yaml: 'The challenge should require the user to write a prompt in YAML format.'
    };

    const systemPrompt = `You are a prompt engineering challenge generator for a learning platform. Generate a single, unique prompting challenge that is ${difficultyDescriptions[difficulty]}. ${languageInstructions[language]}

The challenge should:
1. Be creative and varied (avoid repetitive patterns)
2. Test practical prompting skills
3. Be clearly described in one or two sentences
4. Be achievable within 60 seconds
5. Focus on real-world use cases

Return ONLY the challenge text itself, nothing else. No preamble, no explanations, just the challenge prompt.`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Xeltra Playground'
            },
            body: JSON.stringify({
                model: 'z-ai/glm-4.5-air:free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Generate a ${difficulty} difficulty prompting challenge for ${language} format.` }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.choices || data.choices.length === 0) {
            throw new Error('No response from OpenRouter API');
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating challenge:', error);
        throw error;
    }
}
