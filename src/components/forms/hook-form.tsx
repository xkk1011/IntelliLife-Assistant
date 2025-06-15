"use client"

import { ReactNode } from "react"
import { 
  useForm, 
  UseFormReturn, 
  FieldValues, 
  DefaultValues,
  SubmitHandler,
  UseFormProps
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FormContainer } from "./form-container"

interface HookFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>
  defaultValues?: DefaultValues<T>
  onSubmit: SubmitHandler<T>
  children: (form: UseFormReturn<T>) => ReactNode
  title?: string
  description?: string
  submitText?: string
  cancelText?: string
  onCancel?: () => void
  isLoading?: boolean
  className?: string
  showCard?: boolean
  formOptions?: Omit<UseFormProps<T>, 'resolver' | 'defaultValues'>
}

export function HookForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  title,
  description,
  submitText,
  cancelText,
  onCancel,
  isLoading = false,
  className,
  showCard = true,
  formOptions,
}: HookFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    ...formOptions,
  })

  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <FormContainer
      title={title}
      description={description}
      onSubmit={handleSubmit}
      submitText={submitText}
      cancelText={cancelText}
      onCancel={onCancel}
      isLoading={isLoading}
      className={className}
      showCard={showCard}
      submitDisabled={!form.formState.isValid && form.formState.isSubmitted}
    >
      {children(form)}
    </FormContainer>
  )
}

// Hook for using form outside of HookForm component
export function useHookForm<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  defaultValues?: DefaultValues<T>,
  options?: Omit<UseFormProps<T>, 'resolver' | 'defaultValues'>
) {
  return useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    ...options,
  })
}
