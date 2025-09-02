import React from 'react'
import { clsx } from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  color?: 'primary' | 'white' | 'gray' | 'crypto'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  color = 'primary'
}) => {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        {
          'border-gray-300 border-t-primary-600': color === 'primary',
          'border-gray-300 border-t-white': color === 'white',
          'border-gray-300 border-t-gray-600': color === 'gray',
          'border-gray-300 border-t-crypto-600': color === 'crypto',
        },
        className
      )}
    />
  )
}

export default LoadingSpinner
