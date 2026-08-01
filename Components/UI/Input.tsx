"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PropsInput {
  type: string;
  label: string;
  name: string;
  placeholder: string;
  required: boolean;
  value?: string;
  error?: string;
  step?: string;
  togglePassword?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const Input: React.FC<PropsInput> = ({
  type,
  label,
  name,
  placeholder,
  required,
  value,
  error,
  step,
  togglePassword,
  onChange,
  onBlur,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label
        className="block text-sm font-inter font-semibold text-clinica-accent"
        htmlFor={name}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={togglePassword && show ? "text" : type}
          placeholder={placeholder}
          required={required}
          value={value}
          step={step}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full border rounded-lg py-2 px-2 focus:outline-none focus:ring-2 ${
            togglePassword ? "pr-10" : ""
          } ${
            error
              ? 'border-red-500 focus:ring-red-400'
              : 'border-gray-300 focus:ring-clinica-dark'
          }`}
        />
        {togglePassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
