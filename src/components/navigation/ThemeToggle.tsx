import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useApp();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
      aria-label={theme === 'dark' ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}
      title={`Aktifkan tema ${theme === 'dark' ? 'terang' : 'gelap'}`}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
