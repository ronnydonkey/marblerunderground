import { cn } from '@/lib/utils/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'gradient'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  pulse?: boolean
}

export function Badge({ 
  className, 
  variant = 'default',
  size = 'sm',
  icon,
  pulse = false,
  children, 
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gradient: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-transparent'
  }

  const sizes = {
    xs: 'px-2 py-0.5 text-xs rounded',
    sm: 'px-2.5 py-0.5 text-xs rounded-md',
    md: 'px-3 py-1 text-sm rounded-md',
    lg: 'px-4 py-1.5 text-sm rounded-lg'
  }

  return (
    <span 
      className={cn(
        'inline-flex items-center font-medium border transition-all duration-200',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse',
        className
      )} 
      {...props}
    >
      {icon && (
        <span className="mr-1.5 flex-shrink-0">
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}

export function DifficultyBadge({ level }: { level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }) {
  const configs = {
    beginner: { variant: 'success' as const, icon: '🟢', label: 'Beginner' },
    intermediate: { variant: 'info' as const, icon: '🔵', label: 'Intermediate' },
    advanced: { variant: 'warning' as const, icon: '🟡', label: 'Advanced' },
    expert: { variant: 'error' as const, icon: '🔴', label: 'Expert' }
  }

  const config = configs[level]
  
  return (
    <Badge variant={config.variant} icon={config.icon}>
      {config.label}
    </Badge>
  )
}

export function StatusBadge({ 
  status 
}: { 
  status: 'active' | 'completed' | 'pending' | 'failed' | 'processing' 
}) {
  const configs = {
    active: { variant: 'success' as const, icon: '✅', label: 'Active' },
    completed: { variant: 'success' as const, icon: '🎉', label: 'Completed' },
    pending: { variant: 'warning' as const, icon: '⏳', label: 'Pending' },
    failed: { variant: 'error' as const, icon: '❌', label: 'Failed' },
    processing: { variant: 'info' as const, icon: '🔄', label: 'Processing', pulse: true }
  }

  const config = configs[status]
  
  return (
    <Badge variant={config.variant} icon={config.icon} pulse={config.pulse}>
      {config.label}
    </Badge>
  )
}