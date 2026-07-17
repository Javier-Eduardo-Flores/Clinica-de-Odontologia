interface PropsInput {
  type: string;
  label: string;
  name: string;
  placeholder: string;
  required: boolean;
  value?: string;
  error?: string;
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
  onChange,
  onBlur,
}) => {
  return (
    <div>
      <label
        className="block text-sm font-inter font-semibold text-clinica-accent"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full border rounded-lg py-2 px-2 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-400'
            : 'border-gray-300 focus:ring-clinica-dark'
        }`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
