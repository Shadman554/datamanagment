# Veterinary Dictionary Admin Panel

## Overview

This is a full-stack web application built as an admin panel for managing a veterinary dictionary mobile app. The system provides a comprehensive interface for managing veterinary content including books, medical terms, diseases, drugs, tutorial videos, staff information, and user interactions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter (lightweight React router)
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: Railway API (Python backend)
- **File Storage**: Railway API for images and PDFs
- **Authentication**: JWT-based admin authentication

## Key Components

### Database Layer
- **API**: Railway API (Python FastAPI backend)
- **Schema Location**: `shared/schema.ts` - contains all type definitions and validation schemas
- **External API**: https://python-database-production.up.railway.app/docs
- **Provider**: Railway hosted Python API

### Data Collections
The system manages 11 distinct data collections:
- **Books**: Veterinary textbooks and publications with PDF storage
- **Words**: Dictionary terms in English, Kurdish, and Arabic
- **Diseases**: Animal diseases with symptoms, causes, and treatments
- **Drugs**: Veterinary medications with usage and side effects
- **Tutorial Videos**: Educational YouTube videos
- **Staff**: Team member profiles with social media links
- **Questions**: User-submitted questions with likes system
- **Notifications**: Push notifications for mobile app
- **Users**: User profiles with point system
- **Normal Ranges**: Laboratory reference values for different species
- **App Links**: Download links for mobile applications

### File Management
- **Storage**: Railway API for images and PDFs
- **Upload System**: Drag-and-drop file upload with progress tracking
- **File Types**: Supports images (covers, photos) and PDFs (books, documents)
- **Preview**: Image preview functionality for uploaded files

## Data Flow

1. **Client Requests**: Frontend makes API calls through React Query
2. **Authentication**: Admin authentication middleware validates JWT tokens
3. **Authorization**: Role-based access control (super admin vs admin)
4. **API Layer**: Express.js routes handle CRUD operations
5. **Activity Logging**: All admin actions are logged to PostgreSQL database
6. **Data Validation**: Zod schemas validate incoming data
7. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
8. **File Operations**: Firebase Storage handles file uploads/downloads
9. **Response**: JSON responses sent back to client
10. **State Updates**: React Query updates client-side cache

## Admin Authentication System

### Overview
A comprehensive admin authentication and activity tracking system has been implemented with PostgreSQL database backend and JWT-based session management.

### Features
- **Role-Based Access Control**: Super Admin and Admin roles with different permissions
- **Secure Authentication**: JWT tokens with HTTP-only cookies, bcrypt password hashing
- **Activity Tracking**: Complete audit trail of all admin actions (create, update, delete)
- **Admin Statistics**: Real-time statistics showing admin activity metrics
- **Session Management**: Secure session handling with automatic cleanup

### Database Tables
- **admin_users**: Admin account information with roles and authentication data
- **admin_sessions**: JWT session tracking with expiration and device information
- **activity_logs**: Complete audit trail of admin actions with metadata

### Access Routes
- **Admin Panel**: Access via `/admin` route
- **Super Admin Dashboard**: Full statistics and activity monitoring
- **Admin Dashboard**: Limited access for regular admins
- **Login System**: Secure authentication flow with proper error handling

### Super Admin Credentials
- **Username**: `superadmin`
- **Password**: `SuperAdmin123!`
- **Email**: `admin@vet-dict.com`
- **Role**: `super_admin`

### Activity Tracking
All admin actions are automatically logged including:
- **Action Type**: Create, Update, Delete operations
- **Collection**: Which data collection was modified
- **Document Details**: ID and title of affected items
- **Admin Information**: Who performed the action
- **Metadata**: Timestamp, IP address, user agent
- **Data Changes**: Before/after snapshots for updates and deletions

### Statistics Dashboard
Super admins can view:
- **Total Operations**: System-wide create/update/delete counts
- **Admin Performance**: Individual admin activity breakdown
- **Recent Activity**: Real-time activity feed with filtering
- **Admin Management**: User account overview and management

## External Dependencies

### Core Dependencies
- **Railway API**: External Python API for data operations
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework with dark mode support
- **lucide-react**: Icon library
- **react-dropzone**: File upload functionality

### Dark Mode Support
- **Theme System**: Comprehensive light/dark/system theme switching
- **Local Storage**: Theme preference persistence across sessions
- **System Detection**: Automatic theme based on user's OS preference
- **Theme Toggle**: Available in all headers and mobile sidebar
- **Full Coverage**: All components support dark mode with proper contrast

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **esbuild**: Server-side bundling

## Deployment Strategy

### Development Mode
```bash
npm run dev  # Starts development server with hot reload
```

### Production Build
```bash
npm run build  # Builds client and server for production
npm start     # Starts production server
```

### Database Management
```bash
npm run db:push  # Push schema changes to database
```

The application is designed to be deployed on platforms that support Node.js with PostgreSQL database connectivity. The build process creates optimized bundles for both client and server code.

## Current Issues & Status

### Railway API Integration - COMPLETE ✓
**Status:** Railway API fully operational with all CRUD operations working
**Resolution:** Complete integration with Python FastAPI backend, all operations working
**Impact:** All data operations (Create, Read, Update, Delete) now working with Railway API backend

### Admin Panel Status - FULLY OPERATIONAL ✓
**Status:** All features working correctly
- ✅ Authentication with Railway API
- ✅ Create new data entries
- ✅ Edit and update existing data  
- ✅ Delete data entries
- ✅ View all collections
- ✅ Search and filter functionality

