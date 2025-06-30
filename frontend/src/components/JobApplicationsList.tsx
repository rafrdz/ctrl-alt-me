import React, { useState } from 'react';
import type { JobApplication } from '../types/jobApplication';
import { useJobApplications, useDeleteJobApplication } from '../hooks/useJobApplications';
import { JobApplicationForm } from './JobApplicationForm';

export const JobApplicationsList: React.FC = () => {
  const { data: applications, isLoading, error } = useJobApplications();
  const deleteMutation = useDeleteJobApplication();
  
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting job application:', error);
      }
    }
  };

  const handleEdit = (application: JobApplication) => {
    setEditingApplication(application);
    setShowCreateForm(false);
  };

  const handleCreateNew = () => {
    setShowCreateForm(true);
    setEditingApplication(null);
  };

  const handleFormSuccess = () => {
    setEditingApplication(null);
    setShowCreateForm(false);
  };

  const handleFormCancel = () => {
    setEditingApplication(null);
    setShowCreateForm(false);
  };

  if (isLoading) {
    return <div className="loading">Loading job applications...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Error loading job applications: {error.message}
      </div>
    );
  }

  return (
    <div className="job-applications-container">
      <div className="header">
        <h1>Job Applications</h1>
        <button 
          onClick={handleCreateNew}
          className="create-button"
          disabled={showCreateForm || !!editingApplication}
        >
          Add New Application
        </button>
      </div>

      {(showCreateForm || editingApplication) && (
        <div className="form-container">
          <JobApplicationForm
            application={editingApplication || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="applications-list">
        {applications && applications.length > 0 ? (
          applications.map((application) => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <h3>{application.position}</h3>
                <span className={`status status-${application.status}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
              
              <div className="application-details">
                <p><strong>Company:</strong> {application.company}</p>
                {application.link && (
                  <p>
                    <strong>Link:</strong>{' '}
                    <a href={application.link} target="_blank" rel="noopener noreferrer">
                      View Job Posting
                    </a>
                  </p>
                )}
                {application.notes && (
                  <p><strong>Notes:</strong> {application.notes}</p>
                )}
                <p className="dates">
                  <small>
                    Created: {new Date(application.created_at).toLocaleDateString()} | 
                    Updated: {new Date(application.updated_at).toLocaleDateString()}
                  </small>
                </p>
              </div>

              <div className="application-actions">
                <button
                  onClick={() => handleEdit(application)}
                  disabled={showCreateForm || !!editingApplication}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(application.id)}
                  className="delete-button"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No job applications found.</p>
            <p>Click "Add New Application" to get started!</p>
          </div>
        )}
      </div>

      {deleteMutation.error && (
        <div className="error-message">
          Error deleting application: {deleteMutation.error.message}
        </div>
      )}
    </div>
  );
};
