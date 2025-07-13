# SafeRoute - Personal Safety Navigation App

A comprehensive personal safety navigation application that helps users find safe routes between locations by analyzing crime data and identifying safe locations.

## Features

- **Safe Route Planning**: Calculate multiple route options with safety scores
- **Crime Data Visualization**: Display crime hotspots on interactive maps
- **Safe Location Discovery**: Find nearby hospitals, police stations, and safe places
- **Real-time Navigation**: Turn-by-turn directions with safety considerations
- **Emergency Features**: Quick access to emergency services
- **Comprehensive Location Database**: Covers all major cities and landmarks across India

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Maps**: Mapbox GL JS
- **Build Tool**: Vite

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or use the included fallback storage)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd saferoute
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and other settings
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment Options

### 1. Docker Deployment

```bash
# Build and run with Docker
docker build -t saferoute .
docker run -p 5000:5000 -e DATABASE_URL="your-db-url" saferoute

# Or use Docker Compose
docker-compose up -d
```

### 2. Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Set environment variables in Vercel dashboard

### 3. Railway Deployment

1. Connect your GitHub repository to Railway
2. Set `DATABASE_URL` environment variable
3. Deploy automatically on push

### 4. Render Deployment

1. Connect your GitHub repository to Render
2. Use the included `render.yaml` configuration
3. Set up PostgreSQL database

### 5. Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Use the included `netlify.toml` configuration
3. Set environment variables in Netlify dashboard

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to "production" for production builds
- `PORT`: Server port (default: 5000)
- `VITE_API_URL`: API base URL for frontend (optional)

## Database Setup

The application supports both PostgreSQL and in-memory storage:

1. **With PostgreSQL**: Set `DATABASE_URL` environment variable
2. **Without Database**: The app will automatically use in-memory storage with sample data

To push schema changes:
```bash
npm run db:push
```

## Build Commands

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run check`: Type checking

## API Endpoints

- `GET /api/crime-hotspots`: Get all crime hotspots
- `GET /api/safe-locations`: Get all safe locations
- `GET /api/locations/search?query=<location>`: Search locations
- `POST /api/routes/calculate`: Calculate safe routes

## Features Overview

### Route Planning
- Enter source and destination locations
- Get multiple route options with safety scores
- View routes on interactive map with safety indicators

### Safety Features
- Crime hotspot visualization with severity levels
- Safe location markers (hospitals, police stations)
- Emergency button for quick access to help
- Safety tips and recommendations

### Location Coverage
- All major Indian cities and towns
- Tourist destinations and landmarks
- Comprehensive search with fuzzy matching
- Real-time coordinate mapping

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on GitHub or contact the development team.