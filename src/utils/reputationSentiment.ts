import { analyzeSentimentGoogle } from './googleLanguage';

// Positive keywords that indicate good reputation
const POSITIVE_KEYWORDS = [
  'award', 'winner', 'best', 'top', 'leading', 'successful', 'innovative', 'excellent',
  'outstanding', 'prestigious', 'acclaimed', 'renowned', 'respected', 'expert', 'leader',
  'pioneer', 'breakthrough', 'achievement', 'accomplishment', 'recognition', 'honor',
  'praised', 'celebrated', 'distinguished', 'prominent', 'notable', 'impressive',
  'profitable', 'growth', 'expansion', 'success', 'thriving', 'flourishing',
  'cool', 'hot', 'rising', 'emerging', 'promising', 'talent', 'skilled', 'experienced',
  'visionary', 'mastermind', 'genius', 'brilliant', 'exceptional', 'remarkable',
  // Business transaction terms (typically positive)
  'acquired', 'acquisition', 'acquired by', 'bought by', 'purchased by', 'merged',
  'merger', 'deal', 'sold to', 'partnership', 'investment', 'funding', 'backed',
  'valuation', 'exit', 'ipo', 'public offering', 'unicorn', 'billion', 'million',
  'round', 'series', 'venture', 'capital', 'investor', 'strategic', 'buyout'
];

// Negative keywords that indicate poor reputation
const NEGATIVE_KEYWORDS = [
  'scandal', 'controversy', 'lawsuit', 'sued', 'fraud', 'scam', 'illegal', 'criminal',
  'arrested', 'charged', 'guilty', 'convicted', 'bankruptcy', 'failed', 'failure',
  'declined', 'struggling', 'problems', 'issues', 'crisis', 'disaster', 'terrible',
  'awful', 'bad', 'worst', 'poor', 'disappointing', 'criticized', 'condemned',
  'accused', 'alleged', 'suspicious', 'questionable', 'unethical', 'corrupt',
  'investigation', 'probe', 'violation', 'breach', 'misconduct', 'negligence'
];

// Business/professional context patterns that are typically positive
const POSITIVE_PATTERNS = [
  /\b(co-?)?founder\b/i,
  /\b(ceo|cto|cfo|president|director|manager)\b/i,
  /\bstarted? (a )?company\b/i,
  /\blaunched?\b/i,
  /\braised \$[\d,]+/i,
  /\bfunding\b/i,
  /\binvestors?\b/i,
  /\bvaluation\b/i,
  /\bgrew (the )?company\b/i,
  /\bexpanded?\b/i,
  /\bpartnership\b/i,
  /\bacquisition\b/i,
  /\bmerger\b/i,
  // Acquisition and transaction patterns
  /\bacquired by\b/i,
  /\bbought (out|by)\b/i,
  /\bsold (to|for)\b/i,
  /\b\w+ acquisition\b/i,
  /\bmerged with\b/i,
  /\bstrategic (partnership|deal|investment)\b/i,
  /\bexit (strategy|opportunity)\b/i,
  /\bsuccessful (exit|sale|acquisition)\b/i,
  /\b(created|founded) by\b/i,
  /\bafter being acquired\b/i,
  /\bspending streak\b/i,
  /\bcontinues with\b/i
];

export interface EnhancedSentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  googleScore: number;
  googleMagnitude: number;
  keywordBoost: number;
  patternBoost: number;
  finalScore: number;
  reasoning: string;
}

