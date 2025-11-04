import React from 'react';

interface NeonCardProps {
  className?: string;
  children: React.ReactNode;
}

const NeonCard: React.FC<NeonCardProps> = ({ className = '', children }) => (
  <div className={`relative rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500/60 to-emerald-500/60 ${className}`}>
    <div className="rounded-2xl bg-neutral-950/95 backdrop-blur-sm border border-white/10">
      {children}
    </div>
  </div>
);

export default NeonCard;
