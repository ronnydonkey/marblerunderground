import { cn } from '@/lib/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'gradient' | 'glass'
  size?: 'sm' | 'md' | 'lg'
}

export function Card({ 
  className, 
  variant = 'default', 
  size = 'md',
  children, 
  ...props 
}: CardProps) {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md',
    glass: 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl'
  }

  const sizes = {
    sm: 'p-4 rounded-lg',
    md: 'p-6 rounded-xl',
    lg: 'p-8 rounded-2xl'
  }

  return (
    <div 
      className={cn(
        'transition-all duration-200',
        variants[variant],
        sizes[size],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  badge?: React.ReactNode
}

export function CardHeader({ 
  className, 
  children, 
  icon, 
  badge,
  ...props 
}: CardHeaderProps) {
  return (
    <div 
      className={cn('flex items-start justify-between mb-4', className)} 
      {...props}
    >
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
      </div>
      {badge && (
        <div className="flex-shrink-0">
          {badge}
        </div>
      )}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 
      className={cn('text-lg font-semibold text-gray-900 leading-tight', className)} 
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn('text-sm text-gray-600 mt-1 leading-relaxed', className)} 
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn('space-y-4', className)} 
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn('flex items-center justify-between pt-4 mt-6 border-t border-gray-100', className)} 
      {...props}
    >
      {children}
    </div>
  )
}

export function CardStats({ stats }: { stats: Array<{ label: string; value: string | number; color?: string }> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className={`text-center p-3 rounded-lg ${stat.color || 'bg-gray-50'}`}>
          <div className={`text-xl font-bold ${stat.color ? 'text-white' : 'text-gray-900'}`}>
            {stat.value}
          </div>
          <div className={`text-xs ${stat.color ? 'text-white/80' : 'text-gray-600'}`}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}