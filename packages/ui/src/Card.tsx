import React from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  neon?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, neon = false }) => {
  return (
    <div
      className={clsx(
        'bg-gray-800 rounded-lg p-6 border',
        neon ? 'border-[#00FFA3] shadow-lg shadow-[#00FFA3]/20' : 'border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
};
