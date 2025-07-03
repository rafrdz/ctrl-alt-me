import React, { useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useTheme } from '../contexts/ThemeContext';
import './Markdown.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  id?: string;
  name?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter markdown text...',
  disabled = false,
  rows = 6,
  id,
  name,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const { theme } = useTheme();

  const handleTabChange = (tab: 'edit' | 'preview') => {
    setActiveTab(tab);
  };

  const textareaClasses = `form-control ${
    theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
  }`;

  const tabContentClasses = `tab-content ${
    theme === 'dark' ? 'bg-dark text-light' : 'bg-light'
  } border border-top-0 rounded-bottom p-3`;

  return (
    <div className="markdown-editor">
      {/* Tab Navigation */}
      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'edit' ? 'active' : ''} ${
              theme === 'dark' ? 'text-light' : ''
            }`}
            type="button"
            onClick={() => handleTabChange('edit')}
            aria-selected={activeTab === 'edit'}
          >
            <i className="bi bi-pencil me-1"></i>
            Edit
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'preview' ? 'active' : ''} ${
              theme === 'dark' ? 'text-light' : ''
            }`}
            type="button"
            onClick={() => handleTabChange('preview')}
            aria-selected={activeTab === 'preview'}
          >
            <i className="bi bi-eye me-1"></i>
            Preview
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className={tabContentClasses}>
        {activeTab === 'edit' ? (
          <div>
            <textarea
              id={id}
              name={name}
              className={textareaClasses}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              style={{ resize: 'vertical' }}
            />
            <div className="form-text mt-2">
              <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>
                Supports <strong>markdown</strong> syntax. Use{' '}
                <code>**bold**</code>, <code>*italic*</code>, <code>`code`</code>,{' '}
                <code>- lists</code>, <code>[links](url)</code>, and more.
              </small>
            </div>
          </div>
        ) : (
          <div style={{ minHeight: `${rows * 1.5}rem` }}>
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className={`text-center ${theme === 'dark' ? 'text-light opacity-50' : 'text-muted'}`}>
                <i className="bi bi-file-text fs-1 d-block mb-2"></i>
                <p>Nothing to preview</p>
                <small>Switch to Edit tab to add content</small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
