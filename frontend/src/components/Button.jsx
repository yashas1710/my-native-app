// src/components/Button.jsx
export default function Button({ children, onClick, type = "button", variant = "primary" }) {
  const base =
    "px-4 py-2 rounded font-medium transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const styles = {
    primary:
      "bg-brand text-white hover:bg-brand-dark focus:ring-accent shadow-card",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-brand",
    danger:
      "bg-red-500 text-white hover:bg-red-600 focus:ring-red-300",
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}
