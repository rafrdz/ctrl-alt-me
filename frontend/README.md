# Job Applications Frontend

A modern React TypeScript frontend application for managing job applications with a kanban-style board interface, built with Vite and integrated with a Go REST API backend.

## Features

- � **Kanban Board View** - Drag and drop job applications between status columns (Applied, Interview, Rejected, Ghosted)
- �📝 Create, read, update, and delete job applications
- 🏢 Track company, position, job links, status, and notes
- 📊 Visual status indicators with color-coded columns
- 🔄 Real-time data synchronization with backend API
- 📱 Responsive design for desktop and mobile
- 🔀 Toggle between Kanban and List views
- ⚡ Fast development and build times with Vite
- 🔧 TypeScript for type safety
- 🎯 Drag-and-drop functionality with @dnd-kit

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **@dnd-kit** - Drag and drop functionality
- **Bootstrap 5** - UI components and styling
- **Bootstrap Icons** - Icons

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

## Kanban Board Features

### Drag and Drop
- **Drag cards** between columns to update application status
- **Visual feedback** during drag operations with rotation and shadow effects
- **Smooth animations** for card movements and transitions

### Status Columns
- **Applied** - Newly submitted applications (Blue)
- **Interview** - Applications in interview process (Orange) 
- **Rejected** - Applications that were declined (Red)
- **Ghosted** - Applications with no response (Gray)

### View Modes
- **Kanban View** - Visual board with drag-and-drop columns
- **List View** - Traditional card-based list layout
- **Toggle** between views using the header buttons

### Real-time Updates
- Status changes via drag-and-drop automatically sync with the backend
- Card counts update in real-time for each column
- Error handling for failed drag operations

## Usage

1. **Adding Applications**: Click "Add New Application" to create a new job application entry
2. **Kanban View**: 
   - Drag cards between columns to change status
   - View organized columns by application status
   - See application counts in column headers
3. **List View**: Traditional card layout with edit/delete buttons
4. **Editing Applications**: Click the dropdown menu on cards or "Edit" button to modify details
5. **Deleting Applications**: Use the dropdown menu to delete applications (with confirmation)

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
