import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { jobApplicationsApi } from '../services/api';

interface CSVImportProps {
  onImportSuccess?: () => void;
  disabled?: boolean;
}

export const CSVImport: React.FC<CSVImportProps> = ({
  onImportSuccess,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleFileSelect = () => {
    setIsDropdownOpen(false);
    fileInputRef.current?.click();
  };

  const downloadTemplate = () => {
    setIsDropdownOpen(false);
    const csvContent = `company,position,link,status,notes
"Example Corp","Software Engineer","https://example.com/job","applied","Initial application submitted"
"Tech Startup","Full Stack Developer","","interview","Phone screening scheduled"
"Big Tech Co","Senior Developer","https://careers.bigtech.com/123","rejected","Not a good fit for the role"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'job_applications_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Please select a CSV file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const result = await jobApplicationsApi.importCSV(file);
      setUploadSuccess(`Successfully imported ${result.imported} job applications from ${file.name}`);
      
      if (onImportSuccess) {
        onImportSuccess();
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to import CSV file');
    } finally {
      setIsUploading(false);
    }
  };

  const clearMessages = () => {
    setUploadError(null);
    setUploadSuccess(null);
  };

  return (
    <div className="csv-import">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || isUploading}
      />

      {/* Import button with dropdown */}
      <div className="dropdown position-relative" ref={dropdownRef}>
        <button
          type="button"
          className="btn btn-outline-info btn-sm dropdown-toggle"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          disabled={disabled || isUploading}
          title="Import job applications from CSV"
        >
          {isUploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              <span className="d-none d-sm-inline">Importing...</span>
            </>
          ) : (
            <>
              <i className="bi bi-upload me-1"></i>
              <span className="d-none d-sm-inline">CSV</span>
            </>
          )}
        </button>
        {isDropdownOpen && (
          <ul className="dropdown-menu show position-absolute" style={{ top: '100%', left: '0', zIndex: 1050 }}>
            <li>
              <button
                className="dropdown-item"
                onClick={handleFileSelect}
                disabled={disabled || isUploading}
              >
                <i className="bi bi-upload me-2"></i>
                Import CSV
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={downloadTemplate}
                disabled={disabled || isUploading}
              >
                <i className="bi bi-download me-2"></i>
                Download Template
              </button>
            </li>
          </ul>
        )}
      </div>

      {/* Toast notifications */}
      {(uploadError || uploadSuccess) && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div
            className={`toast show ${
              theme === 'dark' ? 'bg-dark text-light' : 'bg-light'
            }`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-header">
              <i className={`bi ${uploadError ? 'bi-exclamation-triangle text-danger' : 'bi-check-circle text-success'} me-2`}></i>
              <strong className="me-auto">CSV Import</strong>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={clearMessages}
              ></button>
            </div>
            <div className="toast-body">
              {uploadError || uploadSuccess}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
