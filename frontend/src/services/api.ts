import axios from 'axios';
import type { JobApplication, NewJobApplication } from '../types/jobApplication';

const API_BASE_URL = import.meta.env.API_URL || 'http://localhost:3000';

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

  // Import job applications from CSV
  importCSV: async (file: File): Promise<{ imported: number; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    // Use fetch instead of axios for file upload to avoid content-type issues
    const response = await fetch(`${API_BASE_URL}/job-applications/import`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary for FormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return {
      imported: result.imported || result.count || 0,
      message: result.message || 'CSV file uploaded successfully'
    };
  },
};

export default api;
