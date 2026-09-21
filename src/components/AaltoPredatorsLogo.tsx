import React from 'react';

interface AaltoPredatorsLogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
}

export const AaltoPredatorsLogo: React.FC<AaltoPredatorsLogoProps> = ({
  className = 'w-10 h-10',
  size,
  withText = false,
}) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div className={`inline-flex items-center gap-2.5 ${withText ? '' : ''}`}>
      <img
        src="/aalto-predators-logo.svg"
        alt="Aalto Predators Helmet Logo"
        className={`object-contain shrink-0 drop-shadow-md transition-transform hover:scale-105 ${className}`}
        style={style}
        referrerPolicy="no-referrer"
      />
      {withText && (
        <div className="flex flex-col text-left">
          <span className="font-display font-black tracking-tight text-slate-900 leading-tight">
            AALTO PREDATORS
          </span>
          <span className="text-[10px] font-mono font-bold text-red-600 tracking-wider">
            8v8 PLAYBOOK
          </span>
        </div>
      )}
    </div>
  );
};
