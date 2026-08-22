import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  accent?: boolean
}

export function StatCard({ title, value, subtitle, icon, trend, trendLabel, accent }: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div className={cn(
      'rounded-[20px] p-6 border transition-all duration-300 relative overflow-hidden',
      accent
        ? 'bg-primary border-[#2a2118] text-white shadow-md'
        : 'bg-white border-border text-foreground shadow-[0_2px_10px_-4px_rgba(42,33,24,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(42,33,24,0.08)] hover:border-accent/30 hover:-translate-y-0.5'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-medium uppercase tracking-wide mb-1',
            accent ? 'text-white/50' : 'text-[#9a8a7a]'
          )}>
            {title}
          </p>
          <p className={cn('text-3xl font-bold tracking-tight',
            accent ? 'text-accent' : 'text-foreground'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn('text-xs mt-1', accent ? 'text-white/40' : 'text-[#9a8a7a]')}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
            accent ? 'bg-white/10 text-accent' : 'bg-surface text-accent border border-border'
          )}>
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className={cn(
          'flex items-center gap-1 mt-3 text-xs font-medium',
          trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
        )}>
          <TrendIcon className="w-3.5 h-3.5" />
          {trendLabel}
        </div>
      )}
    </div>
  )
}
