import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { CSVImport } from './CSVImport';
import { CSVExport } from './CSVExport';
import { useTheme } from '../contexts/ThemeContext';
import type { JobApplication } from '../types/jobApplication';
import './Header.css';

interface HeaderProps {
  onAddNew: () => void;
  onImportSuccess?: () => void;
  isFormOpen: boolean;
  applications?: JobApplication[];
  exportFilename?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onAddNew,
  onImportSuccess,
  isFormOpen,
  applications,
  exportFilename,
}) => {
  const { theme } = useTheme();

  const navbarClasses = `navbar navbar-expand-lg ${
    theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'
  } border-bottom`;

  return (
    <nav className={navbarClasses} style={{ flexShrink: 0 }}>
      <div className="container-fluid">
        {/* Brand/Title */}
        <div className="navbar-brand d-flex align-items-center">
          <i className="bi bi-briefcase me-2 fs-4"></i>
          <span className="fw-bold">Ctrl-Alt-Me: Job Applications Tracker</span>
        </div>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="navbar-nav ms-auto d-flex align-items-center">
            {/* Add New Button */}
            <div className="nav-item me-3">
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={onAddNew}
                disabled={isFormOpen}
              >
                <i className="bi bi-plus-circle me-1"></i>
                <span className="d-none d-sm-inline">Add New</span>
              </button>
            </div>

            {/* CSV Import */}
            <div className="nav-item me-3">
              <CSVImport
                onImportSuccess={onImportSuccess}
                disabled={isFormOpen}
              />
            </div>

            {/* CSV Export */}
            <div className="nav-item me-3">
              <CSVExport
                applications={applications || []}
                disabled={isFormOpen}
                filename={exportFilename}
              />
            </div>

            {/* Theme Toggle */}
            <div className="nav-item">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
