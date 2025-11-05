import OpenAI from 'openai';
import { AIRequest, AIResponse } from '@shared/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  private generateSystemPrompt(sectionType: string, context?: any): string {
    const basePrompts = {
      summary: `You are an expert resume writer. Generate a compelling professional summary that highlights the candidate's key achievements and career goals. Keep it concise (2-3 sentences) and impactful. Focus on quantifiable results and unique value proposition.`,

      experience: `You are an expert resume writer specializing in work experience descriptions. Transform basic job responsibilities into impressive achievement-focused bullet points. Use the STAR method (Situation, Task, Action, Result) and include quantifiable metrics whenever possible. Start each bullet with strong action verbs.`,

      skills: `You are an expert career coach and technical recruiter. Analyze the candidate's background and suggest relevant skills that would make their resume more competitive for their target roles. Consider both technical and soft skills, and categorize them appropriately.`,

      education: `You are an expert resume writer. Help craft compelling education descriptions that highlight relevant coursework, achievements, and academic accomplishments. Focus on elements that demonstrate the candidate's qualifications for their target career.`,

      projects: `You are an expert technical resume writer. Transform project descriptions into impressive showcases of technical skills and impact. Highlight technologies used, challenges overcome, and measurable outcomes. Emphasize innovation and problem-solving abilities.`,

      improvement: `You are an expert resume reviewer and career coach. Analyze the provided resume content and provide specific, actionable suggestions for improvement. Focus on clarity, impact, formatting, and alignment with modern resume best practices.`,

      keywords: `You are an expert in Applicant Tracking Systems (ATS) and recruitment. Analyze the resume content and job description to identify important keywords that should be included to improve ATS matching and recruiter visibility.`
    };

    return basePrompts[sectionType as keyof typeof basePrompts] || basePrompts.summary;
  }

  private generateUserPrompt(request: AIRequest): string {
    const { type, sectionType, content, jobDescription, context } = request;

    switch (type) {
      case 'generate':
        return this.generateContentPrompt(sectionType, context);

      case 'improve':
        return this.improveContentPrompt(sectionType, content, context);

      case 'optimize':
        return this.optimizeContentPrompt(sectionType, content, jobDescription, context);

      default:
        return 'Please provide assistance with resume content.';
    }
  }

  private generateContentPrompt(sectionType: string, context?: any): string {
    const prompts = {
      summary: `Generate a professional summary for a ${context?.level || 'mid-level'} ${context?.role || 'professional'} with experience in ${context?.industry || 'various industries'}. Focus on their key strengths and career objectives.`,

      experience: `Generate 3-4 impressive bullet points for a ${context?.position || 'position'} at ${context?.company || 'company'}. The role involves ${context?.responsibilities || 'various responsibilities'}. Include quantifiable achievements.`,

      skills: `Based on a ${context?.role || 'professional'} background in ${context?.industry || 'technology'}, suggest 10-15 relevant skills that would make their resume competitive. Include both technical and soft skills.`,

      education: `Help describe educational achievements for a ${context?.degree || 'degree'} in ${context?.field || 'field of study'} from ${context?.institution || 'university'}. Highlight relevant coursework and accomplishments.`
    };

    return prompts[sectionType as keyof typeof prompts] || 'Please generate relevant content.';
  }

  private improveContentPrompt(sectionType: string, content?: string, context?: any): string {
    return `Please improve the following ${sectionType} content:\n\n${content || 'No content provided'}\n\nContext: This is for a ${context?.role || 'professional'} role in ${context?.industry || 'their industry'}. Provide 3-4 improved versions with explanations for why each version is better.`;
  }

  private optimizeContentPrompt(sectionType: string, content?: string, jobDescription?: string, context?: any): string {
    return `Please optimize the following ${sectionType} content for a specific job application:\n\nCurrent Content:\n${content || 'No content provided'}\n\nJob Description:\n${jobDescription || 'No job description provided'}\n\nProvide optimized content that better aligns with the job requirements and includes relevant keywords.`;
  }

  async generateContent(request: AIRequest): Promise<AIResponse> {
    try {
      const systemPrompt = this.generateSystemPrompt(request.sectionType, request.context);
      const userPrompt = this.generateUserPrompt(request);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';

      return {
        suggestions: [response],
        confidence: 0.85,
        reasoning: 'Generated using GPT-4 with expert resume writing prompts'
      };
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error('Failed to generate AI content');
    }
  }

  async improveContent(request: AIRequest): Promise<AIResponse> {
    try {
      const systemPrompt = this.generateSystemPrompt('improvement', request.context);
      const userPrompt = this.generateUserPrompt(request);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.6,
      });

      const response = completion.choices[0]?.message?.content || '';

      // Parse response into multiple suggestions
      const suggestions = this.parseSuggestions(response);

      return {
        suggestions,
        confidence: 0.80,
        reasoning: 'Content improvements generated using GPT-4 with resume best practices'
      };
    } catch (error) {
      console.error('AI improvement error:', error);
      throw new Error('Failed to improve content');
    }
  }

  async optimizeForJob(request: AIRequest): Promise<AIResponse> {
    try {
      const systemPrompt = this.generateSystemPrompt('keywords', request.context);
      const userPrompt = this.generateUserPrompt(request);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.5,
      });

      const response = completion.choices[0]?.message?.content || '';

      return {
        suggestions: [response],
        confidence: 0.75,
        reasoning: 'Job optimization generated using GPT-4 with ATS and keyword analysis'
      };
    } catch (error) {
      console.error('AI optimization error:', error);
      throw new Error('Failed to optimize content for job');
    }
  }

  private parseSuggestions(response: string): string[] {
    // Try to parse numbered or bulleted suggestions
    const lines = response.split('\n').filter(line => line.trim());
    const suggestions: string[] = [];

    let currentSuggestion = '';

    for (const line of lines) {
      // Check if line starts a new suggestion (numbered or bullet)
      if (/^\d+\./.test(line.trim()) || /^[-*]/.test(line.trim())) {
        if (currentSuggestion.trim()) {
          suggestions.push(currentSuggestion.trim());
        }
        currentSuggestion = line.replace(/^\d+\.\s*|^[-*]\s*/, '').trim();
      } else {
        currentSuggestion += ' ' + line.trim();
      }
    }

    if (currentSuggestion.trim()) {
      suggestions.push(currentSuggestion.trim());
    }

    // If no structured suggestions found, return the whole response as one suggestion
    if (suggestions.length === 0) {
      suggestions.push(response);
    }

    return suggestions;
  }

  async generateResumeTitle(personalInfo: any, experience: any[]): Promise<string> {
    try {
      const prompt = `Generate a professional resume title based on this information:

      Personal Info:
      - Name: ${personalInfo.firstName} ${personalInfo.lastName}
      - Target Role: ${personalInfo.targetRole || 'Not specified'}

      Experience: ${experience.slice(0, 2).map(exp =>
        `${exp.position} at ${exp.company}`
      ).join(', ')}

      Generate a concise, professional resume title (max 60 characters) that highlights their main expertise and career level.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert resume writer. Generate professional, concise resume titles." },
          { role: "user", content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content?.trim() || 'Professional Resume';
    } catch (error) {
      console.error('Title generation error:', error);
      return 'Professional Resume';
    }
  }
}

export const aiService = new AIService();