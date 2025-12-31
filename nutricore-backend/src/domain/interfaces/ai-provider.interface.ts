export interface AiResponse {
  adjustment_score: number;
  urgency_level: 'HIGH' | 'LOW';
  reasoning: string;
}

export interface IAiProvider {
  generateSmartAdvice(context: string): Promise<AiResponse>;
}