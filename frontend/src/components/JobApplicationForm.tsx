import React, { useState } from 'react';
import type { JobApplication, NewJobApplication, JobApplicationStatus } from '../types/jobApplication';
import { useCreateJobApplication, useUpdateJobApplication } from '../hooks/useJobApplications';
import { useTheme } from '../contexts/ThemeContext';
import { MarkdownEditor } from './MarkdownEditor';

interface JobApplicationFormProps {
  application?: JobApplication;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const statusOptions: JobApplicationStatus[] = [
  'applied',
  'interview',
  'rejected',
  'ghosted',
];

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  application,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!application;
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState<NewJobApplication>({
    company: application?.company || '',
    position: application?.position || '',
    link: application?.link || '',
    status: application?.status || 'applied',
    notes: application?.notes || '',
  });

  const createMutation = useCreateJobApplication();
  const updateMutation = useUpdateJobApplication();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && application) {
        await updateMutation.mutateAsync({
          ...application,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving job application:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const formBgColor = theme === 'dark' ? 'bg-dark' : 'bg-light';
  const textColor = theme === 'dark' ? 'text-light' : 'text-dark';

  return (
    <form onSubmit={handleSubmit} className={`job-application-form ${formBgColor} ${textColor}`}>
      <h2>{isEditing ? 'Edit Job Application' : 'Add New Job Application'}</h2>
      
      <div className="form-group">
        <label htmlFor="company">Company *</label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="position">Position *</label>
        <input
          type="text"
          id="position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="link">Job Link</label>
        <input
          type="url"
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
          placeholder="https://..."
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="status">Status *</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          disabled={isLoading}
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <MarkdownEditor
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
          placeholder="Add notes about this application... (Markdown supported)"
          disabled={isLoading}
          rows={6}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
        )}
      </div>

      {(createMutation.error || updateMutation.error) && (
        <div className="error-message">
          Error: {createMutation.error?.message || updateMutation.error?.message}
        </div>
      )}
    </form>
  );
};
