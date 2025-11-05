import React from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useResume } from '../contexts/ResumeContext';
import { ResumeContent } from '../../../shared/types';
import { User, Briefcase, GraduationCap, Award, Code, FolderOpen, Plus, Trash2 } from 'lucide-react';
import AIAssistant from './AIAssistant';

const ResumeEditor: React.FC = () => {
  const { currentContent, updateContent } = useResume();
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<ResumeContent>();

  const personalInfo = watch('personalInfo');

  const addExperience = () => {
    const currentExperience = watch('experience') || [];
    const newExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      description: '',
      achievements: [''],
    };
    setValue('experience', [...currentExperience, newExperience]);
  };

  const removeExperience = (index: number) => {
    const currentExperience = watch('experience') || [];
    const updatedExperience = currentExperience.filter((_, i) => i !== index);
    setValue('experience', updatedExperience);
  };

  const addEducation = () => {
    const currentEducation = watch('education') || [];
    const newEducation = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      description: '',
    };
    setValue('education', [...currentEducation, newEducation]);
  };

  const removeEducation = (index: number) => {
    const currentEducation = watch('education') || [];
    const updatedEducation = currentEducation.filter((_, i) => i !== index);
    setValue('education', updatedEducation);
  };

  const addSkill = () => {
    const currentSkills = watch('skills') || [];
    const newSkill = {
      id: Date.now().toString(),
      name: '',
      category: 'Technical',
      level: 'intermediate' as const,
    };
    setValue('skills', [...currentSkills, newSkill]);
  };

  const removeSkill = (index: number) => {
    const currentSkills = watch('skills') || [];
    const updatedSkills = currentSkills.filter((_, i) => i !== index);
    setValue('skills', updatedSkills);
  };

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <section className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary-600" />
            <h2 className="card-title">Personal Information</h2>
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">First Name</label>
              <input
                {...register('personalInfo.firstName', { required: 'First name is required' })}
                className="input"
                placeholder="John"
              />
              {errors.personalInfo?.firstName && (
                <p className="text-sm text-red-600 mt-1">{errors.personalInfo.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                {...register('personalInfo.lastName', { required: 'Last name is required' })}
                className="input"
                placeholder="Doe"
              />
              {errors.personalInfo?.lastName && (
                <p className="text-sm text-red-600 mt-1">{errors.personalInfo.lastName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Email</label>
              <input
                {...register('personalInfo.email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="input"
                placeholder="john.doe@example.com"
              />
              {errors.personalInfo?.email && (
                <p className="text-sm text-red-600 mt-1">{errors.personalInfo.email.message}</p>
              )}
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                {...register('personalInfo.phone')}
                className="input"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                {...register('personalInfo.location', { required: 'Location is required' })}
                className="input"
                placeholder="New York, NY"
              />
              {errors.personalInfo?.location && (
                <p className="text-sm text-red-600 mt-1">{errors.personalInfo.location.message}</p>
              )}
            </div>
            <div>
              <label className="label">Website</label>
              <input
                {...register('personalInfo.website')}
                className="input"
                placeholder="https://johndoe.com"
              />
            </div>
            <div>
              <label className="label">LinkedIn</label>
              <input
                {...register('personalInfo.linkedin')}
                className="input"
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>
            <div>
              <label className="label">GitHub</label>
              <input
                {...register('personalInfo.github')}
                className="input"
                placeholder="https://github.com/johndoe"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Professional Summary */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Professional Summary</h2>
        </div>
        <div className="card-content">
          <textarea
            {...register('summary')}
            rows={4}
            className="input resize-none"
            placeholder="Write a compelling 2-3 sentence summary of your professional experience and key achievements..."
          />
        </div>
      </section>

      {/* Work Experience */}
      <section className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-primary-600" />
              <h2 className="card-title">Work Experience</h2>
            </div>
            <button
              type="button"
              onClick={addExperience}
              className="btn-secondary flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Experience
            </button>
          </div>
        </div>
        <div className="card-content space-y-6">
          {watch('experience')?.map((exp, index) => (
            <div key={exp.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Experience {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Company</label>
                  <input
                    {...register(`experience.${index}.company`)}
                    className="input"
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className="label">Position</label>
                  <input
                    {...register(`experience.${index}.position`)}
                    className="input"
                    placeholder="Job Title"
                  />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input
                    {...register(`experience.${index}.startDate`)}
                    type="month"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    {...register(`experience.${index}.endDate`)}
                    type="month"
                    className="input"
                    disabled={watch(`experience.${index}.current`)}
                  />
                  <div className="mt-2">
                    <label className="flex items-center">
                      <input
                        {...register(`experience.${index}.current`)}
                        type="checkbox"
                        className="mr-2"
                      />
                      Currently working here
                    </label>
                  </div>
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    {...register(`experience.${index}.location`)}
                    className="input"
                    placeholder="City, State"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Description</label>
                <textarea
                  {...register(`experience.${index}.description`)}
                  rows={3}
                  className="input resize-none"
                  placeholder="Describe your role and responsibilities..."
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-primary-600" />
              <h2 className="card-title">Education</h2>
            </div>
            <button
              type="button"
              onClick={addEducation}
              className="btn-secondary flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Education
            </button>
          </div>
        </div>
        <div className="card-content space-y-6">
          {watch('education')?.map((edu, index) => (
            <div key={edu.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Education {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Institution</label>
                  <input
                    {...register(`education.${index}.institution`)}
                    className="input"
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <label className="label">Degree</label>
                  <input
                    {...register(`education.${index}.degree`)}
                    className="input"
                    placeholder="Bachelor's, Master's, etc."
                  />
                </div>
                <div>
                  <label className="label">Field of Study</label>
                  <input
                    {...register(`education.${index}.field`)}
                    className="input"
                    placeholder="Computer Science, Business, etc."
                  />
                </div>
                <div>
                  <label className="label">GPA</label>
                  <input
                    {...register(`education.${index}.gpa`)}
                    className="input"
                    placeholder="3.8"
                  />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input
                    {...register(`education.${index}.startDate`)}
                    type="month"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    {...register(`education.${index}.endDate`)}
                    type="month"
                    className="input"
                    disabled={watch(`education.${index}.current`)}
                  />
                  <div className="mt-2">
                    <label className="flex items-center">
                      <input
                        {...register(`education.${index}.current`)}
                        type="checkbox"
                        className="mr-2"
                      />
                      Currently studying
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary-600" />
              <h2 className="card-title">Skills</h2>
            </div>
            <button
              type="button"
              onClick={addSkill}
              className="btn-secondary flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Skill
            </button>
          </div>
        </div>
        <div className="card-content space-y-4">
          {watch('skills')?.map((skill, index) => (
            <div key={skill.id} className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  {...register(`skills.${index}.name`)}
                  className="input"
                  placeholder="Skill name"
                />
              </div>
              <div className="w-32">
                <select {...register(`skills.${index}.level`)} className="input">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResumeEditor;