import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "buy" | "sell" | "icon-only";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-bold touch-target rounded-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-void disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] cursor-pointer";
    
    const variants = {
      primary: "bg-accent text-tx-inverse border border-transparent hover:bg-accent/85",
      secondary: "bg-bg-raised text-tx-primary border border-bd-subtle hover:border-bd-strong",
      ghost: "bg-transparent text-tx-secondary border border-transparent hover:bg-bg-raised hover:text-tx-primary",
      destructive: "bg-loss-dim text-loss border border-loss-border hover:bg-loss/20",
      buy: "bg-gain text-tx-inverse border border-transparent hover:bg-gain/90",
      sell: "bg-loss text-tx-inverse border border-transparent hover:bg-loss/90",
      "icon-only": "bg-transparent text-tx-secondary border border-transparent hover:bg-bg-raised p-0"
    };


    const sizes = {
      sm: "h-[36px] px-3 text-[13px] min-w-[36px]",
      md: "h-[44px] px-5 text-[14px] min-w-[44px]",
      lg: "h-[52px] px-7 text-[16px] min-w-[52px]"
    };

    if (variant === "icon-only") {
      // Icon only overrides horizontal padding, relies on min-w and h for square
      sizes.sm = "h-[36px] w-[36px] text-[13px]";
      sizes.md = "h-[44px] w-[44px] text-[14px]";
      sizes.lg = "h-[52px] w-[52px] text-[16px]";
    }

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
