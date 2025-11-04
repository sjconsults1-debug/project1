import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useResume } from '../contexts/ResumeContext';
import { useAuth } from '../contexts/AuthContext';
import ResumeEditor from '../components/ResumeEditor';
import ResumePreview from '../components/ResumePreview';
import { Save, Download, Eye, EyeOff, Sparkles } from 'lucide-react';
import { ResumeContent } from '../../../shared/types';

const ResumeEditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentContent, updateContent } = useResume();
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<ResumeContent>({
    defaultValues: currentContent,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // TODO: Load resume data if id is provided
    if (id) {
      setIsLoading(true);
      // Load existing resume
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    // Update form when resume content changes
    methods.reset(currentContent);
  }, [currentContent, methods.reset]);

  useEffect(() => {
    // Update resume content when form changes
    const subscription = methods.watch((value) => {
      updateContent(value as ResumeContent);
    });
    return () => subscription.unsubscribe();
  }, [methods.watch, updateContent]);

  const handleSave = async () => {
    // TODO: Implement save functionality
    setLastSaved(new Date());
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {id ? 'Edit Resume' : 'Create New Resume'}
              </h1>
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* AI Assistant */}
              <button className="btn-outline flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
              </button>

              {/* Preview Toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn-outline flex items-center"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Preview
                  </>
                )}
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                className="btn-secondary flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>

              {/* Export */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExport('pdf')}
                  className="btn-primary flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport('docx')}
                  className="btn-outline flex items-center"
                >
                  Download DOCX
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormProvider {...methods}>
          <form>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Editor */}
              <div className={showPreview ? 'lg:col-span-1' : 'lg:col-span-2'}>
                <ResumeEditor />
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="lg:col-span-1">
                  <ResumePreview />
                </div>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default ResumeEditorPage;