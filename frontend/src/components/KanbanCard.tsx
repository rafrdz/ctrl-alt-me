import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { JobApplication } from '../types/jobApplication';
import { useDeleteJobApplication } from '../hooks/useJobApplications';

interface KanbanCardProps {
  application: JobApplication;
  onEdit: (application: JobApplication) => void;
  disabled?: boolean;
  isDragging?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  application,
  onEdit,
  disabled = false,
  isDragging = false,
}) => {
  const deleteMutation = useDeleteJobApplication();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: application.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await deleteMutation.mutateAsync(application.id);
      } catch (error) {
        console.error('Error deleting job application:', error);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(application);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card border-0 shadow-sm ${
        isSortableDragging ? 'shadow-lg' : ''
      }`}
      role="button"
      tabIndex={0}
    >
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="card-title mb-1 fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>
            {application.position}
          </h6>
          <div className="dropdown">
            <button
              className="btn btn-link btn-sm p-0 text-muted"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  className="dropdown-item"
                  onClick={handleEdit}
                  disabled={disabled}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Edit
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <i className="bi bi-trash me-2"></i>
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <p className="card-text text-muted mb-2" style={{ fontSize: '0.85rem' }}>
          <strong>{application.company}</strong>
        </p>

        {application.link && (
          <div className="mb-2">
            <a
              href={application.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-primary"
              style={{ fontSize: '0.8rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <i className="bi bi-external-link me-1"></i>
              View Posting
            </a>
          </div>
        )}

        {application.notes && (
          <p
            className="card-text text-muted small mb-2"
            style={{
              fontSize: '0.75rem',
              maxHeight: '60px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {application.notes}
          </p>
        )}

        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
          <div>Applied: {new Date(application.created_at).toLocaleDateString()}</div>
          {application.updated_at !== application.created_at && (
            <div>Updated: {new Date(application.updated_at).toLocaleDateString()}</div>
          )}
        </div>
      </div>
    </div>
  );
};
