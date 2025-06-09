
# Parikshan AI - Codebase Documentation

## Project Overview
Parikshan AI is a comprehensive assessment platform built with React, TypeScript, Tailwind CSS, and Supabase. The platform supports advanced question types with individual timers, real-time progress tracking, and role-based authentication.

## Architecture Overview

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **Backend**: Supabase (Authentication, Database, RLS)
- **Routing**: React Router DOM
- **State Management**: React Query + Local State
- **Icons**: Lucide React

### Color Scheme
- Primary: Cyan variants (cyan-50, cyan-600, cyan-700)
- Background: Off-white gradients
- Accent: Green for success states

## Directory Structure

```
src/
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── test/                   # Test-related components
│   │   ├── TestHeader.tsx      # Header with timer and controls
│   │   ├── TestNavigation.tsx  # Previous/Next navigation
│   │   ├── TestProgress.tsx    # Progress bar and overview
│   │   ├── QuestionCard.tsx    # Individual question display
│   │   ├── QuestionInput.tsx   # Question input handlers
│   │   └── QuestionOverview.tsx # Question grid overview
│   └── ProtectedRoute.tsx      # Route protection wrapper
├── hooks/
│   ├── useAuth.tsx            # Authentication context
│   └── use-toast.ts           # Toast notifications
├── pages/
│   ├── Index.tsx              # Landing page
│   ├── Login.tsx              # Authentication page
│   ├── AdminDashboard.tsx     # Admin interface
│   ├── CandidateDashboard.tsx # Candidate interface
│   └── TestSection.tsx        # Main test interface (refactored)
├── integrations/
│   └── supabase/              # Supabase client and types
└── lib/
    └── utils.ts               # Utility functions
```

## Component Mapping

### Authentication Flow
- `useAuth.tsx` - Provides authentication context
- `ProtectedRoute.tsx` - Guards routes based on user role
- `Login.tsx` - Handles signin/signup with role selection

### Dashboard Components
- `CandidateDashboard.tsx` - Main candidate interface
- `AdminDashboard.tsx` - Administrative interface

### Test Components (Main Focus)
- `TestSection.tsx` - Main container and data management
- `TestHeader.tsx` - Timer display and save functionality
- `TestNavigation.tsx` - Previous/Next question controls
- `TestProgress.tsx` - Progress indicators and section info
- `QuestionCard.tsx` - Question display with timer
- `QuestionInput.tsx` - Input rendering based on question type
- `QuestionOverview.tsx` - Grid view of all questions

### Question Types Supported
1. **Forced Choice** - Multiple choice with single selection
2. **Situational Judgment Test (SJT)** - Scenario-based questions
3. **Likert Scale** - 1-5 rating scale
4. **True/False** - Boolean questions
5. **Open Ended** - Text area responses

## Database Schema

### Key Tables
- `profiles` - User accounts and roles
- `companies` - Organization data
- `candidates` - Test takers
- `sections` - Test categories (Psychometric, Language, etc.)
- `question_templates` - Question bank
- `questions` - Generated questions for candidates
- `answers` - Response data
- `test_sessions` - Session tracking

### Question Metadata
Each question includes:
- Question ID, Scale/Dimension, Type
- Industry Context, Relevance Tag
- Difficulty Level, Time Limits
- Scoring Logic, Options

## State Management

### Test Section State
- `questions` - Array of question objects
- `currentQuestion` - Active question index
- `answers` - User responses object
- `questionTimeRemaining` - Individual question timer
- `totalTimeRemaining` - Section timer
- `loading` - Data loading state

### Authentication State
- `user` - Current user object
- `session` - Supabase session
- `userRole` - admin/candidate role
- `loading` - Auth loading state

## Data Flow

1. **Authentication**: User logs in → `useAuth` validates → Role-based redirect
2. **Test Loading**: Section selected → Questions fetched → Timer initialized
3. **Question Flow**: Answer input → Auto-save → Navigation → Timer management
4. **Submission**: Section complete → Data saved → Redirect to dashboard

## Key Features

### Timer System
- Dual timers: Per-question and total section time
- Auto-advance on question timeout
- Auto-submit on section timeout
- Real-time countdown display

### Progress Tracking
- Visual progress bar
- Question overview grid
- Answer completion status
- Real-time save functionality

### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interactions
- Accessible components

## Security Features

### Row Level Security (RLS)
- Candidates see only their data
- Admins see company-scoped data
- Question templates protected
- Session isolation

### Authentication
- Email/password with Supabase Auth
- Role-based access control
- Protected routes
- Session management

## Performance Considerations

- Tree-shaking with ES modules
- Component-level code splitting
- Optimized re-renders
- Efficient state updates
- Lazy loading for large datasets

## Development Guidelines

### Component Creation
- Single responsibility principle
- Props interface definition
- TypeScript strict mode
- Consistent naming convention

### Styling
- Tailwind utility classes
- Design system tokens
- Responsive breakpoints
- Dark mode ready

### Testing Strategy
- Component unit tests
- Integration tests
- E2E user flows
- Database transaction tests

## Deployment

### Environment Variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Build Process
- Vite production build
- Static asset optimization
- Tree-shaking enabled
- Source maps for debugging

## Future Enhancements

### Planned Features
- Real-time collaboration
- Advanced analytics
- AI-powered question generation
- Video/audio question types
- Offline mode support
- Multi-language support

### Scalability Considerations
- Component lazy loading
- Database query optimization
- CDN integration
- Caching strategies
- Load balancing ready
