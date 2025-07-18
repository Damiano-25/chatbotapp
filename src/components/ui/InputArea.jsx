const InputArea = ({ value, onChange, onKeyDown, placeholder }) => (
  <textarea
    className="flex-1 p-2 rounded bg-gray-900 text-white border border-gray-600 resize-none"
    rows={3}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
  />
);

export default InputArea;
