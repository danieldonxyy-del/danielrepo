import React from 'react';
import { cn } from '../../utils/cn';

interface TabsContextType {
  value: string;
  onValueChange: (val: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export const Tabs: React.FC<{
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ value, onValueChange, children, className }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 p-1 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400',
        className
      )}
    >
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be inside Tabs');
  const active = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50',
        active
          ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
          : 'hover:text-slate-900 dark:hover:text-slate-200',
        className
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be inside Tabs');
  if (ctx.value !== value) return null;

  return <div className={cn('mt-4 focus-visible:outline-none', className)}>{children}</div>;
};
