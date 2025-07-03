import React, { useState } from 'react';
import type { JobApplication } from '../types/jobApplication';
import { useJobApplications, useDeleteJobApplication } from '../hooks/useJobApplications';
import { JobApplicationForm } from './JobApplicationForm';
import { MarkdownRenderer } from './MarkdownRenderer';

interface JobApplicationsListProps {
  showCreateForm?: boolean;
  onFormClose?: () => void;
}

export const JobApplicationsList: React.FC<JobApplicationsListProps> = ({
  showCreateForm: externalShowCreateForm = false,
  onFormClose,
}) => {
  const { data: applications, isLoading, error } = useJobApplications();
  const deleteMutation = useDeleteJobApplication();
  
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  
  // Use external showCreateForm if provided, otherwise use internal state
  const [internalShowCreateForm, setInternalShowCreateForm] = useState(false);
  const showCreateForm = externalShowCreateForm || internalShowCreateForm;

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
    if (onFormClose) {
      onFormClose();
    } else {
      setInternalShowCreateForm(false);
    }
  };

  const handleFormSuccess = () => {
    setEditingApplication(null);
    if (onFormClose) {
      onFormClose();
    } else {
      setInternalShowCreateForm(false);
    }
  };

  const handleFormCancel = () => {
    setEditingApplication(null);
    if (onFormClose) {
      onFormClose();
    } else {
      setInternalShowCreateForm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading job applications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error loading job applications: {error.message}
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {(showCreateForm || editingApplication) && (
        <div className="card mb-4">
          <div className="card-body">
            <JobApplicationForm
              application={editingApplication || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      <div className="row g-3" style={{ flex: 1, overflow: 'auto', margin: 0 }}>
        {applications && applications.length > 0 ? (
          applications.map((application) => (
            <div key={application.id} className="col-lg-6 col-xl-4" style={{ marginBottom: '1rem' }}>
              <div className="card h-100 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">{application.position}</h5>
                  <span className={`badge ${
                    application.status === 'applied' ? 'bg-primary' :
                    application.status === 'interview' ? 'bg-warning' :
                    application.status === 'offer' ? 'bg-success' :
                    application.status === 'rejected' ? 'bg-danger' :
                    'bg-secondary'
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
                
                <div className="card-body">
                  <p className="card-text"><strong>Company:</strong> {application.company}</p>
                  {application.link && (
                    <p className="card-text">
                      <strong>Link:</strong>{' '}
                      <a href={application.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                        View Job Posting <i className="bi bi-external-link"></i>
                      </a>
                    </p>
                  )}
                  {application.notes && (
                    <div className="card-text">
                      <strong>Notes:</strong>
                      <div className="mt-2">
                        <MarkdownRenderer content={application.notes} />
                      </div>
                    </div>
                  )}
                  <div className="text-muted small">
                    <div>Created: {new Date(application.created_at).toLocaleDateString()}</div>
                    <div>Updated: {new Date(application.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="card-footer bg-transparent">
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleEdit(application)}
                      disabled={showCreateForm || !!editingApplication}
                      className="btn btn-outline-primary btn-sm flex-fill"
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(application.id)}
                      className="btn btn-outline-danger btn-sm flex-fill"
                      disabled={deleteMutation.isPending}
                    >
                      <i className="bi bi-trash me-1"></i>
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="bi bi-briefcase" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
              <h3 className="mt-3 text-muted">No job applications found</h3>
              <p className="text-muted">Click "Add New" to get started!</p>
            </div>
          </div>
        )}
      </div>

      {deleteMutation.error && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error deleting application: {deleteMutation.error.message}
        </div>
      )}
    </div>
  );
};
