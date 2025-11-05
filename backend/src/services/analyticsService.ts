import { PrismaClient } from '@prisma/client';

interface AnalyticsData {
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
    averageTimeToComplete: number; // in minutes
    completionRate: number; // percentage
    averageSectionsPerResume: number;
    exportRate: number; // percentage of resumes that are exported
  };
}

export class AnalyticsService {
  private prisma = new PrismaClient();

  async getUserAnalytics(userId: string, timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
    const now = new Date();
    const startDate = this.getStartDate(now, timeframe);

    const [
      totalResumes,
      totalExports,
      totalAISuggestions,
      acceptedAISuggestions,
      recentResumes,
      topTemplates,
      aiSectionStats
    ] = await Promise.all([
      // Total resumes
      this.prisma.resume.count({
        where: { userId }
      }),

      // Total exports
      this.prisma.export.count({
        where: {
          resume: { userId }
        }
      }),

      // Total AI suggestions
      this.prisma.aISuggestion.count({
        where: {
          resume: { userId }
        }
      }),

      // Accepted AI suggestions
      this.prisma.aISuggestion.count({
        where: {
          resume: { userId },
          isAccepted: true
        }
      }),

      // Recent resumes for views calculation
      this.prisma.resume.findMany({
        where: { userId },
        include: {
          exports: true
        }
      }),

      // Top templates
      this.prisma.template.findMany({
        include: {
          resumes: {
            where: { userId }
          }
        }
      }),

      // AI suggestions by section
      this.prisma.aISuggestion.groupBy({
        by: ['sectionType'],
        where: {
          resume: { userId }
        },
        _count: {
          sectionType: true
        },
        _sum: {
          isAccepted: true
        }
      })
    ]);

    // Calculate total views (exports as proxy for views)
    const totalViews = totalExports;

    // Calculate trends
    const trends = await this.calculateTrends(userId, startDate, now);

    // Calculate top templates
    const templatesWithUsage = topTemplates.map(template => ({
      templateId: template.id,
      templateName: template.name,
      usageCount: template.resumes.length,
      category: template.category
    })).sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);

    // Calculate AI insights
    const acceptanceRate = totalAISuggestions > 0 ? (acceptedAISuggestions / totalAISuggestions) * 100 : 0;

    const popularSections = aiSectionStats.map(stat => ({
      section: stat.sectionType,
      suggestions: stat._count.sectionType,
      acceptanceRate: stat._count.sectionType > 0 ?
        (Number(stat._sum.isAccepted) / stat._count.sectionType) * 100 : 0
    }));

    // Calculate performance metrics
    const activeResumes = recentResumes.filter(r =>
      r.updatedAt > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const avgSections = recentResumes.reduce((acc, resume) => {
      const content = resume.content as any;
      const sections = Object.keys(content).filter(key =>
        content[key] && (Array.isArray(content[key]) ? content[key].length > 0 : content[key].trim().length > 0)
      ).length;
      return acc + sections;
    }, 0) / (recentResumes.length || 1);

    const exportRate = totalResumes > 0 ? (totalExports / totalResumes) * 100 : 0;

    return {
      overview: {
        totalResumes,
        totalViews,
        totalDownloads: totalExports,
        totalAISuggestions,
        activeResumes
      },
      trends,
      topTemplates: templatesWithUsage,
      aiInsights: {
        totalSuggestions: totalAISuggestions,
        acceptanceRate: Math.round(acceptanceRate * 10) / 10,
        popularSections
      },
      performanceMetrics: {
        averageTimeToComplete: 15, // Mock data - would need time tracking
        completionRate: 85, // Mock data - would need completion tracking
        averageSectionsPerResume: Math.round(avgSections * 10) / 10,
        exportRate: Math.round(exportRate * 10) / 10
      }
    };
  }