## Recent Changes

```
Recent Changes:
- July 19, 2025: COMPLETE: All CRUD operations now working perfectly with Railway API - create, read, update, delete all functional
- July 19, 2025: FIXED: Resolved create operation issue - new data entries now save and display correctly with proper API synchronization
- July 19, 2025: ENHANCED: Added 1-second delay for Railway API sync to ensure new data appears in lists immediately after creation
- July 19, 2025: AUTHENTICATION: Railway API authentication fully integrated and working with admin login system
- July 19, 2025: API: Name-based endpoint support implemented for diseases, drugs, books, staff and other collections
- July 19, 2025: MIGRATION: Successfully completed migration from Replit Agent to Replit environment with Railway API authentication
- July 19, 2025: INTEGRATION: Full Railway API integration with proper JWT token handling and session management
- July 19, 2025: SECURITY: Enhanced admin authentication with Railway API credentials validation
- July 18, 2025: AUTHENTICATION: Updated authentication system to use PostgreSQL users table instead of admin_users table
- July 18, 2025: DATABASE: Modified users table structure to support admin authentication with password, role, and is_active fields
- July 18, 2025: MIGRATION: Successfully completed migration from Replit Agent to Replit environment
- July 18, 2025: DATABASE: Created and configured PostgreSQL database with proper schema setup
- July 18, 2025: AUTHENTICATION: Fixed admin authentication system with super admin user creation
- July 18, 2025: POSTGRESQL: Successfully configured PostgreSQL database connection and storage layer
- July 18, 2025: MIGRATION: Completed migration from Replit Agent to standard Replit environment with PostgreSQL backend
- July 18, 2025: DATABASE: Set up PostgreSQL schema and storage implementation for all veterinary data
- July 18, 2025: STORAGE: Switched from Railway API to direct PostgreSQL database for better control and performance
- July 05, 2025: STORAGE: Removed local/fallback storage system - application now uses Firebase exclusively
- July 05, 2025: FIREBASE: Enhanced Firebase connection handling to gracefully manage missing credentials
- July 05, 2025: MIGRATION: Successfully migrated from Replit Agent to standard Replit environment
- July 05, 2025: DATABASE: Migrated from PostgreSQL to MySQL for Railway deployment compatibility
- July 05, 2025: CLEANUP: Removed unused Railway setup files and PostgreSQL dependencies
- July 05, 2025: SCHEMA: Updated Drizzle schema to use MySQL tables instead of PostgreSQL
- July 05, 2025: SETUP: Created railway-setup.js for MySQL database initialization
- July 05, 2025: RAILWAY: Fixed PostgreSQL SSL certificate chain issues with enhanced SSL configuration
- July 05, 2025: RAILWAY: Updated database setup endpoint with direct PostgreSQL connection bypassing SSL verification
- July 05, 2025: RAILWAY: Added checkServerIdentity bypass to resolve self-signed certificate errors
- July 05, 2025: RAILWAY: Successfully resolved all deployment issues - server now runs without path errors
- July 05, 2025: RAILWAY: Added browser-based database setup endpoint (/setup-database) for easy initialization
- July 05, 2025: RAILWAY: Fixed static file serving and API routing issues
- July 05, 2025: MIGRATION: Successfully completed migration from Replit Agent to Replit environment
- July 05, 2025: RAILWAY: Fixed path resolution errors by removing vite.ts dependencies in production
- July 05, 2025: FIREBASE: Successfully configured Firebase credentials - data now saves to Firebase database instead of locally
- July 05, 2025: DARK MODE: Enhanced dark mode implementation across all components with semantic color variables
- July 05, 2025: MOBILE: Improved mobile responsiveness with better touch interactions and responsive layouts
- July 05, 2025: THEMING: Added system theme detection with automatic preference switching
- July 05, 2025: UI/UX: Replaced hardcoded gray colors with semantic design tokens for better dark mode support
- July 05, 2025: ACCESSIBILITY: Enhanced focus states and touch targets for mobile devices
- July 05, 2025: COMPONENTS: Updated sidebar and navigation components with improved dark mode styling
- July 05, 2025: CSS: Added comprehensive CSS variables for consistent theming across light and dark modes
- July 05, 2025: RESPONSIVE: Fixed layout issues on mobile devices with proper overflow handling
- July 05, 2025: DATABASE: Confirmed PostgreSQL database connectivity and admin authentication working
- July 05, 2025: SECURITY: All admin features operational with proper database backing
- July 04, 2025: SECURITY: Protected entire application with admin authentication
- July 04, 2025: Added admin info and logout functionality to main header
- July 04, 2025: Fixed accessibility warnings for dialog components
- July 04, 2025: Enhanced super admin system with comprehensive admin management
- July 04, 2025: Added admin CRUD operations (create, update, delete, toggle status)
- July 04, 2025: Implemented activity tracking for all data operations
- July 04, 2025: Created admin dashboard with stats, activity logs, and management
- July 04, 2025: Application migration completed successfully with full security
```

## Railway API Integration Complete

The application now uses the Railway API for all data operations:
1. ✅ Complete Firebase removal and cleanup
2. ✅ Railway API integration for all collections
3. ✅ Automatic mapping of collection names to API endpoints
4. ✅ Error handling and fallback mechanisms for API failures

## Changelog

```
Changelog:
- July 04, 2025. Initial setup with comprehensive veterinary database management system
- July 04, 2025. Implemented Firebase integration with fallback storage for reliability
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```