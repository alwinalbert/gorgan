export type ThreatLevel = 'safe' | 'warning' | 'danger' | 'critical';

export interface Alert {
  id: string;
  timestamp: Date;
  type: 'demogorgon' | 'mindflayer' | 'demodogs' | 'other';
  confidence: number;
  threatLevel: ThreatLevel;
  location?: string;
  imageUrl?: string;
  description: string;
}

export interface GeminiThreatAnalysis {
  isThreat: boolean;
  threatType: string;
  confidence: number;
  threatLevel: ThreatLevel;
  description: string;
  recommendations: string[];
  weakPoints?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