export async function analyzeReputationSentiment(text: string): Promise<EnhancedSentimentResult> {
  try {
    // Get Google's base sentiment analysis
    const googleResult = await analyzeSentimentGoogle(text);
    const googleScore = googleResult.score;
    const googleMagnitude = googleResult.magnitude;
    
    const lowerText = text.toLowerCase();
    
    // Count positive and negative keywords
    const positiveMatches = POSITIVE_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
    const negativeMatches = NEGATIVE_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
    
    // Check for positive business patterns
    const positivePatternMatches = POSITIVE_PATTERNS.filter(pattern => 
      pattern.test(text)
    );
    
    // Calculate keyword-based adjustments
    let keywordBoost = 0;
    keywordBoost += positiveMatches.length * 0.3; // Each positive keyword adds 0.3
    keywordBoost -= negativeMatches.length * 0.4; // Each negative keyword subtracts 0.4
    
    // Extra boost for acquisition-related terms (they're almost always positive)
    const acquisitionTerms = ['acquired', 'acquisition', 'merger', 'deal', 'bought', 'sold to'];
    const hasAcquisition = acquisitionTerms.some(term => lowerText.includes(term));
    if (hasAcquisition) {
      keywordBoost += 0.4; // Strong positive boost for acquisition context
    }
    
    // Pattern boost for business context
    let patternBoost = positivePatternMatches.length * 0.2;
    
    // Calculate final score
    let finalScore = googleScore + keywordBoost + patternBoost;
    
    // Apply magnitude consideration - if Google detected strong sentiment, trust it more
    if (googleMagnitude > 0.8) {
      finalScore = (finalScore + googleScore) / 2; // Average with Google's score for high confidence
    }
    
    // Determine sentiment with more nuanced thresholds
    let sentiment: 'positive' | 'neutral' | 'negative';
    let confidence: number;
    let reasoning: string;
    
    if (finalScore > 0.15 || positiveMatches.length >= 2) {
      sentiment = 'positive';
      confidence = Math.min(0.9, 0.5 + Math.abs(finalScore));
      reasoning = positiveMatches.length > 0 
        ? `Positive keywords: ${positiveMatches.join(', ')}` 
        : 'Google sentiment analysis indicates positive tone';
    } else if (finalScore < -0.15 || negativeMatches.length >= 2) {
      sentiment = 'negative';
      confidence = Math.min(0.9, 0.5 + Math.abs(finalScore));
      reasoning = negativeMatches.length > 0 
        ? `Negative keywords: ${negativeMatches.join(', ')}` 
        : 'Google sentiment analysis indicates negative tone';
    } else {
      sentiment = 'neutral';
      confidence = 0.6;
      reasoning = 'Mixed or insufficient sentiment indicators';
    }
    
    // Special case: If we have strong positive business indicators, lean positive
    if (positivePatternMatches.length >= 2 && sentiment === 'neutral') {
      sentiment = 'positive';
      confidence = 0.7;
      reasoning = `Business context indicators: ${positivePatternMatches.map(p => p.source).join(', ')}`;
    }
    
    // Special case: Acquisition announcements are almost always positive
    if (hasAcquisition && sentiment === 'neutral') {
      sentiment = 'positive';
      confidence = 0.8;
      reasoning = 'Acquisition/business transaction context - typically positive for founders/companies';
    }
    
    return {
      sentiment,
      confidence,
      googleScore,
      googleMagnitude,
      keywordBoost,
      patternBoost,
      finalScore,
      reasoning
    };
    
  } catch (error) {
    console.error('Enhanced sentiment analysis failed:', error);
    
    // Fallback to simple keyword analysis
    const lowerText = text.toLowerCase();
    const positiveCount = POSITIVE_KEYWORDS.filter(k => lowerText.includes(k)).length;
    const negativeCount = NEGATIVE_KEYWORDS.filter(k => lowerText.includes(k)).length;
    
    if (positiveCount > negativeCount) {
      return {
        sentiment: 'positive',
        confidence: 0.6,
        googleScore: 0,
        googleMagnitude: 0,
        keywordBoost: positiveCount * 0.3,
        patternBoost: 0,
        finalScore: positiveCount * 0.3,
        reasoning: 'Fallback keyword analysis - positive keywords detected'
      };
    } else if (negativeCount > positiveCount) {
      return {
        sentiment: 'negative',
        confidence: 0.6,
        googleScore: 0,
        googleMagnitude: 0,
        keywordBoost: negativeCount * -0.3,
        patternBoost: 0,
        finalScore: negativeCount * -0.3,
        reasoning: 'Fallback keyword analysis - negative keywords detected'
      };
    }
    
    return {
      sentiment: 'neutral',
      confidence: 0.5,
      googleScore: 0,
      googleMagnitude: 0,
      keywordBoost: 0,
      patternBoost: 0,
      finalScore: 0,
      reasoning: 'Fallback analysis - no clear sentiment indicators'
    };
  }
}