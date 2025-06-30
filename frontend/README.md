# Job Applications Frontend

A modern React TypeScript frontend application for managing job applications, built with Vite and integrated with a Go REST API backend.

## Features

- 📝 Create, read, update, and delete job applications
- 🏢 Track company, position, job links, status, and notes
- 📊 Visual status indicators (Applied, Interviewing, Offer, Rejected, Withdrawn)
- 🔄 Real-time data synchronization with backend API
- 📱 Responsive design for desktop and mobile
- ⚡ Fast development and build times with Vite
- 🔧 TypeScript for type safety

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **CSS Modules** - Styling

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Go backend API running on port 3000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend expects a Go REST API running on `http://localhost:3000` with the following endpoints:

- `GET /job-applications` - Get all job applications
- `POST /job-applications` - Create a new job application
- `GET /job-applications/{id}` - Get job application by ID
- `PUT /job-applications` - Update a job application
- `DELETE /job-applications/{id}` - Delete a job application

## Project Structure

```
src/
├── components/          # React components
│   ├── JobApplicationForm.tsx
│   ├── JobApplicationsList.tsx
│   └── JobApplications.css
├── hooks/              # Custom React hooks
│   └── useJobApplications.ts
├── services/           # API services
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── jobApplication.ts
└── App.tsx             # Main app component
```

## Usage

1. **Adding Applications**: Click "Add New Application" to create a new job application entry
2. **Viewing Applications**: All applications are displayed in a card layout with status indicators
3. **Editing Applications**: Click "Edit" on any application card to modify details
4. **Deleting Applications**: Click "Delete" to remove an application (with confirmation)
5. **Status Tracking**: Applications are color-coded by status for easy visual management

## Development

To extend this application:

1. Add new fields to the `JobApplication` type in `src/types/jobApplication.ts`
2. Update the form component to include new fields
3. Modify the API service to handle new endpoints
4. Add custom hooks for complex data operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
