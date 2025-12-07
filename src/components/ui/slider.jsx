import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };

  const currentValue = Array.isArray(value) ? value[0] : value || min;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div 
          className="absolute h-full bg-primary transition-all" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="absolute w-full h-2 opacity-0 cursor-pointer"
        {...props}
      />
      <div 
        className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-all pointer-events-none"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
});

Slider.displayName = "Slider"

export { Slider }