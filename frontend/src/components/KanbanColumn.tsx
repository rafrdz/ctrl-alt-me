import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { JobApplicationStatus } from '../types/jobApplication';

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

  return (
    <div
      ref={setNodeRef}
      className={`card h-100 ${isOver ? 'shadow-lg border-primary' : 'shadow-sm'}`}
      style={{
        minHeight: '500px',
        transition: 'all 0.2s ease',
        backgroundColor: isOver ? '#f8f9fa' : 'white',
      }}
    >
      <div className={`card-header ${bgColor} text-white`}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">{title}</h5>
          <span className="badge bg-light text-dark fw-bold">{count}</span>
        </div>
      </div>
      <div className="card-body p-2" style={{ overflowY: 'auto' }}>
        <div className="d-flex flex-column gap-2">
          {children}
        </div>
      </div>
    </div>
  );
};
