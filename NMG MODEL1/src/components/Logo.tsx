import { Anchor } from 'lucide-react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'stacked';
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function Logo({ 
  variant = 'full', 
  className = '',
  iconSize = 'md',
  showTagline = false
}: LogoProps) {
  
  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  // Gold circular emblem with anchor/ship authority symbol
  const LogoIcon = () => (
    <div className={`
      ${iconSizeClasses[iconSize]}
      rounded-full 
      bg-gradient-to-br from-[#D4AF37] to-[#B8941F]
      flex items-center justify-center
      shadow-lg
      border-2 border-[#E8C868]
      relative
    `}>
      {/* Inner circle detail */}
      <div className="absolute inset-1 rounded-full border border-[#E8C868]/40" />
      
      {/* Anchor icon representing maritime authority */}
      <Anchor className="w-[55%] h-[55%] text-[#02283F] relative z-10" strokeWidth={2.5} />
    </div>
  );

  // Icon only variant (for collapsed sidebar)
  if (variant === 'icon') {
    return (
      <div className={className}>
        <LogoIcon />
      </div>
    );
  }

  // Stacked variant (logo above text)
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <LogoIcon />
        <div className="text-center">
          <div className="text-lg font-semibold text-[#02283F] leading-tight">
            NMG Marine Service
          </div>
          <div className="text-xs text-[#02283F]/70 leading-tight">
            Pvt. Ltd
          </div>
          {showTagline && (
            <div className="text-xs text-[#02283F]/60 mt-1">
              Crew Management & PMS System
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full variant (default - logo beside text)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon />
      <div className="flex flex-col">
        <div className="text-base leading-tight">
          <span className="font-semibold">NMG Marine Service</span>
        </div>
        <div className="text-[10px] opacity-70 -mt-0.5 leading-tight">
          Pvt. Ltd
        </div>
        {showTagline && (
          <div className="text-[9px] opacity-60 leading-tight mt-0.5">
            Crew Management & PMS
          </div>
        )}
      </div>
    </div>
  );
}
