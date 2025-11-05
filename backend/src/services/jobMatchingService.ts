import { ResumeContent } from '@shared/types';

interface JobDescription {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  experienceLevel?: string;
  salary?: string;
  location?: string;
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

export class JobMatchingService {
  private commonKeywords = {
    technical: [
      'javascript', 'python', 'java', 'react', 'node.js', 'aws', 'docker',
      'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql',
      'git', 'ci/cd', 'agile', 'scrum', 'rest api', 'graphql', 'typescript',
      'html', 'css', 'sass', 'webpack', 'jest', 'testing', 'microservices'
    ],
    soft: [
      'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical',
      'critical thinking', 'creativity', 'innovation', 'collaboration', 'adaptability',
      'time management', 'project management', 'strategic thinking', 'detail-oriented',
      'customer service', 'negotiation', 'presentation', 'mentoring', 'coaching'
    ],
    business: [
      'strategy', 'planning', 'budgeting', 'forecasting', 'analysis', 'reporting',
      'compliance', 'risk management', 'process improvement', 'stakeholder management',
      'vendor management', 'contract negotiation', 'revenue generation', 'cost reduction',
      'efficiency', 'productivity', 'quality assurance', 'continuous improvement'
    ]
  };

  private atsKeywords = [
    'managed', 'developed', 'implemented', 'created', 'led', 'coordinated',
    'designed', 'built', 'launched', 'grew', 'increased', 'decreased', 'optimized',
    'reduced', 'improved', 'achieved', 'delivered', 'completed', 'executed',
    'monitored', 'analyzed', 'maintained', 'supported', 'trained', 'mentored'
  ];

  private extractSkills(text: string): string[] {
    const skills: string[] = [];
    const normalizedText = text.toLowerCase();

    // Extract technical skills
    this.commonKeywords.technical.forEach(skill => {
      if (normalizedText.includes(skill)) {
        skills.push(skill);
      }
    });

    // Extract soft skills
    this.commonKeywords.soft.forEach(skill => {
      if (normalizedText.includes(skill)) {
        skills.push(skill);
      }
    });

    // Extract business skills
    this.commonKeywords.business.forEach(skill => {
      if (normalizedText.includes(skill)) {
        skills.push(skill);
      }
    });

    return [...new Set(skills)]; // Remove duplicates
  }

  private calculateExperienceMatch(resumeExp: any[], jobExp: string[]): number {
    if (!resumeExp || resumeExp.length === 0) return 0;

    const jobExpYears = this.extractYearsOfExperience(jobExp);
    const resumeTotalYears = this.calculateTotalExperience(resumeExp);

    if (resumeTotalYears >= jobExpYears) return 100;
    if (resumeTotalYears === 0) return 0;

    return Math.min(100, (resumeTotalYears / jobExpYears) * 100);
  }

  private extractYearsOfExperience(requirements: string[]): number {
    const experiencePatterns = [
      /(\d+)\+?\s*years?/i,
      /(\d+)\s*-\s*(\d+)\s*years?/i,
      /minimum\s+(\d+)\s*years?/i
    ];

    for (const req of requirements) {
      for (const pattern of experiencePatterns) {
        const match = req.match(pattern);
        if (match) {
          return parseInt(match[1]);
        }
      }
    }

    // Default to 3 years if no specific requirement found
    return 3;
  }

  private calculateTotalExperience(experience: any[]): number {
    let totalYears = 0;

    experience.forEach(exp => {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate);
        const end = exp.current ? new Date() : new Date(exp.endDate);
        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        totalYears += Math.max(0, years);
      }
    });

