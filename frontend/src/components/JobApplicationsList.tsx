import React, { useState, useMemo } from 'react';
import type { JobApplication, JobApplicationStatus } from '../types/jobApplication';
import { useJobApplications, useDeleteJobApplication } from '../hooks/useJobApplications';
import { JobApplicationForm } from './JobApplicationForm';
import { MarkdownRenderer } from './MarkdownRenderer';

interface JobApplicationsListProps {
  showCreateForm?: boolean;
  onFormClose?: () => void;
  applications?: JobApplication[];
  statusFilter?: JobApplicationStatus | 'all';
  onStatusFilterChange?: (filter: JobApplicationStatus | 'all') => void;
}

const statusOptions: JobApplicationStatus[] = [
  'applied',
  'interview',
  'offer',
  'accepted',
  'rejected',
  'withdrawn',
  'ghosted',
];

export const JobApplicationsList: React.FC<JobApplicationsListProps> = ({
  showCreateForm: externalShowCreateForm = false,
  onFormClose,
  applications: externalApplications,
  statusFilter: externalStatusFilter,
  onStatusFilterChange,
}) => {
  const { data: hookApplications, isLoading, error } = useJobApplications();
  const deleteMutation = useDeleteJobApplication();
  
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [internalStatusFilter, setInternalStatusFilter] = useState<JobApplicationStatus | 'all'>('all');
  
  // Use external showCreateForm if provided, otherwise use internal state
  const [internalShowCreateForm, setInternalShowCreateForm] = useState(false);
  const showCreateForm = externalShowCreateForm || internalShowCreateForm;

  // Use external applications and filter state if provided, otherwise use internal
  const applications = externalApplications || hookApplications;
  const statusFilter = externalStatusFilter !== undefined ? externalStatusFilter : internalStatusFilter;
  const setStatusFilter = onStatusFilterChange || setInternalStatusFilter;

  // Filter applications based on selected status
  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    if (statusFilter === 'all') return applications;
    return applications.filter(app => app.status === statusFilter);
  }, [applications, statusFilter]);

  const handleDelete = async (id: string) => {
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

      {/* Status Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <label htmlFor="statusFilter" className="form-label mb-0 fw-semibold">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as JobApplicationStatus | 'all')}
            >
              <option value="all">All Statuses ({applications?.length || 0})</option>
              {statusOptions.map(status => {
                const count = applications?.filter(app => app.status === status).length || 0;
                return (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                  </option>
                );
              })}
            </select>
            {statusFilter !== 'all' && (
              <span className="text-muted">
                Showing {filteredApplications.length} of {applications?.length || 0} applications
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="row g-3" style={{ flex: 1, overflow: 'auto', margin: 0 }}>
        {filteredApplications && filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <div key={application.id} className="col-lg-6 col-xl-4" style={{ marginBottom: '1rem' }}>
              <div className="card h-100 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">{application.position}</h5>
                  <span className={`badge ${
                    application.status === 'applied' ? 'bg-primary' :
                    application.status === 'interview' ? 'bg-warning' :
                    application.status === 'offer' ? 'bg-info' :
                    application.status === 'accepted' ? 'bg-success' :
                    application.status === 'rejected' ? 'bg-danger' :
                    application.status === 'withdrawn' ? 'bg-secondary' :
                    application.status === 'ghosted' ? 'bg-dark' :
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
              {statusFilter === 'all' ? (
                <>
                  <h3 className="mt-3 text-muted">No job applications found</h3>
                  <p className="text-muted">Click "Add New" to get started!</p>
                </>
              ) : (
                <>
                  <h3 className="mt-3 text-muted">
                    No applications with status "{statusFilter}"
                  </h3>
                  <p className="text-muted">
                    Try selecting a different status filter or add new applications.
                  </p>
                  <button
                    className="btn btn-outline-primary mt-2"
                    onClick={() => setStatusFilter('all')}
                  >
                    Show All Applications
                  </button>
                </>
              )}
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
