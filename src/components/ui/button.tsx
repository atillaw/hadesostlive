import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-wide transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-soft text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 border border-primary/20",
        destructive: "bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-lg shadow-destructive/30 hover:shadow-xl hover:shadow-destructive/40 hover:scale-105",
        outline: "glass border-2 border-primary/40 text-foreground hover:bg-primary/20 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 hover:scale-105",
        secondary: "bg-gradient-to-r from-secondary to-pink-600 text-secondary-foreground shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 hover:scale-105",
        ghost: "hover:glass hover:text-primary hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline hover-neon",
        social: "glass text-card-foreground border border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 hover:scale-105",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
