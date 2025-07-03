import React, { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { JobApplicationsList } from './JobApplicationsList';
import { Header } from './Header';

type ViewMode = 'kanban' | 'list';

export const JobApplicationsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleAddNew = () => {
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="container-fluid" style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
      <Header 
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onAddNew={handleAddNew}
        isFormOpen={showCreateForm}
      />

      <div style={{ flex: 1, overflow: 'hidden', paddingLeft: '1rem', paddingRight: '1rem' }}>
        {viewMode === 'kanban' ? (
          <KanbanBoard 
            showCreateForm={showCreateForm}
            onFormClose={handleFormClose}
          />
        ) : (
          <JobApplicationsList 
            showCreateForm={showCreateForm}
            onFormClose={handleFormClose}
          />
        )}
      </div>
    </div>
  );
};
