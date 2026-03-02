import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// ─── Variant & Size Maps ────────────────────────────────────────────────────

const variantClasses = {
  default:
    'bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-500',
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-400',
  secondary:
    'bg-slate-200 text-slate-800 hover:bg-slate-300 focus-visible:ring-slate-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-400',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800',
  outline:
    'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800',
} as const;

const sizeClasses = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2.5',
} as const;

// ─── Types ──────────────────────────────────────────────────────────────────

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

// When asChild is true, the component wraps a single child element by cloning
// it and merging props — no <button> is rendered.
export type ButtonProps = BaseButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

// ─── Component ──────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      loading = false,
      disabled = false,
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const baseClasses = clsx(
      // layout
      'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium',
      // transitions & focus ring
      'transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      // disabled state
      'disabled:pointer-events-none disabled:opacity-50',
      // variant + size
      variantClasses[variant],
      sizeClasses[size],
      className,
    );

    // asChild: clone the single child element and inject button-like classes.
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          className: clsx(
            baseClasses,
            (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>)
              .props.className,
          ),
        },
      );
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={baseClasses}
        {...props}
      >
        {loading && (
          <Loader2
            className={clsx('animate-spin', {
              'h-3 w-3': size === 'sm',
              'h-4 w-4': size === 'md',
              'h-5 w-5': size === 'lg',
            })}
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
