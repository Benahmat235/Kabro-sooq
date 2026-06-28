import * as React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  onRemove?: () => void;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, active, onRemove, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          active
            ? "bg-primary text-white hover:bg-primary-600"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          className
        )}
        {...props}
      >
        {children}
        {onRemove && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-black/20",
              active ? "text-white" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove</span>
          </span>
        )}
      </button>
    );
  }
);
Chip.displayName = "Chip";

export { Chip };
