import React, { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { JobApplicationsList } from './JobApplicationsList';

type ViewMode = 'kanban' | 'list';

export const JobApplicationsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 pt-3">
        <h1 className="text-dark mb-0">Job Applications</h1>
        <div className="btn-group" role="group" aria-label="View mode">
          <button
            type="button"
            className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('kanban')}
          >
            <i className="bi bi-kanban me-2"></i>
            Kanban
          </button>
          <button
            type="button"
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('list')}
          >
            <i className="bi bi-list-ul me-2"></i>
            List
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? <KanbanBoard /> : <JobApplicationsList />}
    </div>
  );
};
