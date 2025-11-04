import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ResumeContent } from '../../../shared/types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const ResumePreview: React.FC = () => {
  const { watch } = useFormContext<ResumeContent>();
  const resumeData = watch();

  const personalInfo = resumeData.personalInfo || {};

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="sticky top-4">
        <div className="bg-gray-100 p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Resume Preview</h3>
          <p className="text-sm text-gray-600">Live preview of your resume</p>
        </div>

        <div className="p-6 bg-white max-h-[800px] overflow-y-auto">
          {/* Modern Professional Template */}
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-primary-600 text-white p-8 rounded-t-lg">
              <h1 className="text-3xl font-bold mb-2">
                {personalInfo.firstName || 'John'} {personalInfo.lastName || 'Doe'}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm">
                {personalInfo.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {personalInfo.email}
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {personalInfo.phone}
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {personalInfo.location}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm mt-2">
                {personalInfo.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    {personalInfo.website}
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center">
                    <Linkedin className="h-4 w-4 mr-1" />
                    LinkedIn
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-center">
                    <Github className="h-4 w-4 mr-1" />
                    GitHub
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {resumeData.summary && (
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Professional Summary</h2>
                <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
              </div>
            )}

            {/* Experience */}
            {resumeData.experience && resumeData.experience.length > 0 && (
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Experience</h2>
                <div className="space-y-4">
                  {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{exp.position || 'Position'}</h3>
                          <p className="text-gray-700">{exp.company || 'Company'}</p>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                          {exp.location && <p>{exp.location}</p>}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education && resumeData.education.length > 0 && (
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
                <div className="space-y-4">
                  {resumeData.education.map((edu, index) => (
                    <div key={edu.id} className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {edu.degree || 'Degree'} in {edu.field || 'Field of Study'}
                          </h3>
                          <p className="text-gray-700">{edu.institution || 'Institution'}</p>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <p>{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</p>
                          {edu.gpa && <p>GPA: {edu.gpa}</p>}
                        </div>
                      </div>
                      {edu.description && (
                        <p className="text-gray-700 text-sm leading-relaxed">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {resumeData.skills && resumeData.skills.length > 0 && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
                <div className="grid grid-cols-2 gap-4">
                  {resumeData.skills.map((skill, index) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <span className="text-gray-700">{skill.name || 'Skill'}</span>
                      <span className="text-sm text-gray-500 capitalize">{skill.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!personalInfo.firstName && !personalInfo.lastName) &&
             (!resumeData.summary) &&
             (!resumeData.experience || resumeData.experience.length === 0) &&
             (!resumeData.education || resumeData.education.length === 0) &&
             (!resumeData.skills || resumeData.skills.length === 0) && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your resume will appear here
                </h3>
                <p className="text-gray-600">
                  Start filling in the form to see your resume come to life
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;