import api from './apiService';

export interface UserAnalytics {
  overview: {
    totalResumes: number;
    totalViews: number;
    totalDownloads: number;
    totalAISuggestions: number;
    activeResumes: number;
  };
  trends: {
    resumeGrowth: Array<{ date: string; count: number }>;
    viewsGrowth: Array<{ date: string; count: number }>;
    downloadGrowth: Array<{ date: string; count: number }>;
    aiUsageGrowth: Array<{ date: string; count: number }>;
  };
  topTemplates: Array<{
    templateId: string;
    templateName: string;
    usageCount: number;
    category: string;
  }>;
  aiInsights: {
    totalSuggestions: number;
    acceptanceRate: number;
    popularSections: Array<{
      section: string;
      suggestions: number;
      acceptanceRate: number;
    }>;
  };
  performanceMetrics: {
    averageTimeToComplete: number;
    completionRate: number;
    averageSectionsPerResume: number;
    exportRate: number;
  };
}

export interface ResumeAnalytics {
  views: number;
  downloads: number;
  aiSuggestions: number;
  lastAccessed: string | null;
  completionProgress: {
    personalInfo: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    overall: number;
  };
  sharingStats: {
    shareCount: number;
    shareSources: Array<{ source: string; count: number }>;
  };
}

export interface AnalyticsReport {
  generatedAt: string;
  timeframe: string;
  analytics: UserAnalytics;
  insights: Array<{
    type: string;
    title: string;
    description: string;
    recommendation?: string;
  }>;
}

export const analyticsService = {
  async getUserAnalytics(timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<UserAnalytics> {
    const response = await api.get(`/analytics/user/${timeframe}`);
    return response.data.data;
  },

  async getResumeAnalytics(resumeId: string): Promise<ResumeAnalytics> {
    const response = await api.get(`/analytics/resume/${resumeId}`);
    return response.data.data;
  },

  async generateReport(timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsReport> {
    const response = await api.post(`/analytics/report/${timeframe}`);
    return response.data.data;
  },

  async trackEvent(eventType: string, data: any = {}): Promise<void> {
    await api.post('/analytics/track', {
      eventType,
      data
    });
  }
};