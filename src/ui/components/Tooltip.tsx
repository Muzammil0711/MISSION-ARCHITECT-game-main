import * as React from 'react'

interface TooltipProps {
  children: React.ReactNode
  label: string
  description?: string
  'aria-label'?: string
}

export function Tooltip({ children, label, description, 'aria-label': ariaLabel }: TooltipProps) {
  const [open, setOpen] = React.useState(false)
  const id = React.useId()

  return (
    <div className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      <span
        className="underline underline-offset-4 decoration-space-600 decoration-dotted cursor-help hover:decoration-white transition-colors"
        aria-describedby={ariaLabel ? undefined : id}
        {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
      >
        {children}
      </span>
      {open && (
        <div className="absolute z-50 mt-1">
          <div className="space-msg border border-space-600 bg-space-800 text-white text-xs rounded shadow-xl p-3 max-w-xs animate-in fade-in slide-in-from-top-2 duration-200" id={id} role="tooltip">
            <div className="font-semibold text-nasa-blue mb-1">{label}</div>
            {description && <div className="text-space-300 text-sm">{description}</div>}
          </div>
          <svg className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 text-space-800 fill-space-800" viewBox="0 0 20 20" fill="currentColor"><path d="M10.293 13.293A1 1 0 0112 15.586l4-4a1 1 0 011.414-1.414l4 4a1 1 0 01-1.414 1.414L14 14.172V19a1 1 0 01-1 1H5a1 1 0 01-1-1v-4.828l2.293-2.293a1 1 0 011.414-1.414z" /></svg>
        </div>
      )}
    </div>
  )
}
