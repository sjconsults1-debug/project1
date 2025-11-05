import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService } from '../services/analyticsService';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Download,
  Sparkles,
  Calendar,
  Target,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';

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
    averageTimeToComplete: number;
    completionRate: number;
    averageSectionsPerResume: number;
    exportRate: number;
  };
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getUserAnalytics(timeframe);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadAnalytics}
            className="btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your resume performance and AI usage</p>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-2 mt-4">
            {(['7d', '30d', '90d', '1y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {tf === '7d' && 'Last 7 days'}
                {tf === '30d' && 'Last 30 days'}
                {tf === '90d' && 'Last 90 days'}
                {tf === '1y' && 'Last year'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalResumes}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalViews)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalDownloads}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Suggestions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalAISuggestions}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeResumes}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Performance Metrics</h2>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Avg. Time to Complete</span>
                </div>
                <span className="font-medium">{analytics.performanceMetrics.averageTimeToComplete} min</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Completion Rate</span>
                </div>
                <span className="font-medium">{analytics.performanceMetrics.completionRate}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Avg. Sections per Resume</span>
                </div>
                <span className="font-medium">{analytics.performanceMetrics.averageSectionsPerResume}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Export Rate</span>
                </div>
                <span className="font-medium">{analytics.performanceMetrics.exportRate}%</span>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">AI Insights</h2>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Suggestions</span>
                <span className="font-medium">{analytics.aiInsights.totalSuggestions}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Acceptance Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${analytics.aiInsights.acceptanceRate}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{analytics.aiInsights.acceptanceRate}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Popular Sections</h3>
                {analytics.aiInsights.popularSections.map((section) => (
                  <div key={section.section} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{section.section}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{section.suggestions} suggestions</span>
                      <span className="text-xs text-gray-500">({section.acceptanceRate}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Templates */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Most Used Templates</h2>
            <p className="card-description">Templates your audience loves most</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {analytics.topTemplates.map((template, index) => (
                <div key={template.templateId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg text-primary-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{template.templateName}</p>
                      <p className="text-sm text-gray-500 capitalize">{template.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{template.usageCount}</p>
                    <p className="text-sm text-gray-500">uses</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Resume Growth</h2>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="card-content">
              <div className="h-64 flex items-center justify-center text-gray-500">
                <BarChart3 className="h-12 w-12 text-gray-300" />
                <p className="ml-2">Growth chart visualization</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">AI Usage Trends</h2>
              <Sparkles className="h-5 w-5 text-gray-400" />
            </div>
            <div className="card-content">
              <div className="h-64 flex items-center justify-center text-gray-500">
                <BarChart3 className="h-12 w-12 text-gray-300" />
                <p className="ml-2">AI usage chart visualization</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Plan Info */}
        {user?.subscriptionTier === 'free' && (
          <div className="bg-gradient-to-r from-primary-50 to-accent-emerald/10 rounded-lg p-6 border border-accent-emerald/20">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-accent-emerald mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Upgrade to Pro for Advanced Analytics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get detailed insights, longer timeframes, and AI-powered recommendations to optimize your resume performance.
                </p>
                <button className="btn-primary">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;