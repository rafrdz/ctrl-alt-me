# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React TypeScript frontend application built with Vite that interacts with a Go REST API for job application management.

## Project Context
- Backend API runs on port 3000 with endpoints for job applications CRUD operations
- Job applications have fields: company, position, link, status, notes
- Use modern React patterns with hooks and functional components
- Follow TypeScript best practices with proper type definitions
- Use CSS modules or styled-components for styling
- Implement proper error handling and loading states
- Create reusable components for forms and lists

## API Integration
- Base API URL: http://localhost:3000
- Endpoints:
  - GET /api/job-applications - List all applications
  - POST /api/job-applications - Create new application
  - GET /api/job-applications/{id} - Get application by ID
  - PUT /api/job-applications - Update application
  - DELETE /api/job-applications/{id} - Delete application

## Code Style
- Use TypeScript for all components and services
- Implement proper error boundaries
- Use React Query or SWR for data fetching and caching
- Follow React best practices for state management
- Use semantic HTML and accessible components
