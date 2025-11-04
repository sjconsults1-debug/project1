import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  Sparkles,
  Layout,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Content',
      description: 'Generate professional resume content with advanced AI recommendations tailored to your industry.',
    },
    {
      icon: Layout,
      title: 'Professional Templates',
      description: 'Choose from 15+ ATS-optimized templates designed by career experts.',
    },
    {
      icon: TrendingUp,
      title: 'Job Matching',
      description: 'Optimize your resume for specific job descriptions and improve your matching score.',
    },
    {
      icon: Zap,
      title: 'Real-time Preview',
      description: 'See your changes instantly with our live preview editor.',
    },
    {
      icon: Users,
      title: 'Expert Guidance',
      description: 'Get AI-powered suggestions to highlight your achievements and skills.',
    },
    {
      icon: FileText,
      title: 'Multiple Formats',
      description: 'Export your resume as PDF, Word, or plain text with one click.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      content: 'The AI suggestions helped me craft a resume that landed me my dream job at Google!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      content: 'Professional templates and real-time editing made the process so smooth and efficient.',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      role: 'Marketing Director',
      content: 'The job matching feature gave me insights I never would have considered. Highly recommend!',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-emerald/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-6">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                Build Your Perfect
              </h1>
              <Sparkles className="h-8 w-8 md:h-12 md:w-12 text-accent-emerald animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Resume with AI
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Create professional, ATS-optimized resumes in minutes with our AI-powered platform.
              Stand out from the crowd and land your dream job faster.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/templates"
                    className="btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center"
                  >
                    Browse Templates
                  </Link>
                </>
              )}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • 3 free resumes • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything You Need to Stand Out
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Our platform combines cutting-edge AI with proven resume best practices to help you succeed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card p-8 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Loved by Professionals Worldwide
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Join thousands of professionals who've landed their dream jobs with our help.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Build Your Dream Resume?
          </h2>
          <p className="mt-4 text-xl text-primary-100 max-w-2xl mx-auto">
            Join thousands of professionals who've accelerated their career with our AI-powered platform.
          </p>
          <div className="mt-10">
            {user ? (
              <Link
                to="/editor"
                className="btn bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-3 inline-flex items-center justify-center"
              >
                Create Resume Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-3 inline-flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;