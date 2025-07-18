const ResponseArea = ({ messages }) => {
  return (
    <>
      {/*controllo su ogni messaggio se ai o utente*/}
      {messages.map((messaggio, i) => (
        <div key={i} className="mb-4">
          <strong>
            {messaggio.role === "user" ? "Tu" : messaggio.role === "assistant" ? "AI" : ""}
          </strong>
          <pre className="whitespace-pre-wrap break-words">{messaggio.content}</pre>
        </div>
      ))}
    </>
  );
};

export default ResponseArea;
