import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${positionClasses}`}
        >
          {content}
          <div
            className={`absolute w-1.5 h-1.5 bg-slate-900 border-slate-700 transform rotate-45 ${
              position === 'top'
                ? 'top-full -mt-1 left-1/2 -translate-x-1/2 border-r border-b'
                : position === 'bottom'
                ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2 border-l border-t'
                : position === 'left'
                ? 'left-full -ml-1 top-1/2 -translate-y-1/2 border-t border-r'
                : 'right-full -mr-1 top-1/2 -translate-y-1/2 border-b border-l'
            }`}
          />
        </div>
      )}
    </div>
  );
};
