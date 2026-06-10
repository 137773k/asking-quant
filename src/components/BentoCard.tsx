import { type ReactNode } from 'react'

type Accent = 'gold' | 'green' | 'red'

const accentBorder: Record<Accent, string> = {
  gold: 'border-l-accent',
  green: 'border-l-accent-green',
  red: 'border-l-accent-red',
}

export default function BentoCard({
  title,
  children,
  className = '',
  accent,
}: {
  title?: string
  children: ReactNode
  className?: string
  accent?: Accent
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-2xl p-5 ${
        accent ? `border-l-2 ${accentBorder[accent]}` : ''
      } ${className}`}
    >
      {title && (
        <h3 className="text-text-secondary text-xs uppercase tracking-wider mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
