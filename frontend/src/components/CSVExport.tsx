import React from 'react';
import type { JobApplication } from '../types/jobApplication';

interface CSVExportProps {
  applications: JobApplication[];
  disabled?: boolean;
  filename?: string;
}

export const CSVExport: React.FC<CSVExportProps> = ({
  applications,
  disabled = false,
  filename = 'job_applications_export.csv',
}) => {
  const convertToCSV = (data: JobApplication[]): string => {
    if (!data || data.length === 0) {
      return 'id,company,position,link,status,notes,created_at,updated_at\n';
    }

    // CSV headers
    const headers = ['id', 'company', 'position', 'link', 'status', 'notes', 'created_at', 'updated_at'];
    
    // Convert data to CSV rows
    const csvRows = data.map(app => {
      return [
        app.id,
        `"${app.company.replace(/"/g, '""')}"`, // Escape quotes in company name
        `"${app.position.replace(/"/g, '""')}"`, // Escape quotes in position
        app.link || '',
        app.status,
        `"${(app.notes || '').replace(/"/g, '""').replace(/\n/g, '\\n')}"`, // Escape quotes and newlines in notes
        app.created_at,
        app.updated_at,
      ].join(',');
    });

    return [headers.join(','), ...csvRows].join('\n');
  };

  const downloadCSV = () => {
    if (!applications || applications.length === 0) {
      alert('No job applications to export.');
      return;
    }

    try {
      const csvContent = convertToCSV(applications);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success message
        console.log(`Successfully exported ${applications.length} job applications to ${filename}`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  return (
    <button
      type="button"
      className="btn btn-outline-primary btn-sm"
      onClick={downloadCSV}
      disabled={disabled || !applications || applications.length === 0}
      title={
        !applications || applications.length === 0
          ? 'No applications to export'
          : `Export ${applications.length} job applications to CSV`
      }
    >
      <i className="bi bi-download me-1"></i>
      <span className="d-none d-sm-inline">
        Export CSV {applications && applications.length > 0 ? `(${applications.length})` : ''}
      </span>
    </button>
  );
};