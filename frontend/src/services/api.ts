import axios from 'axios';
import type { JobApplication, NewJobApplication } from '../types/jobApplication';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const jobApplicationsApi = {
  // Get all job applications
  getAll: async (): Promise<JobApplication[]> => {
    const response = await api.get('/api/v1/job-applications');
    return response.data;
  },

  // Get job application by ID
  getById: async (id: string): Promise<JobApplication> => {
    const response = await api.get(`/api/v1/job-applications/${id}`);
    return response.data;
  },

  // Create new job application
  create: async (application: NewJobApplication): Promise<JobApplication> => {
    const response = await api.post('/api/v1/job-applications', application);
    return response.data;
  },

  // Update job application
  update: async (application: JobApplication): Promise<JobApplication> => {
    const response = await api.put(`/api/v1/job-applications/${application.id}`, application);
    return response.data;
  },

  // Delete job application
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/job-applications/${id}`);
  },
};

export default api;
