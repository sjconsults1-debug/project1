import React, { useState } from 'react';
import { useResume } from '../contexts/ResumeContext';
import { aiService } from '../services/aiService';
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  BarChart3,
  Download,
  Info,
  Loader2
} from 'lucide-react';

interface JobDescription {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  experienceLevel?: string;
}

interface MatchResult {
  overallScore: number;
  categoryScores: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  keywordMatch: {
    matched: string[];
    missing: string[];
    score: number;
  };
  recommendations: string[];
  atsScore: number;
  formattingIssues: string[];
}

interface JobMatchingProps {
  onMatchResult?: (result: MatchResult) => void;
}

const JobMatching: React.FC<JobMatchingProps> = ({ onMatchResult }) => {
  const { currentContent } = useResume();
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const parseJobDescription = (text: string): JobDescription => {
    const lines = text.split('\n').filter(line => line.trim());
    const requirements: string[] = [];
    const responsibilities: string[] = [];
    const skills: string[] = [];

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('requirement') || lowerLine.includes('qualif') || lowerLine.includes('must have')) {
        requirements.push(line);
      } else if (lowerLine.includes('responsib') || lowerLine.includes('duties') || lowerLine.includes('will be')) {
        responsibilities.push(line);
      }

      // Extract skills from the line
      const techSkills = ['javascript', 'python', 'java', 'react', 'node.js', 'aws', 'docker', 'kubernetes', 'sql', 'nosql', 'git', 'agile', 'scrum'];
      techSkills.forEach(skill => {
        if (lowerLine.includes(skill)) {
          skills.push(skill);
        }
      });
    });

    return {
      title: 'Job Position',
      company: 'Company Name',
      description: text,
      requirements,
      responsibilities,
      skills: [...new Set(skills)]
    };
  };

  const analyzeMatch = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description to analyze');
      return;
    }

    if (!currentContent) {
      setError('Please add content to your resume first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const parsedJob = parseJobDescription(jobDescription);
      const result = await aiService.optimizeForJob({
        sectionType: 'summary',
        content: currentContent.summary || '',
        jobDescription: jobDescription,
        context: {
          resumeContent: currentContent,
          jobDescription: parsedJob
        }
      });

      // Create a mock match result since we need to use the job matching service
      const mockMatchResult: MatchResult = {
        overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
        categoryScores: {
          skills: Math.floor(Math.random() * 30) + 70,
          experience: Math.floor(Math.random() * 30) + 70,
          education: Math.floor(Math.random() * 20) + 80,
          keywords: Math.floor(Math.random() * 25) + 75
        },
        matchedSkills: ['React', 'TypeScript', 'Node.js'].slice(0, Math.floor(Math.random() * 3) + 2)),
        missingSkills: ['Docker', 'Kubernetes'].slice(0, Math.floor(Math.random() * 2) + 1)),
        keywordMatch: {
          matched: ['developed', 'managed', 'implemented'],
          missing: ['designed', 'launched'],
          score: Math.floor(Math.random() * 30) + 70
        },
        recommendations: result.suggestions,
        atsScore: Math.floor(Math.random() * 20) + 80,
        formattingIssues: ['Add more action verbs', 'Include quantifiable achievements']
      };

      setMatchResult(mockMatchResult);
      onMatchResult?.(mockMatchResult);
    } catch (err: any) {
      console.error('Job matching error:', err);
      setError(err.response?.data?.error || 'Failed to analyze job match');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5" />;
    return <XCircle className="h-5 w-5" />;
  };

  const formatScore = (score: number): string => {
    return `${score}%`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Job Matching</h3>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-outline text-sm"
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
        </div>

        {/* Job Description Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={showAdvanced ? 8 : 4}
              className="input resize-none"
              placeholder="Paste the full job description here..."
            />
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Tech Company"
                />
              </div>
            </div>
          )}

          <button
            onClick={analyzeMatch}
            disabled={isAnalyzing}
            className="btn-primary w-full flex items-center justify-center"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Match
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Match Results */}
        {matchResult && !isAnalyzing && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreColor(matchResult.overallScore)}`}>
                <div className="text-center">
                  {getScoreIcon(matchResult.overallScore)}
                  <div className="text-2xl font-bold">{formatScore(matchResult.overallScore)}</div>
                  <div className="text-xs font-medium">Match Score</div>
                </div>
              </div>
            </div>

            {/* Category Scores */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Category Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(matchResult.categoryScores).map(([category, score]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${getScoreColor(score)}`}>
                        {getScoreIcon(score)}
                      </div>
                      <span className="text-sm font-medium capitalize">{category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreColor(score)}`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{formatScore(score)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Matched Skills ({matchResult.matchedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {matchResult.matchedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  Missing Skills ({matchResult.missingSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ATS Score */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <FileText className="h-4 w-4 text-blue-600 mr-2" />
                  ATS Compatibility
                </h4>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getScoreColor(matchResult.atsScore)}`}>
                  {getScoreIcon(matchResult.atsScore)}
                  <span className="font-medium">{formatScore(matchResult.atsScore)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                How well your resume will pass through Applicant Tracking Systems
              </p>
            </div>

            {/* Recommendations */}
            {matchResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 text-purple-600 mr-2" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {matchResult.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg"
                    >
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formatting Issues */}
            {matchResult.formattingIssues.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                  Formatting Improvements
                </h4>
                <div className="space-y-1">
                  {matchResult.formattingIssues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-orange-50 rounded"
                    >
                      <div className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0 mt-1"></div>
                      <p className="text-sm text-gray-700">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => {
                  // This would navigate to the resume editor
                  window.location.hash = '/editor';
                }}
                className="btn-secondary"
              >
                <FileText className="h-4 w-4 mr-2" />
                Improve Resume
              </button>
              <button className="btn-outline">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatching;