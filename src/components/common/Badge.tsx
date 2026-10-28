import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'violet';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  icon,
}) => {
  const variantClasses = {
    brand: 'bg-brand-500/15 text-brand-400 border-brand-500/30 dark:text-brand-300',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 dark:text-emerald-300',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30 dark:text-amber-300',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30 dark:text-rose-300',
    violet: 'bg-violet-500/15 text-violet-400 border-violet-500/30 dark:text-violet-300',
    neutral: 'bg-slate-500/15 text-slate-400 border-slate-500/30 dark:text-slate-300',
  }[variant];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantClasses} ${sizeClasses}`}
    >
      {icon && <span className="w-3.5 h-3.5 inline-flex items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
};
