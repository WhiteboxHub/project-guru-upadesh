# Guru Upadesh - Web Application

Next.js 14 frontend application for Guru Upadesh interview preparation platform.

## Features

- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui component library
- Zustand for state management
- React Query for server state
- Socket.io for real-time features
- React Hook Form + Zod for forms

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
pnpm dev
```

The application will be available at http://localhost:3001

### Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_APP_NAME=Guru Upadesh
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── auth/        # Authentication components
│   ├── dashboard/   # Dashboard components
│   ├── interview/   # Interview components
│   └── questions/   # Question components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── services/        # API services
├── store/           # Zustand stores
├── styles/          # Global styles
└── types/           # TypeScript types
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript compiler check

## Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **React Query**: Server state management
- **Zustand**: Client state management
- **Socket.io**: WebSocket connections
- **React Hook Form**: Form handling
- **Zod**: Schema validation

## Features

### Authentication
- Login with email/password
- User registration
- Password reset flow
- Protected routes with middleware

### Dashboard
- Overview statistics
- Recent interviews
- Quick actions

### Interviews
- Create mock interviews
- Real-time question answering
- AI-powered suggestions
- Performance feedback
- Detailed results

### Question Bank
- Browse questions by type/difficulty
- Filter by company/industry
- Save favorite questions

### Analytics
- Performance tracking
- Score trends
- Time management statistics

## API Integration

The app integrates with the backend API at `/apps/api`. See the API documentation for endpoint details.

## Development Guidelines

1. Follow the component structure in `/src/components`
2. Use TypeScript strictly - no `any` types
3. Follow the existing patterns for forms, API calls, and state management
4. Write responsive, accessible code (WCAG AA)
5. Keep components under 300 lines
6. Add proper error handling and loading states

## Building for Production

```bash
pnpm build
pnpm start
```

The app will be optimized and ready for deployment.

## Deployment

This app can be deployed to:
- Vercel (recommended for Next.js)
- AWS Amplify
- Netlify
- Any Node.js hosting platform

## License

Copyright © 2026 Guru Upadesh. All rights reserved.
