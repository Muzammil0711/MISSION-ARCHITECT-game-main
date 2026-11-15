import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export function Button({ className = '', variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-nasa-blue focus-visible:ring-offset-2 focus-visible:ring-offset-space-900'
  const variants: Record<string, string> = {
    primary: 'bg-nasa-blue text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25',
    secondary: 'bg-space-700 text-white hover:bg-space-600 border border-space-600',
    ghost: 'bg-transparent text-space-300 hover:bg-space-800 hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/25',
    outline: 'bg-transparent text-nasa-blue border border-nasa-blue hover:bg-nasa-blue/10',
  }
  const sizes: Record<string, string> = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} type="button">
      {children}
    </button>
  )
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
}
export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`rounded-2xl border border-space-600 bg-space-800/40 p-5 shadow-md ${className}`} {...props}>
      {children}
    </div>
  )
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
}
export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return <div className={`mb-3 ${className}`} {...props}>{children}</div>
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
  className?: string
}
export function CardTitle({ children, className = '', ...props }: CardTitleProps) {
  return <h3 className={`text-lg font-bold text-white ${className}`} {...props}>{children}</h3>
}
