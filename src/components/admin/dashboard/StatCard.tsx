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
          ? 'bg-surface-muted border-border text-foreground shadow-medium hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5'
          : 'bg-surface border-border text-foreground shadow-subtle hover:shadow-medium hover:border-accent/30 hover:-translate-y-0.5'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-medium uppercase tracking-wide mb-1',
            accent ? 'text-primary' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className={cn('text-3xl font-heading font-bold tracking-tight',
            'text-foreground'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn('text-xs mt-1', accent ? 'text-primary/70' : 'text-muted-foreground')}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
            accent ? 'bg-primary/5 text-accent border border-primary/10' : 'bg-surface text-accent border border-border'
          )}>
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className={cn(
          'flex items-center gap-1 mt-3 text-xs font-medium',
          trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground'
        )}>
          <TrendIcon className="w-3.5 h-3.5" />
          {trendLabel}
        </div>
      )}
    </div>
  )
}
