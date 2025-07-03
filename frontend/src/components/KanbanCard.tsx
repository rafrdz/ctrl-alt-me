import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { JobApplication } from '../types/jobApplication';
import { useDeleteJobApplication } from '../hooks/useJobApplications';
import { useTheme } from '../contexts/ThemeContext';
import { MarkdownRenderer } from './MarkdownRenderer';

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
  const { theme } = useTheme();
  
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

  const cardBgColor = theme === 'dark' ? '#374151' : 'white';
  const textColor = theme === 'dark' ? 'text-light' : 'text-dark';
  const mutedTextColor = theme === 'dark' ? 'text-light opacity-75' : 'text-muted';

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

  const cardStyle = {
    ...style,
    backgroundColor: cardBgColor,
    borderColor: theme === 'dark' ? '#4b5563' : '#dee2e6',
  };

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      {...attributes}
      {...listeners}
      className={`card border-0 shadow-sm ${textColor} ${
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

        <p className={`card-text mb-2 ${mutedTextColor}`} style={{ fontSize: '0.85rem' }}>
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
          <div
            className={`card-text small mb-2 ${mutedTextColor}`}
            style={{
              fontSize: '0.75rem',
              maxHeight: '80px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <MarkdownRenderer 
                content={application.notes}
                compact={true}
                style={{ 
                  fontSize: '0.75rem',
                  lineHeight: '1.2'
                }}
              />
            </div>
          </div>
        )}

        <div className={mutedTextColor} style={{ fontSize: '0.7rem' }}>
          <div>Applied: {new Date(application.created_at).toLocaleDateString()}</div>
          {application.updated_at !== application.created_at && (
            <div>Updated: {new Date(application.updated_at).toLocaleDateString()}</div>
          )}
        </div>
      </div>
    </div>
  );
};
