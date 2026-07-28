interface PropsSelect {
  label: string;
  name: string;
  required: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
}

const Select: React.FC<PropsSelect> = ({
  label,
  name,
  required,
  options,
  placeholder,
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
      <select
        id={name}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full border rounded-lg py-2 px-2 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 focus:ring-clinica-dark"
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Select;
