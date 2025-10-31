import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

// Define props for BreadcrumbLink
interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  asChild?: boolean;
}

// Use forwardRef to handle refs properly
const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";

    return (
      <Comp
        ref={ref as React.Ref<HTMLAnchorElement>} // Ensure ref is compatible
        data-slot="breadcrumb-link"
        className={cn("hover:text-foreground transition-colors", className)}
        {...(asChild ? { "data-as-child": true } : {})}
        {...props}
      />
    );
  }
);

BreadcrumbLink.displayName = "BreadcrumbLink";

export { BreadcrumbLink }; // Add other exports as needed