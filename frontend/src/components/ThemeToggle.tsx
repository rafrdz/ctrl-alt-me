import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`btn ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'} btn-sm`}
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <i className="bi bi-moon-fill me-1"></i>
          Dark
        </>
      ) : (
        <>
          <i className="bi bi-sun-fill me-1"></i>
          Light
        </>
      )}
    </button>
  );
};
