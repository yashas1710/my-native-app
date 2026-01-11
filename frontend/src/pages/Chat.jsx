import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

export default function Chat({ planId, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!planId) return;
    const q = query(
      collection(db, "plans", planId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [planId]);

  const handleSend = async () => {
  if (!newMessage.trim()) return;
  await addDoc(collection(db, "plans", planId, "messages"), {
    text: newMessage,
    user_id: user.uid,        // match Firestore rules
    createdAt: serverTimestamp(),
  });
  setNewMessage("");
};


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-96 bg-white border-t border-gray-300 flex flex-col p-4 shadow-lg z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Chat</h3>
        <button onClick={onClose} className="text-red-500 font-bold">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto mb-2 space-y-2 max-h-80">
        {messages.map((msg) => (
          <div
  key={msg.id}
  className={`flex ${msg.user_id === user.uid ? "justify-end" : "justify-start"}`}
>
  <div className={`px-3 py-1 rounded max-w-xs break-words ${
    msg.user_id === user.uid ? "bg-blue-400 text-white" : "bg-gray-200 text-gray-900"
  }`}>
    {msg.text}
  </div>
</div>

        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}
