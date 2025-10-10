import OpenAI from 'openai';

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  
  return new OpenAI({
    apiKey,
    organization: process.env.OPENAI_ORGANIZATION_ID
  });
};

export interface AISentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  reasoning: string;
  score: number; // -1 to 1 scale
}

export async function analyzeReputationSentimentWithAI(
  text: string, 
  personName: string
): Promise<AISentimentResult> {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `You are a reputation analysis expert. Analyze the following text snippet about "${personName}" and determine if it reflects POSITIVELY, NEGATIVELY, or NEUTRALLY on their reputation.

Consider these factors:
- Business achievements (founding companies, acquisitions, awards, recognition)
- Professional accomplishments and roles
- Media coverage tone and context
- Industry mentions and rankings
- Financial success indicators (profitable, funding, valuations, exits)

Text to analyze: "${text}"

Respond with ONLY a JSON object in this exact format:
{
  "sentiment": "positive|neutral|negative",
  "confidence": 0.85,
  "reasoning": "Brief explanation of why this sentiment was chosen",
  "score": 0.7
}

Where:
- sentiment: positive/neutral/negative based on reputation impact
- confidence: 0.0-1.0 how certain you are of this classification  
- reasoning: 1-2 sentence explanation of the classification
- score: -1.0 (very negative) to 1.0 (very positive) numeric sentiment

Business context: Acquisitions, funding, company founding, leadership roles, awards, and industry recognition are typically POSITIVE for reputation. Scandals, lawsuits, failures, and controversies are NEGATIVE.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.1, // Low temperature for consistent analysis
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200
    });

    const resultText = response.choices[0]?.message?.content?.trim();
    
    if (!resultText) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsed = JSON.parse(resultText);
      
      // Validate the response format
      if (!parsed.sentiment || !['positive', 'neutral', 'negative'].includes(parsed.sentiment)) {
        throw new Error('Invalid sentiment value');
      }
      
      return {
        sentiment: parsed.sentiment,
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
        reasoning: parsed.reasoning || 'AI analysis',
        score: Math.min(1, Math.max(-1, parsed.score || 0))
      };
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', resultText);
      
      // Fallback: Try to extract sentiment from the text response
      const lowerText = resultText.toLowerCase();
      if (lowerText.includes('positive')) {
        return {
          sentiment: 'positive',
          confidence: 0.6,
          reasoning: 'AI indicated positive sentiment',
          score: 0.5
        };
      } else if (lowerText.includes('negative')) {
        return {
          sentiment: 'negative', 
          confidence: 0.6,
          reasoning: 'AI indicated negative sentiment',
          score: -0.5
        };
      } else {
        return {
          sentiment: 'neutral',
          confidence: 0.5,
          reasoning: 'AI response unclear, defaulted to neutral',
          score: 0
        };
      }
    }
    
  } catch (error) {
    console.error('AI sentiment analysis failed:', error);
    
    // Ultimate fallback: Basic keyword analysis
    const lowerText = text.toLowerCase();
    
    const positiveWords = ['award', 'success', 'founder', 'ceo', 'acquired', 'profitable', 'leading', 'best', 'top', 'excellent', 'achievement'];
    const negativeWords = ['scandal', 'lawsuit', 'fraud', 'failed', 'controversy', 'accused', 'guilty', 'bankruptcy'];
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      return {
        sentiment: 'positive',
        confidence: 0.4,
        reasoning: 'Fallback keyword analysis - positive indicators found',
        score: 0.3
      };
    } else if (negativeCount > positiveCount) {
      return {
        sentiment: 'negative',
        confidence: 0.4, 
        reasoning: 'Fallback keyword analysis - negative indicators found',
        score: -0.3
      };
    }
    
    return {
      sentiment: 'neutral',
      confidence: 0.3,
      reasoning: 'AI analysis failed, no clear sentiment indicators',
      score: 0
    };
  }
}