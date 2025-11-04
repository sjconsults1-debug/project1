import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Template, TemplateCategory } from '../../../shared/types';
import { Search, Filter, Star, Eye, ArrowRight } from 'lucide-react';

const TemplatesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [showOnlyFree, setShowOnlyFree] = useState(false);

  const templates: Template[] = [
    {
      id: '1',
      name: 'Professional Executive',
      category: 'professional',
      templateData: {} as any,
      isPremium: false,
      thumbnailUrl: '/templates/professional-executive.jpg',
      usageCount: 1250,
    },
    {
      id: '2',
      name: 'Creative Designer',
      category: 'creative',
      templateData: {} as any,
      isPremium: true,
      thumbnailUrl: '/templates/creative-designer.jpg',
      usageCount: 890,
    },
    {
      id: '3',
      name: 'Software Engineer',
      category: 'technical',
      templateData: {} as any,
      isPremium: false,
      thumbnailUrl: '/templates/software-engineer.jpg',
      usageCount: 2100,
    },
    {
      id: '4',
      name: 'Modern Minimal',
      category: 'creative',
      templateData: {} as any,
      isPremium: false,
      thumbnailUrl: '/templates/modern-minimal.jpg',
      usageCount: 1567,
    },
    {
      id: '5',
      name: 'Sales Professional',
      category: 'professional',
      templateData: {} as any,
      isPremium: true,
      thumbnailUrl: '/templates/sales-professional.jpg',
      usageCount: 743,
    },
  ];

  const categories: { value: TemplateCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Templates' },
    { value: 'professional', label: 'Professional' },
    { value: 'creative', label: 'Creative' },
    { value: 'technical', label: 'Technical' },
    { value: 'executive', label: 'Executive' },
    { value: 'entry-level', label: 'Entry Level' },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesPrice = !showOnlyFree || !template.isPremium;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Professional Resume Templates
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Choose from our collection of ATS-optimized templates designed by career experts
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Search templates..."
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
                className="input pl-10 appearance-none"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="free-only"
                checked={showOnlyFree}
                onChange={(e) => setShowOnlyFree(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="free-only" className="text-sm font-medium text-gray-900">
                Free templates only
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
              {/* Template Preview */}
              <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                    <p>Template Preview</p>
                  </div>
                </div>

                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute top-4 right-4 bg-accent-orange text-white px-3 py-1 rounded-full text-xs font-medium">
                    PRO
                  </div>
                )}

                {/* Usage Count */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {template.usageCount.toLocaleString()} uses
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span className="capitalize">{template.category.replace('-', ' ')}</span>
                  <span>{template.isPremium ? 'Premium' : 'Free'}</span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/editor?template=${template.id}`}
                    className="btn-primary flex-1 text-center"
                  >
                    Use Template
                  </Link>
                  <button className="btn-outline">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setShowOnlyFree(false);
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Create a custom resume with our AI-powered editor and build the perfect resume for your unique career path.
          </p>
          <Link
            to="/editor"
            className="btn bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-3 inline-flex items-center justify-center"
          >
            Create Custom Resume
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;