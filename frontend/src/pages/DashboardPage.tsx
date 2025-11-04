import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  Plus,
  TrendingUp,
  Clock,
  Download,
  Eye,
  Star,
  ArrowRight,
  BarChart3
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const recentResumes = [
    {
      id: '1',
      title: 'Software Engineer Resume',
      template: 'Professional',
      lastUpdated: '2 hours ago',
      views: 45,
      downloads: 12,
    },
    {
      id: '2',
      title: 'Product Manager Resume',
      template: 'Creative',
      lastUpdated: '1 day ago',
      views: 23,
      downloads: 5,
    },
    {
      id: '3',
      title: 'Marketing Director Resume',
      template: 'Executive',
      lastUpdated: '3 days ago',
      views: 67,
      downloads: 18,
    },
  ];

  const stats = [
    {
      label: 'Total Resumes',
      value: '3',
      icon: FileText,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      label: 'Total Views',
      value: '135',
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Downloads',
      value: '35',
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'AI Suggestions Used',
      value: '24',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your resumes and track your career progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Resumes */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="card-title">Recent Resumes</h2>
                    <p className="card-description">
                      Your recently created and updated resumes
                    </p>
                  </div>
                  <Link
                    to="/editor"
                    className="btn-primary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Resume
                  </Link>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {recentResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary-100 p-2 rounded-lg">
                          <FileText className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{resume.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Star className="h-4 w-4 mr-1" />
                              {resume.template}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {resume.lastUpdated}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {resume.views}
                          </span>
                          <span className="flex items-center">
                            <Download className="h-4 w-4 mr-1" />
                            {resume.downloads}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/editor/${resume.id}`}
                            className="btn-secondary"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/editor/${resume.id}`}
                            className="btn-outline"
                          >
                            Preview
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quick Actions</h2>
              </div>
              <div className="card-content space-y-3">
                <Link
                  to="/editor"
                  className="btn-primary w-full justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Resume
                </Link>
                <Link
                  to="/templates"
                  className="btn-secondary w-full justify-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Browse Templates
                </Link>
                <button className="btn-outline w-full justify-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </button>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Subscription</h2>
              </div>
              <div className="card-content">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-900">Current Plan</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {user?.subscriptionTier?.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Resumes Created</span>
                    <span>3 / 3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Suggestions</span>
                    <span>24 / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Templates Available</span>
                    <span>5 / 5</span>
                  </div>
                </div>
                {user?.subscriptionTier === 'free' && (
                  <button className="btn-primary w-full mt-4">
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="card bg-gradient-to-br from-primary-50 to-accent-emerald/10">
              <div className="card-header">
                <h2 className="card-title">💡 Pro Tip</h2>
              </div>
              <div className="card-content">
                <p className="text-sm text-gray-700">
                  Use our AI-powered job matching feature to optimize your resume for specific job descriptions and increase your chances of landing interviews.
                </p>
                <Link
                  to="/editor"
                  className="btn-primary w-full mt-4 justify-center text-sm"
                >
                  Try AI Optimization
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;