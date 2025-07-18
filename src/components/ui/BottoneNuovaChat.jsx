const BottoneNuovaChat = ({ children, onClick, type = "button", className = "", title = "nuova chat"}) => (
  <button
    type={type}
    onClick={onClick}
    className={`px-4 py-2 bg-[#2a2a2a] text-white rounded hover:bg-[#3a3a3a] transition cursor-pointer ${className}`}
    title={title}
  >
    {children}
  </button>
);

export default BottoneNuovaChat;
