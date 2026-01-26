// src/pages/Chat.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export default function Chat() {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch plan title
  useEffect(() => {
    const fetchPlan = async () => {
      const snap = await getDoc(doc(db, "plans", planId));
      if (snap.exists()) setPlanTitle(snap.data().title);
    };
    fetchPlan();
  }, [planId]);

  // Real-time listener for messages
  useEffect(() => {
    const q = query(
      collection(db, "planChats", planId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, async (snapshot) => {
      const msgs = await Promise.all(
        snapshot.docs.map(async (d) => {
          const data = d.data();
          let senderName = "Unknown";
          let senderPhoto = "";
          if (data.userId) {
            const uSnap = await getDoc(doc(db, "users", data.userId));
            if (uSnap.exists()) {
              const u = uSnap.data();
              senderName = u.displayName || u.fullName || u.email || "Unknown";
              senderPhoto = u.photoURL || "";
            }
          }
          return {
            id: d.id,
            text: data.text,
            createdAt: data.createdAt?.toDate(),
            senderName,
            senderPhoto,
            userId: data.userId,
          };
        })
      );
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsub();
  }, [planId]);

  // Send new message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "planChats", planId, "messages"), {
      text: newMessage,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold">💬 Chat — {planTitle}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          ⬅ Back
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${
                msg.userId === user.uid ? "justify-end" : "justify-start"
              }`}
            >
              {msg.senderPhoto && (
                <img
                  src={msg.senderPhoto}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div
                className={`px-3 py-2 rounded-lg max-w-xs ${
                  msg.userId === user.uid
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {msg.senderName} •{" "}
                  {msg.createdAt?.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic flex items-center gap-2">
            💬 No messages yet. Start the conversation!
          </p>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 sticky bottom-0 bg-white dark:bg-gray-900"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}
