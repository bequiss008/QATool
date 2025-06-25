# QC Process Tool

## Overview

This is a full-stack Quality Control (QC) Process Tool built with React and Express.js. The application provides a comprehensive interface for quality control assessment across multiple criteria categories including Break Assessment, Vulnerability/Strategy/Tag Accuracy, and Metadata/Operating Structure evaluation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React hooks (useState) for local component state
- **Data Fetching**: TanStack Query for server state management
- **Theme Support**: Custom theme provider with light/dark mode support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling

### Build System
- **Frontend Bundler**: Vite with React plugin
- **Development Server**: Vite dev server with HMR
- **Production Build**: Vite build + esbuild for server

## Key Components

### Frontend Structure
```
client/
├── src/
│   ├── components/
│   │   ├── qc-process-tool.tsx (Main QC interface)
│   │   ├── theme-provider.tsx (Theme management)
│   │   └── ui/ (Reusable UI components)
│   ├── pages/
│   │   ├── home.tsx (Home page)
│   │   └── not-found.tsx (404 page)
│   ├── lib/
│   │   ├── queryClient.ts (API client setup)
│   │   └── utils.ts (Utility functions)
│   └── hooks/
│       ├── use-mobile.tsx (Mobile detection)
│       └── use-toast.ts (Toast notifications)
```

### Backend Structure
```
server/
├── index.ts (Main server file)
├── routes.ts (API route definitions)
├── storage.ts (Data storage interface)
└── vite.ts (Vite development integration)
```

### Shared Resources
```
shared/
└── schema.ts (Database schema and types)
```

## Data Flow

### Current Implementation
- **Storage**: In-memory storage implementation (MemStorage class)
- **Data Models**: User entity with username/password authentication schema
- **State Management**: Component-level state for QC criteria scores and UI state

### QC Assessment Flow
1. User selects assessment criteria categories
2. Component manages expanded/collapsed state for each category
3. Criteria scores are tracked with boolean values and notes
4. Summary view aggregates assessment results

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive primitive components
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **Lucide React**: Icon library

### Development and Build Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the stack
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

### Data and State Management
- **TanStack Query**: Server state management
- **Drizzle ORM**: Type-safe database ORM
- **Zod**: Runtime type validation

## Deployment Strategy

### Environment Configuration
- **Development**: Replit environment with PostgreSQL 16
- **Build Process**: npm run build (Vite + esbuild)
- **Production**: npm run start with autoscale deployment
- **Port Configuration**: Internal port 5000, external port 80

### Database Setup
- **ORM**: Drizzle with PostgreSQL dialect
- **Migrations**: Located in ./migrations directory
- **Schema**: Centralized in shared/schema.ts
- **Connection**: Environment variable DATABASE_URL required

### Replit Integration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Development Command**: npm run dev
- **Hidden Files**: Configuration and build artifacts
- **Workflows**: Automated project startup with port monitoring

## Changelog

Changelog:
- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.