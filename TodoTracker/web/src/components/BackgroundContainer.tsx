import type { ReactNode } from 'react'
import Aurora from './backgrounds/Aurora'
import LiquidEther from './reactbits/LiquidEther'

type BackgroundContainerProps = {
  children: ReactNode
  variant?: 'aurora' | 'liquidEther'
  colorStops?: [string, string, string]
}

export default function BackgroundContainer({ children, variant = 'aurora', colorStops }: BackgroundContainerProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {variant === 'aurora' && <Aurora colorStops={colorStops} />}
      {variant === 'liquidEther' && (
        <LiquidEther colors={['#5227FF', '#FF9FFC', '#B19EEF']} resolution={0.5} autoDemo={true} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}