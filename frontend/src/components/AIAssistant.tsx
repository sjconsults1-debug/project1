import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useResume } from '../contexts/ResumeContext';
import { aiService, AISuggestionRequest, AIImproveRequest, AIOptimizeRequest } from '../services/aiService';
import {
  Sparkles,
  Wand2,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface AIAssistantProps {
  section: 'summary' | 'experience' | 'skills' | 'education' | 'projects';
  content?: string;
  context?: any;
  onResumeUpdate?: (newContent: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  section,
  content,
  context,
  onResumeUpdate
}) => {
  const { user } = useAuth();
  const { currentContent } = useResume();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<any>(null);

  React.useEffect(() => {
    if (isOpen) {
      loadUsageStats();
    }
  }, [isOpen]);

  const loadUsageStats = async () => {
    try {
      const stats = await aiService.getUsageStats();
      setUsageStats(stats);
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  };

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const request: AISuggestionRequest = {
        section,
        context: {
          ...context,
          subscriptionTier: user?.subscriptionTier,
        }
      };

      const response = await aiService.generateSuggestions(request);
      setSuggestions(response.suggestions);
      setUsageStats(prev => prev ? {
        ...prev,
        remaining: response.remainingSuggestions || prev.remaining
      } : null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const improveContent = async () => {
    if (!content) {
      setError('Please provide some content to improve');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: AIImproveRequest = {
        section,
        content,
        context
      };

      const response = await aiService.improveContent(request);
      setSuggestions(response.suggestions);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to improve content');
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeForJob = async () => {
    const jobDescription = prompt('Please paste the job description you want to optimize for:');
    if (!jobDescription) return;

    if (!content) {
      setError('Please provide some content to optimize');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: AIOptimizeRequest = {
        section,
        content,
        jobDescription,
        context
      };

      const response = await aiService.optimizeForJob(request);
      setSuggestions(response.suggestions);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to optimize content');
    } finally {
      setIsLoading(false);
    }
  };

  const acceptSuggestion = async (suggestion: string) => {
    if (onResumeUpdate) {
      onResumeUpdate(suggestion);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getSectionName = () => {
    const names = {
      summary: 'Professional Summary',
      experience: 'Work Experience',
      skills: 'Skills',
      education: 'Education',
      projects: 'Projects'
    };
    return names[section];
  };

  const isUsageLimitReached = usageStats && usageStats.remaining <= 0;

  return (
    <div className="bg-gradient-to-r from-accent-emerald/10 to-accent-orange/10 rounded-lg border border-accent-emerald/20">
      <div className="p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-accent-emerald" />
            <span className="font-medium text-gray-900">AI Assistant</span>
            <span className="text-sm text-gray-600">({getSectionName()})</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="mt-4 space-y-4">
            {/* Usage Stats */}
            {usageStats && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">AI Credits This Month:</span>
                  <span className={`font-medium ${
                    isUsageLimitReached ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {usageStats.remaining} / {usageStats.maxSuggestions}
                  </span>
                </div>
                {usageStats.acceptanceRate > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    Acceptance Rate: {usageStats.acceptanceRate}%
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={generateSuggestions}
                disabled={isLoading || isUsageLimitReached}
                className="btn-primary flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="h-4 w-4 mr-1" />
                Generate
              </button>

              <button
                onClick={improveContent}
                disabled={isLoading || isUsageLimitReached}
                className="btn-secondary flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Improve
              </button>

              <button
                onClick={optimizeForJob}
                disabled={isLoading || isUsageLimitReached}
                className="btn-outline flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Target className="h-4 w-4 mr-1" />
                Optimize for Job
              </button>
            </div>

            {/* Usage Limit Warning */}
            {isUsageLimitReached && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium">AI Credits Limit Reached</p>
                    <p className="text-yellow-700 mt-1">
                      Upgrade to Pro for unlimited AI suggestions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emerald mr-2"></div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            )}

            {/* Suggestions Display */}
            {suggestions.length > 0 && !isLoading && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">AI Suggestions:</h4>
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {suggestion}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => acceptSuggestion(suggestion)}
                          className="btn-primary text-xs flex items-center"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Use This
                        </button>
                        <button
                          onClick={() => copyToClipboard(suggestion)}
                          className="btn-outline text-xs flex items-center"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </button>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button className="text-gray-400 hover:text-green-600">
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;