    return Math.round(totalYears);
  }

  private calculateSkillsMatch(resumeSkills: string[], jobSkills: string[]): {
    matched: string[];
    missing: string[];
    score: number;
  } {
    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());

    const matched = jobSkillsLower.filter(skill =>
      resumeSkillsLower.some(resumeSkill => resumeSkill.includes(skill) || skill.includes(resumeSkill))
    );

    const missing = jobSkillsLower.filter(skill => !matched.includes(skill));

    const score = jobSkills.length > 0 ? (matched.length / jobSkills.length) * 100 : 100;

    return {
      matched: matched.map((skill, index) => jobSkills[index]),
      missing: missing.map((skill, index) => jobSkills[jobSkillsLower.indexOf(skill)]),
      score
    };
  }

  private calculateKeywordMatch(resumeContent: string, jobDescription: string): {
    matched: string[];
    missing: string[];
    score: number;
  } {
    const resumeWords = resumeContent.toLowerCase().split(/\s+/);
    const jobWords = jobDescription.toLowerCase().split(/\s+/);

    const matched = this.atsKeywords.filter(keyword =>
      resumeWords.some(word => word.includes(keyword) || keyword.includes(word))
    );

    const importantJobWords = jobWords.filter(word =>
      word.length > 4 && !this.atsKeywords.includes(word)
    );

    const matchedImportant = importantJobWords.filter(word =>
      resumeWords.some(resumeWord => resumeWord.includes(word) || word.includes(resumeWord))
    );

    const totalMatched = [...matched, ...matchedImportant];
    const score = jobWords.length > 0 ? (totalMatched.length / jobWords.length) * 100 : 100;

    return {
      matched: [...new Set(totalMatched)],
      missing: [],
      score
    };
  }

  private analyzeATSCompliance(resumeContent: ResumeContent): {
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // Check for action verbs in experience descriptions
    const hasActionVerbs = resumeContent.experience?.some(exp => {
      const description = exp.description?.toLowerCase() || '';
      return this.atsKeywords.some(verb => description.includes(verb));
    });

    if (!hasActionVerbs) {
      issues.push('Use more action verbs (managed, developed, implemented, etc.) in experience descriptions');
      score -= 15;
    }

    // Check for quantifiable achievements
    const hasQuantifiable = resumeContent.experience?.some(exp => {
      const text = `${exp.description} ${exp.achievements?.join(' ')}`;
      return /\d+/.test(text);
    });

    if (!hasQuantifiable) {
      issues.push('Include quantifiable achievements (numbers, percentages, metrics)');
      score -= 10;
    }

    // Check section order
    const sections = Object.keys(resumeContent);
    const idealOrder = ['personalInfo', 'summary', 'experience', 'education', 'skills'];

    // This is a simplified check - in reality would be more complex
    if (sections.indexOf('experience') > sections.indexOf('education') &&
        resumeContent.experience?.length > 0 &&
        resumeContent.education?.length === 0) {
      issues.push('Consider placing education after experience unless recently graduated');
      score -= 5;
    }

    return { score: Math.max(0, score), issues };
  }

  private generateRecommendations(matchResult: MatchResult, resume: ResumeContent, job: JobDescription): string[] {
    const recommendations: string[] = [];

    // Skills recommendations
    if (matchResult.categoryScores.skills < 70) {
      recommendations.push(`Highlight these missing skills: ${matchResult.missingSkills.slice(0, 3).join(', ')}`);
    }

    // Experience recommendations
    if (matchResult.categoryScores.experience < 60) {
      recommendations.push('Emphasize relevant experience that matches the job requirements');
    }

    // ATS recommendations
    if (matchResult.atsScore < 80) {
      recommendations.push('Improve ATS compliance by adding more action verbs and quantifiable achievements');
    }

    // Keyword recommendations
    if (matchResult.categoryScores.keywords < 70) {
      recommendations.push('Include more keywords from the job description to improve matching');
    }

    // General recommendations
    if (matchResult.overallScore < 75) {
      recommendations.push('Consider tailoring your resume more specifically to this role');
    }

    if (matchResult.overallScore > 85) {
      recommendations.push('Great match! Consider preparing for behavioral interviews based on your experience');
    }

    return recommendations;
  }

  async matchResume(resumeContent: ResumeContent, jobDescription: JobDescription): Promise<MatchResult> {
    // Extract skills from resume
    const resumeText = [
      resumeContent.summary || '',
      ...(resumeContent.experience?.map(exp => `${exp.position} ${exp.company} ${exp.description}`) || []),
      ...(resumeContent.skills?.map(skill => skill.name) || []),
      ...(resumeContent.education?.map(edu => `${edu.degree} ${edu.field}`) || [])
    ].join(' ');

    const resumeSkills = this.extractSkills(resumeText);
    const jobText = `${jobDescription.description} ${jobDescription.requirements.join(' ')} ${jobDescription.responsibilities.join(' ')}`;
    const jobSkills = [...jobDescription.skills, ...this.extractSkills(jobText)];

    // Calculate category scores
    const skillsMatch = this.calculateSkillsMatch(resumeSkills, jobSkills);
    const experienceMatch = this.calculateExperienceMatch(resumeContent.experience || [], jobDescription.requirements);
    const keywordMatch = this.calculateKeywordMatch(resumeText, jobDescription.description);
    const atsCompliance = this.analyzeATSCompliance(resumeContent);

    // Calculate overall score (weighted average)
    const overallScore = (
      skillsMatch.score * 0.35 +
      experienceMatch * 0.25 +
      keywordMatch.score * 0.25 +
      atsCompliance.score * 0.15
    );

    const result: MatchResult = {
      overallScore: Math.round(overallScore),
      categoryScores: {
        skills: Math.round(skillsMatch.score),
        experience: Math.round(experienceMatch),
        education: 100, // Simplified - would need more complex logic
        keywords: Math.round(keywordMatch.score)
      },
      matchedSkills: skillsMatch.matched,
      missingSkills: skillsMatch.missing,
      keywordMatch: {
        matched: keywordMatch.matched,
        missing: keywordMatch.missing,
        score: Math.round(keywordMatch.score)
      },
      recommendations: [],
      atsScore: atsCompliance.score,
      formattingIssues: atsCompliance.issues
    };

    // Generate recommendations
    result.recommendations = this.generateRecommendations(result, resumeContent, jobDescription);

    return result;
  }

  async suggestImprovements(resumeContent: ResumeContent, jobDescription: JobDescription): Promise<string[]> {
    const matchResult = await this.matchResume(resumeContent, jobDescription);
    const improvements: string[] = [];

    // Skills improvements
    if (matchResult.categoryScores.skills < 80) {
      improvements.push(`Add these skills to your resume: ${matchResult.missingSkills.slice(0, 5).join(', ')}`);
    }

    // Experience improvements
    matchResult.formattingIssues.forEach(issue => {
      improvements.push(issue);
    });

    // Content improvements
    if (matchResult.categoryScores.keywords < 70) {
      improvements.push('Incorporate more keywords from the job description throughout your resume');
    }

    // Structure improvements
    if (matchResult.overallScore < 70) {
      improvements.push('Reorder sections to highlight most relevant experience first');
      improvements.push('Add a stronger professional summary that aligns with the job requirements');
    }

    return improvements;
  }
}

export const jobMatchingService = new JobMatchingService();