const Bottone = ({ children, onClick, type = "button", className = "" }) => (
  <button
    type={type}
    onClick={onClick}
    className={`p-0 bg-transparent border-none cursor-pointer ${className}`}
  >
    <span className="text-white hover:text-gray-600 transition duration-100">
      {children}
    </span>
  </button>
);

export default Bottone;
