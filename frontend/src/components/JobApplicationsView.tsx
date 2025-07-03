import React, { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { JobApplicationsList } from './JobApplicationsList';
import { Header } from './Header';
import { useJobApplications } from '../hooks/useJobApplications';

type ViewMode = 'kanban' | 'list';

export const JobApplicationsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { refetch } = useJobApplications();

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleAddNew = () => {
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
  };

  const handleImportSuccess = () => {
    // Refetch the data to show newly imported applications
    refetch();
    setShowCreateForm(false); // Close any open forms
  };

  return (
    <div className="container-fluid" style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
      <Header 
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onAddNew={handleAddNew}
        onImportSuccess={handleImportSuccess}
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
