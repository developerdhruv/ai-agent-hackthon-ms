import { forwardRef, ElementType, Ref } from 'react';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';
import { badgeVariants } from './badge-variants';

// Define the props interface, extending HTML attributes and variant props
interface BadgeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof badgeVariants> {
  as?: ElementType; // For polymorphic rendering
  className?: string;
}

// Badge component with forwarded ref
const Badge = forwardRef<HTMLElement, BadgeProps>(
  (
    {
      as: Comp = 'span', // Default to span
      className,
      variant,
      ...props
    },
    ref: Ref<HTMLElement>
  ) => {
    return (
      <Comp
        ref={ref}
        data-slot="badge"
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

// Set display name for better debugging
Badge.displayName = 'Badge';

export { Badge, type BadgeProps };