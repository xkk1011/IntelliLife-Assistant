"use client"

import { forwardRef } from "react"
import { FieldError } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectFieldProps extends React.ComponentProps<"select"> {
  label?: string
  error?: FieldError | string
  description?: string
  required?: boolean
  containerClassName?: string
  options: SelectOption[]
  placeholder?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ 
    label, 
    error, 
    description, 
    required, 
    className, 
    containerClassName,
    options,
    placeholder,
    id,
    ...props 
  }, ref) => {
    const fieldId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    const errorMessage = typeof error === 'string' ? error : error?.message

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <select
          ref={ref}
          id={fieldId}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            errorMessage && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={!!errorMessage}
          aria-describedby={
            errorMessage ? `${fieldId}-error` : 
            description ? `${fieldId}-description` : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
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

SelectField.displayName = "SelectField"
