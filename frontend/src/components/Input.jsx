// src/components/Input.jsx
export default function Input({
  type = "text",
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="mb-1 font-medium text-gray-700">{label}</label>}
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`border rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand ${className}`}
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`border rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
