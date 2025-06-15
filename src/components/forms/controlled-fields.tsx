"use client"

import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import { FormField } from "./form-field"
import { TextareaField } from "./textarea-field"
import { SelectField, SelectOption } from "./select-field"
import { CheckboxField } from "./checkbox-field"

interface ControlledFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label?: string
  description?: string
  required?: boolean
  containerClassName?: string
}

// Controlled Input Field
interface ControlledInputProps<T extends FieldValues> 
  extends ControlledFieldProps<T>, 
  Omit<React.ComponentProps<"input">, "name"> {}

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  containerClassName,
  ...inputProps
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          {...field}
          {...inputProps}
          label={label}
          description={description}
          required={required}
          containerClassName={containerClassName}
          error={fieldState.error}
        />
      )}
    />
  )
}

// Controlled Textarea Field
interface ControlledTextareaProps<T extends FieldValues> 
  extends ControlledFieldProps<T>, 
  Omit<React.ComponentProps<"textarea">, "name"> {}

export function ControlledTextarea<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  containerClassName,
  ...textareaProps
}: ControlledTextareaProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextareaField
          {...field}
          {...textareaProps}
          label={label}
          description={description}
          required={required}
          containerClassName={containerClassName}
          error={fieldState.error}
        />
      )}
    />
  )
}

// Controlled Select Field
interface ControlledSelectProps<T extends FieldValues> 
  extends ControlledFieldProps<T>, 
  Omit<React.ComponentProps<"select">, "name"> {
  options: SelectOption[]
  placeholder?: string
}

export function ControlledSelect<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  containerClassName,
  options,
  placeholder,
  ...selectProps
}: ControlledSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <SelectField
          {...field}
          {...selectProps}
          label={label}
          description={description}
          required={required}
          containerClassName={containerClassName}
          options={options}
          placeholder={placeholder}
          error={fieldState.error}
        />
      )}
    />
  )
}

// Controlled Checkbox Field
interface ControlledCheckboxProps<T extends FieldValues> 
  extends ControlledFieldProps<T>, 
  Omit<React.ComponentProps<"input">, "name" | "type"> {}

export function ControlledCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  description,
  containerClassName,
  ...checkboxProps
}: ControlledCheckboxProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, ...field }, fieldState }) => (
        <CheckboxField
          {...field}
          {...checkboxProps}
          checked={value}
          onChange={onChange}
          label={label}
          description={description}
          containerClassName={containerClassName}
          error={fieldState.error}
        />
      )}
    />
  )
}