  private getStartDate(now: Date, timeframe: string): Date {
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (days[timeframe as keyof typeof days] || 30));
    return startDate;
  }

  private async calculateTrends(userId: string, startDate: Date, endDate: Date) {
    // For now, return mock trend data
    // In production, this would query actual data grouped by date
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const generateTrendData = (baseValue: number, variance: number) => {
      const data = [];
      let currentValue = baseValue;

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // Add some random variation
        currentValue += Math.random() * variance - variance / 2;
        currentValue = Math.max(0, currentValue);

        data.push({
          date: date.toISOString().split('T')[0],
          count: Math.round(currentValue)
        });
      }

      return data;
    };

    return {
      resumeGrowth: generateTrendData(5, 2),
      viewsGrowth: generateTrendData(25, 10),
      downloadGrowth: generateTrendData(8, 3),
      aiUsageGrowth: generateTrendData(12, 5)
    };
  }

  async getGlobalAnalytics(): Promise<{
    totalUsers: number;
    totalResumes: number;
    totalExports: number;
    totalAISuggestions: number;
    popularTemplates: Array<{
      templateId: string;
      name: string;
      usageCount: number;
    }>;
    userGrowth: Array<{ date: string; users: number }>;
  }> {
    const [
      totalUsers,
      totalResumes,
      totalExports,
      totalAISuggestions,
      templateUsage
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.resume.count(),
      this.prisma.export.count(),
      this.prisma.aISuggestion.count(),
      this.prisma.template.findMany({
        include: {
          resumes: {
            select: { id: true }
          }
        }
      })
    ]);

    const popularTemplates = templateUsage
      .map(template => ({
        templateId: template.id,
        name: template.name,
        usageCount: template.resumes.length
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    // Mock user growth data
    const userGrowth = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      userGrowth.push({
        date: date.toISOString().split('T')[0],
        users: Math.max(0, totalUsers - Math.floor(Math.random() * 50))
      });
    }

    return {
      totalUsers,
      totalResumes,
      totalExports,
      totalAISuggestions,
      popularTemplates,
      userGrowth
    };
  }

  async getResumeAnalytics(resumeId: string, userId: string): Promise<{
    views: number;
    downloads: number;
    aiSuggestions: number;
    lastAccessed: Date | null;
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
  }> {
    const resume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId
      },
      include: {
        exports: true,
        aiSuggestions: true
      }
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    const content = resume.content as any;

    // Calculate completion progress
    const completionProgress = {
      personalInfo: !!(content.personalInfo && content.personalInfo.firstName && content.personalInfo.lastName),
      summary: !!(content.summary && content.summary.trim().length > 0),
      experience: !!(content.experience && content.experience.length > 0),
      education: !!(content.education && content.education.length > 0),
      skills: !!(content.skills && content.skills.length > 0),
      overall: 0
    };

    const completedSections = Object.values(completionProgress).filter(Boolean).length - 1; // Exclude overall
    completionProgress.overall = Math.round((completedSections / 5) * 100);

    return {
      views: resume.exports.length, // Using exports as proxy for views
      downloads: resume.exports.length,
      aiSuggestions: resume.aiSuggestions.length,
      lastAccessed: resume.updatedAt,
      completionProgress,
      sharingStats: {
        shareCount: 0, // Would need sharing tracking
        shareSources: []
      }
    };
  }

  async recordEvent(userId: string, eventType: string, data: any = {}): Promise<void> {
    // In production, this would store analytics events
    // For now, we'll just log the event
    console.log(`Analytics Event: ${eventType} for user ${userId}`, data);
  }

  async generateReport(userId: string, timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{
    generatedAt: Date;
    timeframe: string;
    analytics: AnalyticsData;
    insights: Array<{
      type: string;
      title: string;
      description: string;
      recommendation?: string;
    }>;
  }> {
    const analytics = await this.getUserAnalytics(userId, timeframe);

    // Generate insights based on analytics data
    const insights = [];

    if (analytics.performanceMetrics.completionRate < 70) {
      insights.push({
        type: 'improvement',
        title: 'Low Resume Completion Rate',
        description: `${analytics.performanceMetrics.completionRate}% of your resumes are fully completed. Consider finishing incomplete resumes to improve your chances.`,
        recommendation: 'Set aside 30 minutes to complete your most promising resumes'
      });
    }

    if (analytics.aiInsights.acceptanceRate < 30) {
      insights.push({
        type: 'ai',
        title: 'Low AI Suggestion Acceptance',
        description: `Only ${analytics.aiInsights.acceptanceRate}% of AI suggestions are being accepted.`,
        recommendation: 'Review AI suggestions more carefully - they can significantly improve your resume quality'
      });
    }

    if (analytics.performanceMetrics.exportRate < 20) {
      insights.push({
        type: 'action',
        title: 'Low Export Rate',
        description: `Only ${analytics.performanceMetrics.exportRate}% of your resumes are being exported.`,
        recommendation: 'Export your completed resumes and apply to more opportunities'
      });
    }

    if (analytics.overview.activeResumes < 3) {
      insights.push({
        type: 'engagement',
        title: 'Limited Active Resumes',
        description: `You only have ${analytics.overview.activeResumes} active resumes.`,
        recommendation: 'Update your resumes regularly to keep them fresh and relevant'
      });
    }

    // Positive insights
    if (analytics.aiInsights.acceptanceRate > 70) {
      insights.push({
        type: 'success',
        title: 'Excellent AI Usage',
        description: `You're accepting ${analytics.aiInsights.acceptanceRate}% of AI suggestions - great job!`,
        recommendation: 'Keep leveraging AI to continuously improve your resumes'
      });
    }

    return {
      generatedAt: new Date(),
      timeframe,
      analytics,
      insights
    };
  }
}

export const analyticsService = new AnalyticsService();