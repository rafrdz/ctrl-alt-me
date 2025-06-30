import axios from 'axios';
import type { JobApplication, NewJobApplication } from '../types/jobApplication';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const jobApplicationsApi = {
  // Get all job applications
  getAll: async (): Promise<JobApplication[]> => {
    const response = await api.get('/job-applications');
    return response.data;
  },

  // Get job application by ID
  getById: async (id: number): Promise<JobApplication> => {
    const response = await api.get(`/job-applications/${id}`);
    return response.data;
  },

  // Create new job application
  create: async (application: NewJobApplication): Promise<JobApplication> => {
    const response = await api.post('/job-applications', application);
    return response.data;
  },

  // Update job application
  update: async (application: JobApplication): Promise<JobApplication> => {
    const response = await api.put('/job-applications', application);
    return response.data;
  },

  // Delete job application
  delete: async (id: number): Promise<void> => {
    await api.delete(`/job-applications/${id}`);
  },
};

export default api;
