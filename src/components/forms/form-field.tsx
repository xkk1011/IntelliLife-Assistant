"use client"

import { forwardRef } from "react"
import { FieldError } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface FormFieldProps extends React.ComponentProps<"input"> {
  label?: string
  error?: FieldError | string
  description?: string
  required?: boolean
  containerClassName?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    label, 
    error, 
    description, 
    required, 
    className, 
    containerClassName,
    id,
    ...props 
  }, ref) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`
    const errorMessage = typeof error === 'string' ? error : error?.message

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <Input
          ref={ref}
          id={fieldId}
          className={cn(
            errorMessage && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={!!errorMessage}
          aria-describedby={
            errorMessage ? `${fieldId}-error` : 
            description ? `${fieldId}-description` : undefined
          }
          {...props}
        />
        
        {description && !errorMessage && (
          <p 
            id={`${fieldId}-description`}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
        
        {errorMessage && (
          <p 
            id={`${fieldId}-error`}
            className="text-sm text-destructive"
          >
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = "FormField"
