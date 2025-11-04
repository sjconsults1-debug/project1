import { Template, TemplateCategory } from '@prisma/client';

export const starterTemplates: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Professional Executive',
    category: TemplateCategory.PROFESSIONAL,
    templateData: {
      layout: {
        headerHeight: 120,
        sectionSpacing: 24,
        columnLayout: 'single'
      },
      colors: {
        primary: '#1e40af',
        secondary: '#6b7280',
        accent: '#10b981',
        text: '#1f2937',
        background: '#ffffff'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        sizes: {
          h1: 28,
          h2: 20,
          h3: 16,
          body: 14,
          small: 12
        }
      },
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Contact Information',
          required: true,
          order: 1,
          styling: {
            backgroundColor: '#1e40af',
            textColor: '#ffffff',
            padding: '24px'
          }
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          required: false,
          order: 2,
          styling: {
            marginTop: '24px'
          }
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Professional Experience',
          required: true,
          order: 3,
          styling: {
            marginTop: '24px'
          }
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          required: true,
          order: 4,
          styling: {
            marginTop: '24px'
          }
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Skills',
          required: true,
          order: 5,
          styling: {
            marginTop: '24px'
          }
        }
      ]
    },
    isPremium: false,
    thumbnailUrl: '/templates/professional-executive.jpg',
    usageCount: 0
  },
  {
    name: 'Creative Designer',
    category: TemplateCategory.CREATIVE,
    templateData: {
      layout: {
        headerHeight: 150,
        sectionSpacing: 32,
        columnLayout: 'mixed'
      },
      colors: {
        primary: '#7c3aed',
        secondary: '#ec4899',
        accent: '#f59e0b',
        text: '#1f2937',
        background: '#ffffff'
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Inter',
        sizes: {
          h1: 32,
          h2: 24,
          h3: 18,
          body: 15,
          small: 13
        }
      },
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Contact Information',
          required: true,
          order: 1,
          styling: {
            backgroundColor: '#7c3aed',
            textColor: '#ffffff',
            padding: '32px',
            borderRadius: '12px'
          }
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'About Me',
          required: false,
          order: 2,
          styling: {
            marginTop: '32px',
            fontStyle: 'italic'
          }
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Skills & Expertise',
          required: true,
          order: 3,
          styling: {
            display: 'grid',
            gridColumns: 2,
            marginTop: '32px'
          }
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Experience',
          required: true,
          order: 4,
          styling: {
            marginTop: '32px'
          }
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          required: true,
          order: 5,
          styling: {
            marginTop: '32px'
          }
        },
        {
          id: 'projects',
          type: 'projects',
          title: 'Portfolio',
          required: false,
          order: 6,
          styling: {
            marginTop: '32px'
          }
        }
      ]
    },
    isPremium: true,
    thumbnailUrl: '/templates/creative-designer.jpg',
    usageCount: 0
  },
  {
    name: 'Software Engineer',
    category: TemplateCategory.TECHNICAL,
    templateData: {
      layout: {
        headerHeight: 100,
        sectionSpacing: 20,
        columnLayout: 'two-column'
      },
      colors: {
        primary: '#0f172a',
        secondary: '#3b82f6',
        accent: '#10b981',
        text: '#1f2937',
        background: '#ffffff'
      },
      fonts: {
        heading: 'JetBrains Mono',
        body: 'Inter',
        sizes: {
          h1: 24,
          h2: 18,
          h3: 14,
          body: 13,
          small: 11
        }
      },
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Contact Information',
          required: true,
          order: 1,
          styling: {
            backgroundColor: '#0f172a',
            textColor: '#ffffff',
            padding: '20px',
            fontFamily: 'JetBrains Mono'
          }
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'Summary',
          required: false,
          order: 2,
          styling: {
            marginTop: '20px',
            borderLeft: '4px solid #3b82f6',
            paddingLeft: '16px'
          }
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Technical Skills',
          required: true,
          order: 3,
          styling: {
            marginTop: '20px',
            display: 'tags'
          }
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Professional Experience',
          required: true,
          order: 4,
          styling: {
            marginTop: '20px'
          }
        },
        {
          id: 'projects',
          type: 'projects',
          title: 'Projects',
          required: false,
          order: 5,
          styling: {
            marginTop: '20px'
          }
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          required: true,
          order: 6,
          styling: {
            marginTop: '20px'
          }
        }
      ]
    },
    isPremium: false,
    thumbnailUrl: '/templates/software-engineer.jpg',
    usageCount: 0
  },
  {
    name: 'Modern Minimal',
    category: TemplateCategory.CREATIVE,
    templateData: {
      layout: {
        headerHeight: 80,
        sectionSpacing: 40,
        columnLayout: 'single'
      },
      colors: {
        primary: '#111827',
        secondary: '#6b7280',
        accent: '#3b82f6',
        text: '#1f2937',
        background: '#ffffff'
      },
      fonts: {
        heading: 'SF Pro Display',
        body: 'SF Pro Text',
        sizes: {
          h1: 26,
          h2: 19,
          h3: 15,
          body: 14,
          small: 12
        }
      },
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Contact Information',
          required: true,
          order: 1,
          styling: {
            borderBottom: '2px solid #111827',
            paddingBottom: '32px',
            marginBottom: '40px'
          }
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'Summary',
          required: false,
          order: 2,
          styling: {
            marginBottom: '40px'
          }
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Experience',
          required: true,
          order: 3,
          styling: {
            marginBottom: '40px'
          }
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          required: true,
          order: 4,
          styling: {
            marginBottom: '40px'
          }
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Skills',
          required: true,
          order: 5,
          styling: {
            marginBottom: '40px'
          }
        }
      ]
    },
    isPremium: false,
    thumbnailUrl: '/templates/modern-minimal.jpg',
    usageCount: 0
  },
  {
    name: 'Sales Professional',
    category: TemplateCategory.PROFESSIONAL,
    templateData: {
      layout: {
        headerHeight: 110,
        sectionSpacing: 28,
        columnLayout: 'single'
      },
      colors: {
        primary: '#059669',
        secondary: '#d97706',
        accent: '#dc2626',
        text: '#1f2937',
        background: '#ffffff'
      },
      fonts: {
        heading: 'Montserrat',
        body: 'Open Sans',
        sizes: {
          h1: 30,
          h2: 22,
          h3: 17,
          body: 15,
          small: 13
        }
      },
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Contact Information',
          required: true,
          order: 1,
          styling: {
            backgroundColor: '#059669',
            textColor: '#ffffff',
            padding: '28px',
            textAlign: 'center'
          }
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          required: false,
          order: 2,
          styling: {
            marginTop: '28px',
            textAlign: 'center',
            fontWeight: 'bold'
          }
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Sales Experience',
          required: true,
          order: 3,
          styling: {
            marginTop: '28px'
          }
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Sales Skills & Expertise',
          required: true,
          order: 4,
          styling: {
            marginTop: '28px',
            display: 'progress-bars'
          }
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          required: true,
          order: 5,
          styling: {
            marginTop: '28px'
          }
        },
        {
          id: 'certifications',
          type: 'certifications',
          title: 'Certifications',
          required: false,
          order: 6,
          styling: {
            marginTop: '28px'
          }
        }
      ]
    },
    isPremium: true,
    thumbnailUrl: '/templates/sales-professional.jpg',
    usageCount: 0
  }
];