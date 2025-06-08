'use client';

import React, { ReactNode } from 'react';

export default function FormComponents() {
  return (
    <div className="w-full">
      <p className="text-base">Form components will be implemented here</p>
    </div>
  );
}

interface FormInputProps {
  id: string;
  label: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  [key: string]: any;
}

export const FormInput = ({ id, label, isRequired, isDisabled, ...props }: FormInputProps) => {
  return (
    <div className="mb-4">
      <p className="font-medium mb-2">{label}</p>
      <input 
        id={id}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={isRequired}
        disabled={isDisabled}
        {...props}
      />
    </div>
  );
};

interface FormTextareaProps {
  id: string;
  label: string;
  rows?: number;
  isRequired?: boolean;
  isDisabled?: boolean;
  [key: string]: any;
}

export const FormTextarea = ({ id, label, rows = 3, isRequired, isDisabled, ...props }: FormTextareaProps) => {
  return (
    <div className="mb-4">
      <p className="font-medium mb-2">{label}</p>
      <textarea
        id={id}
        rows={rows}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={isRequired}
        disabled={isDisabled}
        {...props}
      />
    </div>
  );
};

interface FormSubmitButtonProps {
  children: ReactNode;
  isLoading?: boolean;
  [key: string]: any;
}

export const FormSubmitButton = ({ children, isLoading, ...props }: FormSubmitButtonProps) => {
  return (
    <button
      type="submit"
      className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      disabled={isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
