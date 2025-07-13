# SafeRoute - Personal Safety Navigation App

## Overview

SafeRoute is a comprehensive personal safety navigation application built with React, TypeScript, and Express. The app helps users find safe routes between locations by analyzing crime data, identifying safe locations, and providing real-time navigation with safety-focused features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **Maps**: Mapbox GL JS for interactive map visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Schema Management**: Drizzle Kit for migrations
- **API Style**: RESTful API with JSON responses
- **Storage**: DatabaseStorage class implementing IStorage interface

### Development Environment
- **Language**: TypeScript throughout the stack
- **Package Manager**: npm
- **Development Server**: Vite dev server with Express backend
- **Code Organization**: Monorepo structure with shared schema

## Key Components

### Database Schema (shared/schema.ts)
The application uses three main database tables:
- **Crime Hotspots**: Stores location data for high-crime areas with severity levels
- **Safe Locations**: Catalog of safe places like hospitals, police stations, and schools
- **Routes**: Saved route information with safety scores and coordinates

### Core Features
1. **Route Calculation**: Calculate safe routes between source and destination
2. **Crime Data Visualization**: Display crime hotspots on interactive maps
3. **Safe Location Discovery**: Find nearby safe places (hospitals, police stations)
4. **Real-time Navigation**: Turn-by-turn directions with safety considerations
5. **Emergency Features**: Quick access to emergency services

### UI Components
- **MapContainer**: Interactive map using Mapbox GL JS
- **RouteForm**: Input form for source/destination with safety preferences
- **RouteOptions**: Display calculated route alternatives with safety scores
- **SafetyTips**: Educational content about personal safety

## Data Flow

1. **User Input**: Users enter source and destination locations
2. **Route Calculation**: Backend calculates multiple route options considering:
   - Crime hotspot avoidance
   - Well-lit path preferences
   - Proximity to safe locations
3. **Safety Scoring**: Each route receives a safety score (0-100)
4. **Map Visualization**: Routes displayed on map with safety indicators
5. **Navigation**: Selected route provides turn-by-turn guidance

## External Dependencies

### Database
- **PostgreSQL**: Primary database using Neon serverless platform
- **Drizzle ORM**: Type-safe database operations
- **Database URL**: Environment variable required for connection

### Frontend Libraries
- **Mapbox GL JS**: Interactive mapping (loaded dynamically)
- **Radix UI**: Accessible UI primitives
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Build tool and development server
- **ESBuild**: Production bundling
- **PostCSS**: CSS processing
- **Tailwind CSS**: Utility-first styling

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles Express server to `dist/index.js`
3. **Database Migration**: Drizzle Kit pushes schema changes

### Environment Configuration
- **Development**: Uses Vite dev server with Express backend
- **Production**: Serves built static files through Express
- **Database**: Requires `DATABASE_URL` environment variable

### Scripts
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build
- `npm run start`: Production server
- `npm run db:push`: Apply database schema changes

### File Structure
- `client/`: Frontend React application
- `server/`: Backend Express application
- `shared/`: Common TypeScript definitions and schemas
- `components.json`: shadcn/ui configuration
- `drizzle.config.ts`: Database configuration

## Recent Changes: Latest modifications with dates

### January 13, 2025
- **Fixed Route Plotting Issue**: Resolved map visualization problems where routes weren't displaying correctly
- **Dynamic Location Support**: Implemented location-to-coordinates mapping for major Indian cities (Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata, Pune)
- **Improved Route Calculation**: Routes now use actual input coordinates instead of hardcoded Delhi coordinates
- **Enhanced Map Integration**: Added proper error handling and retry mechanisms for Mapbox route visualization
- **User Interface Improvements**: Added city suggestions and examples in the route planning form
- **Comprehensive Location Database**: Expanded location support to cover all major cities, tourist destinations, landmarks, and towns across India (75+ locations)
- **Enhanced Location Search**: Implemented intelligent search with relevance ranking and fuzzy matching for all of India
- **API Integration**: Connected frontend to use comprehensive location search API instead of hardcoded mappings

### Key Features Added:
- Multi-city route planning across India
- Real-time route visualization with safety-based color coding
- Start/end markers with emoji indicators (🚀/🎯)
- Automatic map viewport adjustment to show full routes
- Database-driven crime hotspot and safe location data
- Comprehensive location database covering every nook and corner of India
- Smart location search with exact and partial matches
- Support for tourist destinations, landmarks, and smaller towns

The application is designed for deployment on platforms like Replit, with proper environment variable management and a clear separation between development and production configurations.