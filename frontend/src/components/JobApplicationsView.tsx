import React, { useState, useMemo } from 'react';
import { JobApplicationsList } from './JobApplicationsList';
import { Header } from './Header';
import { useJobApplications } from '../hooks/useJobApplications';
import type { JobApplicationStatus } from '../types/jobApplication';

export const JobApplicationsView: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobApplicationStatus | 'all'>('all');
  const { data: applications } = useJobApplications();

  // Filter applications based on selected status
  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    if (statusFilter === 'all') return applications;
    return applications.filter(app => app.status === statusFilter);
  }, [applications, statusFilter]);

  // Generate filename based on filter
  const exportFilename = useMemo(() => {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filterSuffix = statusFilter === 'all' ? 'all' : statusFilter;
    return `job_applications_${filterSuffix}_${timestamp}.csv`;
  }, [statusFilter]);

  const handleAddNew = () => {
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="container-fluid" style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
      <Header 
        onAddNew={handleAddNew}
        isFormOpen={showCreateForm}
        applications={filteredApplications}
        exportFilename={exportFilename}
      />

      <div style={{ flex: 1, overflow: 'hidden', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <JobApplicationsList 
          showCreateForm={showCreateForm}
          onFormClose={handleFormClose}
          applications={applications}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>
    </div>
  );
};
