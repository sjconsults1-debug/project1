# AI Resume Builder Pro - Development Guide

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume-builder
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   cd frontend
   npm install

   # Backend dependencies
   cd ../backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration

   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development servers**
   ```bash
   # Start backend (port 3001)
   cd backend
   npm run dev

   # In a new terminal, start frontend (port 5173)
   cd frontend
   npm run dev
   ```

## Project Structure

```
resume-builder/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── contexts/       # React contexts (Auth, Resume)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   ├── __tests__/      # Test files
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── tests/              # Component and integration tests
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic services
│   │   ├── data/           # Seed data and templates
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   └── tests/              # API and integration tests
└── shared/                  # Shared types and utilities
    └── types/              # Shared TypeScript definitions
```

## Technology Stack

### Frontend
- **React 18** + **TypeScript** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Lucide React** - Icon library

### Backend
- **Node.js** + **Express** + **TypeScript** - API framework
- **Prisma** - ORM for database operations
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

## Key Features Implemented

### ✅ Core Features
- **User Authentication** - Complete JWT-based auth system
- **Resume Editor** - Full-featured form-based editor
- **Real-time Preview** - Live preview while editing
- **Professional Templates** - 5 starter templates with different styles
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Auto-save** - Automatic saving every 30 seconds
- **Form Validation** - Client and server-side validation
- **Error Handling** - Comprehensive error boundaries and messages

### 🚧 Advanced Features (To Be Implemented)
- **AI Integration** - OpenAI-powered content generation
- **PDF Export** - High-quality PDF generation
- **Job Matching** - Resume vs job description analysis
- **Template Customization** - Advanced color and font options
- **Analytics Dashboard** - Resume performance metrics
- **Collaboration Features** - Real-time editing
- **Payment Integration** - Stripe for subscriptions

## Development Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run test         # Run tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Resumes
- `GET /api/resumes` - Get user resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/:id` - Get specific resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get specific template

### AI Features (Planned)
- `POST /api/ai/suggest` - Get AI suggestions
- `POST /api/ai/improve` - Improve content
- `POST /api/ai/match` - Job matching analysis

## Testing

### Frontend Tests
```bash
cd frontend
npm run test                # Run all tests
npm run test:ui             # Run tests with UI
npm run test:coverage       # Run tests with coverage report
```

### Test Structure
- Unit tests for components and hooks
- Integration tests for pages
- API mocking with MSW
- Coverage reporting with Vitest

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/resume_builder"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=3001
NODE_ENV="development"
OPENAI_API_KEY="your-openai-api-key"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:3001/api"
VITE_NODE_ENV="development"
VITE_ENABLE_AI_FEATURES="true"
VITE_ENABLE_ANALYTICS="true"
```

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication
- `resumes` - Resume content and metadata
- `templates` - Resume templates and styling
- `ai_suggestions` - AI-powered recommendations
- `exports` - Export history and files
- `subscriptions` - User subscription tiers

## Deployment

### Frontend (Vercel/Netlify)
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Set environment variables

### Backend (Railway/Render)
1. Build the application: `npm run build`
2. Deploy to your hosting platform
3. Set up PostgreSQL database
4. Configure environment variables
5. Run database migrations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Write tests for new features
- Use meaningful variable names
- Add comments for complex logic
- Keep components small and focused

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact support@resumebuilderpro.com or open an issue on GitHub.