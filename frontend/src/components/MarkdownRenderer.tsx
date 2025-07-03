import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../contexts/ThemeContext';
import './Markdown.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  style = {},
  compact = false,
}) => {
  const { theme } = useTheme();

  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code
          className={`${className} ${
            theme === 'dark' ? 'bg-dark text-light' : 'bg-light'
          } px-1 rounded`}
          {...props}
        >
          {children}
        </code>
      );
    },
    blockquote({ children }: any) {
      return (
        <blockquote
          className={`border-start border-3 ps-3 my-2 ${
            theme === 'dark' ? 'border-light text-light' : 'border-secondary text-muted'
          }`}
        >
          {children}
        </blockquote>
      );
    },
    table({ children }: any) {
      return (
        <div className="table-responsive">
          <table className={`table table-sm ${theme === 'dark' ? 'table-dark' : ''}`}>
            {children}
          </table>
        </div>
      );
    },
    a({ href, children }: any) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-none"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div 
      className={`markdown-content ${compact ? 'compact' : ''} ${className} ${
        theme === 'dark' ? 'text-light' : ''
      }`} 
      style={style}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
