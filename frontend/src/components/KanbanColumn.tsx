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
        minHeight: '500px', // Ensure minimum height for better drop target
      }}
    >
      <div className={`card-header ${bgColor} text-white`} style={{ flexShrink: 0 }}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">{title}</h5>
          <span className="badge bg-light text-dark fw-bold">{count}</span>
        </div>
      </div>
      <div 
        className="card-body" 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden',
          padding: '1rem',
          minHeight: '200px', // Ensure the body has minimum height for dropping
          position: 'relative'
        }}
      >
        <div className="d-flex flex-column gap-2" style={{ minHeight: '100%' }}>
          {children}
          {/* Add an invisible drop zone that expands to fill empty space */}
          <div 
            style={{ 
              flex: 1, 
              minHeight: count === 0 ? '150px' : '50px', // Larger area when column is empty
              pointerEvents: 'none', // Don't interfere with card interactions
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isOver ? 0.3 : 0,
              backgroundColor: isOver ? 'rgba(13, 110, 253, 0.1)' : 'transparent',
              border: isOver ? '2px dashed rgba(13, 110, 253, 0.3)' : 'none',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              margin: '0.5rem 0'
            }}
          >
            {count === 0 && isOver && (
              <span style={{ 
                color: theme === 'dark' ? '#94a3b8' : '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Drop here
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
