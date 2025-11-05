import api from './apiService';

export interface AISuggestionRequest {
  sectionType: 'summary' | 'experience' | 'skills' | 'education' | 'projects';
  context?: {
    role?: string;
    level?: string;
    industry?: string;
    company?: string;
    responsibilities?: string;
    degree?: string;
    field?: string;
    institution?: string;
    [key: string]: any;
  };
  resumeId?: string;
}

export interface AIImproveRequest {
  sectionType: 'summary' | 'experience' | 'skills' | 'education' | 'projects';
  content: string;
  context?: any;
}

export interface AIOptimizeRequest {
  sectionType: 'summary' | 'experience' | 'skills' | 'education' | 'projects';
  content: string;
  jobDescription: string;
  context?: any;
}

export interface AITitleRequest {
  personalInfo: {
    firstName: string;
    lastName: string;
    targetRole?: string;
  };
  experience: Array<{
    position: string;
    company: string;
  }>;
}

export interface AIResponse {
  suggestions: string[];
  confidence: number;
  reasoning: string;
  remainingSuggestions?: number;
}

export interface AIUsageStats {
  totalUsed: number;
  acceptedCount: number;
  remaining: number;
  maxSuggestions: number;
  acceptanceRate: number;
}

export const aiService = {
  async generateSuggestions(request: AISuggestionRequest): Promise<AIResponse> {
    const response = await api.post('/ai/suggest', request);
    return response.data.data;
  },

  async improveContent(request: AIImproveRequest): Promise<AIResponse> {
    const response = await api.post('/ai/improve', request);
    return response.data.data;
  },

  async optimizeForJob(request: AIOptimizeRequest): Promise<AIResponse> {
    const response = await api.post('/ai/optimize', request);
    return response.data.data;
  },

  async generateTitle(request: AITitleRequest): Promise<{ title: string }> {
    const response = await api.post('/ai/title', request);
    return response.data.data;
  },

  async acceptSuggestion(suggestionId: string): Promise<void> {
    await api.post(`/ai/accept/${suggestionId}`);
  },

  async getUsageStats(): Promise<AIUsageStats> {
    const response = await api.get('/ai/usage');
    return response.data.data;
  }
};