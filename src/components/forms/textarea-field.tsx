"use client"

import { forwardRef } from "react"
import { FieldError } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface TextareaFieldProps extends React.ComponentProps<"textarea"> {
  label?: string
  error?: FieldError | string
  description?: string
  required?: boolean
  containerClassName?: string
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
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
    const fieldId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const errorMessage = typeof error === 'string' ? error : error?.message

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <textarea
          ref={ref}
          id={fieldId}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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

TextareaField.displayName = "TextareaField"
