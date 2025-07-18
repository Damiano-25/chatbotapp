import { Trash } from "lucide-react";

const ChatContainer = ({ chats, onSelect, onDelete }) => {
  return (
    <div className="text-white">
      <h3 className="text-lg font-semibold mb-2">Cronologia Chat</h3>
      {chats.map((chat, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-[#1e1e1e] hover:bg-[#2a2a2a] p-2 rounded mb-1"
        >
          <div
            onClick={() => onSelect(i)}
            className="cursor-pointer flex-1"
          >
            Chat {i + 1}
          </div>
          <button
            onClick={() => onDelete(i)}
            className="text-gray-400 hover:text-red-500 transition"
            title="Elimina chat"
          >
            <Trash size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ChatContainer;
