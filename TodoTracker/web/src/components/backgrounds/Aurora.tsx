import React from 'react'

type AuroraProps = {
  colorStops?: [string, string, string]
  speed?: number // seconds for the base animation
  blend?: number // 0..1 overlay opacity
  amplitude?: number // px translation amplitude
  className?: string
}

export default function Aurora({
  colorStops = ['#3A29FF', '#FF94B4', '#FF3232'],
  speed = 20,
  blend = 0.4,
  amplitude = 40,
  className = '',
}: AuroraProps) {
  const styleVars: React.CSSProperties = {
    ['--c1' as any]: colorStops[0],
    ['--c2' as any]: colorStops[1],
    ['--c3' as any]: colorStops[2],
    ['--blend' as any]: String(blend),
    ['--speed' as any]: `${speed}s`,
    ['--amp' as any]: `${amplitude}px`,
  }

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute inset-[-20%] opacity-[var(--blend)] blur-3xl mix-blend-screen will-change-transform aurora-layer" style={styleVars} />
      <style>{`
        .aurora-layer {
          background:
            radial-gradient(60% 80% at 20% 30%, var(--c1) 0%, transparent 60%),
            radial-gradient(50% 70% at 80% 20%, var(--c2) 0%, transparent 60%),
            radial-gradient(40% 60% at 50% 80%, var(--c3) 0%, transparent 60%);
          animation:
            aurora-x var(--speed) ease-in-out infinite alternate,
            aurora-y calc(var(--speed) * 1.3) ease-in-out infinite alternate,
            aurora-rot calc(var(--speed) * 2) linear infinite;
        }

        @keyframes aurora-x {
          0% { transform: translateX(calc(var(--amp) * -1)); }
          100% { transform: translateX(var(--amp)); }
        }
        @keyframes aurora-y {
          0% { transform: translateY(calc(var(--amp) * -1)); }
          100% { transform: translateY(var(--amp)); }
        }
        @keyframes aurora-rot {
          0% { rotate: 0deg; }
          100% { rotate: 12deg; }
        }
      `}</style>
    </div>
  )
}