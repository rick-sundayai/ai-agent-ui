# AI Agent Workspace UI

A Next.js-based conversational AI workspace with comprehensive authentication and role-based access control.

## Features

### 🔐 Authentication System
- **Complete Auth Flow**: Registration requests, invitations, password reset, and role-based login
- **Role-Based Access**: Admin, Sales Manager, and Recruiter roles with appropriate permissions
- **Security**: Row-level security, audit trails, and secure session management
- **User Management**: Admin interface for user approval, invitations, and role management

### 🎨 Modern UI Design
- **Three-Pane Layout**: Session history, conversation canvas, and scratchpad inspector
- **Dark Theme**: Professional dark interface with mint green accents
- **Responsive Design**: Mobile-friendly with collapsible sidebars
- **Interactive Components**: Dynamic tables, status indicators, and suggestion chips

### 🏗️ Technical Architecture
- **Framework**: Next.js 15.5.0 with App Router and React 19.1.0
- **Styling**: Tailwind CSS v4 with custom color palette
- **Backend**: Supabase (PostgreSQL + Authentication)
- **TypeScript**: Full type safety throughout the application
- **Build System**: Turbopack for fast development and production builds

## Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account (free tier works)

### Setup
1. **Clone and Install**
   ```bash
   cd frontEnd/ai-agent-ui
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Set Up Database**
   - Apply the schema from `database/schema.sql` to your Supabase project
   - Create an initial admin user (see SETUP.md for details)

4. **Start Development**
   ```bash
   npm run dev
   ```

## Authentication Flow

### User Types & Access
- **Admin**: Full system access, user management, system settings
- **Sales Manager**: Team oversight, analytics, performance reports  
- **Recruiter**: Individual candidate management, personal dashboard

### Registration Process
1. **Self-Registration**: Users submit access requests via `/auth/register`
2. **Admin Approval**: Admins review and approve requests
3. **Invitation System**: Approved users receive invitation emails
4. **Account Setup**: Users complete setup via secure invitation links

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin-only pages
│   ├── dashboard/         # Role-specific dashboards
│   └── ...
├── components/            # React components
│   ├── auth/              # Authentication forms
│   ├── features/          # Main app features
│   ├── layout/            # Layout components
│   ├── shared/            # Shared components
│   └── ui/                # UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication services
│   └── supabase/          # Database client
└── types/                 # TypeScript definitions
```

## Development

### Available Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application  
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Key Components
- **AuthProvider**: Global authentication context with role management
- **Navigation**: Role-based navigation with user profile management
- **Middleware**: Route protection and role-based redirects
- **Dashboard Pages**: Tailored interfaces for each user role

## Security Features

- **Row-Level Security**: Database-level access control
- **Role-Based Permissions**: Granular resource and action permissions
- **Audit Logging**: Comprehensive user activity tracking
- **Secure Sessions**: Token-based authentication with refresh
- **Input Validation**: Client and server-side validation
- **CSRF Protection**: Built-in Next.js security features

## Deployment

The application is designed for easy deployment on Vercel, Netlify, or any Node.js hosting platform. Ensure environment variables are properly configured in your deployment environment.

## Documentation

- **[SETUP.md](./SETUP.md)**: Detailed setup instructions
- **[CLAUDE.md](./CLAUDE.md)**: Development guidelines and architecture notes

## Support

For setup help or development questions, refer to the troubleshooting section in SETUP.md or check the browser console for detailed error messages.