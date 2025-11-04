// User related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Resume related types
export interface Resume {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  content: ResumeContent;
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeContent {
  personalInfo: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  customSections?: CustomSection[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  location?: string;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  current: boolean;
  url?: string;
  github?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

// Template related types
export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  templateData: TemplateData;
  isPremium: boolean;
  thumbnailUrl: string;
  usageCount: number;
}

export type TemplateCategory =
  | 'professional'
  | 'creative'
  | 'technical'
  | 'executive'
  | 'entry-level';

export interface TemplateData {
  layout: TemplateLayout;
  colors: TemplateColors;
  fonts: TemplateFonts;
  sections: TemplateSection[];
}

export interface TemplateLayout {
  headerHeight: number;
  sectionSpacing: number;
  columnLayout: 'single' | 'two-column' | 'mixed';
}

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export interface TemplateFonts {
  heading: string;
  body: string;
  sizes: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    small: number;
  };
}

export interface TemplateSection {
  id: string;
  type: string;
  title: string;
  required: boolean;
  order: number;
  styling: Record<string, any>;
}

// AI related types
export interface AISuggestion {
  id: string;
  resumeId: string;
  sectionType: string;
  suggestionText: string;
  confidenceScore: number;
  isAccepted: boolean;
  createdAt: Date;
}

export interface AIRequest {
  type: 'generate' | 'improve' | 'optimize';
  sectionType: string;
  content?: string;
  jobDescription?: string;
  context?: Record<string, any>;
}

export interface AIResponse {
  suggestions: string[];
  confidence: number;
  reasoning?: string;
}

// Export related types
export interface ExportRequest {
  resumeId: string;
  format: ExportFormat;
  options: ExportOptions;
}

export type ExportFormat = 'pdf' | 'docx' | 'txt';

export interface ExportOptions {
  watermark?: boolean;
  includeAnalytics?: boolean;
  customFileName?: string;
}

export interface ExportResult {
  url: string;
  fileName: string;
  size: number;
  format: ExportFormat;
  expiresAt: Date;
}

// Job matching related types
export interface JobPosting {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  location?: string;
  type?: string;
  source: 'linkedin' | 'indeed' | 'custom';
  externalUrl?: string;
  postedAt: Date;
}

export interface JobMatchResult {
  jobPosting: JobPosting;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
}

// Subscription types
export interface Subscription {
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface UsageLimits {
  resumes: number;
  aiSuggestions: number;
  exports: number;
  templates: number;
}