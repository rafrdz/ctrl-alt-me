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
    <div>
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

      <div className="d-flex justify-content-end mb-3">
        <button 
          onClick={handleCreateNew}
          className="btn btn-primary"
          disabled={showCreateForm || !!editingApplication}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add New Application
        </button>
      </div>

      <div className="row g-3">
        {applications && applications.length > 0 ? (
          applications.map((application) => (
            <div key={application.id} className="col-lg-6 col-xl-4">
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
                    <p className="card-text"><strong>Notes:</strong> {application.notes}</p>
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
              <p className="text-muted">Click "Add New Application" to get started!</p>
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
