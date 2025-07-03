import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { JobApplication, JobApplicationStatus } from '../types/jobApplication';
import { useJobApplications, useUpdateJobApplication } from '../hooks/useJobApplications';
import { JobApplicationForm } from './JobApplicationForm';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import './KanbanBoard.css';

const COLUMNS: { id: JobApplicationStatus; title: string; bgColor: string }[] = [
  { id: 'applied', title: 'Applied', bgColor: 'bg-primary' },
  { id: 'interview', title: 'Interview', bgColor: 'bg-warning' },
  { id: 'rejected', title: 'Rejected', bgColor: 'bg-danger' },
  { id: 'ghosted', title: 'Ghosted', bgColor: 'bg-secondary' },
];

interface KanbanBoardProps {
  showCreateForm?: boolean;
  onFormClose?: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  showCreateForm: externalShowCreateForm = false,
  onFormClose,
}) => {
  const { data: applications, isLoading, error } = useJobApplications();
  const updateMutation = useUpdateJobApplication();
  const [activeApplication, setActiveApplication] = useState<JobApplication | null>(null);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  
  // Use external showCreateForm if provided, otherwise use internal state
  const [internalShowCreateForm, setInternalShowCreateForm] = useState(false);
  const showCreateForm = externalShowCreateForm || internalShowCreateForm;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const groupedApplications = React.useMemo(() => {
    if (!applications) return {} as Record<JobApplicationStatus, JobApplication[]>;
    
    return applications.reduce((acc, app) => {
      const status = app.status as JobApplicationStatus;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(app);
      return acc;
    }, {} as Record<JobApplicationStatus, JobApplication[]>);
  }, [applications]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const application = applications?.find(app => app.id === Number(active.id));
    setActiveApplication(application || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApplication(null);

    if (!over || !applications) return;

    const applicationId = Number(active.id);
    const newStatus = over.id as JobApplicationStatus;
    
    const application = applications.find(app => app.id === applicationId);
    if (!application || application.status === newStatus) return;

    try {
      await updateMutation.mutateAsync({
        ...application,
        status: newStatus,
      });
    } catch (error) {
      console.error('Error updating application status:', error);
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
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
    <div className="kanban-board" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="row g-3" style={{ flex: 1, margin: 0, overflow: 'hidden' }}>
          {COLUMNS.map((column) => {
            const columnApplications = groupedApplications[column.id] || [];
            
            return (
              <div key={column.id} className="col-lg-3 col-md-6" style={{ height: '100%' }}>
                <KanbanColumn
                  id={column.id}
                  title={column.title}
                  bgColor={column.bgColor}
                  count={columnApplications.length}
                >
                  <SortableContext
                    items={columnApplications.map((app: JobApplication) => app.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnApplications.map((application: JobApplication) => (
                      <KanbanCard
                        key={application.id}
                        application={application}
                        onEdit={handleEdit}
                        disabled={showCreateForm || !!editingApplication}
                      />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeApplication && (
            <div style={{ transform: 'rotate(5deg)' }}>
              <KanbanCard
                application={activeApplication}
                onEdit={() => {}}
                disabled={true}
                isDragging={true}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {updateMutation.error && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error updating application: {updateMutation.error.message}
        </div>
      )}

      {applications && applications.length === 0 && (
        <div className="text-center py-5 mt-4">
          <i className="bi bi-briefcase" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
          <h3 className="mt-3 text-muted">No job applications found</h3>
          <p className="text-muted">Click "Add New Application" to get started!</p>
        </div>
      )}
    </div>
  );
};
