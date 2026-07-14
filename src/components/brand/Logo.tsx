import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Logo Influencers Lab.ia — versão vetorial inspirada na logo original (chip + erlenmeyer).
 * Para usar a logo bitmap original, coloque o arquivo em /public/logo.png
 * e troque este componente por <Image src="/logo.png" />.
 */
export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 56, text: 'text-3xl' },
  };
  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-gradient-brand opacity-40 blur-xl" />
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative"
        >
          <defs>
            <linearGradient id="lg-chip" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="lg-liquid" x1="0" y1="0" x2="0" y2="64">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <filter id="lg-glow">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* chip border */}
          <rect
            x="10"
            y="10"
            width="44"
            height="44"
            rx="8"
            stroke="url(#lg-chip)"
            strokeWidth="2"
            fill="rgba(124,58,237,0.08)"
          />

          {/* chip pins */}
          {[0, 1, 2].map((i) => (
            <g key={`pins-${i}`}>
              <line x1={20 + i * 12} y1="4" x2={20 + i * 12} y2="10" stroke="url(#lg-chip)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1={20 + i * 12} y1="54" x2={20 + i * 12} y2="60" stroke="url(#lg-chip)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="4" y1={20 + i * 12} x2="10" y2={20 + i * 12} stroke="url(#lg-chip)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="54" y1={20 + i * 12} x2="60" y2={20 + i * 12} stroke="url(#lg-chip)" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ))}

          {/* erlenmeyer */}
          <g filter="url(#lg-glow)">
            <path
              d="M28 22 L28 30 L22 44 Q22 48 26 48 L38 48 Q42 48 42 44 L36 30 L36 22 Z"
              fill="url(#lg-liquid)"
              fillOpacity="0.7"
              stroke="url(#lg-chip)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line x1="27" y1="22" x2="37" y2="22" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
            {/* bubbles */}
            <circle cx="28" cy="40" r="1.2" fill="#67E8F9" />
            <circle cx="32" cy="36" r="1" fill="#A78BFA" />
            <circle cx="35" cy="42" r="1.4" fill="#67E8F9" />
          </g>
        </svg>
      </div>

      {showText && (
        <span className={cn('font-display font-bold tracking-tight text-gradient-brand whitespace-nowrap', s.text)}>
          Influencers Lab.ia
        </span>
      )}
    </div>
  );
}
