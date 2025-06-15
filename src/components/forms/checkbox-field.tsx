"use client"

import { forwardRef } from "react"
import { FieldError } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface CheckboxFieldProps extends React.ComponentProps<"input"> {
  label?: string
  error?: FieldError | string
  description?: string
  containerClassName?: string
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ 
    label, 
    error, 
    description, 
    className, 
    containerClassName,
    id,
    ...props 
  }, ref) => {
    const fieldId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    const errorMessage = typeof error === 'string' ? error : error?.message

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="flex items-center space-x-2">
          <input
            ref={ref}
            type="checkbox"
            id={fieldId}
            className={cn(
              "h-4 w-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              errorMessage && "border-destructive focus:ring-destructive",
              className
            )}
            aria-invalid={!!errorMessage}
            aria-describedby={
              errorMessage ? `${fieldId}-error` : 
              description ? `${fieldId}-description` : undefined
            }
            {...props}
          />
          
          {label && (
            <Label 
              htmlFor={fieldId} 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </Label>
          )}
        </div>
        
        {description && !errorMessage && (
          <p 
            id={`${fieldId}-description`}
            className="text-sm text-muted-foreground ml-6"
          >
            {description}
          </p>
        )}
        
        {errorMessage && (
          <p 
            id={`${fieldId}-error`}
            className="text-sm text-destructive ml-6"
          >
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

CheckboxField.displayName = "CheckboxField"
