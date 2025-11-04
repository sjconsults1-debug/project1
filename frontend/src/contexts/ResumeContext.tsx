import React, { createContext, useContext, useState } from 'react';
import { Resume, ResumeContent } from '../../../shared/types';

interface ResumeContextType {
  currentResume: Resume | null;
  isEditing: boolean;
  currentContent: ResumeContent;
  setCurrentResume: (resume: Resume | null) => void;
  setIsEditing: (editing: boolean) => void;
  updateContent: (content: Partial<ResumeContent>) => void;
  resetContent: () => void;
}

const defaultResumeContent: ResumeContent = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  customSections: [],
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

interface ResumeProviderProps {
  children: React.ReactNode;
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContentState] = useState<ResumeContent>(defaultResumeContent);

  const updateContent = (content: Partial<ResumeContent>) => {
    setCurrentContentState(prev => ({ ...prev, ...content }));
  };

  const resetContent = () => {
    setCurrentContentState(defaultResumeContent);
  };

  const value = {
    currentResume,
    isEditing,
    currentContent,
    setCurrentResume,
    setIsEditing,
    updateContent,
    resetContent,
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
};