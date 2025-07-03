import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { CSVImport } from './CSVImport';
import { useTheme } from '../contexts/ThemeContext';
import './Header.css';

type ViewMode = 'kanban' | 'list';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddNew: () => void;
  onImportSuccess?: () => void;
  isFormOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  onAddNew,
  onImportSuccess,
  isFormOpen,
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
            {/* View Mode Toggle */}
            <div className="nav-item me-3">
              <div className="btn-group" role="group" aria-label="View mode">
                <button
                  type="button"
                  className={`btn btn-sm ${
                    viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => onViewModeChange('list')}
                  disabled={isFormOpen}
                >
                  <i className="bi bi-list-ul me-1"></i>
                  <span className="d-none d-sm-inline">List</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => onViewModeChange('kanban')}
                  disabled={isFormOpen}
                >
                  <i className="bi bi-kanban me-1"></i>
                  <span className="d-none d-sm-inline">Kanban</span>
                </button>
              </div>
            </div>

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
