import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { JobApplicationStatus } from '../types/jobApplication';
import { useTheme } from '../contexts/ThemeContext';

interface KanbanColumnProps {
  id: JobApplicationStatus;
  title: string;
  bgColor: string;
  count: number;
  children: React.ReactNode;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  bgColor,
  count,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });
  const { theme } = useTheme();

  const cardBgColor = theme === 'dark' ? '#2d3748' : 'white';
  const dropHoverBgColor = theme === 'dark' ? '#4a5568' : '#f8f9fa';

  return (
    <div
      ref={setNodeRef}
      className={`card ${isOver ? 'shadow-lg border-primary' : 'shadow-sm'}`}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        backgroundColor: isOver ? dropHoverBgColor : cardBgColor,
        borderColor: theme === 'dark' ? '#4a5568' : '#dee2e6',
      }}
    >
      <div className={`card-header ${bgColor} text-white`} style={{ flexShrink: 0 }}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">{title}</h5>
          <span className="badge bg-light text-dark fw-bold">{count}</span>
        </div>
      </div>
      <div className="card-body p-2" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div className="d-flex flex-column gap-2">
          {children}
        </div>
      </div>
    </div>
  );
};
