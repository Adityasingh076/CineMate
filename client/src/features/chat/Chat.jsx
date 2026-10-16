import { useEffect, useRef, useState } from "react";
import socket from "../../socket/socket";

export default function Chat() {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const endRef = useRef();

  useEffect(() => {
    const onMsg = (m) => setMsgs((p) => [...p, m]);
    const onSys = (t) => setMsgs((p) => [...p, { system: true, message: t }]);
    socket.on("chat-message", onMsg);
    socket.on("system-message", onSys);
    return () => { socket.off("chat-message", onMsg); socket.off("system-message", onSys); };
  }, []);
useEffect(() => {
  endRef.current?.scrollIntoView({ behavior: "smooth" });
}, [msgs]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit("chat-message", { message: text });
    setText("");
  };

  return (
    <div className="panel chat">
      <div className="chat-list">
        {msgs.map((m, i) => m.system
          ? <div key={i} className="msg sys">{m.message}</div>
          : <div key={i} className="msg"><b>{m.user}:</b> {m.message}</div>)}
        <div ref={endRef} />
      </div>
      <form className="row" onSubmit={send}>
        <input placeholder="Say something…" value={text} onChange={(e) => setText(e.target.value)} />
        <button>Send</button>
      </form>
    </div>
  );
}
